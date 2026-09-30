import "server-only";

import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { DatabaseSync, type SQLOutputValue } from "node:sqlite";
import type { Member, Priority, Project, Status, Task, Workspace } from "./types";

const COOKIE = "mada_session";
const DAY = 86_400_000;
const BODY_LIMIT = 16_384;
const SCRYPT = { N: 32_768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const DUMMY_HASH = `scrypt-v1:${"00".repeat(16)}:${"00".repeat(64)}`;

type Row = Record<string, SQLOutputValue>;
type Resource = "workspace" | "session" | "projects" | "tasks" | "team";
type Store = { db: DatabaseSync; path: string; lastCleanup: number; activeHashes: number };
type Auth = { userId: string; workspaceId: string; tokenHash: string; isGuest: boolean };
type Input = Record<string, unknown>;

const globals = globalThis as typeof globalThis & { madaStore?: Store };

class ApiError extends Error {
  constructor(public status: number, message: string, public retryAt?: number) {
    super(message);
  }
}

function database(): Store {
  // Runtime workspace data must not be traced into the deployment bundle.
  const directory = resolve(/* turbopackIgnore: true */ process.env.MADA_DATA_DIR || join(process.cwd(), ".mada"));
  const path = join(directory, "data.sqlite");
  if (globals.madaStore) {
    if (globals.madaStore.path !== path) throw new Error("MADA_DATA_DIR changed while running");
    return globals.madaStore;
  }
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path, { timeout: 5_000, enableForeignKeyConstraints: true });
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = FULL;
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_guest INTEGER NOT NULL CHECK (is_guest IN (0, 1)),
      expires_at INTEGER,
      created_at TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT
    ) STRICT;
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    ) STRICT;
    CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id, created_at);
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      color TEXT NOT NULL,
      due_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE (workspace_id, id)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      UNIQUE (workspace_id, email),
      UNIQUE (workspace_id, id)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('todo', 'doing', 'done')),
      priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
      assignee_id TEXT,
      due_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
      FOREIGN KEY (workspace_id, assignee_id) REFERENCES members(workspace_id, id)
    ) STRICT;
    CREATE INDEX IF NOT EXISTS tasks_workspace ON tasks(workspace_id, created_at);
    CREATE INDEX IF NOT EXISTS tasks_project ON tasks(workspace_id, project_id);
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    ) STRICT;
    CREATE INDEX IF NOT EXISTS rate_expiry ON rate_limits(expires_at);
  `);
  const store = { db, path, lastCleanup: 0, activeHashes: 0 };
  globals.madaStore = store;
  return store;
}

function transaction<T>(db: DatabaseSync, operation: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = operation();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function cleanup(store: Store) {
  const now = Date.now();
  if (now - store.lastCleanup < 60_000) return;
  transaction(store.db, () => {
    store.db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
    store.db.prepare("DELETE FROM rate_limits WHERE expires_at <= ?").run(now);
    store.db.prepare("DELETE FROM workspaces WHERE is_guest = 1 AND expires_at <= ?").run(now);
  });
  store.lastCleanup = now;
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

// Persistent global/account limits do not trust client-controlled IP forwarding headers.
function rateLimit(db: DatabaseSync, key: string, limit: number, interval: number) {
  const now = Date.now();
  const row = db.prepare(`
    INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN expires_at <= ? THEN 1 ELSE count + 1 END,
      expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END
    RETURNING count, expires_at
  `).get(hash(key), now + interval, now, now);
  if (!row) throw new Error("Missing rate limit result");
  if (Number(row.count) > limit) {
    throw new ApiError(429, "طلبات كثيرة. يرجى الانتظار قليلا ثم المحاولة مجددا.", Number(row.expires_at));
  }
}

function text(row: Row, key: string): string {
  if (typeof row[key] !== "string") throw new Error("Invalid stored field");
  return row[key];
}

function projectRow(row: Row): Project {
  return {
    id: text(row, "id"), name: text(row, "name"), description: text(row, "description"),
    color: text(row, "color"), dueDate: text(row, "due_date"), createdAt: text(row, "created_at"),
  };
}

function taskRow(row: Row): Task {
  const status = text(row, "status");
  const priority = text(row, "priority");
  if (status !== "todo" && status !== "doing" && status !== "done") throw new Error("Invalid stored status");
  if (priority !== "low" && priority !== "medium" && priority !== "high") throw new Error("Invalid stored priority");
  return {
    id: text(row, "id"), projectId: text(row, "project_id"), title: text(row, "title"), status, priority,
    assigneeId: row.assignee_id === null ? null : text(row, "assignee_id"),
    dueDate: text(row, "due_date"), createdAt: text(row, "created_at"),
  };
}

function memberRow(row: Row): Member {
  return { id: text(row, "id"), name: text(row, "name"), email: text(row, "email"), role: text(row, "role") };
}

function workspace(db: DatabaseSync, auth: Auth): Workspace {
  const row = db.prepare(`
    SELECT w.name, w.is_guest, u.name AS user_name, u.email
    FROM workspaces w JOIN users u ON u.workspace_id = w.id
    WHERE w.id = ? AND u.id = ?
  `).get(auth.workspaceId, auth.userId);
  if (!row) throw new ApiError(401, "يرجى تسجيل الدخول للمتابعة.");
  return {
    name: text(row, "name"),
    user: { name: text(row, "user_name"), email: row.email === null ? "" : text(row, "email"), isGuest: row.is_guest === 1 },
    projects: db.prepare("SELECT id, name, description, color, due_date, created_at FROM projects WHERE workspace_id = ? ORDER BY created_at, id").all(auth.workspaceId).map(projectRow),
    tasks: db.prepare("SELECT id, project_id, title, status, priority, assignee_id, due_date, created_at FROM tasks WHERE workspace_id = ? ORDER BY created_at, id").all(auth.workspaceId).map(taskRow),
    members: db.prepare("SELECT id, name, email, role FROM members WHERE workspace_id = ? ORDER BY rowid").all(auth.workspaceId).map(memberRow),
  };
}

function tokenHash(request: Request): string | null {
  const matches = (request.headers.get("cookie") || "").split(";")
    .map((part) => part.trim()).filter((part) => part.startsWith(`${COOKIE}=`));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(COOKIE.length + 1);
  return /^[a-f0-9]{64}$/.test(token) ? hash(token) : null;
}

function authenticate(db: DatabaseSync, request: Request): Auth {
  const digest = tokenHash(request);
  if (!digest) throw new ApiError(401, "يرجى تسجيل الدخول للمتابعة.");
  const now = Date.now();
  const row = db.prepare(`
    SELECT u.id, u.workspace_id, w.is_guest FROM sessions s
    JOIN users u ON u.id = s.user_id JOIN workspaces w ON w.id = u.workspace_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND (w.expires_at IS NULL OR w.expires_at > ?)
  `).get(digest, now, now);
  if (!row) throw new ApiError(401, "انتهت الجلسة. يرجى تسجيل الدخول مجددا.");
  return { userId: text(row, "id"), workspaceId: text(row, "workspace_id"), tokenHash: digest, isGuest: row.is_guest === 1 };
}

function requestOrigin(request: Request): URL {
  const configured = process.env.MADA_PUBLIC_ORIGIN;
  if (configured !== undefined) {
    const url = new URL(configured);
    if (!/^https?:\/\/[^/?#\\\s@]+\/?$/.test(configured) || url.username || url.password) {
      throw new Error("Invalid MADA_PUBLIC_ORIGIN");
    }
    return url;
  }
  const url = new URL(request.url);
  // Next dev can use its bind hostname rather than the browser's loopback alias.
  if (process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    const host = request.headers.get("host");
    if (host !== null) {
      const match = /^(localhost|127\.0\.0\.1|\[::1\])(?::(\d{1,5}))?$/i.exec(host);
      if (!match || (match[2] !== undefined && Number(match[2]) > 65535)) {
        throw new ApiError(403, "هذا الطلب غير مسموح من مصدر خارجي.");
      }
      const actual = new URL(`${url.protocol}//${host}`);
      if (actual.port !== url.port) throw new ApiError(403, "هذا الطلب غير مسموح من مصدر خارجي.");
      return actual;
    }
  }
  return url;
}

function requireSameOrigin(request: Request, expected: string) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new ApiError(403, "هذا الطلب غير مسموح من مصدر خارجي.");
  }
  let valid = false;
  try {
    valid = origin !== null ? origin === expected : referer !== null && new URL(referer).origin === expected;
  } catch { /* Invalid origins are rejected, never used as a fallback. */ }
  if (!valid) throw new ApiError(403, "تعذر التحقق من مصدر الطلب. أعد تحميل الصفحة.");
}

async function body(request: Request): Promise<Input> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ApiError(415, "يجب إرسال البيانات بصيغة JSON.");
  }
  if (Number(request.headers.get("content-length")) > BODY_LIMIT) throw new ApiError(413, "حجم الطلب أكبر من المسموح.");
  if (!request.body) throw new ApiError(400, "بيانات الطلب غير صالحة.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > BODY_LIMIT) {
        void reader.cancel().catch(() => {});
        throw new ApiError(413, "حجم الطلب أكبر من المسموح.");
      }
      chunks.push(value);
    }
    const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid object");
    return parsed as Input;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "بيانات JSON غير صالحة.");
  } finally {
    reader.releaseLock();
  }
}

function fields(input: Input, allowed: string[]) {
  if (Object.keys(input).some((key) => !allowed.includes(key))) throw new ApiError(400, "يحتوي الطلب على حقول غير مسموحة.");
}

function stringValue(value: unknown, label: string, max: number, min = 1, multiline = false): string {
  if (typeof value !== "string") throw new ApiError(400, `${label} غير صالح.`);
  const trimmed = value.trim();
  const controls = multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/;
  if (trimmed.length < min || trimmed.length > max || value.length > max + 100 || controls.test(trimmed)) {
    throw new ApiError(400, `${label} يجب أن يكون بين ${min} و${max} حرفا.`);
  }
  return trimmed;
}

function emailValue(value: unknown): string {
  const email = stringValue(value, "البريد الإلكتروني", 254).toLowerCase();
  const parts = email.split("@");
  const local = parts[0];
  const domain = parts[1];
  if (parts.length !== 2 || !local || local.length > 64 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)
      || local.startsWith(".") || local.endsWith(".") || local.includes("..") || !domain || !domain.includes(".")
      || domain.split(".").some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
    throw new ApiError(400, "أدخل بريدا إلكترونيا صالحا.");
  }
  return email;
}

function passwordValue(value: unknown): string {
  if (typeof value !== "string" || value.length < 10 || value.length > 128 || Buffer.byteLength(value, "utf8") > 512) {
    throw new ApiError(400, "كلمة المرور يجب أن تكون بين 10 و128 حرفا.");
  }
  return value;
}

function idValue(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value)) {
    throw new ApiError(400, "المعرف غير صالح.");
  }
  return value;
}

function dateValue(value: unknown): string {
  if (value === "") return "";
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "9999-12-31") {
    throw new ApiError(400, "التاريخ غير صالح. استخدم YYYY-MM-DD.");
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new ApiError(400, "التاريخ غير صالح.");
  return value;
}

function colorValue(value: unknown): string {
  if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) throw new ApiError(400, "لون المشروع غير صالح.");
  return value.toLowerCase();
}

function statusValue(value: unknown): Status {
  if (value !== "todo" && value !== "doing" && value !== "done") throw new ApiError(400, "حالة المهمة غير صالحة.");
  return value;
}

function priorityValue(value: unknown): Priority {
  if (value !== "low" && value !== "medium" && value !== "high") throw new ApiError(400, "أولوية المهمة غير صالحة.");
  return value;
}

function assigneeValue(db: DatabaseSync, workspaceId: string, value: unknown): string | null {
  if (value === null) return null;
  const id = idValue(value);
  if (!db.prepare("SELECT id FROM members WHERE workspace_id = ? AND id = ?").get(workspaceId, id)) {
    throw new ApiError(400, "عضو الفريق غير موجود في مساحة العمل.");
  }
  return id;
}

async function derivePassword(store: Store, password: string, salt: string): Promise<Buffer> {
  if (store.activeHashes >= 4) throw new ApiError(429, "الخدمة مشغولة. حاول مجددا بعد قليل.", Date.now() + 1000);
  store.activeHashes++;
  try {
    return await new Promise<Buffer>((resolveKey, reject) => {
      scrypt(password, Buffer.from(salt, "hex"), 64, SCRYPT, (error, key) => error ? reject(error) : resolveKey(key));
    });
  } finally {
    store.activeHashes--;
  }
}

async function hashPassword(store: Store, password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await derivePassword(store, password, salt);
  return `scrypt-v1:${salt}:${key.toString("hex")}`;
}

async function verifyPassword(store: Store, password: string, stored: string) {
  const match = /^scrypt-v1:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(stored);
  if (!match) throw new Error("Invalid stored password format");
  const actual = await derivePassword(store, password, match[1]);
  return timingSafeEqual(actual, Buffer.from(match[2], "hex"));
}

function sessionCookie(request: Request, token: string, expiresAt: number) {
  const secure = requestOrigin(request).protocol === "https:" ? "; Secure" : "";
  const maxAge = token ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0;
  return `${COOKIE}=${token}; Path=/mada; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Expires=${new Date(expiresAt).toUTCString()}${secure}`;
}

function revokeSession(db: DatabaseSync, request: Request) {
  const digest = tokenHash(request);
  if (!digest) return;
  const row = db.prepare(`
    SELECT w.id, w.is_guest FROM sessions s JOIN users u ON u.id = s.user_id
    JOIN workspaces w ON w.id = u.workspace_id WHERE s.token_hash = ?
  `).get(digest);
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(digest);
  if (row?.is_guest === 1) db.prepare("DELETE FROM workspaces WHERE id = ? AND is_guest = 1").run(text(row, "id"));
}

function createSession(db: DatabaseSync, request: Request, userId: string, workspaceId: string, isGuest: boolean) {
  revokeSession(db, request);
  const token = randomBytes(32).toString("hex");
  const digest = hash(token);
  const now = Date.now();
  const expiresAt = now + (isGuest ? DAY : 7 * DAY);
  db.prepare(`
    DELETE FROM sessions WHERE user_id = ? AND token_hash NOT IN
    (SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY created_at DESC, token_hash LIMIT 9)
  `).run(userId, userId);
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(digest, userId, expiresAt, now);
  return { auth: { userId, workspaceId, tokenHash: digest, isGuest }, cookie: sessionCookie(request, token, expiresAt) };
}

function seedGuest(db: DatabaseSync, workspaceId: string, ownerId: string) {
  const memberId = randomUUID();
  db.prepare("INSERT INTO members (id, workspace_id, name, email, role) VALUES (?, ?, ?, ?, ?)")
    .run(memberId, workspaceId, "ليان أحمد (تجريبي)", "layan@example.com", "مصممة - بيانات تجريبية");
  const projects = [
    { name: "إطلاق الهوية الجديدة (تجريبي)", description: "مشروع نموذجي لاستكشاف مدى. هذه بيانات تجريبية قابلة للتعديل.", color: "#c8ff6a" },
    { name: "تجربة الموقع (تجريبي)", description: "مساحة لتجربة تنظيم المهام. لا توجد رسائل أو دعوات حقيقية.", color: "#a998eb" },
  ];
  const now = new Date().toISOString();
  const dueDate = new Date(Date.now() + 14 * DAY).toISOString().slice(0, 10);
  projects.forEach((project, index) => {
    const projectId = randomUUID();
    db.prepare("INSERT INTO projects (id, workspace_id, name, description, color, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(projectId, workspaceId, project.name, project.description, project.color, dueDate, now);
    const titles = index === 0 ? ["تحديد اتجاه الهوية", "تطوير العناصر البصرية", "مراجعة دليل الاستخدام"] : ["رسم رحلة المستخدم", "بناء نموذج الصفحة", "اختبار التجربة"];
    titles.forEach((title, taskIndex) => {
      db.prepare("INSERT INTO tasks (id, workspace_id, project_id, title, status, priority, assignee_id, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(randomUUID(), workspaceId, projectId, `${title} (تجريبي)`, ["done", "doing", "todo"][taskIndex], ["medium", "high", "low"][taskIndex], taskIndex === 1 ? memberId : ownerId, dueDate, now);
    });
  });
}

async function startSession(store: Store, request: Request, input: Input): Promise<Response> {
  const db = store.db;
  const action = input.action;
  if (action === "login") {
    fields(input, ["action", "email", "password"]);
    const email = emailValue(input.email);
    const password = passwordValue(input.password);
    rateLimit(db, `auth:email:${email}`, 8, 15 * 60_000);
    const row = db.prepare("SELECT id, workspace_id, password_hash FROM users WHERE email = ?").get(email);
    const valid = await verifyPassword(store, password, row ? text(row, "password_hash") : DUMMY_HASH);
    if (!row || !valid) throw new ApiError(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    return transaction(db, () => {
      const session = createSession(db, request, text(row, "id"), text(row, "workspace_id"), false);
      return json(workspace(db, session.auth), 200, session.cookie);
    });
  }
  if (action !== "guest" && action !== "register") throw new ApiError(400, "إجراء الجلسة غير صالح.");
  const isGuest = action === "guest";
  fields(input, isGuest ? ["action"] : ["action", "name", "email", "password", "workspaceName"]);
  const name = isGuest ? "زائر مدى" : stringValue(input.name, "الاسم", 100);
  const email = isGuest ? null : emailValue(input.email);
  const workspaceName = isGuest ? "مساحة مدى التجريبية" : stringValue(input.workspaceName, "اسم مساحة العمل", 100);
  const password = isGuest ? null : passwordValue(input.password);
  rateLimit(db, isGuest ? "guest:global" : "register:global", isGuest ? 30 : 20, 60 * 60_000);
  if (email) rateLimit(db, `auth:email:${email}`, 8, 15 * 60_000);
  const passwordHash = password ? await hashPassword(store, password) : null;
  return transaction(db, () => {
    if (email && db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
      throw new ApiError(409, "تعذر إنشاء الحساب بهذا البريد الإلكتروني. جرب تسجيل الدخول.");
    }
    const count = db.prepare("SELECT count(*) AS count FROM workspaces WHERE is_guest = ?").get(isGuest ? 1 : 0);
    if (!count || Number(count.count) >= (isGuest ? 200 : 1000)) throw new ApiError(429, "بلغ الخادم الحد المحلي لمساحات العمل.");
    const workspaceId = randomUUID();
    const userId = randomUUID();
    const ownerId = randomUUID();
    db.prepare("INSERT INTO workspaces (id, name, is_guest, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(workspaceId, workspaceName, isGuest ? 1 : 0, isGuest ? Date.now() + DAY : null, new Date().toISOString());
    db.prepare("INSERT INTO users (id, workspace_id, name, email, password_hash) VALUES (?, ?, ?, ?, ?)")
      .run(userId, workspaceId, name, email, passwordHash);
    db.prepare("INSERT INTO members (id, workspace_id, name, email, role) VALUES (?, ?, ?, ?, ?)")
      .run(ownerId, workspaceId, name, email || "guest@example.com", isGuest ? "مالك المساحة التجريبية" : "مالك المساحة");
    if (isGuest) seedGuest(db, workspaceId, ownerId);
    const session = createSession(db, request, userId, workspaceId, isGuest);
    return json(workspace(db, session.auth), 200, session.cookie);
  });
}

function mutateProjects(db: DatabaseSync, auth: Auth, method: string, input: Input) {
  const workspaceId = auth.workspaceId;
  const allowed = ["name", "description", "color", "dueDate"];
  fields(input, method === "DELETE" ? ["id"] : method === "POST" ? allowed : ["id", ...allowed]);
  if (method === "POST") {
    const name = stringValue(input.name, "اسم المشروع", 100);
    const description = stringValue(input.description, "وصف المشروع", 1000, 0, true);
    const color = colorValue(input.color);
    const dueDate = dateValue(input.dueDate);
    const count = db.prepare("SELECT count(*) AS count FROM projects WHERE workspace_id = ?").get(workspaceId);
    if (!count || Number(count.count) >= 100) throw new ApiError(409, "الحد الأقصى 100 مشروع لكل مساحة عمل.");
    db.prepare("INSERT INTO projects (id, workspace_id, name, description, color, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(randomUUID(), workspaceId, name, description, color, dueDate, new Date().toISOString());
    return;
  }
  const id = idValue(input.id);
  const row = db.prepare("SELECT id, name, description, color, due_date, created_at FROM projects WHERE workspace_id = ? AND id = ?").get(workspaceId, id);
  if (!row) throw new ApiError(404, "المشروع غير موجود في مساحة العمل.");
  if (method === "DELETE") {
    db.prepare("DELETE FROM projects WHERE workspace_id = ? AND id = ?").run(workspaceId, id);
    return;
  }
  if (!allowed.some((key) => Object.hasOwn(input, key))) throw new ApiError(400, "حدد حقلا واحدا على الأقل للتعديل.");
  const project = projectRow(row);
  db.prepare("UPDATE projects SET name = ?, description = ?, color = ?, due_date = ? WHERE workspace_id = ? AND id = ?")
    .run(
      Object.hasOwn(input, "name") ? stringValue(input.name, "اسم المشروع", 100) : project.name,
      Object.hasOwn(input, "description") ? stringValue(input.description, "وصف المشروع", 1000, 0, true) : project.description,
      Object.hasOwn(input, "color") ? colorValue(input.color) : project.color,
      Object.hasOwn(input, "dueDate") ? dateValue(input.dueDate) : project.dueDate,
      workspaceId, id,
    );
}

function mutateTasks(db: DatabaseSync, auth: Auth, method: string, input: Input) {
  const workspaceId = auth.workspaceId;
  const allowed = ["title", "status", "priority", "assigneeId", "dueDate"];
  fields(input, method === "DELETE" ? ["id"] : method === "POST" ? ["projectId", ...allowed] : ["id", ...allowed]);
  if (method === "POST") {
    const projectId = idValue(input.projectId);
    if (!db.prepare("SELECT id FROM projects WHERE workspace_id = ? AND id = ?").get(workspaceId, projectId)) throw new ApiError(404, "المشروع غير موجود في مساحة العمل.");
    const title = stringValue(input.title, "عنوان المهمة", 200);
    const status = statusValue(input.status);
    const priority = priorityValue(input.priority);
    const assignee = assigneeValue(db, workspaceId, input.assigneeId);
    const dueDate = dateValue(input.dueDate);
    const count = db.prepare("SELECT count(*) AS count FROM tasks WHERE workspace_id = ?").get(workspaceId);
    if (!count || Number(count.count) >= 2000) throw new ApiError(409, "الحد الأقصى 2000 مهمة لكل مساحة عمل.");
    db.prepare("INSERT INTO tasks (id, workspace_id, project_id, title, status, priority, assignee_id, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(randomUUID(), workspaceId, projectId, title, status, priority, assignee, dueDate, new Date().toISOString());
    return;
  }
  const id = idValue(input.id);
  const row = db.prepare("SELECT id, project_id, title, status, priority, assignee_id, due_date, created_at FROM tasks WHERE workspace_id = ? AND id = ?").get(workspaceId, id);
  if (!row) throw new ApiError(404, "المهمة غير موجودة في مساحة العمل.");
  if (method === "DELETE") {
    db.prepare("DELETE FROM tasks WHERE workspace_id = ? AND id = ?").run(workspaceId, id);
    return;
  }
  if (!allowed.some((key) => Object.hasOwn(input, key))) throw new ApiError(400, "حدد حقلا واحدا على الأقل للتعديل.");
  const task = taskRow(row);
  db.prepare("UPDATE tasks SET title = ?, status = ?, priority = ?, assignee_id = ?, due_date = ? WHERE workspace_id = ? AND id = ?")
    .run(
      Object.hasOwn(input, "title") ? stringValue(input.title, "عنوان المهمة", 200) : task.title,
      Object.hasOwn(input, "status") ? statusValue(input.status) : task.status,
      Object.hasOwn(input, "priority") ? priorityValue(input.priority) : task.priority,
      Object.hasOwn(input, "assigneeId") ? assigneeValue(db, workspaceId, input.assigneeId) : task.assigneeId,
      Object.hasOwn(input, "dueDate") ? dateValue(input.dueDate) : task.dueDate,
      workspaceId, id,
    );
}

function addMember(db: DatabaseSync, auth: Auth, input: Input) {
  fields(input, ["name", "email", "role"]);
  const name = stringValue(input.name, "اسم العضو", 100);
  const email = emailValue(input.email);
  const role = stringValue(input.role, "وصف الدور", 60);
  const count = db.prepare("SELECT count(*) AS count FROM members WHERE workspace_id = ?").get(auth.workspaceId);
  if (!count || Number(count.count) >= 100) throw new ApiError(409, "الحد الأقصى 100 عضو في دليل الفريق.");
  if (db.prepare("SELECT id FROM members WHERE workspace_id = ? AND email = ?").get(auth.workspaceId, email)) throw new ApiError(409, "هذا البريد موجود بالفعل في دليل الفريق.");
  // A directory record is not an account, invitation, or permission grant.
  db.prepare("INSERT INTO members (id, workspace_id, name, email, role) VALUES (?, ?, ?, ?, ?)")
    .run(randomUUID(), auth.workspaceId, name, email, role);
}

function json(data: Workspace | { error: string } | { ok: true }, status = 200, cookie?: string, retryAt?: number): Response {
  const headers = new Headers({
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Cookie, Origin",
  });
  if (cookie) headers.set("Set-Cookie", cookie);
  if (retryAt !== undefined) headers.set("Retry-After", String(Math.max(1, Math.ceil((retryAt - Date.now()) / 1000))));
  return Response.json(data, { status, headers });
}

export async function handleMadaRequest(request: Request, resource: Resource): Promise<Response> {
  try {
    const method = request.method;
    const methods: Record<Resource, string[]> = {
      workspace: ["GET"], session: ["POST", "DELETE"], projects: ["POST", "PATCH", "DELETE"],
      tasks: ["POST", "PATCH", "DELETE"], team: ["POST"],
    };
    if (!methods[resource].includes(method)) throw new ApiError(405, "طريقة الطلب غير مسموحة.");
    const origin = requestOrigin(request);
    if (method !== "GET") requireSameOrigin(request, origin.origin);
    const store = database();
    cleanup(store);
    const db = store.db;
    if (resource === "session" && method === "DELETE") {
      transaction(db, () => revokeSession(db, request));
      return json({ ok: true }, 200, sessionCookie(request, "", 0));
    }
    if (resource === "session") return await startSession(store, request, await body(request));
    const auth = authenticate(db, request);
    if (resource === "workspace") {
      rateLimit(db, `read:${auth.tokenHash}`, 300, 60_000);
      return transaction(db, () => json(workspace(db, auth)));
    }
    rateLimit(db, `write:${auth.workspaceId}`, 120, 60_000);
    const input = await body(request);
    return transaction(db, () => {
      // Recheck after the asynchronous body read in case another request logged out.
      authenticate(db, request);
      if (resource === "projects") mutateProjects(db, auth, method, input);
      if (resource === "tasks") mutateTasks(db, auth, method, input);
      if (resource === "team") addMember(db, auth, input);
      return json(workspace(db, auth));
    });
  } catch (error) {
    if (error instanceof ApiError) return json({ error: error.message }, error.status, undefined, error.retryAt);
    // Do not expose SQL errors, credential material, request bodies, or filesystem paths.
    console.error("Mada API operation failed", { resource });
    return json({ error: "تعذر إتمام الطلب. حاول مرة أخرى لاحقا." }, 500);
  }
}

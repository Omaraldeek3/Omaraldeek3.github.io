import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { registerHooks } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { NextRequestAdapter } from "next/dist/server/web/spec-extension/adapters/next-request.js";
import { addRequestMeta } from "next/dist/server/request-meta.js";

// Only the Next compile-time boundary is substituted; production code executes unchanged.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") return { url: "data:text/javascript,export {}", shortCircuit: true };
    return nextResolve(specifier, context);
  },
});

const serverURL = new URL("../src/mada/server.ts", import.meta.url).href;
const { handleMadaRequest } = await import(serverURL);
const origin = "https://mada.test";
const password = "LocalTestPassword!24";
const project = { name: "Local project", description: "A project", color: "#ABCDEF", dueDate: "2028-02-29" };
const registration = { action: "register", name: "Owner", email: "owner@example.com", password, workspaceName: "Owner workspace" };

function isolatedStorage(t) {
  assert.equal(globalThis.madaStore, undefined);
  const previous = Object.fromEntries(["MADA_DATA_DIR", "MADA_PUBLIC_ORIGIN", "NODE_ENV"].map((key) => [key, process.env[key]]));
  const directory = mkdtempSync(join(tmpdir(), "mada-backend-"));
  process.env.MADA_DATA_DIR = directory;
  process.env.NODE_ENV = "test";
  delete process.env.MADA_PUBLIC_ORIGIN;
  t.after(() => {
    globalThis.madaStore?.db.close();
    delete globalThis.madaStore;
    rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

async function call(resource, method, input, cookie, extra = {}) {
  const headers = { "content-type": "application/json", ...(method !== "GET" ? { origin } : {}), ...(cookie ? { cookie } : {}), ...extra.headers };
  if (extra.omitOrigin) delete headers.origin;
  const response = await handleMadaRequest(new Request(`${extra.origin || origin}/mada/api/${resource}`, {
    method, headers,
    ...(method !== "GET" && input !== undefined ? { body: extra.raw ? input : JSON.stringify(input) } : {}),
  }), resource);
  const data = await response.json();
  assert.match(response.headers.get("cache-control"), /no-store/);
  if (response.status >= 400) {
    assert.deepEqual(Object.keys(data), ["error"]);
    assert.match(data.error, /[\u0600-\u06ff]/);
  }
  return { response, data, status: response.status, cookie: response.headers.get("set-cookie")?.split(";")[0] };
}

test("Mada persistent backend security and API contract", async (t) => {
  isolatedStorage(t);
  let owner;
  let guest;
  let secondGuest;
  let ownerProject;
  let ownerTask;
  let ownerMember;
  let db;

  await t.test("unauthenticated reads and malformed session requests", async () => {
    assert.equal((await call("workspace", "GET")).status, 401);
    assert.equal((await call("session", "POST", "{", null, { raw: true })).status, 400);
    assert.equal((await call("session", "POST", [])).status, 400);
    assert.equal((await call("session", "POST", null)).status, 400);
    assert.equal((await call("session", "POST", { action: "unknown" })).status, 400);
    assert.equal((await call("session", "POST", { action: "guest" }, null, { headers: { "content-type": "text/plain" } })).status, 415);
    assert.equal((await call("session", "POST", "a".repeat(17000), null, { raw: true })).status, 413);
  });

  await t.test("same-origin enforced before session creation, no forwarded-origin trust", async () => {
    for (const maliciousOrigin of ["https://evil.test", "null", "https://mada.test.evil.test", "https://mada.test/"]) {
      assert.equal((await call("session", "POST", { action: "guest" }, null, { headers: { origin: maliciousOrigin } })).status, 403);
    }
    assert.equal((await call("session", "POST", { action: "guest" }, null, { omitOrigin: true })).status, 403);
    assert.equal((await call("session", "POST", { action: "guest" }, null, { headers: { "sec-fetch-site": "cross-site" } })).status, 403);
    assert.equal((await call("session", "POST", { action: "guest" }, null, { headers: { origin: "https://evil.test", "x-forwarded-host": "evil.test" } })).status, 403);
  });

  await t.test("register empty workspace with HTTPS cookie and hashed credentials", async () => {
    owner = await call("session", "POST", { ...registration, email: "Owner@EXAMPLE.com" });
    assert.equal(owner.status, 200);
    assert.deepEqual(owner.data.user, { name: "Owner", email: "owner@example.com", isGuest: false });
    assert.deepEqual(owner.data.projects, []);
    assert.deepEqual(owner.data.tasks, []);
    assert.equal(owner.data.members.length, 1);
    const cookie = owner.response.headers.get("set-cookie");
    for (const flag of ["HttpOnly", "SameSite=Lax", "Path=/mada", "Secure", "Expires="]) assert.ok(cookie.includes(flag));
    assert.doesNotMatch(JSON.stringify(owner.data), /password|token|scrypt/);
    db = globalThis.madaStore.db;
    const user = db.prepare("SELECT password_hash FROM users WHERE email = ?").get("owner@example.com");
    assert.match(user.password_hash, /^scrypt-v1:[a-f0-9]{32}:[a-f0-9]{128}$/);
    assert.ok(!user.password_hash.includes(password));
    const token = owner.cookie.split("=")[1];
    const digest = createHash("sha256").update(token).digest("hex");
    assert.ok(db.prepare("SELECT token_hash FROM sessions WHERE token_hash = ?").get(digest));
    assert.equal(db.prepare("SELECT token_hash FROM sessions WHERE token_hash = ?").get(token), undefined);
  });

  await t.test("isolated seeded guests; HTTP cookie usable and spoofed HTTPS ignored", async () => {
    guest = await call("session", "POST", { action: "guest" });
    secondGuest = await call("session", "POST", { action: "guest" }, null, { origin: "http://mada.test", headers: { origin: "http://mada.test", "x-forwarded-proto": "https" } });
    assert.equal(guest.status, 200);
    assert.equal(secondGuest.status, 200);
    assert.equal(guest.data.user.isGuest, true);
    assert.equal(guest.data.projects.length, 2);
    assert.equal(guest.data.tasks.length, 6);
    assert.ok(guest.data.projects.every((p) => p.name.includes("\u062a\u062c\u0631\u064a\u0628\u064a")));
    assert.notEqual(guest.data.projects[0].id, secondGuest.data.projects[0].id);
    assert.doesNotMatch(secondGuest.response.headers.get("set-cookie"), /; Secure/);
    assert.deepEqual((await call("workspace", "GET", undefined, owner.cookie)).data.projects, []);
  });

  await t.test("projects, tasks, directory CRUD and explicit fields", async () => {
    const created = await call("projects", "POST", project, owner.cookie);
    assert.equal(created.status, 200);
    ownerProject = created.data.projects[0];
    assert.deepEqual(Object.keys(ownerProject).sort(), ["id", "name", "description", "color", "dueDate", "createdAt"].sort());
    assert.equal(ownerProject.color, "#abcdef");
    assert.ok(Number.isFinite(Date.parse(ownerProject.createdAt)));
    const changed = await call("projects", "PATCH", { id: ownerProject.id, name: "Changed", dueDate: "" }, owner.cookie);
    assert.equal(changed.status, 200);
    assert.equal(changed.data.projects[0].description, project.description);
    const member = await call("team", "POST", { name: "Directory only", email: "member@example.com", role: "Designer" }, owner.cookie);
    assert.equal(member.status, 200);
    ownerMember = member.data.members[1];
    assert.equal(db.prepare("SELECT id FROM users WHERE email = ?").get("member@example.com"), undefined);
    assert.equal((await call("team", "POST", { name: "Dup", email: "MEMBER@example.com", role: "Owner" }, owner.cookie)).status, 409);
    const task = await call("tasks", "POST", { projectId: ownerProject.id, title: "Task", status: "todo", priority: "high", assigneeId: ownerMember.id, dueDate: "" }, owner.cookie);
    assert.equal(task.status, 200);
    ownerTask = task.data.tasks[0];
    assert.deepEqual(Object.keys(ownerTask).sort(), ["id", "projectId", "title", "status", "priority", "assigneeId", "dueDate", "createdAt"].sort());
    const moved = await call("tasks", "PATCH", { id: ownerTask.id, status: "doing", assigneeId: null }, owner.cookie);
    assert.equal(moved.status, 200);
    assert.equal(moved.data.tasks[0].status, "doing");
    assert.equal(moved.data.tasks[0].assigneeId, null);
    assert.equal(moved.data.tasks[0].title, "Task");
  });

  await t.test("workspace isolation across every foreign identifier and mutation", async () => {
    for (const method of ["PATCH", "DELETE"]) {
      assert.equal((await call("projects", method, { id: ownerProject.id, ...(method === "PATCH" ? { name: "attack" } : {}) }, guest.cookie)).status, 404);
      assert.equal((await call("tasks", method, { id: ownerTask.id, ...(method === "PATCH" ? { title: "attack" } : {}) }, guest.cookie)).status, 404);
    }
    assert.equal((await call("tasks", "POST", { projectId: ownerProject.id, title: "attack", status: "todo", priority: "low", assigneeId: null, dueDate: "" }, guest.cookie)).status, 404);
    assert.equal((await call("tasks", "PATCH", { id: ownerTask.id, assigneeId: guest.data.members[0].id }, owner.cookie)).status, 400);
    assert.equal((await call("tasks", "POST", { projectId: guest.data.projects[0].id, title: "attack", status: "todo", priority: "low", assigneeId: ownerMember.id, dueDate: "" }, guest.cookie)).status, 400);
    assert.throws(() => db.prepare("UPDATE tasks SET assignee_id = ? WHERE id = ?").run(guest.data.members[0].id, ownerTask.id), /FOREIGN KEY/);
    assert.equal((await call("workspace", "GET", undefined, guest.cookie)).data.tasks.length, 6);
  });

  await t.test("input enums, dates, lengths, JSON keys and injection are validated", async () => {
    for (const dueDate of ["2026-02-29", "2026-04-31", "2026-13-01", "yesterday", null, 42]) {
      assert.equal((await call("projects", "POST", { ...project, dueDate }, owner.cookie)).status, 400);
    }
    for (const patch of [{ name: " " }, { name: "a".repeat(101) }, { color: "red" }, { description: "a".repeat(1001) }, { color: "#fff" }]) {
      assert.equal((await call("projects", "PATCH", { id: ownerProject.id, ...patch }, owner.cookie)).status, 400);
    }
    for (const patch of [{ status: "archived" }, { priority: "urgent" }, { title: "" }, { assigneeId: "unknown" }, { projectId: guest.data.projects[0].id }]) {
      assert.equal((await call("tasks", "PATCH", { id: ownerTask.id, ...patch }, owner.cookie)).status, 400);
    }
    assert.equal((await call("projects", "PATCH", { id: ownerProject.id }, owner.cookie)).status, 400);
    assert.equal((await call("tasks", "DELETE", { id: "' OR 1=1 --" }, owner.cookie)).status, 400);
    assert.equal((await call("team", "POST", { name: "A", email: "not-an-email", role: "Designer" }, owner.cookie)).status, 400);
    assert.equal((await call("team", "POST", { name: "A", email: "a@example.com", role: "a".repeat(61) }, owner.cookie)).status, 400);
    const injectedName = "Robert'); DROP TABLE users;--";
    const literal = await call("projects", "PATCH", { id: ownerProject.id, name: injectedName }, owner.cookie);
    assert.equal(literal.status, 200);
    assert.equal(literal.data.projects[0].name, injectedName);
    assert.ok(db.prepare("SELECT count(*) AS count FROM users").get().count >= 3);
  });

  await t.test("same-origin referer fallback, invalid Origin cannot bypass using valid referer", async () => {
    assert.equal((await call("projects", "PATCH", { id: ownerProject.id, name: "Persisted" }, owner.cookie, { omitOrigin: true, headers: { referer: `${origin}/mada/dashboard` } })).status, 200);
    assert.equal((await call("projects", "PATCH", { id: ownerProject.id, name: "attack" }, owner.cookie, { headers: { origin: "null", referer: `${origin}/mada/dashboard` } })).status, 403);
  });

  await t.test("login verifies passwords; logout revokes and login retains data", async () => {
    assert.equal((await call("session", "POST", { action: "login", email: "owner@example.com", password: "IncorrectPassword" })).status, 401);
    assert.equal((await call("session", "POST", { action: "login", email: "missing@example.com", password })).status, 401);
    assert.equal((await call("session", "POST", { ...registration, name: "Other" })).status, 409);
    const oldCookie = owner.cookie;
    const loggedOut = await call("session", "DELETE", undefined, oldCookie);
    assert.equal(loggedOut.status, 200);
    assert.deepEqual(loggedOut.data, { ok: true });
    assert.match(loggedOut.response.headers.get("set-cookie"), /Max-Age=0/);
    assert.equal((await call("workspace", "GET", undefined, oldCookie)).status, 401);
    owner = await call("session", "POST", { action: "login", email: "OWNER@example.com", password });
    assert.equal(owner.status, 200);
    assert.notEqual(owner.cookie, oldCookie);
    assert.equal(owner.data.projects[0].name, "Persisted");
    assert.equal(owner.data.tasks.length, 1);
  });

  await t.test("persistent data and sessions survive a fresh Node process", () => {
    const script = `import {registerHooks} from 'node:module'; registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export {}',shortCircuit:true}:n(s,c)}}); const {handleMadaRequest}=await import(${JSON.stringify(serverURL)}); const r=await handleMadaRequest(new Request('https://mada.test/mada/api/workspace',{headers:{cookie:process.env.TEST_COOKIE}}),'workspace'); const d=await r.json(); if(r.status!==200||d.projects[0].name!=='Persisted')process.exit(2); console.log('persistence ok');`;
    const child = spawnSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], {
      encoding: "utf8", env: { ...process.env, TEST_COOKIE: owner.cookie }, timeout: 15_000,
    });
    assert.equal(child.status, 0, child.stderr);
    assert.match(child.stdout, /persistence ok/);
  });

  await t.test("project cascade, task delete, guest logout cleanup and session expiry", async () => {
    const removed = await call("tasks", "DELETE", { id: ownerTask.id }, owner.cookie);
    assert.equal(removed.status, 200);
    assert.equal(removed.data.tasks.length, 0);
    assert.equal((await call("tasks", "POST", { projectId: ownerProject.id, title: "Cascade", status: "todo", priority: "low", assigneeId: null, dueDate: "" }, owner.cookie)).status, 200);
    const cascaded = await call("projects", "DELETE", { id: ownerProject.id }, owner.cookie);
    assert.equal(cascaded.status, 200);
    assert.equal(cascaded.data.tasks.length, 0);
    assert.equal(cascaded.data.projects.length, 0);
    assert.equal((await call("session", "DELETE", undefined, guest.cookie)).status, 200);
    assert.equal((await call("workspace", "GET", undefined, guest.cookie)).status, 401);
    assert.equal(db.prepare("SELECT id FROM projects WHERE id = ?").get(guest.data.projects[0].id), undefined);
    const digest = createHash("sha256").update(secondGuest.cookie.split("=")[1]).digest("hex");
    db.prepare("UPDATE sessions SET expires_at = 0 WHERE token_hash = ?").run(digest);
    assert.equal((await call("workspace", "GET", undefined, secondGuest.cookie)).status, 401);
  });

  await t.test("persistent account rate limiting", async () => {
    let response;
    for (let i = 0; i < 9; i++) response = await call("session", "POST", { action: "login", email: "limited@example.com", password });
    assert.equal(response.status, 429);
    const retry = Number(response.response.headers.get("retry-after"));
    assert.ok(retry > 60 && retry <= 900);
  });
});

test("Next dev loopback aliases use actual Host, same protocol and port", async (t) => {
  isolatedStorage(t);
  process.env.NODE_ENV = "development";
  for (const host of ["localhost:3101", "127.0.0.1:3101", "[::1]:3101"]) {
    const incoming = {
      url: "/mada/api/session", method: "POST", body: JSON.stringify({ action: "guest" }),
      headers: { host, origin: `http://${host}`, "sec-fetch-site": "same-origin", "content-type": "application/json" },
    };
    addRequestMeta(incoming, "initURL", "http://localhost:3101/mada/api/session");
    const request = NextRequestAdapter.fromNodeNextRequest(incoming, new AbortController().signal);
    assert.equal(new URL(request.url).hostname, "localhost");
    const response = await handleMadaRequest(request, "session");
    assert.equal(response.status, 200, host);
    assert.doesNotMatch(response.headers.get("set-cookie"), /; Secure/);
  }
  assert.equal((await call("session", "POST", { action: "guest" }, null, {
    origin: "http://localhost:3101", omitOrigin: true,
    headers: { host: "127.0.0.1:3101", referer: "http://127.0.0.1:3101/mada/dashboard" },
  })).status, 200);
  assert.equal((await call("session", "POST", { action: "guest" }, null, {
    origin: "http://localhost", headers: { host: "127.0.0.1:80", origin: "http://127.0.0.1" },
  })).status, 200);
});

test("development exceptions reject hostile hosts, origins, ports and forwarding", async (t) => {
  isolatedStorage(t);
  process.env.NODE_ENV = "development";
  const good = { host: "127.0.0.1:3101", origin: "http://127.0.0.1:3101", "sec-fetch-site": "same-origin" };
  const badHeaders = [
    { origin: "https://127.0.0.1:3101" }, { origin: "http://127.0.0.1:3102" },
    { origin: "http://evil.test:3101" }, { origin: "null", referer: "http://127.0.0.1:3101/mada" },
    { origin: "http://localhost:3101" }, { "sec-fetch-site": "same-site" }, { "sec-fetch-site": "cross-site" },
    { host: "127.0.0.1:3102", origin: "http://127.0.0.1:3102" },
    ...["evil.test:3101", "localhost.evil.test:3101", "127.1:3101", "2130706433:3101", "127.0.0.2:3101", "[::ffff:127.0.0.1]:3101", "localhost:3101@evil.test", "localhost:3101/path", "localhost:3101,evil.test", "localhost:65536"].map((host) => ({ host })),
    { origin: "https://evil.test", "x-forwarded-host": "evil.test", "x-forwarded-proto": "https", forwarded: "host=evil.test;proto=https" },
  ];
  for (const patch of badHeaders) {
    const response = await call("session", "POST", { action: "guest" }, null, { origin: "http://localhost:3101", headers: { ...good, ...patch } });
    assert.equal(response.status, 403, JSON.stringify(patch));
  }
  assert.equal((await call("session", "POST", { action: "guest" }, null, {
    origin: "http://localhost:3101", omitOrigin: true, headers: { host: good.host, "sec-fetch-site": "same-origin" },
  })).status, 403);
  assert.equal((await call("session", "POST", { action: "guest" }, null, {
    origin: "http://internal.test:3101", headers: good,
  })).status, 403);
  assert.equal(globalThis.madaStore, undefined);
});

test("production fallback uses request URL, never Host or forwarded origin", async (t) => {
  isolatedStorage(t);
  process.env.NODE_ENV = "production";
  assert.equal((await call("session", "POST", { action: "guest" }, null, {
    origin: "http://localhost:3101", headers: { host: "127.0.0.1:3101", origin: "http://127.0.0.1:3101", "sec-fetch-site": "same-origin" },
  })).status, 403);
  assert.equal((await call("session", "POST", { action: "guest" }, null, {
    headers: { host: "evil.test", origin: "https://evil.test", "x-forwarded-host": "evil.test", "x-forwarded-proto": "https" },
  })).status, 403);
  const response = await call("session", "POST", { action: "guest" }, null, {
    origin: "http://mada.test", headers: { origin: "http://mada.test", "x-forwarded-proto": "https", "x-forwarded-host": "evil.test" },
  });
  assert.equal(response.status, 200);
  assert.doesNotMatch(response.response.headers.get("set-cookie"), /; Secure/);
});

test("configured HTTPS origin authenticates behind HTTP proxy and sets Secure cookies", async (t) => {
  isolatedStorage(t);
  process.env.NODE_ENV = "production";
  process.env.MADA_PUBLIC_ORIGIN = "https://public.mada.test/";
  const proxy = { origin: "http://localhost:3101", headers: { host: "localhost:3101", origin: "https://public.mada.test", "sec-fetch-site": "same-origin", "x-forwarded-proto": "http", "x-forwarded-host": "evil.test" } };
  const owner = await call("session", "POST", registration, null, proxy);
  assert.equal(owner.status, 200);
  assert.match(owner.response.headers.get("set-cookie"), /; Secure/);
  const created = await call("projects", "POST", project, owner.cookie, proxy);
  assert.equal(created.status, 200);
  for (const hostile of ["http://localhost:3101", "http://public.mada.test", "https://evil.test", "https://public.mada.test:444", "https://public.mada.test/"]) {
    assert.equal((await call("projects", "POST", project, owner.cookie, { ...proxy, headers: { ...proxy.headers, origin: hostile } })).status, 403);
  }
  assert.equal((await call("projects", "POST", project, owner.cookie, { ...proxy, headers: { ...proxy.headers, "sec-fetch-site": "cross-site" } })).status, 403);
  assert.equal((await call("projects", "POST", project, owner.cookie, { ...proxy, omitOrigin: true, headers: { ...proxy.headers, referer: "https://public.mada.test/mada/dashboard" } })).status, 200);
  const logout = await call("session", "DELETE", undefined, owner.cookie, proxy);
  assert.equal(logout.status, 200);
  assert.match(logout.response.headers.get("set-cookie"), /Max-Age=0/);
  assert.match(logout.response.headers.get("set-cookie"), /; Secure/);
  const login = await call("session", "POST", { action: "login", email: registration.email, password }, null, proxy);
  assert.equal(login.status, 200);
  assert.match(login.response.headers.get("set-cookie"), /; Secure/);
  process.env.NODE_ENV = "development";
  assert.equal((await call("session", "POST", { action: "guest" }, null, {
    origin: "http://localhost:3101", headers: { host: "127.0.0.1:3101", origin: "http://127.0.0.1:3101" },
  })).status, 403);
});

test("invalid public-origin configuration fails closed before storage access", async (t) => {
  isolatedStorage(t);
  t.mock.method(console, "error", () => {});
  for (const configured of ["", "not a URL", "null", "ftp://mada.test", "https:mada.test", "//mada.test", "https://user:pass@mada.test", "https://@mada.test", "https://mada.test/path", "https://mada.test/a/..", "https://mada.test?", "https://mada.test#", "https://mada.test\\", " https://mada.test", "https://mada.test\n"]) {
    process.env.MADA_PUBLIC_ORIGIN = configured;
    assert.equal((await call("session", "POST", { action: "guest" })).status, 500, JSON.stringify(configured));
    assert.equal((await call("workspace", "GET")).status, 500);
    assert.equal(globalThis.madaStore, undefined);
  }
});

test("malformed session requests cannot exhaust another user's valid login", async (t) => {
  isolatedStorage(t);
  assert.equal((await call("session", "POST", registration)).status, 200);
  for (let i = 0; i < 75; i++) {
    const input = [{ action: "unknown" }, { action: "login", email: registration.email, password: "short" }, { action: "guest", extra: true }][i % 3];
    assert.equal((await call("session", "POST", input)).status, 400);
  }
  const login = await call("session", "POST", { action: "login", email: registration.email, password });
  assert.equal(login.status, 200);
  assert.equal(login.response.headers.get("retry-after"), null);
});

test("account Retry-After tracks remaining expiry with a controlled clock", async (t) => {
  isolatedStorage(t);
  let now = Date.now();
  const start = now;
  t.mock.method(Date, "now", () => now);
  const attempt = () => call("session", "POST", { action: "login", email: "limited@example.com", password });
  for (let i = 0; i < 8; i++) assert.equal((await attempt()).status, 401);
  let response = await attempt();
  assert.equal(response.status, 429);
  assert.equal(response.response.headers.get("retry-after"), "900");
  now = start + 61_001;
  response = await attempt();
  assert.equal(response.status, 429);
  assert.equal(response.response.headers.get("retry-after"), "839");
  now = start + 899_999;
  assert.equal((await attempt()).response.headers.get("retry-after"), "1");
  now = start + 900_000;
  response = await attempt();
  assert.equal(response.status, 401);
  assert.equal(response.response.headers.get("retry-after"), null);
});

test("guest hourly quota has accurate retry duration without poisoning login", async (t) => {
  isolatedStorage(t);
  let now = Date.now();
  const start = now;
  t.mock.method(Date, "now", () => now);
  assert.equal((await call("session", "POST", registration)).status, 200);
  for (let i = 0; i < 30; i++) assert.equal((await call("session", "POST", { action: "guest" })).status, 200);
  let response = await call("session", "POST", { action: "guest" });
  assert.equal(response.status, 429);
  assert.equal(response.response.headers.get("retry-after"), "3600");
  assert.equal((await call("session", "POST", { action: "login", email: registration.email, password })).status, 200);
  now = start + 60_001;
  assert.equal((await call("session", "POST", { action: "guest" })).response.headers.get("retry-after"), "3540");
  now = start + 3_600_000;
  response = await call("session", "POST", { action: "guest" });
  assert.equal(response.status, 200);
  assert.equal(response.response.headers.get("retry-after"), null);
});

test("concurrent password hashing is bounded and advertises a short retry", async (t) => {
  isolatedStorage(t);
  const responses = await Promise.all(Array.from({ length: 9 }, (_, i) => call("session", "POST", { action: "login", email: `concurrent${i}@example.com`, password })));
  assert.equal(responses.filter((r) => r.status === 401).length, 4);
  const busy = responses.filter((r) => r.status === 429);
  assert.equal(busy.length, 5);
  assert.ok(busy.every((r) => r.response.headers.get("retry-after") === "1"));
  assert.equal(globalThis.madaStore.activeHashes, 0);
  assert.equal((await call("session", "POST", { action: "login", email: "concurrent8@example.com", password })).status, 401);
});

test("permanent workspace capacity omits a misleading Retry-After", async (t) => {
  isolatedStorage(t);
  assert.equal((await call("workspace", "GET")).status, 401);
  globalThis.madaStore.db.exec(`
    WITH RECURSIVE n(value) AS (SELECT 1 UNION ALL SELECT value + 1 FROM n WHERE value < 1000)
    INSERT INTO workspaces (id, name, is_guest, expires_at, created_at)
    SELECT 'capacity-' || value, 'Full', 0, NULL, '2026-01-01T00:00:00.000Z' FROM n;
  `);
  const response = await call("session", "POST", registration);
  assert.equal(response.status, 429);
  assert.equal(response.response.headers.get("retry-after"), null);
  assert.equal(globalThis.madaStore.db.prepare("SELECT count(*) AS count FROM users").get().count, 0);
});

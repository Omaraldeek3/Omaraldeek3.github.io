"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { Member, Priority, Project, Status, Task, Workspace } from "./types";
import styles from "./dashboard.module.css";

type View = "overview" | "projects" | "tasks" | "team";
type IconName = View | "plus" | "arrow" | "search" | "calendar" | "check" | "clock" | "close" | "edit" | "trash" | "logout" | "list" | "board" | "shield";
type EditorState = { kind: "project"; project?: Project } | { kind: "task"; task?: Task; status?: Status } | { kind: "member" };
type Save = (resource: "projects" | "tasks" | "team", method: "POST" | "PATCH" | "DELETE", data: Record<string, unknown>) => Promise<void>;

const statusLabels: Record<Status, string> = { todo: "لم تبدأ", doing: "قيد التنفيذ", done: "مكتملة" };
const priorityLabels: Record<Priority, string> = { low: "منخفضة", medium: "متوسطة", high: "عالية" };
const navigation: { id: View; label: string }[] = [
  { id: "overview", label: "نظرة عامة" },
  { id: "projects", label: "المشاريع" },
  { id: "tasks", label: "المهام" },
  { id: "team", label: "الفريق" },
];
const projectColors = ["#2854de", "#7957ce", "#229688", "#d28b33", "#ce6685"];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    projects: <path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 3h18" />,
    tasks: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="m8 9 1 1 2-2m2 1h3m-8 6 1 1 2-2m2 1h3" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m3 9v-2a6 6 0 0 0-2-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M20 12H4m6-6-6 6 6 6" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    edit: <><path d="m15 4 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14v6Z" /></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></>,
    logout: <><path d="M10 4H4v16h6m4-12 4 4-4 4M8 12h13" /></>,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h1m-1 6h1m-1 6h1" />,
    board: <><rect x="3" y="4" width="4" height="16" rx="1" /><rect x="10" y="4" width="4" height="11" rx="1" /><rect x="17" y="4" width="4" height="14" rx="1" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Brand() {
  return <Link href="/mada" className={styles.brand} aria-label="مدى، الصفحة الرئيسية"><svg width="35" height="35" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M4 28V8l14 12L32 8v20" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" /><path d="M18 20v8" stroke="currentColor" strokeWidth="5" /></svg><span>مدى<span className={styles.brandLatin}>mada</span></span></Link>;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
}

function formatDate(value: string, long = false) {
  if (!value) return "بدون موعد";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "بدون موعد";
  return new Intl.DateTimeFormat("ar", { day: "numeric", month: long ? "long" : "short", ...(long ? { year: "numeric" } : {}) }).format(date);
}

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

async function request<T>(path: string, method = "GET", body?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/mada/api/${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    signal,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "تعذّر إتمام الطلب. يرجى المحاولة مرة أخرى.");
  return data as T;
}

export function DashboardLoading() {
  return <main className={styles.loadingPage} dir="rtl" lang="ar"><Brand /><div className={styles.spinner} aria-hidden="true" /><p role="status">نجهّز لك مساحة العمل...</p></main>;
}

function AuthPanel({ initialMode, onAuthenticated }: { initialMode: string | null; onAuthenticated: (workspace: Workspace) => void }) {
  const [mode, setMode] = useState(initialMode === "login" ? "login" : "register");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function authenticate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (pending) return;
    const data = event ? Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string> : {};
    const nextErrors: Record<string, string> = {};
    if (event) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email?.trim() || "")) nextErrors.email = "أدخل بريداً إلكترونياً صالحاً.";
      if (!data.password || (mode === "register" && data.password.length < 10)) nextErrors.password = mode === "register" ? "استخدم كلمة مرور من 10 أحرف على الأقل." : "أدخل كلمة المرور.";
      if (mode === "register") {
        if (!data.name?.trim()) nextErrors.name = "أدخل اسمك.";
        if (!data.workspaceName?.trim()) nextErrors.workspaceName = "أدخل اسماً لمساحة العمل.";
      }
    }
    setErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) {
      event?.currentTarget.querySelector<HTMLInputElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    setPending(true);
    try {
      const workspace = await request<Workspace>("session", "POST", event ? { ...data, email: data.email.trim(), action: mode } : { action: "guest" });
      onAuthenticated(workspace);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذّر الاتصال. حاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  }

  function field(name: string, label: string, type = "text", placeholder = "") {
    return <label className={styles.field}><span id={`auth-${name}-label`}>{label}</span><input name={name} type={type} placeholder={placeholder} autoComplete={name === "password" ? mode === "register" ? "new-password" : "current-password" : name === "name" ? "name" : name === "email" ? "email" : "organization"} dir={type === "email" || type === "password" ? "ltr" : undefined} aria-labelledby={`auth-${name}-label`} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `auth-${name}-error` : undefined} required maxLength={name === "password" ? 128 : name === "email" ? 200 : 100} /><span id={`auth-${name}-error`} className={styles.fieldError}>{errors[name]}</span></label>;
  }

  return <div className={styles.authPage} dir="rtl" lang="ar">
    <section className={styles.authMain}>
      <Brand />
      <div className={styles.authFormWrap}>
        <span className={styles.eyebrow}>مساحة لأفكارك. مدى لإنجازك.</span>
        <h1>{initialMode === "demo" ? "تعرّف على مساحة عملك القادمة." : mode === "login" ? "أهلاً بعودتك إلى مدى." : "كل إنجاز يبدأ بخطوة."}</h1>
        <p className={styles.muted}>{mode === "login" ? "سجّل دخولك، وأكمل من حيث وصلت." : "أنشئ حسابك واجمع مشاريعك ومهامك في مكان واحد."}</p>
        {initialMode === "demo" && <div className={styles.demoIntro}><Icon name="shield" /><p>استكشف مدى ببيانات نموذجية في مساحة تجريبية معزولة. لن يتم إرسال دعوات أو رسائل بريد.</p></div>}
        <div className={styles.authTabs} aria-label="نوع الدخول">
          <button type="button" aria-pressed={mode === "register"} disabled={pending} onClick={() => { setMode("register"); setErrors({}); setError(""); }}>إنشاء حساب</button>
          <button type="button" aria-pressed={mode === "login"} disabled={pending} onClick={() => { setMode("login"); setErrors({}); setError(""); }}>تسجيل الدخول</button>
        </div>
        <form key={mode} onSubmit={authenticate} noValidate aria-busy={pending}>
          <fieldset className={styles.fieldset} disabled={pending}>
            {mode === "register" && field("name", "الاسم الكامل", "text", "كيف نناديك؟")}
            {mode === "register" && field("workspaceName", "اسم مساحة العمل", "text", "مثال: استوديو أفق")}
            {field("email", "البريد الإلكتروني", "email", "you@company.com")}
            {field("password", "كلمة المرور", "password", mode === "register" ? "10 أحرف على الأقل" : "كلمة المرور")}
            {error && <p className={styles.errorMessage} role="alert">{error}</p>}
            <button type="submit" className={`${styles.primaryButton} ${styles.fullWidth}`}>{pending ? "جارٍ المتابعة..." : mode === "login" ? "الدخول إلى مساحة العمل" : "إنشاء مساحة العمل"}<Icon name="arrow" size={18} /></button>
          </fieldset>
        </form>
        <div className={styles.authDivider}><span>أو اكتشف مدى أولاً</span></div>
        <button className={`${styles.secondaryButton} ${styles.fullWidth}`} disabled={pending} onClick={() => void authenticate()}>تجربة مساحة تجريبية<Icon name="arrow" size={18} /></button>
        <p className={styles.authNote}>التجربة لا تحتاج إلى حساب. الحساب الجديد يبدأ بمساحة فارغة خاصة بك.</p>
      </div>
      <Link href="/mada" className={styles.backLink}>العودة إلى الصفحة الرئيسية<Icon name="arrow" size={16} /></Link>
    </section>
    <aside className={styles.authAside}>
      <div className={styles.authOrbit} aria-hidden="true"><div /><div /><span><svg width="75" height="75" viewBox="0 0 36 36" fill="none"><path d="M4 28V8l14 12L32 8v20M18 20v8" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" /></svg></span><i /><i /><i /></div>
      <span className={styles.authAsideLabel}>من الفكرة إلى الإنجاز</span>
      <h2>أقل تشتّتاً.<br />أكثر وضوحاً.<br /><span>أبعد مدى.</span></h2>
      <p>حين تجد كل التفاصيل مكانها،<br />يصبح التركيز على ما يهم أسهل.</p>
      <div className={styles.authBenefits}><span><Icon name="check" size={16} />مشاريع منظّمة</span><span><Icon name="check" size={16} />أولويات واضحة</span><span><Icon name="check" size={16} />تجربة عربية</span></div>
    </aside>
  </div>;
}

function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className={styles.emptyState}><span className={styles.emptyIcon}><Icon name="projects" size={26} /></span><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

function ProjectCard({ project, tasks, busy, onOpen, onEdit }: { project: Project; tasks: Task[]; busy: boolean; onOpen: () => void; onEdit: () => void }) {
  const completed = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  return <article className={styles.projectCard} style={{ "--project-color": project.color } as CSSProperties}>
    <div className={styles.projectCardTop}><span className={styles.projectIcon}><Icon name="projects" size={23} /></span><button className={styles.iconButton} aria-label={`تعديل مشروع ${project.name}`} disabled={busy} onClick={onEdit}><Icon name="edit" size={17} /></button></div>
    <button className={styles.projectOpen} onClick={onOpen} aria-label={`عرض مهام مشروع ${project.name}`}>
      <h3>{project.name}</h3><p className={styles.projectDescription}>{project.description || "مساحة لفكرة جديدة وإنجاز قادم."}</p>
      <div className={styles.progressLabel}><span>التقدّم</span><b className={styles.latin}>{progress}%</b></div>
      <progress className={styles.progress} value={completed} max={tasks.length || 1} aria-label={`تقدم ${project.name}: ${progress}%`} />
      <div className={styles.projectMeta}><span><Icon name="tasks" size={15} /><b className={styles.latin}>{completed}/{tasks.length}</b> مهام</span><span><Icon name="calendar" size={15} />{formatDate(project.dueDate)}</span></div>
    </button>
  </article>;
}

function WorkspaceEditor({ editor, workspace, projectFilter, busy, onSave, onClose }: { editor: EditorState; workspace: Workspace; projectFilter: string; busy: boolean; onSave: Save; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const editing = editor.kind === "project" ? editor.project : editor.kind === "task" ? editor.task : undefined;
  const title = editor.kind === "project" ? editing ? "تعديل المشروع" : "مشروع جديد" : editor.kind === "task" ? editing ? "تعديل المهمة" : "مهمة جديدة" : "إضافة عضو إلى الدليل";
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    // React autofocus runs before the initially closed dialog becomes focusable.
    dialog?.querySelector<HTMLInputElement>("input")?.focus();
    return () => {
      dialog?.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget));
    if (editor.kind === "task") {
      data.assigneeId = data.assigneeId || null;
      if (editing) delete data.projectId;
    }
    if (editing) data.id = editing.id;
    setError("");
    try {
      await onSave(editor.kind === "project" ? "projects" : editor.kind === "task" ? "tasks" : "team", editing ? "PATCH" : "POST", data);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذّر الحفظ. حاول مرة أخرى.");
    }
  }

  async function remove() {
    if (!editing || busy || editor.kind === "member") return;
    if (!window.confirm(editor.kind === "project" ? "حذف هذا المشروع وكل مهامه؟ لا يمكن التراجع عن هذا الإجراء." : "حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setError("");
    try {
      await onSave(editor.kind === "project" ? "projects" : "tasks", "DELETE", { id: editing.id });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذّر الحذف. حاول مرة أخرى.");
    }
  }

  return <dialog className={styles.dialog} ref={dialogRef} aria-labelledby="editor-title" aria-describedby="editor-description" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} dir="rtl">
    <div className={styles.dialogHeading}><span className={styles.dialogIcon}><Icon name={editor.kind === "project" ? "projects" : editor.kind === "task" ? "tasks" : "team"} size={24} /></span><button type="button" className={styles.iconButton} onClick={onClose} disabled={busy} aria-label="إغلاق النافذة"><Icon name="close" /></button></div>
    <h2 id="editor-title">{title}</h2><p id="editor-description" className={styles.dialogDescription}>{editor.kind === "member" ? "سجل لتنظيم دليل الفريق فقط. لا تُرسل دعوة بريدية ولا يُمنح وصول مشترك لمساحة العمل." : editor.kind === "project" ? "امنح فكرتك اسماً، وحدّد ملامح الخطوة القادمة." : "خطوة واضحة تقرّب المشروع من الإنجاز."}</p>
    <form onSubmit={submit} aria-busy={busy}>
      <fieldset className={styles.fieldset} disabled={busy}>
        {editor.kind === "project" && <>
          <label className={styles.field}><span>اسم المشروع <span className={styles.required}>*</span></span><input name="name" required maxLength={100} defaultValue={editor.project?.name} placeholder="مثال: إطلاق الهوية الجديدة" /></label>
          <label className={styles.field}><span>وصف المشروع</span><textarea name="description" rows={3} maxLength={1000} defaultValue={editor.project?.description} placeholder="ما الذي نريد الوصول إليه؟" /></label>
          <label className={styles.field}><span>الموعد المستهدف</span><input name="dueDate" type="date" defaultValue={editor.project?.dueDate} /></label>
          <fieldset className={styles.colorPicker}><legend>لون المشروع</legend>{projectColors.includes(editor.project?.color || "") || !editor.project ? null : <label style={{ "--swatch": editor.project.color } as CSSProperties}><input type="radio" name="color" value={editor.project.color} defaultChecked aria-label="اللون الحالي" /><span /></label>}{projectColors.map((color, index) => <label key={color} style={{ "--swatch": color } as CSSProperties}><input type="radio" name="color" value={color} defaultChecked={editor.project ? editor.project.color === color : index === 0} aria-label={["أزرق", "بنفسجي", "أخضر", "ذهبي", "وردي"][index]} /><span /></label>)}</fieldset>
        </>}
        {editor.kind === "task" && <>
          <label className={styles.field}><span>عنوان المهمة <span className={styles.required}>*</span></span><input name="title" required maxLength={200} defaultValue={editor.task?.title} placeholder="ما الخطوة التالية؟" /></label>
          <label className={styles.field}><span>المشروع <span className={styles.required}>*</span></span><select name="projectId" required defaultValue={editor.task?.projectId || (projectFilter !== "all" ? projectFilter : workspace.projects[0]?.id)} disabled={!!editor.task}>{workspace.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>{editor.task && <small>المهمة مرتبطة بهذا المشروع.</small>}</label>
          <div className={styles.fieldRow}><label className={styles.field}><span>الحالة</span><select name="status" defaultValue={editor.task?.status || editor.status || "todo"}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className={styles.field}><span>الأولوية</span><select name="priority" defaultValue={editor.task?.priority || "medium"}>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
          <label className={styles.field}><span>المسؤول عن المهمة</span><select name="assigneeId" defaultValue={editor.task?.assigneeId || ""}><option value="">غير مسندة</option>{workspace.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
          <label className={styles.field}><span>تاريخ الاستحقاق</span><input name="dueDate" type="date" defaultValue={editor.task?.dueDate} /></label>
        </>}
        {editor.kind === "member" && <>
          <label className={styles.field}><span>الاسم الكامل <span className={styles.required}>*</span></span><input name="name" required maxLength={100} placeholder="اسم عضو الفريق" /></label>
          <label className={styles.field}><span>البريد الإلكتروني <span className={styles.required}>*</span></span><input name="email" required type="email" maxLength={200} placeholder="name@company.com" dir="ltr" /></label>
          <label className={styles.field}><span>المسمّى الوظيفي <span className={styles.required}>*</span></span><input name="role" required maxLength={60} placeholder="مثال: مصمم تجربة مستخدم" /></label>
        </>}
        {error && <p className={styles.errorMessage} role="alert">{error}</p>}
        <div className={styles.dialogActions}><button type="submit" className={styles.primaryButton}>{busy ? "جارٍ الحفظ..." : editing ? "حفظ التغييرات" : editor.kind === "member" ? "إضافة إلى الدليل" : editor.kind === "task" ? "إنشاء المهمة" : "إنشاء المشروع"}</button><button type="button" className={styles.secondaryButton} onClick={onClose}>إلغاء</button>{editing && <button type="button" className={styles.deleteButton} onClick={() => void remove()}><Icon name="trash" size={17} />حذف</button>}</div>
      </fieldset>
    </form>
  </dialog>;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [workspace, setWorkspace] = useState<Workspace | null>();
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [view, setView] = useState<View>("overview");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectStatus, setProjectStatus] = useState("all");
  const [taskLayout, setTaskLayout] = useState<"board" | "list">("board");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/mada/api/workspace", { credentials: "same-origin", cache: "no-store", signal: controller.signal });
        if (response.status === 401) { setWorkspace(null); return; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "تعذّر تحميل مساحة العمل.");
        setWorkspace(data as Workspace);
      } catch (cause) {
        if (!controller.signal.aborted) setLoadError(cause instanceof Error ? cause.message : "تحقّق من اتصالك وحاول مرة أخرى.");
      }
    }
    void load();
    return () => controller.abort();
  }, [loadAttempt]);

  function navigate(next: View, filter = "all") {
    setView(next);
    setQuery("");
    setProjectFilter(filter);
    setProjectStatus("all");
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  const save: Save = async (resource, method, data) => {
    setBusy(true);
    setNotice("");
    setActionError("");
    try {
      const next = await request<Workspace>(resource, method, data);
      setWorkspace(next);
      if (projectFilter !== "all" && !next.projects.some((project) => project.id === projectFilter)) setProjectFilter("all");
      setNotice(method === "DELETE" ? "تم الحذف بنجاح." : "تم حفظ التغييرات بنجاح.");
    } finally {
      setBusy(false);
    }
  };

  async function updateStatus(task: Task, status: Status) {
    try { await save("tasks", "PATCH", { id: task.id, status }); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "تعذّر تحديث المهمة."); }
  }

  async function logout() {
    if (busy) return;
    setBusy(true);
    setActionError("");
    try {
      await request<{ ok: true }>("session", "DELETE");
      setWorkspace(null);
      setView("overview");
      setQuery("");
      setProjectFilter("all");
      setEditor(null);
      setNotice("");
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "تعذّر تسجيل الخروج."); }
    finally { setBusy(false); }
  }

  if (workspace === undefined) {
    if (loadError) return <main className={styles.loadingPage} dir="rtl" lang="ar"><Brand /><h1>تعذّر فتح مساحة العمل</h1><p role="alert">{loadError}</p><button className={styles.primaryButton} onClick={() => { setLoadError(""); setLoadAttempt((attempt) => attempt + 1); }}>إعادة المحاولة</button><Link href="/mada">العودة إلى مدى</Link></main>;
    return <DashboardLoading />;
  }
  if (workspace === null) return <AuthPanel key={searchParams.get("mode")} initialMode={searchParams.get("mode")} onAuthenticated={setWorkspace} />;

  const { projects, tasks, members, user } = workspace;
  const completed = tasks.filter((task) => task.status === "done").length;
  const inProgress = tasks.filter((task) => task.status === "doing").length;
  const today = localToday();
  const overdue = tasks.filter((task) => task.status !== "done" && task.dueDate && task.dueDate < today).length;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const recentTasks = [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const visibleProjects = projects.filter((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const done = projectTasks.length > 0 && projectTasks.every((task) => task.status === "done");
    return `${project.name} ${project.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && (projectStatus === "all" || (projectStatus === "done" ? done : !done));
  });
  const visibleTasks = tasks.filter((task) => (projectFilter === "all" || task.projectId === projectFilter) && task.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const visibleMembers = members.filter((member) => `${member.name} ${member.email} ${member.role}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const activeLabel = navigation.find((item) => item.id === view)?.label;
  const primaryAction = view === "tasks" ? "مهمة جديدة" : view === "team" ? "إضافة عضو" : "مشروع جديد";
  const addTask = (status: Status = "todo") => setEditor({ kind: "task", status });
  const statusSelect = (task: Task) => <select className={`${styles.statusSelect} ${styles[task.status]}`} aria-label={`حالة مهمة ${task.title}`} value={task.status} disabled={busy} onChange={(event) => void updateStatus(task, event.target.value as Status)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>;
  const memberName = (id: string | null) => members.find((member) => member.id === id)?.name || "غير مسندة";
  const renderProject = (project: Project) => <ProjectCard key={project.id} project={project} tasks={tasks.filter((task) => task.projectId === project.id)} busy={busy} onOpen={() => navigate("tasks", project.id)} onEdit={() => setEditor({ kind: "project", project })} />;

  return <div className={styles.shell} dir="rtl" lang="ar">
    <a className={styles.skipLink} href="#dashboard-content">تجاوز إلى المحتوى</a>
    <aside className={styles.sidebar}>
      <Brand />
      <div className={styles.workspaceBadge}><span className={styles.workspaceAvatar}>{initials(workspace.name)}</span><div><strong>{workspace.name}</strong><span>{user.isGuest ? "مساحة تجريبية" : "مساحة العمل"}</span></div></div>
      <span className={styles.navLabel}>مساحة العمل</span>
      <nav className={styles.navigation} aria-label="التنقل في مساحة العمل">{navigation.map((item) => <button key={item.id} className={view === item.id ? styles.activeNav : undefined} aria-current={view === item.id ? "page" : undefined} onClick={() => navigate(item.id)}><Icon name={item.id} /><span>{item.label}</span>{item.id === "tasks" && tasks.filter((task) => task.status !== "done").length > 0 && <b className={styles.navCount}>{tasks.filter((task) => task.status !== "done").length}</b>}</button>)}</nav>
      <div className={styles.sidebarNote}><span className={styles.sidebarNoteIcon}><Icon name="shield" size={23} /></span><strong>كل التفاصيل في مكانها.</strong><p>{user.isGuest ? "أنت تستكشف نسخة تجريبية ببيانات نموذجية خاصة بهذه المساحة." : "مساحتك الخاصة لتنظيم المشاريع ومتابعة ما يهم."}</p><span className={styles.sidebarLine} /></div>
      <div className={styles.userArea}><span className={styles.userAvatar}>{initials(user.name)}</span><div className={styles.userInfo}><strong>{user.name}</strong><span>{user.isGuest ? "حساب تجريبي" : user.email}</span></div><button className={styles.logoutButton} title="تسجيل الخروج" aria-label="تسجيل الخروج" disabled={busy} onClick={() => void logout()}><Icon name="logout" size={18} /></button></div>
    </aside>

    <div className={styles.mainArea}>
      <header className={styles.topbar}><div className={styles.breadcrumb}><span>مساحة العمل</span><span aria-hidden="true">/</span><strong>{activeLabel}</strong></div><div className={styles.topbarIdentity}><span className={styles.workspaceType}>{user.isGuest ? "نسخة تجريبية" : "مساحة خاصة"}</span><span className={styles.topAvatar}>{initials(user.name)}</span></div></header>
      <main id="dashboard-content" className={styles.content}>
        <div className={styles.pageHeading}><div><span className={styles.eyebrow}>{view === "overview" ? "نظرة أوضح. إنجاز أقرب." : workspace.name}</span><h1 ref={headingRef} tabIndex={-1}>{view === "overview" ? `أهلاً، ${user.name.trim().split(/\s+/)[0]}` : activeLabel}<span className={styles.titleDot}>.</span></h1><p>{view === "overview" ? "كل ما تحتاجه ليوم أكثر تركيزاً، في مكان واحد." : view === "projects" ? "من أول فكرة إلى آخر تفصيل. أعطِ كل مشروع مساحته." : view === "tasks" ? "خطوات صغيرة واضحة، تصنع إنجازات كبيرة." : "تعرّف على الأسماء والأدوار خلف كل مشروع."}</p></div><button className={styles.primaryButton} disabled={busy || (view === "tasks" && !projects.length)} onClick={() => view === "tasks" ? addTask() : setEditor({ kind: view === "team" ? "member" : "project" })}><Icon name="plus" size={18} />{primaryAction}</button></div>

        {user.isGuest && <div className={styles.guestNotice}><Icon name="shield" size={18} /><p><strong>مساحتك التجريبية.</strong> هذه بيانات نموذجية في تجربة معزولة. جرّب التعديل بحرية؛ لا توجد دعوات أو مشاركة وصول.</p></div>}
        <div className={styles.feedback} aria-live="polite" aria-atomic="true">{notice && <p className={styles.successMessage}><Icon name="check" size={17} />{notice}</p>}</div>
        {actionError && <p role="alert" className={styles.errorMessage}>{actionError}</p>}

        {view === "overview" && <>
          <section className={styles.stats} aria-label="إحصاءات مساحة العمل">
            {[{ label: "إجمالي المشاريع", value: projects.length, icon: "projects" as const, detail: "أفكار تأخذ طريقها للإنجاز", color: "blue" }, { label: "إجمالي المهام", value: tasks.length, icon: "tasks" as const, detail: `${inProgress} قيد التنفيذ الآن`, color: "purple" }, { label: "مهام مكتملة", value: completed, icon: "check" as const, detail: `${progress}% من إجمالي المهام`, color: "green" }, { label: "أعضاء الدليل", value: members.length, icon: "team" as const, detail: "سجلات الفريق في مساحة العمل", color: "orange" }].map((stat) => <article key={stat.label} className={styles.statCard}><div><span>{stat.label}</span><span className={`${styles.statIcon} ${styles[stat.color]}`}><Icon name={stat.icon} size={21} /></span></div><strong className={styles.statNumber}>{String(stat.value).padStart(2, "0")}</strong><p>{stat.detail}</p></article>)}
          </section>
          <section className={styles.overviewProjects}><div className={styles.sectionHeading}><div><h2>مشاريعك، في الصورة</h2><p>نظرة سريعة على ما تعمل عليه.</p></div><button className={styles.textButton} onClick={() => navigate("projects")}>كل المشاريع<Icon name="arrow" size={17} /></button></div>{projects.length ? <div className={styles.projectGrid}>{projects.slice(0, 3).map(renderProject)}</div> : <EmptyState title="هنا تبدأ مشاريعك القادمة" detail="أنشئ مشروعك الأول، ثم حوّل أفكارك إلى مهام قابلة للإنجاز." action={<button className={styles.secondaryButton} onClick={() => setEditor({ kind: "project" })}><Icon name="plus" size={17} />إنشاء أول مشروع</button>} />}</section>
          <div className={styles.overviewLower}>
            <section className={styles.panel}><div className={styles.panelHeading}><div><h2>أحدث المهام</h2><p>آخر الخطوات المضافة إلى مشاريعك.</p></div><button className={styles.textButton} onClick={() => navigate("tasks")}>عرض الكل<Icon name="arrow" size={16} /></button></div>{recentTasks.length ? <div className={styles.recentTasks}>{recentTasks.map((task) => <div key={task.id} className={styles.recentTask}><span className={`${styles.taskCheck} ${task.status === "done" ? styles.taskCheckDone : ""}`} aria-hidden="true">{task.status === "done" && <Icon name="check" size={14} />}</span><button className={styles.recentTaskTitle} disabled={busy} onClick={() => setEditor({ kind: "task", task })}><strong>{task.title}</strong><span>{projects.find((project) => project.id === task.projectId)?.name}</span></button><span className={`${styles.statusBadge} ${styles[task.status]}`}>{statusLabels[task.status]}</span></div>)}</div> : <EmptyState title="خطوتك التالية تنتظرك" detail="ستظهر هنا أحدث المهام عند إضافتها إلى المشاريع." />}</section>
            <section className={`${styles.panel} ${styles.progressPanel}`}><div className={styles.panelHeading}><div><h2>وتيرة الإنجاز</h2><p>الصورة الكاملة لمهامك.</p></div><Icon name="overview" size={19} /></div><div className={styles.progressSummary}><div className={styles.progressRing} style={{ "--progress": `${progress}%` } as CSSProperties} role="img" aria-label={`نسبة المهام المكتملة ${progress}%`}><div><strong className={styles.latin}>{progress}<small>%</small></strong><span>تم إنجازها</span></div></div><div className={styles.progressLegend}>{(Object.keys(statusLabels) as Status[]).map((status) => <div key={status}><span className={`${styles.legendDot} ${styles[status]}`} /><span>{statusLabels[status]}</span><b className={styles.latin}>{tasks.filter((task) => task.status === status).length}</b></div>)}</div></div><div className={styles.progressFootnote}><Icon name="clock" size={17} /><span>{overdue ? `${overdue} مهام تجاوزت موعدها وتحتاج انتباهك` : tasks.length ? "كل خطوة مكتملة تصنع فرقاً." : "أضف مهامك لتبدأ متابعة تقدّمك."}</span></div></section>
          </div>
          <p className={styles.overviewDate}><Icon name="calendar" size={15} />{formatDate(today, true)}<span>مساحة أهدأ. عمل أوضح.</span></p>
        </>}

        {view !== "overview" && <div className={styles.toolbar}>
          <label className={styles.searchField}><Icon name="search" size={19} /><span className={styles.srOnly}>{view === "projects" ? "البحث في المشاريع" : view === "tasks" ? "البحث في المهام" : "البحث في دليل الفريق"}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === "projects" ? "ابحث عن مشروع..." : view === "tasks" ? "ابحث عن مهمة..." : "ابحث بالاسم أو المسمّى..."} /></label>
          {view === "projects" && <label className={styles.filterField}><span className={styles.srOnly}>تصفية المشاريع حسب التقدّم</span><select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)}><option value="all">كل المشاريع</option><option value="active">غير مكتملة</option><option value="done">مكتملة المهام</option></select></label>}
          {view === "tasks" && <><label className={styles.filterField}><span className={styles.srOnly}>تصفية المهام حسب المشروع</span><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">كل المشاريع</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><div className={styles.viewToggle} aria-label="طريقة عرض المهام"><button aria-pressed={taskLayout === "board"} onClick={() => setTaskLayout("board")}><Icon name="board" size={17} />لوحة</button><button aria-pressed={taskLayout === "list"} onClick={() => setTaskLayout("list")}><Icon name="list" size={17} />قائمة</button></div></>}
          {view === "team" && <span className={styles.resultCount}><b className={styles.latin}>{visibleMembers.length}</b> أعضاء في الدليل</span>}
        </div>}

        {view === "projects" && (visibleProjects.length ? <div className={styles.projectGrid}>{visibleProjects.map(renderProject)}</div> : <EmptyState title={projects.length ? "لا توجد مشاريع مطابقة" : "فكرة اليوم، مشروع الغد"} detail={projects.length ? "جرّب عبارة بحث أخرى أو غيّر التصفية." : "أنشئ أول مشروع لتبدأ تنظيم المهام ومتابعة التقدّم."} action={!projects.length && <button className={styles.primaryButton} onClick={() => setEditor({ kind: "project" })}>إنشاء مشروع</button>} />)}

        {view === "tasks" && (!projects.length ? <EmptyState title="لنبدأ بمشروع أولاً" detail="كل مهمة تنتمي إلى مشروع. أنشئ مشروعاً ثم أضف خطواتك القادمة." action={<button className={styles.primaryButton} onClick={() => setEditor({ kind: "project" })}>إنشاء مشروع</button>} /> : !visibleTasks.length && (query || projectFilter !== "all") ? <EmptyState title="لا توجد مهام في هذا العرض" detail="جرّب تغيير البحث أو المشروع، أو أضف مهمة جديدة." action={<button className={styles.secondaryButton} disabled={busy} onClick={() => addTask()}>إضافة مهمة</button>} /> : taskLayout === "board" ? <section className={styles.kanban} aria-label="لوحة المهام">{(Object.keys(statusLabels) as Status[]).map((status) => <section key={status} className={styles.kanbanColumn} aria-label={statusLabels[status]}><div className={styles.columnHeading}><h2><span className={`${styles.legendDot} ${styles[status]}`} />{statusLabels[status]}<b className={styles.latin}>{visibleTasks.filter((task) => task.status === status).length}</b></h2><button className={styles.iconButton} aria-label={`إضافة مهمة: ${statusLabels[status]}`} disabled={busy} onClick={() => addTask(status)}><Icon name="plus" size={18} /></button></div><div className={styles.kanbanCards}>{visibleTasks.filter((task) => task.status === status).map((task) => <article key={task.id} className={styles.taskCard}><div className={styles.taskCardTop}><span className={`${styles.priorityBadge} ${styles[task.priority]}`}>{priorityLabels[task.priority]}</span><button className={styles.iconButton} aria-label={`تعديل مهمة ${task.title}`} disabled={busy} onClick={() => setEditor({ kind: "task", task })}><Icon name="edit" size={15} /></button></div><button className={styles.taskTitle} disabled={busy} onClick={() => setEditor({ kind: "task", task })}>{task.title}</button><span className={styles.taskProject}>{projects.find((project) => project.id === task.projectId)?.name}</span>{statusSelect(task)}<div className={styles.taskCardFooter}><span className={styles.taskAssignee} title={memberName(task.assigneeId)}><span className={styles.miniAvatar}>{task.assigneeId ? initials(memberName(task.assigneeId)) : <Icon name="team" size={13} />}</span><span>{memberName(task.assigneeId)}</span></span><span className={task.status !== "done" && task.dueDate && task.dueDate < today ? styles.overdue : undefined}><Icon name="calendar" size={13} />{formatDate(task.dueDate)}</span></div></article>)}{!visibleTasks.some((task) => task.status === status) && <p className={styles.columnEmpty}>لا توجد مهام هنا بعد.</p>}</div><button className={styles.addToColumn} disabled={busy} onClick={() => addTask(status)}><Icon name="plus" size={16} />إضافة مهمة</button></section>)}</section> : visibleTasks.length ? <div className={styles.tableWrap}><table className={styles.taskTable}><caption className={styles.srOnly}>قائمة المهام</caption><thead><tr><th scope="col">المهمة</th><th scope="col">الحالة</th><th scope="col">الأولوية</th><th scope="col">المسؤول</th><th scope="col">الاستحقاق</th><th scope="col"><span className={styles.srOnly}>إجراءات</span></th></tr></thead><tbody>{visibleTasks.map((task) => <tr key={task.id}><td><button className={styles.tableTaskTitle} disabled={busy} onClick={() => setEditor({ kind: "task", task })}>{task.title}</button><span className={styles.tableProject}>{projects.find((project) => project.id === task.projectId)?.name}</span></td><td>{statusSelect(task)}</td><td><span className={`${styles.priorityBadge} ${styles[task.priority]}`}>{priorityLabels[task.priority]}</span></td><td>{memberName(task.assigneeId)}</td><td className={task.status !== "done" && task.dueDate && task.dueDate < today ? styles.overdue : undefined}>{formatDate(task.dueDate)}</td><td><button className={styles.iconButton} aria-label={`تعديل مهمة ${task.title}`} disabled={busy} onClick={() => setEditor({ kind: "task", task })}><Icon name="edit" size={17} /></button></td></tr>)}</tbody></table></div> : <EmptyState title="مساحة لخطوتك التالية" detail="أضف مهمة وحدّد المسؤول والأولوية والموعد المناسب." action={<button className={styles.secondaryButton} onClick={() => addTask()}>إضافة مهمة</button>} />)}

        {view === "team" && <><div className={styles.directoryNotice}><Icon name="team" size={20} /><p><strong>دليل فريقك، وليس دعوات انضمام.</strong> الأعضاء سجلات لتنظيم المهام فقط. إضافة عضو لا ترسل بريداً ولا تمنحه وصولاً إلى مساحة العمل.</p></div>{visibleMembers.length ? <div className={styles.teamGrid}>{visibleMembers.map((member: Member, index) => <article key={member.id} className={styles.memberCard}><span className={`${styles.memberAvatar} ${styles[["blue", "purple", "green", "orange"][index % 4]]}`}>{initials(member.name)}</span><h2>{member.name}</h2><p>{member.role}</p><bdi className={styles.memberEmail}>{member.email}</bdi><div className={styles.memberTaskCount}><Icon name="tasks" size={16} /><span><b className={styles.latin}>{tasks.filter((task) => task.assigneeId === member.id && task.status !== "done").length}</b> مهام غير مكتملة</span></div></article>)}</div> : <EmptyState title="لا توجد أسماء مطابقة" detail="جرّب البحث باسم آخر، أو أضف سجلاً جديداً إلى الدليل." />}</>}
      </main>
    </div>
    {editor && <WorkspaceEditor editor={editor} workspace={workspace} projectFilter={projectFilter} busy={busy} onSave={save} onClose={() => setEditor(null)} />}
  </div>;
}

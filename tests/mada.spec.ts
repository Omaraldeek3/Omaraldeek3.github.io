import { randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import type { Workspace } from "../src/mada/types";

async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("Mada landing has working previews and responsive Arabic layout", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  expect((await page.goto("/mada"))?.status()).toBe(200);
  await expect(page).toHaveURL(/\/mada$/);
  await expect(page.locator("html")).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("عملٌ يجمعكم");
  await page.getByRole("button", { name: "إكمال تصميم تجربة الانضمام", exact: true }).click();
  await expect(page.getByRole("button", { name: "إعادة فتح تصميم تجربة الانضمام", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "التقدّم", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("67%");
  await page.getByRole("button", { name: "إعادة تجربة المهام" }).click();
  await expect(page.getByRole("tab", { name: "لوحة المهام" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "الجدول الزمني" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("لا تواريخ فعلية");
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expectNoOverflow(page);
    const title = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(title).not.toBeNull();
    expect(title!.x).toBeGreaterThanOrEqual(0);
    expect(title!.x + title!.width).toBeLessThanOrEqual(width);
    if (width === 1440 || width === 390) await page.screenshot({ path: testInfo.outputPath(`mada-landing-${width}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test("Mada respects reduced motion and has working mobile navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mada");
  await expect(page.getByRole("button", { name: "الحركة مخفّضة حسب جهازك" })).toBeDisabled();
  await page.getByRole("button", { name: "فتح القائمة" }).click();
  const navigation = page.getByRole("navigation", { name: "القائمة الرئيسية" });
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "الأسئلة الشائعة" }).click();
  await expect(navigation).toBeHidden();
  await page.locator("summary").filter({ hasText: "هل يستطيع أعضاء الفريق الدخول إلى مساحتي؟" }).click();
  await expect(page.locator("details[open]")).toContainText("ليست مفعّلة بعد");
  await expectNoOverflow(page);
});

test("Mada serves its sharing image and keeps workspace pages unindexed", async ({ page, request }) => {
  await page.goto("/mada/dashboard");
  await expect(page).toHaveTitle("مساحة العمل | مدى");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  expect((await request.get("/mada/icon.svg")).status()).toBe(200);
  const image = await request.get("/mada/opengraph-image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
  const png = await image.body();
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
});

test("Mada guest supports project, directory and task editing on desktop and mobile", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  const sessionPosts: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().endsWith("/mada/api/session") && request.method() === "POST") sessionPosts.push(request.postData() || "");
  });
  const navigate = (name: string) => page.getByRole("navigation", { name: "التنقل في مساحة العمل" }).getByRole("button", { name }).click();
  const dialog = page.getByRole("dialog");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/mada/dashboard?mode=demo");
  await expect(page.getByRole("button", { name: "تجربة مساحة تجريبية" })).toBeVisible();
  expect(sessionPosts).toEqual([]);
  await page.getByRole("button", { name: "تجربة مساحة تجريبية" }).click();
  await expect(page.getByRole("heading", { name: /أهلاً/ })).toBeVisible();
  expect(sessionPosts).toHaveLength(1);
  await expectNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("mada-dashboard-desktop.png"), fullPage: true });

  await navigate("المشاريع");
  const createProject = page.getByRole("button", { name: "مشروع جديد", exact: true });
  await createProject.click();
  await expect(dialog.getByRole("textbox", { name: /اسم المشروع/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(createProject).toBeFocused();
  await createProject.click();
  await dialog.getByRole("textbox", { name: /اسم المشروع/ }).fill("مشروع الاختبار");
  await dialog.getByRole("textbox", { name: "وصف المشروع" }).fill("مشروع لاختبار دورة العمل كاملة.");
  await dialog.getByLabel("الموعد المستهدف").fill("2027-02-20");
  await dialog.getByRole("button", { name: "إنشاء المشروع", exact: true }).click();
  await expect(dialog).toHaveCount(0);

  await navigate("الفريق");
  await page.getByRole("button", { name: "إضافة عضو", exact: true }).click();
  await expect(dialog).toContainText("لا تُرسل دعوة بريدية");
  await dialog.getByRole("textbox", { name: /الاسم الكامل/ }).fill("ليان اختبار");
  await dialog.getByRole("textbox", { name: /البريد الإلكتروني/ }).fill("layan@example.test");
  await dialog.getByRole("textbox", { name: /المسمّى الوظيفي/ }).fill("مصممة");
  await dialog.getByRole("button", { name: "إضافة إلى الدليل", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "ليان اختبار", exact: true })).toBeVisible();

  await navigate("المشاريع");
  await page.getByRole("button", { name: "عرض مهام مشروع مشروع الاختبار", exact: true }).click();
  await expect(page.getByLabel("تصفية المهام حسب المشروع")).not.toHaveValue("all");
  await page.getByRole("button", { name: "مهمة جديدة", exact: true }).click();
  await dialog.getByRole("textbox", { name: /عنوان المهمة/ }).fill("مراجعة التصميم");
  await dialog.getByLabel("المسؤول عن المهمة").selectOption({ label: "ليان اختبار" });
  await dialog.getByRole("combobox", { name: "الأولوية", exact: true }).selectOption("high");
  await dialog.getByLabel("تاريخ الاستحقاق").fill("2027-02-15");
  await dialog.getByRole("button", { name: "إنشاء المهمة", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByLabel("حالة مهمة مراجعة التصميم", { exact: true }).selectOption("doing");
  await expect(page.getByLabel("حالة مهمة مراجعة التصميم", { exact: true })).toHaveValue("doing");
  await expect(page.getByLabel("حالة مهمة مراجعة التصميم", { exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "قائمة", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByLabel("حالة مهمة مراجعة التصميم", { exact: true }).selectOption("done");
  await expect(page.getByLabel("حالة مهمة مراجعة التصميم", { exact: true })).toHaveValue("done");
  await expect(page.getByLabel("حالة مهمة مراجعة التصميم", { exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "تعديل مهمة مراجعة التصميم", exact: true }).click();
  await dialog.getByRole("textbox", { name: /عنوان المهمة/ }).fill("المراجعة النهائية");
  await dialog.getByRole("button", { name: "حفظ التغييرات", exact: true }).click();
  await expect(dialog).toHaveCount(0);

  await page.reload();
  await navigate("المشاريع");
  await expect(page.getByRole("progressbar", { name: "تقدم مشروع الاختبار: 100%" })).toHaveJSProperty("value", 1);
  await page.getByRole("button", { name: "عرض مهام مشروع مشروع الاختبار", exact: true }).click();
  await expect(page.getByLabel("حالة مهمة المراجعة النهائية", { exact: true })).toHaveValue("done");
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("mada-tasks-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "تعديل مهمة المراجعة النهائية", exact: true }).click();
  page.once("dialog", (confirmation) => confirmation.dismiss());
  await dialog.getByRole("button", { name: "حذف", exact: true }).click();
  await expect(dialog).toBeVisible();
  page.once("dialog", (confirmation) => confirmation.accept());
  await dialog.getByRole("button", { name: "حذف", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel("حالة مهمة المراجعة النهائية", { exact: true })).toHaveCount(0);

  await navigate("المشاريع");
  await page.getByRole("button", { name: "تعديل مشروع مشروع الاختبار", exact: true }).click();
  await dialog.getByRole("textbox", { name: /اسم المشروع/ }).fill("مشروع محدّث");
  await dialog.getByRole("radio", { name: "أخضر", exact: true }).check();
  await dialog.getByRole("button", { name: "حفظ التغييرات", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "تعديل مشروع مشروع محدّث", exact: true }).click();
  page.once("dialog", (confirmation) => confirmation.accept());
  await dialog.getByRole("button", { name: "حذف", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "عرض مهام مشروع مشروع محدّث", exact: true })).toHaveCount(0);
  for (const view of ["نظرة عامة", "المهام", "الفريق"]) {
    await navigate(view);
    await expectNoOverflow(page);
  }
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await expect(page.getByRole("button", { name: "تجربة مساحة تجريبية" })).toBeVisible();
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test("Mada registration validates inputs and retains projects after login", async ({ page }) => {
  const email = `mada-${randomUUID()}@example.test`;
  const password = "Mada-test-password-2026";
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mada/dashboard?mode=signup");
  await page.getByRole("button", { name: "إنشاء مساحة العمل", exact: true }).click();
  await expect(page.getByText("أدخل بريداً إلكترونياً صالحاً.")).toBeVisible();
  await expect(page.getByText("استخدم كلمة مرور من 10 أحرف على الأقل.")).toBeVisible();
  await page.getByRole("textbox", { name: "الاسم الكامل", exact: true }).fill("سارة اختبار");
  await page.getByRole("textbox", { name: "اسم مساحة العمل", exact: true }).fill("مساحة الاختبار");
  await page.getByRole("textbox", { name: "البريد الإلكتروني", exact: true }).fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("button", { name: "إنشاء مساحة العمل", exact: true }).click();
  await expect(page.getByRole("heading", { name: "هنا تبدأ مشاريعك القادمة" })).toBeVisible();
  await expect(page.getByText("مساحتك التجريبية.", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "مشروع جديد", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: /اسم المشروع/ }).fill("مشروع محفوظ");
  await dialog.getByRole("button", { name: "إنشاء المشروع", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await expect(page.getByRole("button", { name: "تجربة مساحة تجريبية" })).toBeVisible();
  expect((await page.request.get("/mada/api/workspace")).status()).toBe(401);
  await page.goto("/mada/dashboard?mode=login");
  await page.getByRole("textbox", { name: "البريد الإلكتروني", exact: true }).fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("button", { name: "الدخول إلى مساحة العمل", exact: true }).click();
  await expect(page.getByRole("button", { name: "عرض مهام مشروع مشروع محفوظ", exact: true })).toBeVisible();
  await expectNoOverflow(page);
});

test("Mada API rejects foreign origins and isolates guest workspaces", async ({ request, playwright, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const other = await playwright.request.newContext({ baseURL });
  const headers = { origin, "sec-fetch-site": "same-origin" };
  try {
    const rejected = await request.post("/mada/api/session", { headers: { origin: "https://evil.example", "x-forwarded-host": "evil.example" }, data: { action: "guest" } });
    expect(rejected.status()).toBe(403);
    const first = await request.post("/mada/api/session", { headers, data: { action: "guest" } });
    const second = await other.post("/mada/api/session", { headers, data: { action: "guest" } });
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
    const firstWorkspace = await first.json() as Workspace;
    const secondWorkspace = await second.json() as Workspace;
    expect(firstWorkspace.projects[0].id).not.toBe(secondWorkspace.projects[0].id);
    const foreignEdit = await other.patch("/mada/api/projects", { headers, data: { id: firstWorkspace.projects[0].id, name: "Forbidden" } });
    expect(foreignEdit.status()).toBe(404);
    const read = await request.get("/mada/api/workspace");
    expect(read.headers()["cache-control"]).toContain("no-store");
    expect((await read.json()).projects[0].name).toBe(firstWorkspace.projects[0].name);
  } finally {
    await request.delete("/mada/api/session", { headers });
    await other.delete("/mada/api/session", { headers });
    await other.dispose();
  }
});

test("Mada workspace recovers from a failed initial request", async ({ page }) => {
  await page.route("**/mada/api/workspace", (route) => route.fulfill({ status: 503, json: { error: "تعذر الاتصال للاختبار" } }));
  await page.goto("/mada/dashboard");
  await expect(page.getByRole("heading", { name: "تعذّر فتح مساحة العمل" })).toBeVisible();
  await page.unroute("**/mada/api/workspace");
  await page.getByRole("button", { name: "إعادة المحاولة" }).click();
  await expect(page.getByRole("button", { name: "تجربة مساحة تجريبية" })).toBeVisible();
});

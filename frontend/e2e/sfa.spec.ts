import { test, expect, type Page } from "@playwright/test";
import ExcelJS from "exceljs";
import fs from "fs";

const SHOTS = "e2e/screenshots";
fs.mkdirSync(SHOTS, { recursive: true });

const BASE = "http://127.0.0.1:5173";
const MANAGER = { username: "e2e_manager", password: "e2e_pass_123" };
const ADMIN = { username: "e2e_admin", password: "e2e_pass_123" };

// Валидный 1x1 PNG — реальное изображение для проверки загрузки фото.
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);
const photoFile = { name: "invoice.png", mimeType: "image/png", buffer: PNG_1x1 };

async function login(page: Page, user: { username: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Логин").fill(user.username);
  await page.getByLabel("Пароль").fill(user.password);
  await page.getByRole("button", { name: "Войти" }).click();
}

test("сквозной сценарий: визит менеджера → дашборд/лента/аналитика/экспорт", async ({
  page,
}) => {
  // Сбор ошибок консоли/страницы — отдельно ловим CORS.
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await test.step("1. вход менеджера → форма визита", async () => {
    await login(page, MANAGER);
    await page.waitForURL(`${BASE}/`);
    await expect(page.getByRole("heading", { name: "Новый визит" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Выберите магазин" })
    ).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}/01-manager-form.png`, fullPage: true });
  });

  await test.step("2. заполнение формы (магазин, 2 товара, фото)", async () => {
    await page.getByRole("button", { name: "Выберите магазин" }).click();
    await page.getByRole("button", { name: "E2E Магазин 1" }).click();

    await page.locator("select").nth(0).selectOption({ label: "E2E Молоко (1 л)" });
    let nums = page.locator('input[type="number"]');
    await nums.nth(0).fill("12");
    await nums.nth(1).fill("2");

    await page.getByRole("button", { name: "Добавить товар" }).click();
    await page.locator("select").nth(1).selectOption({ label: "E2E Кефир (0.5 л)" });
    nums = page.locator('input[type="number"]');
    await nums.nth(2).fill("8");
    await nums.nth(3).fill("0");

    await page.locator('input[type="file"]').setInputFiles(photoFile);
    await expect(page.getByAltText("Превью накладной")).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}/02-form-filled.png`, fullPage: true });
  });

  await test.step("3. отправка визита — реальный POST /api/visits/ = 201", async () => {
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/visits/") && r.request().method() === "POST"
      ),
      page.getByRole("button", { name: "Отправить" }).click(),
    ]);
    expect(resp.status()).toBe(201);
    await expect(page.getByText("Визит отправлен")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/03-visit-submitted.png`, fullPage: true });
  });

  await test.step("4. выход и вход админом → дашборд с графиками", async () => {
    await page.getByRole("button", { name: "Выйти" }).click();
    await page.waitForURL(`${BASE}/login`);
    await login(page, ADMIN);
    await page.waitForURL(`${BASE}/admin`);
    await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible();
    // Карточки-метрики и графики действительно отрисованы.
    await expect(page.getByText("Отгружено, шт")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Динамика по дням" })
    ).toBeVisible();
    await expect(page.locator(".recharts-surface").first()).toBeVisible();
    // Даём count-up на карточках доехать до итоговых значений для чистого скрина.
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${SHOTS}/04-admin-dashboard.png`, fullPage: true });
  });

  await test.step("5. лента визитов: визит виден, фото-модалка открывается", async () => {
    await page.getByRole("link", { name: "Лента визитов" }).click();
    await page.waitForURL(`${BASE}/admin/feed`);
    await expect(page.getByRole("heading", { name: "Лента визитов" })).toBeVisible();

    const row = page.getByRole("row", { name: /E2E Менеджер/ });
    await expect(row).toBeVisible();
    await expect(row).toContainText("E2E Магазин 1");
    await expect(row).toContainText("E2E Молоко: отгружено 12 / просрочка 2");
    await expect(row).toContainText("E2E Кефир: отгружено 8 / просрочка 0");
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SHOTS}/05-admin-feed.png`, fullPage: true });

    const thumb = page.getByAltText("Накладная").first();
    await expect
      .poll(() => thumb.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);

    await thumb.click();
    await expect(page.getByRole("heading", { name: "Накладная" })).toBeVisible();
    const modalImg = page.getByAltText("Накладная").last();
    await expect
      .poll(() => modalImg.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await page.screenshot({ path: `${SHOTS}/06-photo-modal.png` });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Накладная" })).toBeHidden();
  });

  await test.step("6. экспорт в Excel — реальный GET 200 и содержимое визита", async () => {
    const xlsxPath = `${SHOTS}/visits-export.xlsx`;
    const [download, exportResp] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse((r) => r.url().includes("/api/export/visits/")),
      page.getByRole("button", { name: "Экспорт в Excel" }).click(),
    ]);
    expect(exportResp.status()).toBe(200);
    await download.saveAs(xlsxPath);
    expect(fs.statSync(xlsxPath).size).toBeGreaterThan(0);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(xlsxPath);
    const ws = wb.getWorksheet("Визиты");
    expect(ws).toBeTruthy();

    const rows: {
      manager: string;
      store: string;
      product: string;
      shipped: number;
      expired: number;
    }[] = [];
    ws!.eachRow((r, i) => {
      if (i === 1) return;
      rows.push({
        manager: String(r.getCell(2).value ?? ""),
        store: String(r.getCell(3).value ?? ""),
        product: String(r.getCell(4).value ?? ""),
        shipped: Number(r.getCell(6).value ?? 0),
        expired: Number(r.getCell(7).value ?? 0),
      });
    });

    const milk = rows.find(
      (d) =>
        d.manager === "E2E Менеджер" &&
        d.store === "E2E Магазин 1" &&
        d.product.startsWith("E2E Молоко")
    );
    const kefir = rows.find(
      (d) =>
        d.manager === "E2E Менеджер" &&
        d.store === "E2E Магазин 1" &&
        d.product.startsWith("E2E Кефир")
    );
    expect(milk).toBeTruthy();
    expect(milk!.shipped).toBe(12);
    expect(milk!.expired).toBe(2);
    expect(kefir).toBeTruthy();
    expect(kefir!.shipped).toBe(8);
    expect(kefir!.expired).toBe(0);
  });

  await test.step("7. KPI менеджеров — числа в нужных колонках", async () => {
    await page.getByRole("link", { name: "KPI менеджеров" }).click();
    await page.waitForURL(`${BASE}/admin/managers`);
    const row = page.getByRole("row", { name: /E2E Менеджер/ });
    await expect(row).toBeVisible();
    await expect(row.getByRole("cell").nth(1)).toHaveText("1"); // магазинов посещено
    await expect(row.getByRole("cell").nth(2)).toHaveText("20"); // отгрузка 12 + 8
    await expect(row.getByRole("cell").nth(3)).toHaveText("2"); // просрочка
    await expect(row.getByRole("cell").nth(4)).toHaveText("10%"); // 2 / 20
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}/07-kpi-managers.png`, fullPage: true });
  });

  await test.step("8. аналитика по товарам — числа в нужных колонках", async () => {
    await page.getByRole("link", { name: "Аналитика по товарам" }).click();
    await page.waitForURL(`${BASE}/admin/products`);
    const row = page.getByRole("row", { name: /E2E Молоко/ });
    await expect(row).toBeVisible();
    await expect(row.getByRole("cell").nth(1)).toHaveText("12"); // отгружено
    await expect(row.getByRole("cell").nth(2)).toHaveText("2"); // просрочка
    await expect(row.getByRole("cell").nth(3)).toHaveText(/^16,67\s*%$/); // 2 / 12
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}/08-kpi-products.png`, fullPage: true });
  });

  await test.step("9. нет ошибок CORS / JS в консоли браузера", async () => {
    const corsErrors = consoleErrors.filter((e) =>
      /CORS|Access-Control|has been blocked/i.test(e)
    );
    expect(corsErrors, corsErrors.join("\n")).toHaveLength(0);
    expect(pageErrors, pageErrors.join("\n")).toHaveLength(0);
  });
});

test("роль: менеджер не получает доступ к /admin (редирект)", async ({ page }) => {
  await login(page, MANAGER);
  await page.waitForURL(`${BASE}/`);
  await page.goto("/admin");
  await expect(page).toHaveURL(`${BASE}/`);
  await page.screenshot({ path: `${SHOTS}/09-role-redirect.png` });
});

test("Swagger /api/docs отрисован и есть кнопка Authorize (JWT)", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:8000/api/docs/");
  await expect(page.getByText("SFA CRM API")).toBeVisible();
  await expect(page.getByRole("button", { name: /Authorize/i })).toBeVisible();
  // Эндпоинты из схемы отрисованы.
  await expect(page.getByText("/api/visits/").first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/10-swagger.png`, fullPage: true });
});

test("prefers-reduced-motion: ключевые экраны рендерятся без анимаций", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  // Форма менеджера
  await login(page, MANAGER);
  await page.waitForURL(`${BASE}/`);
  await expect(page.getByRole("heading", { name: "Новый визит" })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/rm-01-manager-form.png`, fullPage: true });

  // Дашборд админа (графики рендерятся сразу, без анимации входа)
  await page.getByRole("button", { name: "Выйти" }).click();
  await page.waitForURL(`${BASE}/login`);
  await login(page, ADMIN);
  await page.waitForURL(`${BASE}/admin`);
  await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible();
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  await expect(page.getByText("Отгружено, шт")).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/rm-02-admin-dashboard.png`, fullPage: true });
});

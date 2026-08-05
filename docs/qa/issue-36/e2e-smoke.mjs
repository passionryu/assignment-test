import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const require = createRequire("/Users/rsy/Desktop/myPlayGround/sweetBook/assignment-test/service/client/package.json");
const { chromium } = require("@playwright/test");

const repoRoot = "/Users/rsy/Desktop/myPlayGround/sweetBook/assignment-test";
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5173/";
const reportDir = path.join(repoRoot, "docs/qa/issue-36");
const evidenceDir = path.join(reportDir, "evidence");
const results = [];

function safeName(name) {
  return name.replace(/[^a-z0-9가-힣]+/gi, "-").replace(/^-|-$/g, "").slice(0, 90);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function screenshot(page, name) {
  const fileName = `${String(results.length + 1).padStart(2, "0")}-${safeName(name)}.png`;
  const fullPath = path.join(evidenceDir, fileName);
  await page.screenshot({ path: fullPath, fullPage: true });
  return `evidence/${fileName}`;
}

async function runStep(page, name, fn) {
  const startedAt = Date.now();
  const item = { name, status: "PASS", durationMs: 0, screenshot: "", error: "" };
  try {
    await fn();
  } catch (error) {
    item.status = "FAIL";
    item.error = error?.message || String(error);
  }
  item.durationMs = Date.now() - startedAt;
  try {
    item.screenshot = await screenshot(page, name);
  } catch (error) {
    item.error = `${item.error ? `${item.error}\n` : ""}screenshot failed: ${error?.message || String(error)}`;
  }
  results.push(item);
}

async function clickText(page, text, options = {}) {
  const locator = page.getByText(text, { exact: options.exact ?? false }).first();
  try {
    await locator.click({ timeout: options.timeout ?? 7000 });
  } catch (error) {
    await locator.click({ timeout: options.timeout ?? 7000, force: true });
  }
}

async function waitText(page, text, options = {}) {
  await page.getByText(text, { exact: options.exact ?? false }).first().waitFor({ state: "visible", timeout: options.timeout ?? 7000 });
}

async function waitMainText(page, text, options = {}) {
  await page.locator("main").getByText(text, { exact: options.exact ?? false }).first().waitFor({ state: "visible", timeout: options.timeout ?? 7000 });
}

async function waitAnyText(page, texts, options = {}) {
  const timeout = options.timeout ?? 7000;
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < timeout) {
    for (const text of texts) {
      const locator = page.getByText(text, { exact: options.exact ?? false }).first();
      if (await locator.isVisible({ timeout: 250 }).catch(() => false)) {
        return text;
      }
    }
    await page.waitForTimeout(250);
  }
  throw lastError || new Error(`None of these texts became visible: ${texts.join(", ")}`);
}

async function maybeClickText(page, text, options = {}) {
  const locator = page.getByText(text, { exact: options.exact ?? false }).first();
  if (await locator.isVisible({ timeout: options.timeout ?? 1500 }).catch(() => false)) {
    await locator.click();
    return true;
  }
  return false;
}

async function clickNavLabel(page, label) {
  const labelNode = page.locator(".nav-label").filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) }).first();
  const navButton = labelNode.locator("xpath=ancestor::button[1]");
  await navButton.click({ timeout: 7000, force: true });
  await page.waitForTimeout(250);
}

async function openBookProducts(page) {
  await clickNavLabel(page, "추억을 책으로 소장");
}

async function ensureBookSubmenuOpen(page) {
  const productLink = page.locator(".book-submenu .nav-label").filter({ hasText: /^상품 안내$/ }).first();
  if (!(await productLink.isVisible({ timeout: 700 }).catch(() => false))) {
    const expandToggle = page.getByRole("button", { name: "책 메뉴 펼치기" }).first();
    if (await expandToggle.isVisible({ timeout: 700 }).catch(() => false)) {
      await expandToggle.click({ force: true });
    } else {
      await page.locator(".book-nav-combo .nav-icon-toggle").first().click({ timeout: 7000, force: true });
    }
    await page.waitForTimeout(250);
  }
}

async function clickBookSubmenu(page, label) {
  await ensureBookSubmenuOpen(page);
  const labelNode = page.locator(".book-submenu .nav-label").filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) }).first();
  await labelNode.locator("xpath=ancestor::button[1]").click({ timeout: 7000, force: true });
  await page.waitForTimeout(350);
}

async function ensureContentTypeIncluded(page, label) {
  const button = page.locator(".book-candidate-type-picker button").filter({ hasText: label }).first();
  if (await button.locator("text=제외됨").isVisible({ timeout: 700 }).catch(() => false)) {
    await button.click({ force: true });
  }
}

async function closeModal(page) {
  await page.keyboard.press("Escape").catch(() => {});
  const closeButtons = page.getByRole("button", { name: /닫기|확인|×/ });
  if (await closeButtons.first().isVisible({ timeout: 1000 }).catch(() => false)) {
    await closeButtons.first().click().catch(() => {});
  }
}

async function clickFirstOrderRow(page) {
  const row = page.locator("main .order-data-table tbody tr").first();
  await row.waitFor({ state: "visible", timeout: 10000 });
  await row.scrollIntoViewIfNeeded().catch(() => {});
  await row.click({ timeout: 7000, force: true });
}

async function selectLoginUser(page, name) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByText(name, { exact: true }).click({ timeout: 8000 });
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function writeReport() {
  const passed = results.filter((item) => item.status === "PASS").length;
  const failed = results.length - passed;
  const generatedAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const rows = results.map((item) => `
    <tr class="${item.status.toLowerCase()}">
      <td><strong>${htmlEscape(item.status)}</strong></td>
      <td>${htmlEscape(item.name)}</td>
      <td>${item.durationMs}ms</td>
      <td>${item.screenshot ? `<a href="${htmlEscape(item.screenshot)}">스크린샷</a>` : "-"}</td>
      <td><pre>${htmlEscape(item.error || "-")}</pre></td>
    </tr>
  `).join("");

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Issue 36 Final E2E QA Report</title>
  <style>
    body { margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #253047; background: #f5f7fb; }
    main { max-width: 1180px; margin: 0 auto; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
    .card { padding: 18px; border: 1px solid #dfe7f3; border-radius: 10px; background: #fff; }
    .card span { display: block; color: #66738a; font-size: 13px; }
    .card strong { display: block; margin-top: 6px; font-size: 26px; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 10px; background: #fff; }
    th, td { padding: 13px 14px; border-bottom: 1px solid #e7edf6; text-align: left; vertical-align: top; }
    th { color: #56627a; background: #f9fbfe; font-size: 13px; }
    tr.pass strong { color: #079b8f; }
    tr.fail strong { color: #e64b88; }
    pre { white-space: pre-wrap; margin: 0; max-width: 420px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
    a { color: #0a9ca4; font-weight: 700; }
    .note { line-height: 1.65; color: #526078; }
  </style>
</head>
<body>
  <main>
    <p class="note">Issue 36 · 최종 E2E Test</p>
    <h1>Roomory 해피패스 스모크 테스트 리포트</h1>
    <p class="note">깊은 엣지 케이스 대신 로그인, 홈, 방 관리, 기록 기능, 책 제작, 주문 조회, 운영자 주문 관리까지 주요 사용자 흐름을 빠르게 훑었습니다. 생성 시각: ${htmlEscape(generatedAt)}</p>
    <section class="summary">
      <div class="card"><span>대상 URL</span><strong>${htmlEscape(baseUrl)}</strong></div>
      <div class="card"><span>총 시나리오</span><strong>${results.length}</strong></div>
      <div class="card"><span>통과</span><strong>${passed}</strong></div>
      <div class="card"><span>실패</span><strong>${failed}</strong></div>
    </section>
    <table>
      <thead>
        <tr><th>결과</th><th>검증 항목</th><th>소요</th><th>증적</th><th>비고</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </main>
</body>
</html>`;

  await writeFile(path.join(reportDir, "AI_QA_REPORT.html"), html, "utf8");
  await writeFile(path.join(reportDir, "e2e-results.json"), JSON.stringify({ generatedAt, baseUrl, results }, null, 2), "utf8");
}

async function main() {
  await mkdir(evidenceDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.setDefaultTimeout(7000);

  await runStep(page, "일반 사용자 로그인과 메인 페이지", async () => {
    await selectLoginUser(page, "류성열");
    await waitText(page, "메인 페이지");
    await waitText(page, "참여 중인 방");
    await waitText(page, "날짜별 기록 흐름");
  });

  await runStep(page, "홈 캘린더 월 이동", async () => {
    await clickText(page, "다음 달", { exact: true });
    await waitText(page, "2026년 9월");
    await clickText(page, "이전 달", { exact: true });
    await waitText(page, "2026년 8월");
  });

  await runStep(page, "방 관리 대시보드", async () => {
    await clickNavLabel(page, "방 관리 대시보드");
    await waitText(page, "새 방 만들기");
    await waitText(page, "초대 받은 방");
    await waitText(page, "초대");
  });

  await runStep(page, "방 홈과 주요 기능 카드", async () => {
    await clickNavLabel(page, "우리 둘의 100일");
    await waitText(page, "최근 대화");
    await waitText(page, "채팅방으로 이동하기");
    await waitText(page, "방 기능");
    await waitText(page, "추억 게시판");
    await waitText(page, "미션 인증");
    await waitText(page, "편지");
  });

  await runStep(page, "채팅 해피패스", async () => {
    await clickNavLabel(page, "채팅");
    await waitText(page, "채팅");
    const input = page.locator("textarea, input").filter({ hasNotText: "" }).last();
    await page.getByPlaceholder(/메시지|입력/).fill("36번 E2E 스모크 테스트 메시지").catch(async () => {
      await input.fill("36번 E2E 스모크 테스트 메시지");
    });
    await clickText(page, "보내기", { exact: true });
    await waitText(page, "36번 E2E 스모크 테스트 메시지");
  });

  await runStep(page, "추억 게시판 진입", async () => {
    await clickNavLabel(page, "추억 게시판");
    await waitText(page, "추억 게시판");
  });

  await runStep(page, "미션 인증 진입과 집계", async () => {
    await clickNavLabel(page, "미션 인증");
    await waitText(page, "미션 인증");
    await waitText(page, "승인 대기");
  });

  await runStep(page, "편지 진입", async () => {
    await clickNavLabel(page, "편지");
    await waitText(page, "편지");
  });

  await runStep(page, "상품 안내 페이지", async () => {
    await openBookProducts(page);
    await waitMainText(page, "상품 안내");
    await waitMainText(page, "A4 소프트커버 포토북");
    await waitMainText(page, "A5 소프트커버 포토북");
  });

  await runStep(page, "책 만들기 미리보기 생성", async () => {
    await clickBookSubmenu(page, "책 만들기");
    await waitMainText(page, "책 만들기");
    await waitMainText(page, "책으로 만들 방을 선택하세요");
    await page.locator("main").getByText("우리 둘의 100일", { exact: true }).first().click({ force: true });
    await waitMainText(page, "인쇄 상품을 선택하세요", { timeout: 8000 });
    await page.locator("main").getByText("A4 소프트커버 포토북").first().click({ force: true });
    await waitMainText(page, "자동으로 불러올 기록 기간을 정하세요", { timeout: 8000 });
    await ensureContentTypeIncluded(page, "추억 게시글");
    await ensureContentTypeIncluded(page, "미션 인증");
    await clickText(page, "기록 불러오기", { exact: true });
    await waitText(page, "잠시만 기다려 주세요", { timeout: 5000 });
    await page.getByText("잠시만 기다려 주세요").waitFor({ state: "hidden", timeout: 12000 }).catch(async () => page.waitForTimeout(3500));
    await waitMainText(page, "책에 담을 기록을 고르세요", { timeout: 12000 });
    await maybeClickText(page, "현재 목록 전체 선택");
    await clickText(page, "미리보기/견적 계산", { exact: true });
    await waitText(page, "템플릿 기반 책 미리보기와 예상 견적을 계산하고 있습니다", { timeout: 5000 }).catch(() => {});
    await page.getByText("템플릿 기반 책 미리보기와 예상 견적을 계산하고 있습니다").waitFor({ state: "hidden", timeout: 12000 }).catch(async () => page.waitForTimeout(3000));
    await waitMainText(page, "템플릿 책 미리보기와 예상 견적", { timeout: 12000 });
    await waitMainText(page, "주문 요청하기");
  });

  await runStep(page, "주문 상태 테이블과 상세 모달", async () => {
    await clickBookSubmenu(page, "주문 상태");
    await waitMainText(page, "주문 상태");
    await waitMainText(page, "전체 데이터 CSV");
    await waitMainText(page, "필터링 데이터 CSV");
    await clickFirstOrderRow(page);
    await waitText(page, "주문 정보");
    await waitText(page, "진행 상태");
    await waitText(page, "상태 이력");
    await closeModal(page);
  });

  await runStep(page, "주문 내역 테이블과 상세 모달", async () => {
    await clickBookSubmenu(page, "주문 내역");
    await waitMainText(page, "주문 내역");
    await waitMainText(page, "전체 데이터 CSV");
    await clickFirstOrderRow(page);
    await waitText(page, "주문 정보");
    await waitText(page, "상태 이력");
    await closeModal(page);
  });

  await runStep(page, "운영자 로그인과 주문 관리", async () => {
    await page.evaluate(() => localStorage.clear());
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator(".member-select-card.operator").first().click({ timeout: 8000, force: true });
    await waitText(page, "책 주문 관리");
    await waitText(page, "전체 데이터 CSV");
    await waitText(page, "필터링 데이터 CSV");
    await clickFirstOrderRow(page);
    await waitText(page, "주문 정보");
    await waitText(page, "진행 상태");
    await waitText(page, "상태 이력");
  });

  await browser.close();
  await writeReport();
}

main().catch(async (error) => {
  results.push({ name: "테스트 러너", status: "FAIL", durationMs: 0, screenshot: "", error: error?.stack || String(error) });
  await writeReport();
  process.exitCode = 1;
});

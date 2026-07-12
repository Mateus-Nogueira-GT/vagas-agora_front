import { expect, test, type Page } from "@playwright/test"

const viewports = [
  { name: "compact", width: 320, height: 568 },
  { name: "iphone", width: 390, height: 844 },
  { name: "large", width: 430, height: 932 },
  { name: "tablet", width: 768, height: 1024 },
] as const

async function expectNoGlobalHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
}

for (const viewport of viewports) {
  test.describe(`${viewport.name} ${viewport.width}x${viewport.height}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
    })

    test("login permanece utilizável sem overflow", async ({ page }) => {
      await page.goto("/login")

      await expect(page.getByRole("heading", { name: "Fazer Login" })).toBeVisible()
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByRole("textbox", { name: "Senha" })).toBeVisible()

      const submit = page.getByRole("button", { name: "Entrar" })
      await expect(submit).toBeVisible()
      expect((await submit.boundingBox())?.height).toBeGreaterThanOrEqual(44)
      await expectNoGlobalHorizontalOverflow(page)
    })

    test("cadastro revela formulário com controles tocáveis", async ({ page }) => {
      await page.goto("/cadastro")
      await page.getByRole("button", { name: /Candidato/ }).click()

      await expect(page.getByLabel("Nome completo")).toBeVisible()
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByRole("textbox", { name: "Senha", exact: true })).toBeVisible()

      const submit = page.getByRole("button", { name: "Criar conta" })
      await expect(submit).toBeVisible()
      expect((await submit.boundingBox())?.height).toBeGreaterThanOrEqual(44)
      await expectNoGlobalHorizontalOverflow(page)
    })
  })
}

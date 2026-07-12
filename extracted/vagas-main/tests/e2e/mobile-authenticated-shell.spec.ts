import { expect, test } from "@playwright/test"

const roles = [
  { role: "candidato", route: "/candidato", dialog: "Menu de candidato" },
  { role: "empregador", route: "/empregador", dialog: "Menu de empregador" },
  { role: "admin", route: "/admin", dialog: "Menu de administração" },
] as const

for (const scenario of roles) {
  test(`shell mobile de ${scenario.role} abre sem overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript((role) => {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: `e2e-${role}`,
          email: `${role}@example.com`,
          nome: `Teste ${role}`,
          role,
          ativo: true,
        }),
      )
    }, scenario.role)

    await page.goto(scenario.route)

    const menuButton = page.getByRole("button", { name: "Abrir menu" })
    await expect(menuButton).toBeVisible()
    expect((await menuButton.boundingBox())?.height).toBeGreaterThanOrEqual(44)

    await menuButton.click()
    await expect(page.getByRole("dialog", { name: scenario.dialog })).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog", { name: scenario.dialog })).toBeHidden()
    await expect(menuButton).toBeFocused()
  })
}

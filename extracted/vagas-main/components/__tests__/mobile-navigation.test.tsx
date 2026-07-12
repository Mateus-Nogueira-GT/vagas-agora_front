/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Home } from "lucide-react"
import { MobileNavigation } from "@/components/mobile-navigation"

describe("MobileNavigation", () => {
  it("abre como diálogo acessível e fecha depois da navegação", async () => {
    const user = userEvent.setup()
    const onNavigate = jest.fn()
    const triggerLabel = "Abrir menu"

    render(
      <MobileNavigation
        accountLabel="candidato"
        accountName="Pessoa Teste"
        email="pessoa@example.com"
        avatarAlt="Foto do candidato"
        items={[{ name: "Início", href: "/candidato", icon: Home }]}
        isItemActive={() => true}
        onNavigate={onNavigate}
        onLogout={jest.fn()}
      />,
    )

    const trigger = screen.getByRole("button", { name: triggerLabel })
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    await user.click(trigger)

    expect(screen.getByRole("dialog", { name: "Menu de candidato" })).toBeVisible()
    expect(screen.getByRole("button", { name: "Fechar menu" })).toBeVisible()

    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: triggerLabel })).toHaveFocus()

    await user.click(screen.getByRole("button", { name: triggerLabel }))

    await user.click(screen.getByRole("link", { name: "Início" }))

    expect(onNavigate).toHaveBeenCalledWith("/candidato")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: triggerLabel })).toHaveFocus()
  })
})

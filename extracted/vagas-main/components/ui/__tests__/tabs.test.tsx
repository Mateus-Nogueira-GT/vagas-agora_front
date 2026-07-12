/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

describe("Tabs", () => {
  it("renderiza os gatilhos e alterna o conteúdo ativo", async () => {
    const user = userEvent.setup()

    render(
      <Tabs defaultValue="primeira">
        <TabsList aria-label="Etapas do formulário">
          <TabsTrigger value="primeira">Primeira</TabsTrigger>
          <TabsTrigger value="segunda">Segunda</TabsTrigger>
        </TabsList>
        <TabsContent value="primeira">Conteúdo inicial</TabsContent>
        <TabsContent value="segunda">Conteúdo seguinte</TabsContent>
      </Tabs>,
    )

    expect(screen.getByRole("tablist", { name: "Etapas do formulário" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Primeira" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Conteúdo inicial")).toBeVisible()

    await user.click(screen.getByRole("tab", { name: "Segunda" }))

    expect(screen.getByRole("tab", { name: "Segunda" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Conteúdo seguinte")).toBeVisible()
  })
})

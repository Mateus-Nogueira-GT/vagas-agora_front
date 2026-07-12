/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { ViewProvider, useView } from '../view-context'

function Consumer() {
  const { currentView, setView } = useView()

  return (
    <div>
      <span>{currentView}</span>
      <button onClick={() => setView('empregador')}>Alterar</button>
    </div>
  )
}

describe('ViewProvider', () => {
  it('fornece a visão padrão e permite alterá-la', async () => {
    const user = userEvent.setup()
    render(
      <ViewProvider>
        <Consumer />
      </ViewProvider>
    )

    expect(screen.getByText('candidato')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Alterar' }))
    expect(screen.getByText('empregador')).toBeInTheDocument()
  })

  it('falha de forma explícita fora do provider', () => {
    expect(() => render(<Consumer />)).toThrow('useView deve ser usado dentro de ViewProvider')
  })
})

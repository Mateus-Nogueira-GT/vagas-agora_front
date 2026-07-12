"use client"

import { useEffect, useRef } from "react"

// Tipos para os props dos gráficos
interface ChartData {
  [key: string]: any
}

interface AreaChartProps {
  data: ChartData[]
  xField: string
  yField: string
  color?: string
  gradientFrom?: string
  gradientTo?: string
  height?: number
}

// Componente de gráfico de área
export function AreaChart({
  data,
  xField,
  yField,
  color = "#4400CC",
  gradientFrom = "#4400CC",
  gradientTo = "#4400CC10",
  height = 300,
}: AreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const dpr = window.devicePixelRatio || 1

    // Configurar o canvas para alta resolução
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Encontrar o valor máximo para escala
    const maxValue = Math.max(...data.map((item: ChartData) => item[yField])) * 1.2

    // Calcular dimensões
    const padding = { top: 20, right: 20, bottom: 40, left: 40 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Desenhar eixos
    ctx.beginPath()
    ctx.strokeStyle = "#E5E7EB"
    ctx.lineWidth = 1
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, rect.height - padding.bottom)
    ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom)
    ctx.stroke()

    // Desenhar linhas de grade horizontais
    const gridLines = 5
    ctx.beginPath()
    ctx.strokeStyle = "#F3F4F6"
    ctx.lineWidth = 1
    for (let i = 1; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.moveTo(padding.left, y)
      ctx.lineTo(rect.width - padding.right, y)
    }
    ctx.stroke()

    // Desenhar rótulos do eixo X
    ctx.fillStyle = "#6B7280"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    const xStep = chartWidth / (data.length - 1)
    data.forEach((item, index) => {
      const x = padding.left + xStep * index
      const y = rect.height - padding.bottom + 15
      ctx.fillText(item[xField], x, y)
    })

    // Desenhar rótulos do eixo Y
    ctx.textAlign = "right"
    for (let i = 0; i <= gridLines; i++) {
      const value = maxValue - (maxValue / gridLines) * i
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.fillText(Math.round(value).toString(), padding.left - 10, y + 3)
    }

    // Criar gradiente para área
    const gradient = ctx.createLinearGradient(0, padding.top, 0, rect.height - padding.bottom)
    gradient.addColorStop(0, gradientFrom + "40") // 25% de opacidade
    gradient.addColorStop(1, gradientTo)

    // Desenhar área
    ctx.beginPath()
    data.forEach((item, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index
      const y = padding.top + chartHeight - (chartHeight * item[yField]) / maxValue
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.lineTo(padding.left + chartWidth, rect.height - padding.bottom)
    ctx.lineTo(padding.left, rect.height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Desenhar linha
    ctx.beginPath()
    data.forEach((item, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index
      const y = padding.top + chartHeight - (chartHeight * item[yField]) / maxValue
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // Desenhar pontos
    data.forEach((item, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index
      const y = padding.top + chartHeight - (chartHeight * item[yField]) / maxValue
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }, [data, xField, yField, color, gradientFrom, gradientTo])

  return <canvas ref={canvasRef} style={{ width: "100%", height: `${height}px` }} />
}

// Componente de gráfico de barras
export function BarChart({
  data,
  xField,
  yField,
  color = "#0057FF",
  gradientFrom = "#0057FF",
  gradientTo = "#0057FF10",
  height = 300,
}: AreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1

    // Configurar o canvas para alta resolução
    const rect = canvas.getBoundingClientRect()

    // Verificar se as dimensões são válidas
    if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Encontrar o valor máximo para escala - verificar se os valores são números válidos
    const validData = data.filter((item: ChartData) =>
      item[yField] != null &&
      typeof item[yField] === 'number' &&
      isFinite(item[yField])
    )

    if (validData.length === 0) return

    const maxValue = Math.max(...validData.map((item: ChartData) => item[yField])) * 1.2

    // Verificar se maxValue é um número finito válido
    if (!isFinite(maxValue) || maxValue <= 0) return

    // Calcular dimensões
    const padding = { top: 20, right: 20, bottom: 60, left: 40 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Verificar se as dimensões do gráfico são válidas
    if (chartWidth <= 0 || chartHeight <= 0) return

    // Desenhar eixos
    ctx.beginPath()
    ctx.strokeStyle = "#E5E7EB"
    ctx.lineWidth = 1
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, rect.height - padding.bottom)
    ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom)
    ctx.stroke()

    // Desenhar linhas de grade horizontais
    const gridLines = 5
    ctx.beginPath()
    ctx.strokeStyle = "#F3F4F6"
    ctx.lineWidth = 1
    for (let i = 1; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.moveTo(padding.left, y)
      ctx.lineTo(rect.width - padding.right, y)
    }
    ctx.stroke()

    // Desenhar rótulos do eixo Y
    ctx.fillStyle = "#6B7280"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "right"
    for (let i = 0; i <= gridLines; i++) {
      const value = maxValue - (maxValue / gridLines) * i
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.fillText(Math.round(value).toString(), padding.left - 10, y + 3)
    }

    // Desenhar barras e rótulos do eixo X
    const barWidth = (chartWidth / validData.length) * 0.6
    const barSpacing = (chartWidth / validData.length) * 0.4
    const barOffset = (chartWidth / validData.length - barWidth) / 2

    validData.forEach((item, index) => {
      // Verificar se o valor do item é válido
      const itemValue = item[yField]
      if (!isFinite(itemValue)) return

      // Calcular posições com valores seguros
      const barHeight = Math.max(0, (chartHeight * itemValue) / maxValue)
      const y = rect.height - padding.bottom - barHeight

      // Verificar se as coordenadas do gradiente são válidas
      const gradientY1 = rect.height - padding.bottom
      const gradientY2 = padding.top + chartHeight - barHeight

      if (!isFinite(gradientY1) || !isFinite(gradientY2)) return

      // Criar gradiente para barra
      const gradient = ctx.createLinearGradient(0, gradientY1, 0, gradientY2)
      gradient.addColorStop(0, gradientTo)
      gradient.addColorStop(1, gradientFrom)

      // Desenhar barra
      const x = padding.left + (chartWidth / validData.length) * index + barOffset

      // Barra com cantos arredondados
      const radius = 4
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + barWidth - radius, y)
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
      ctx.lineTo(x + barWidth, rect.height - padding.bottom)
      ctx.lineTo(x, rect.height - padding.bottom)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Desenhar rótulo do eixo X
      ctx.fillStyle = "#6B7280"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.save()
      const labelX = x + barWidth / 2
      const labelY = rect.height - padding.bottom + 15
      ctx.translate(labelX, labelY)
      ctx.rotate(-Math.PI / 4) // Rotacionar para texto diagonal
      const label = item[xField].length > 15 ? item[xField].substring(0, 15) + "..." : item[xField]
      ctx.fillText(label, 0, 0)
      ctx.restore()

      // Desenhar valor acima da barra
      ctx.fillStyle = color
      ctx.textAlign = "center"
      ctx.fillText(itemValue.toString(), x + barWidth / 2, y - 5)
    })
  }, [data, xField, yField, color, gradientFrom, gradientTo])

  return <canvas ref={canvasRef} style={{ width: "100%", height: `${height}px` }} />
}

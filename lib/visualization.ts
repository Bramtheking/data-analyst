export interface DataPoint {
  x: number
  y: number
  label?: string
}

export interface ChartConfig {
  width?: number
  height?: number
  title?: string
  xLabel?: string
  yLabel?: string
  showRegression?: boolean
  regressionColor?: string
}

export function generateScatterPlot(data: DataPoint[], config: ChartConfig = {}): string {
  const {
    width = 600,
    height = 400,
    title = "Scatter Plot",
    xLabel = "X Axis",
    yLabel = "Y Axis",
    showRegression = false,
    regressionColor = "#ff0000",
  } = config

  const margin = { top: 60, right: 40, bottom: 60, left: 60 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // Calculate data bounds
  const xMin = Math.min(...data.map((d) => d.x))
  const xMax = Math.max(...data.map((d) => d.x))
  const yMin = Math.min(...data.map((d) => d.y))
  const yMax = Math.max(...data.map((d) => d.y))

  // Add padding to bounds
  const xPadding = (xMax - xMin) * 0.1
  const yPadding = (yMax - yMin) * 0.1
  const xRange = [xMin - xPadding, xMax + xPadding]
  const yRange = [yMin - yPadding, yMax + yPadding]

  // Scale functions
  const scaleX = (x: number) => ((x - xRange[0]) / (xRange[1] - xRange[0])) * chartWidth
  const scaleY = (y: number) => chartHeight - ((y - yRange[0]) / (yRange[1] - yRange[0])) * chartHeight

  // Generate regression line if requested
  let regressionLine = ""
  if (showRegression && data.length > 1) {
    const { slope, intercept } = calculateLinearRegression(data)
    const x1 = xRange[0]
    const y1 = slope * x1 + intercept
    const x2 = xRange[1]
    const y2 = slope * x2 + intercept

    regressionLine = `
      <line x1="${scaleX(x1)}" y1="${scaleY(y1)}" 
            x2="${scaleX(x2)}" y2="${scaleY(y2)}" 
            stroke="${regressionColor}" stroke-width="2" stroke-dasharray="5,5" />
    `
  }

  // Generate axis ticks
  const xTicks = generateTicks(xRange[0], xRange[1], 5)
  const yTicks = generateTicks(yRange[0], yRange[1], 5)

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      
      <!-- Title -->
      <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">${title}</text>
      
      <!-- Chart area background -->
      <rect x="${margin.left}" y="${margin.top}" width="${chartWidth}" height="${chartHeight}" 
            fill="none" stroke="#e0e0e0" stroke-width="1"/>
      
      <!-- X-axis -->
      <line x1="${margin.left}" y1="${margin.top + chartHeight}" 
            x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" 
            stroke="#333" stroke-width="1"/>
      
      <!-- Y-axis -->
      <line x1="${margin.left}" y1="${margin.top}" 
            x2="${margin.left}" y2="${margin.top + chartHeight}" 
            stroke="#333" stroke-width="1"/>
      
      <!-- X-axis ticks and labels -->
      ${xTicks
        .map(
          (tick) => `
        <line x1="${margin.left + scaleX(tick)}" y1="${margin.top + chartHeight}" 
              x2="${margin.left + scaleX(tick)}" y2="${margin.top + chartHeight + 5}" 
              stroke="#333" stroke-width="1"/>
        <text x="${margin.left + scaleX(tick)}" y="${margin.top + chartHeight + 20}" 
              text-anchor="middle" font-family="Arial" font-size="12">${tick.toFixed(1)}</text>
      `,
        )
        .join("")}
      
      <!-- Y-axis ticks and labels -->
      ${yTicks
        .map(
          (tick) => `
        <line x1="${margin.left - 5}" y1="${margin.top + scaleY(tick)}" 
              x2="${margin.left}" y2="${margin.top + scaleY(tick)}" 
              stroke="#333" stroke-width="1"/>
        <text x="${margin.left - 10}" y="${margin.top + scaleY(tick) + 4}" 
              text-anchor="end" font-family="Arial" font-size="12">${tick.toFixed(1)}</text>
      `,
        )
        .join("")}
      
      <!-- Axis labels -->
      <text x="${margin.left + chartWidth / 2}" y="${height - 10}" 
            text-anchor="middle" font-family="Arial" font-size="14">${xLabel}</text>
      <text x="20" y="${margin.top + chartHeight / 2}" 
            text-anchor="middle" font-family="Arial" font-size="14" 
            transform="rotate(-90, 20, ${margin.top + chartHeight / 2})">${yLabel}</text>
      
      <!-- Data points -->
      ${data
        .map(
          (point) => `
        <circle cx="${margin.left + scaleX(point.x)}" cy="${margin.top + scaleY(point.y)}" 
                r="4" fill="#2563eb" stroke="#1e40af" stroke-width="1"/>
      `,
        )
        .join("")}
      
      <!-- Regression line -->
      ${regressionLine}
    </svg>
  `

  return svgToBase64DataUri(svg)
}

export function generateBarChart(data: Array<{ label: string; value: number }>, config: ChartConfig = {}): string {
  const { width = 600, height = 400, title = "Bar Chart", yLabel = "Value" } = config

  const margin = { top: 60, right: 40, bottom: 80, left: 60 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const maxValue = Math.max(...data.map((d) => d.value))
  const barWidth = (chartWidth / data.length) * 0.8
  const barSpacing = (chartWidth / data.length) * 0.2

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      
      <!-- Title -->
      <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">${title}</text>
      
      <!-- Chart area -->
      <rect x="${margin.left}" y="${margin.top}" width="${chartWidth}" height="${chartHeight}" 
            fill="none" stroke="#e0e0e0" stroke-width="1"/>
      
      <!-- Y-axis -->
      <line x1="${margin.left}" y1="${margin.top}" 
            x2="${margin.left}" y2="${margin.top + chartHeight}" 
            stroke="#333" stroke-width="1"/>
      
      <!-- X-axis -->
      <line x1="${margin.left}" y1="${margin.top + chartHeight}" 
            x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" 
            stroke="#333" stroke-width="1"/>
      
      <!-- Bars -->
      ${data
        .map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight
          const x = margin.left + (index * chartWidth) / data.length + barSpacing / 2
          const y = margin.top + chartHeight - barHeight

          return `
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
                fill="#2563eb" stroke="#1e40af" stroke-width="1"/>
          <text x="${x + barWidth / 2}" y="${margin.top + chartHeight + 20}" 
                text-anchor="middle" font-family="Arial" font-size="12">${item.label}</text>
          <text x="${x + barWidth / 2}" y="${y - 5}" 
                text-anchor="middle" font-family="Arial" font-size="10">${item.value}</text>
        `
        })
        .join("")}
      
      <!-- Y-axis label -->
      <text x="20" y="${margin.top + chartHeight / 2}" 
            text-anchor="middle" font-family="Arial" font-size="14" 
            transform="rotate(-90, 20, ${margin.top + chartHeight / 2})">${yLabel}</text>
    </svg>
  `

  return svgToBase64DataUri(svg)
}

function calculateLinearRegression(data: DataPoint[]): { slope: number; intercept: number } {
  const n = data.length
  const sumX = data.reduce((sum, point) => sum + point.x, 0)
  const sumY = data.reduce((sum, point) => sum + point.y, 0)
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

function generateTicks(min: number, max: number, count: number): number[] {
  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, i) => min + i * step)
}

function svgToBase64DataUri(svg: string): string {
  const base64 = Buffer.from(svg).toString("base64")
  return `data:image/svg+xml;base64,${base64}`
}

// Legacy functions for backward compatibility
export function generateVisualizationPlaceholder(type = "scatter"): string {
  const sampleData = [
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 3 },
    { x: 4, y: 5 },
    { x: 5, y: 6 },
  ]

  if (type === "scatter") {
    return generateScatterPlot(sampleData, { title: "Sample Scatter Plot" })
  }

  return generateScatterPlot(sampleData)
}

export function createScatterPlot(data: Array<{ x: number; y: number }>, title = "Scatter Plot"): string {
  return generateScatterPlot(data, { title, showRegression: true })
}

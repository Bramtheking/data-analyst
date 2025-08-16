import { type NextRequest, NextResponse } from "next/server"
import { analyzeWithGemini } from "@/lib/gemini"
import {
  formatAnalysisResponse,
  validateResponseFormat,
  sanitizeResponse,
  createErrorResponse,
  createTimeoutResponse,
} from "@/lib/response-formatter"
import { WikipediaScraper } from "@/lib/scrapers/wikipedia-scraper"
import { DuckDBClient } from "@/lib/database/duckdb-client"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.text()
    const analysisTask = body.trim()

    if (!analysisTask) {
      const executionTime = Date.now() - startTime
      const errorResponse = createErrorResponse("Analysis task is required", executionTime)
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const scraper = new WikipediaScraper()
    const dbClient = new DuckDBClient()

    console.log("[API] Starting data analysis pipeline...")
    console.log("[API] Task:", analysisTask.substring(0, 100) + "...")

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), 3 * 60 * 1000) // 3 minutes
    })

    try {
      if (analysisTask.toLowerCase().includes("wikipedia")) {
        await scraper.scrapeGenericData("https://en.wikipedia.org/wiki/List_of_highest-grossing_films")
      }

      if (analysisTask.toLowerCase().includes("court") || analysisTask.toLowerCase().includes("judgment")) {
        await dbClient.installExtension("httpfs")
        await dbClient.loadParquetFromS3("s3://indian-high-court-judgments/metadata/parquet/")
      }

      const analysisResult = await Promise.race([analyzeWithGemini(analysisTask), timeoutPromise])

      const executionTime = Date.now() - startTime

      const sanitizedResult = sanitizeResponse(analysisResult)
      const validation = validateResponseFormat(sanitizedResult)

      if (!validation.isValid) {
        console.warn("Response validation failed:", validation.errors)
        const errorResponse = createErrorResponse(
          `Invalid response format: ${validation.errors.join(", ")}`,
          executionTime,
        )
        return NextResponse.json(errorResponse, { status: 500 })
      }

      if (validation.warnings.length > 0) {
        console.warn("Response validation warnings:", validation.warnings)
      }

      const formattedResponse = formatAnalysisResponse(sanitizedResult, executionTime)
      return NextResponse.json(formattedResponse)
    } catch (analysisError: any) {
      const executionTime = Date.now() - startTime

      if (analysisError.message === "TIMEOUT") {
        const timeoutResponse = createTimeoutResponse(executionTime)
        return NextResponse.json(timeoutResponse, { status: 408 })
      }

      throw analysisError
    }
  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error("API Error:", error)
    const errorResponse = createErrorResponse("Internal server error", executionTime)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Data Analyst Agent API",
    status: "active",
    endpoint: "/api/analyze",
    method: "POST",
  })
}

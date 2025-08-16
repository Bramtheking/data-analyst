"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [task, setTask] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!task.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: task,
        headers: {
          "Content-Type": "text/plain",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({ success: false, error: "Failed to analyze data" })
    } finally {
      setLoading(false)
    }
  }

  const renderResult = (result: any) => {
    if (!result) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "Success" : "Error"}</Badge>
          {result.executionTime && <Badge variant="outline">{result.executionTime}ms</Badge>}
          {result.timestamp && (
            <span className="text-sm text-muted-foreground">{new Date(result.timestamp).toLocaleTimeString()}</span>
          )}
        </div>

        {result.success && result.data ? (
          <div>
            <h4 className="font-semibold mb-2">Analysis Results:</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        ) : result.error ? (
          <div>
            <h4 className="font-semibold mb-2 text-destructive">Error:</h4>
            <p className="text-destructive">{result.error}</p>
          </div>
        ) : (
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Data Analyst Agent</h1>
          <p className="text-xl text-muted-foreground">AI-powered data analysis, visualization, and insights</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Task</CardTitle>
            <CardDescription>
              Describe your data analysis task. The AI will handle data sourcing, analysis, and visualization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: Scrape the list of highest grossing films from Wikipedia and analyze the correlation between rank and peak..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <Button onClick={handleAnalyze} disabled={loading || !task.trim()} className="w-full">
              {loading ? "Analyzing..." : "Analyze Data"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>{renderResult(result)}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>API Endpoint</CardTitle>
            <CardDescription>Use this endpoint for programmatic access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm">
                POST /api/analyze
                <br />
                Content-Type: text/plain
                <br />
                Body: Your analysis task description
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

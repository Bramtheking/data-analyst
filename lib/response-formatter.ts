export interface AnalysisResponse {
  success: boolean
  data?: any
  error?: string
  executionTime?: number
  timestamp?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function formatAnalysisResponse(
  data: any,
  executionTime: number,
  success = true,
  error?: string,
): AnalysisResponse {
  const response: AnalysisResponse = {
    success,
    timestamp: new Date().toISOString(),
    executionTime: Math.round(executionTime),
  }

  if (success && data !== undefined) {
    response.data = data
  }

  if (!success && error) {
    response.error = error
  }

  return response
}

export function validateResponseFormat(data: any, expectedFormat: "array" | "object" = "array"): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  }

  if (data === null || data === undefined) {
    result.isValid = false
    result.errors.push("Response data is null or undefined")
    return result
  }

  if (expectedFormat === "array") {
    if (!Array.isArray(data)) {
      result.isValid = false
      result.errors.push("Expected array format but received " + typeof data)
      return result
    }

    // Validate array structure based on common patterns
    if (data.length === 4) {
      // Standard 4-element response format
      validateFourElementResponse(data, result)
    } else if (data.length > 0) {
      result.warnings.push(`Unusual array length: ${data.length}. Expected 4 elements for standard format.`)
    }
  } else if (expectedFormat === "object") {
    if (typeof data !== "object" || Array.isArray(data)) {
      result.isValid = false
      result.errors.push("Expected object format but received " + (Array.isArray(data) ? "array" : typeof data))
      return result
    }

    validateObjectResponse(data, result)
  }

  return result
}

function validateFourElementResponse(data: any[], result: ValidationResult): void {
  // Element 1 & 2: Can be strings or numbers (answers)
  if (data[0] === null || data[0] === undefined) {
    result.warnings.push("First element is null/undefined")
  }

  if (data[1] === null || data[1] === undefined) {
    result.warnings.push("Second element is null/undefined")
  }

  // Element 3: Should be a number (correlation coefficient)
  if (typeof data[2] !== "number") {
    result.warnings.push("Third element should be a number (correlation coefficient)")
  } else if (data[2] < -1 || data[2] > 1) {
    result.warnings.push("Third element appears to be a correlation coefficient but is outside [-1, 1] range")
  }

  // Element 4: Should be a data URI for visualization
  if (typeof data[3] !== "string") {
    result.warnings.push("Fourth element should be a string (data URI)")
  } else if (!data[3].startsWith("data:image/")) {
    result.warnings.push('Fourth element should be a data URI starting with "data:image/"')
  }
}

function validateObjectResponse(data: any, result: ValidationResult): void {
  const keys = Object.keys(data)

  if (keys.length === 0) {
    result.warnings.push("Response object is empty")
    return
  }

  // Check for visualization fields
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && value.startsWith("data:image/")) {
      // This looks like a visualization
      continue
    } else if (typeof value === "number" && Math.abs(value) <= 1) {
      // This might be a correlation coefficient
      continue
    } else if (typeof value === "string" || typeof value === "number") {
      // Regular answer
      continue
    } else {
      result.warnings.push(`Unexpected value type for key "${key}": ${typeof value}`)
    }
  }
}

export function sanitizeResponse(data: any): any {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeItem(item))
  } else if (typeof data === "object" && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeItem(value)
    }
    return sanitized
  }
  return sanitizeItem(data)
}

function sanitizeItem(item: any): any {
  if (typeof item === "string") {
    // Ensure data URIs are properly formatted
    if (item.includes("data:image/") && !item.startsWith("data:image/")) {
      const dataIndex = item.indexOf("data:image/")
      if (dataIndex > 0) {
        return item.substring(dataIndex)
      }
    }
    // Remove any potential script tags or dangerous content
    return item.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  } else if (typeof item === "number") {
    // Ensure numbers are finite
    return isFinite(item) ? item : 0
  }
  return item
}

export function createErrorResponse(error: string, executionTime = 0): AnalysisResponse {
  return formatAnalysisResponse(null, executionTime, false, error)
}

export function createTimeoutResponse(executionTime: number): AnalysisResponse {
  return createErrorResponse("Analysis timed out. Tasks must complete within 3 minutes.", executionTime)
}

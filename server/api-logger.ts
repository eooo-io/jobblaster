import { storage } from "./storage";
import { getCurrentUserId } from "./auth";
import type { Request } from "express";

interface ApiCallOptions {
  service: string;
  endpoint: string;
  method: string;
  requestData?: any;
  userId?: number;
}

export async function logApiCall(
  options: ApiCallOptions,
  apiCall: () => Promise<Response>
): Promise<Response> {
  const startTime = Date.now();
  let response: Response;
  let success = false;
  let responseData: any = null;
  let errorMessage: string | null = null;

  try {
    response = await apiCall();
    success = response.ok;
    
    // Try to parse response data
    try {
      const responseText = await response.clone().text();
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      // If parsing fails, store as text
      responseData = await response.clone().text();
    }
    
    if (!success) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error) {
    success = false;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Create a mock response for the error case
    response = new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      statusText: 'Internal Server Error'
    });
  }

  const responseTime = Date.now() - startTime;

  // Log to database if userId is available
  if (options.userId) {
    try {
      await storage.createExternalLog({
        userId: options.userId,
        service: options.service,
        endpoint: options.endpoint,
        method: options.method,
        requestData: options.requestData || null,
        responseStatus: response.status,
        responseData: responseData,
        responseTime,
        success,
        errorMessage
      });
    } catch (logError) {
      console.error('Failed to log API call:', logError);
    }
  }

  return response;
}

// Helper function to extract userId from request
export function logApiCallFromRequest(
  req: Request,
  options: Omit<ApiCallOptions, 'userId'>,
  apiCall: () => Promise<Response>
): Promise<Response> {
  const userId = getCurrentUserId(req);
  return logApiCall({ ...options, userId: userId || undefined }, apiCall);
}
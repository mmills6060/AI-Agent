// For server-side API routes, we need to use a proper backend URL
// In production, we can use the internal service name or the ALB
export const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"


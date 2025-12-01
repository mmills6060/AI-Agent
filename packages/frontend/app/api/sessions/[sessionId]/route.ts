const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> | { sessionId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { sessionId } = resolvedParams

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch session",
          details: errorText 
        }),
        { 
          status: backendResponse.status,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    const data = await backendResponse.json()
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch session",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}


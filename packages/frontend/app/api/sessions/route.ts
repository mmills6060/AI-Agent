import { BACKEND_URL } from "@/lib/constants"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") || "100"

    const backendResponse = await fetch(`${BACKEND_URL}/api/sessions?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch sessions",
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
        error: "Failed to fetch sessions",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}


import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { getConversationById } from "../../../../models/Conversation"

export async function GET(req, { params }) {
  try {
    const conversationId = params.id

    if (!conversationId) {
      return new Response(JSON.stringify({ error: "Conversation ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get user from token
    const authToken = cookies().get("auth_token")?.value

    if (!authToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      const decoded = verify(authToken, process.env.JWT_SECRET)
      const userId = decoded.id

      const conversation = await getConversationById(conversationId, userId)

      return new Response(JSON.stringify({ conversation }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("Get conversation error:", error)
      return new Response(JSON.stringify({ error: error.message || "Failed to get conversation" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Get conversation error:", error)
    return new Response(JSON.stringify({ error: "Failed to get conversation" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


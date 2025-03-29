import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { getConversationsByUserId, deleteConversation } from "../../../models/Conversation"

export async function GET() {
  try {
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

      const conversations = await getConversationsByUserId(userId)

      return new Response(JSON.stringify({ conversations }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("Token verification failed:", error)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Fetch conversations error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch conversations" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Update the DELETE method to properly handle the conversation ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("id")

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

      await deleteConversation(conversationId, userId)

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("Delete conversation error:", error)
      return new Response(JSON.stringify({ error: error.message || "Failed to delete conversation" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Delete conversation error:", error)
    return new Response(JSON.stringify({ error: "Failed to delete conversation" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


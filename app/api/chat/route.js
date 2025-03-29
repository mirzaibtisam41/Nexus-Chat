import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { saveConversation, updateConversation, getConversationById } from "../../../models/Conversation"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Gemini API key
const GEMINI_API_KEY = "AIzaSyDOWWVJkcd7XhrWgND1RJ5bAI_LHWjzHp0"

// Gemini API URLs
const GEMINI_TEXT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
const GEMINI_VISION_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

export async function POST(req) {
  try {
    const body = await req.json()
    const { messages, conversationId } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Valid messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get user from token
    let userId = null
    const authToken = cookies().get("auth_token")?.value

    if (authToken) {
      try {
        const decoded = verify(authToken, process.env.JWT_SECRET)
        userId = decoded.id
      } catch (error) {
        console.error("Token verification failed:", error)
        // Continue without user authentication - will not save conversation
      }
    }

    // If conversationId is provided, verify it exists and belongs to the user
    if (conversationId && userId) {
      try {
        await getConversationById(conversationId, userId)
      } catch (error) {
        console.error("Error verifying conversation:", error)
        return new Response(JSON.stringify({ error: "Invalid conversation ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    // Check if the message contains an image
    const hasImage = messages.some(
      (msg) => Array.isArray(msg.content) && msg.content.some((content) => content.type === "image_url"),
    )

    // Convert chat messages to Gemini format
    const geminiMessages = convertToGeminiFormat(messages)

    let apiResponse

    try {
      if (hasImage) {
        // Use vision model for image messages
        apiResponse = await fetch(GEMINI_VISION_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        })
      } else {
        // Use text model for regular messages
        apiResponse = await fetch(GEMINI_TEXT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        })
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return new Response(
        JSON.stringify({
          error: "Failed to connect to AI service. Please try again later.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json()
      console.error("Gemini API error:", errorData)
      return new Response(
        JSON.stringify({
          error: errorData.error?.message || "Failed to generate response",
        }),
        {
          status: apiResponse.status,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const data = await apiResponse.json()

    // Extract the response text from Gemini API response
    let responseText = ""
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      responseText = data.candidates[0].content.parts
        .filter((part) => part.text)
        .map((part) => part.text)
        .join("\n")
    }

    if (!responseText) {
      return new Response(
        JSON.stringify({
          error: "No response generated. Please try again.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Save the conversation if user is authenticated
    if (userId) {
      try {
        // Format messages for storage
        let updatedMessages

        if (hasImage) {
          // For image messages, we need to handle them differently
          const lastMessage = messages[messages.length - 1]
          updatedMessages = [
            ...messages.slice(0, -1),
            {
              role: "user",
              content: Array.isArray(lastMessage.content)
                ? lastMessage.content.find((part) => part.type === "text")?.text || "What's in this image?"
                : lastMessage.content,
            },
            { role: "assistant", content: responseText },
          ]
        } else {
          updatedMessages = [...messages, { role: "assistant", content: responseText }]
        }

        if (conversationId) {
          await updateConversation(conversationId, updatedMessages)
        } else {
          await saveConversation(userId, updatedMessages)
        }
      } catch (error) {
        console.error("Error saving conversation:", error)
        // Continue without saving - don't interrupt the user experience
      }
    }

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Helper function to convert chat messages to Gemini API format
function convertToGeminiFormat(messages) {
  const geminiMessages = []

  for (const message of messages) {
    const geminiMessage = {
      role: message.role === "user" ? "user" : "model",
      parts: [],
    }

    // Handle different message content formats
    if (Array.isArray(message.content)) {
      // This is a message with image
      for (const part of message.content) {
        if (part.type === "text") {
          geminiMessage.parts.push({ text: part.text })
        } else if (part.type === "image_url" && part.image_url.url) {
          // Extract base64 data from the URL
          const base64Data = part.image_url.url.split(",")[1]
          if (base64Data) {
            geminiMessage.parts.push({
              inline_data: {
                mime_type: "image/jpeg", // Adjust based on actual image type
                data: base64Data,
              },
            })
          }
        }
      }
    } else {
      // Regular text message
      geminiMessage.parts.push({ text: message.content })
    }

    geminiMessages.push(geminiMessage)
  }

  return geminiMessages
}


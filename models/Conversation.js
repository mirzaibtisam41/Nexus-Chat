import { ObjectId } from "mongodb"
import clientPromise from "../lib/mongodb"

export async function saveConversation(userId, messages) {
  if (!userId || !messages || !Array.isArray(messages)) {
    throw new Error("Valid userId and messages array are required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Process messages to ensure they can be stored in MongoDB
    const processedMessages = messages.map((message) => {
      // If the message content is an array (for image messages),
      // convert it to a storable format
      if (Array.isArray(message.content)) {
        return {
          ...message,
          content: JSON.stringify(message.content),
          hasImage: true,
        }
      }
      return message
    })

    const result = await db.collection("conversations").insertOne({
      userId: new ObjectId(userId),
      messages: processedMessages,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return { ...result, _id: result.insertedId }
  } catch (error) {
    console.error("Error saving conversation:", error)
    throw error
  }
}

export async function updateConversation(conversationId, messages) {
  if (!conversationId || !messages || !Array.isArray(messages)) {
    throw new Error("Valid conversationId and messages array are required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Process messages to ensure they can be stored in MongoDB
    const processedMessages = messages.map((message) => {
      // If the message content is an array (for image messages),
      // convert it to a storable format
      if (Array.isArray(message.content)) {
        return {
          ...message,
          content: JSON.stringify(message.content),
          hasImage: true,
        }
      }
      return message
    })

    const result = await db.collection("conversations").updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          messages: processedMessages,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      throw new Error("Conversation not found")
    }

    return result
  } catch (error) {
    console.error("Error updating conversation:", error)
    throw error
  }
}

export async function getConversationsByUserId(userId) {
  if (!userId) {
    throw new Error("UserId is required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const conversations = await db
      .collection("conversations")
      .find({ userId: new ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .toArray()

    // Process messages to handle stored image content
    return conversations.map((conversation) => {
      return {
        ...conversation,
        messages: conversation.messages.map((message) => {
          if (message.hasImage) {
            // For messages with images, parse the content back to an array
            // but remove the actual image data to reduce payload size
            try {
              const parsedContent = JSON.parse(message.content)
              // Remove large image data from the response
              const sanitizedContent = parsedContent.map((part) => {
                if (part.type === "image_url") {
                  return {
                    type: "image_url",
                    image_url: { url: "[IMAGE]" },
                  }
                }
                return part
              })
              return {
                ...message,
                content: message.role === "user" ? "Sent an image" : message.content,
              }
            } catch (e) {
              console.error("Error parsing message content:", e)
              return message
            }
          }
          return message
        }),
      }
    })
  } catch (error) {
    console.error("Error getting conversations by userId:", error)
    throw error
  }
}

export async function getConversationById(id, userId = null) {
  if (!id) {
    throw new Error("Conversation ID is required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const query = { _id: new ObjectId(id) }

    // If userId is provided, ensure the conversation belongs to this user
    if (userId) {
      query.userId = new ObjectId(userId)
    }

    const conversation = await db.collection("conversations").findOne(query)

    if (!conversation) {
      throw new Error("Conversation not found")
    }

    // Process messages to handle stored image content
    return {
      ...conversation,
      messages: conversation.messages.map((message) => {
        if (message.hasImage) {
          // For messages with images, parse the content back to an array
          try {
            const parsedContent = JSON.parse(message.content)
            return {
              ...message,
              content: parsedContent,
            }
          } catch (e) {
            console.error("Error parsing message content:", e)
            return message
          }
        }
        return message
      }),
    }
  } catch (error) {
    console.error("Error getting conversation by id:", error)
    throw error
  }
}

export async function deleteConversation(id, userId) {
  if (!id || !userId) {
    throw new Error("Conversation ID and User ID are required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("conversations").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      throw new Error("Conversation not found or not authorized to delete")
    }

    return result
  } catch (error) {
    console.error("Error deleting conversation:", error)
    throw error
  }
}


import { cookies } from "next/headers"
import { verify, sign } from "jsonwebtoken"
import { updateUser } from "../../../../models/User"

export async function POST(req) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name || name.trim() === "") {
      return new Response(JSON.stringify({ error: "Name is required" }), {
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

      await updateUser(userId, { name })

      // Update the token with the new name
      const newToken = sign(
        {
          id: userId,
          email: decoded.email,
          name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )

      // Set cookie
      cookies().set({
        name: "auth_token",
        value: newToken,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
      })

      return new Response(JSON.stringify({ success: true, name }), {
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
    console.error("Update user error:", error)
    return new Response(JSON.stringify({ error: "Failed to update user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


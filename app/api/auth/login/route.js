import { findUserByEmail, validatePassword } from "../../../../models/User"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validate inputs
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Find user
    const user = await findUserByEmail(email)
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate password
    const isValid = await validatePassword(user, password)
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create token
    const token = sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Set cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Login error:", error)
    return new Response(JSON.stringify({ error: "Failed to login" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


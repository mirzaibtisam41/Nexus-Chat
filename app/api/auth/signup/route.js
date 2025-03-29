import { createUser, findUserByEmail } from "../../../../models/User"

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // Validate inputs
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "Name, email, and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User with this email already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create new user
    const result = await createUser({ name, email, password })

    return new Response(JSON.stringify({ success: true, message: "User created successfully" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return new Response(JSON.stringify({ error: error.message || "Failed to create user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


import { cookies } from "next/headers"

export async function POST() {
  cookies().set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 0,
  })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}


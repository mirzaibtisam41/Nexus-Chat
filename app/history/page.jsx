"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, ArrowLeft, MessageSquare, Trash } from "lucide-react"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchConversations() {
      if (user) {
        try {
          setIsLoading(true)
          const res = await fetch("/api/conversations")

          if (!res.ok) {
            throw new Error("Failed to fetch conversations")
          }

          const data = await res.json()
          setConversations(data.conversations || [])
        } catch (error) {
          console.error("Error fetching conversations:", error)
          setError("Failed to load conversations")
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchConversations()
  }, [user])

  const handleDeleteConversation = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const res = await fetch(`/api/conversations?id=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete conversation")
      }

      // Update the conversations list
      setConversations(conversations.filter((conv) => conv._id !== id))
    } catch (error) {
      console.error("Error deleting conversation:", error)
      setError("Failed to delete conversation")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 dark:border-slate-700">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Bot className="h-6 w-6" />
            <span>NexusChat</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => document.documentElement.classList.toggle("dark")}>
              Toggle Theme
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Conversation History</h1>
            <Link href="/chat">
              <Button className="gap-2">
                <MessageSquare className="h-4 w-4" />
                New Chat
              </Button>
            </Link>
          </div>

          {error && <div className="p-3 bg-destructive/15 text-destructive rounded-md text-center">{error}</div>}

          <Card>
            <CardHeader>
              <CardTitle>All Conversations</CardTitle>
              <CardDescription>Browse through all your past conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              ) : conversations.length > 0 ? (
                <ul className="space-y-2 divide-y">
                  {conversations.map((conversation) => (
                    <li key={conversation._id} className="py-2">
                      <Link href={`/chat?id=${conversation._id}`}>
                        <div className="p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {conversation.messages[0]?.content.substring(0, 60) || "New Conversation"}...
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <span>{new Date(conversation.updatedAt).toLocaleString()}</span>
                              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                              <span>{conversation.messages.length} messages</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDeleteConversation(conversation._id, e)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a new chat to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container flex justify-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} NexusChat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}


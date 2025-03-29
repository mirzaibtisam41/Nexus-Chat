"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, ArrowLeft, Trash } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/hooks/use-toast"

export default function ChatPage() {
  const messagesEndRef = useRef(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("id")

  const [showWelcome, setShowWelcome] = useState(!conversationId)
  const [initialMessages, setInitialMessages] = useState([])
  const [isLoadingConversation, setIsLoadingConversation] = useState(!!conversationId)
  const [error, setError] = useState("")
  const [uploadedImage, setUploadedImage] = useState(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch conversation if ID is provided
  useEffect(() => {
    async function fetchConversation() {
      if (conversationId && user) {
        try {
          setIsLoadingConversation(true)
          const res = await fetch(`/api/conversations/${conversationId}`)

          if (!res.ok) {
            throw new Error("Failed to load conversation")
          }

          const data = await res.json()
          setInitialMessages(data.conversation.messages || [])
          setMessages(data.conversation.messages || [])
          setShowWelcome(false)
        } catch (error) {
          console.error("Error loading conversation:", error)
          setError("Failed to load conversation")
        } finally {
          setIsLoadingConversation(false)
        }
      }
    }

    fetchConversation()
  }, [conversationId, user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!input.trim() && !uploadedImage) return

    setShowWelcome(false)
    setIsLoading(true)

    try {
      // Create the user message
      let userMessage

      if (uploadedImage) {
        // Message with image
        userMessage = {
          role: "user",
          content: [
            { type: "text", text: input || "What's in this image?" },
            {
              type: "image_url",
              image_url: { url: uploadedImage.data },
            },
          ],
        }
      } else {
        // Regular text message
        userMessage = {
          role: "user",
          content: input,
        }
      }

      // Add user message to the chat
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)

      // Clear input and image
      setInput("")
      setUploadedImage(null)

      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          conversationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      const data = await response.json()

      // Add AI response to messages
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.text,
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function to render message content
  const renderMessageContent = (message) => {
    // Check if the message content is an array (for messages with images)
    if (Array.isArray(message.content)) {
      return (
        <div className="space-y-2">
          {message.content.map((part, index) => {
            if (part.type === "text") {
              return (
                <p key={index} className="whitespace-pre-wrap">
                  {part.text}
                </p>
              )
            } else if (part.type === "image_url" && part.image_url.url !== "[IMAGE]") {
              return (
                <div key={index} className="mt-2">
                  <img
                    src={part.image_url.url || "/placeholder.svg"}
                    alt="Uploaded"
                    className="max-h-60 rounded-md object-contain"
                  />
                </div>
              )
            }
            return null
          })}
        </div>
      )
    }

    // Regular text message
    return <p className="whitespace-pre-wrap">{message.content}</p>
  }

  const handleDeleteConversation = async () => {
    if (!conversationId) return

    try {
      const res = await fetch(`/api/conversations?id=${conversationId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete conversation")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting conversation:", error)
      setError("Failed to delete conversation")
    }
  }

  if (loading || isLoadingConversation) {
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
            {conversationId && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleDeleteConversation}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => document.documentElement.classList.toggle("dark")}>
              Toggle Theme
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:py-12">
        {error && <div className="mb-4 p-3 bg-destructive/15 text-destructive rounded-md text-center">{error}</div>}

        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Chat with NexusChat</CardTitle>
          </CardHeader>
          <CardContent className="h-[60vh] overflow-y-auto space-y-4 p-4">
            {showWelcome && (
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Bot className="h-8 w-8 mt-1 text-primary" />
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p>Hello {user?.name || ""}! I'm your NexusChat assistant. How can I help you today?</p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role !== "user" && <Bot className="h-8 w-8 mt-1 text-primary" />}
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {renderMessageContent(message)}
                </div>
                {message.role === "user" && <User className="h-8 w-8 mt-1 text-primary" />}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <Bot className="h-8 w-8 mt-1 text-primary" />
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
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
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {uploadedImage && (
              <div className="w-full">
                <div className="text-sm text-muted-foreground mb-2">Attached image:</div>
                <div className="relative">
                  <img
                    src={uploadedImage.data || "/placeholder.svg"}
                    alt="Uploaded"
                    className="max-h-40 rounded-md object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={() => setUploadedImage(null)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <div className="flex-grow flex items-center gap-2 relative">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={uploadedImage ? "Ask about this image..." : "Type your message..."}
                  className="flex-grow pr-10"
                  disabled={isLoading}
                />
                <div className="absolute right-2">
                  <ImageUpload onImageUpload={setUploadedImage} onImageRemove={() => setUploadedImage(null)} />
                </div>
              </div>
              <Button type="submit" disabled={isLoading || (!input.trim() && !uploadedImage)}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
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


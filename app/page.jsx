"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, ArrowRight, Check } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 dark:border-slate-700">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Bot className="h-6 w-6" />
            <span>NexusChat</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => document.documentElement.classList.toggle("dark")}>
              Toggle Theme
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
                Your Intelligent AI Assistant with <span className="text-primary">NexusChat</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
                Get instant answers, generate content, and solve problems with our advanced AI assistant.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                NexusChat comes packed with everything you need for productive AI interactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Engage in natural, intelligent conversations with our advanced AI assistant.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Instant Answers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Get immediate responses to your questions with accurate and helpful information.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Creative Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Generate creative content, brainstorm ideas, and solve complex problems together.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Free Access Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Free Access for Everyone</h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                NexusChat is completely free to use with no limitations.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="text-2xl">Free Forever</CardTitle>
                  <CardDescription>For everyone</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-slate-500 dark:text-slate-400">/forever</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Unlimited messages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Advanced AI capabilities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Image understanding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Save conversation history</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-primary mb-4">
                <Bot className="h-6 w-6" />
                <span>NexusChat</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your intelligent AI assistant for getting answers, generating content, and solving problems.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} NexusChat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


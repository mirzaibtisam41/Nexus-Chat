"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Image, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ImageUpload({ onImageUpload, onImageRemove }) {
  const [preview, setPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Convert the file to base64 for sending to the API
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result
        onImageUpload({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
        })
        setIsUploading(false)
      }
    } catch (error) {
      console.error("Error processing image:", error)
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to process the image",
      })
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageRemove()
  }

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-60 rounded-md object-contain" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Image className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Attach Image"}
          </Button>
        </div>
      )}
    </div>
  )
}


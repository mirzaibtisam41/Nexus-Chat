export function MessageContent({ message }) {
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


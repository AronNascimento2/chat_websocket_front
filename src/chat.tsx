import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import "./Chat.css"

interface Message {
  id: number
  username: string
  message: string
}

interface Props {
  username: string
  setError: (message: string) => void
}

export const Chat: React.FC<Props> = ({ username, setError }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState<string>("")
  const [isSending, setIsSending] = useState<boolean>(false)
  const socket = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    socket.current = io("http://localhost:8080")

    socket.current.on("message history", (messageHistory: Message[]) => {
      setMessages(messageHistory)
    })

    socket.current.on(
      "user joined",
      ({ username }: { username: string; activeUsers: string[] }) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            username: "System",
            message: `${username} entrou no chat`,
            id: Date.now(),
          },
        ])
      }
    )

    socket.current.on(
      "user left",
      ({ username }: { username: string; activeUsers: string[] }) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            username: "System",
            message: `${username} saiu do chat`,
            id: Date.now(),
          },
        ])
      }
    )

    socket.current.on("username taken", ({ message }: { message: string }) => {
      setError(message)
    })

    socket.current.on("chat message", (messageData: Message) => {
      if (messageData.username !== username) {
        setMessages((prevMessages) => [...prevMessages, messageData])
      }
    })

    socket.current.emit("join", username)

    return () => {
      socket.current?.disconnect()
    }
  }, [username, setError])

  const handleSendMessage = async () => {
    if (message.trim() && !isSending) {
      setIsSending(true)
      const messageData: Message = { username, message, id: Date.now() }

      socket.current?.emit("chat message", messageData)

      setMessages((prevMessages) => [...prevMessages, messageData])
      setMessage("")
      setIsSending(false)

      setTimeout(scrollToBottom, 0)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
      e.preventDefault()
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="chat">
      <h2>{username}</h2>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.username === username ? "sent" : "received"
            }`}
          >
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite uma mensagem..."
          className="message-input"
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending}
          className="send-button"
        >
          {isSending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  )
}

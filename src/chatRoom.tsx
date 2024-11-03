import { useState, useEffect } from "react"
import "./ChatRoom.css"
import { Chat } from "./chat"

export const ChatRoom = () => {
  const [user1, setUser1] = useState("Usuário A")
  const [user2, setUser2] = useState("Usuário B")
  const [showChat, setShowChat] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setShowChat(true)
  }, [])

  const handleStartChat = () => {
    if (user1 && user2) {
      setShowChat(true)
    }
  }

  return (
    <div className="chat-room">
      {!showChat ? (
        <div className="start-chat">
          <h1>Iniciar Chat</h1>
          <input
            type="text"
            value={user1}
            onChange={(e) => setUser1(e.target.value)}
            placeholder="Nome do usuário 1"
          />
          <input
            type="text"
            value={user2}
            onChange={(e) => setUser2(e.target.value)}
            placeholder="Nome do usuário 2"
          />
          <button onClick={handleStartChat}>Começar Chat</button>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <div className="chat-container">
          <Chat username={user1} setError={setError} />
          <Chat username={user2} setError={setError} />
        </div>
      )}
    </div>
  )
}

import { useRef, useState } from "react"
import "./App.css"

import Welcome from "./components/Welcome"
import Game from "./components/Game"
import InvitationWin from "./components/InvitationWin"
import InvitationLose from "./components/InvitationLose"

import musica from "./assets/musica.mp3"

function App() {
  const [screen, setScreen] = useState("welcome")
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef(null)

  async function playMusic() {
    const audio = audioRef.current

    if (!audio) return

    audio.volume = 0.35
    audio.loop = true

    try {
      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("No se pudo reproducir la música:", error)
    }
  }

  function pauseMusic() {
    const audio = audioRef.current

    if (!audio) return

    audio.pause()
    setIsPlaying(false)
  }

  async function toggleMusic() {
    if (isPlaying) {
      pauseMusic()
    } else {
      await playMusic()
    }
  }

  async function startGame() {
    if (!isPlaying) {
      await playMusic()
    }

    setScreen("game")
  }

  return (
    <div className="app-shell">
      <audio
        ref={audioRef}
        src={musica}
        preload="auto"
        loop
      />

      {screen === "welcome" && (
        <Welcome
          onStart={startGame}
          onToggleMusic={toggleMusic}
          isMusicPlaying={isPlaying}
        />
      )}

      {screen === "game" && (
        <Game
          onWin={() => setScreen("win")}
          onLose={() => setScreen("lose")}
        />
      )}

      {screen === "win" && (
        <InvitationWin
          onReplay={() => setScreen("game")}
        />
      )}

      {screen === "lose" && (
        <InvitationLose
          onRetry={() => setScreen("game")}
          onViewInvitation={() => setScreen("win")}
        />
      )}
    </div>
  )
}

export default App
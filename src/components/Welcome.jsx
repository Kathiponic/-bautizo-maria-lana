import "../styles/Welcome.css"
import elefantito1 from "../assets/elefantito1.png"

function Welcome({
  onStart,
  onToggleMusic,
  isMusicPlaying,
}) {
  return (
    <main className="welcome-screen">
      <div className="cloud cloud-one"></div>
      <div className="cloud cloud-two"></div>
      <div className="cloud cloud-three"></div>

      <section className="welcome-card">
        <img
          src={elefantito1}
          alt="Elefantito"
          className="welcome-elephant"
        />

        <p className="welcome-subtitle">
          Te invitamos a celebrar este día tan especial
        </p>

        <h1 className="welcome-title">
          Mi Bautizo
        </h1>

        <div className="welcome-divider">
          <span></span>
          <span className="welcome-heart">♥</span>
          <span></span>
        </div>

        <div className="welcome-actions">
          <button
            type="button"
            className="music-control-button"
            onClick={onToggleMusic}
          >
            {isMusicPlaying
              ? "🔊 Música activada"
              : "🔇 Música desactivada"}
          </button>

          <button
            type="button"
            className="start-button"
            onClick={onStart}
          >
            Comenzar aventura
          </button>
        </div>
      </section>
    </main>
  )
}

export default Welcome
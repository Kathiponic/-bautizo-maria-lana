import "../styles/ResultScreen.css"
import elefantitoLose from "../assets/elefantitolose.png"

function InvitationLose({ onRetry, onViewInvitation }) {
  return (
    <main className="result-screen lose-screen">
      <div className="result-cloud cloud-a"></div>
      <div className="result-cloud cloud-b"></div>

      <section className="result-card">
        <img
          src={elefantitoLose}
          alt="Elefantito sobre una nube"
          className="result-elephant"
        />

        <p className="result-small-text">
          No te preocupes
        </p>

        <h1 className="result-title">
          Una nubecita salvó la aventura
        </h1>

        <div className="result-divider">
          <span></span>
          <span className="result-heart">♥</span>
          <span></span>
        </div>

        <p className="result-message">
          El elefantito está a salvo y todavía puede acompañarte a conocer la invitación.
        </p>

        <div className="result-buttons">
          <button
            className="result-button"
            onClick={onViewInvitation}
          >
            Ver invitación
          </button>

          <button
            className="result-button result-button-secondary"
            onClick={onRetry}
          >
            Intentar otra vez
          </button>
        </div>
      </section>
    </main>
  )
}

export default InvitationLose
import "../styles/InvitationWin.css"
import elefantitoWin from "../assets/elefantitowin.png"
import estrella from "../assets/estrella.png"

const EVENT = {
  babyName: "María Lana Martínez Hernández",
  date: "Domingo 27 de septiembre del 2026",

  ceremonyTime: "12:00 PM",
  church: "Parroquia de Nuestra Señora del Perpetuo Socorro",
  churchAddress: " C. Francisco I. Madero 12, Centro, 61149 Cdad. Hidalgo, Michoacán",

  receptionTime: "3:30 PM",
  reception: "Salón de fiestas Quinta San Carlos",
  receptionAddress:
    "Av. Morelos Ote. Fabrica la Virgen, 61165. Cd. Hidalgo, Michoacán",

  churchMapsUrl: "https://share.google/wahekNUIsPSvsq7JA",
  receptionMapsUrl: "https://www.google.com/maps/place/SALON+DE+FIESTAS+QUINTA+SAN+CARLOS/@19.6816982,-100.5422075,17z/data=!4m6!3m5!1s0x85d2cbb39ca7f229:0x524843a05a2134a6!8m2!3d19.6822785!4d-100.5420853!16s%2Fg%2F11s7phs049?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D",

  whatsappUrl:
    "https://wa.me/5217861198573?text=Hola%2C%20confirmo%20mi%20asistencia%20al%20bautizo",
}

function StarDecoration() {
  return (
    <img
      src={estrella}
      alt=""
      className="family-star"
      aria-hidden="true"
    />
  )
}

function InvitationWin({ onReplay }) {
  return (
    <main className="invitation-win-screen">
      <div className="invitation-cloud invitation-cloud-one"></div>
      <div className="invitation-cloud invitation-cloud-two"></div>

      <section className="invitation-win-card">
        <img
          src={elefantitoWin}
          alt="Elefantito junto al pastel"
          className="invitation-win-elephant"
        />

        <p className="invitation-win-message">
          La aventura terminó y la invitación llegó a salvo.
        </p>

        <div className="invitation-divider">
          <span></span>
          <span className="invitation-star">✦</span>
          <span></span>
        </div>

        <h1 className="invitation-main-title">
          Mi Bautizo
        </h1>

        <h2 className="invitation-baby-name">
          {EVENT.babyName}
        </h2>

        <blockquote className="invitation-verse">
          “Les daré un corazón nuevo y les pondré un espíritu nuevo dentro de ustedes”
          <cite>Ezequiel 36:26</cite>
        </blockquote>

        <div className="family-section">
          <div className="family-row">
            <StarDecoration />

            <p>
              <span>Mamá:</span>
              Mitzy Alejandra Martínez Hernández
            </p>

            <StarDecoration />
          </div>

          <div className="family-row">
            <StarDecoration />

            <p>
              <span>Madrina:</span>
              Irene Hernández Guzmán
            </p>

            <StarDecoration />
          </div>

          <div className="family-row">
            <StarDecoration />

            <p>
              <span>Padrino:</span>
              Alfredo Martínez Hernández
            </p>

            <StarDecoration />
          </div>
        </div>

        <div className="invitation-details-grid">
          <article className="invitation-detail-card">
            <p className="invitation-detail-label">
              Ceremonia
            </p>

            <strong>{EVENT.date}</strong>

            <p>{EVENT.ceremonyTime}</p>
            <p>{EVENT.church}</p>

            <small>{EVENT.churchAddress}</small>
          </article>

          <article className="invitation-detail-card">
            <p className="invitation-detail-label">
              Recepción
            </p>

            <strong>{EVENT.date}</strong>

            <p>{EVENT.receptionTime}</p>
            <p>{EVENT.reception}</p>

            <small>{EVENT.receptionAddress}</small>
          </article>
        </div>

        <p className="invitation-closing-text">
          Con mucha alegría queremos compartir contigo este día tan especial.
        </p>

        <div className="invitation-buttons">
          <a
            className="invitation-button"
            href={EVENT.churchMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver ubicación de la ceremonia
          </a>

          <a
            className="invitation-button"
            href={EVENT.receptionMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver ubicación de la recepción
          </a>

          <a
            className="invitation-button invitation-confirm-button"
            href={EVENT.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Confirmar asistencia
          </a>
        </div>

        <button
          className="invitation-replay-button"
          onClick={onReplay}
        >
          Jugar otra vez
        </button>
      </section>
    </main>
  )
}

export default InvitationWin
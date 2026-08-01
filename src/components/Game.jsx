import { useCallback, useEffect, useRef, useState } from "react"
import "../styles/Game.css"

import elefantito from "../assets/elefantito1.png"
import estrella from "../assets/estrella.png"
import pastel from "../assets/pastel.png"

const GAME_DURATION = 15
const GROUND_HEIGHT = 74
const ELEPHANT_SIZE = 105
const ELEPHANT_SIZE_MOBILE = 92
const OBSTACLE_SIZE = 44

function Game({ onWin, onLose }) {
  const gameRef = useRef(null)
  const animationRef = useRef(null)
  const winTimeoutRef = useRef(null)
  const countdownTimeoutRef = useRef(null)

  const startTimeRef = useRef(null)
  const lastFrameRef = useRef(null)
  const lastObstacleRef = useRef(0)
  const nextObstacleDelayRef = useRef(1300)

  const elephantYRef = useRef(0)
  const elephantXRef = useRef(0)
  const velocityRef = useRef(0)

  const obstaclesRef = useRef([])
  const cakeXRef = useRef(null)

  const finishedRef = useRef(false)
  const finalSequenceRef = useRef(false)
  const elephantReachedCakeRef = useRef(false)

  const [gameStatus, setGameStatus] = useState("preparing")
  const [countdownText, setCountdownText] = useState(
    "Toca la pantalla para saltar"
  )

  const [elephantY, setElephantY] = useState(0)
  const [elephantX, setElephantX] = useState(null)
  const [obstacles, setObstacles] = useState([])
  const [cakeX, setCakeX] = useState(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)

  const finishGame = useCallback(
    (result) => {
      if (finishedRef.current) return

      finishedRef.current = true
      cancelAnimationFrame(animationRef.current)

      if (result === "win") {
        onWin()
      } else {
        onLose()
      }
    },
    [onWin, onLose]
  )

  const jump = useCallback(() => {
    if (
      gameStatus !== "playing" ||
      finishedRef.current ||
      finalSequenceRef.current
    ) {
      return
    }

    if (elephantYRef.current <= 1) {
      velocityRef.current = 720
    }
  }, [gameStatus])

  /*
   * Mensaje de preparación y conteo.
   */

  useEffect(() => {
    const sequence = [
      {
        text: "Toca la pantalla para saltar",
        duration: 1800,
      },
      {
        text: "3",
        duration: 850,
      },
      {
        text: "2",
        duration: 850,
      },
      {
        text: "1",
        duration: 850,
      },
      {
        text: "¡Salta!",
        duration: 700,
      },
    ]

    let currentStep = 0

    setCountdownText(sequence[currentStep].text)

    function showNextStep() {
      currentStep += 1

      if (currentStep >= sequence.length) {
        setCountdownText("")
        setGameStatus("playing")
        return
      }

      setCountdownText(sequence[currentStep].text)

      countdownTimeoutRef.current = setTimeout(
        showNextStep,
        sequence[currentStep].duration
      )
    }

    countdownTimeoutRef.current = setTimeout(
      showNextStep,
      sequence[currentStep].duration
    )

    return () => {
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current)
      }
    }
  }, [])

  /*
   * Barra espaciadora, flecha arriba o W.
   */

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.code === "Space" ||
        event.code === "ArrowUp" ||
        event.code === "KeyW"
      ) {
        event.preventDefault()
        jump()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [jump])

  /*
   * Lógica principal del juego.
   */

  useEffect(() => {
    if (gameStatus !== "playing") return

    function gameLoop(timestamp) {
      if (finishedRef.current) return

      const gameWidth =
        gameRef.current?.getBoundingClientRect().width ||
        window.innerWidth

      const elephantWidth =
        gameWidth <= 520
          ? ELEPHANT_SIZE_MOBILE
          : ELEPHANT_SIZE

      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
        lastFrameRef.current = timestamp
        lastObstacleRef.current = timestamp

        elephantXRef.current =
          gameWidth <= 520
            ? 28
            : Math.max(gameWidth * 0.12, 25)

        setElephantX(elephantXRef.current)
      }

      const deltaTime = Math.min(
        (timestamp - lastFrameRef.current) / 1000,
        0.035
      )

      lastFrameRef.current = timestamp

      const elapsed =
        (timestamp - startTimeRef.current) / 1000

      const remaining = Math.max(
        0,
        GAME_DURATION - elapsed
      )

      setTimeLeft(Math.ceil(remaining))

      /*
       * Salto y gravedad.
       */

      if (!finalSequenceRef.current) {
        const gravity = 1900

        velocityRef.current -= gravity * deltaTime
        elephantYRef.current +=
          velocityRef.current * deltaTime

        if (elephantYRef.current <= 0) {
          elephantYRef.current = 0
          velocityRef.current = 0
        }

        setElephantY(elephantYRef.current)
      }

      /*
       * Crear estrellas.
       */

      const canCreateObstacle =
        elapsed < GAME_DURATION - 3 &&
        timestamp - lastObstacleRef.current >
          nextObstacleDelayRef.current

      if (canCreateObstacle) {
        obstaclesRef.current.push({
          id: `${timestamp}-${Math.random()}`,
          x: gameWidth + 40,
        })

        lastObstacleRef.current = timestamp

        nextObstacleDelayRef.current =
          1050 + Math.random() * 750
      }

      /*
       * Mover estrellas.
       */

      const obstacleSpeed = 310

      obstaclesRef.current = obstaclesRef.current
        .map((obstacle) => ({
          ...obstacle,
          x:
            obstacle.x -
            obstacleSpeed * deltaTime,
        }))
        .filter(
          (obstacle) =>
            obstacle.x > -OBSTACLE_SIZE - 20
        )

      setObstacles([...obstaclesRef.current])

      /*
       * Colisiones.
       */

      if (!finalSequenceRef.current) {
        const elephantLeft =
          elephantXRef.current

        const elephantRight =
          elephantLeft + elephantWidth

        const elephantBottom =
          GROUND_HEIGHT + elephantYRef.current

        const elephantTop =
          elephantBottom + elephantWidth

        const collision =
          obstaclesRef.current.some((obstacle) => {
            /*
             * Solo se usa la parte central
             * de la estrella para la colisión.
             */

            const starHitboxRatio = 0.42
            const starHitboxSize =
              OBSTACLE_SIZE * starHitboxRatio

            const starMargin =
              (OBSTACLE_SIZE - starHitboxSize) / 2

            const obstacleLeft =
              obstacle.x + starMargin

            const obstacleRight =
              obstacle.x +
              OBSTACLE_SIZE -
              starMargin

            const obstacleBottom =
              GROUND_HEIGHT + starMargin

            const obstacleTop =
              GROUND_HEIGHT +
              OBSTACLE_SIZE -
              starMargin

            const elephantHitboxMarginX =
              elephantWidth * 0.18

            const elephantHitboxMarginY =
              elephantWidth * 0.12

            const elephantHitboxLeft =
              elephantLeft +
              elephantHitboxMarginX

            const elephantHitboxRight =
              elephantRight -
              elephantHitboxMarginX

            const elephantHitboxBottom =
              elephantBottom +
              elephantHitboxMarginY

            const elephantHitboxTop =
              elephantTop -
              elephantHitboxMarginY

            const horizontalCollision =
              elephantHitboxRight >
                obstacleLeft &&
              elephantHitboxLeft <
                obstacleRight

            const verticalCollision =
              elephantHitboxTop >
                obstacleBottom &&
              elephantHitboxBottom <
                obstacleTop

            return (
              horizontalCollision &&
              verticalCollision
            )
          })

        if (collision) {
          finishGame("lose")
          return
        }
      }

      /*
       * Mostrar el pastel después
       * de la última estrella.
       */

      const starsFinished =
        elapsed >= GAME_DURATION &&
        obstaclesRef.current.length === 0

      if (
        starsFinished &&
        cakeXRef.current === null
      ) {
        cakeXRef.current = gameWidth + 100
        setCakeX(cakeXRef.current)
      }

      /*
       * Mover el pastel hasta su posición.
       */

      if (
        cakeXRef.current !== null &&
        !finalSequenceRef.current
      ) {
        const cakeStopX = Math.min(
          gameWidth * 0.68,
          gameWidth - 145
        )

        cakeXRef.current -= 230 * deltaTime

        if (cakeXRef.current <= cakeStopX) {
          cakeXRef.current = cakeStopX
          finalSequenceRef.current = true

          elephantYRef.current = 0
          velocityRef.current = 0

          setElephantY(0)
        }

        setCakeX(cakeXRef.current)
      }

      /*
       * El elefantito avanza al pastel.
       */

      if (
        finalSequenceRef.current &&
        !elephantReachedCakeRef.current
      ) {
        const targetElephantX =
          cakeXRef.current -
          elephantWidth +
          22

        elephantXRef.current +=
          190 * deltaTime

        if (
          elephantXRef.current >=
          targetElephantX
        ) {
          elephantXRef.current =
            targetElephantX

          elephantReachedCakeRef.current =
            true

          setElephantX(
            elephantXRef.current
          )

          winTimeoutRef.current =
            setTimeout(() => {
              finishGame("win")
            }, 1500)

          return
        }

        setElephantX(elephantXRef.current)
      }

      animationRef.current =
        requestAnimationFrame(gameLoop)
    }

    animationRef.current =
      requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(
        animationRef.current
      )

      if (winTimeoutRef.current) {
        clearTimeout(winTimeoutRef.current)
      }
    }
  }, [finishGame, gameStatus])

  return (
    <main
      ref={gameRef}
      className="game-screen"
      onPointerDown={jump}
    >
      <div className="game-cloud game-cloud-one"></div>
      <div className="game-cloud game-cloud-two"></div>

      <header className="game-header">
        <span>
          Ayuda al elefantito a llegar al pastel
        </span>

        <strong>{timeLeft}</strong>
      </header>

      {countdownText && (
        <div className="game-countdown-overlay">
          <div className="game-countdown-box">
            <p className="game-countdown-text">
              {countdownText}
            </p>
          </div>
        </div>
      )}

      {elephantX !== null && (
        <img
          src={elefantito}
          alt="Elefantito"
          className="game-elephant"
          draggable="false"
          style={{
            left: `${elephantX}px`,
            bottom: `${
              GROUND_HEIGHT + elephantY
            }px`,
          }}
        />
      )}

      {obstacles.map((obstacle) => (
        <img
          key={obstacle.id}
          src={estrella}
          alt=""
          className="game-obstacle"
          draggable="false"
          style={{
            left: `${obstacle.x}px`,
            bottom: `${GROUND_HEIGHT}px`,
          }}
        />
      ))}

      {cakeX !== null && (
        <img
          src={pastel}
          alt="Pastel"
          className="game-cake"
          draggable="false"
          style={{
            left: `${cakeX}px`,
            bottom: `${GROUND_HEIGHT}px`,
          }}
        />
      )}

      <div className="game-ground">
        <div className="ground-line"></div>
        <div className="ground-dots"></div>
      </div>

      <p className="game-instructions">
        Toca la pantalla o presiona la barra
        espaciadora para saltar
      </p>
    </main>
  )
}

export default Game
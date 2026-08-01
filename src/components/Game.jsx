import { useCallback, useEffect, useRef, useState } from "react"
import "../styles/Game.css"

import elefantito from "../assets/elefantito1.png"
import estrella from "../assets/estrella.png"
import pastel from "../assets/pastel.png"

const GAME_DURATION = 15
const GROUND_HEIGHT = 74
const ELEPHANT_SIZE = 150
const OBSTACLE_SIZE = 48

function Game({ onWin, onLose }) {
  const gameRef = useRef(null)
  const animationRef = useRef(null)
  const winTimeoutRef = useRef(null)

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
      finishedRef.current ||
      finalSequenceRef.current
    ) {
      return
    }

    if (elephantYRef.current <= 1) {
      velocityRef.current = 720
    }
  }, [])

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

  useEffect(() => {
    function gameLoop(timestamp) {
      if (finishedRef.current) return

      const gameWidth =
        gameRef.current?.getBoundingClientRect().width ||
        window.innerWidth

      const elephantWidth =
        gameWidth <= 520 ? 92 : ELEPHANT_SIZE

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
       * SALTO Y GRAVEDAD
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
       * CREAR ESTRELLAS
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
       * MOVER ESTRELLAS
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
       * COLISIONES
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

        const collision = obstaclesRef.current.some((obstacle) => {
  /*
   * La colisión de la estrella usa solamente
   * el 42 % central de su imagen.
   */

  const starHitboxRatio = 0.42
  const starHitboxSize = OBSTACLE_SIZE * starHitboxRatio

  const starMargin =
    (OBSTACLE_SIZE - starHitboxSize) / 2

  const obstacleLeft =
    obstacle.x + starMargin

  const obstacleRight =
    obstacle.x + OBSTACLE_SIZE - starMargin

  const obstacleBottom =
    GROUND_HEIGHT + starMargin

  const obstacleTop =
    GROUND_HEIGHT + OBSTACLE_SIZE - starMargin

  /*
   * Área de colisión del elefantito.
   * Se mantiene ligeramente reducida para que
   * el juego no castigue por las zonas transparentes.
   */

  const elephantHitboxMarginX =
    elephantWidth * 0.18

  const elephantHitboxMarginY =
    elephantWidth * 0.12

  const elephantHitboxLeft =
    elephantLeft + elephantHitboxMarginX

  const elephantHitboxRight =
    elephantRight - elephantHitboxMarginX

  const elephantHitboxBottom =
    elephantBottom + elephantHitboxMarginY

  const elephantHitboxTop =
    elephantTop - elephantHitboxMarginY

  const horizontalCollision =
    elephantHitboxRight > obstacleLeft &&
    elephantHitboxLeft < obstacleRight

  const verticalCollision =
    elephantHitboxTop > obstacleBottom &&
    elephantHitboxBottom < obstacleTop

  return horizontalCollision && verticalCollision
})

        if (collision) {
          finishGame("lose")
          return
        }
      }

      /*
       * MOSTRAR EL PASTEL
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
       * MOVER EL PASTEL HASTA SU POSICIÓN
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
       * EL ELEFANTITO AVANZA AL PASTEL
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
  }, [finishGame])

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
          ¡Salta y esquiva las estrellas para llegar al pastel!
        </span>

        <strong>{timeLeft}</strong>
      </header>

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
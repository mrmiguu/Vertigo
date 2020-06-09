import styles from './styles/Keyboard.module.scss'
import React, { useRef, useEffect } from 'react'
import { border } from './global'

let { keys } = Object

export default ({ onLeft, onRight, onUp, onDown, debug }) => {
  let ref = useRef()

  useEffect(
    () => {
      let keyToAct = {
        ArrowLeft: onLeft,
        ArrowRight: onRight,
        ArrowUp: onUp,
        ArrowDown: onDown,
      }

      let onKey = e => {
        let onKey = keyToAct[e.key]

        if (typeof onKey === 'function') {
          let offKey = onKey()

          if (typeof offKey === 'function') {

            let offKeyCb = e2 => {
              if (e2.key !== e.key) return
              offKey()
              window.removeEventListener('keyup', offKeyCb)
              // console.log(`
              // offKey()
              // window.removeEventListener('keyup', offKeyCb)
              // for ${e.key}`)
            }

            window.addEventListener('keyup', offKeyCb)
          }
        }
      }

      window.addEventListener('keydown', onKey)
      return () => {
        window.removeEventListener('keydown', onKey)
        console.log(`window.removeEventListener('keydown', onKey) for ${e.key}`)
      }
    },
    []
  )

  return <>
    <div
      ref={ref}
      id={styles.Keyboard}
    >
      <div
        id={styles.Left}
        onMouseDown={onLeft}
        onTouchStart={onLeft}
        onMouseUp={() => {
          let offLeft = onLeft()
          typeof offLeft === 'function' && offLeft()
        }}
        style={border(debug)}
      ></div>

      <div
        id={styles.Right}
        onMouseDown={onRight}
        onTouchStart={onRight}
        onMouseUp={() => {
          let offRight = onRight()
          typeof offRight === 'function' && offRight()
        }}
        style={border(debug)}
      ></div>

      <div
        id={styles.Top}
        onMouseDown={onUp}
        onTouchStart={onUp}
        onMouseUp={() => {
          let offUp = onUp()
          typeof offUp === 'function' && offUp()
        }}
        style={border(debug)}
      ></div>

      <div
        id={styles.Bottom}
        onMouseDown={onDown}
        onTouchStart={onDown}
        onMouseUp={() => {
          let offDown = onDown()
          typeof offDown === 'function' && offDown()
        }}
        style={border(debug)}
      ></div>
    </div>
  </>
}

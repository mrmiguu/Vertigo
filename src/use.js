import {
  useRef,
  useEffect,
  useState,
  MutableRefObject,
  Dispatch,
  SetStateAction,
} from 'react'

const {
  keys,
  values,
  entries,
} = Object

const {
  min,
  max,
  abs,
} = Math

const {
  URL,
} = window

function useMouse() {

  /** @type {[number[], Dispatch<SetStateAction<number[]>>]} */
  const [mouse, setMouse] = useState()

  useEffect(
    () => {

      /**
       * @param {MouseEvent} e 
       */
      function onMouseMove(e) {
        setMouse([e.clientX, e.clientY])
      }

      window.addEventListener('mousemove', onMouseMove)
      return () => window.removeEventListener('mousemove', onMouseMove)
    },
    []
  )

  useEffect(
    () => {

      /**
       * @param {Event} e 
       */
      function onScroll(e) {
        setMouse(m => m && [m[0], m[1]])
      }

      window.addEventListener('scroll', onScroll)
      return () => window.removeEventListener('scroll', onScroll)
    },
    [mouse]
  )

  return mouse
}

/**
 * 
 * @param {*} object 
 * @param {boolean} downloading 
 */
function useDownloadable(object, downloading) {
  useEffect(
    () => {
      if (!downloading) return

      const json = JSON.stringify(object)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      console.log(`url ${url}`)

      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'download.json'

      document.body.appendChild(a)

      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    },
    [object, downloading]
  )
}

export {
  useMouse,
  useDownloadable,
}

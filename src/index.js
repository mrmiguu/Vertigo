import './index.css'

import React, {
  useRef,
  useEffect,
  useState,
  MutableRefObject,
  Dispatch,
  SetStateAction,
} from 'react'

import {
  render,
} from 'react-dom'

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

const tiles_0 = require('../assets/tiles_0.png')

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

function App() {

  /** @type {MutableRefObject<HTMLCanvasElement>} */
  const canvasRef = useRef()
  /** @type {MutableRefObject<HTMLImageElement>} */
  const selSheetRef = useRef()
  /** @type {MutableRefObject<HTMLDivElement>} */
  const selRef = useRef()

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight])
  const [windowWidth, windowHeight] = windowSize

  const [redraw, setRedraw] = useState(false)
  const [tileSet0, setTileSet0] = useState()

  const m = useMouse()

  /** @type {[HTMLElement, Dispatch<SetStateAction<HTMLElement>>]} */
  const [hoverElem, setHoverElem] = useState()

  const [sel, setSel] = useState([NaN, NaN])
  const [selX, selY] = sel

  useEffect(
    () => {
      function onResize() {
        setWindowSize([window.innerWidth, window.innerHeight])
      }

      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    },
    []
  )

  useEffect(
    () => {
      if (!m) return

      const [mx, my] = m
      const elem = document.elementFromPoint(mx, my)

      setHoverElem(elem)

      const { left, top } = elem.getBoundingClientRect()
      const tx = ~~((mx - left) / 32)
      const ty = ~~((my - top) / 32)
      const x = left + (tx * 32)
      const y = top + (ty * 32)

      setSel([x, y])

      // console.log(`hovering ${elem.outerHTML} (who is at [${[left, top, elem.style.zIndex]}])`)
    },
    [m]
  )

  const [map, setMap] = useState({ 0: { 0: [0, 32] } })
  const [src, setSrc] = useState()
  const [dst, setDst] = useState()

  useEffect(
    () => {
      function onMouseDown() {
        const canvas = canvasRef.current
        const selSheet = selSheetRef.current
        const sel = selRef.current
        const selRect = sel.getBoundingClientRect()
        const targetRect = hoverElem.getBoundingClientRect()

        const targetX = selRect.left - targetRect.left
        const targetY = selRect.top - targetRect.top

        console.log(`tapped target [${[targetX, targetY]}]`)

        if (hoverElem === selSheet) {
          setSrc([targetX, targetY])
        } else if (hoverElem === canvas) {
          setDst([targetX, targetY])
        }
      }

      window.addEventListener('mousedown', onMouseDown)
      return () => window.removeEventListener('mousedown', onMouseDown)
    },
    [hoverElem, src]
  )

  useEffect(
    () => {
      if (!src) return
      if (!dst) return
      setMap(map => ({ ...map, [dst[0]]: { [dst[1]]: src } }))
      setDst()
    },
    [src, dst]
  )

  useEffect(
    () => {
      const image = new Image()
      image.src = tiles_0
      image.onload = () => {
        setTileSet0(image)
        console.log(`image.width ${image.width}`)
        console.log(`image.height ${image.height}`)
      }
    },
    []
  )

  useEffect(
    () => {
      console.log(`windowSize ${windowSize}`)
      setRedraw(x => !x)
    },
    [windowSize]
  )

  useEffect(
    () => {
      console.log(`map ${JSON.stringify(map)}`)
    },
    [map]
  )

  useEffect(
    () => {
      if (!tileSet0) return

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      const dxs = keys(map)
      for (const dx of dxs) {
        const dys = keys(map[dx])
        for (const dy of dys) {
          const [sx, sy] = map[dx][dy]
          context.drawImage(tileSet0, sx, sy, 32, 32, dx, dy, 32, 32)
        }
      }
    },
    [redraw, tileSet0, map]
  )

  return (
    <div id="App">
      <canvas
        ref={canvasRef}
        width={windowWidth}
        height={windowHeight}
      />

      <img
        ref={selSheetRef}
        id="SelSheet"
        src={tiles_0}
        style={{ zIndex: 999 }}
      />

      {
        !hoverElem ? null : (
          <div
            ref={selRef}
            id="Sel"
            style={{
              left: `${selX}px`,
              top: `${selY}px`,
              zIndex: hoverElem.style.zIndex,
            }}
          />
        )
      }

    </div>
  )
}

render(<App />, document.querySelector('#root'))

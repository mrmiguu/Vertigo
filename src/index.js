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

import merge from 'deepmerge'

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

      if (!elem) return

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

  const [edits, setEdits] = useState([{}])
  const [e, setE] = useState(0)
  const map = edits[e]

  const [src, setSrc] = useState()
  const [dst, setDst] = useState()

  const [adding, setAdding] = useState()
  const [removing, setDeleting] = useState()

  useEffect(
    () => {
      function onMouseDown() {
        setAdding(true)
      }
      function onMouseUp() {
        setAdding()
      }

      window.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mouseup', onMouseUp)
      return () => {
        window.removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mouseup', onMouseUp)
      }
    },
    []
  )

  useEffect(
    () => {
      if (!adding) return
      if (!hoverElem) return

      const canvas = canvasRef.current
      const selSheet = selSheetRef.current

      const sel = selRef.current
      if (!sel) return

      const selRect = sel.getBoundingClientRect()
      const targetRect = hoverElem.getBoundingClientRect()

      const targetX = selRect.left - targetRect.left
      const targetY = selRect.top - targetRect.top

      console.log(`tapping target [${[targetX, targetY]}]`)

      if (hoverElem === selSheet) {
        setSrc([targetX, targetY])
      } else if (hoverElem === canvas) {
        setDst([targetX, targetY])
      }
    },
    [m, adding]
  )

  useEffect(
    () => {
      if (!src) return
      if (!dst) return

      const [dx, dy] = dst
      const [sx, sy] = src

      setDst()

      const history = edits.slice(e)
      const map = history[0]

      if (map[dx]) {
        if (map[dx][dy]) {

          const s = map[dx][dy]
          if (!s.length) return

          if (removing) {
            const next = merge({}, map)

            next[dx][dy].pop()

            setEdits([next, ...history])
            setE(0)

            return
          }

          const last = s[s.length - 1]
          if (last[0] === sx && last[1] === sy) {
            console.log('tile already placed at this layer; skipping...')
            return
          }
        }
      }

      const next = merge(map, { [dx]: { [dy]: [src] } })
      setEdits([next, ...history])
      setE(0)
    },
    [src, dst, edits, e, removing]
  )

  useEffect(
    () => {

      /**
       * @param {KeyboardEvent} e 
       */
      function onKeyDown(e) {
        if (e.key === 'z') {
          console.log('undoing...')
          setE(e => min(e + 1, edits.length - 1))
        }
        if (e.key === 'y') {
          console.log('redoing...')
          setE(e => max(e - 1, 0))
        }
        if (e.key === 'd') {
          console.log('toggling deletion...')
          setDeleting(d => !d)
        }
      }

      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    },
    [edits]
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

      console.log('redrawing...')

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      context.clearRect(0, 0, canvas.width, canvas.height)

      for (const dx in map) {
        for (const dy in map[dx]) {
          for (const [sx, sy] of map[dx][dy]) {
            context.drawImage(tileSet0, sx, sy, 32, 32, dx, dy, 32, 32)
          }
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

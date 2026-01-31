import React, { useEffect } from 'react'

const inViewport = require('in-viewport')

export function useAnimationToIndicateTopicUpdate(
  ref: React.MutableRefObject<HTMLDivElement | undefined>,
  lastUpdate: number,
  className: string,
  selected: boolean,
  selectionLastUpdate: number,
  shouldAnimate: boolean
) {
  useEffect(() => {
    const selectionDidChange = Date.now() - selectionLastUpdate < 500
    if (ref.current && shouldAnimate && Date.now() - lastUpdate < 3000 && !selected && !selectionDidChange) {
      if (!inViewport(ref.current)) {
        return
      }

      let timeout: any
      let animationFrame = requestAnimationFrame(() => {
        ref.current && ref.current.classList.add(className)

        timeout = setTimeout(
          () =>
            (animationFrame = requestAnimationFrame(() => {
              ref.current && ref.current.classList.remove(className)
            })),
          500
        )
      })

      return function cleanup() {
        timeout && clearTimeout(timeout)
        animationFrame && cancelAnimationFrame(animationFrame)
      }
    }
  }, [lastUpdate, selected, selectionLastUpdate, shouldAnimate, className])
}

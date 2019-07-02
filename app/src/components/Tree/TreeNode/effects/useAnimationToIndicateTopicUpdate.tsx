import React, { useEffect } from 'react'

export function useAnimationToIndicateTopicUpdate(
  ref: React.MutableRefObject<HTMLDivElement | undefined>,
  lastUpdate: number,
  className: string,
  selected: boolean,
  shouldAnimate: boolean
) {
  useEffect(() => {
    if (ref.current && shouldAnimate && Date.now() - lastUpdate < 3000 && !selected) {
      let animationFrame = requestAnimationFrame(() => {
        ref.current && ref.current.classList.add(className)
      })

      const timeout = setTimeout(
        () =>
          (animationFrame = requestAnimationFrame(() => {
            ref.current && ref.current.classList.remove(className)
          })),
        500
      )

      return function cleanup() {
        clearTimeout(timeout)
        animationFrame && cancelAnimationFrame(animationFrame)
      }
    }
  }, [lastUpdate, selected, shouldAnimate, className])
}

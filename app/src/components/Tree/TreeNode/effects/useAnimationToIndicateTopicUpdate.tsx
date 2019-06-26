import React, { useEffect } from 'react'

export function useAnimationToIndicateTopicUpdate(
  lastUpdate: number,
  selected: boolean,
  setShowUpdateAnimation: React.Dispatch<React.SetStateAction<boolean>>,
  showUpdateAnimation: boolean
) {
  useEffect(() => {
    if (Date.now() - lastUpdate < 3000 && !selected) {
      setShowUpdateAnimation(true)
    }
  }, [lastUpdate, selected])
  useEffect(() => {
    if (showUpdateAnimation) {
      const timeout = setTimeout(() => setShowUpdateAnimation(false), 500)
      return function cleanup() {
        clearTimeout(timeout)
      }
    }
  }, [showUpdateAnimation])
}

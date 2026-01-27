import { useEffect } from 'react'
import { EventDispatcher } from 'MQTT-Explorer/events/events'

export function useSubscription<T>(dispatcher: EventDispatcher<T> | undefined, callback: (value: T) => void) {
  useEffect(() => {
    dispatcher?.subscribe(callback)

    return () => dispatcher?.unsubscribe(callback)
  }, [dispatcher, callback])
}

import { v4 } from 'uuid'
import { Event } from '../Events'
import { EventBusInterface } from './EventBusInterface'

export type RpcEvent<RequestType, ResponseType> = {
  topic: string
}

export class Rpc {
  constructor(private participant: EventBusInterface) {}

  // tslint:disable-next-line:member-access
  async call<RpcRequest, RpcResponse>(
    event: RpcEvent<RpcRequest, RpcResponse>,
    request: RpcRequest,
    timeout: number = 0
  ): Promise<RpcResponse> {
    return new Promise((resolve, reject) => {
      const id = v4()

      const responseEvent: Event<any> = { topic: `${event.topic}/response/${id}` }
      const requestEvent: Event<any> = { topic: `${event.topic}/request` }
      const callback = (result: { id: string; payload: RpcResponse; error: unknown }) => {
        this.participant.unsubscribe(responseEvent as any, callback)
        if (result.error) {
          reject(result.error)
        } else {
          resolve(result.payload)
        }
        console.log('received', result)
      }
      this.participant.subscribe(responseEvent, callback)
      this.participant.emit(requestEvent, { id, payload: request })

      if (timeout > 0) {
        setTimeout(() => {
          reject(new Error(`Did not respond to ${event.topic} within ${timeout}ms`))
          this.participant.unsubscribe(responseEvent as any, callback)
        }, 10000)
      }
    })
  }

  // tslint:disable-next-line:member-access
  async on<RpcRequest, RpcResponse>(
    event: RpcEvent<RpcRequest, RpcResponse>,
    handler: (request: RpcRequest) => Promise<RpcResponse>
  ) {
    this.participant.subscribe<RpcRequest>({ topic: `${event.topic}/request` }, async request => {
      let payload
      let error
      try {
        payload = await handler((request as any).payload)
      } catch (e) {
        error = e
      }
      const { id } = request as any
      console.log(`${event.topic}/response/${id}`, payload, error)
      this.participant.emit({ topic: `${event.topic}/response/${id}` }, { id, payload, error })
    })
  }
}

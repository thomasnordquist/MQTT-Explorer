import { Event } from '../Events';
import { EventBusInterface } from './EventBusInterface'
import { v4 } from 'uuid';

export type RpcEvent<RequstType, ResponseType> = {
    topic: string;
};

export class Rpc {
    constructor(private participant: EventBusInterface) { }

    async call<RpcRequest, RpcResponse>(event: RpcEvent<RpcRequest, RpcResponse>, request: RpcRequest, timeout: number = 0): Promise<RpcResponse> {
        return new Promise((resolve, reject) => {
            let id = v4();

            let responseEvent: Event<any> = { topic: `${event.topic}/response` };
            let requestEvent: Event<any> = { topic: `${event.topic}/request` };
            let callback = (result: { id: string; payload: RpcResponse; error: unknown }) => {
                this.participant.unsubscribe(responseEvent as any, callback);
                if (result.id === id) {
                    if (result.error) {
                        reject(result.error)
                    } else {
                        resolve(result.payload);
                    }
                }
                console.log("received", result)
            };
            this.participant.subscribe(responseEvent, callback);
            this.participant.emit(requestEvent, { id, payload: request });

            if (timeout > 0) {
                setTimeout(() => {
                    reject(new Error(`Did not respond to ${event.topic} within ${timeout}ms`))
                    this.participant.unsubscribe(responseEvent as any, callback);
                }, 10000)
            }
        });
    }

    async on<RpcRequest, RpcResponse>(event: RpcEvent<RpcRequest, RpcResponse>, handler: (request: RpcRequest) => Promise<RpcResponse>) {
        this.participant.subscribe<RpcRequest>({ topic: `${event.topic}/request` } as RpcEvent<any, any>, async (request) => {
            let payload;
            let error;
            try {
                payload = await handler((request as any).payload);
            } catch (e) {
                error = e
            }
            console.log("Responding with", payload, error)
            this.participant.emit({ topic: `${event.topic}/response` }, { id: (request as any).id, payload, error });
        });
    }
}

import { SynchronousPromise } from '@/promise/synchronous-promise'

export const requestResolver = <V>(request: IDBRequest<V>) =>
    new SynchronousPromise<V>((resolve, reject) => {
        const onsuccess = (event: Event) => {
            request.removeEventListener('success', onsuccess)
            request.removeEventListener('error', onerror)
            const target = event.target as IDBRequest<V>
            resolve(target.result)
        }

        /* istanbul ignore next */
        const onerror = (event: Event) => {
            request.removeEventListener('success', onsuccess)
            request.removeEventListener('error', onerror)
            const target = event.target as IDBRequest<V>
            reject(target.error)
        }

        request.addEventListener('success', onsuccess)
        request.addEventListener('error', onerror)
    }) as Promise<V>

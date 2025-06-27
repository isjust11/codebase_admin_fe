export const SOCKET_CONNECT = 'SOCKET_CONNECT'
export const SOCKET_DISCONNECT = 'SOCKET_DISCONNECT'
export const SOCKET_EMIT = 'SOCKET_EMIT'
export const SOCKET_ON = 'SOCKET_ON'
export const SOCKET_OFF = 'SOCKET_OFF'
export const SOCKET_QUEUED = 'SOCKET_QUEUED'
export const SOCKET_ERROR = 'SOCKET_ERROR'

// order event
export const NEW_ORDER =  'newOrder';

interface SocketConnectAction {
  type: typeof SOCKET_CONNECT
}

interface SocketDisconnectAction {
  type: typeof SOCKET_DISCONNECT
}

interface SocketEmitAction {
  type: typeof SOCKET_EMIT
  event: string
  payload: unknown
}

interface SocketOnAction {
  type: typeof SOCKET_ON
  event: string
  callback: (data: unknown, dispatch: any) => void
}

interface SocketOffAction {
  type: typeof SOCKET_OFF
  event: string
}

export type SocketActionTypes = 
  | SocketConnectAction 
  | SocketDisconnectAction 
  | SocketEmitAction 
  | SocketOnAction 
  | SocketOffAction

export const socketConnect = (): SocketConnectAction => ({
  type: SOCKET_CONNECT,
})

export const socketDisconnect = (): SocketDisconnectAction => ({
  type: SOCKET_DISCONNECT,
})

export const socketEmit = (event: string, payload: unknown): SocketEmitAction => ({
  type: SOCKET_EMIT,
  event,
  payload,
})

export const socketOn = (
  event: string, 
  callback: (data: unknown, dispatch: any) => void
): SocketOnAction => ({
  type: SOCKET_ON,
  event,
  callback,
})

export const socketOff = (event: string): SocketOffAction => ({
  type: SOCKET_OFF,
  event,
})


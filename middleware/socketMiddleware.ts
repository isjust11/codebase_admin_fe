import { 
  SOCKET_CONNECT,
  SOCKET_DISCONNECT,
  SOCKET_EMIT,
  SOCKET_ON,
  SOCKET_OFF,
  SocketActionTypes
 } from '@/store/actions/socketAction'
import { Middleware } from '@reduxjs/toolkit'
import { Socket } from 'socket.io-client'

// Cấu hình timeout và retry
const EVENT_TIMEOUT = 5000; // 5 giây
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 giây
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 1000;

interface EventTimeout {
  timeoutId: NodeJS.Timeout;
  retries: number;
}

// Queue để lưu các event khi mất kết nối
interface QueuedEvent {
  event: string;
  payload: any;
}
const eventQueue: QueuedEvent[] = [];

const eventTimeouts = new Map<string, EventTimeout>();

const clearEventTimeout = (eventName: string) => {
  const timeout = eventTimeouts.get(eventName);
  if (timeout) {
    clearTimeout(timeout.timeoutId);
    eventTimeouts.delete(eventName);
  }
};

const handleEventWithTimeout = (
  socket: Socket,
  event: string,
  payload: any,
  dispatch: any,
  retryCount = 0
) => {
  clearEventTimeout(event);

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff
        const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount);
        
        dispatch({
          type: 'socket/retry',
          payload: { event, retryCount: retryCount + 1 }
        });

        setTimeout(() => {
          handleEventWithTimeout(socket, event, payload, dispatch, retryCount + 1);
        }, backoffTime);
      } else {
        dispatch({
          type: 'socket/error',
          payload: { error: `Sự kiện ${event} đã hết thời gian chờ sau ${MAX_RETRIES} lần thử` }
        });
        reject(new Error(`Event timeout: ${event}`));
      }
    }, EVENT_TIMEOUT);

    eventTimeouts.set(event, { timeoutId, retries: retryCount });

    socket.emit(event, payload, (response: any) => {
      clearEventTimeout(event);
      resolve(response);
    });
  });
};

export const socketMiddleware = (socket: Socket): Middleware => (store) => (next) => (action: any) => {
  console.log('run socket middle ware:', action);

  switch (action.type) {
    case SOCKET_CONNECT:
      console.log('Connecting to socket... 1')
      // Cấu hình reconnect
      socket.io.reconnectionAttempts(RECONNECTION_ATTEMPTS);
      socket.io.reconnectionDelay(RECONNECTION_DELAY);
      socket.connect()
      break

    case SOCKET_DISCONNECT:
      socket.disconnect()
      // Xóa tất cả các timeout khi disconnect
      eventTimeouts.forEach((_, eventName) => clearEventTimeout(eventName));
      break

    case SOCKET_EMIT:
      if (!socket.connected) {
        // Nếu không có kết nối, thêm vào queue
        eventQueue.push({
          event: action.event,
          payload: action.payload
        });
        store.dispatch({
          type: 'socket/queued',
          payload: { event: action.event }
        });
      } else {
        handleEventWithTimeout(socket, action.event, action.payload, store.dispatch)
          .catch((error) => {
            console.error('Socket emit error:', error);
          });
      }
      break

    case SOCKET_ON:
      const timeoutCallback = (data: unknown) => {
        clearEventTimeout(action.event);
        if (action.callback) {
          action.callback(data, store.dispatch)
        }
      }
      console.log('run socket on:')

      socket.on(action.event, timeoutCallback)
      break

    case SOCKET_OFF:
      socket.off(action.event)
      clearEventTimeout(action.event)
      break

    default:
      return next(action)
  }

  return next(action)
}
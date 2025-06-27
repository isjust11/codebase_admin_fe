import { SOCKET_CONNECT, SOCKET_DISCONNECT, SOCKET_EMIT, SOCKET_ON, SOCKET_OFF, SOCKET_ERROR } from "./actions/socketAction";

// Định nghĩa interface cho socket state
interface SocketState {
    isConnected: boolean;
    lastMessage: any;
    error: string | null;
    reconnectAttempts: number;
    events: { [key: string]: boolean };
    retries: {
      [key: string]: {
        count: number;
        lastAttempt: number;
      };
    };
  }
  
  const initialState: SocketState = {
    isConnected: false,
    lastMessage: null,
    error: null,
    reconnectAttempts: 0,
    events: {},
    retries: {}
  };
const socketReducer = (state = initialState, action: any) => {
  console.log('Socket reducer action: 2', action); 
  console.log('Socket reducer state:', state);
    switch (action.type) {
      case SOCKET_CONNECT:
        return {
          ...state,
          isConnected: true,
          error: null,
          reconnectAttempts: 0,
          retries: {}
        };
      case SOCKET_DISCONNECT:
        return {
          ...state,
          isConnected: false,
          events: {},
          retries: {}
        };
      case SOCKET_EMIT:
        return {
          ...state,
          lastMessage: action.payload
        };
      case SOCKET_ON:
        return {
          ...state,
          events: {
            ...state.events,
            [action.event]: true
          }
        };
      case SOCKET_OFF:
        const newEvents = { ...state.events };
        delete newEvents[action.event];
        return {
          ...state,
          events: newEvents
        };
      case SOCKET_ERROR:
        return {
          ...state,
          error: action.payload.error,
          isConnected: false
        };
      case 'socket/reconnecting':
        return {
          ...state,
          reconnectAttempts: action.payload.reconnectAttempts
        };
      case 'socket/retry':
        const { event, retryCount } = action.payload;
        return {
          ...state,
          retries: {
            ...state.retries,
            [event]: {
              count: retryCount,
              lastAttempt: Date.now()
            }
          }
        };
      default:
        return state;
    }
  };
  export { socketReducer };
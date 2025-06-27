// clients/components/OrderComponent.tsx
import { useEffect, useCallback } from 'react';
import { RootState } from '@/store';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { SOCKET_CONNECT, SOCKET_DISCONNECT, SOCKET_ON } from './actions/socketAction';
import SocketStatus from '@/components/SocketStatus';

const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

const SocketManager = () => {
  const dispatch = useAppDispatch();
  const { isConnected, error, reconnectAttempts, retries } = useAppSelector((state: RootState) => state.socket);
  
  // Lấy event đang retry gần nhất
  const currentRetry = Object.entries(retries).reduce((latest, [event, data]) => {
    if (!latest || data.lastAttempt > latest.lastAttempt) {
      return { event, ...data };
    }
    return latest;
  }, null as null | { event: string; count: number; lastAttempt: number });

  // Tách riêng hàm connect để có thể tái sử dụng
  const connect = useCallback(() => {
    console.log('Đang kết nối đến socket...');
    dispatch({ type: SOCKET_CONNECT });
  }, [dispatch]);

  // Tách riêng hàm socketOn để có thể tái sử dụng
  const socketOn = useCallback(() => {
    dispatch({
      type: SOCKET_ON,
      event: SOCKET_ON,
      callback: (data: any) => {
        console.log('Nhận được dữ liệu:', data);
      }
    });
  }, [dispatch]);

  // Xử lý reconnect với useCallback để tránh tạo lại function mỗi lần render
  const handleReconnect = useCallback(() => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const nextAttempt = reconnectAttempts + 1;
      console.log(`Thử kết nối lại lần ${nextAttempt}/${MAX_RECONNECT_ATTEMPTS}`);
      
      dispatch({
        type: 'socket/reconnecting',
        payload: { reconnectAttempts: nextAttempt }
      });

      // Tăng thời gian chờ giữa các lần thử lại (exponential backoff)
      const delay = RECONNECT_INTERVAL * Math.pow(1.5, nextAttempt - 1);
      
      return setTimeout(() => {
        connect();
        socketOn();
      }, delay);
    } else {
      console.log('Đã vượt quá số lần thử kết nối lại tối đa');
      dispatch({
        type: 'socket/error',
        payload: { error: 'Không thể kết nối đến server sau nhiều lần thử' }
      });
      return null;
    }
  }, [reconnectAttempts, dispatch, connect, socketOn]);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout | null = null;

    // Khởi tạo kết nối ban đầu
    connect();
    socketOn();

    // Lắng nghe sự kiện disconnect từ socket
    const handleDisconnect = () => {
      console.log('Mất kết nối socket, bắt đầu thử kết nối lại...');
      reconnectTimer = handleReconnect();
    };


    // Cleanup function
    return () => {
      dispatch({ type: SOCKET_DISCONNECT });
      // Remove socket listeners
      dispatch({
        type: SOCKET_ON,
        event: SOCKET_ON
      });
      dispatch({
        type: SOCKET_ON,
        event: 'disconnect'
      });
      // Clear reconnect timer
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [dispatch, connect, socketOn, handleReconnect]);


  return (
    <div>
      <div className="fixed bottom-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
          </span>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
        {reconnectAttempts > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Đang thử kết nối lại (Lần {reconnectAttempts}/{MAX_RECONNECT_ATTEMPTS})
          </p>
        )}
        {currentRetry && (
          <p className="text-xs text-yellow-500 mt-1">
            Đang thử lại sự kiện "{currentRetry.event}" (Lần {currentRetry.count})
          </p>
        )}
      </div>
    </div>
  );
};

export default SocketManager;
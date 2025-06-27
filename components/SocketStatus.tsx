import { RootState } from '@/store';
import { useAppSelector } from '@/hooks/useAppSelector';

const SocketStatus = () => {
  const { isConnected, error, reconnectAttempts, retries } = useAppSelector((state: RootState) => state.socket);

  // Lấy event đang retry gần nhất
  const currentRetry = Object.entries(retries).reduce((latest, [event, data]) => {
    if (!latest || data.lastAttempt > latest.lastAttempt) {
      return { event, ...data };
    }
    return latest;
  }, null as null | { event: string; count: number; lastAttempt: number });

  return (
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
          Đang thử kết nối lại (Lần {reconnectAttempts})
        </p>
      )}

      {currentRetry && (
        <p className="text-xs text-yellow-500 mt-1">
          Đang thử lại sự kiện "{currentRetry.event}" (Lần {currentRetry.count})
        </p>
      )}
    </div>
  );
};

export default SocketStatus; 
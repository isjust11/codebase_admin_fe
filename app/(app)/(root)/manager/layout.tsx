'use client';
import { ReactNode, useEffect } from 'react';
// import { useSocket } from '@/hooks/useSocket';
// import { toast } from 'sonner';

interface ManagerLayoutProps {
  children: ReactNode;
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  // const { subscribeToEvent, unsubscribeFromEvent, joinRoom, leaveRoom } = useSocket();

  // useEffect(() => {
  //   // Đăng ký lắng nghe các sự kiện
  //   const handleTableCreated = (data: any) => {
  //     toast.success('Bàn mới đã được tạo', {
  //       description: `Bàn ${data.name} đã được thêm vào hệ thống`,
  //     });
  //   };

  //   const handleTableUpdated = (data: any) => {
  //     toast.info('Thông tin bàn đã được cập nhật', {
  //       description: `Bàn ${data.name} đã được cập nhật`,
  //     });
  //   };

  //   const handleTableDeleted = (data: any) => {
  //     toast.warning('Bàn đã bị xóa', {
  //       description: `Bàn với ID ${data.id} đã bị xóa khỏi hệ thống`,
  //     });
  //   };

  //   subscribeToEvent('tableCreated', handleTableCreated);
  //   subscribeToEvent('tableUpdated', handleTableUpdated);
  //   subscribeToEvent('tableDeleted', handleTableDeleted);

  //   joinRoom('manager');
  //   // Cleanup khi component unmount
  //   return () => {
  //     unsubscribeFromEvent('tableCreated', handleTableCreated);
  //     unsubscribeFromEvent('tableUpdated', handleTableUpdated);
  //     unsubscribeFromEvent('tableDeleted', handleTableDeleted);
  //   };
  // }, [subscribeToEvent, unsubscribeFromEvent, joinRoom, leaveRoom]);

  return (
    <div>
      {children}
    </div>
  );
} 
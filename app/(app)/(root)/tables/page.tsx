'use client'
import { getAllTables } from '@/services/table-api';
import { Table } from '@/types/table';
import { Plus, Utensils } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { toast } from 'sonner';
import { NEW_ORDER, SOCKET_ON } from '@/store/actions/socketAction';
import { useAppDispatch } from '@/hooks/useAppDispatch';

const TablesPage = () => {
    const dispatch = useAppDispatch();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const fetchTables = async () => {
        try {
            setLoading(true);
            const response = await getAllTables();
            setTables(response);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải danh sách bàn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
        socketOn();
          // Cleanup function
    return () => {
        // Remove socket listeners
        dispatch({
          type: SOCKET_ON,
          event: NEW_ORDER
        });
      };
    }, [dispatch]);
    const socketOn = useCallback(() => {
        dispatch({
          type: SOCKET_ON,
          event: NEW_ORDER,
          callback: (data: any) => {
            console.log('Dữ liệu order:', data);
            // Cập nhật trạng thái bàn khi có order mới
            setTables(prevTables => {
              return prevTables.map(table => {
                if (table.id === data.tableId) {
                  return {
                    ...table,
                    tableStatus: {
                      ...table.tableStatus,
                      name: 'occupied'
                    }
                  };
                }
                return table;
              });
            });
          }
        });
      }, [dispatch]);
    return (
        <div>
            <PageBreadcrumb pageTitle="Danh sách bàn" />
            <div className="space-y-6">
                <ComponentCard title="Danh sách bàn">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tables.map((table) => (
                            <div key={table.id} className="p-6 bg-card text-card-foreground rounded-lg border 
                            border-border hover:border-primary/50 transition-colors shadow-sm">
                                <div className="flex items-center justify-between mb-4 ">
                                    <h2 className="text-xl font-semibold">{table.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm ${table.tableStatus.name === 'available'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {table?.tableStatus.name ?? 'Đang sử dụng'}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    <span dangerouslySetInnerHTML={{ __html: table.description || 'Không có mô tả' }}></span>
                                </p>
                                <Link href={`/tables/order/${table.id}`}>
                                    <Button className="w-full flex items-center justify-center p-3 font-medium rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600 text-white">
                                        <Utensils className="mr-2" size={16} />
                                        Đặt món
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </ComponentCard>
            </div>
        </div>
    )
}

export default TablesPage

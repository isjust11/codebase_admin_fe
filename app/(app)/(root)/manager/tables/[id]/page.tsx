'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, ArrowLeft, QrCode, QrCodeIcon, ImageDown } from 'lucide-react';
import { getTableById, deleteTable } from '@/services/table-api';
import { Table } from '@/types/table';
import { toast } from 'sonner';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { mergeImageUrl, unicodeToEmoji } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Badge from '@/components/ui/badge/Badge';
import ComponentCard from '@/components/common/ComponentCard';
import { Action } from '@/types/actions';

export default function TableDetail() {
    const params = useParams();
    const router = useRouter();
    const [table, setTable] = useState<Table | null>(null);
    const [loading, setLoading] = useState(true);
    const id = params.id as string;
    useEffect(() => {
        const fetchTable = async () => {
            try {
                const response = await getTableById(id);
                setTable(response);
            } catch (error) {
                toast.error('Có lỗi xảy ra khi tải thông tin bàn');
            } finally {
                setLoading(false);
            }
        };

        fetchTable();
    }, [params.id]);

    const handleDelete = async () => {
        if (!table) return;

        try {
            await deleteTable(table.id);
            toast.success('Bàn đã được xóa thành công');
            router.push('/manager/tables');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa bàn');
        }
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (!table) {
        return <div className='max-w-full center'>Không tìm thấy thông tin bàn</div>;
    }

    const lstAction: Action[] = [
        {
            icon: <Pencil className="mr-2 h-4 w-4" />,
            onClick: () => router.push(`/manager/tables/update/${table.id}`),
            title: 'Chỉnh sửa',
            variant: 'primary',
            className: 'bg-primary-400 hover:bg-primary-500 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'
        },
        {
            icon: <QrCodeIcon className="mr-2 h-4 w-4" />,
            onClick: () => router.push(`/manager/tables/qrcodes/${table.id}`),
            title: 'QR Code',
            variant: 'outline',
            className: 'hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'
        },
        {
            icon: <Trash className="mr-2 h-4 w-4" />,
            onClick: () => handleDelete(),
            title: 'Xóa',
            variant: 'outline',
            className: 'bg-red-500 hover:bg-red-600 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'
        },
    ]

    return (
        <div>
            <PageBreadcrumb
                pageTitle="Chi tiết bàn"
                items={[
                    { title: 'Danh sách bàn', href: '/manager/tables' },
                    { title: table.name, href: '#' }
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Thông tin chi tiết" listAction={lstAction}>
                    <div className="flex gap-6">
                        <div className="w-1/3">
                            {table.imageUrl ? (
                                <Image
                                    width={350}
                                    height={300}
                                    src={mergeImageUrl(table.imageUrl)}
                                    alt={table.name}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-500">
                                        <ImageDown />
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="w-2/3 space-y-4">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold">{table.name}</h2>
                                {
                                    table.tableStatus ?
                                        <Badge
                                            className={table.tableStatus.name ? 'ring-green-400' : 'ring-red-400'}
                                            variant="light"
                                            color={table.tableStatus.name ? 'success' : 'error'}
                                        >
                                            {table.tableStatus.name ? 'Đang bán' : 'Ngừng bán'}
                                        </Badge> :
                                        <></>
                                }
                            </div>

                            <div className="space-y-2">
                                <div className="flex mb-3 border-b border-gray-300 pb-3">
                                    <span className="w-32">Tên bàn:</span>
                                    <span className="text-lg">
                                        {table.name}
                                    </span>
                                </div>

                                <div className="flex items-center  mb-3 border-b border-gray-300 pb-3">
                                    <span className="w-32">Số lượng khách:</span>
                                    <span className="text-lg">
                                        {table.capacity}
                                    </span>
                                </div>

                                <div className="flex items-center mb-3 border-b border-gray-200/100 pb-3">
                                    <span className="w-32">Loại bàn:</span>
                                    <div className="flex">
                                        {table.tableType?.icon && (
                                            <span className="mr-2">{unicodeToEmoji(table.tableType.icon)}</span>
                                        )}
                                        <span>{table.tableType?.name}</span>
                                    </div>
                                </div>

                                <div className="flex items-center mb-3 border-b border-gray-200/100 pb-3">
                                    <span className="w-32">Loại bàn:</span>
                                    <div className="flex">
                                        {table.tableArea?.icon && (
                                            <span className="mr-2">{unicodeToEmoji(table.tableArea.icon)}</span>
                                        )}
                                        <span>{table.tableArea?.name}</span>
                                    </div>
                                </div>
                                <div className="flex mb-3 ">
                                    <span className="w-32">Mô tả:</span>
                                    <div className="flex px-3 py-2 border border-gray-200/100 rounded-md w-full min-h-20 bg-gray-50">
                                        <span dangerouslySetInnerHTML={{ __html: table.description || 'Không có mô tả' }}></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}

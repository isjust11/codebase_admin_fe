'use client';

import { useEffect, useRef, useState } from 'react';
import { getTables } from '@/services/table-api';
import { Table } from '@/types/table';
import { Button } from '@/components/ui/button';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import Link from 'next/link';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Action } from '@/types/actions';
import { useRouter } from 'next/navigation';
import { List, Printer } from 'lucide-react';
import React from "react";
import { useReactToPrint } from 'react-to-print';
export default function TableQRCodesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [search, setSearch] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tablesData = await getTables({ page: pageIndex + 1, size: pageSize, search });
        setPageCount(Math.ceil(tablesData.total / pageSize));
        setTables(tablesData.data);
      } catch (_error) {
        console.error('Error fetching tables:', _error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handlePrintAll = useReactToPrint({
    contentRef,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mã QR code các bàn</h1>
          <Link href="/manager/tables">
            <Button variant="outline">Quản lý bàn</Button>
          </Link>
        </div>

        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Thêm mới bàn</h2>
          <p className="text-gray-500 mb-6">Tạo bàn mới.</p>
          <Link href="/manager/tables/create">
            <Button>Créer une table</Button>
          </Link>
        </div>
      </div>
    );
  }
  const lstActions: Action[] = [
    { title: 'In tất cả mã QR', onClick: handlePrintAll, icon: <Printer className="w-4 h-4" /> },
    {
      title: 'Quản lý bàn', onClick: () => {
        router.push('/manager/tables')
      }, icon: <List className="w-4 h-4" />
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Danh sách mã qr code" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách mã " listAction={lstActions}>
          <div ref={contentRef} className="lst-card">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" >
              {tables.map((table) => (
                <div key={table.id} className="overflow-hidden bg-white shadow-md rounded-lg p-4 ring-1 ring-gray-200">

                  <QRCodeGenerator
                    tableId={table.id}
                    tableName={table.name}
                    showPrint={true}
                    showDownload={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
} 
'use client';

import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import Link from 'next/link';

const managementModules = [
  {
    title: 'Quản lý bàn',
    description: 'Thêm, sửa, xóa và quản lý các bàn trong nhà hàng',
    href: '/manager/tables'
  },
  {
    title: 'Quản lý món ăn',
    description: 'Quản lý danh sách món ăn, giá cả và danh mục',
    href: '/manager/food-items'
  },
  {
    title: 'Quản lý đơn hàng',
    description: 'Xem và quản lý các đơn đặt hàng',
    href: '/manager/orders'
  },
  {
    title: 'Quản lý nhân viên',
    description: 'Quản lý thông tin và phân quyền nhân viên',
    href: '/manager/users'
  },
  {
    title: 'Quản lý media',
    description: 'Quản lý hình ảnh và video',
    href: '/manager/media'
  }
];

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="p-6 hover:bg-accent cursor-pointer transition-colors">
              <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
              <p className="text-muted-foreground">{module.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Hoạt động gần đây</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Hoạt động</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">10:30 AM</TableCell>
              <TableCell>Thêm món ăn mới</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Hoàn thành</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
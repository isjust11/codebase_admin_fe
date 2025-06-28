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
import { useTranslations } from 'next-intl';

export default function ManagerDashboard() {
  const t = useTranslations("DashboardPage");

  const managementModules = [
    {
      title: t('modules.tables.title'),
      description: t('modules.tables.description'),
      href: '/manager/tables'
    },
    {
      title: t('modules.foodItems.title'),
      description: t('modules.foodItems.description'),
      href: '/manager/food-items'
    },
    {
      title: t('modules.orders.title'),
      description: t('modules.orders.description'),
      href: '/manager/orders'
    },
    {
      title: t('modules.users.title'),
      description: t('modules.users.description'),
      href: '/manager/users'
    },
    {
      title: t('modules.media.title'),
      description: t('modules.media.description'),
      href: '/manager/media'
    }
  ];

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
        <h2 className="text-2xl font-semibold mb-4">{t('recentActivity')}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('time')}</TableHead>
              <TableHead>{t('activity')}</TableHead>
              <TableHead>{t('performer')}</TableHead>
              <TableHead>{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">10:30 AM</TableCell>
              <TableCell>{t('sampleActivity.addFoodItem')}</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>{t('completed')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
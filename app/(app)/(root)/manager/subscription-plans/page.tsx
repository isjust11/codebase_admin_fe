'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowLeftRight, ArrowUp, BadgeInfo, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { getSubscriptionPlans, deleteSubscriptionPlan, updateSubscriptionPlan } from '@/services/subscription-plan-api'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import Badge from '@/components/ui/badge/Badge'
import { Action } from '@/types/actions'
import { SubscriptionPlan } from '@/types/subscription-plan'
import { useTranslations } from 'next-intl'
import { AlertDialogUtils } from '@/components/AlertDialogUtils'
import { DataTable } from '@/components/DataTable'

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === 'string' ? Number(bytes) : bytes;
  if (b === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

function formatPrice(price?: number): string {
  if (price == null || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

const SubscriptionPlansPage = () => {
  const { navigateTo } = useLoading()
  const t = useTranslations('SubscriptionPlans')
  const tUtils = useTranslations('Utils')

  const columns: ColumnDef<SubscriptionPlan>[] = [
    {
      accessorKey: "sortOrder",
      header: "#",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 text-center font-mono">
          {row.getValue("sortOrder") as number}
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: t('code'),
      cell: ({ row }) => {
        const code = row.getValue("code") as string;
        const colorMap: Record<string, string> = {
          basic: 'info',
          advanced: 'warning',
          ultra: 'error',
        };
        return (
          <Badge variant="light" color={(colorMap[code] || 'primary') as any}>
            {code.toUpperCase()}
          </Badge>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t('name')}
          {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-bold">{row.getValue('name') as string}</div>
      ),
    },
    {
      accessorKey: "price",
      header: t('price'),
      cell: ({ row }) => (
        <div className="text-sm font-semibold text-green-600">
          {formatPrice(row.getValue("price") as number)}
        </div>
      ),
    },
    {
      accessorKey: "storageLimitBytes",
      header: t('storage'),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {formatBytes(row.getValue("storageLimitBytes") as string)}
        </div>
      ),
    },
    {
      accessorKey: "ttsLimitPerPeriod",
      header: t('ttsLimit'),
      cell: ({ row }) => {
        const val = row.getValue("ttsLimitPerPeriod") as number;
        return <div className="text-sm text-gray-600 text-center">{val === 0 ? '∞' : val}</div>;
      },
    },
    {
      accessorKey: "convertLimitPerPeriod",
      header: t('convertLimit'),
      cell: ({ row }) => {
        const val = row.getValue("convertLimitPerPeriod") as number;
        return <div className="text-sm text-gray-600 text-center">{val === 0 ? '∞' : val}</div>;
      },
    },
    {
      accessorKey: "periodType",
      header: t('period'),
      cell: ({ row }) => {
        const period = row.getValue("periodType") as string;
        return (
          <Badge variant="light" color="primary">
            {period === 'month' ? t('monthly') : t('yearly')}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: t('status'),
      cell: ({ row }) => {
        const active = row.getValue("isActive") as boolean;
        return (
          <Badge className={active ? 'ring-green-400' : 'ring-red-400'} variant="light" color={active ? 'success' : 'error'}>
            {active ? t('active') : t('inactive')}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-sm rounded-xs">
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => navigateTo(`/manager/subscription-plans/${plan.id}`)}
                >
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetail')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-violet-500 dark:text-white"
                  onClick={() => handleToggleActive(plan)}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {plan.isActive ? tUtils('inactive') : tUtils('active')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300/20 text-blue-500"
                  onClick={() => navigateTo(`/manager/subscription-plans/update/${plan.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => handleDelete(plan)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ]

  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [dialogContent, setDialogContent] = useState('')

  const fetchPlans = async () => {
    try {
      const data = await getSubscriptionPlans()
      setPlans(data)
    } catch (error) {
      console.error('Error loading plans:', error)
      toast.error(t('errorLoading'))
    }
  }

  useEffect(() => { fetchPlans() }, [])

  const lstActions: Action[] = [
    {
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => navigateTo('/manager/subscription-plans/create'),
      title: t('addPlan'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]

  const handleDelete = (plan: SubscriptionPlan) => {
    setOpenDialog(true)
    setDialogContent(t('confirmDelete'))
    setSelectedPlan(plan)
  }

  const confirmDelete = async () => {
    try {
      if (!selectedPlan?.id) return
      await deleteSubscriptionPlan(String(selectedPlan.id))
      toast.success(t('deleteSuccess'))
    } catch (error) {
      toast.error(t('deleteError'))
    }
    fetchPlans()
    setOpenDialog(false)
  }

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      await updateSubscriptionPlan(String(plan.id), { isActive: !plan.isActive })
      fetchPlans()
      toast.success(t('success'))
    } catch (error) {
      toast.error(t('errorUpdating'))
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} items={[]} />
      <div className="space-y-6">
        <ComponentCard title={t('title')} listAction={lstActions}>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={plans}
              pageCount={1}
              onPaginationChange={() => {}}
              manualPagination={false}
            />
          </div>
        </ComponentCard>
        <AlertDialogUtils
          type="warning"
          isOpen={openDialog}
          onOpenChange={setOpenDialog}
          onConfirm={confirmDelete}
          title={t('deletePlan')}
          content={dialogContent}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onCancel={() => setOpenDialog(false)}
        />
      </div>
    </div>
  )
}

export default SubscriptionPlansPage

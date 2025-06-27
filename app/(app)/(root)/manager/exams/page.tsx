'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, BadgeInfo, ClipboardPenLine } from 'lucide-react';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { createExam, deleteExam, getAllExam, getExams, updateExam } from '@/services/exam-api';
import { Exam } from '@/types/exam';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import { Action } from '@/types/actions';
import Badge from '@/components/ui/badge/Badge';
import { useAsyncEffect } from '@/hooks/useAsyncEffect';
import { ExamForm } from './components/ExamForm';
import { useRouter } from 'next/navigation';

export default function ExamsManagement() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState('');
  const { isOpen, openModal, closeModal } = useModal();

  const columns: ColumnDef<Exam>[] = [
    {
      id: "select",
      accessorKey: "id",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Chọn hàng này"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên bài thi
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Mô tả",
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("isActive") as boolean
        return (
          <Badge variant="light" color={status === true ? 'success' : 'error'} >
            {status == true ? 'Hoạt động' : 'Ngừng hoạt động'}
          </Badge>
        )
      },
    },
    {
      accessorKey:"examQuestions",
      header:"Số câu hỏi",
      cell: ({ row }) => {
        const examQuestions = row.getValue("examQuestions") as any;
        return (
          <Badge variant="light" color='primary' >
            {examQuestions.length +' câu hỏi'}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: 'Thao tác',
      cell: ({ row }) => {
        const exam = row.original as Exam;
        const handleDelete = async (id: string) => {
          try {
            await deleteExam(String(id));
            toast.success('Bài thi đã được xóa thành công');
            // Refresh data
            await fetchData();
            setSelectedExam(null);
          } catch (_error) {
            toast.error('Có lỗi xảy ra khi xóa bài thi');
          }
        }
        return (
          <div className="p-2 ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='bg-white shadow-sm rounded-xs '>
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => router.push(`/manager/exams/${exam.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-start px-4 text-blue-800 py-2 cursor-pointer hover:bg-blue-800/20"
                  onClick={() => router.push(`/manager/exams/editor/${exam.id}`)}>
                  <ClipboardPenLine className="mr-2 h-4 w-4 text-blue-800" />
                  Soạn câu hỏi
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20'
                  onClick={() => {
                    setSelectedExam(exam);
                    openModal();
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => {
                    if (exam.id) {
                      handleDelete(exam.id);
                    }
                  }}>
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const fetchData = async () => {
    setLoading(true);
    try {
      const examsData = await getExams({ page: pageIndex + 1, size: pageSize, search: search });
      setExams(examsData.data);
      setPageCount(examsData.totalPages)
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useAsyncEffect(async () => {
    await fetchData();
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleSave = async (values: any) => {
    try {
      setLoading(true)
      console.log(values)
      if (selectedExam) {
        await updateExam(String(selectedExam.id), values);
        toast.success('Cập nhật bài thi thành công');
      } else {
        await createExam(values);
        toast.success('Tạo bài thi thành công');
      }
      closeModal();
      // Refresh data
      await fetchData();
      setSelectedExam(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const listAction: Action[] = [
    {
      title: 'Thêm bài thi',
      icon: <Plus className="mr-2 h-4 w-4" />,
      onClick: () => {
        setSelectedExam(null);
        openModal();
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
      variant: 'primary',
    },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Danh sách bài thi" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách bài thi" listAction={listAction}>
          <DataTable
            columns={columns}
            data={exams}
            pageCount={pageCount}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearch}
            manualPagination={true}
            getRowChildren={(row) => (row as any).children}
          />
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[600px] p-5 lg:p-10"
          >
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
              {selectedExam ? 'Cập nhật bài thi' : 'Thêm bài thi mới'}
            </h4>
            <ExamForm
              initialData={selectedExam}
              onSubmit={handleSave}
              onCancel={closeModal}
            />
          </Modal>
        </ComponentCard>
      </div>
    </div>
  );
}
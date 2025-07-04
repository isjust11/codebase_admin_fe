"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  SortingState,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from "react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { ChevronDown, Search } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  onSearchChange?: (search: string) => void
  manualPagination?: boolean
  getRowChildren?: (row: TData) => TData[] | undefined,
  allowPagination?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  onPaginationChange,
  onSearchChange,
  manualPagination = false,
  getRowChildren,
  allowPagination = true,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pageSize, setPageSize] = React.useState(10)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [search, setSearch] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({})

  const toggleRow = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }))
  }

  const getExpandedData = (data: TData[]): TData[] => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    return data.reduce((acc: TData[], row: TData) => {
      const rowId = (row as any).id?.toString()
      acc.push(row)
      
      if (rowId && expandedRows[rowId] && getRowChildren) {
        const children = getRowChildren(row)
        if (children) {
          acc.push(...getExpandedData(children))
        }
      }
      
      return acc
    }, [])
  }

  const expandedData = getExpandedData(data)

  const table = useReactTable({
    data: expandedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize })
        setPageIndex(newState.pageIndex)
        if (onPaginationChange) {
          onPaginationChange(newState.pageIndex, pageSize)
        }
      }
    },
    manualPagination: manualPagination,
    pageCount: pageCount || 0,
  })

  function delay(callback: () => void, ms: number): void {
    const timeout = setTimeout(() => {
      callback();
      clearTimeout(timeout);
    }, ms);
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="relative flex items-center w-full max-w-sm mr-4">
          <Input
            placeholder="Tìm tên..."
            value={(search) ?? ""}
            className="input-focus dark:bg-white/[0.05] dark:text-white/90 dark:border-white/[0.05] pr-10"
            autoFocus
            onChange={(event) => {
              setSearch(event.target.value)
              delay(() => {
                onSearchChange!(event.target.value)
              }, 500)
            }}
          />
          <Search className="absolute right-2 text-gray-800 dark:text-white/90" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto dark:border-white/[0.05] dark:bg-white/[0.05] dark:text-white/90">
              Hiển thị <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="shadow-sm rounded-sm bg-white dark:bg-gray-800 dark:text-white/90 dark:border-white/[0.05]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {typeof column.columnDef.header === 'string' 
                      ? column.columnDef.header 
                      : column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border dark:border-white/[0.05] overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-500 dark:border-white/[0.05]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:border-white/[0.05]">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const rowData = row.original as any
                const hasChildren = getRowChildren ? (getRowChildren(rowData) ?? []).length > 0 : false
                const rowId = rowData.id?.toString()
                const isExpanded = rowId ? expandedRows[rowId] : false
                const isChild = rowData.parentId !== undefined && rowData.parentId !== null

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={isChild ? "bg-white dark:bg-white/[0.05] dark:text-gray-400 dark:color-white/[0.05]" : "bg-gray-50"}
                  >
                    {row.getVisibleCells().map((cell, index) => {
                      if (index === 0 && hasChildren) {
                        return (
                          <TableCell key={`${row.id}_${cell.id}`} className="flex items-center gap-2 sm:px-6 text-start dark:text-white/90">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(rowId!)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 mt-5" />
                              ) : (
                                <ChevronDown className="h-4 w-4 mt-5 rotate-[-90deg]" />
                              )}
                            </Button>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        )
                      }
                      return (
                        <TableCell key={`${row.id}_${cell.id}`} className="px-5 py-3 text-gray-800 dark:text-white/90">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có kết quả.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {allowPagination && <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground dark:text-gray-400">
          Đã chọn
          <span className="text-bold"> {table.getFilteredSelectedRowModel().rows.length} /{" "}
            {table.getFilteredRowModel().rows.length} </span>
        </div>
        {data.length > 0 ?
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium dark:text-gray-400">Số hàng trên trang</p>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  table.setPageIndex(0)
                }}
                className="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-sm dark:border-white/[0.05] dark:bg-white/[0.05] dark:text-white/90"
                aria-label="Số hàng trên trang"
              >
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
               className="dark:border-white/[0.05] dark:bg-white/[0.05] dark:text-white/90"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((page) => (
              <Button
                // className="text-white"
                key={page}
                variant={table.getState().pagination.pageIndex === page - 1 ? "default" : "outline"}
                 className="dark:border-white/[0.05] dark:bg-white/[0.05] dark:text-white/90"
                size="sm"
                onClick={() => table.setPageIndex(page - 1)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              className="dark:border-white/[0.05] dark:bg-white/[0.05] dark:text-white/90"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div> :
          <></>
        }
      </div>}
    </div>
  )
}

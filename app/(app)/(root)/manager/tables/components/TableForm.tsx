import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createTable, getCategoryByCode, getTable, updateTable } from '@/services/manager-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { useDropzone } from "react-dropzone";
import { Category } from '@/types/category';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { unicodeToEmoji, mergeImageUrl, base64decrypt } from '@/lib/utils';
import { Table } from '@/types/table';

const TableForm = () => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tableTypeCategory, setTableTypeCategory] = useState<Category[]>([]);
  const [tableStatusCategory, setTableStatusCategory] = useState<Category[]>([]);
  const [tableAreaCategory, setTableAreaCategory] = useState<Category[]>([]);
  const [selectedTableType, setSelectedTableType] = useState<Category | null>(null);
  const [selectedTableStatus, setSelectedTableStatus] = useState<Category | null>(null);
  const [selectedTableArea, setSelectedTableArea] = useState<Category | null>(null);
  const [table, setTable] = useState<Table>();
  const [formData, setFormData] = useState<Partial<Table>>({
    name: '',
    description: '',
    imageUrl: '',
    capacity: 0,
    areaId: undefined,
    tableStatusId: undefined,
    tableTypeId: undefined,
    qrCodeUrl: '',
  });
  const id = params.id as string;

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const title = id ? 'Cập nhật bàn' : 'Thêm bàn mới';
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadTable(id.toString());
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (formData.tableTypeId && tableTypeCategory.length > 0) {
      const tableType = tableTypeCategory.find(cat => cat.id === formData.tableTypeId);
      setSelectedTableType(tableType || null);
    }

    if (formData.tableStatusId && tableStatusCategory.length > 0) {
      const tableStatus = tableStatusCategory.find(cat => cat.id === formData.tableStatusId);
      setSelectedTableStatus(tableStatus || null);
    }

    if (formData.areaId && tableAreaCategory.length > 0) {
      const tableArea = tableAreaCategory.find(cat => cat.id === formData.areaId);
      setSelectedTableArea(tableArea || null);
    }
  }, [formData.tableTypeId, formData.tableStatusId, formData.areaId, tableTypeCategory, tableStatusCategory, tableAreaCategory]);

  const loadTable = async (id: string) => {
    try {
      const tableData = await getTable(id);
      setTable(tableData)
      setFormData({
        name: tableData.name,
        description: tableData.description,
        imageUrl: tableData.imageUrl ? mergeImageUrl(tableData.imageUrl) : '',
        capacity: tableData.capacity,
        areaId: base64decrypt(tableData.areaId??''),
        tableStatusId: base64decrypt(tableData.tableStatusId??''),
        tableTypeId: base64decrypt(tableData.tableTypeId??''),
        qrCodeUrl: tableData.qrCodeUrl,
      });
      console.log(formData)
    } catch (_error) {
      toast.error('Không thể tải thông tin bàn');
      router.push('/manager/tables');
    }
  };

  const loadCategories = async () => {
    try {
      const [tableTypeCategory, tableStatusCategory, tableAreaCategory] = await Promise.all([
        getCategoryByCode('table-type'),
        getCategoryByCode('table-status'),
        getCategoryByCode('table-area')
      ]);

      setTableTypeCategory(tableTypeCategory);
      setTableStatusCategory(tableStatusCategory);
      setTableAreaCategory(tableAreaCategory)
    } catch (_error) {
      toast.error('Không thể load danh mục');
    }
  }
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let imageUrl = formData.imageUrl || '';

      // Upload image if there's a new file selected
      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile);
        imageUrl = uploadResponse.url;
      }

      const submitData = {
        ...formData,
        // Nếu là URL đầy đủ, chuyển về đường dẫn tương đối trước khi lưu
        imageUrl: imageUrl.startsWith('http') ? imageUrl.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : imageUrl
      };

      if (isEditing) {
        await updateTable(id, submitData);
        toast.success('Bàn đã được cập nhật thành công');
      } else {
        await createTable(submitData);
        toast.success('Bàn đã được thêm thành công');
      }
      router.push('/manager/tables');
    } catch (_error) {
      toast.error(isEditing ? 'Có lỗi xảy ra khi cập nhật bàn' : 'Có lỗi xảy ra khi thêm bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(e.target)
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSelectTableTypeChange = (value: string) => {
    if (value === '') return;
    const selectedCategory = tableTypeCategory.find((category) => category.id === value);
    setSelectedTableType(selectedCategory || null);
    setFormData(prev => ({
      ...prev,
      tableTypeId: value,
    }));
  };

  const handleSelectTableStatusChange = (value: string) => {
    if (value === '') return;
    const selectedCategory = tableStatusCategory.find((category) => category.id === value);
    setSelectedTableStatus(selectedCategory || null);
    setFormData(prev => ({
      ...prev,
      tableStatusId: value,
    }));
  };

  const handleSelectTableAreaChange = (value: string) => {
    if (value === '') return;
    const selectedCategory = tableAreaCategory.find((category) => category.id === value);
    setSelectedTableArea(selectedCategory || null);
    setFormData(prev => ({
      ...prev,
      areaId: value,
    }));
  };

  const changeDescription = (description: string) => {
    // Kiểm tra độ dài description
    if (description.length > 2500) {
      toast.error('Mô tả không được quá 2500 ký tự');
      return;
    }

    setFormData(prev => ({
      ...prev,
      description: description,
    }));
  }

  const listAction: Action[] = [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        router.back();
      },
      title: "Hủy",
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />,
      onClick: () => handleSubmit(),
      title: isEditing ? "Cập nhật" : "Thêm mới",
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Thêm mới bàn" items={[
        { title: 'Danh sách bàn', href: '/manager/tables' },
        { title: '', href: '#' }
      ]} />
      <div className="space-y-2">
        <ComponentCard title={title} listAction={listAction}>
          <div className="flex gap-6">
            {/* Phần upload hình ảnh - chiếm 3/10 */}
            <div className="w-3/10">
              <div className="space-y-2">
                <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
                  {previewUrl || formData.imageUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl || formData.imageUrl || ''}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        title="Xóa hình ảnh"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <form
                      {...getRootProps()}
                      className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                          ${isDragActive
                          ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                          : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                        }
                        `}
                      id="demo-upload"
                    >
                      {/* Hidden Input */}
                      <input {...getInputProps()} />

                      <div className="dz-message flex flex-col items-center m-0!">
                        {/* Icon Container */}
                        <div className="mb-[22px] flex justify-center">
                          <div className="flex h-[68px] w-[68px]  items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            <svg
                              className="fill-current"
                              width="29"
                              height="28"
                              viewBox="0 0 29 28"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Text Content */}
                        <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                          {isDragActive ? "Thả file vào đây" : "Kéo & và thả file vào đây"}
                        </h4>

                        <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                          Kéo và thả file PNG, JPG, WebP, SVG vào đây
                        </span>

                        <span className="font-medium underline text-theme-sm text-brand-500">
                          Chọn ảnh
                        </span>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Phần thông tin - chiếm 7/10 */}
            <div className="w-7/10">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên bàn</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder='Nhập tên bàn'
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Sức chứa</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableTypeId">Loại bàn</Label>
                    <Select value={selectedTableType?.id || formData.tableTypeId} onValueChange={(value) => handleSelectTableTypeChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn loại bàn" />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white" >
                        {tableTypeCategory?.length ? (tableTypeCategory?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex flex-start items-center">
                              <span className="text-2xl mr-2"> {type.icon && unicodeToEmoji(type.icon)}</span>
                              <span className="text-sm text-gray-500">{type.name}</span>
                            </div>
                          </SelectItem>
                        ))) : (
                          <div className='h-14 flex justify-items-center'>
                            Không có dữ liệu
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableStatusId">Trạng thái bàn</Label>
                    <Select value={selectedTableStatus?.id || formData.tableStatusId} onValueChange={(value) => handleSelectTableStatusChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn trạng thái bàn" />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white" >
                        {tableStatusCategory?.length ? (tableStatusCategory?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex flex-start items-center">
                              <span className="text-2xl mr-2"> {type.icon && unicodeToEmoji(type.icon)}</span>
                              <span className="text-sm text-gray-500">{type.name}</span>
                            </div>
                          </SelectItem>
                        ))) : (
                          <div className='h-14 flex justify-items-center'>
                            Không có dữ liệu
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaId">Khu vực</Label>
                    <Select value={selectedTableArea?.id || formData.areaId} onValueChange={(value) => handleSelectTableAreaChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn khu vực" />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white" >
                        {tableAreaCategory?.length ? (tableAreaCategory?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex flex-start items-center">
                              <span className="text-2xl mr-2"> {type.icon && unicodeToEmoji(type.icon)}</span>
                              <span className="text-sm text-gray-500">{type.name}</span>
                            </div>
                          </SelectItem>
                        ))) : (
                          <div className='h-14 flex justify-items-center'>
                            Không có dữ liệu
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <div className="ring-1 ring-gray-100/5 rounded-md shadow-sm p-2">
                    <SimpleEditor
                      key={table?.id || 'new'}
                      initialContent={table?.description || ''}
                      placeholder="Nhập mô tả bàn (tối đa 2500 ký tự)"
                      onContentChange={(content) => changeDescription(content)}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

export default TableForm;

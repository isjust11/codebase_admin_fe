import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createFolkMedicine, updateFolkMedicine, getFolkMedicine } from '@/services/folk-medicine-api';
import { uploadFile } from '@/services/media-api';
import { getAllCategories } from '@/services/category-api';
import { userApi } from '@/services/user-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Switch } from '@/components/ui/switch';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { useDropzone } from "react-dropzone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mergeImageUrl } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types/category';
import { User } from '@/types/user';
import { FolkMedicine, CreateFolkMedicineDto, UpdateFolkMedicineDto } from '@/types/folk-medicine';

const FolkMedicineForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [folkMedicine, setFolkMedicine] = useState<FolkMedicine | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState<CreateFolkMedicineDto>({
    title: '',
    summary: '',
    content: '',
    ingredients: '',
    preparation: '',
    usage: '',
    notes: '',
    thumbnail: '',
    authorId: undefined,
    categoryId: '',
    isActive: true,
  });

  const id = params.id?.toString();

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

  const title = id ? 'Cập nhật bài thuốc dân gian' : 'Thêm bài thuốc dân gian mới';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, usersData] = await Promise.all([
          getAllCategories(),
          userApi.getAll(),
        ]);
        setCategories(categoriesData);
        setUsers(usersData);
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
      }
    };

    fetchData();

    if (id) {
      setIsEditing(true);
      loadFolkMedicine(id);
    }
  }, [id]);

  const loadFolkMedicine = async (id: string) => {
    try {
      const data = await getFolkMedicine(id);
      setFolkMedicine(data);
      setFormData({
        title: data.title,
        summary: data.summary || '',
        content: data.content,
        ingredients: data.ingredients || '',
        preparation: data.preparation || '',
        usage: data.usage || '',
        notes: data.notes || '',
        thumbnail: data.thumbnail ? mergeImageUrl(data.thumbnail) : '',
        authorId: data.authorId,
        categoryId: data.categoryId || '',
        isActive: data.isActive,
      });
    } catch (_error) {
      toast.error('Không thể tải thông tin bài thuốc');
      router.push('/manager/folk-medicines');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let thumbnail = formData.thumbnail || '';

      // Upload image if there's a new file selected
      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile);
        thumbnail = uploadResponse.url;
      }

      const submitData = {
        ...formData,
        authorId: formData.authorId || user?.id,
        // Nếu là URL đầy đủ, chuyển về đường dẫn tương đối trước khi lưu
        thumbnail: thumbnail.startsWith('http') ? thumbnail.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : thumbnail,
      };

      if (isEditing) {
        await updateFolkMedicine(id || '', submitData);
        toast.success('Bài thuốc dân gian đã được cập nhật thành công');
      } else {
        await createFolkMedicine(submitData);
        toast.success('Bài thuốc dân gian đã được thêm thành công');
      }
      router.push('/manager/folk-medicines');
    } catch (_error) {
      toast.error(isEditing ? 'Có lỗi xảy ra khi cập nhật bài thuốc' : 'Có lỗi xảy ra khi thêm bài thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: keyof CreateFolkMedicineDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const changeContent = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: content,
    }));
  };

  const changeSummary = (summary: string) => {
    // Kiểm tra độ dài summary
    if (summary.length > 500) {
      toast.error('Tóm tắt không được quá 500 ký tự');
      return;
    }

    setFormData(prev => ({
      ...prev,
      summary: summary,
    }));
  };

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
      className: "hover:bg-green-100 dark:hover:bg-green-800 rounded-md transition-colors text-green-500",
      isLoading: loading
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={title} items={[
        { title: 'Danh sách bài thuốc dân gian', href: '/manager/folk-medicines' },
        { title: '', href: '#' }
      ]} />
      <div className="space-y-2">
        <ComponentCard title={title} listAction={listAction}>
          <div className="flex gap-6">
            {/* Phần upload hình ảnh - chiếm 3/10 */}
            <div className="w-3/10">
              <div className="space-y-2">
                <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
                  {previewUrl || formData.thumbnail ? (
                    <div className="relative">
                      <img
                        src={previewUrl || formData.thumbnail || ''}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        title="Xóa hình ảnh"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setFormData(prev => ({ ...prev, thumbnail: '' }));
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
                    <Label htmlFor="title">Tên bài thuốc *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder='Nhập tên bài thuốc'
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Danh mục</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleSelectChange('categoryId', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorId">Tác giả</Label>
                    <Select
                      value={formData.authorId?.toString()}
                      onValueChange={(value) => handleSelectChange('authorId', parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn tác giả" />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isActive">Trạng thái</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleSelectChange('isActive', checked)}
                      />
                      <span className="text-sm text-gray-600">
                        {formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Tóm tắt</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder='Nhập tóm tắt bài thuốc (tối đa 500 ký tự)'
                    value={formData.summary}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {formData.summary?.length || 0}/500
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung chính *</Label>
                  <div className="ring-1 ring-gray-100/5 rounded-md shadow-sm p-2">
                    <SimpleEditor
                      key={folkMedicine?.id || 'new'}
                      initialContent={folkMedicine?.content || ''}
                      placeholder="Nhập nội dung chi tiết bài thuốc"
                      onContentChange={(content) => changeContent(content)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredients">Thành phần</Label>
                    <Textarea
                      id="ingredients"
                      name="ingredients"
                      placeholder='Nhập các thành phần của bài thuốc'
                      value={formData.ingredients}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparation">Cách chế biến</Label>
                    <Textarea
                      id="preparation"
                      name="preparation"
                      placeholder='Nhập cách chế biến bài thuốc'
                      value={formData.preparation}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usage">Cách sử dụng</Label>
                    <Textarea
                      id="usage"
                      name="usage"
                      placeholder='Nhập cách sử dụng bài thuốc'
                      value={formData.usage}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder='Nhập ghi chú bổ sung'
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
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

export default FolkMedicineForm; 
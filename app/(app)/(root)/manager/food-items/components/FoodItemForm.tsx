import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreateFoodItemDto, FoodItem } from '@/types/food-item';
import { createFoodItem, updateFoodItem, getFoodItem, getCategoryByCode } from '@/services/manager-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Switch } from '@/components/ui/switch';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { useDropzone } from "react-dropzone";
import { Category } from '@/types/category';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { unicodeToEmoji, mergeImageUrl } from '@/lib/utils';

const FoodItemForm = () => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusCategory, setStatusCategory] = useState<Category[]>([]);
  const [foodCategory, setFoodCategory] = useState<Category[]>([]);
  const [unitCategory, setUnitCategory] = useState<Category[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Category | null>(null);
  const [selectedFood, setSelectedFood] = useState<Category | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Category | null>(null);
  const [foodItem, setFoodItem] = useState<FoodItem>();
  const [formData, setFormData] = useState<CreateFoodItemDto>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isAvailable: true,
    preparationTime: 0,
    unitCategoryId: '',
    foodCategoryId: '',
    statusCategoryId: '',
    discountPercent: 0,
    discountStartTime: undefined,
    discountEndTime: undefined,
  });
  const id = Number(params.id);

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

  const title = id ? 'Cập nhật món ăn' : 'Thêm món ăn mới';
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadFoodItem(Number(id));
    }
    loadCategory();
  }, []);

  useEffect(() => {
    if (formData.unitCategoryId && unitCategory.length > 0) {
      const unit = unitCategory.find(cat => cat.id === formData.unitCategoryId);
      setSelectedUnit(unit || null);
    }

    if (formData.foodCategoryId && foodCategory.length > 0) {
      const food = foodCategory.find(cat => cat.id === formData.foodCategoryId);
      setSelectedFood(food || null);
    }

    if (formData.statusCategoryId && statusCategory.length > 0) {
      const status = statusCategory.find(cat => cat.id === formData.statusCategoryId);
      setSelectedStatus(status || null);
    }
  }, [formData.unitCategoryId, formData.foodCategoryId, formData.statusCategoryId, unitCategory, foodCategory, statusCategory]);

  const loadFoodItem = async (id: number) => {
    try {
      const foodItem = await getFoodItem(id);
      setFoodItem(foodItem)
      setFormData({
        name: foodItem.name,
        description: foodItem.description,
        price: foodItem.price,
        imageUrl: foodItem.imageUrl ? mergeImageUrl(foodItem.imageUrl) : '',
        isAvailable: foodItem.isAvailable,
        preparationTime: foodItem.preparationTime || 0,
        unitCategoryId: foodItem.unitCategoryId || '',
        foodCategoryId: foodItem.foodCategoryId || '',
        statusCategoryId: foodItem.statusCategoryId || '',
        discountPercent: foodItem.discountPercent || 0,
        discountStartTime: foodItem.discountStartTime,
        discountEndTime: foodItem.discountEndTime,
      });
    } catch (_error) {
      toast.error('Không thể tải thông tin món ăn');
      router.push('/manager/food-items');
    }
  };

  const loadCategory = async () => {
    try {
      const [statusCategory, unitCategory, foodCategory] = await Promise.all([
        getCategoryByCode('food-status'),
        getCategoryByCode('food-unit'),
        getCategoryByCode('food-category')
      ]);

      setStatusCategory(statusCategory);
      setUnitCategory(unitCategory);
      setFoodCategory(foodCategory)
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
        await updateFoodItem(id, submitData);
        toast.success('Món ăn đã được cập nhật thành công');
      } else {
        await createFoodItem(submitData);
        toast.success('Món ăn đã được thêm thành công');
      }
      router.push('/manager/food-items');
    } catch (_error) {
      toast.error(isEditing ? 'Có lỗi xảy ra khi cập nhật món ăn' : 'Có lỗi xảy ra khi thêm món ăn');
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

  const handleSelectUnitChange = (value: string) => {
    const selectedCategory = unitCategory.find((category) => category.id === value);
    setSelectedUnit(selectedCategory || null);
    setFormData(prev => ({
      ...prev,
      unitCategoryId: value,
    }));
  };

  const handleSelectFoodChange = (value: string) => {
    const selectedCategory = foodCategory.find((category) => category.id === value);
    setSelectedFood(selectedCategory || null);
    setFormData(prev => ({
      ...prev,
      foodCategoryId: value,
    }));
  };

  const handleSelectStatusChange = (value: string) => {
    const selectedCategory = statusCategory.find((category) => category.id === value);
    setSelectedStatus(selectedCategory || null);
    setFormData(prev => ({
      ...prev,
      statusCategoryId: value,
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

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isAvailable: checked,
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
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Thêm mới món ăn" items={[
        { title: 'Danh sách món ăn', href: '/manager/food-items' },
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
                    <Label htmlFor="name">Tên món</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder='Nhập tên món ăn'
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Giá</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Thời gian chuẩn bị (phút)</Label>
                    <Input
                      id="preparationTime"
                      name="preparationTime"
                      type="number"
                      value={formData.preparationTime || 0}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitCategoryId">Đơn vị tính</Label>
                    <Select value={selectedUnit?.id || formData.unitCategoryId} onValueChange={(value) => handleSelectUnitChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn loại danh mục" />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white" >
                        {unitCategory?.length ? (unitCategory?.map((type) => (
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
                    <Label htmlFor="foodCategoryId">Danh mục món ăn</Label>
                    <Select value={selectedFood?.id || formData?.foodCategoryId} onValueChange={(value) => handleSelectFoodChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn loại món ăn" />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white" >
                        {foodCategory?.length > 0 ? (foodCategory?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex flex-start items-center">
                              <span className="text-2xl mr-2"> {type.icon && unicodeToEmoji(type.icon)}</span>
                              <span className="text-sm text-gray-500">{type.name}</span>
                            </div>
                          </SelectItem>
                        ))) : (
                          <div className='h-16 flex justify-items-center'>
                            Không có dữ liệu
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statusCategoryId">Trạng thái</Label>
                    <Select value={selectedStatus?.id || formData.statusCategoryId} onValueChange={(value) => handleSelectStatusChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white" >
                        {statusCategory?.length ? (statusCategory?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex flex-start items-center">
                              <span className="text-2xl mr-2"> {type.icon && unicodeToEmoji(type.icon)}</span>
                              <span className="text-sm text-gray-500">{type.name}</span>
                            </div>
                          </SelectItem>
                        ))) : (
                          <div className='h-14 flex align-middle justify-items-center'>
                            <span className='text-center'>
                              Không có dữ liệu
                            </span>
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
                      key={foodItem?.id || 'new'}
                      initialContent={foodItem?.description || ''}
                      placeholder="Nhập mô tả món ăn (tối đa 2500 ký tự)"
                      onContentChange={(content) => changeDescription(content)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountPercent">Phần trăm giảm giá</Label>
                    <Input
                      id="discountPercent"
                      name="discountPercent"
                      type="number"
                      value={formData.discountPercent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountStartTime">Thời gian bắt đầu giảm giá</Label>
                    <Input
                      id="discountStartTime"
                      name="discountStartTime"
                      type="datetime-local"
                      value={formData.discountStartTime ? formData.discountStartTime.toISOString().slice(0, 16) : ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountEndTime">Thời gian kết thúc giảm giá</Label>
                    <Input
                      id="discountEndTime"
                      name="discountEndTime"
                      type="datetime-local"
                      value={formData.discountEndTime ? formData.discountEndTime.toISOString().slice(0, 16) : ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="isAvailable">Còn phục vụ</Label>
                </div>
              </form>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

export default FoodItemForm

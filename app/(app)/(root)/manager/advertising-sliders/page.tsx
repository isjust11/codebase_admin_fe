'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MediaManager } from '@/components/MediaManager';
import { toast } from 'sonner';

// Schema validation
const sliderSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  link: z.string().url('Link không hợp lệ').optional().or(z.literal('')),
  type: z.enum(['BANNER', 'PROMOTION', 'NEW_PRODUCT', 'FEATURED', 'EVENT', 'CATEGORY']),
  position: z.enum(['TOP', 'MIDDLE', 'BOTTOM', 'SIDEBAR', 'FULLSCREEN']),
  order: z.number().min(1, 'Thứ tự phải lớn hơn 0'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetAudience: z.string().optional(),
  conditions: z.string().optional(),
  notes: z.string().optional(),
});

type SliderFormData = z.infer<typeof sliderSchema>;

interface AdvertisingSlider {
  id: number;
  title: string;
  description?: string;
  subtitle?: string;
  image?: string;
  images?: string[];
  link?: string;
  type: 'BANNER' | 'PROMOTION' | 'NEW_PRODUCT' | 'FEATURED' | 'EVENT' | 'CATEGORY';
  position: 'TOP' | 'MIDDLE' | 'BOTTOM' | 'SIDEBAR' | 'FULLSCREEN';
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  clickCount: number;
  viewCount: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: string;
  conditions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const sliderTypes = [
  { value: 'BANNER', label: 'Banner' },
  { value: 'PROMOTION', label: 'Khuyến mãi' },
  { value: 'NEW_PRODUCT', label: 'Sản phẩm mới' },
  { value: 'FEATURED', label: 'Nổi bật' },
  { value: 'EVENT', label: 'Sự kiện' },
  { value: 'CATEGORY', label: 'Danh mục' },
];

const sliderPositions = [
  { value: 'TOP', label: 'Đầu trang' },
  { value: 'MIDDLE', label: 'Giữa trang' },
  { value: 'BOTTOM', label: 'Cuối trang' },
  { value: 'SIDEBAR', label: 'Thanh bên' },
  { value: 'FULLSCREEN', label: 'Toàn màn hình' },
];

export default function AdvertisingSlidersPage() {
  const [sliders, setSliders] = useState<AdvertisingSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<AdvertisingSlider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');

  const form = useForm<SliderFormData>({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      title: '',
      description: '',
      subtitle: '',
      image: '',
      images: [],
      link: '',
      type: 'BANNER',
      position: 'TOP',
      order: 1,
      isActive: true,
      isFeatured: false,
      startDate: '',
      endDate: '',
      targetAudience: '',
      conditions: '',
      notes: '',
    },
  });

  // Fetch sliders
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/advertising-sliders');
      if (response.ok) {
        const data = await response.json();
        setSliders(data.data || []);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách slider');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Create slider
  const handleCreate = async (data: SliderFormData) => {
    try {
      const response = await fetch('/api/advertising-sliders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Tạo slider thành công');
        setIsCreateDialogOpen(false);
        form.reset();
        fetchSliders();
      } else {
        throw new Error('Tạo slider thất bại');
      }
    } catch (error) {
      toast.error('Không thể tạo slider');
    }
  };

  // Update slider
  const handleUpdate = async (data: SliderFormData) => {
    if (!editingSlider) return;

    try {
      const response = await fetch(`/api/advertising-sliders/${editingSlider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Cập nhật slider thành công');
        setIsEditDialogOpen(false);
        setEditingSlider(null);
        form.reset();
        fetchSliders();
      } else {
        throw new Error('Cập nhật slider thất bại');
      }
    } catch (error) {
      toast.error('Không thể cập nhật slider');
    }
  };

  // Delete slider
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa slider này?')) return;

    try {
      const response = await fetch(`/api/advertising-sliders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Xóa slider thành công');
        fetchSliders();
      } else {
        throw new Error('Xóa slider thất bại');
      }
    } catch (error) {
      toast.error('Không thể xóa slider');
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`/api/advertising-sliders/${id}/toggle-active`, {
        method: 'PUT',
      });

      if (response.ok) {
        toast.success('Cập nhật trạng thái thành công');
        fetchSliders();
      }
    } catch (error) {
        toast.error('Không thể cập nhật trạng thái');
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (id: number) => {
    try {
      const response = await fetch(`/api/advertising-sliders/${id}/toggle-featured`, {
        method: 'PUT',
      });

      if (response.ok) {
        toast.success('Cập nhật trạng thái nổi bật thành công');
        fetchSliders();
      }
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái nổi bật');
    }
  };

  // Open edit dialog
  const openEditDialog = (slider: AdvertisingSlider) => {
    setEditingSlider(slider);
    form.reset({
      title: slider.title,
      description: slider.description || '',
      subtitle: slider.subtitle || '',
      image: slider.image || '',
      images: slider.images || [],
      link: slider.link || '',
      type: slider.type,
      position: slider.position,
      order: slider.order,
      isActive: slider.isActive,
      isFeatured: slider.isFeatured,
      startDate: slider.startDate || '',
      endDate: slider.endDate || '',
      targetAudience: slider.targetAudience || '',
      conditions: slider.conditions || '',
      notes: slider.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  // Filter sliders
  const filteredSliders = sliders.filter(slider => {
    const matchesSearch = slider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (slider.description && slider.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !filterType || slider.type === filterType;
    const matchesPosition = !filterPosition || slider.position === filterPosition;
    const matchesActive = filterActive === '' || 
                         (filterActive === 'true' && slider.isActive) ||
                         (filterActive === 'false' && !slider.isActive);
    
    return matchesSearch && matchesType && matchesPosition && matchesActive;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Advertising Sliders</h1>
          <p className="text-muted-foreground">Quản lý các slider quảng cáo và banner</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo Slider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo Slider Mới</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phụ đề</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại slider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại slider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sliderTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vị trí</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vị trí" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sliderPositions.map((position) => (
                              <SelectItem key={position.value} value={position.value}>
                                {position.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thứ tự</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Hoạt động</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Nổi bật</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đối tượng mục tiêu</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điều kiện</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">Tạo Slider</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Tìm kiếm</label>
              <Input
                placeholder="Tìm theo tiêu đề, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Loại</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả loại</SelectItem>
                  {sliderTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Vị trí</label>
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả vị trí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả vị trí</SelectItem>
                  {sliderPositions.map((position) => (
                    <SelectItem key={position.value} value={position.value}>
                      {position.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Đang hoạt động</SelectItem>
                  <SelectItem value="false">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sliders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Sliders ({filteredSliders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thống kê</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSliders.map((slider) => (
                  <TableRow key={slider.id}>
                    <TableCell>
                      {slider.image ? (
                        <img 
                          src={slider.image} 
                          alt={slider.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{slider.title}</div>
                        {slider.subtitle && (
                          <div className="text-sm text-muted-foreground">{slider.subtitle}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sliderTypes.find(t => t.value === slider.type)?.label || slider.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {sliderPositions.find(p => p.value === slider.position)?.label || slider.position}
                      </Badge>
                    </TableCell>
                    <TableCell>{slider.order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={slider.isActive ? "default" : "secondary"}>
                          {slider.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
                        {slider.isFeatured && (
                          <Badge variant="destructive">Nổi bật</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Lượt xem: {slider.viewCount}</div>
                        <div>Lượt click: {slider.clickCount}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(slider)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(slider.id)}>
                            {slider.isActive ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Ẩn slider
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Hiện slider
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(slider.id)}>
                            {slider.isFeatured ? (
                              <>
                                <StarOff className="mr-2 h-4 w-4" />
                                Bỏ nổi bật
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" />
                                Đánh dấu nổi bật
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(slider.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Slider</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phụ đề</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại slider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại slider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sliderTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vị trí</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vị trí" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sliderPositions.map((position) => (
                            <SelectItem key={position.value} value={position.value}>
                              {position.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Hoạt động</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Nổi bật</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đối tượng mục tiêu</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điều kiện</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Cập nhật</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
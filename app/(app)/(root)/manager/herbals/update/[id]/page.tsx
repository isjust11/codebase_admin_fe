'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useRouter, useParams } from 'next/navigation'
import { getHerbalById, updateHerbal } from '@/services/herbal-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Save, Image } from 'lucide-react'
import { getCategories } from '@/services/manager-api'
import { Category } from '@/types/category'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HerbalImageUpload from '@/components/herbal/HerbalImageUpload'

const UpdateHerbalPage = () => {
  const router = useRouter()
  const params = useParams()
  const herbalId = params.id as string
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    scientificName: '',
    commonNames: '',
    family: '',
    partsUsed: '',
    activeCompounds: '',
    medicinalProperties: '',
    preparationMethods: '',
    dosage: '',
    contraindications: '',
    sideEffects: '',
    thumbnail: '',
    categoryId: '',
    isActive: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [herbalResponse, categoriesResponse] = await Promise.all([
          getHerbalById(parseInt(herbalId)),
          getCategories()
        ])
        
        setCategories(categoriesResponse.data || [])
        
        if (herbalResponse) {
          setFormData({
            title: herbalResponse.title || '',
            summary: herbalResponse.summary || '',
            content: herbalResponse.content || '',
            scientificName: herbalResponse.scientificName || '',
            commonNames: herbalResponse.commonNames || '',
            family: herbalResponse.family || '',
            partsUsed: herbalResponse.partsUsed || '',
            activeCompounds: herbalResponse.activeCompounds || '',
            medicinalProperties: herbalResponse.medicinalProperties || '',
            preparationMethods: herbalResponse.preparationMethods || '',
            dosage: herbalResponse.dosage || '',
            contraindications: herbalResponse.contraindications || '',
            sideEffects: herbalResponse.sideEffects || '',
            thumbnail: herbalResponse.thumbnail || '',
            categoryId: herbalResponse.categoryId || '',
            isActive: herbalResponse.isActive ?? true
          })
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error)
        toast.error('Có lỗi xảy ra khi tải thông tin thảo dược')
      } finally {
        setInitialLoading(false)
      }
    }
    
    if (herbalId) {
      fetchData()
    }
  }, [herbalId])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateHerbal(parseInt(herbalId), formData)
      toast.success('Thảo dược đã được cập nhật thành công')
      router.push('/manager/herbals')
    } catch (error) {
      console.error('Lỗi khi cập nhật thảo dược:', error)
      toast.error('Có lỗi xảy ra khi cập nhật thảo dược')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Đang tải thông tin thảo dược...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle="Cập nhật thảo dược" 
        items={[
          { title: 'Thảo dược', href: '/manager/herbals' },
          { title: 'Cập nhật', href: `/manager/herbals/update/${herbalId}` }
        ]} 
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Thông tin cơ bản
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Quản lý hình ảnh
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ComponentCard title="Thông tin thảo dược">
              <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên thảo dược */}
              <div className="space-y-2">
                <Label htmlFor="title">Tên thảo dược *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tên thảo dược"
                  required
                />
              </div>

              {/* Tên khoa học */}
              <div className="space-y-2">
                <Label htmlFor="scientificName">Tên khoa học</Label>
                <Input
                  id="scientificName"
                  value={formData.scientificName}
                  onChange={(e) => handleInputChange('scientificName', e.target.value)}
                  placeholder="Nhập tên khoa học"
                />
              </div>

              {/* Tên thường gọi */}
              <div className="space-y-2">
                <Label htmlFor="commonNames">Tên thường gọi</Label>
                <Input
                  id="commonNames"
                  value={formData.commonNames}
                  onChange={(e) => handleInputChange('commonNames', e.target.value)}
                  placeholder="Nhập tên thường gọi"
                />
              </div>

              {/* Họ */}
              <div className="space-y-2">
                <Label htmlFor="family">Họ</Label>
                <Input
                  id="family"
                  value={formData.family}
                  onChange={(e) => handleInputChange('family', e.target.value)}
                  placeholder="Nhập họ thực vật"
                />
              </div>

              {/* Bộ phận sử dụng */}
              <div className="space-y-2">
                <Label htmlFor="partsUsed">Bộ phận sử dụng</Label>
                <Input
                  id="partsUsed"
                  value={formData.partsUsed}
                  onChange={(e) => handleInputChange('partsUsed', e.target.value)}
                  placeholder="Nhập bộ phận sử dụng"
                />
              </div>

              {/* Hợp chất hoạt tính */}
              <div className="space-y-2">
                <Label htmlFor="activeCompounds">Hợp chất hoạt tính</Label>
                <Input
                  id="activeCompounds"
                  value={formData.activeCompounds}
                  onChange={(e) => handleInputChange('activeCompounds', e.target.value)}
                  placeholder="Nhập hợp chất hoạt tính"
                />
              </div>

              {/* Tính chất dược liệu */}
              <div className="space-y-2">
                <Label htmlFor="medicinalProperties">Tính chất dược liệu</Label>
                <Textarea
                  id="medicinalProperties"
                  value={formData.medicinalProperties}
                  onChange={(e) => handleInputChange('medicinalProperties', e.target.value)}
                  placeholder="Nhập tính chất dược liệu"
                  rows={3}
                />
              </div>

              {/* Phương pháp chế biến */}
              <div className="space-y-2">
                <Label htmlFor="preparationMethods">Phương pháp chế biến</Label>
                <Textarea
                  id="preparationMethods"
                  value={formData.preparationMethods}
                  onChange={(e) => handleInputChange('preparationMethods', e.target.value)}
                  placeholder="Nhập phương pháp chế biến"
                  rows={3}
                />
              </div>

              {/* Liều lượng */}
              <div className="space-y-2">
                <Label htmlFor="dosage">Liều lượng</Label>
                <Textarea
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  placeholder="Nhập liều lượng sử dụng"
                  rows={3}
                />
              </div>

              {/* Chống chỉ định */}
              <div className="space-y-2">
                <Label htmlFor="contraindications">Chống chỉ định</Label>
                <Textarea
                  id="contraindications"
                  value={formData.contraindications}
                  onChange={(e) => handleInputChange('contraindications', e.target.value)}
                  placeholder="Nhập chống chỉ định"
                  rows={3}
                />
              </div>

              {/* Tác dụng phụ */}
              <div className="space-y-2">
                <Label htmlFor="sideEffects">Tác dụng phụ</Label>
                <Textarea
                  id="sideEffects"
                  value={formData.sideEffects}
                  onChange={(e) => handleInputChange('sideEffects', e.target.value)}
                  placeholder="Nhập tác dụng phụ"
                  rows={3}
                />
              </div>

              {/* Hình ảnh */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail">URL hình ảnh</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  placeholder="Nhập URL hình ảnh"
                />
              </div>

              {/* Danh mục */}
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trạng thái */}
              <div className="space-y-2">
                <Label htmlFor="isActive">Trạng thái hoạt động</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">{formData.isActive ? 'Hoạt động' : 'Không hoạt động'}</Label>
                </div>
              </div>
            </div>

            {/* Tóm tắt */}
            <div className="space-y-2">
              <Label htmlFor="summary">Tóm tắt</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="Nhập tóm tắt về thảo dược"
                rows={4}
              />
            </div>

            {/* Nội dung chi tiết */}
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung chi tiết *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Nhập nội dung chi tiết về thảo dược"
                rows={10}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/manager/herbals')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Đang cập nhật...' : 'Cập nhật thảo dược'}
              </Button>
            </div>
          </form>
        </ComponentCard>
          </TabsContent>

          <TabsContent value="images">
            <ComponentCard title="Quản lý hình ảnh thảo dược">
              <HerbalImageUpload herbalId={parseInt(herbalId)} />
            </ComponentCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default UpdateHerbalPage 
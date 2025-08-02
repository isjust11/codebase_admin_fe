'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { createAuthor } from '@/services/author-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Save } from 'lucide-react'

const CreateAuthorPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    biography: '',
    career: '',
    achievements: '',
    contributions: '',
    works: '',
    philosophy: '',
    legacy: '',
    birthDate: '',
    deathDate: '',
    birthPlace: '',
    deathPlace: '',
    era: '',
    dynasty: '',
    specialty: '',
    teacher: '',
    students: '',
    portrait: '',
    quotes: '',
    anecdotes: '',
    honors: '',
    memorials: '',
    references: '',
    isActive: true
  })

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
      await createAuthor(formData)
      toast.success('Tác giả đã được tạo thành công')
      router.push('/manager/authors')
    } catch (error) {
      console.error('Lỗi khi tạo tác giả:', error)
      toast.error('Có lỗi xảy ra khi tạo tác giả')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle="Tạo tác giả mới" 
        items={[
          { title: 'Tác giả', href: '/manager/authors' },
          { title: 'Tạo mới', href: '/manager/authors/create' }
        ]} 
      />
      
      <div className="space-y-6">
        <ComponentCard title="Thông tin tác giả">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên tác giả */}
              <div className="space-y-2">
                <Label htmlFor="name">Tên tác giả *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên tác giả"
                  required
                />
              </div>

              {/* Bút danh */}
              <div className="space-y-2">
                <Label htmlFor="alias">Bút danh</Label>
                <Input
                  id="alias"
                  value={formData.alias}
                  onChange={(e) => handleInputChange('alias', e.target.value)}
                  placeholder="Nhập bút danh"
                />
              </div>

              {/* Nơi sinh */}
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Nơi sinh</Label>
                <Input
                  id="birthPlace"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                  placeholder="Nhập nơi sinh"
                />
              </div>

              {/* Nơi mất */}
              <div className="space-y-2">
                <Label htmlFor="deathPlace">Nơi mất</Label>
                <Input
                  id="deathPlace"
                  value={formData.deathPlace}
                  onChange={(e) => handleInputChange('deathPlace', e.target.value)}
                  placeholder="Nhập nơi mất"
                />
              </div>

              {/* Ngày sinh */}
              <div className="space-y-2">
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>

              {/* Ngày mất */}
              <div className="space-y-2">
                <Label htmlFor="deathDate">Ngày mất</Label>
                <Input
                  id="deathDate"
                  type="date"
                  value={formData.deathDate}
                  onChange={(e) => handleInputChange('deathDate', e.target.value)}
                />
              </div>

              {/* Thời kỳ */}
              <div className="space-y-2">
                <Label htmlFor="era">Thời kỳ</Label>
                <Input
                  id="era"
                  value={formData.era}
                  onChange={(e) => handleInputChange('era', e.target.value)}
                  placeholder="Nhập thời kỳ"
                />
              </div>

              {/* Triều đại */}
              <div className="space-y-2">
                <Label htmlFor="dynasty">Triều đại</Label>
                <Input
                  id="dynasty"
                  value={formData.dynasty}
                  onChange={(e) => handleInputChange('dynasty', e.target.value)}
                  placeholder="Nhập triều đại"
                />
              </div>

              {/* Chuyên môn */}
              <div className="space-y-2">
                <Label htmlFor="specialty">Chuyên môn</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  placeholder="Nhập chuyên môn"
                />
              </div>

              {/* Thầy dạy */}
              <div className="space-y-2">
                <Label htmlFor="teacher">Thầy dạy</Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => handleInputChange('teacher', e.target.value)}
                  placeholder="Nhập thầy dạy"
                />
              </div>

              {/* Học trò */}
              <div className="space-y-2">
                <Label htmlFor="students">Học trò</Label>
                <Input
                  id="students"
                  value={formData.students}
                  onChange={(e) => handleInputChange('students', e.target.value)}
                  placeholder="Nhập học trò"
                />
              </div>

              {/* Hình ảnh */}
              <div className="space-y-2">
                <Label htmlFor="portrait">URL hình ảnh</Label>
                <Input
                  id="portrait"
                  value={formData.portrait}
                  onChange={(e) => handleInputChange('portrait', e.target.value)}
                  placeholder="Nhập URL hình ảnh"
                />
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

            {/* Tiểu sử */}
            <div className="space-y-2">
              <Label htmlFor="biography">Tiểu sử</Label>
              <Textarea
                id="biography"
                value={formData.biography}
                onChange={(e) => handleInputChange('biography', e.target.value)}
                placeholder="Nhập tiểu sử tác giả"
                rows={4}
              />
            </div>

            {/* Sự nghiệp */}
            <div className="space-y-2">
              <Label htmlFor="career">Sự nghiệp</Label>
              <Textarea
                id="career"
                value={formData.career}
                onChange={(e) => handleInputChange('career', e.target.value)}
                placeholder="Nhập sự nghiệp"
                rows={4}
              />
            </div>

            {/* Thành tựu */}
            <div className="space-y-2">
              <Label htmlFor="achievements">Thành tựu</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) => handleInputChange('achievements', e.target.value)}
                placeholder="Nhập thành tựu"
                rows={4}
              />
            </div>

            {/* Đóng góp */}
            <div className="space-y-2">
              <Label htmlFor="contributions">Đóng góp</Label>
              <Textarea
                id="contributions"
                value={formData.contributions}
                onChange={(e) => handleInputChange('contributions', e.target.value)}
                placeholder="Nhập đóng góp"
                rows={4}
              />
            </div>

            {/* Tác phẩm */}
            <div className="space-y-2">
              <Label htmlFor="works">Tác phẩm</Label>
              <Textarea
                id="works"
                value={formData.works}
                onChange={(e) => handleInputChange('works', e.target.value)}
                placeholder="Nhập tác phẩm"
                rows={4}
              />
            </div>

            {/* Triết lý */}
            <div className="space-y-2">
              <Label htmlFor="philosophy">Triết lý</Label>
              <Textarea
                id="philosophy"
                value={formData.philosophy}
                onChange={(e) => handleInputChange('philosophy', e.target.value)}
                placeholder="Nhập triết lý"
                rows={4}
              />
            </div>

            {/* Di sản */}
            <div className="space-y-2">
              <Label htmlFor="legacy">Di sản</Label>
              <Textarea
                id="legacy"
                value={formData.legacy}
                onChange={(e) => handleInputChange('legacy', e.target.value)}
                placeholder="Nhập di sản"
                rows={4}
              />
            </div>

            {/* Trích dẫn */}
            <div className="space-y-2">
              <Label htmlFor="quotes">Trích dẫn</Label>
              <Textarea
                id="quotes"
                value={formData.quotes}
                onChange={(e) => handleInputChange('quotes', e.target.value)}
                placeholder="Nhập trích dẫn"
                rows={4}
              />
            </div>

            {/* Giai thoại */}
            <div className="space-y-2">
              <Label htmlFor="anecdotes">Giai thoại</Label>
              <Textarea
                id="anecdotes"
                value={formData.anecdotes}
                onChange={(e) => handleInputChange('anecdotes', e.target.value)}
                placeholder="Nhập giai thoại"
                rows={4}
              />
            </div>

            {/* Danh hiệu */}
            <div className="space-y-2">
              <Label htmlFor="honors">Danh hiệu</Label>
              <Textarea
                id="honors"
                value={formData.honors}
                onChange={(e) => handleInputChange('honors', e.target.value)}
                placeholder="Nhập danh hiệu"
                rows={4}
              />
            </div>

            {/* Tưởng niệm */}
            <div className="space-y-2">
              <Label htmlFor="memorials">Tưởng niệm</Label>
              <Textarea
                id="memorials"
                value={formData.memorials}
                onChange={(e) => handleInputChange('memorials', e.target.value)}
                placeholder="Nhập tưởng niệm"
                rows={4}
              />
            </div>

            {/* Tài liệu tham khảo */}
            <div className="space-y-2">
              <Label htmlFor="references">Tài liệu tham khảo</Label>
              <Textarea
                id="references"
                value={formData.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                placeholder="Nhập tài liệu tham khảo"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/manager/authors')}
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
                {loading ? 'Đang tạo...' : 'Tạo tác giả'}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  )
}

export default CreateAuthorPage 
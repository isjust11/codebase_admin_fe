# Select Widget - Hướng dẫn sử dụng

Select widget mới được thiết kế để thay thế các Select component cũ, với các tính năng nâng cao:

## Tính năng chính

- ✅ **Single/Multiple Selection**: Hỗ trợ chọn một hoặc nhiều option
- ✅ **Search Functionality**: Tìm kiếm trong danh sách options
- ✅ **Custom Rendering**: Tùy chỉnh cách hiển thị options (avatar, icon, etc.)
- ✅ **Controlled/Uncontrolled**: Hỗ trợ cả hai chế độ
- ✅ **Accessibility**: Hỗ trợ keyboard navigation và screen readers
- ✅ **Dark Mode**: Tự động hỗ trợ dark mode
- ✅ **Responsive**: Tương thích với mobile và desktop

## Props Interface

```typescript
interface SelectProps {
  options: Option[];                    // Danh sách options
  placeholder?: string;                 // Placeholder text
  onChange: (value: string | string[]) => void; // Callback khi thay đổi
  className?: string;                    // CSS classes
  defaultValue?: string | string[];      // Giá trị mặc định
  multiple?: boolean;                    // Chế độ multiple selection
  searchable?: boolean;                  // Bật tìm kiếm
  searchPlaceholder?: string;            // Placeholder cho search input
  emptyMessage?: string;                 // Thông báo khi không có kết quả
  renderOption?: (option: Option) => React.ReactNode; // Custom renderer
  value?: string | string[];             // Controlled value
  disabled?: boolean;                    // Disable select
}
```

## Cách sử dụng

### 1. Basic Single Select

```tsx
import Select from '@/components/form/Select';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' }
];

<Select
  options={options}
  placeholder="Chọn một option"
  onChange={(value) => console.log(value)}
/>
```

### 2. Multiple Select

```tsx
<Select
  options={options}
  placeholder="Chọn nhiều options"
  onChange={(values) => console.log(values)}
  multiple={true}
/>
```

### 3. Searchable Select

```tsx
<Select
  options={options}
  placeholder="Tìm kiếm và chọn"
  onChange={(value) => console.log(value)}
  searchable={true}
  searchPlaceholder="Nhập để tìm kiếm..."
/>
```

### 4. Custom Rendering (với Avatar)

```tsx
const authors = [
  {
    value: '1',
    label: 'Dr. Nguyễn Văn A',
    avatar: '/images/avatar1.jpg'
  }
];

const renderAuthorOption = (option) => (
  <div className="flex items-center gap-2">
    {option.avatar && (
      <img
        src={option.avatar}
        alt={option.label}
        className="w-6 h-6 rounded-full"
      />
    )}
    <span>{option.label}</span>
  </div>
);

<Select
  options={authors}
  placeholder="Chọn tác giả"
  onChange={(value) => console.log(value)}
  searchable={true}
  renderOption={renderAuthorOption}
/>
```

### 5. Controlled Component

```tsx
const [selectedValue, setSelectedValue] = useState('');

<Select
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Controlled select"
/>
```

## Ví dụ trong FolkMedicineForm

Thay thế Select cũ trong FolkMedicineForm:

```tsx
// Thay vì sử dụng shadcn/ui Select
<Select
  value={formData.author?.id.toString() || formData.authorId}
  onValueChange={(value) => handleSelectChange('authorId', value)}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder={t('selectAuthor')} />
  </SelectTrigger>
  <SelectContent className="w-full bg-white">
    {authors.length > 0 ?
      authors.map((author) => (
        <SelectItem key={author.id} value={author.id}>
          <span className='flex items-center gap-2'>
            {author.avatar && (
              <Image width={8} height={8}
                src={mergeImageUrl(author.avatar || '')} 
                alt={author.name} 
                className="w-8 h-8 rounded-full bg-gray-200 ring-1 ring-gray-300"
              />
            )}
            {author.name}
          </span>
        </SelectItem>
      )) : (
        <div className="flex flex-col items-start gap-2 justify-between p-4">
          <div>{tAuthor('noAuthor')}</div>
          <span className="text-gray-500 flex items-center gap-2 cursor-pointer text-sm">
            <Plus className="h-4 w-4" /> {tAuthor('addAuthor')}
          </span>
        </div>
      )
    }
  </SelectContent>
</Select>

// Sử dụng Select widget mới
<Select
  options={authors.map(author => ({
    value: author.id.toString(),
    label: author.name,
    avatar: author.avatar
  }))}
  value={formData.authorId}
  onChange={(value) => handleSelectChange('authorId', value as string)}
  placeholder={t('selectAuthor')}
  searchable={true}
  searchPlaceholder="Tìm kiếm tác giả..."
  renderOption={(option) => (
    <div className="flex items-center gap-2">
      {option.avatar && (
        <img
          src={mergeImageUrl(option.avatar)}
          alt={option.label}
          className="w-8 h-8 rounded-full bg-gray-200 ring-1 ring-gray-300"
        />
      )}
      <span>{option.label}</span>
    </div>
  )}
  emptyMessage={authors.length === 0 ? tAuthor('noAuthor') : "Không tìm thấy tác giả"}
/>
```

## Lợi ích

1. **Code ngắn gọn hơn**: Giảm từ ~30 dòng xuống ~10 dòng
2. **Tính năng phong phú**: Search, multiple selection, custom rendering
3. **Consistent UI**: Giao diện thống nhất với design system
4. **Performance**: Tối ưu hóa rendering và memory usage
5. **Accessibility**: Hỗ trợ đầy đủ cho người dùng khuyết tật
6. **Type Safety**: TypeScript support đầy đủ

## Migration Guide

Để migrate từ Select cũ sang Select widget mới:

1. **Import**: Thay đổi import statement
2. **Props**: Mapping props từ cũ sang mới
3. **Event Handlers**: Cập nhật onChange handlers
4. **Styling**: Điều chỉnh className nếu cần
5. **Testing**: Test lại functionality

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- React 18+
- Next.js 13+
- Tailwind CSS
- Lucide React (icons)
- Next/Image

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';
import { AppCategoryCode } from "@/constants";
import { Feature } from "@/types/feature";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Hàm chuyển đổi emoji thành mã Unicode
export const emojiToUnicode = (emoji: string) => {
  return emoji.split('').map(char => {
    const code = char.codePointAt(0)?.toString(16);
    return code ? `\\u${code.padStart(4, '0')}` : char;
  }).join('');
};
// Hàm chuyển đổi mã Unicode thành emoji
export const unicodeToEmoji = (unicodeStr: string) => {
  try {
    return unicodeStr.split('\\u').map(code => {
      if (code) {
        const charCode = parseInt(code, 16);
        return String.fromCodePoint(charCode);
      }
      return '';
    }).join('');
  } catch (error) {
    return unicodeStr;
  }
};

export function encrypt(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}
export function decrypt(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export const mergeImageUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  
  // Nếu URL đã là absolute URL thì không cần merge
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // Lấy API_URL từ biến môi trường
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  // Merge URL
  return `${apiUrl}${relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`}`;
};

export function base64encrypt(text: string | number): string {
  return Buffer.from(text.toString()).toString('base64');
}

export function base64decrypt(encryptedText: string): string {
  return Buffer.from(encryptedText, 'base64').toString('utf8');
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};



export const getFeatureType = () => {
    const keys = Object.keys(AppCategoryCode);
    const featureTypeKey = keys[0];
    return featureTypeKey;
}


 export const buildFeature = (items: Feature[]): Feature[] => {
    // Tạo một bản đồ để dễ dàng truy cập các nút theo id
    const itemMap: Record<string, Feature> = {};
    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });

    // Xây dựng cây
    const tree: Feature[] = [];

    items.forEach(item => {
      if (item.parentId) {
        // Nếu có parentId, thêm vào children của parent
        if (itemMap[item.parentId]) {
          itemMap[item.parentId].children?.push(itemMap[item.id]);
          // Sắp xếp children theo order
          itemMap[item.parentId].children?.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        }
      } else {
        // Nếu không có parentId, thêm vào cây gốc
        tree.push(itemMap[item.id]);
      }
    });

    // Sắp xếp cây gốc theo order
    tree.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return tree;
  }

  // build decode function input is string output is string
  
export const decode = (id: string): string => {
  try {
    // Giải mã chuỗi base64
    const decoded = atob(id);
    // Chuyển đổi chuỗi đã giải mã thành chuỗi UTF-8
    return decodeURIComponent(decoded);
  } catch (error) {
    console.error('Error decoding id:', error);
    return id; // Trả về id gốc nếu có lỗi
  }
}
  
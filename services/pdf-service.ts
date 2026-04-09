import * as pdfjsLib from 'pdfjs-dist';

// Config worker để pdfjs hoạt động đúng trên môi trường trình duyệt.
// Ta dùng CDN để tránh các lỗi load worker tĩnh nội bộ trong Next.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date | null;
  totalPages: number;
}

/**
 * Trích xuất các dữ liệu meta từ file PDF upload lên
 * @param file - File chọn từ input
 * @returns {Promise<PdfMetadata>} Thông tin về book
 */
export const extractPdfMetadata = async (file: File): Promise<PdfMetadata> => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Gọi lệnh đọc document từ buffer
    const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
    const pdf = await loadingTask.promise;

    // Gọi lấy Metadata
    const metadataData = await pdf.getMetadata();
    const info = (metadataData.info as any) || {};

    // Helper phân tích định dạng ngày giờ của PDF (D:YYYYMMDDHHmmSSOHH'mm')
    const parsePdfDate = (pdfDateStr?: string): Date | null => {
      if (!pdfDateStr) return null;
      // Dạng thông dụng: D:20231015123045+07'00'
      const match = pdfDateStr.match(/^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
      if (match) {
        return new Date(
          parseInt(match[1], 10),
          parseInt(match[2], 10) - 1, // Month starts from 0
          parseInt(match[3], 10),
          parseInt(match[4], 10),
          parseInt(match[5], 10),
          parseInt(match[6], 10)
        );
      }
      return null;
    };

    return {
      title: info.Title,
      author: info.Author,
      subject: info.Subject,
      keywords: info.Keywords,
      creator: info.Creator,
      producer: info.Producer,
      creationDate: parsePdfDate(info.CreationDate),
      totalPages: pdf.numPages,
    };
  } catch (error) {
    console.error('Lỗi khi trích xuất thông tin từ PDF:', error);
    throw new Error('Không thể phân tích metadata của PDF');
  }
};

/**
 * Trích xuất thumbnail từ file PDF upload lên
 * @param file - File chọn từ input
 * @returns {Promise<string>} Thumbnail của book
 */
export const extractPdfThumbnail = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Gọi lệnh đọc document từ buffer
    const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
    const pdf = await loadingTask.promise;

    // Lấy trang đầu tiên
    const page = await pdf.getPage(1);

    // Render trang đầu tiên ra canvas
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Không thể tạo canvas');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    // Chuyển canvas sang base64
    const thumbnail = canvas.toDataURL('image/jpeg');

    return thumbnail;
  } catch (error) {
    console.error('Lỗi khi trích xuất thumbnail từ PDF:', error);
    throw new Error('Không thể trích xuất thumbnail từ PDF');
  }
};
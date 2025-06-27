'use client';

import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { Download } from 'lucide-react';
interface QRCodeGeneratorProps {
  tableId: number;
  tableName: string;
  showPrint?: boolean;
  showDownload?: boolean;
  size?: number;
}

export default function QRCodeGenerator({ tableId, tableName, showPrint = true, showDownload = true, size = 200 }: QRCodeGeneratorProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const orderUrl = `${baseUrl}/order?tableId=${tableId}&tableName=${encodeURIComponent(tableName)}`;
  console.log(orderUrl);

  const handlePrint = useReactToPrint({
    contentRef,
  });

  const handleDownload = () => {
    // Lấy SVG element của QR code
    const svgElement = document.querySelector('.template-container svg') as SVGElement;
    if (!svgElement) return;

    // Tạo một canvas để vẽ SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Đặt kích thước canvas bằng với kích thước QR code
    canvas.width = size;
    canvas.height = size;

    // Chuyển đổi SVG thành XML string
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Tạo một hình ảnh từ SVG URL
    const img = new Image();
    img.onload = () => {
      // Vẽ hình ảnh lên canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, size, size);

      // Chuyển đổi canvas thành PNG
      const pngUrl = canvas.toDataURL('image/png');

      // Tạo link tải xuống
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-code-ban-${tableName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Giải phóng URL
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={contentRef} className="template-container" >
          <div className="">
            <div className="text-center">Bàn {tableName}</div>
          </div>
          <div className=" flex justify-center py-4" >
            <div className="bg-white p-4 rounded-md" >
              <QRCode
                value={orderUrl}
                size={size}
                level="H"
              />
            </div>
          </div>
      </div>
      <div className="w-full flex justify-center items-center">
        {showPrint && <Button
          variant="outline"
          size="sm"
          title='In QR Code'
          className="flex-8 bg-amber-500 hover:bg-amber-600 text-white mr-2"
          onClick={() => handlePrint()}>In QR Code</Button>}
        {showDownload && <Button
          variant="outline"
          size="sm"
          title='Tải QR Code'
          className="flex-2 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => handleDownload()}>
          <Download className="w-4 h-4" />
        </Button>}
      </div>
    </div>
  );
} 
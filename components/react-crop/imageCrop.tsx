import React, { useState, useRef, useEffect } from 'react'

import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
    convertToPixelCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'

import 'react-image-crop/dist/ReactCrop.css'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import { Input } from '../ui/input'
import { mediaApi } from '@/services/media-api'
import { CloudUpload, Download } from 'lucide-react'
import { Button } from '../ui/button'
import Image from 'next/image'


// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}
type imageCropProps ={
    src: string;
    // onSaveChange?: (cropData: any) => void; 
}


export default function ImageCrop({ src }: imageCropProps) {
    const [imgSrc, setImgSrc] = useState('')
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
    const blobUrlRef = useRef('')
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [aspect, setAspect] = useState<number | undefined>(16 / 9)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    // Nếu có src prop thì ưu tiên dùng src làm ảnh nguồn
    useEffect(() => {
        if (src) {
            setImgSrc(src)
            setCrop(undefined)
        }
    }, [src])

    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined) // Makes crop preview update between images.
            const reader = new FileReader()
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || ''),
            )
            reader.readAsDataURL(e.target.files[0])
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }

    async function onDownloadCropClick() {
        const image = imgRef.current
        const previewCanvas = previewCanvasRef.current
        if (!image || !previewCanvas || !completedCrop) {
            throw new Error('Crop canvas does not exist')
        }

        // This will size relative to the uploaded image
        // size. If you want to size according to what they
        // are looking at on screen, remove scaleX + scaleY
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        const offscreen = new OffscreenCanvas(
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        )
        const ctx = offscreen.getContext('2d')
        if (!ctx) {
            throw new Error('No 2d context')
        }

        ctx.drawImage(
            previewCanvas,
            0,
            0,
            previewCanvas.width,
            previewCanvas.height,
            0,
            0,
            offscreen.width,
            offscreen.height,
        )
        // You might want { type: "image/jpeg", quality: <0 to 1> } to
        // reduce image size
        const blob = await offscreen.convertToBlob({
            type: 'image/png',
        })

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current)
        }
        blobUrlRef.current = URL.createObjectURL(blob)

        if (hiddenAnchorRef.current) {
            hiddenAnchorRef.current.href = blobUrlRef.current
            hiddenAnchorRef.current.click()
        }
    }

    async function handleSaveChange() {
        setUploading(true)
        setUploadSuccess(false)
        setUploadError(null)
        try {
            const image = imgRef.current
            const previewCanvas = previewCanvasRef.current
            if (!image || !previewCanvas || !completedCrop) {
                throw new Error('Crop canvas does not exist')
            }
            const scaleX = image.naturalWidth / image.width
            const scaleY = image.naturalHeight / image.height
            const offscreen = new OffscreenCanvas(
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
            )
            const ctx = offscreen.getContext('2d')
            if (!ctx) throw new Error('No 2d context')
            ctx.drawImage(
                previewCanvas,
                0,
                0,
                previewCanvas.width,
                previewCanvas.height,
                0,
                0,
                offscreen.width,
                offscreen.height,
            )
            const blob = await offscreen.convertToBlob({ type: 'image/png' })
            // Tạo file từ blob để upload
            const file = new File([blob], 'cropped-image.png', { type: 'image/png' })
            await mediaApi.upload(file)
            setUploadSuccess(true)
        } catch (err: any) {
            setUploadError(err?.message || 'Lỗi upload')
        } finally {
            setUploading(false)
        }
    }

    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    scale,
                    rotate,
                )
            }
        },
        100,
        [completedCrop, scale, rotate],
    )

    function handleToggleAspectClick() {
        if (aspect) {
            setAspect(undefined)
        } else {
            setAspect(16 / 9)

            if (imgRef.current) {
                const { width, height } = imgRef.current
                const newCrop = centerAspectCrop(width, height, 16 / 9)
                setCrop(newCrop)
                // Updates the preview
                setCompletedCrop(convertToPixelCrop(newCrop, width, height))
            }
        }
    }

    return (
        <div>
            <div className="p-3 flex flex-row gap-4 bg-gray-50 shadow-sm mb-4 rounded-sm w-full">
                <div>
                    <label htmlFor="scale-input" className='text-slate-900 font-bold'>Tỉ lệ: </label>
                    <Input
                        id="scale-input"
                        type="number"
                        step="0.1"
                        value={scale}
                        disabled={!imgSrc}
                        onChange={(e) => setScale(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label htmlFor="rotate-input" className='text-slate-900 font-bold'>Xoay: </label>
                    <Input
                        id="rotate-input"
                        type="number"
                        value={rotate}
                        disabled={!imgSrc}
                        onChange={(e) =>
                            setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
                        }
                    />
                </div>
                <div>
                    <button onClick={handleToggleAspectClick}>
                       <span className='text-slate-900 font-bold'>Toggle aspect:</span>  {aspect ? 'off' : 'on'}
                    </button>
                </div>
            </div>
            <div className="flex flex-row gap-8">

                {/* Cột xử lý crop */}
                <div className="flex-1 max-w-[50%] flex flex-col">
                    {/* Nếu không có src thì cho phép upload file */}
                    {!src && (
                        <Input type="file" accept="image/*" onChange={onSelectFile} />
                    )}


                    {!!imgSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            minHeight={100}
                        >
                            <img
                            crossOrigin='anonymous'
                                ref={imgRef}
                                alt="Crop me"
                                src={imgSrc}
                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                    )}
                </div>
                {/* Cột preview */}
                <div className="flex-1 max-w-[50%] flex flex-col items-center justify-center">
                    {!!completedCrop && (
                        <>
                            <div>
                                <canvas
                                    ref={previewCanvasRef}
                                    style={{
                                        border: '1px solid black',
                                        objectFit: 'contain',
                                        width: completedCrop.width,
                                        height: completedCrop.height,
                                    }}
                                />
                            </div>
                            <div className="mt-4 flex flex-col items-center gap-2">
                                <div className="flex flex-row mb-2">
                                <Button className='bg-slate-400 hover:bg-slate-500 mr-2'  onClick={onDownloadCropClick}><Download className='text-white'></Download> Tải xuống</Button>
                                <Button onClick={handleSaveChange} disabled={uploading} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">
                                  <CloudUpload ></CloudUpload>  {uploading ? 'Đang cập nhật...' : 'Cập nhật lên server'}
                                </Button>
                                </div>
                              
                                {uploadSuccess && <div className="text-green-600">Cập nhật thành công!</div>}
                                {uploadError && <div className="text-red-600">{uploadError}</div>}
                                <div style={{ fontSize: 12, color: '#666' }}>
                                    Nếu gặp lỗi bảo mật khi tải, hãy mở Preview ở tab mới (icon góc trên bên phải).
                                </div>
                                <a
                                    href="#hidden"
                                    ref={hiddenAnchorRef}
                                    download
                                    style={{
                                        position: 'absolute',
                                        top: '-200vh',
                                        visibility: 'hidden',
                                    }}
                                >
                                    Hidden download
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

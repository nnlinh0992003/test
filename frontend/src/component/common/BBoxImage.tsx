import React, { useEffect, useRef, useState } from 'react';

// Define props type with optional HTML img attributes
interface ImageCropperProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageSrc: string;
  bbox: string | [number, number, number, number]; // Accept both string and tuple
}

export const BBoxImage: React.FC<ImageCropperProps> = ({ imageSrc, bbox, ...imgProps }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  useEffect(() => {
    const cropImage = () => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // For cross-origin images, if applicable
      img.src = imageSrc;

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Parse bbox to array of numbers
        let bboxArray: [number, number, number, number];
        if (typeof bbox === 'string') {
          try {
            const parsed = JSON.parse(bbox) as number[];
            if (parsed.length !== 4) {
              throw new Error('Bounding box must contain exactly 4 values');
            }
            bboxArray = parsed as [number, number, number, number];
          } catch (error) {
            console.error('Failed to parse bbox:', error);
            return;
          }
        } else {
          bboxArray = bbox; // Already a tuple
        }

        // Get image dimensions
        const width = img.width;
        const height = img.height;

        // Convert normalized bbox to pixel coordinates
        const [xMinNorm, yMinNorm, xMaxNorm, yMaxNorm] = bboxArray;
        const xMin = xMinNorm * width;
        const yMin = yMinNorm * height;
        const xMax = xMaxNorm * width;
        const yMax = yMaxNorm * height;
        
        // Kích thước crop sau khi mở rộng
        const cropWidth = xMax - xMin;
        const cropHeight = yMax - yMin;
        
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          xMin, yMin, cropWidth, cropHeight, // source
          0, 0, cropWidth, cropHeight              // destination
        );

        // Convert canvas to image and set it in state
        const croppedImageData = canvas.toDataURL('image/png');
        setCroppedImage(croppedImageData);
      };

      img.onerror = () => {
        console.error('Failed to load image');
      };
    };

    cropImage();
  }, [imageSrc, bbox]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {croppedImage ? (
        <img src={croppedImage} alt="Cropped result" {...imgProps} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
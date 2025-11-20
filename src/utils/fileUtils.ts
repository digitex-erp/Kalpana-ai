import { ImageInfo } from '../types';

const MAX_DIMENSION = 768; // Max width or height of 768px

/**
 * Resizes an image file if it exceeds the MAX_DIMENSION.
 * @param file The original image file.
 * @returns A promise that resolves with a Blob of the (potentially resized) image.
 */
export const resizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
          // No resizing needed, return the original file
          resolve(file);
          return;
        }

        let newWidth, newHeight;
        if (width > height) {
          newWidth = MAX_DIMENSION;
          newHeight = (height * MAX_DIMENSION) / width;
        } else {
          newHeight = MAX_DIMENSION;
          newWidth = (width * MAX_DIMENSION) / height;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context for resizing.'));
        }
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed during resize.'));
          }
        }, file.type, 0.9); // Use 0.9 quality for JPEGs
      };
      img.onerror = reject;
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error("File could not be read for resizing."))
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export const fileToImageInfo = (file: File): Promise<ImageInfo> => {
  return new Promise(async (resolve, reject) => {
    try {
      const resizedBlob = await resizeImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        if (base64) {
          resolve({
            base64: base64,
            mimeType: resizedBlob.type,
            // Create a new preview URL from the resized blob
            previewUrl: URL.createObjectURL(resizedBlob),
          });
        } else {
          reject(new Error("Failed to read base64 data from the resized file."));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(resizedBlob);
    } catch (error) {
      reject(error);
    }
  });
};
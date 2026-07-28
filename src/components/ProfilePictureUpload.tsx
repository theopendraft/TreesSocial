import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, ZoomIn, ZoomOut, RotateCw, Crop, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageData: string) => void;
  currentAvatar?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  isOpen,
  onClose,
  onSave,
  currentAvatar
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (JPEG, PNG, GIF)',
          variant: 'destructive'
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 10MB',
          variant: 'destructive'
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        setZoom(1);
        setRotation(0);
        setCropArea({ x: 0, y: 0, width: 200, height: 200 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImageSrc(result);
          setZoom(1);
          setRotation(0);
          setCropArea({ x: 0, y: 0, width: 200, height: 200 });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent, handle?: string) => {
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(400 - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(400 - prev.height, prev.y + deltaY))
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setCropArea(prev => {
        let newWidth = prev.width;
        let newHeight = prev.height;
        let newX = prev.x;
        let newY = prev.y;
        
        switch (resizeHandle) {
          case 'nw':
            newWidth = Math.max(50, prev.width - deltaX);
            newHeight = Math.max(50, prev.height - deltaY);
            newX = prev.x + (prev.width - newWidth);
            newY = prev.y + (prev.height - newHeight);
            break;
          case 'ne':
            newWidth = Math.max(50, prev.width + deltaX);
            newHeight = Math.max(50, prev.height - deltaY);
            newY = prev.y + (prev.height - newHeight);
            break;
          case 'sw':
            newWidth = Math.max(50, prev.width - deltaX);
            newHeight = Math.max(50, prev.height + deltaY);
            newX = prev.x + (prev.width - newWidth);
            break;
          case 'se':
            newWidth = Math.max(50, prev.width + deltaX);
            newHeight = Math.max(50, prev.height + deltaY);
            break;
        }
        
        return {
          x: Math.max(0, Math.min(400 - newWidth, newX)),
          y: Math.max(0, Math.min(400 - newHeight, newY)),
          width: Math.min(400, newWidth),
          height: Math.min(400, newHeight)
        };
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isResizing, dragStart, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  const handleRotationChange = (value: number[]) => {
    setRotation(value[0]);
  };

  const handleSave = () => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to crop area
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create temporary canvas for transformations
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const img = new Image();
    img.onload = () => {
      // Set temp canvas size
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      // Apply transformations
      tempCtx.save();
      tempCtx.translate(img.width / 2, img.height / 2);
      tempCtx.rotate((rotation * Math.PI) / 180);
      tempCtx.scale(zoom, zoom);
      tempCtx.drawImage(img, -img.width / 2, -img.height / 2);
      tempCtx.restore();

      // Draw cropped area to main canvas
      ctx.drawImage(
        tempCanvas,
        cropArea.x / zoom,
        cropArea.y / zoom,
        cropArea.width / zoom,
        cropArea.height / zoom,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      // Convert to data URL and save
      const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
      onSave(croppedImageData);
      onClose();
      
      toast({
        title: 'Profile Picture Updated!',
        description: 'Your new profile picture has been saved successfully',
      });
    };
    img.src = imageSrc;
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setCropArea({ x: 0, y: 0, width: 200, height: 200 });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImageSrc('');
    setZoom(1);
    setRotation(0);
    setCropArea({ x: 0, y: 0, width: 200, height: 200 });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Upload Area */}
          {!imageSrc && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload a photo</p>
              <p className="text-muted-foreground mb-4">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports JPEG, PNG, GIF • Max 10MB
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Image Editor */}
          {imageSrc && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <div className="flex items-center gap-2">
                  <ZoomOut className="w-4 h-4" />
                  <Slider
                    value={[zoom]}
                    onValueChange={handleZoomChange}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-24"
                  />
                  <ZoomIn className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4" />
                  <Slider
                    value={[rotation]}
                    onValueChange={handleRotationChange}
                    min={-180}
                    max={180}
                    step={15}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                    {rotation}°
                  </span>
                </div>
                
                <Button variant="outline" onClick={handleReset} size="sm">
                  Reset
                </Button>
              </div>

              {/* Image Preview with Crop Area */}
              <div className="relative mx-auto" style={{ width: '400px', height: '400px' }}>
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                />
                
                {/* Crop Overlay */}
                <div
                  className="absolute border-2 border-white shadow-lg cursor-move bg-white/10 backdrop-blur-sm"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height
                  }}
                  onMouseDown={(e) => handleMouseDown(e)}
                >
                  {/* Resize Handles */}
                  <div
                    className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-nw-resize"
                    style={{ left: '-6px', top: '-6px' }}
                    onMouseDown={(e) => handleMouseDown(e, 'nw')}
                  />
                  <div
                    className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-ne-resize"
                    style={{ right: '-6px', top: '-6px' }}
                    onMouseDown={(e) => handleMouseDown(e, 'ne')}
                  />
                  <div
                    className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-sw-resize"
                    style={{ left: '-6px', bottom: '-6px' }}
                    onMouseDown={(e) => handleMouseDown(e, 'sw')}
                  />
                  <div
                    className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full cursor-se-resize"
                    style={{ right: '-6px', bottom: '-6px' }}
                    onMouseDown={(e) => handleMouseDown(e, 'se')}
                  />
                </div>
                
                {/* Crop Instructions */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  Drag to move • Drag corners to resize
                </div>
                
                {/* Crop Dimensions */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  {cropArea.width} × {cropArea.height}
                </div>
              </div>

              {/* Hidden Canvas for Processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Preview */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 mx-auto">
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleClose}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Check className="w-4 h-4 mr-2" />
                  Save Profile Picture
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

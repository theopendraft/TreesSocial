import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, 
  Type, 
  Smile, 
  Image as ImageIcon, 
  X, 
  Check, 
  RotateCw,
  Palette,
  Move,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StoryUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (storyData: StoryData) => void;
}

interface StoryData {
  id: string;
  image: string;
  textOverlays: TextOverlay[];
  stickers: Sticker[];
  createdAt: Date;
  expiresAt: Date;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isDragging: boolean;
}

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  isDragging: boolean;
}

const FONT_FAMILIES = [
  'Inter',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New'
];

const COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FFD700'
];

const STICKERS = ['😀', '😍', '🎉', '🔥', '💯', '👏', '🙌', '💪', '🎯', '⭐', '💎', '🚀', '🌈', '🌸', '🍕', '☕'];

export const StoryUpload: React.FC<StoryUploadProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [activeTextOverlay, setActiveTextOverlay] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

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
      
      if (file.size > 10 * 1024 * 1024) {
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
        setTextOverlays([]);
        setStickers([]);
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
          setTextOverlays([]);
          setStickers([]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const addTextOverlay = () => {
    const newTextOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: 'Double click to edit',
      x: 100,
      y: 100,
      fontSize: 24,
      color: '#FFFFFF',
      fontFamily: 'Inter',
      isDragging: false
    };
    setTextOverlays(prev => [...prev, newTextOverlay]);
    setActiveTextOverlay(newTextOverlay.id);
    setShowTextInput(true);
  };

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: 150,
      y: 150,
      size: 40,
      isDragging: false
    };
    setStickers(prev => [...prev, newSticker]);
    setShowStickers(false);
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(prev => 
      prev.map(overlay => 
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    );
  };

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickers(prev => 
      prev.map(sticker => 
        sticker.id === id ? { ...sticker, ...updates } : sticker
      )
    );
  };

  const deleteTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
    setActiveTextOverlay(null);
  };

  const deleteSticker = (id: string) => {
    setStickers(prev => prev.filter(sticker => sticker.id !== id));
  };

  const handleTextOverlayMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveTextOverlay(id);
    
    const overlay = textOverlays.find(o => o.id === id);
    if (overlay) {
      updateTextOverlay(id, { isDragging: true });
      
      const handleMouseMove = (e: MouseEvent) => {
        if (overlay.isDragging) {
          const rect = (e.currentTarget as Element).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          updateTextOverlay(id, { 
            x: Math.max(0, Math.min(300, x)), 
            y: Math.max(0, Math.min(500, y)) 
          });
        }
      };
      
      const handleMouseUp = () => {
        updateTextOverlay(id, { isDragging: false });
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleStickerMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    const sticker = stickers.find(s => s.id === id);
    if (sticker) {
      updateSticker(id, { isDragging: true });
      
      const handleMouseMove = (e: MouseEvent) => {
        if (sticker.isDragging) {
          const rect = (e.currentTarget as Element).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          updateSticker(id, { 
            x: Math.max(0, Math.min(300, x)), 
            y: Math.max(0, Math.min(500, y)) 
          });
        }
      };
      
      const handleMouseUp = () => {
        updateSticker(id, { isDragging: false });
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleTextDoubleClick = (id: string) => {
    setActiveTextOverlay(id);
    setShowTextInput(true);
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const handleSave = () => {
    if (!imageSrc) return;

    const storyData: StoryData = {
      id: Date.now().toString(),
      image: imageSrc,
      textOverlays,
      stickers,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    onSave(storyData);
    onClose();
    
    toast({
      title: 'Story Created!',
      description: 'Your story will be visible for 24 hours',
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImageSrc('');
    setTextOverlays([]);
    setStickers([]);
    setActiveTextOverlay(null);
    setShowTextInput(false);
    setShowStickers(false);
    setShowColorPicker(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
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
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload a photo for your story</p>
              <p className="text-muted-foreground mb-4">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports JPEG, PNG, GIF • Max 10MB • Story expires in 24 hours
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

          {/* Story Editor */}
          {imageSrc && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 items-center justify-center">
                <Button variant="outline" onClick={addTextOverlay} size="sm">
                  <Type className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowStickers(!showStickers)} 
                  size="sm"
                >
                  <Smile className="w-4 h-4 mr-2" />
                  Stickers
                </Button>
                
                <Button variant="outline" onClick={() => setShowColorPicker(!showColorPicker)} size="sm">
                  <Palette className="w-4 h-4 mr-2" />
                  Colors
                </Button>
              </div>

              {/* Stickers Panel */}
              {showStickers && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-3">Choose a sticker:</p>
                  <div className="grid grid-cols-8 gap-2">
                    {STICKERS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="w-10 h-10 text-2xl hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Picker */}
              {showColorPicker && activeTextOverlay && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-3">Choose text color:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateTextOverlay(activeTextOverlay, { color })}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Story Preview */}
              <div className="relative mx-auto" style={{ width: '300px', height: '500px' }}>
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Story preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                
                {/* Text Overlays */}
                {textOverlays.map((overlay) => (
                  <div
                    key={overlay.id}
                    className={`absolute cursor-move select-none ${
                      activeTextOverlay === overlay.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      left: overlay.x,
                      top: overlay.y,
                      fontSize: overlay.fontSize,
                      color: overlay.color,
                      fontFamily: overlay.fontFamily,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                    onMouseDown={(e) => handleTextOverlayMouseDown(e, overlay.id)}
                    onDoubleClick={() => handleTextDoubleClick(overlay.id)}
                  >
                    {overlay.text}
                    {activeTextOverlay === overlay.id && (
                      <button
                        onClick={() => deleteTextOverlay(overlay.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Stickers */}
                {stickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    className="absolute cursor-move select-none"
                    style={{
                      left: sticker.x,
                      top: sticker.y,
                      fontSize: sticker.size
                    }}
                    onMouseDown={(e) => handleStickerMouseDown(e, sticker.id)}
                  >
                    {sticker.emoji}
                    <button
                      onClick={() => deleteSticker(sticker.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Text Input Modal */}
              {showTextInput && activeTextOverlay && (
                <div className="bg-white border rounded-lg p-4 shadow-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Text:</label>
                      <Input
                        ref={textInputRef}
                        value={textOverlays.find(o => o.id === activeTextOverlay)?.text || ''}
                        onChange={(e) => updateTextOverlay(activeTextOverlay, { text: e.target.value })}
                        placeholder="Enter your text..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Font Size:</label>
                      <Slider
                        value={[textOverlays.find(o => o.id === activeTextOverlay)?.fontSize || 24]}
                        onValueChange={(value) => updateTextOverlay(activeTextOverlay, { fontSize: value[0] })}
                        min={12}
                        max={72}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        {textOverlays.find(o => o.id === activeTextOverlay)?.fontSize || 24}px
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Font Family:</label>
                      <select
                        value={textOverlays.find(o => o.id === activeTextOverlay)?.fontFamily || 'Inter'}
                        onChange={(e) => updateTextOverlay(activeTextOverlay, { fontFamily: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        {FONT_FAMILIES.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowTextInput(false)}
                        className="flex-1"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleClose}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Check className="w-4 h-4 mr-2" />
                  Create Story
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

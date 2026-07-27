import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Radio, Video, Loader2, StopCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as videoSDKService from '@/services/videosdk';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamStarted?: (streamData: any) => void;
}

export const GoLiveModal = ({ isOpen, onClose, onStreamStarted }: GoLiveModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('gaming');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStream, setActiveStream] = useState<any>(null);
  const [checkingStream, setCheckingStream] = useState(true);

  // Check for active stream when modal opens
  useEffect(() => {
    if (isOpen) {
      checkForActiveStream();
    }
  }, [isOpen]);

  const checkForActiveStream = async () => {
    setCheckingStream(true);
    try {
      const stream = await videoSDKService.getMyActiveStream();
      setActiveStream(stream);
    } catch (error) {
      console.log('No active stream found');
      setActiveStream(null);
    } finally {
      setCheckingStream(false);
    }
  };

  const handleEndStream = async () => {
    if (!activeStream) return;

    setIsLoading(true);
    try {
      await videoSDKService.endStream(activeStream.id);
      
      toast({
        title: 'Stream Ended',
        description: 'Your stream has been ended successfully',
      });

      setActiveStream(null);
      onClose();
    } catch (error: any) {
      console.error('Error ending stream:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to end stream',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStream = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a stream title',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const streamData = await videoSDKService.startStream({
        title: title.trim(),
        description: description.trim(),
        category,
      });

      toast({
        title: 'Success!',
        description: 'Your stream is starting...',
      });

      onStreamStarted?.(streamData);
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('gaming');
    } catch (error: any) {
      console.error('Error starting stream:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start stream',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-red-600" />
            <span>{activeStream ? 'Active Stream' : 'Go Live'}</span>
          </DialogTitle>
          <DialogDescription>
            {activeStream ? 'You have an active stream running' : 'Set up your livestream details'}
          </DialogDescription>
        </DialogHeader>

        {checkingStream ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : activeStream ? (
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Stream is Live</h3>
                  <p className="text-sm text-red-700 mt-1">
                    <strong>{activeStream.title}</strong>
                  </p>
                  {activeStream.description && (
                    <p className="text-sm text-red-600 mt-1">{activeStream.description}</p>
                  )}
                  <p className="text-xs text-red-500 mt-2">
                    Category: {activeStream.category}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                You need to end your current stream before starting a new one.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEndStream}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ending...
                  </>
                ) : (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Stream
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your stream title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers what your stream is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={isLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Make sure your camera and microphone are working before going live.
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartStream}
                disabled={isLoading || !title.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Go Live
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

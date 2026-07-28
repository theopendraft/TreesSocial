import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  StopCircle, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users, 
  Send,
  Settings,
  Radio,
  Circle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as videoSDKService from '@/services/videosdk';

interface VideoSDKLiveStreamProps {
  streamId?: string;
  isStreamer?: boolean;
}

export const VideoSDKLiveStream = ({ streamId, isStreamer = false }: VideoSDKLiveStreamProps) => {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(streamId || null);
  const [isRecording, setIsRecording] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamCategory, setStreamCategory] = useState('gaming');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize media stream
  const initializeMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      localStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Error',
        description: 'Failed to access camera/microphone',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Start streaming
  const handleGoLive = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a stream title',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: 'Starting stream...',
        description: 'Please wait',
      });

      // Initialize media
      const stream = await initializeMediaStream();
      if (!stream) return;

      // Start stream on backend
      const streamData = await videoSDKService.startStream({
        title: streamTitle,
        description: 'Live streaming now!',
        category: streamCategory,
      });

      setRoomId(streamData.roomId || null);
      setToken(streamData.token || null);
      setCurrentStreamId(streamData.id);
      setIsLive(true);

      toast({
        title: 'Live!',
        description: 'Your stream is now live',
      });
    } catch (error: any) {
      console.error('Error starting stream:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start stream',
        variant: 'destructive',
      });
    }
  };

  // End streaming
  const handleEndStream = async () => {
    if (!currentStreamId) return;

    try {
      await videoSDKService.endStream(currentStreamId);
      
      // Stop local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      setIsLive(false);
      setRoomId(null);
      setToken(null);
      setCurrentStreamId(null);

      toast({
        title: 'Stream Ended',
        description: 'Your stream has ended successfully',
      });
    } catch (error: any) {
      console.error('Error ending stream:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to end stream',
        variant: 'destructive',
      });
    }
  };

  // Join stream as viewer
  const handleJoinStream = async () => {
    if (!streamId) return;

    try {
      const data = await videoSDKService.joinStream(streamId);
      setRoomId(data.roomId);
      setToken(data.token);
      setIsLive(true);

      toast({
        title: 'Joined',
        description: 'You joined the stream',
      });
    } catch (error: any) {
      console.error('Error joining stream:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join stream',
        variant: 'destructive',
      });
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // Start recording
  const handleStartRecording = async () => {
    if (!currentStreamId) return;

    try {
      await videoSDKService.startRecording(currentStreamId);
      setIsRecording(true);
      toast({
        title: 'Recording Started',
        description: 'Your stream is now being recorded',
      });
    } catch (error: any) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Failed to start recording',
        variant: 'destructive',
      });
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    if (!currentStreamId) return;

    try {
      await videoSDKService.stopRecording(currentStreamId);
      setIsRecording(false);
      toast({
        title: 'Recording Stopped',
        description: 'Recording saved successfully',
      });
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop recording',
        variant: 'destructive',
      });
    }
  };

  // Send chat message
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        user: user?.username || 'Anonymous',
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Pre-stream setup (for streamers)
  if (isStreamer && !isLive) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Go Live</h2>
              <p className="text-muted-foreground">Set up your stream</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stream Title</label>
                <Input
                  placeholder="Enter your stream title..."
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={streamCategory}
                  onChange={(e) => setStreamCategory(e.target.value)}
                >
                  <option value="gaming">Gaming</option>
                  <option value="music">Music</option>
                  <option value="art">Art</option>
                  <option value="education">Education</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full rounded-lg"
                />
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMic}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCamera}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleGoLive}
            >
              <Radio className="w-4 h-4 mr-2" />
              Go Live
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Live streaming interface
  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-black p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-medium">{streamTitle || 'Live Stream'}</h3>
            <p className="text-gray-400 text-sm">{user?.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="w-2 h-2 fill-current mr-1" />
              LIVE
            </Badge>
          )}
          <div className="flex items-center space-x-2 text-white">
            <Users className="w-4 h-4" />
            <span className="text-sm">{viewerCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 bg-gray-900 flex flex-col items-center justify-center relative">
          <video
            ref={videoRef}
            autoPlay
            muted={isStreamer}
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Stream Controls (for streamer) */}
          {isStreamer && isLive && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/70 px-6 py-3 rounded-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMic}
                className={`text-white ${!isMicOn ? 'bg-red-600' : ''}`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCamera}
                className={`text-white ${!isCameraOn ? 'bg-red-600' : ''}`}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`text-white ${isRecording ? 'bg-red-600' : ''}`}
              >
                <Circle className={`w-5 h-5 ${isRecording ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndStream}
                className="ml-4"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                End Stream
              </Button>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-white flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{msg.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-primary">{msg.user}</span>
                      <span className="ml-2">{msg.message}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

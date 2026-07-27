import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Users, X, Mic, MicOff, Video as VideoIcon, VideoOff, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import * as videoSDKService from '@/services/videosdk';

interface LiveStreamPageProps {
  isStreaming: boolean;
  streamData?: any;
}

export const LiveStreamPage = ({ isStreaming: initialStreaming, streamData: initialData }: LiveStreamPageProps) => {
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(initialStreaming);
  const [streamData, setStreamData] = useState(initialData);
  const [viewers, setViewers] = useState<string[]>([]);
  const [joinMessages, setJoinMessages] = useState<Array<{ id: string; name: string; time: number }>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isStreaming && videoRef.current) {
      // Initialize camera
      initializeCamera();
    }
  }, [isStreaming]);

  // Auto-hide join messages after 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setJoinMessages(prev => prev.filter(msg => now - msg.time < 3000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Failed to access camera and microphone',
        variant: 'destructive',
      });
    }
  };

  const handleGoLive = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a stream title',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = await videoSDKService.startStream({
        title: streamTitle.trim(),
        description: '',
        category: 'other',
      });

      setStreamData(data);
      setIsStreaming(true);
      setShowGoLiveModal(false);
      
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

  const handleEndStream = async () => {
    if (!streamData?.id) return;

    try {
      await videoSDKService.endStream(streamData.id);
      
      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      setIsStreaming(false);
      setStreamData(null);
      setViewers([]);
      setJoinMessages([]);
      
      toast({
        title: 'Stream Ended',
        description: 'Your stream has been ended',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error ending stream:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to end stream',
        variant: 'destructive',
      });
    }
  };

  const toggleMute = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getAudioTracks();
      tracks.forEach(track => track.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getVideoTracks();
      tracks.forEach(track => track.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  // Simulate viewer joining (in real app, this would come from WebSocket)
  const simulateViewerJoin = (name: string) => {
    setViewers(prev => [...prev, name]);
    setJoinMessages(prev => [...prev, { id: Date.now().toString(), name, time: Date.now() }]);
  };

  if (!isStreaming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Go Live</h1>
            <p className="text-purple-200">Share your moment with followers</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="What's your stream about?"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-purple-200 text-lg py-6"
              onKeyPress={(e) => e.key === 'Enter' && handleGoLive()}
            />

            <Button
              onClick={handleGoLive}
              disabled={!streamTitle.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Live Stream
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-red-600 rounded-full flex items-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-white font-semibold">LIVE</span>
            </div>
            <div className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full flex items-center space-x-2">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white font-semibold">{viewers.length}</span>
            </div>
          </div>

          <Button
            onClick={handleEndStream}
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {streamData?.title && (
          <div className="mt-3 px-4">
            <p className="text-white text-lg font-medium">{streamData.title}</p>
          </div>
        )}
      </div>

      {/* Join Messages */}
      <div className="absolute top-32 left-4 right-4 space-y-2 z-10">
        {joinMessages.map((msg) => (
          <div
            key={msg.id}
            className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full inline-block animate-fade-in"
          >
            <span className="font-semibold">{msg.name}</span> joined the stream
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent z-10">
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={toggleMute}
            size="icon"
            className={`w-14 h-14 rounded-full ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
            } backdrop-blur-sm`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </Button>

          <Button
            onClick={toggleVideo}
            size="icon"
            className={`w-14 h-14 rounded-full ${
              isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
            } backdrop-blur-sm`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <VideoIcon className="w-6 h-6 text-white" />}
          </Button>

          <Button
            onClick={handleEndStream}
            className="px-8 py-6 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold text-lg"
          >
            End Stream
          </Button>
        </div>
      </div>

      {/* Test button to simulate viewer join (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => simulateViewerJoin(`User${Math.floor(Math.random() * 100)}`)}
          className="absolute top-40 right-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Test Join
        </button>
      )}
    </div>
  );
};

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  distance: number;
  interests: string[];
}

interface MatchingSwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
}

export const MatchingSwipeCard = ({ user, onSwipe }: MatchingSwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % user.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + user.images.length) % user.images.length);
  };

  return (
    <>
      <Card className="overflow-hidden relative">
        <div className="relative">
          <img
            src={user.images[currentImageIndex]}
            alt={user.name}
            className="w-full h-96 object-cover"
          />
          
          {user.images.length > 1 && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 p-0"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 p-0"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {user.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
            <h2 className="text-2xl font-bold">{user.name}, {user.age}</h2>
            <p className="text-sm opacity-90">{user.distance} km away</p>
          </div>
        </div>
        
        <CardContent className="p-4">
          <p className="mb-3">{user.bio}</p>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <Badge key={interest} variant="secondary">{interest}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center space-x-6 mt-6">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 border-red-500 hover:bg-red-50"
          onClick={() => onSwipe('left')}
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
          onClick={() => onSwipe('right')}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
};
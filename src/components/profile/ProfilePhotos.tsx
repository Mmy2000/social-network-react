
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Photo {
  id: number;
  url: string;
  description: string;
}

interface ProfilePhotosProps {
  photos: Photo[];
}

const ProfilePhotos = ({ photos }: ProfilePhotosProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden">
          <img 
            src={photo.url} 
            alt={photo.description}
            className="w-full h-48 object-cover"
          />
        </Card>
      ))}
    </div>
  );
};

export default ProfilePhotos;

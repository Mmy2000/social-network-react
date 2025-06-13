
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";



const ProfilePhotos = ({ images }) => {

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images?.map((photo) => (
        <Card key={photo.id} className="overflow-hidden dark:border-gray-700">
          <img
            src={photo.image}
            alt={photo.description}
            className="w-full h-48 object-cover"
          />
        </Card>
      ))}
    </div>
  );
};

export default ProfilePhotos;

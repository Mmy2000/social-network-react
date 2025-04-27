
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ProfileInfo {
  work: string;
  education: string;
  location: string;
  joinedDate: string;
}

interface ProfileAboutProps {
  info: ProfileInfo;
}

const ProfileAbout = ({ info }: ProfileAboutProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-500 mb-1">Work</h3>
            <p>{info.work}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-500 mb-1">Education</h3>
            <p>{info.education}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-500 mb-1">Location</h3>
            <p>{info.location}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-500 mb-1">Joined</h3>
            <p>{info.joinedDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileAbout;

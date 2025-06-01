
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";



const ProfileAbout = ({ info }) => {
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-500 mb-1">Work</h3>
            <p>{info?.profile?.work}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-500 mb-1">Education</h3>
            <p>{info?.profile?.education}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-500 mb-1">Location</h3>
            <p>{info?.profile?.full_address}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-500 mb-1">Joined Date</h3>
            <p>
              {info?.date_joined &&
                new Date(info.date_joined).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileAbout;

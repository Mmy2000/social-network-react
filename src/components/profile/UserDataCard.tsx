
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserRound, MapPin, Briefcase, GraduationCap } from 'lucide-react';



const UserDataCard = ({ profile }) => {
    
  return (
    <Card className="sticky top-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2 bg-gray-50 rounded-lg">
            {profile?.profile?.profile_picture ? 
              <img
                src={profile?.profile?.profile_picture}
                alt={profile?.profile?.full_name}
                className="h-6 w-6 rounded-full"
              />
             : <UserRound className="text-facebook h-6 w-6" />}
          </div>
          <h2 className="font-semibold text-xl text-gray-800">
            {profile?.profile?.full_name}
          </h2>
        </div>

        {profile?.profile?.work && (
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Briefcase className="h-4 w-4 text-gray-600 group-hover:text-facebook" />
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
              {profile?.profile?.work}
            </span>
          </div>
        )}

        {profile?.profile?.education && (
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <GraduationCap className="h-4 w-4 text-gray-600 group-hover:text-facebook" />
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
              {profile?.profile?.education}
            </span>
          </div>
        )}

        {profile?.profile?.full_address && (
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <MapPin className="h-4 w-4 text-gray-600 group-hover:text-facebook" />
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
              {profile?.profile?.full_address}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDataCard;

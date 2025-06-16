
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserRound, MapPin, Briefcase, GraduationCap } from 'lucide-react';



const UserDataCard = ({ profile }) => {
    
  return (
    <Card className="sticky top-20 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="p-2 bg-gray-50 rounded-lg dark:bg-gray-700">
            {profile?.profile?.profile_picture ? 
              <img
                src={profile?.profile?.profile_picture}
                alt={profile?.profile?.full_name}
                className="h-6 w-6 rounded-full"
              />
             : <UserRound className="text-facebook h-6 w-6" />}
          </div>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-300">
            {profile?.profile?.full_name}
          </h2>
        </div>

        {profile?.profile?.work && (
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600">
              <Briefcase className="h-4 w-4 text-gray-600 group-hover:text-facebook dark:text-gray-300 dark:group-hover:text-gray-200" />
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors dark:text-gray-300 dark:group-hover:text-gray-200">
              {profile?.profile?.work}
            </span>
          </div>
        )}

        {profile?.profile?.education && (
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600">
              <GraduationCap className="h-4 w-4 text-gray-600 group-hover:text-facebook dark:text-gray-300 dark:group-hover:text-gray-200" />
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors dark:text-gray-300 dark:group-hover:text-gray-200">
              {profile?.profile?.education}
            </span>
          </div>
        )}

        {profile?.profile?.full_address && (
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600">
              <MapPin className="h-4 w-4 text-gray-600 group-hover:text-facebook dark:text-gray-300 dark:group-hover:text-gray-200" />
            </div>
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors dark:text-gray-300 dark:group-hover:text-gray-200">
              {profile?.profile?.full_address}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDataCard;

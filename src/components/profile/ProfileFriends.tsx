
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

interface Friend {
  id: number;
  name: string;
  avatar: string;
}

interface ProfileFriendsProps {
  friends: Friend[];
}

const ProfileFriends = ({ friends }: ProfileFriendsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {friends.map((friend) => (
        <Card key={friend.id}>
          <CardContent className="p-4">
            <Link to={`/profile/${friend.id}`} className="flex flex-col items-center space-y-2">
              <Avatar className="h-24 w-24">
                <img src={friend.avatar} alt={friend.name} />
              </Avatar>
              <h3 className="font-medium text-center">{friend.name}</h3>
              <Button variant="outline" className="w-full">View Profile</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfileFriends;

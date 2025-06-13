
import React from 'react';
import Feed from '../components/feed/Feed';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightSidebar from '../components/layout/RightSidebar';

const Index = () => {
  return (
    <div className="container mx-auto px-0 max-w-screen-xl">
      <div className="flex">
        <LeftSidebar />
        <main className="flex-1 py-4 px-1">
          <Feed />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default Index;

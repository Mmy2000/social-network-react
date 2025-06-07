import React from 'react';
import { useUser } from '@/context/UserContext';
import apiService from '@/apiService/apiService';
import { Card } from '@/components/ui/card';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';

const fetchPhotos = async ({ pageParam = 1, pageSize = 9, accessToken }) => {
  const response = await apiService.get(`/posts/photos/?page=${pageParam}&per_page=${pageSize}`, accessToken);
  return {
    photos: response.data,
    nextPage: pageParam + 1,
    pageSize: pageSize,
    isLastPage: response.pagination.current_page >= response.pagination.last_page,
  };
};

function Photo() {
  const { user } = useUser();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ['photos'],
    queryFn: ({ pageParam }) => fetchPhotos({ pageParam, accessToken: user?.access }),
    getNextPageParam: (lastPage) =>
      !lastPage.isLastPage ? lastPage.nextPage : undefined,
    enabled: !!user?.access, // ensures token is available before fetch
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return <div>Error loading photos</div>;
  }

  const allPhotos = data?.pages.flatMap((page) => page.photos) || [];

  return (
    <div className="container mx-auto px-4 max-w-screen-xl">
      <div className="flex">
        <LeftSidebar />
        <InfiniteScroll
          dataLength={allPhotos.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-4" />}
          endMessage={
            <p className="text-center text-sm text-gray-500 py-4">
              No more photos to load.
            </p>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 px-2">
            {allPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <img
                  src={photo.image}
                  alt={photo.description}
                  className="w-full h-48 object-cover"
                />
              </Card>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default Photo;

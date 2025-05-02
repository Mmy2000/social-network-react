import React from 'react'
import { useParams } from 'react-router-dom';

const PostDetails = () => {
    const { id } = useParams<{ id: string }>();
    console.log(id);
    
  return (
    <div>PostDetails</div>
  )
}

export default PostDetails
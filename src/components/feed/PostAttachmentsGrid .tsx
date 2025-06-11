import React, { useState } from "react";
import ImageModal from "../modal/ImageModal";


const PostAttachmentsGrid = ({ attachments }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!attachments || attachments.length === 0) return null;

  const visibleAttachments = attachments.slice(0, 3);
  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  return (
    <>
      <div
        className={`grid gap-2 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 ${
          attachments.length === 1 ? "" : "grid-cols-2"
        } ${attachments.length > 2 ? "md:grid-cols-3" : ""}`}
      >
        {visibleAttachments.map((attachment, index) => (
          <div
            key={index}
            className={`relative h-64 w-full ${
              attachments.length === 1 ? "col-span-full" : ""
            }`}
          >
            <img
              src={attachment.image}
              alt={`Attachment ${index + 1}`}
              className="w-full h-full object-cover rounded-md cursor-pointer"
              onClick={handleOpenModal}
            />
            {index === 2 && attachments.length > 3 && (
              <div
                onClick={handleOpenModal}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold rounded-md cursor-pointer"
              >
                +{attachments.length - 2}
              </div>
            )}
          </div>
        ))}
      </div>

      <ImageModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        images={attachments}
      />
    </>
  );
};

export default PostAttachmentsGrid;

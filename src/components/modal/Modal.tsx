"use client";

import { useCallback, useEffect, useState } from "react";

interface ModalProps {
  label: string;
  close: () => void;
  content: React.ReactElement;
  isOpen: boolean;
}

const Modal: React.FC<ModalProps> = ({
  label,
  content,
  isOpen,
  close,
}) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      close();
    }, 300); // Smoother close delay
  }, [close]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex items-center justify-center fixed inset-0 z-50 bg-black/50 backdrop-blur-none">
      <div className="relative w-[90%] md:w-[80%] lg:w-[700px] my-6 mx-auto max-w-3xl max-h-screen overflow-y-auto">
        <div
          className={`transition-all transform duration-500 ${
            showModal
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-5 scale-95 opacity-0"
          }`}
        >
          <div className="w-full bg-white shadow-2xl rounded-lg overflow-hidden relative flex flex-col max-h-[90vh]">
            {/* Header Section */}
            <header className="flex items-center justify-between px-6 py-3 bg-gray-100 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">{label}</h2>
              <div
                onClick={handleClose}
                className="p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full cursor-pointer"
              >
                &times;
              </div>
            </header>
            {/* Content Section */}
            <main className="p-6">{content}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
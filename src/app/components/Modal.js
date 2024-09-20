"use client";

import { useState, useEffect } from "react";

export default function Modal({ children, isOpen, onClose }) {
  const [modalOpen, setModalOpen] = useState(isOpen);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  return (
    <div className="overflow-hidden">
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none">
          <div
            onClick={() => handleClose()}
            className="fixed inset-0 z-0 bg-black opacity-25"
          />
          <div className="z-1 relative w-auto max-w-lg mx-auto my-6">
            <div className="relative flex w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
              <div className="relative p-4 flex-auto">{children}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DiscoModal({ children, isOpen }) {
  const [modalOpen, setModalOpen] = useState(isOpen);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  return (
    <div className="overflow-hidden">
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none">
          <div className="fixed inset-0 z-0 backdrop-blur-sm backdrop-brightness-75" />

          <div className="z-1 relative w-auto max-w-lg mx-auto my-6">
            <div className="relative flex w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
              <div className="relative p-4 flex-auto">{children}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

// export default function Modal({ children, isOpen, onClose }) {
//   const [modalOpen, setModalOpen] = useState(isOpen);

//   useEffect(() => {
//     setModalOpen(isOpen);
//   }, [isOpen]);

//   const handleClose = () => {
//     setModalOpen(false);
//     onClose();
//   };

//   return (
//     // <div className="overflow-hidden">
//     <div
//       className="overflow-hidden fixed"
//       style={{
//         zIndex: isOpen ? 100 : 0,
//         height: isOpen ? "100vh" : 0,
//         width: isOpen ? "100vw" : 0,
//         top: 0,
//         left: 0,
//       }}
//     >
//       {modalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none">
//           <div
//             onClick={() => handleClose()}
//             // className="fixed inset-0 z-0 bg-black opacity-25"
//             className="fixed inset-0 bg-black opacity-25"
//           />
//           <div className="z-1 relative w-auto max-w-lg mx-auto my-6">
//             <div className="relative flex w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
//               <div className="relative p-4 flex-auto bg-gray-100 rounded-lg">
//                 {children}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

export default function Modal({ children, isOpen, onClose }) {
  const [modalOpen, setModalOpen] = useState(isOpen);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  if (typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    modalOpen && (
      <div
        className="overflow-hidden fixed"
        style={{
          zIndex: isOpen ? 100 : 0,
          height: isOpen ? "100vh" : 0,
          width: isOpen ? "100vw" : 0,
          top: 0,
          left: 0,
        }}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none">
          <div
            onClick={() => handleClose()}
            className="fixed inset-0 bg-black opacity-25"
          />
          <div className="z-1 relative w-auto max-w-lg mx-auto my-6">
            <div className="relative flex w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
              <div className="relative p-4 flex-auto bg-gray-100 rounded-lg">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    document.body
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

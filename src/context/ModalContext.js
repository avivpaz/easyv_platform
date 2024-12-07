import React, { createContext, useContext, useState } from 'react';
import { SuccessModal } from '../components/SuccessModal';

const ModalContext = createContext({});

export const ModalProvider = ({ children }) => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const showSuccessModal = () => setIsSuccessModalOpen(true);
  const hideSuccessModal = () => setIsSuccessModalOpen(false);

  return (
    <ModalContext.Provider value={{ showSuccessModal, hideSuccessModal }}>
      {children}
      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={hideSuccessModal} 
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
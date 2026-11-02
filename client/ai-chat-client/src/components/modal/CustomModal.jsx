import React from "react";
import { Modal } from "react-bootstrap";

const CustomModal = ({ showHeader, size, open, setOpen, title, children }) => {
  return (
    <div>
      <Modal size={size} show={open} onHide={() => setOpen(!open)} centered>
        {showHeader && (
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
        )}

        <Modal.Body>{children}</Modal.Body>
      </Modal>
    </div>
  );
};

export default CustomModal;

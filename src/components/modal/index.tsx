import React, { useRef } from "react";
import { RiCloseLine } from "react-icons/ri";

export type CustomModalProps = {
  modalChildren: React.ReactNode;
  buttonChildren: React.ReactNode;
  buttonAttrs: React.HTMLAttributes<HTMLButtonElement>;
  dialogAttrs: React.HTMLAttributes<HTMLDialogElement>;
};

const CustomModal: React.FC<CustomModalProps> = (props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // control modal
  function openModal() {
    if (dialogRef.current === null) return;
    dialogRef.current.showModal();
  }

  function closeModal() {
    if (dialogRef.current === null) return;
    dialogRef.current.close();
  }

  return (
    <>
      <button onClick={openModal} {...props.buttonAttrs}>
        {props.buttonChildren}
      </button>
      <dialog
        ref={dialogRef}
        className="w-11/12 rounded-xl bg-gray-100 shadow-2xl md:w-2/5 "
        {...props.dialogAttrs}
      >
        <button onClick={closeModal}>
          <RiCloseLine className="text-3xl " />
        </button>
        {props.modalChildren}
      </dialog>
    </>
  );
};
export default CustomModal;

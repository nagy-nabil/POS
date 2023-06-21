import React from "react";
import { RiCloseLine } from "react-icons/ri";

export type CustomModalProps = {
  // give the parent component the ability to control the dialog directly
  dialogRef: React.RefObject<HTMLDialogElement>;
  modalChildren: React.ReactNode;
  buttonChildren: React.ReactNode;
  buttonAttrs: React.HTMLAttributes<HTMLButtonElement> &
    React.ButtonHTMLAttributes<HTMLButtonElement>;
  dialogAttrs: React.HTMLAttributes<HTMLDialogElement>;
};

const CustomModal: React.FC<CustomModalProps> = (props) => {
  // control modal
  function openModal() {
    if (props.dialogRef.current === null) return;
    props.dialogRef.current.showModal();
  }

  function closeModal() {
    if (props.dialogRef.current === null) return;
    props.dialogRef.current.close();
  }

  return (
    <>
      <button onClick={openModal} {...props.buttonAttrs}>
        {props.buttonChildren}
      </button>
      <dialog
        ref={props.dialogRef}
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

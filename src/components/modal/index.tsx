import React, { useRef } from "react";
import { RiCloseLine } from "react-icons/ri";
import type { IconType } from "react-icons";

export type CustomModalProps = {
  children: React.ReactNode;
  Icon: IconType;
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
      <button onClick={openModal}>
        <props.Icon className="h-fit w-fit p-3 text-3xl" />
      </button>
      <dialog
        ref={dialogRef}
        className="w-11/12 rounded-xl bg-gray-100 shadow-2xl md:w-2/5 "
      >
        <button onClick={closeModal}>
          <RiCloseLine className="text-3xl " />
        </button>
        {props.children}
      </dialog>
    </>
  );
};
export default CustomModal;

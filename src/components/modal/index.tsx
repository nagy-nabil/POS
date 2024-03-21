import React, { type ComponentProps } from "react";
import { RiCloseLine } from "react-icons/ri";

import { Button } from "../ui/button";

export type CustomModalProps = {
  header: string;
  // give the parent component the ability to control the dialog directly
  dialogRef: React.RefObject<HTMLDialogElement>;
  /**
   * normally need to be the body and the footer of the form
   */
  modalChildren: React.ReactNode;
  buttonChildren: React.ReactNode;
  buttonAttrs: ComponentProps<typeof Button>;
  formAttrs: React.HTMLAttributes<HTMLFormElement> &
    React.FormHTMLAttributes<HTMLFormElement>;
  dialogAttrs: React.HTMLAttributes<HTMLDialogElement> &
    React.DialogHTMLAttributes<HTMLDialogElement>;
};

/**
 * for now all use cases for dialog included form, and that form includes header, body, footer(utils) so this custom modal will contain the header ready with close, and the user of this modal need to provide the body and the footer
 * @param props
 * @returns
 */
export default function CustomModal(props: CustomModalProps) {
  // control modal
  function openModal() {
    if (props.dialogRef.current === null) return;
    props.dialogRef.current.showModal();
  }

  function closeModal() {
    if (props.dialogRef.current === null) return;
    props.dialogRef.current.close("close");
  }

  return (
    <>
      <Button {...props.buttonAttrs} onClick={openModal}>
        {props.buttonChildren}
      </Button>
      <dialog
        onClick={(e) => {
          // close the modal when click outside the dialog content
          // the content now is all wraped by form, that's make it easy to inspect
          // the "nodeName" and if it's === 'dialog' no way this is inside the dialog
          if ((e.target as HTMLDialogElement).nodeName === "DIALOG") {
            closeModal();
          }
        }}
        ref={props.dialogRef}
        className="w-11/12 rounded-xl p-0 shadow-2xl md:w-2/5"
        {...props.dialogAttrs}
      >
        <form className="flex flex-col p-3 w-full h-full" {...props.formAttrs}>
          <header className="sticky mb-3 flex justify-between border-b-2">
            <h1 className="my-2 text-3xl">{props.header}</h1>
            <Button
              type="button"
              variant={"ghost"}
              size={"icon"}
              onClick={closeModal}
            >
              <RiCloseLine className="text-4xl " />
            </Button>
          </header>
          {props.modalChildren}
        </form>
      </dialog>
    </>
  );
}

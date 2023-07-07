import React, { useRef } from "react";
import CustomModal, { type CustomModalProps } from ".";

export type ConfirmModalProps = {
  /**
   * confirmation message
   */
  header: string;
  bodyMessage: string;
  onCancel?: () => void;
  onOk: () => void;
  buttonChildren: CustomModalProps["buttonChildren"];
};
/**
 * buttons inside a form using method="dialog" can close a dialog without JavaScript and pass data.
 * can pass data with closing the dialog to inform the onClose handlers with data
 */

/**
 *
 * @param props
 * @returns
 */
export default function ConfirmModal(props: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <CustomModal
      header={props.header}
      buttonAttrs={{}}
      dialogAttrs={{}}
      formAttrs={{ method: "dialog" }}
      dialogRef={dialogRef}
      buttonChildren={props.buttonChildren}
      modalChildren={
        <main>
          <p>{props.bodyMessage}</p>
          <div>
            <button autoFocus={true}>Cancel</button>
            <button className="text-red-400" onClick={props.onOk}>
              Confirm
            </button>
          </div>
        </main>
      }
    />
  );
}

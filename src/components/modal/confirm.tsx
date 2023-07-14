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
      dialogAttrs={{
        onClose(event) {
          console.log(
            "return value",
            (event.target as HTMLDialogElement).returnValue
          );
          // props.onCancel();
        },
      }}
      formAttrs={{ method: "dialog" }}
      dialogRef={dialogRef}
      buttonChildren={props.buttonChildren}
      modalChildren={
        <main>
          <p>{props.bodyMessage}</p>
          <div className="mt-2 flex justify-end gap-3 border-t-2 pt-2">
            <button
              formMethod="dialog"
              autoFocus={true}
              value={"cancel"}
              className="h-fit w-fit rounded-2xl border-2 p-3"
            >
              Cancel
            </button>
            <button
              className="h-fit w-fit rounded-2xl border-2 p-3 text-red-500"
              type="button"
              onClick={() => {
                if (dialogRef.current !== null) {
                  dialogRef.current.close("confirm");
                  props.onOk();
                }
              }}
            >
              Confirm
            </button>
          </div>
        </main>
      }
    />
  );
}

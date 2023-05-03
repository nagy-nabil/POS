import Modal, { type Props, type Styles } from "react-modal";
import merge from "lodash/merge";
import { useMemo } from "react";
Modal.setAppElement("#__next");

const customStyles: Styles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "0",
    border: "none",
    // backgroundColor: "transparent",
    minWidth: "30%",
    minHeight: "60%",
  },
  overlay: {
    backgroundColor: "rgba(0, 7, 24, 0.6)",
  },
};

const CustomModal: React.FC<Props> = (props) => {
  const { children, style, ...rest } = props;
  //   if (style === undefined) {
  //     throw new Error("no style how baby");
  //   }
  const myStyles = useMemo(() => merge(customStyles, style), [style]);
  return (
    <Modal {...rest} style={myStyles}>
      {children}
    </Modal>
  );
};
export default CustomModal;

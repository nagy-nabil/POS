import {
  Html5QrcodeScanner,
  type Html5QrcodeCameraScanConfig,
  type Html5QrcodeFullConfig,
  type QrcodeErrorCallback,
  type Html5QrcodeResult,
  Html5QrcodeScanType,
} from "html5-qrcode";
import { useEffect } from "react";

const QrCode: React.FC<
  {
    qrcodeSuccessCallback: (
      decodedText: string,
      result: Html5QrcodeResult,
      scanner: Html5QrcodeScanner
    ) => void;
    qrcodeErrorCallback?: QrcodeErrorCallback;
    fps: number | undefined;
    qrId: string;
  } & Partial<Html5QrcodeCameraScanConfig & Html5QrcodeFullConfig>
> = (props) => {
  useEffect(() => {
    const verbose = props.verbose === true;
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-full-id-modal",
      {
        rememberLastUsedCamera: false,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        ...props,
      },
      verbose
    );
    html5QrcodeScanner.render((text, decode) => {
      props.qrcodeSuccessCallback(text, decode, html5QrcodeScanner);
    }, props.qrcodeErrorCallback);

    // cleanup function when component will unmount
    return () => {
      console.log("unmount");
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return <div id={"qr-full-id-modal"} />;
};

export default QrCode;

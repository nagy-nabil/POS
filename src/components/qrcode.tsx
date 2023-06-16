import {
  Html5QrcodeScanner,
  type Html5QrcodeCameraScanConfig,
  type Html5QrcodeFullConfig,
  type QrcodeErrorCallback,
  type QrcodeSuccessCallback,
} from "html5-qrcode";
import { useEffect } from "react";

const qrcodeRegionId = "html5qr-code-full-region";

const QrCode: React.FC<
  {
    qrcodeSuccessCallback: QrcodeSuccessCallback;
    qrcodeErrorCallback?: QrcodeErrorCallback;
    fps: number | undefined;
  } & Partial<Html5QrcodeCameraScanConfig & Html5QrcodeFullConfig>
> = (props) => {
  useEffect(() => {
    const verbose = props.verbose === true;
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      { rememberLastUsedCamera: false, ...props },
      verbose
    );
    html5QrcodeScanner.render(
      props.qrcodeSuccessCallback,
      props.qrcodeErrorCallback
    );

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [props]);

  return <div id={qrcodeRegionId} />;
};

export default QrCode;

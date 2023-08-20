import { memo, useEffect, useRef } from "react";
import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats,
  type Html5QrcodeCameraScanConfig,
  type Html5QrcodeFullConfig,
  type Html5QrcodeResult,
  type QrcodeErrorCallback,
} from "html5-qrcode";

export type QrCodeProps = {
  qrcodeSuccessCallback: (
    decodedText: string,
    result: Html5QrcodeResult,
    scanner: Html5QrcodeScanner
  ) => void;
  qrcodeErrorCallback?: QrcodeErrorCallback;
  fps: number | undefined;
  qrId: string;
} & Partial<Html5QrcodeCameraScanConfig & Html5QrcodeFullConfig>;

const QrCode = memo(function QrCode(props: QrCodeProps) {
  const { qrcodeSuccessCallback, qrcodeErrorCallback, fps, qrId: id } = props;
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    function getScanner() {
      if (scannerRef.current !== null) {
        return scannerRef.current;
      }
      const html5QrcodeScanner = new Html5QrcodeScanner(
        id,
        {
          rememberLastUsedCamera: false,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          useBarCodeDetectorIfSupported: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
          ],
          fps,
        },
        false
      );
      scannerRef.current = html5QrcodeScanner;
      return html5QrcodeScanner;
    }

    getScanner().render((text, decode) => {
      if (scannerRef.current)
        qrcodeSuccessCallback(text, decode, scannerRef.current);
    }, qrcodeErrorCallback);

    // cleanup function when component will unmount
    return () => {
      console.log("unmount");
      getScanner()
        .clear()
        .catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrcodeErrorCallback, qrcodeSuccessCallback, id]);

  return <div id={id} />;
});

export default QrCode;

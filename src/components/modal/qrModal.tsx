import React, { useRef, useState } from "react";
import CustomModal from ".";
import { api } from "@/utils/api";
import { type Product } from "@prisma/client";
import { BsQrCodeScan } from "react-icons/bs";
import { KeypadDisplay } from "../productDisplay";
import { type CrateItem } from "@/components/modal/crateModal";
import QrCode from "../qrcode";
import { useAuth } from "@/hooks/useAuth";
import { Html5QrcodeScannerState, type Html5QrcodeScanner } from "html5-qrcode";

export type QrModalProps = {
  setOnCrate: React.Dispatch<React.SetStateAction<CrateItem[]>>;
};

const QrModal: React.FC<QrModalProps> = (props) => {
  const dialgoRef = useRef(null);
  const { setToken } = useAuth({ redirectAfterSet: "/signin" });
  // i don't know if this a good design or even valid react code but i want to keep ref to the scanner
  // to make using it in this component easier
  const scannerRef = useRef<Html5QrcodeScanner | undefined>(undefined);
  // from the react docs => Do not write or read ref.current during rendering.
  // so i use those state to sync the render with the scanner
  const [isScannerPaused, setIsScannerPaused] = useState(false);
  const [scannerRead, setScannerRead] = useState<Product | undefined>(
    undefined
  );
  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        setToken("").catch((e) => {
          throw e;
        });
        return false;
      }
      return true;
    },
  });

  if (productsQuery.isLoading) return <p>loading ...</p>;
  else if (productsQuery.isError) {
    return <p>{JSON.stringify(productsQuery.error)}</p>;
  }

  return (
    <CustomModal
      dialogRef={dialgoRef}
      buttonAttrs={{ className: "" }}
      dialogAttrs={{}}
      buttonChildren={
        <BsQrCodeScan className="h-fit w-fit rounded-full bg-black p-2 text-3xl text-white" />
      }
      modalChildren={
        <div className="flex flex-col items-center gap-4">
          <QrCode
            qrId="orderQr"
            fps={15}
            qrcodeSuccessCallback={(text, _, scanner) => {
              scannerRef.current = scanner;
              const match = productsQuery.data.find((val) => val.id === text);
              if (match !== undefined) {
                scanner.pause(true);
                setIsScannerPaused(true);
                setScannerRead(match);
              }
            }}
          />

          {isScannerPaused === true ? (
            <button
              className="h-fit w-fit rounded-2xl bg-gray-600 p-2"
              onClick={() => {
                if (scannerRef.current === undefined) return;
                if (
                  scannerRef.current.getState() ===
                  Html5QrcodeScannerState.PAUSED
                ) {
                  scannerRef.current.resume();
                }
                setScannerRead(undefined);
                setIsScannerPaused(false);
              }}
            >
              Scan another
            </button>
          ) : null}

          {scannerRead !== undefined ? (
            <KeypadDisplay
              {...scannerRead}
              width="w-3/4"
              onClick={() => {
                props.setOnCrate((prev) => {
                  // check if the item already exist in the crate it exist increase the qunatity
                  let newItem: CrateItem;
                  const temp = prev.find((val) => val.id === scannerRead.id);
                  if (temp !== undefined) {
                    newItem = temp;
                    newItem.quantity++;
                  } else {
                    newItem = {
                      id: scannerRead.id,
                      name: scannerRead.name,
                      quantity: 1,
                      stock: scannerRead.stock,
                      sellPrice: scannerRead.sellPrice,
                    };
                  }
                  return [
                    ...prev.filter((val) => val.id !== scannerRead.id),
                    newItem,
                  ];
                });
              }}
            />
          ) : null}
        </div>
      }
    />
  );
};
export default QrModal;

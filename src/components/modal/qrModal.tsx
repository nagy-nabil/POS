import React, { useRef, useState } from "react";
import { type CrateItem } from "@/components/modal/crateModal";
import { api } from "@/utils/api";
import { type Product } from "@prisma/client";
import { Html5QrcodeScannerState, type Html5QrcodeScanner } from "html5-qrcode";
import { useTranslation } from "react-i18next";
import { BsQrCodeScan } from "react-icons/bs";

import CustomModal from ".";
import { KeypadDisplay } from "../productDisplay";
import QrCode from "../qrcode";

export type QrModalProps = {
  setOnCrate: React.Dispatch<React.SetStateAction<CrateItem[]>>;
};

const QrModal: React.FC<QrModalProps> = (props) => {
  const { t } = useTranslation();
  const dialgoRef = useRef(null);
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
    staleTime: Infinity,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
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
      header="Read Product By QR"
      dialogRef={dialgoRef}
      buttonAttrs={{ className: "" }}
      dialogAttrs={{}}
      formAttrs={{}}
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
              {t("qrModal.utils.scan")}
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

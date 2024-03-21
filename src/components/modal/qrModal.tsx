import React, { useCallback, useRef } from "react";
import { useCartProductInc } from "@/hooks/useCart";
import { api } from "@/utils/api";
import { type Html5QrcodeResult, type Html5QrcodeScanner } from "html5-qrcode";
// import { useTranslation } from "react-i18next";
import { BsQrCodeScan } from "react-icons/bs";

import CustomModal from ".";
import QrCode from "../qrcode";

export default function QrModal() {
  // const { t } = useTranslation();
  const dialgoRef = useRef(null);
  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: Infinity,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return true;
    },
  });

  const { mutate } = useCartProductInc();

  const qrcodeSuccessCallback = useCallback(
    (text: string, _: Html5QrcodeResult, __: Html5QrcodeScanner) => {
      if (!productsQuery.data) return;
      const match = productsQuery.data.find((val) => val.id === text);
      if (match !== undefined) {
        mutate({
          id: match.id,
        });
      }
    },
    [productsQuery.data, mutate],
  );

  if (productsQuery.isLoading) return <p>loading ...</p>;
  else if (productsQuery.isError) {
    return <p>{JSON.stringify(productsQuery.error)}</p>;
  }

  return (
    <CustomModal
      header="Read Product By QR"
      dialogRef={dialgoRef}
      buttonAttrs={{
        className: "text-white bg-black dark:bg-muted rounded-full",
        size: "icon",
      }}
      dialogAttrs={{}}
      formAttrs={{}}
      buttonChildren={<BsQrCodeScan size={20} />}
      modalChildren={
        <div className="flex flex-col items-center gap-4">
          <QrCode
            qrId="orderQr"
            fps={30}
            qrcodeSuccessCallback={qrcodeSuccessCallback}
          />
        </div>
      }
    />
  );
}

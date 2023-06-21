import type { GetStaticPropsContext, NextPage } from "next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import CrateModal, { type CrateProps } from "@/components/modal/crateModal";
// import { prisma } from "@/server/db";
import QrCode from "@/components/qrcode";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useAuth } from "@/hooks/useAuth";
import { RiSearch2Line } from "react-icons/ri";
import { BsQrCodeScan } from "react-icons/bs";
import InputWithIcon from "@/components/form/inputWithIcon";
import CategoryDisplay from "@/components/categoryDisplay";
import ProductDisplay from "@/components/productDisplay";
import ProductModal from "@/components/modal/productModal";
import QrModal from "@/components/modal/qrModal";

//! re-enable server-side rendereing after you discover how to work with it and reactQuery together
// export async function getServerSideProps() {
//   const products = await prisma.product.findMany();
//   return {
//     props: {
//       products,
//     },
//   };
// }

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  console.log("🪵 [index.tsx:29] ~ token ~ \x1b[0;32mlocale\x1b[0m = ", locale);
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"])),
      // Will be passed to the page component as props
    },
  };
}

const Home: NextPage = () => {
  const { token } = useAuth({ noExistRedirectTo: "/signin" });
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [onCrate, setOnCrate] = useState<CrateProps["onCrate"]>([]);

  if (!token) return <p>loading token...</p>;

  return (
    <>
      <div className="flex h-screen w-full flex-col overflow-x-hidden">
        <header className="flex justify-end gap-2">
          <InputWithIcon
            Icon={RiSearch2Line}
            inputName="searchProduct"
            placeHolder="Search"
          />
          <ProductModal operationType="post" defaultValues={{}} />
        </header>
        <main>
          <CategoryDisplay setCategoryFilter={setCategoryFilter} />
          <ProductDisplay
            setOnCrate={setOnCrate}
            categoryFilter={categoryFilter}
            displayType="library"
          />
        </main>

        <footer className="fixed bottom-4 left-4 flex w-11/12 items-center justify-between">
          <CrateModal onCrate={onCrate} setOnCrate={setOnCrate} />
          <QrModal setOnCrate={setOnCrate} key="qrModal" />
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default Home;

import { useState, type ReactElement } from "react";
import type { GetStaticPropsContext } from "next";
import Head from "next/head";
// import { RiSearch2Line } from "react-icons/ri";
// import InputWithIcon from "@/components/form/inputWithIcon";
import CategoryDisplay from "@/components/categoryDisplay";
import DebouncedInput from "@/components/form/debouncedInput";
import Layout from "@/components/layout";
import CrateModal, { type CrateProps } from "@/components/modal/crateModal";
import ProductModal from "@/components/modal/productModal";
import QrModal from "@/components/modal/qrModal";
import ProductDisplay from "@/components/productDisplay";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import type { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"], null, [
        "en",
        "ar",
      ])),
      // Will be passed to the page component as props
    },
  };
}

const Home: NextPageWithLayout = (_props) => {
  const session = useSession();
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [onCrate, setOnCrate] = useState<CrateProps["onCrate"]>([]);
  const [productFilter, setProductFilter] = useState("");

  // if (!token) return <p>loading token...</p>;

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="flex h-screen w-full flex-col overflow-x-hidden">
        <header className="ml-auto flex w-4/5 items-center justify-end gap-2">
          {/* <InputWithIcon
            Icon={RiSearch2Line}
            inputName="searchProduct"
            placeHolder={t("header.inputPlaceHolder")}
          /> */}
          <DebouncedInput
            type="search"
            value={""}
            onChange={(value) => setProductFilter(value as string)}
            placeholder={t("header.inputPlaceHolder")}
            className="mt-1 w-full rounded-xl border-2 border-gray-300 p-2"
          />
          <ProductModal operationType="post" defaultValues={{}} />
        </header>
        <main>
          <CategoryDisplay setCategoryFilter={setCategoryFilter} />
          <ProductDisplay
            setOnCrate={setOnCrate}
            categoryFilter={categoryFilter}
            productFilter={productFilter}
            displayType="keypad"
          />
        </main>

        <footer className="fixed bottom-4 left-4 flex w-11/12 items-center justify-between gap-2">
          <CrateModal onCrate={onCrate} setOnCrate={setOnCrate} />
          <QrModal setOnCrate={setOnCrate} key="qrModal" />
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};
export default Home;

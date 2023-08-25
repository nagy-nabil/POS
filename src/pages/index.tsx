import { useTranslation } from "next-i18next";
import { useState } from "react";
import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import CategoryDisplay from "@/components/categoryDisplay";
import { CartModal } from "@/components/modal/cartModal";
import QrModal from "@/components/modal/qrModal";
import ProductDisplay from "@/components/productDisplay";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import type {  NextPageWithProps } from "./_app";
import DebouncedInput from "@/components/form/debouncedInput";
import { ModeToggle, Nav } from "@/components/layout";

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

const Home: NextPageWithProps = (_props) => {
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState("");
  /**
   * should be filter based on the product name or id
   *
   * empty string "" means no filter
   */
  const [productFilter, setProductFilter] = useState("");

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="flex h-screen w-screen flex-col overflow-x-hidden overflow-y-auto scroll-smooth gap-3">
        <header className="flex justify-between h-fit  gap-2 w-full mt-3 px-1"> 
        <Nav />
          <DebouncedInput
            type="search"
            value={""}
            onChange={(value) => setProductFilter(value.toString())}
            placeholder={t("header.inputPlaceHolder")}
            className="shrink"
          />
        <ModeToggle />
        </header>
        <main className="h-full w-full">
          <CategoryDisplay setCategoryFilter={setCategoryFilter} />
          <ProductDisplay
            categoryFilter={categoryFilter}
            displayType="keypad"
            productFilter={productFilter}
          />
        </main>

        <footer className="fixed bottom-4 left-4 flex w-11/12 items-center justify-between gap-2">
          <CartModal />
          <QrModal key="qrModal" />
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Home.pageConfig = {
  authed: true,
};

export default Home;

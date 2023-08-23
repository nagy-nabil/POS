import { useState } from "react";
import type { GetStaticPropsContext } from "next";
import Head from "next/head";
// import { RiSearch2Line } from "react-icons/ri";
// import InputWithIcon from "@/components/form/inputWithIcon";
import CategoryDisplay from "@/components/categoryDisplay";
import { CartModal } from "@/components/modal/cartModal";
import QrModal from "@/components/modal/qrModal";
import ProductDisplay from "@/components/productDisplay";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import type { NextPageWithProps } from "./_app";

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
  const [categoryFilter, setCategoryFilter] = useState("");

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="flex h-screen w-full flex-col overflow-x-hidden">
        <main className="h-full w-full">
          <CategoryDisplay setCategoryFilter={setCategoryFilter} />
          <ProductDisplay
            categoryFilter={categoryFilter}
            displayType="keypad"
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
  defaultLayout: true,
};

export default Home;

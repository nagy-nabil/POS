import type { GetStaticPropsContext } from "next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactElement, useState } from "react";
import CrateModal, { type CrateProps } from "@/components/modal/crateModal";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useAuth } from "@/hooks/useAuth";
import { RiSearch2Line } from "react-icons/ri";
import InputWithIcon from "@/components/form/inputWithIcon";
import CategoryDisplay from "@/components/categoryDisplay";
import ProductDisplay from "@/components/productDisplay";
import ProductModal from "@/components/modal/productModal";
import QrModal from "@/components/modal/qrModal";
import type { NextPageWithLayout } from "./_app";
import Layout from "@/components/layout";
import Head from "next/head";

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
  const { token } = useAuth({ noExistRedirectTo: "/signin" });
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [onCrate, setOnCrate] = useState<CrateProps["onCrate"]>([]);

  if (!token) return <p>loading token...</p>;

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="flex h-screen w-full flex-col overflow-x-hidden">
        <header className="ml-auto flex w-4/5 items-center justify-end gap-2">
          <InputWithIcon
            Icon={RiSearch2Line}
            inputName="searchProduct"
            placeHolder={t("header.inputPlaceHolder")}
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

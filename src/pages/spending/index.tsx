import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { type NextPageWithLayout } from "../_app";
import { type ReactElement } from "react";
import Layout from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import {
  ExpenseModal,
  ExpenseTypeModal,
  ExpensesStoreModal,
} from "@/components/modal/expensesModal";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  console.log(
    "🪵 [spending.tsx:15] ~ token ~ \x1b[0;32mlocale\x1b[0m = ",
    locale
  );
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

const Spending: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const {} = useAuth({ noExistRedirectTo: "/signin" });

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="w-screen">
        <header className="mt-2 flex items-center justify-around">
          <h1 className="text-4xl">{t("pages.spending.header")}</h1>
        </header>
        <ExpenseTypeModal
          defaultValues={{}}
          operationType="post"
          key={"expessetse"}
        />
        <ExpensesStoreModal
          defaultValues={{}}
          operationType="post"
          key={"expessefds"}
        />
        <ExpenseModal
          defaultValues={{}}
          operationType="post"
          key={"expsfdjs"}
        />
        {/* TODO ADD SPENDING CONTENT*/}
        {/* {productsQuery.data && <Table data={productsQuery.data} />} */}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Spending.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

export default Spending;

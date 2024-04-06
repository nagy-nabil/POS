import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { CartView } from "@/components/cart";
import CategoryDisplay from "@/components/categoryDisplay";
import DebouncedInput from "@/components/form/debouncedInput";
import { DesktopNav, MobileNav } from "@/components/layout";
import { CartModal } from "@/components/modal/cartModal";
import QrModal from "@/components/modal/qrModal";
import { ModeToggle } from "@/components/modeToggle";
import ProductDisplay from "@/components/productDisplay";
import { type TypedQueryParams } from "@/types/query";
import { useTranslation } from "next-i18next";
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
  const router = useRouter();
  const query = router.query as TypedQueryParams;
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>

      <div className="flex h-screen max-h-screen min-h-screen overflow-hidden w-full flex-col scroll-smooth ">
        <DesktopNav />
        <div className="flex flex-col gap-4 sm:py-4 sm:pl-14 overflow-hidden">
          <header className="sticky top-0 z-30 flex justify-between h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <DebouncedInput
              type="search"
              value={(router.query.productFilter as string | undefined) ?? ""}
              onChange={(value) => {
                const v = value.toString();
                void router.push(
                  {
                    query: {
                      ...query,
                      productFilter: v,
                    } satisfies TypedQueryParams,
                  },
                  undefined,
                  { shallow: true },
                );
              }}
              placeholder={t("header.inputPlaceHolder")}
              className="shrink"
            />
            <ModeToggle />
          </header>

          <div className="flex flex-col lg:flex-row  overflow-hidden">
            <main className="flex flex-col h-5/6 lg:h-full w-full lg:w-2/3 overflow-hidden">
              <div className="flex-initial">
                <CategoryDisplay />
              </div>
              <div className="flex-auto h-[80%]">
                <ProductDisplay displayType="keypad" />
              </div>
            </main>
            <aside className="hidden lg:flex w-2/6 h-full">
              <CartView />
            </aside>

            <footer className="flex w-11/12 items-center justify-between m-auto  gap-2 lg:hidden">
              <CartModal />
              <QrModal key="qrModal" />
            </footer>
          </div>
        </div>
      </div>
    </>
  );
};

Home.pageConfig = {
  authed: true,
};

export default Home;

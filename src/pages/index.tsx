import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import CategoryDisplay from "@/components/categoryDisplay";
import DebouncedInput from "@/components/form/debouncedInput";
import { MobileNav } from "@/components/layout";
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
      <div className="flex h-screen w-screen flex-col overflowhidden scroll-smooth gap-3">
        <header className="flex justify-between h-fit  gap-2 w-full mt-3 px-1">
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
        <main className="flex flex-col gap-4 h-5/6 w-full overflow-hidden">
          <div className="flex-initial">
            <CategoryDisplay />
          </div>
          <div className="flex-auto h-[80%]">
            <ProductDisplay displayType="keypad" />
          </div>
        </main>

        <footer className="flex w-11/12 items-center justify-between m-auto  gap-2">
          <CartModal />
          <QrModal key="qrModal" />
        </footer>
      </div>
    </>
  );
};

Home.pageConfig = {
  authed: true,
};

export default Home;

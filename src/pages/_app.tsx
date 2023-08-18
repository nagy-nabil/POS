import { useEffect, type ReactElement } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { appWithTranslation } from "next-i18next";

import "@/styles/globals.css";

import Head from "next/head";
import Layout from "@/components/layout";

export type NextPageWithProps<P = object, IP = P> = NextPage<P, IP> & {
  /**
   * define all custom config page can define
   */
  pageConfig: {
    layout?: (page: ReactElement) => ReactElement;
    /**
     * is the page public or protected
     */
    authed?: boolean;
    /**
     * do you want this page to use the default layout, getLayout has higher prcedence
     */
    defaultLayout?: boolean;
  };
};

type CustomAppProps = AppProps<{ session: Session | null }> & {
  Component: NextPageWithProps;
};

const defaultLayout: NextPageWithProps["pageConfig"]["layout"] = (page) => {
  return <Layout>{page}</Layout>;
};

type AutedProps = {
  children: ReactElement;
};

function Authed({ children }: AutedProps) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin").catch((e) => {
        console.log("🪵 [_app.tsx:44] ~ token ~ \x1b[0;32me\x1b[0m = ", e);
      });
    },
  });

  if (status === "loading") {
    // show load/unauth view
    return <>loading..</>;
  }

  return children;
}

const MyApp = ({ Component, pageProps }: CustomAppProps) => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("scope is: ", registration.scope))
        .catch((err) => {
          console.log(
            "🪵 [_app.tsx:21] ~ token ~ \x1b[0;32merr\x1b[0m = ",
            err
          );
        });
    }
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout: NextPageWithProps["pageConfig"]["layout"] = Component
    .pageConfig.layout
    ? Component.pageConfig.layout
    : Component.pageConfig.defaultLayout
    ? defaultLayout
    : (page) => page;

  return (
    <>
      <Head>
        <title>Zagy | POS</title>
      </Head>
      <SessionProvider session={pageProps.session}>
        {Component.pageConfig.authed ? (
          <Authed>{getLayout(<Component {...pageProps} />)}</Authed>
        ) : (
          getLayout(<Component {...pageProps} />)
        )}
        {}
        {/* {ConstructPage(appProps)} */}
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(appWithTranslation(MyApp));

import { useEffect, type ReactElement } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { api } from "@/utils/api";
import { appWithTranslation } from "next-i18next";
import "@/styles/globals.css";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactElement;
};
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
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
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(<Component {...pageProps} />);
};

export default api.withTRPC(appWithTranslation(MyApp));

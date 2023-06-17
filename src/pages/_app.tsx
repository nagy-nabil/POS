import { type AppType } from "next/app";
import { api } from "@/utils/api";
import { appWithTranslation } from "next-i18next";
import "@/styles/globals.css";
import Layout from "@/components/layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default api.withTRPC(appWithTranslation(MyApp));

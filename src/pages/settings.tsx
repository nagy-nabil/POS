import LanguageSwitcher from "@/components/langSelector";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { GetServerSidePropsContext, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"])),
      // Will be passed to the page component as props
    },
  };
}

const Anal: NextPage = () => {
  return (
    <div className="flex h-screen w-full flex-col content-between justify-items-center p-12 align-middle dark:bg-gray-800 dark:text-slate-300">
      <LanguageSwitcher
        onChange={(locale) => {
          document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`;
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
};

export default Anal;

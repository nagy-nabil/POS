import { createIDBPersister } from '@/utils/IDBPersister';
import { useQueryClient } from '@tanstack/react-query'
import {
  persistQueryClient,
} from '@tanstack/react-query-persist-client'
import { useEffect, type ReactElement } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/utils/api";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { appWithTranslation } from "next-i18next";

import "@/styles/globals.css";

import Head from "next/head";
import Layout from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { Loader } from "lucide-react";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export type LayoutT = (page: ReactElement) => ReactElement;

export type NextPageWithProps<P = object, IP = P> = NextPage<P, IP> & {
  /**
   * define all custom config page can define
   */
  pageConfig?: {
    layout?: LayoutT;
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

const defaultLayout: LayoutT = (page) => {
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
    return (
      <div className="flex items-center justify-center animate-spin h-screen w-screen">
        <Loader size={40} />
      </div>
    );
  }

  return children;
}

async function detectSWUpdate(onUpdate: () => void) {
  const registration = await navigator.serviceWorker.ready;

  registration.addEventListener("updatefound", () => {
    const newSW = registration.installing;
    if (newSW == null) return;
    newSW.addEventListener("statechange", () => {
      if (newSW.state == "installed") {
        // New service worker is installed, but waiting activation
        onUpdate();
      }
    });
  });
}

async function installSW(onUpdate: () => void) {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("scope is: ", registration.scope);

      await detectSWUpdate(onUpdate);
    } catch (err) {
      console.log("🪵 [_app.tsx:93] ~ token ~ \x1b[0;32merr\x1b[0m = ", err);
    }
  } else {
    console.error("Service worker is not supported in this browser");
  }
}

const usePersistQueryClient = () => {
  const queryClient = useQueryClient()
  useEffect(() => {
    const persister = createIDBPersister();
    void persistQueryClient({
      queryClient,
      persister,
      maxAge: 60 * 60 * 24,
    });
  }, [])
}

const MyApp = ({ Component, pageProps }: CustomAppProps) => {
  usePersistQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    void installSW(() => {
      toast({
        title: "New version available",
        description: "Please refresh the page to update.",
        duration: 9000,
        action: (
          <ToastAction onClick={() => router.reload()} altText="Refresh">
            Refresh
          </ToastAction>
        ),
      });
    });
  }, [toast, router]);

  // Use the layout defined at the page level, if available
  const getLayout: LayoutT =
    Component.pageConfig && Component.pageConfig.layout
      ? Component.pageConfig.layout
      : Component.pageConfig && Component.pageConfig.defaultLayout
        ? defaultLayout
        : (page) => page;

  return (
    <>
      <Head>
        <title>Zagy | POS</title>
      </Head>
      <SessionProvider session={pageProps.session}>
        <TooltipProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {Component.pageConfig && Component.pageConfig.authed ? (
              <Authed>{getLayout(<Component {...pageProps} />)}</Authed>
            ) : (
              getLayout(<Component {...pageProps} />)
            )}
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </SessionProvider>
      <ReactQueryDevtools />
    </>
  );
};



export default api.withTRPC(appWithTranslation(MyApp));

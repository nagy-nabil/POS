import { useEffect, useState } from "react";
import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import LanguageSwitcher from "@/components/langSelector";
import { ModeToggle } from "@/components/modeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { signIn, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm, type SubmitHandler } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { type z } from "zod";

import { type NextPageWithProps } from "./_app";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["sign"])),
      // Will be passed to the page component as props
    },
  };
}

type LoginT = z.infer<typeof loginSchema>;
// const loginKeys = loginSchema.keyof().options;

const SignIn: NextPageWithProps = () => {
  const router = useRouter();
  const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
  const { status } = useSession({
    required: false,
  });
  const [errors, setErrors] = useState("");
  const { t } = useTranslation("sign");

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<LoginT>({ resolver: zodResolver(loginSchema) });

  const onSubmit: SubmitHandler<LoginT> = async (data) => {
    const signin = await signIn("credentials", {
      redirect: false,
      userName: data.userName,
      password: data.password,
    });
    if (signin?.ok === false) {
      setErrors(t("error"));
      return;
    }
    // if (signin?.ok === true) {
    //   await router.push("/");
    // }
  };

  useEffect(() => {
    async function redirectOnSession() {
      if (status === "authenticated") {
        await router.push("/");
      }
    }
    redirectOnSession().catch((e) => {
      console.log("🪵 [signin.tsx:70] ~ token ~ \x1b[0;32me\x1b[0m = ", e);
    });
  }, [router, status]);

  if (status === "authenticated") return null;

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
        <title>Zagy | signin</title>
      </Head>
      <div className="h-screen w-screen flex flex-col">
        <header className="w-full flex justify-between p-3">
          <ModeToggle />
          <div className="w-fit">
            <LanguageSwitcher
              onChange={(locale) => {
                document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`;
              }}
            />
          </div>
        </header>
        <div className="flex h-full w-full flex-col items-center justify-center">
          <h1 className="m-3 text-center text-6xl font-bold">
            Zagy {isPreview ? "Demo" : ""}
          </h1>
          <p className="mb-5 text-muted-foreground">
            Do your business <b>Right</b>
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 items-center w-full"
          >
            <label className="text-lg w-11/12">
              <Input
                placeholder={t("userName")}
                type="text"
                className="text-lg"
                {...register("userName")}
              />
              {formErrors["userName"] && (
                <span className="my-2 text-red-700">
                  {formErrors["userName"].message}
                </span>
              )}
            </label>

            <label className="text-lg w-11/12">
              <Input
                placeholder={t("password")}
                type="password"
                className="text-lg"
                {...register("password")}
              />
              {formErrors["password"] && (
                <span className="my-2 text-red-700">
                  {formErrors["password"].message}
                </span>
              )}
            </label>
            <Button disabled={isSubmitting} type="submit" value={"Sign In"}>
              {isSubmitting ? (
                <CgSpinner className="animate-spin text-2xl" />
              ) : (
                t("action")
              )}
            </Button>
            <p className="text-red-500">{errors}</p>
          </form>
          <p className="text-muted-foreground text-center">
            Not yet publicly available{" "}
            <b>
              Check the demo and Request access from here:
              <a className="text-blue-300 underline" href="https://zagy.tech">
                {" "}
                zagy.tech
              </a>
            </b>
          </p>
          <ReactQueryDevtools initialIsOpen={false} />
          <p className="text-muted-foreground text-center">V 0.1.23</p>
          {isPreview ? (
            <>
              <p className="text-muted-foreground text-center">
                username: admin
              </p>
              <p className="text-muted-foreground text-center">
                password: admin
              </p>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

SignIn.pageConfig = {};

export default SignIn;

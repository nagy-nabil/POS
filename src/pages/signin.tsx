import { useEffect, useState } from "react";
import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ModeToggle } from "@/components/modeToggle";
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
        <header className="w-full flex justify-end p-3">
          <ModeToggle />
        </header>
        <div className="flex h-full w-full flex-col items-center justify-center">
          <h1 className="m-3 text-center text-6xl font-bold">Zagy</h1>
          <p className="mb-5 text-gray-500">
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
            <button
              disabled={isSubmitting}
              type="submit"
              className="m-4 mx-auto w-fit rounded-2xl bg-black p-3 text-lg text-cyan-50"
              value={"Sign In"}
            >
              {isSubmitting ? (
                <CgSpinner className="animate-spin text-2xl" />
              ) : (
                t("action")
              )}
            </button>
            <p className="text-red-500">{errors}</p>
          </form>
          <p className="text-gray-500 text-center">
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
          <p className="text-gray-500 text-center">V 0.1.18</p>
        </div>
      </div>
    </>
  );
};

SignIn.pageConfig = {};

export default SignIn;

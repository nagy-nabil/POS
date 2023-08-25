import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import LanguageSwitcher from "@/components/langSelector";
import { loginSchema } from "@/types/entities";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CgSpinner } from "react-icons/cg";
import { z } from "zod";

import { type NextPageWithProps } from "./_app";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, [
        "common",
        "settings",
      ])),
      // Will be passed to the page component as props
    },
  };
}

const passwordForm = loginSchema
  .pick({ password: true })
  .extend({ rePassword: z.string() })
  .refine(
    (obj) => {
      console.log(obj.password, obj.rePassword);
      // return false to get failure
      return obj.password === obj.rePassword;
    },
    {
      message: "passwords don't match",
      path: ["confirm"],
    }
  );
type PasswordFormT = z.infer<typeof passwordForm>;

const SettingsPage: NextPageWithProps = () => {
  const { t } = useTranslation("settings");
  const userNameUpdate = api.users.updateUserName.useMutation();
  const passwordUpdate = api.users.updatePassword.useMutation();

  // form hook
  const {
    register: userNameReg,
    handleSubmit: userNameOnSubmit,
    formState: { errors: userNameErrors },
    setError: setUserNameError,
  } = useForm<{ userName: string }>({
    resolver: zodResolver(loginSchema.pick({ userName: true })),
  });
  // form hook
  const {
    register: passwordReg,
    handleSubmit: passwordOnSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormT>({
    resolver: zodResolver(passwordForm),
  });

  const userNameSubmit: SubmitHandler<{ userName: string }> = (data) => {
    userNameUpdate.mutate(data, {
      onError(error) {
        setUserNameError("userName", error);
      },
    });
  };
  const passwordSubmit: SubmitHandler<PasswordFormT> = (data) => {
    passwordUpdate.mutate(data);
  };

  return (
    <>
      <div className="flex h-full w-full flex-col content-between justify-items-center px-12 align-middle">
        <h2 className="mb-3 text-3xl font-bold">{t("appSettings.header")}</h2>
        <label className="flex flex-col gap-3">
          {t("appSettings.settings.changeLang.header")}
          <LanguageSwitcher
            onChange={(locale) => {
              document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`;
            }}
          />
        </label>

        <label className="mt-3 flex flex-col gap-3">
          {t("appSettings.settings.printPolicey.header")}
          <select
            className="rounded-xl border-2 border-gray-400 p-2 text-black"
            defaultValue="on"
          >
            <option value="on">
              {t("appSettings.settings.printPolicey.options.always")}
            </option>
            <option value="off">
              {t("appSettings.settings.printPolicey.options.off")}
            </option>
          </select>
        </label>

        <hr className="mt-4" />
        <h2 className="mb-2  text-3xl font-bold">{t("userSettings.header")}</h2>
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={userNameOnSubmit(userNameSubmit)}
        >
          <label className="flex flex-col gap-3">
            {t("userSettings.settings.changeUserName.header")}
            <input
              {...userNameReg("userName")}
              type="text"
              className="rounded-xl border-2 border-gray-400 p-2 text-lg"
              placeholder={t(
                "userSettings.settings.changeUserName.placeHolder"
              )}
            />
            {userNameErrors["userName"] && (
              <span className="m-2 text-red-700">
                {userNameErrors["userName"].message}
              </span>
            )}
          </label>
          <button
            type="submit"
            className=" h-fit w-fit rounded-xl bg-green-500 p-2 text-white"
          >
            {userNameUpdate.isLoading ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : (
              t("userSettings.settings.changeUserName.action")
            )}
          </button>
        </form>

        <hr className="mt-3" />

        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={passwordOnSubmit(passwordSubmit)}
        >
          <label className="flex flex-col gap-3">
            {t("userSettings.settings.changePassword.header")}
            <input
              {...passwordReg("password")}
              type="password"
              placeholder={t(
                "userSettings.settings.changePassword.placeHolder1"
              )}
              autoCapitalize="off"
              className="rounded-xl border-2 border-gray-400 p-2 text-lg"
            />
            {passwordErrors["password"] && (
              <span className="m-2 text-red-700">
                {passwordErrors["password"].message}
              </span>
            )}
            <input
              {...passwordReg("rePassword")}
              type="password"
              placeholder={t(
                "userSettings.settings.changePassword.placeHolder2"
              )}
              className="rounded-xl border-2 border-gray-400 p-2 text-lg"
            />
            {passwordErrors["rePassword"] && (
              <span className="m-2 text-red-700">
                {passwordErrors["rePassword"].message}
              </span>
            )}
            {/* @ts-ignore */}
            {passwordErrors["confirm"] && (
              <span className="m-2 text-red-700">
                {/* @ts-ignore  */}
                {passwordErrors["confirm"].message} {/* eslint-disable-line*/}
              </span>
            )}
          </label>
          <button
            type="submit"
            className="h-fit  w-fit rounded-xl bg-green-500 p-2 text-white"
          >
            {passwordUpdate.isLoading ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : (
              t("userSettings.settings.changePassword.action")
            )}
          </button>
        </form>

        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </>
  );
};

SettingsPage.pageConfig = {
  authed: true,
  defaultLayout: true,
};

export default SettingsPage;

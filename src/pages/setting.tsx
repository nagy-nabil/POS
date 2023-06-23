import LanguageSwitcher from "@/components/langSelector";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { type NextPageWithLayout } from "./_app";
import { type ReactElement } from "react";
import Layout from "@/components/layout";
import { type SubmitHandler, useForm } from "react-hook-form";
import { loginSchema } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import { z } from "zod";
import { CgSpinner } from "react-icons/cg";

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

const Settings: NextPageWithLayout = () => {
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
    <div className="flex h-screen w-full flex-col content-between justify-items-center p-12 align-middle ">
      <h2 className="mb-3 text-3xl font-bold">App Settings</h2>
      <label className="flex flex-col gap-3">
        Change Language
        <LanguageSwitcher
          onChange={(locale) => {
            document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`;
          }}
        />
      </label>

      <label className="mt-3 flex flex-col gap-3">
        Print Policey
        <select
          className="rounded-xl border-2 border-gray-400 p-2 text-black"
          defaultValue="on"
        >
          <option value="on">Always Ask</option>
          <option value="off">Off</option>
        </select>
      </label>

      <hr className="mt-4" />
      <h2 className="mb-2  text-3xl font-bold">User Settings</h2>
      <form
        className="mt-3 flex flex-col gap-3"
        onSubmit={userNameOnSubmit(userNameSubmit)}
      >
        <label className="flex flex-col gap-3">
          Change User Name
          <input
            {...userNameReg("userName")}
            type="text"
            className="rounded-xl border-2 border-gray-400 p-2 text-lg"
            placeholder="User Name"
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
            "Save Changes"
          )}
        </button>
      </form>

      <hr className="mt-3" />

      <form
        className="mt-3 flex flex-col gap-3"
        onSubmit={passwordOnSubmit(passwordSubmit)}
      >
        <label className="flex flex-col gap-3">
          Change password
          <input
            {...passwordReg("password")}
            type="password"
            placeholder="Password"
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
            placeholder="Re-enter the password"
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
            "Save Changes"
          )}
        </button>
      </form>

      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

export default Settings;

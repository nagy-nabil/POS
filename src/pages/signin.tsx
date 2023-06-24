import { type SubmitHandler, useForm } from "react-hook-form";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { GetStaticPropsContext, NextPage } from "next";
import { api } from "@/utils/api";
import { useState } from "react";
import { loginSchema } from "@/types/entities";
import { useAuth } from "@/hooks/useAuth";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CgSpinner } from "react-icons/cg";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  console.log("🪵 [index.tsx:29] ~ token ~ \x1b[0;32mlocale\x1b[0m = ", locale);
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"])),
      // Will be passed to the page component as props
    },
  };
}

type LoginT = z.infer<typeof loginSchema>;
// const loginKeys = loginSchema.keyof().options;

const Anal: NextPage = () => {
  const { setToken } = useAuth({ redirectAfterSet: "/" });
  const [errors, setErrors] = useState("");
  const userMut = api.users.signIn.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginT>({ resolver: zodResolver(loginSchema) });
  const onSubmit: SubmitHandler<LoginT> = (data) => {
    userMut.mutate(data, {
      onError(error) {
        setErrors(error.message);
      },
      async onSuccess(token) {
        await setToken(token);
      },
    });
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-12">
      <h1 className="m-3 text-center text-6xl font-bold">Zagy</h1>
      <p className="mb-5 text-gray-500">
        Do your business <b>Right</b>
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <label className="text-lg">
          <input
            placeholder="User Name"
            type="text"
            className="block w-full rounded-2xl border-2 border-gray-300 p-2  text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
            {...register("userName")}
          />
          {formErrors["userName"] && (
            <span className="m-2 text-red-700">
              {formErrors["userName"].message}
            </span>
          )}
        </label>
        <label className="text-lg">
          <input
            placeholder="Password"
            type="password"
            className="block w-full rounded-2xl border-2 border-gray-300 p-2  text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
            {...register("password")}
          />
          {formErrors["password"] && (
            <span className="m-2 text-red-700">
              {formErrors["password"].message}
            </span>
          )}
        </label>
        <button
          disabled={userMut.isLoading}
          type="submit"
          className="m-4 mx-auto w-fit rounded-2xl bg-black p-3 text-lg text-cyan-50"
          value={"Sign In"}
        >
          {userMut.isLoading ? (
            <CgSpinner className="animate-spin text-2xl" />
          ) : (
            "Sign In"
          )}
        </button>
        <p className="text-red-500">{errors}</p>
      </form>
      <p className="text-gray-500">
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
    </div>
  );
};

export default Anal;

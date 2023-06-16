import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { useState } from "react";
import { loginSchema } from "@/types/entities";

const Anal: NextPage = () => {
  const router = useRouter();
  const [errors, setErrors] = useState("");
  const userMut = api.users.signIn.useMutation();
  return (
    <div className="flex h-screen w-full flex-col content-between justify-items-center p-12 align-middle dark:bg-gray-800 dark:text-slate-300">
      <h1 className="text-center text-4xl font-bold ">Zagy POS</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Read the form data
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          // Or you can work with it as a plain object:
          const formJson = Object.fromEntries(formData.entries());
          const parsed = loginSchema.safeParse(formJson);
          if (parsed.success) {
            userMut.mutate(parsed.data, {
              onError(error) {
                setErrors(error.message);
              },
              async onSuccess(token) {
                localStorage.setItem("token", token);
                await router.push("/");
              },
            });
          } else {
            setErrors(parsed.error.message);
          }
        }}
      >
        <label htmlFor="userName" className="text-lg">
          UserName
          <input
            name="userName"
            type="text"
            className="border bg-gray-100 p-2 text-lg text-opacity-80"
          />
        </label>

        <label htmlFor="password" className="text-lg">
          password
          <input
            name="password"
            type="password"
            className="border bg-gray-100 p-2 text-lg text-opacity-80"
          />
        </label>

        <button
          type="submit"
          className=" m-4 mx-auto w-2/5 bg-slate-500 p-2 text-lg text-cyan-50"
        >
          Sign In
        </button>
        <p className="text-red-500">{errors}</p>
      </form>
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
};

export default Anal;

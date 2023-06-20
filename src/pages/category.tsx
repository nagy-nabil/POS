import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NextPage } from "next";
import { api } from "@/utils/api";

const Anal: NextPage = () => {
  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default Anal;

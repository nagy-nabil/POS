import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NextPage } from "next";
import { api } from "@/utils/api";

const Category: NextPage = () => {
  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default Category;

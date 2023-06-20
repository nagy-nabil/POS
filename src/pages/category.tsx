import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NextPage } from "next";
import CategoryModal from "@/components/modal/categoryModal";

const Category: NextPage = () => {
  return (
    <>
      <CategoryModal defaultValues={{}} operationType="post" />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default Category;

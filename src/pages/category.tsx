import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import CategoryModal from "@/components/modal/categoryModal";
import { type ReactElement } from "react";
import Layout from "@/components/layout";
import { type NextPageWithLayout } from "./_app";

const Category: NextPageWithLayout = () => {
  return (
    <>
      <CategoryModal defaultValues={{}} operationType="post" />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Category.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

export default Category;

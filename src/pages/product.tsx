import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type NextPageWithLayout } from "./_app";
import Layout from "@/components/layout";
import { type ReactElement } from "react";

const Product: NextPageWithLayout = () => {
  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

Product.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Layout>{page}</Layout>
    </>
  );
};

export default Product;

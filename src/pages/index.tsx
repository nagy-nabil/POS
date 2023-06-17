import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useQueryClient } from "@tanstack/react-query";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ItemCard from "@/components/ItemCard";
import { useState } from "react";
import Modal from "@/components/modal";
import { type SubmitHandler, useForm } from "react-hook-form";
import Crate, { type CrateItem, type CrateProps } from "@/components/crate";
// import { prisma } from "@/server/db";
import { type Product, type Category } from "@prisma/client";
import { api } from "@/utils/api";
import { categorySchema, productSchema } from "@/types/entities";
import QrCode from "@/components/qrcode";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

//! re-enable server-side rendereing after you discover how to work with it and reactQuery together
// export async function getServerSideProps() {
//   const products = await prisma.product.findMany();
//   return {
//     props: {
//       products,
//     },
//   };
// }

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  console.log("🪵 [index.tsx:29] ~ token ~ \x1b[0;32mlocale\x1b[0m = ", locale);
  return {
    props: {
      // only pass array of required namespace to the page to make use of translitions code spliting
      ...(await serverSideTranslations(locale as string, ["common"])),
      // Will be passed to the page component as props
    },
  };
}

type ProductT = z.infer<typeof productSchema>;
type CategoryT = z.infer<typeof categorySchema>;

const productKeys = productSchema.keyof().options;
const categoryKeys = categorySchema.keyof().options;

const Home: NextPage = () => {
  const { t } = useTranslation();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryModalIsOpen, setCategoryModalIsOpen] = useState(false);
  const [onCrate, setOnCrate] = useState<CrateProps["items"]>([]);
  // react form hook
  const {
    register: categoryReg,
    handleSubmit: categoryHandleSubmit,
    formState: { errors: categoryErrors },
  } = useForm<CategoryT>({ resolver: zodResolver(categorySchema) });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductT>({ resolver: zodResolver(productSchema) });

  // react query/TRPC
  const queryClient = useQueryClient();
  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
  });
  const categoryQuery = api.categories.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
  });
  const productsMut = api.products.insertOne.useMutation();
  const categoryMut = api.categories.insertOne.useMutation();

  if (categoryQuery.isLoading) return <p>loading ...</p>;
  else if (categoryQuery.isError) {
    return <p>{JSON.stringify(categoryQuery.error)}</p>;
  }

  if (productsQuery.isLoading) return <p>loading ...</p>;
  else if (productsQuery.isError) {
    return <p>{JSON.stringify(productsQuery.error)}</p>;
  }

  // control modals
  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  function openCategoryModal() {
    setCategoryModalIsOpen(true);
  }

  function closeCategoryModal() {
    setCategoryModalIsOpen(false);
  }

  // submit handlers
  const categoryOnSubmit: SubmitHandler<CategoryT> = (data) => {
    categoryMut.mutate(data, {
      onSuccess: (data) => {
        queryClient.setQueryData(
          [["categories", "getMany"], { type: "query" }],
          (prev) => [...(prev as Category[]), data]
        );
        closeCategoryModal();
      },
    });
  };

  const onSubmit: SubmitHandler<ProductT> = (data) => {
    productsMut.mutate(data, {
      onSuccess: (data) => {
        queryClient.setQueryData(
          [["products", "getMany"], { type: "query" }],
          (prev) => [...(prev as Product[]), data]
        );
        closeModal();
      },
    });
  };

  return (
    <>
      <div className="flex h-screen w-full flex-col gap-y-8 overflow-hidden pl-14">
        <header className="flex justify-between">
          <h1 className="text-5xl">{t("header")}</h1>
          <button
            onClick={openModal}
            className="h-fit w-fit bg-green-400 p-3 text-3xl"
          >
            product
          </button>
          <button
            onClick={openCategoryModal}
            className="h-fit w-fit bg-green-400 p-3 text-3xl"
          >
            category
          </button>
        </header>

        {/* categories display */}
        <div className="flex h-fit w-full flex-wrap justify-start gap-2 ">
          <button
            key={0}
            className="h-fit w-fit rounded-full bg-slate-600 p-4"
            onClick={() => {
              setCategoryFilter("");
            }}
          >
            All
          </button>
          {categoryQuery.data.map((category) => {
            return (
              <button
                key={category.id}
                className="p-2"
                onClick={() => {
                  setCategoryFilter(category.id);
                }}
              >
                <img alt="cat" src={category.image} className="rounded-full" />
                <p>{category.name}</p>
              </button>
            );
          })}
        </div>

        {/* products display */}
        <div className="flex h-screen flex-wrap justify-start gap-3 overflow-auto">
          <div
            role="status"
            className="max-w-sm animate-pulse rounded border border-gray-200 p-4 shadow dark:border-gray-700 md:p-6"
          >
            <div className="mb-4 flex h-48 items-center justify-center rounded bg-gray-300 dark:bg-gray-700">
              <svg
                className="h-12 w-12 text-gray-200 dark:text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 640 512"
              >
                <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
              </svg>
            </div>
            <div className="mb-4 h-2.5 w-48 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <span className="sr-only">Loading...</span>
          </div>
          {productsQuery.data
            .filter((val) => {
              if (categoryFilter === "") return true;
              else return val.categoryId === categoryFilter;
            })
            .map((product) => {
              return (
                <ItemCard
                  key={product.id}
                  imageUrl={product.image}
                  name={product.name}
                  sellPrice={product.sellPrice}
                  quantity={product.stock}
                  onClick={() => {
                    setOnCrate((prev) => {
                      // check if the item already exist in the crate it exist increase the qunatity
                      let newItem: CrateItem;
                      const temp = prev.find((val) => val.id === product.id);
                      if (temp !== undefined) {
                        newItem = temp;
                        newItem.quantity++;
                      } else {
                        newItem = {
                          id: product.id,
                          name: product.name,
                          quantity: 1,
                          price: product.sellPrice,
                        };
                      }
                      return [
                        ...prev.filter((val) => val.id !== product.id),
                        newItem,
                      ];
                    });
                  }}
                />
              );
            })}
        </div>

        {/* add or update category modal */}
        <Modal
          isOpen={categoryModalIsOpen}
          onRequestClose={closeCategoryModal}
          contentLabel="Category Modal"
        >
          <button
            onClick={closeCategoryModal}
            className="h-fit w-fit bg-red-700 p-4"
          >
            close
          </button>
          <h1>Category</h1>
          {/* /* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          <form
            // eslint-disable-next-line
            onSubmit={categoryHandleSubmit(categoryOnSubmit, (err) => {
              console.log(
                "🪵 [index.tsx:138] ~ token ~ \x1b[0;32me\x1b[0m = ",
                err
              );
            })}
          >
            {categoryKeys.map((categoryKey, i) => {
              return (
                <label key={i} className="block">
                  {categoryKey}
                  <input
                    className="block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    {...categoryReg(categoryKey, { required: true })}
                  />
                  {/* errors will return when field validation fails  */}
                  {categoryErrors[categoryKey] && (
                    <span className="m-2 text-red-700">
                      {/* @ts-ignore */}
                      {errors[categoryKey].message}
                    </span>
                  )}
                </label>
              );
            })}

            <input
              disabled={categoryMut.isLoading}
              type="submit"
              className="m-3 h-fit w-fit cursor-pointer rounded-lg bg-green-700 p-3 text-white"
            />
          </form>
        </Modal>

        {/* add or update product modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Product Modal"
        >
          <button onClick={closeModal} className="h-fit w-fit bg-red-700 p-4">
            close
          </button>
          {/* /* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          <form
            // eslint-disable-next-line
            onSubmit={handleSubmit(onSubmit, (err) => {
              console.log(
                "🪵 [index.tsx:138] ~ token ~ \x1b[0;32me\x1b[0m = ",
                err
              );
            })}
          >
            {productKeys.map((productKey, i) => {
              return (
                <label key={i} className="block">
                  {productKey}
                  <input
                    className="block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    {...(productKey === "sellPrice" ||
                    productKey === "stock" ||
                    productKey === "buyPrice"
                      ? register(productKey, {
                          required: true,
                          valueAsNumber: true,
                        })
                      : register(productKey, { required: true }))}
                  />
                  {/* errors will return when field validation fails  */}
                  {errors[productKey] && (
                    <span className="m-2 text-red-700">
                      {/* @ts-ignore */}
                      {errors[productKey].message}
                    </span>
                  )}
                </label>
              );
            })}

            <input
              disabled={productsMut.isLoading}
              type="submit"
              className="m-3 h-fit w-fit cursor-pointer rounded-lg bg-green-700 p-3 text-white"
            />
          </form>
        </Modal>
        {onCrate.length > 0 ? (
          <Crate items={onCrate} setItems={setOnCrate} />
        ) : null}
      </div>
      <QrCode
        fps={20}
        qrcodeSuccessCallback={(decodedText, decodedResult) => {
          console.log(`Code matched = ${decodedText}`, decodedResult);
          alert(`Code matched = ${decodedText},`);
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default Home;

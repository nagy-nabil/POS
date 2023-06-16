import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NextPage } from "next";
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

//! re-enable server-side rendereing after you discover how to work with it and reactQuery together
// export async function getServerSideProps() {
//   const products = await prisma.product.findMany();
//   return {
//     props: {
//       products,
//     },
//   };
// }

type ProductT = z.infer<typeof productSchema>;
type CategoryT = z.infer<typeof categorySchema>;

const productKeys = productSchema.keyof().options;
const categoryKeys = categorySchema.keyof().options;

const Home: NextPage = () => {
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
          <h1 className="text-5xl">Sales Page</h1>
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
                  price={product.price}
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
                          price: product.price,
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
                    {...(productKey === "price" || productKey === "stock"
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
          alert(`Code matched = ${decodedText}`, decodedResult);
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default Home;

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type {
  NextPage,
  InferGetServerSidePropsType,
  GetServerSideProps,
} from "next";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ItemCard from "@/components/ItemCard";
import { useState } from "react";
import Modal from "@/components/modal";
import { type SubmitHandler, useForm } from "react-hook-form";
import Crate, { type CrateItem, type CrateProps } from "@/components/crate";
// import { prisma } from "@/server/db";
import { type Product } from "@prisma/client";
import { api } from "@/utils/api";
import { productSchema } from "@/types/entities";

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

const productKeys = productSchema.keyof().options;

const Home: NextPage = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [onCrate, setOnCrate] = useState<CrateProps["items"]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductT>({ resolver: zodResolver(productSchema) });
  const queryClient = useQueryClient();

  const productsQuery = api.products.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
  });
  const productsMut = api.products.insertOne.useMutation();
  if (productsQuery.isLoading) return <p>loading ...</p>;
  else if (productsQuery.isError) {
    return <p>{JSON.stringify(productsQuery.error)}</p>;
  }

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

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  return (
    <>
      <div className="flex h-screen w-full flex-col gap-y-8 overflow-hidden pl-14">
        <header className="flex justify-between">
          <h1 className="text-5xl">Sales Page</h1>
          <button
            onClick={openModal}
            className="h-fit w-fit bg-green-400 p-3 text-3xl"
          >
            +
          </button>
        </header>
        <div className="flex h-screen flex-wrap justify-start gap-3 overflow-auto">
          {productsQuery.data.map((product) => {
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

        {/* add or update product modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Example Modal"
        >
          <button onClick={closeModal}>close</button>
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

      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default Home;

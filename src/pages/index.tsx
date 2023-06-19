import type {
  GetServerSidePropsContext,
  GetStaticPropsContext,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQueryClient } from "@tanstack/react-query";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import CustomModal from "@/components/modal";
import { type SubmitHandler, useForm } from "react-hook-form";
import CrateModal, { type CrateProps } from "@/components/modal/crateModal";
// import { prisma } from "@/server/db";
import { type Product, type Category } from "@prisma/client";
import { api } from "@/utils/api";
import { categorySchema, productSchema } from "@/types/entities";
import QrCode from "@/components/qrcode";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useAuth } from "@/hooks/useAuth";
import { RiSearch2Line } from "react-icons/ri";
import { BsQrCodeScan } from "react-icons/bs";
import InputWithIcon from "@/components/form/inputWithIcon";
import CategoryDisplay from "@/components/categoryDisplay";
import ProductDisplay from "@/components/productDisplay";
import ProductModal from "@/components/modal/productModal";

//! re-enable server-side rendereing after you discover how to work with it and reactQuery together
// export async function getServerSideProps() {
//   const products = await prisma.product.findMany();
//   return {
//     props: {
//       products,
//     },
//   };
// }

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

type CategoryT = z.infer<typeof categorySchema>;

const categoryKeys = categorySchema.keyof().options;

const Home: NextPage = () => {
  const { token } = useAuth({ noExistRedirectTo: "/signin" });
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [onCrate, setOnCrate] = useState<CrateProps["onCrate"]>([]);

  // react form hook
  const {
    register: categoryReg,
    handleSubmit: categoryHandleSubmit,
    formState: { errors: categoryErrors },
  } = useForm<CategoryT>({ resolver: zodResolver(categorySchema) });

  // react query/TRPC
  const categoryMut = api.categories.insertOne.useMutation();
  const queryClient = useQueryClient();

  if (!token) return <p>loading token...</p>;

  // function openCategoryModal() {
  //   if (categoryDialog.current === null) return;
  //   categoryDialog.current.showModal();
  // }

  // function closeCategoryModal() {
  //   if (categoryDialog.current === null) return;
  //   categoryDialog.current.close();
  // }

  // submit handlers
  // const categoryOnSubmit: SubmitHandler<CategoryT> = (data) => {
  //   categoryMut.mutate(data, {
  //     onSuccess: (data) => {
  //       queryClient.setQueryData(
  //         [["categories", "getMany"], { type: "query" }],
  //         (prev) => [...(prev as Category[]), data]
  //       );
  //       closeCategoryModal();
  //     },
  //   });
  // };

  return (
    <>
      <div className="flex h-screen w-full flex-col overflow-x-hidden">
        <header className="flex justify-end gap-2">
          <InputWithIcon
            Icon={RiSearch2Line}
            inputName="searchProduct"
            placeHolder="Search"
          />
          <ProductModal operationType="post" />
          {/* TODO where to add category => move category mangment in different page*/}
          {/* <button
            onClick={openCategoryModal}
            className="h-fit w-fit bg-green-400 p-3 text-3xl"
          >
            category
          </button> */}
        </header>
        <main>
          <CategoryDisplay setCategoryFilter={setCategoryFilter} />
          <ProductDisplay
            setOnCrate={setOnCrate}
            categoryFilter={categoryFilter}
            displayType="keypad"
          />
        </main>

        <footer className="fixed bottom-4 left-4 flex w-11/12 justify-between align-middle">
          <CrateModal onCrate={onCrate} setOnCrate={setOnCrate} />
          {/* TODO */}
          <BsQrCodeScan className="h-fit w-fit rounded-full bg-black p-2 text-3xl text-white" />
        </footer>
      </div>
      {/* <QrCode
        fps={20}
        qrcodeSuccessCallback={(decodedText, decodedResult) => {
          console.log(`Code matched = ${decodedText}`, decodedResult);
          alert(`Code matched = ${decodedText},`);
        }}
      /> */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </>
  );
};

export default Home;

import type {
  NextPage,
  InferGetServerSidePropsType,
  GetServerSideProps,
} from "next";
import ItemCard from "@/components/ItemCard";
import { useState } from "react";
import Modal from "@/components/modal";
import { type SubmitHandler, useForm } from "react-hook-form";
import Crate, { CrateItem, type CrateProps } from "@/components/crate";

type ItemMeta = {
  id: number;
  imageUrl: string;
  name: string;
  price: number;
  quantity: number;
};

export const getServerSideProps: GetServerSideProps<{
  data: ItemMeta[];
  // eslint-disable-next-line
}> = async () => {
  const data: ItemMeta[] = [
    {
      id: 1,
      imageUrl: "https://via.placeholder.com/350x350",
      name: "fsfd",
      price: 32,
      quantity: 23,
    },
    {
      id: 2,
      imageUrl: "https://via.placeholder.com/350x350",
      name: "fsfd",
      price: 32,
      quantity: 23,
    },
    {
      id: 3,
      imageUrl: "https://via.placeholder.com/350x350",
      name: "fsfd",
      price: 32,
      quantity: 23,
    },
    {
      id: 4,
      imageUrl: "https://via.placeholder.com/350x350",
      name: "fsfd",
      price: 32,
      quantity: 23,
    },
    {
      id: 5,
      imageUrl: "https://via.placeholder.com/350x350",
      name: "mmmmmmmmmmm",
      price: 32,
      quantity: 23,
    },
    {
      id: 6,
      imageUrl: "https://via.placeholder.com/350x350",
      name: "eqwoqwrrrrr",
      price: 32,
      quantity: 23,
    },
    {
      id: 7,
      imageUrl: "https://via.placeholder.com/350x350",
      name: "seventh",
      price: 32,
      quantity: 23,
    },
    {
      id: 8,
      imageUrl: "https://via.placeholder.com/350x350",
      name: "8th",
      price: 32,
      quantity: 23,
    },
  ];

  return {
    props: {
      data,
    },
  };
};

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ data }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [onCrate, setOnCrate] = useState<CrateProps["items"]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemMeta>();
  const onSubmit: SubmitHandler<ItemMeta> = (data) => console.log(data);

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  return (
    <div className="flex h-screen w-full flex-col gap-y-8 overflow-hidden pl-14">
      <header className="flex justify-between">
        <h1 className="text-5xl">Sales Page</h1>
        <button onClick={openModal} className="text-3xl">
          +
        </button>
      </header>
      <div className="flex h-screen flex-wrap justify-start gap-3 overflow-auto">
        {data.map((item) => {
          return (
            <ItemCard
              key={item.id}
              imageUrl={item.imageUrl}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              onClick={() => {
                console.log("here");
                setOnCrate((prev) => {
                  // check if the item already exist in the crate it exist increase the qunatity
                  let newItem: CrateItem;
                  const temp = prev.find((val) => val.id === item.id);
                  if (temp !== undefined) {
                    newItem = temp;
                    newItem.quantity++;
                  } else {
                    newItem = {
                      id: item.id,
                      name: item.name,
                      quantity: 1,
                      price: item.price,
                    };
                  }
                  return [...prev.filter((val) => val.id !== item.id), newItem];
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
          onSubmit={handleSubmit(onSubmit, (e) => {
            console.log(
              "🪵 [index.tsx:138] ~ token ~ \x1b[0;32me\x1b[0m = ",
              e
            );
          })}
        >
          {/* register your input into the hook by invoking the "register" function */}
          <input
            className="block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            defaultValue={0}
            {...register("id")}
          />

          {/* include validation with required or other standard HTML validation rules */}
          <input
            className="block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            {...register("imageUrl", { required: true })}
          />
          {/* errors will return when field validation fails  */}
          {errors.imageUrl && <span>This field is required</span>}

          {/* include validation with required or other standard HTML validation rules */}
          <input
            className="block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            {...register("name", { required: true })}
          />
          {/* errors will return when field validation fails  */}
          {errors.name && <span>This field is required</span>}

          {/* include validation with required or other standard HTML validation rules */}
          <input
            className="block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            {...register("price", { required: true })}
          />
          {/* errors will return when field validation fails  */}
          {errors.price && <span>This field is required</span>}

          {/* include validation with required or other standard HTML validation rules */}
          <input
            className="block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            {...register("quantity", { required: true })}
          />
          {/* errors will return when field validation fails  */}
          {errors.quantity && <span>This field is required</span>}

          <input type="submit" />
        </form>
      </Modal>
      {onCrate.length > 0 ? (
        <Crate items={onCrate} setItems={setOnCrate} />
      ) : null}
    </div>
  );
};

export default Home;

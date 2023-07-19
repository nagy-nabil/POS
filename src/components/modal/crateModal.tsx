import { CgSpinner } from "react-icons/cg";
import React, {
  useRef,
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { FaShoppingBag } from "react-icons/fa";
import CustomModal from ".";
import { RiAddLine } from "react-icons/ri";
import { AiOutlineMinus } from "react-icons/ai";
import { MdRemoveShoppingCart } from "react-icons/md";
import { type Product } from "@prisma/client";
import { useTranslation } from "next-i18next";

export type CrateItem = {
  id: string;
  name: string;
  stock: number;
  quantity: number;
  sellPrice: number;
};

export type CrateProps = {
  onCrate: CrateItem[];
  setOnCrate: Dispatch<SetStateAction<CrateItem[]>>;
};

const CrateItem: React.FC<
  CrateItem & {
    setOnCrate: CrateProps["setOnCrate"];
  }
> = (props) => {
  const [operationError, setOperationError] = useState("");
  const { t } = useTranslation();
  const price = props.sellPrice * props.quantity;
  return (
    <>
      <div key={props.id} className="flex gap-1">
        {/* meta data */}
        <div>
          <h3 className="text-xl">{props.name}</h3>
          <label className="my-2">
            Quantity:
            <input
              type="number"
              className="mx-2 w-20 rounded-2xl p-2 text-gray-500"
              value={props.quantity}
              onChange={(e) => {
                const v = +e.target.value;
                if (v > props.stock) {
                  setOperationError(
                    "order quantity cannot be greater than product stock"
                  );
                  return;
                }
                if (v < 0) {
                  setOperationError("order quantity cannot be less than zero");
                  return;
                }
                setOperationError("");
                props.setOnCrate((prev) => {
                  const temp = prev.find((temp) => temp.id === props.id);
                  if (temp !== undefined) {
                    temp.quantity = v;
                  }
                  return [...prev];
                });
              }}
              step={0.5}
              max={props.stock}
            />
          </label>
          <p className="ml-2 text-green-600">
            {`${t("crate.price")}: ${props.sellPrice} $ - ${price}$`}
          </p>
        </div>
        {/* utils */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="h-fit w-fit rounded-lg bg-red-300 p-1"
            onClick={() => {
              props.setOnCrate((prev) => {
                return [...prev.filter((temp) => temp.id !== props.id)];
              });
            }}
          >
            <MdRemoveShoppingCart />
          </button>
          <button
            type="button"
            className="h-fit w-fit rounded-lg bg-yellow-300 p-1"
            onClick={() => {
              props.setOnCrate((prev) => {
                const temp = prev.find((temp) => temp.id === props.id);
                if (temp !== undefined) {
                  temp.quantity--;
                  // remove item if the quantity went zero or below
                  if (temp.quantity <= 0) {
                    return [
                      ...prev.filter((product) => product.id !== temp.id),
                    ];
                  }
                }
                return [...prev];
              });
            }}
          >
            <AiOutlineMinus />
          </button>
          <button
            type="button"
            disabled={props.quantity >= props.stock}
            className="h-fit w-fit rounded-lg bg-green-300 p-1 disabled:bg-gray-500"
            onClick={() => {
              props.setOnCrate((prev) => {
                const temp = prev.find((temp) => temp.id === props.id);
                if (temp !== undefined) {
                  temp.quantity++;
                }
                return [...prev];
              });
            }}
          >
            <RiAddLine />
          </button>
        </div>
      </div>
      <p className="m-2 text-red-700">{operationError}</p>
      <hr className="m-2 " />
    </>
  );
};

// main crate
const CrateModal: React.FC<CrateProps> = (props) => {
  const [operationError, setOperationError] = useState("");
  const { t } = useTranslation();
  const dialgoRef = useRef<HTMLDialogElement>(null);
  function calcTotal() {
    let total = 0;
    props.onCrate.forEach((val) => (total += val.sellPrice * val.quantity));
    return total;
  }
  // const [total, setTotal] = useState(0);
  const queryClient = useQueryClient();
  const orderMut = api.orders.insertOne.useMutation({
    onError(error) {
      setOperationError(error.message);
    },
    onSuccess: (data) => {
      props.setOnCrate([]);
      // update products store
      queryClient.setQueryData<Product[]>(
        [["products", "getMany"], { type: "query" }],
        (prev) => {
          const productsTemp: Product[] = [];
          const lookUp = new Set<string>();
          data.products.forEach((item) => {
            productsTemp.push(item.Product);
            lookUp.add(item.Product.id);
          });
          return prev
            ? [...prev.filter((test) => !lookUp.has(test.id)), ...productsTemp]
            : [];
        }
      );
      if (dialgoRef.current !== null) dialgoRef.current.close();
    },
  });

  return (
    <CustomModal
      header="Cart Check Out"
      dialogRef={dialgoRef}
      key="crateModal"
      buttonChildren={
        <>
          <span>
            {" "}
            {t("crate.prefix")} {props.onCrate.length} {t("crate.postfix")}
          </span>
          <span>
            <FaShoppingBag className="inline" /> ${calcTotal()}
          </span>
        </>
      }
      buttonAttrs={{
        disabled: props.onCrate.length === 0,
        className:
          "flex h-fit w-11/12 justify-between rounded-3xl bg-black p-3 text-white",
      }}
      dialogAttrs={{}}
      formAttrs={{}}
      modalChildren={
        <div className="flex flex-col">
          {/* render crate items */}
          {props.onCrate.map((val) => {
            return (
              <CrateItem key={val.id} {...val} setOnCrate={props.setOnCrate} />
            );
          })}

          <p className="m-2 text-red-700">{operationError}</p>
          <footer className="flex items-center justify-between">
            <span className="text-xl text-green-700">
              {t("crate.footer.totalSpan")}: {calcTotal()}$
            </span>

            <button
              disabled={orderMut.isLoading}
              className=" h-fit w-fit rounded-3xl bg-green-500 p-2 text-white"
              type="button"
              onClick={() => {
                orderMut.mutate(
                  {
                    products: props.onCrate.map((product) => ({
                      id: product.id,
                      quantity: product.quantity,
                    })),
                  },
                  {}
                );
              }}
            >
              {orderMut.isLoading ? (
                <CgSpinner className="animate-spin text-2xl" />
              ) : (
                t("crate.footer.button")
              )}
            </button>
          </footer>
        </div>
      }
    />
  );
};
export default CrateModal;

import React, { useRef, useState } from "react";
import { categorySchema } from "@/types/entities";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { useForm, type SubmitHandler } from "react-hook-form";
import { BiEdit } from "react-icons/bi";
import { CgSpinner } from "react-icons/cg";
import { RiAddLine } from "react-icons/ri";
import { type z } from "zod";

import CustomModal from ".";
import UploadImage, { useUploadAzure } from "../form/uploadImage";
import ImagePreviwe from "../imagePreview";

type CategoryT = z.infer<typeof categorySchema>;

const categoryKeys = categorySchema.keyof().options;

export type CategoryModalProps = {
  operationType: "post" | "put";
  defaultValues: Partial<CategoryT>;
  /**
   * function to run after success and the modal get closed
   */
  afterSuccess?: () => void;
};

const CategoryModal: React.FC<CategoryModalProps> = (props) => {
  const { t } = useTranslation();
  // used to control dialog directly
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState("");
  const [fileSelected, setFileSelected] = useState<File | undefined>(undefined);
  const [fileSelectedSas, setFileSelectedSas] = useState<string | undefined>(
    undefined
  );
  const utils = api.useContext();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
    reset: formReset,
  } = useForm<CategoryT>({
    resolver: zodResolver(categorySchema),
    defaultValues: props.defaultValues,
    mode: "onSubmit",
  });

  function resetModalState() {
    setFileSelected(undefined);
    setFileSelectedSas(undefined);
    setErrors("");
    formReset();
    dialogRef.current?.close();
  }

  const imageMut = useUploadAzure();

  const categoryInsert = api.categories.insertOne.useMutation({
    onSuccess: (data) => {
      utils.categories.getMany.setData(undefined, (prev) =>
        prev ? [...prev, data] : [data]
      );
      resetModalState();
      if (props.afterSuccess) {
        props.afterSuccess();
      }
    },
    onError(err) {
      setErrors(err.message);
    },
  });
  const categoryUpdate = api.categories.updateOne.useMutation({
    onSuccess: (data, variables) => {
      // remove the one with the id of the input and insert the returned from the mutation
      utils.categories.getMany.setData(undefined, (prev) =>
        prev
          ? [...prev.filter((test) => test.id !== variables.id), data]
          : [data]
      );
      resetModalState();
      if (props.afterSuccess) {
        props.afterSuccess();
      }
    },
    onError(err) {
      setErrors(err.message);
    },
  });
  const onSubmit: SubmitHandler<CategoryT> = (data) => {
    if (
      props.operationType === "put" &&
      (data.id === undefined || data.id === "")
    ) {
      setErrors("id cannot be undefined or an empty string");
      return;
    }

    // just saving the mut call into functions to make the poilerplate easier
    const catIns = () => {
      categoryInsert.mutate(data);
    };
    const catPut = () => {
      // @ts-ignore
      categoryUpdate.mutate(data);
    };

    // set function to be run
    let toBeRun: () => void;
    if (props.operationType === "post") {
      toBeRun = catIns;
    } else {
      toBeRun = catPut;
    }

    // upload new image if selected file not undefined, then call the post or put
    // if no selected file do the post or put directly
    if (fileSelectedSas !== undefined && fileSelected !== undefined) {
      imageMut.mutate(
        { image: fileSelected, sasUrl: fileSelectedSas },
        {
          onSuccess() {
            toBeRun();
          },
          onError(err) {
            setErrors(err.message);
          },
        }
      );
    } else {
      toBeRun();
    }
  };

  return (
    <CustomModal
      header={
        props.operationType === "post"
          ? t("categoryModal.headerName.post")
          : t("categoryModal.headerName.put")
      }
      dialogRef={dialogRef}
      buttonAttrs={{ className: "mt-2" }}
      dialogAttrs={{}}
      formAttrs={{
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit: handleSubmit(onSubmit, (err) => {
          console.log(
            "🪵 [productModal.tsx:44] ~ token ~ \x1b[0;32merr\x1b[0m = ",
            err
          );
        }),
      }}
      buttonChildren={
        props.operationType === "post" ? (
          <RiAddLine className="h-fit w-fit p-3 text-3xl text-green-600" />
        ) : (
          <BiEdit className="h-fit w-fit p-3 text-3xl text-yellow-400" />
        )
      }
      modalChildren={
        <article>
          {/* image upload is special case */}
          <label key={"productimage"} className="block">
            {t("categoryModal.props.image")}
            <div className="mb-3 flex gap-1">
              <input
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                {...register("image")}
              />
              <UploadImage
                key={"uploadCategoryImage"}
                setFileSelected={setFileSelected}
                onLink={(url) => {
                  console.log("url", url);
                  setFileSelectedSas(url.sasUrl);
                  setValue("image", url.blobUrl);
                }}
                isDisabled={
                  categoryInsert.isLoading ||
                  categoryUpdate.isLoading ||
                  imageMut.isLoading
                }
              />
            </div>
            {/* errors will return when field validation fails  */}
            {formErrors["image"] && (
              <span className="m-2 text-red-700">
                {formErrors["image"].message}
              </span>
            )}
            {/* handle image preview for insert/update */}
            <ImagePreviwe file={fileSelected} src={props.defaultValues.image} />
          </label>

          {categoryKeys.map((categoryKey, i) => {
            if (categoryKey === "image" || categoryKey === "id") return null;
            return (
              <label key={i} className="block">
                {t(`categoryModal.props.${categoryKey}`)}
                <input
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  {...register(categoryKey, {})}
                />
                {/* errors will return when field validation fails  */}
                {formErrors[categoryKey] && (
                  <span className="m-2 text-red-700">
                    {/* @ts-ignore */}
                    {formErrors[categoryKey].message}
                  </span>
                )}
              </label>
            );
          })}

          <p className="m-2 text-red-700">{errors}</p>
          <button
            disabled={
              categoryInsert.isLoading ||
              categoryUpdate.isLoading ||
              imageMut.isLoading
            }
            type="submit"
            className={clsx({
              "m-3 h-fit w-fit cursor-pointer rounded-lg  p-3 text-white": true,
              "bg-green-700": props.operationType === "post",
              "bg-yellow-600": props.operationType === "put",
            })}
          >
            {categoryInsert.isLoading ||
            categoryUpdate.isLoading ||
            imageMut.isLoading ? (
              <CgSpinner className="animate-spin text-2xl" />
            ) : props.operationType === "post" ? (
              t("categoryModal.action.post")
            ) : (
              t("categoryModal.action.put")
            )}
          </button>
        </article>
      }
    />
  );
};
export default CategoryModal;

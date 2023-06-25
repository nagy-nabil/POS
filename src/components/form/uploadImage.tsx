import { api } from "@/utils/api";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { BiUpload } from "react-icons/bi";

export function useUploadAzure() {
  return useMutation<void, Error, { sasUrl: string; image: File }>({
    mutationFn: async ({ image, sasUrl }) => {
      const res = await fetch(sasUrl, {
        method: "PUT",
        body: image,
        headers: {
          "Content-Type": image.type,
          "x-ms-blob-type": "BlockBlob",
        },
      });
      if (!res.ok) {
        throw new Error(
          `uploading image failed Status: ${res.status} ${res.statusText}`
        );
      }
    },
  });
}

export type UploadImageProps = {
  /**
   * this callback suppose to be called each time new image get uploaded
   * @param url
   * @returns
   */
  onLink: (url: { sasUrl: string; blobUrl: string }) => void;
  setFileSelected: React.Dispatch<React.SetStateAction<File | undefined>>;
};

export default function UploadImage(props: UploadImageProps) {
  const sasUrl = api.helpers.uploadImage.useMutation();
  useEffect(() => {
    if (sasUrl.data !== undefined) {
      props.onLink(sasUrl.data);
    }
  }, [sasUrl.data, props]);

  return (
    <label>
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(event) => {
          if (
            event.target !== null &&
            event.target.files !== null &&
            event.target.files.length === 1
          )
            props.setFileSelected(event.target.files[0]);
          sasUrl.mutate();
        }}
      />
      <BiUpload className="h-fit w-fit rounded-full border-2 border-gray-500 p-1 text-2xl text-gray-700" />
    </label>
  );
}

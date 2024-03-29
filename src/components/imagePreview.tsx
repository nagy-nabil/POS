import React from "react";
import Image from "next/image";

import { CldOrImage } from "./cldOrImage";

export type ImagePreviweProps = {
  /**
   * link to img
   */
  src?: string;
  file?: File;
};

/**
 * Component to show image preview before uploading.
 *
 * if both the src, file are present the file will be used to show the preview
 */
export default function ImagePreviwe(props: ImagePreviweProps) {
  if ((props.file && props.src) || props.file) {
    return (
      <Image
        src={URL.createObjectURL(props.file)}
        width={500}
        height={500}
        alt="preview"
        className="rounded shadow"
      />
    );
  } else if (props.src) {
    return (
      <CldOrImage
        src={props.src}
        width={500}
        height={500}
        alt="preview"
        className="rounded shadow"
      />
    );
  } else {
    return <></>;
  }
}

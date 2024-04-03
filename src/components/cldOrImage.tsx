import { type ComponentProps } from "react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import z from "zod";

/**
 * component to render next/image if the provided `props.src` is complete url else will assume the provided `props.src` is cloudinary id and render `CldImage`
 */
export function CldOrImage(props: ComponentProps<typeof CldImage>) {
  if (z.string().url().safeParse(props.src).success) {
    // @ts-expect-error i don't use this quality option
    return <Image {...props} alt={props.alt} />;
  } else {
    return <CldImage {...props} />;
  }
}

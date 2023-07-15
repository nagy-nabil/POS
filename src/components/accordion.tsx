import clsx from "clsx";
import React, { useState } from "react";
import { AiOutlineRight } from "react-icons/ai";

export type AccordionProps = {
  title: React.ReactElement;
  content: React.ReactElement;
};

export default function Accordion(props: AccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="box-border flex cursor-pointer appearance-none items-center justify-between focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        {props.title}
        <AiOutlineRight
          className={clsx({
            "w-fit  text-xl text-gray-400": true,
            "ease transform duration-700": !open,
            "ease rotate-90 transform duration-700": open,
          })}
        />
      </button>
      <div
        className={clsx({
          "transition-max-height overflow-auto duration-700 ease-in-out": true,
          "hidden  ": !open,
        })}
      >
        <div className="pb-1">{props.content}</div>
      </div>
    </div>
  );
}

import React from "react";
import type { IconType } from "react-icons";

const InputWithIcon: React.FC<{
  Icon: IconType;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  placeHolder?: string;
  inputName?: string;
  defaultValue?: string;
}> = ({ Icon, placeHolder, onSubmit, inputName, defaultValue }) => {
  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidde relative mt-2 flex rounded-xl border-2"
    >
      <button
        type="submit"
        className="absolute inset-y-0 right-0 flex items-center rounded-r-lg bg-gray-200 px-3 py-2 hover:bg-gray-300 focus:outline-none"
      >
        <Icon className="text-neutral" />
      </button>
      <input
        type="text"
        name={inputName}
        defaultValue={defaultValue}
        className="text-neutral w-full rounded-lg border-gray-300 py-2 pl-2 pr-10 focus:border-indigo-500 focus:outline-none"
        placeholder={placeHolder}
      />
    </form>
  );
};

export default InputWithIcon;

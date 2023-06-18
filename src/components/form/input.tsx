import React from "react";

export type InputProps = {
  labelAttributes: React.HTMLAttributes<HTMLLabelElement>;
  inputAttributes: React.HTMLAttributes<HTMLInputElement>;
  name: string;
};

const FormInput: React.FC<InputProps> = (props) => {
  return (
    <label {...props.labelAttributes}>
      {props.name}
      <input
        {...props.inputAttributes}
        className="block w-full rounded-xl p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
      />
    </label>
  );
};

export default FormInput;

import React, { type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { api } from "@/utils/api";
import { useTranslation } from "next-i18next";

export type CategoryDisplayProps = {
  setCategoryFilter: Dispatch<SetStateAction<string>>;
};

const CategoryDisplay: React.FC<CategoryDisplayProps> = (props) => {
  const { t } = useTranslation();
  const categoryQuery = api.categories.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
  });

  if (categoryQuery.isLoading) return <p>loading ...</p>;
  else if (categoryQuery.isError) {
    return <p>{JSON.stringify(categoryQuery.error)}</p>;
  }

  return (
    <>
      {/* categories display */}
      <div className="w-full overflow-auto pb-3 pt-6">
        <div className=" flex w-max items-center justify-start gap-4 overflow-y-hidden  ">
          <div
            role="button"
            key={"all"}
            className="flex flex-col items-center "
            onClick={() => {
              props.setCategoryFilter("");
            }}
          >
            <label>
              <input
                type="radio"
                className="peer hidden"
                name="categoryOptions"
                defaultChecked={true}
              />
              <Image
                className="border-1 rounded-full border-green-500 peer-checked:border-4"
                src="https://images.immediate.co.uk/production/volatile/sites/30/2020/02/Glass-and-bottle-of-milk-fe0997a.jpg?quality=90"
                alt="no Filter"
                width={80}
                height={80}
                priority={true}
              ></Image>
              <p className="text-center text-lg font-semibold text-slate-600">
                {t("categoryDisplay.default")}
              </p>
            </label>
          </div>
          {categoryQuery.data.map((category) => {
            return (
              <div
                role="button"
                key={category.id}
                className="flex flex-col items-center "
                onClick={() => {
                  props.setCategoryFilter(category.id);
                }}
              >
                <label>
                  <input
                    type="radio"
                    className="peer hidden"
                    name="categoryOptions"
                  />
                  <Image
                    className="border-1  rounded-full border-green-500 peer-checked:border-4"
                    src={category.image}
                    alt="category image"
                    width={80}
                    height={80}
                  ></Image>
                  <p className="text-center text-lg font-semibold text-slate-600">
                    {category.name}
                  </p>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
export default CategoryDisplay;

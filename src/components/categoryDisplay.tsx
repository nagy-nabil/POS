import React, { type Dispatch, type SetStateAction } from "react";
import { api } from "@/utils/api";

export type CategoryDisplayProps = {
  setCategoryFilter: Dispatch<SetStateAction<string>>;
};

const CategoryDisplay: React.FC<CategoryDisplayProps> = (props) => {
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
            <img
              className="border-1 h-20 w-20 rounded-full border-gray-300"
              src="https://images.immediate.co.uk/production/volatile/sites/30/2020/02/Glass-and-bottle-of-milk-fe0997a.jpg?quality=90&resize=556,505"
            ></img>
            <p className="text-lg font-semibold text-slate-600">Milk</p>
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
                <img
                  className="border-1 h-20 w-20 rounded-full border-gray-300"
                  src={category.image}
                ></img>
                <p className="text-lg font-semibold text-slate-600">
                  {category.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
export default CategoryDisplay;

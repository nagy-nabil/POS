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
          {new Array(20).fill(0).map((_, i) => {
            return (
              <div
                role="button"
                key={0}
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
            );
          })}
        </div>
        {/* <button
            key={0}
            className="h-fit w-fit rounded-full bg-slate-600 p-3"
            onClick={() => {
              setCategoryFilter("");
            }}
          >
            All
          </button> */}
        {/* {categoryQuery.data.map((category) => {
          return (
            <button
              key={category.id}
              className="p-2"
              onClick={() => {
                props.setCategoryFilter(category.id);
              }}
            >
              <img alt="cat" src={category.image} className="rounded-full" />
              <p>{category.name}</p>
            </button>
          );
        })} */}
      </div>
    </>
  );
};
export default CategoryDisplay;

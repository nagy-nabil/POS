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
      <div className="m-3 flex h-14 w-full justify-start gap-2 overflow-x-auto overflow-y-hidden">
        {new Array(20).fill(0).map((_, i) => {
          return (
            <button
              key={i}
              className="h-fit w-fit rounded-full bg-slate-600 p-3"
              onClick={() => {
                props.setCategoryFilter("");
              }}
            >
              All
            </button>
          );
        })}
        {/* <button
            key={0}
            className="h-fit w-fit rounded-full bg-slate-600 p-3"
            onClick={() => {
              setCategoryFilter("");
            }}
          >
            All
          </button> */}
        {categoryQuery.data.map((category) => {
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
        })}
      </div>
    </>
  );
};
export default CategoryDisplay;

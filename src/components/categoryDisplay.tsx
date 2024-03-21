import React from "react";
import { useRouter } from "next/router";
import { type TypedQueryParams } from "@/types/query";
import { api } from "@/utils/api";
import { FilterX } from "lucide-react";
import { useTranslation } from "next-i18next";

import { CldOrImage } from "./cldOrImage";

export type CategoryDisplayProps = {
  // setCategoryFilter: Dispatch<SetStateAction<string | null>>;
};

export function CategoryDisplaySkeleton(props: { count: number }) {
  return (
    <div
      role="status"
      className="flex w-full animate-pulse   rounded  p-3 md:p-4"
    >
      {new Array(props.count).fill(0).map((_, i) => (
        <div className=" mx-4 flex flex-col items-center" key={i}>
          <div>
            <div className="m-auto mb-2.5 h-20 w-20 rounded-full bg-gray-300 "></div>
            <div className="h-3 w-24 rounded-full bg-gray-200 "></div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = (_props) => {
  const router = useRouter();
  const query = router.query as TypedQueryParams;
  const { t } = useTranslation();
  const categoryQuery = api.categories.getMany.useQuery(undefined, {
    staleTime: Infinity,
  });

  if (categoryQuery.isError) {
    return <p>{JSON.stringify(categoryQuery.error)}</p>;
  }

  return (
    <>
      {/* categories display */}
      <div className="w-full overflow-auto ">
        <div className=" flex w-max items-center justify-start gap-4 overflow-y-hidden  ">
          <div
            role="button"
            key={"all"}
            className="flex flex-col items-center "
          >
            <label>
              <input
                type="radio"
                className="peer hidden"
                name="categoryOptions"
                checked={
                  query.categoryFilter === undefined ||
                  query.categoryFilter === ""
                }
                onChange={() => {
                  void router.push(
                    {
                      query: {
                        ...query,
                        categoryFilter: undefined,
                      } satisfies TypedQueryParams,
                    },
                    undefined,
                    { shallow: true },
                  );
                }}
              />
              <div className="w-20 h-20 flex items-center justify-center border-1 rounded-full border-green-500 peer-checked:border-4">
                <FilterX />
              </div>
              <p className="text-center text-lg font-semibold">
                {t("categoryDisplay.default")}
              </p>
            </label>
          </div>
          {categoryQuery.isLoading ? (
            <CategoryDisplaySkeleton count={5} />
          ) : (
            categoryQuery.data.map((category) => {
              return (
                <div
                  role="button"
                  key={category.id}
                  className="flex flex-col justify-center items-center content-center "
                >
                  <label>
                    <div className="h-20 w-20 overflow-hidden relative m-auto">
                      <input
                        type="radio"
                        checked={query.categoryFilter === category.id}
                        className="peer hidden"
                        name="categoryOptions"
                        onChange={() => {
                          void router.push(
                            {
                              query: {
                                ...query,
                                categoryFilter: category.id,
                              } satisfies TypedQueryParams,
                            },
                            undefined,
                            { shallow: true },
                          );
                        }}
                      />
                      <CldOrImage
                        className="border-1 h-auto w-full object-cover rounded-full border-green-500 peer-checked:border-4"
                        src={category.image}
                        alt="category image"
                        fill={true}
                        sizes="10vw"
                      />
                    </div>
                    <p className="text-center text-lg font-semibold ">
                      {category.name}
                    </p>
                  </label>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
export default CategoryDisplay;

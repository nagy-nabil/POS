import React, { type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { api } from "@/utils/api";
import { useTranslation } from "next-i18next";

export type CategoryDisplayProps = {
  setCategoryFilter: Dispatch<SetStateAction<string | null>>;
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

const CategoryDisplay: React.FC<CategoryDisplayProps> = (props) => {
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
            onClick={() => {
              props.setCategoryFilter(null);
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
              />
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
                  onClick={() => {
                    props.setCategoryFilter(category.id);
                  }}
                >
                  <label>
                    <div className="h-20 w-20 overflow-hidden relative m-auto">
                    <input
                      type="radio"
                      className="peer hidden"
                      name="categoryOptions"
                    />
                      <Image
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

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { NextPage } from "next";
import { api } from "@/utils/api";

const Anal: NextPage = () => {
  let totalSold = 0;
  const orderQuery = api.orders.getMany.useQuery(undefined, {
    staleTime: 1000 * 50 * 60,
  });

  if (orderQuery.isLoading) return <p>loading ...</p>;
  else if (orderQuery.isError) {
    return <p>{JSON.stringify(orderQuery.error)}</p>;
  }

  return (
    <>
      <div className="flex h-screen w-full flex-col gap-y-8 overflow-hidden pl-14">
        <header className="flex flex-col justify-between gap-4">
          <h1 className="text-5xl">ANAl Page</h1>
        </header>

        <div className="flex h-screen flex-wrap justify-start gap-3 overflow-auto">
          {orderQuery.data.map((order) => {
            totalSold += order.total;
            return (
              <div className="flex flex-col gap-3" key={order.id}>
                <h3 className="text-2xl font-bold text-orange-700">
                  Order Number: {order.id}
                </h3>
                <div className="flex flex-col gap-4 border border-solid p-4 shadow-lg">
                  <span>created By: {order.createdById}</span>
                  <span>payment type: {order.paymentType}</span>
                  <span className="text-green-800">Total: {order.total}$</span>
                  <span>created at: {order.createdAt.toString()}</span>
                  <h2 className="text-2xl text-sky-700">Products</h2>

                  <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="rounded-l-lg px-6 py-3">
                          id
                        </th>
                        <th scope="col" className="px-6 py-3">
                          name
                        </th>
                        <th scope="col" className="px-6 py-3">
                          price$
                        </th>
                        <th scope="col" className="px-6 py-3">
                          qunatity
                        </th>
                        <th scope="col" className="rounded-r-lg px-6 py-3">
                          total$
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((product) => (
                        <tr
                          className="bg-white dark:bg-gray-800"
                          key={product.Product.id}
                        >
                          <th
                            scope="row"
                            className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                          >
                            {product.Product.id}
                          </th>
                          <th
                            scope="row"
                            className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                          >
                            {product.Product.name}
                          </th>
                          <td className="px-6 py-4">
                            {product.sellPriceAtSale}$
                          </td>
                          <td className="px-6 py-4">{product.quantity}</td>
                          <td className="px-6 py-4">
                            {product.quantity * product.sellPriceAtSale}$
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-2xl text-green-700">Total Sold: {totalSold}$</p>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default Anal;

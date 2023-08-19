
::-webkit-calendar-picker-indicator {
    background-color: white;
    padding: 5px;
    cursor: pointer;
    border-radius: 4px;
}

import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

  const categoryQuery = api.categories.getMany.useQuery(undefined, {
    staleTime: Infinity,
    retry(_failureCount, error) {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return true;
    },
  });

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="w-screen">
        <header className="mt-2 flex items-center justify-around">
          <h1 className="text-4xl">Category</h1>
        </header>
        {categoryQuery.data && <Table data={categoryQuery.data} />}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );

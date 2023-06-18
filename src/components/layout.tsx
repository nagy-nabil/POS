import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { RiMenu4Fill } from "react-icons/ri";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setToken } = useAuth({ redirectAfterSet: "/signin" });
  return (
    <div className="flex h-screen w-screen">
      {/* <aside
        className="h-screen bg-slate-800 p-4 dark:bg-gray-900 md:w-1/5"
        aria-label="Sidebar"
      >
        <Link href={"/"} className="mb-5 flex items-center pl-2.5">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            POS
          </span>
        </Link>
        <ul className="space-y-2 text-2xl">
          <li>
            <Link
              href={"/branches"}
              className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Branches
            </Link>
          </li>
          <li>
            <Link
              href={"/anal"}
              className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Analysis
            </Link>
          </li>
          <li>
            <Link
              href={"/staff"}
              className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Staff
            </Link>
          </li>
          <li>
            <Link
              href={"/settings"}
              className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              Settings
            </Link>
          </li>
        </ul>
        <li>
          <button
            className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            onClick={() => {
              void setToken("");
            }}
          >
            Log out
          </button>
        </li>
      </aside> */}
      <button className="fixed left-2 top-2 text-3xl">
        <RiMenu4Fill />
      </button>
      {children}
    </div>
  );
};
export default Layout;

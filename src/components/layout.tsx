import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { RiMenu4Fill, RiCloseLine, RiLogoutBoxLine } from "react-icons/ri";
import { AiOutlineShoppingCart, AiOutlineSetting } from "react-icons/ai";
import { LuBarChart3 } from "react-icons/lu";
import { CiShoppingTag } from "react-icons/ci";
import { MdOutlineCategory } from "react-icons/md";
import { useRef, useState } from "react";

const iconClasses = "text-gray-600";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // used to describe sidebar items
  // [label, href, icon]
  const sidebar = useRef<[string, string, JSX.Element][]>([
    [
      "Sales",
      "/",
      <AiOutlineShoppingCart key="sales" className={iconClasses} />,
    ],
    [
      "Product",
      "/product",
      <CiShoppingTag key="product" className={iconClasses} />,
    ],
    [
      "category",
      "/category",
      <MdOutlineCategory key="category" className={iconClasses} />,
    ],
    [
      "Analysis",
      "/analysis",
      <LuBarChart3 key="analysis" className={iconClasses} />,
    ],
    [
      "Settings",
      "/setting",
      <AiOutlineSetting key="setting" className={iconClasses} />,
    ],
  ]);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { setToken } = useAuth({ redirectAfterSet: "/signin" });
  return (
    <div className="flex h-screen w-screen scroll-smooth">
      <button
        onClick={() => {
          setSidebarVisible((prev) => !prev);
        }}
        className="fixed left-2 top-2 text-3xl"
      >
        <RiMenu4Fill />
      </button>
      <aside
        className={
          (sidebarVisible ? "absolute " : "hidden ") +
          "min-w-1/3 z-50 mr-5 h-screen  w-3/5  bg-black p-2 md:flex md:flex-col lg:w-1/5 "
        }
        aria-label="Sidebar"
      >
        <header className="m-4 flex justify-between">
          <Link href={"/"} className="">
            <span className="self-center whitespace-nowrap text-2xl font-semibold text-white">
              Zagy
            </span>
          </Link>
          <button
            className="rounded-lg border-2 border-gray-600 text-3xl text-white md:hidden"
            onClick={() => {
              setSidebarVisible((prev) => !prev);
            }}
          >
            <RiCloseLine />
          </button>
        </header>

        <ul className="m-2 flex flex-col gap-3 text-2xl">
          {/* create sidebar items */}
          {sidebar.current.map((item, i) => {
            return (
              <li key={i}>
                <Link
                  href={item[1]}
                  className="flex items-center gap-3 rounded-lg border-2 border-gray-600 p-2 text-white"
                >
                  {item[2]} {item[0]}
                </Link>
              </li>
            );
          })}

          <li key="logout" className="mt-auto">
            <button
              className="flex items-center gap-3 rounded-lg border-2 border-gray-600 p-2 text-white"
              onClick={() => {
                void setToken("");
              }}
            >
              <RiLogoutBoxLine className={iconClasses} /> Log out
            </button>
          </li>
        </ul>
      </aside>
      {/* add overlay when sidebar is active on small screens */}
      {sidebarVisible && (
        <div
          className="z-49 fixed left-0 top-0 h-full w-full bg-gray-900 opacity-80 md:hidden"
          onClick={() => setSidebarVisible(false)}
        />
      )}
      {children}
    </div>
  );
};
export default Layout;

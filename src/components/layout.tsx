import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { RiMenu4Fill, RiCloseLine, RiLogoutBoxLine } from "react-icons/ri";
import { AiOutlineShoppingCart, AiOutlineSetting } from "react-icons/ai";
import { LuBarChart3 } from "react-icons/lu";
import { CiShoppingTag } from "react-icons/ci";
import { MdMoneyOff, MdOutlineCategory } from "react-icons/md";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  // used to describe sidebar items
  // [label, href, icon]
  const iconClasses = "w-fit h-fit text-white bg-gray-800 p-3 rounded-2xl ";
  const sidebar = useMemo<[string, string, JSX.Element][]>(
    () => [
      [
        t("sidebar.paths.sales"),
        "/",
        <AiOutlineShoppingCart key="sales" className={iconClasses} />,
      ],
      [
        t("sidebar.paths.products"),
        "/product",
        <CiShoppingTag key="product" className={iconClasses} />,
      ],
      [
        t("sidebar.paths.category"),
        "/category",
        <MdOutlineCategory key="category" className={iconClasses} />,
      ],
      [
        t("sidebar.paths.anal"),
        "/analysis",
        <LuBarChart3 key="analysis" className={iconClasses} />,
      ],
      [
        t("sidebar.paths.spendings"),
        "/spending",
        <MdMoneyOff key="spendings" className={iconClasses} />,
      ],
      [
        t("sidebar.paths.settings"),
        "/setting",
        <AiOutlineSetting key="setting" className={iconClasses} />,
      ],
    ],
    [t]
  );

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { setToken } = useAuth({ redirectAfterSet: "/signin" });
  const { route } = useRouter();
  return (
    <div className="flex h-screen w-screen scroll-smooth">
      <button
        type="button"
        onClick={() => {
          setSidebarVisible((prev) => !prev);
        }}
        className="fixed left-0 top-0 m-3 text-3xl"
      >
        <RiMenu4Fill />
      </button>
      <aside
        className={
          (sidebarVisible ? "absolute " : "hidden ") +
          "min-w-1/3 z-50 mr-5 flex  h-screen  w-5/6 flex-col justify-start rounded-r-lg bg-gray-950 p-2 lg:w-1/5"
        }
        aria-label="Sidebar"
      >
        <header className="m-4 mb-6 flex justify-between">
          <Link href={"/"} className="">
            <span className="self-center whitespace-nowrap text-2xl font-semibold text-white">
              Zagy
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg border-2 border-gray-600 text-3xl text-white md:hidden"
            onClick={() => {
              setSidebarVisible((prev) => !prev);
            }}
          >
            <RiCloseLine />
          </button>
        </header>

        <ul className="m-2 flex h-full flex-col gap-3 text-2xl">
          {/* create sidebar items */}
          {sidebar.map((item, i) => {
            return (
              <li key={i}>
                <Link
                  href={item[1]}
                  className={`flex items-center gap-3 rounded-2xl  p-2 text-white 
                      ${route === item[1] ? "bg-gray-700 " : " "}`}
                >
                  {item[2]} {item[0]}
                </Link>
              </li>
            );
          })}

          <li key="logout" className="mt-auto">
            <button
              type="button"
              className=" flex  items-center gap-3 rounded-2xl p-2 text-white"
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

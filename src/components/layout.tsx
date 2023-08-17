import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import {
  AiOutlineHistory,
  AiOutlineSetting,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { BiSolidOffer } from "react-icons/bi";
import { CiShoppingTag } from "react-icons/ci";
import { GiTakeMyMoney } from "react-icons/gi";
import { LuBarChart3 } from "react-icons/lu";
import { MdMoneyOff, MdOutlineCategory } from "react-icons/md";
import { RiCloseLine, RiLogoutBoxLine, RiMenu4Fill } from "react-icons/ri";

import Accordion from "./accordion";

export type PathItem = {
  label: string;
  href: string;
  icon: React.ReactElement;
};
export type PathItemProps = {
  path: PathItem & { key: string };
};
export type PathsListProps = {
  paths: (PathItem | PathItem[])[];
};

export function PathItem(props: PathItemProps & { isActive: boolean }) {
  return (
    <>
      <li key={props.path.key}>
        <Link
          href={props.path.href}
          className={`flex items-center gap-3 rounded-2xl  p-2 text-white 
                      ${props.isActive ? "bg-gray-700 " : " "}`}
        >
          {props.path.icon} {props.path.label}
        </Link>
      </li>
    </>
  );
}

/**
 * in nested use first path label/icon for accordion
 * if inner list is empty will throw
 * @param props
 * @returns
 */
export function PathsList(props: PathsListProps) {
  const { route } = useRouter();

  return (
    <ul className="m-2 flex h-full flex-col gap-3 text-2xl">
      {props.paths.map((path, i) => {
        return Array.isArray(path) ? (
          <Accordion
            key={`${i}acclisi`}
            title={
              <div
                className={
                  "flex items-center gap-3 rounded-2xl  p-2 text-white"
                }
              >
                {/* @ts-ignore */}
                {path[0].icon} {path[0].label}
              </div>
            }
            content={<PathsList key={`${i}innleis`} paths={path} />}
          />
        ) : (
          <PathItem
            key={`${i}litom`}
            isActive={route === path.href}
            path={{
              key: i.toString() + "path",
              ...path,
            }}
          />
        );
      })}
    </ul>
  );
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  // used to describe sidebar items
  const iconClasses = "w-fit h-fit text-white bg-gray-800 p-3 rounded-2xl ";
  const sidebar = useMemo<PathsListProps>(
    () => ({
      paths: [
        {
          label: t("sidebar.paths.sales"),
          href: "/",
          icon: <AiOutlineShoppingCart key="sales" className={iconClasses} />,
        },
        {
          label: t("sidebar.paths.products"),
          href: "/product",

          icon: <CiShoppingTag key="product" className={iconClasses} />,
        },
        {
          label: t("sidebar.paths.offers"),
          href: "/offers",

          icon: <BiSolidOffer key="offers" className={iconClasses} />,
        },
        {
          label: t("sidebar.paths.category"),
          href: "/category",
          icon: <MdOutlineCategory key="category" className={iconClasses} />,
        },
        [
          {
            label: t("sidebar.paths.anal.index"),
            href: "/analysis",
            icon: <LuBarChart3 key="analysis" className={iconClasses} />,
          },
          {
            label: t("sidebar.paths.anal.history"),
            href: "/analysis/history",
            icon: <AiOutlineHistory key="analHis" className={iconClasses} />,
          },
        ],
        [
          {
            label: t("sidebar.paths.spendings.index"),
            href: "/spending",
            icon: <GiTakeMyMoney key="spendings" className={iconClasses} />,
          },
          {
            label: t("sidebar.paths.spendings.losses"),
            href: "/spending/losses",
            icon: <MdMoneyOff key="spendings" className={iconClasses} />,
          },
        ],
        {
          label: t("sidebar.paths.settings"),
          href: "/setting",
          icon: <AiOutlineSetting key="setting" className={iconClasses} />,
        },
      ],
    }),
    [t]
  );

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
          "min-w-1/3 z-50 mr-5 flex  h-screen  w-5/6 flex-col justify-start overflow-y-auto rounded-r-lg bg-gray-950 p-2 lg:w-1/5"
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
        <PathsList {...sidebar} />
        <button
          type="button"
          className=" mt-4  flex h-fit w-fit items-center gap-3 rounded-2xl p-2 text-2xl text-white"
          onClick={() => signOut()}
        >
          <RiLogoutBoxLine className="h-fit w-fit rounded-2xl bg-gray-800 p-3 text-white " />{" "}
          Log out
        </button>
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

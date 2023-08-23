import React, { useMemo, useState } from "react";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/utils/shadcn/shadcn";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
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
import { RiLogoutBoxLine, RiMenu4Fill } from "react-icons/ri";

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

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={async () => {
        await router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function PathItem(
  props: PathItemProps & { isActive: boolean; setOpen: (open: boolean) => void }
) {
  return (
    <MobileLink
      href={props.path.href}
      className={`flex items-center gap-3 rounded-2xl  p-2 text-white text-2xl
                      ${props.isActive ? "bg-gray-700 " : " "}`}
      onOpenChange={props.setOpen}
    >
      {props.path.icon} {props.path.label}
    </MobileLink>
  );
}

/**
 * in nested use first path label/icon for accordion
 * if inner list is empty will throw
 * @param props
 * @returns
 */
export function PathsList(
  props: PathsListProps & { setOpen: (open: boolean) => void }
) {
  const { route } = useRouter();

  return (
    <>
      {props.paths.map((path, i) => {
        return Array.isArray(path) ? (
          <Accordion
            key={`${i}acclisi`}
            title={
              <div
                className={
                  "text-2xl flex items-center gap-3 rounded-2xl  p-2 text-white"
                }
              >
                {/* @ts-ignore */}
                {path[0].icon} {path[0].label}
              </div>
            }
            content={
              <PathsList
                key={`${i}innleis`}
                paths={path}
                setOpen={props.setOpen}
              />
            }
          />
        ) : (
          <PathItem
            key={`${i}litom`}
            isActive={route === path.href}
            setOpen={props.setOpen}
            path={{
              key: i.toString() + "path",
              ...path,
            }}
          />
        );
      })}
    </>
  );
}

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

  const iconClasses = "w-fit h-fit text-primary-forground border  p-3 rounded-2xl ";
const iconSize = 25;
export function Nav() {
  const [open, setOpen] = React.useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // used to describe sidebar items
  const sidebarLinks = useMemo<PathsListProps>(
    () => ({
      paths: [
        {
          label: t("sidebar.paths.sales"),
          href: "/",
          icon: <AiOutlineShoppingCart key="sales" className={iconClasses} size={iconSize} />,
        },
        {
          label: t("sidebar.paths.products"),
          href: "/product",

          icon: <CiShoppingTag key="product" className={iconClasses} size={iconSize}/>,
        },
        {
          label: t("sidebar.paths.offers"),
          href: "/offers",

          icon: <BiSolidOffer key="offers" className={iconClasses} size={iconSize}/>,
        },
        {
          label: t("sidebar.paths.category"),
          href: "/category",
          icon: <MdOutlineCategory key="category" className={iconClasses} size={iconSize}/>,
        },
        [
          {
            label: t("sidebar.paths.anal.index"),
            href: "/analysis",
            icon: <LuBarChart3 key="analysis" className={iconClasses} size={iconSize}/>,
          },
          {
            label: t("sidebar.paths.anal.history"),
            href: "/analysis/history",
            icon: <AiOutlineHistory key="analHis" className={iconClasses} size={iconSize}/>,
          },
        ],
        [
          {
            label: t("sidebar.paths.spendings.index"),
            href: "/spending",
            icon: <GiTakeMyMoney key="spendings" className={iconClasses} size={iconSize}/>,

          },
          {
            label: t("sidebar.paths.spendings.losses"),
            href: "/spending/losses",
            icon: <MdMoneyOff key="spendings" className={iconClasses} size={iconSize}/>,
          },
        ],
        {
          label: t("sidebar.paths.settings"),
          href: "/setting",
          icon: <AiOutlineSetting key="setting" className={iconClasses} size={iconSize}/>,
        },
      ],
    }),
    [t]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
        >
          <RiMenu4Fill size={30} />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="pr-0 bg-primary">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <span className="self-center whitespace-nowrap text-2xl font-semibold text-white">
            Zagy
          </span>
        </MobileLink>

        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-3">
            <PathsList {...sidebarLinks} setOpen={setOpen} />
            <Button
              type="button"
              variant="ghost"
              className=" mt-4  flex h-fit w-fit items-center gap-3 rounded-2xl p-2 text-2xl text-white"
              onClick={async () => {
                await signOut({ redirect: false });
                queryClient.clear();
              }}
            >
              <RiLogoutBoxLine className="h-fit w-fit rounded-2xl bg-gray-800 p-3 text-white " />{" "}
              {t("sidebar.actions.logout")}
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { pathname } = useRouter();
  return (
    <div className="flex flex-col h-screen w-screen scroll-smooth gap-2">
      <header className="w-full flex overflow-hidden  h-fit mt-2 justify-between ">
        <Nav />
        {/* @ts-ignore  */}
        <h1 className="text-4xl line-clamp-4">{t(`pages.${pathname}.header`)}</h1>
        <ModeToggle />
      </header>
      {children}
    </div>
  );
};
export default Layout;

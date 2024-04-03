import React, { useMemo } from "react";
import Head from "next/head";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/shadcn/shadcn";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Package2, PanelLeft } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { type IconType } from "react-icons";
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
import { RiLogoutBoxLine } from "react-icons/ri";

import { ModeToggle } from "./modeToggle";

export type PathItem = {
  label: string;
  href: string;
  icon: {
    Component: IconType;
    key: string;
  };
};
export type PathItemProps = {
  path: PathItem & { key: string };
};
export type PathsListProps = { paths: PathItem[] };

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function MobileLink({
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
        await router.push(href.toString()); // eslint-disable-line
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
  props: PathItemProps & {
    isActive: boolean;
    /**
     * control sheet
     */
    setOpen?: (open: boolean) => void;
  },
) {
  return (
    <MobileLink
      href={props.path.href}
      className={`flex items-center gap-3 rounded-2xl  p-2 text-white text-2xl
                      ${props.isActive ? "bg-gray-500" : " "}`}
      onOpenChange={props.setOpen}
    >
      <props.path.icon.Component
        size={25}
        className="w-fit h-fit text-primary-forground border  p-3 rounded-2xl"
      />{" "}
      {props.path.label}
    </MobileLink>
  );
}

export function PathsList(
  props: PathsListProps & {
    /**
     * control sheet
     */
    setOpen: (open: boolean) => void;
  },
) {
  const { route } = useRouter();

  return (
    <>
      {props.paths.map((path, i) => {
        return (
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

function useI18nNavLinks() {
  const { t } = useTranslation();
  return useMemo<PathsListProps["paths"]>(
    () => [
      {
        label: t("sidebar.paths.sales"),
        href: "/",
        icon: {
          Component: AiOutlineShoppingCart,
          key: "sales",
        },
      },
      {
        label: t("sidebar.paths.products"),
        href: "/product",
        icon: {
          Component: CiShoppingTag,
          key: "product",
        },
      },
      {
        label: t("sidebar.paths.offers"),
        href: "/offers",
        icon: {
          Component: BiSolidOffer,
          key: "offers",
        },
      },
      {
        label: t("sidebar.paths.category"),
        href: "/category",
        icon: {
          Component: MdOutlineCategory,
          key: "category",
        },
      },
      {
        label: t("sidebar.paths.anal.index"),
        href: "/analysis",
        icon: {
          Component: LuBarChart3,
          key: "analysis",
        },
      },
      {
        label: t("sidebar.paths.anal.history"),
        href: "/analysis/history",
        icon: {
          Component: AiOutlineHistory,
          key: "analHis",
        },
      },
      {
        label: t("sidebar.paths.spendings.index"),
        href: "/spending",
        icon: {
          Component: GiTakeMyMoney,
          key: "spendings",
        },
      },
      {
        label: t("sidebar.paths.spendings.losses"),
        href: "/spending/losses",
        icon: {
          Component: MdMoneyOff,
          key: "spendings",
        },
      },
      {
        label: t("sidebar.paths.settings"),
        href: "/setting",
        icon: {
          Component: AiOutlineSetting,
          key: "setting",
        },
      },
    ],
    [t],
  );
}
function DesktopNav() {
  const { route } = useRouter();
  const sidebarLinks = useI18nNavLinks();
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">POS Inc</span>
        </Link>
        {sidebarLinks.map((link) => {
          const isActive = route === link.href;
          return (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ",
                    { "bg-accent text-accent-foreground": isActive },
                  )}
                >
                  <link.icon.Component className="h-5 w-5" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{link.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const sidebarLinks = useI18nNavLinks();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="p-0 px-2 bg-primary dark:bg-secondary"
      >
        <h1 className="text-3xl font-bold my-3 text-white">
          <MobileLink
            href="/"
            className="flex items-center"
            onOpenChange={setOpen}
          >
            <span className="self-center whitespace-nowrap ">Zagy</span>
          </MobileLink>
        </h1>

        <ScrollArea className="my-4  h-[calc(100vh-8rem)] pb-1">
          <PathsList paths={sidebarLinks} setOpen={setOpen} />
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-auto flex justify-start gap-3 rounded-2xl h-fit  p-2 text-white text-2xl"
            onClick={async () => {
              await signOut({ redirect: false });
              queryClient.clear();
            }}
          >
            <RiLogoutBoxLine
              className={
                "w-fit h-fit text-primary-forground border  p-3 rounded-2xl"
              }
              size={25}
            />
            {t("sidebar.actions.logout")}
          </Button>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

/**
 * default layout
 **/
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { pathname } = useRouter();

  return (
    <>
      <Head>
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <div className="flex min-h-screen w-full flex-col scroll-smooth ">
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <h1 className="h-fit text-4xl line-clamp-4 py-3">
              {/* @ts-expect-error i don't remember why do i need this but yeah */}
              {t(`pages.${pathname}.header`)}
            </h1>
            <ModeToggle />
          </header>
          <div className="w-full h-full">{children}</div>
        </div>
      </div>
    </>
  );
};
export default Layout;

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  const colors = require('tailwindcss/colors')
  
  module.exports = {
    // ...
    theme: {
      extend: {
        colors: {
          rose: colors.rose,
        },
      },
    },
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Menu, Popover, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import {
  ArrowTrendingUpIcon,
  Bars3Icon,
  BellIcon,
  FireIcon,
  HomeIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { cx } from "class-variance-authority";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import type { FC, ReactNode } from "react";
import { Fragment, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { api } from "../utils/api";
import { Image } from "../components/Image";

const navigation = [
  { name: "Home", href: "#", icon: HomeIcon, current: true },
  { name: "Popular", href: "#", icon: FireIcon, current: false },
  { name: "Communities", href: "#", icon: UserGroupIcon, current: false },
  { name: "Trending", href: "#", icon: ArrowTrendingUpIcon, current: false },
  { name: "Favorites", href: "#", icon: StarIcon, current: false },
];
const userNavigation = [
  { name: "Your Profile", href: "/profile" },
  { name: "Settings", href: "/settings" },
  { name: "Sign out", onClick: signOut },
];

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const communities = api.community.all.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: session } = api.auth.getSession.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full">
        {/* TODO: When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
        <Popover
          as="header"
          className={({ open }) =>
            cx(
              open ? "fixed inset-0 z-40 overflow-y-auto" : "",
              "bg-white shadow-sm dark:bg-gray-800 lg:static lg:overflow-y-visible"
            )
          }
        >
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-between lg:gap-8 xl:grid xl:grid-cols-12">
                  <div className="flex md:absolute md:inset-y-0 md:left-0 lg:static xl:col-span-2">
                    <div className="flex flex-shrink-0 items-center">
                      <Link href="/">
                        {/* FIXME: upload a real logo to db */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="block h-8 w-auto"
                          src="https://tailwindui.com/img/logos/mark.svg?color=rose&shade=500"
                          alt="Your Company"
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
                    <div className="flex items-center px-6 py-4 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                      <div className="w-full">
                        <label htmlFor="search" className="sr-only">
                          Search
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </div>
                          <input
                            id="search"
                            name="search"
                            className={cx(
                              "block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-rose-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm",
                              "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:border-rose-500 dark:focus:placeholder-gray-300 dark:focus:ring-rose-500"
                            )}
                            placeholder="Search"
                            type="search"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center md:absolute md:inset-y-0 md:right-0 lg:hidden">
                    {/* Mobile menu button */}
                    <Popover.Button className="-mx-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500">
                      <span className="sr-only">Open menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Popover.Button>
                  </div>
                  <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
                    <Link
                      href="#"
                      className="text-sm font-medium text-gray-900 hover:underline dark:text-gray-50"
                    >
                      Go Premium
                    </Link>
                    <Link
                      href="#"
                      className={cx(
                        "ml-5 flex-shrink-0 rounded-full bg-white p-1 text-gray-400",
                        "hover:text-gray-500",
                        "focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
                        "dark:bg-gray-800 dark:hover:text-gray-300",
                        "dark:focus:ring-offset-gray-900"
                      )}
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </Link>

                    {/* Profile dropdown */}
                    {session?.user ? (
                      <Menu as="div" className="relative ml-5 flex-shrink-0">
                        <div>
                          <Menu.Button
                            className={cx(
                              "flex rounded-full bg-white",
                              "focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
                              "dark:bg-gray-800 dark:focus:ring-offset-gray-900"
                            )}
                          >
                            <span className="sr-only">Open user menu</span>
                            {session.user.image?.publicId ? (
                              <Image
                                className="h-8 w-8 rounded-full"
                                src={session.user.image.publicId}
                                width={32}
                                height={32}
                                alt={`Avatar of ${
                                  session?.user.name || "user"
                                }}`}
                              />
                            ) : (
                              <UserIcon
                                className="h-8 w-8 rounded-full"
                                aria-hidden="true"
                              />
                            )}
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => {
                                  if (item.onClick) {
                                    return (
                                      <button
                                        onClick={() => item.onClick()}
                                        className={cx(
                                          active ? "bg-gray-100" : "",
                                          "block w-full py-2 px-4 text-left text-sm text-gray-700"
                                        )}
                                      >
                                        {item.name}
                                      </button>
                                    );
                                  }
                                  return (
                                    <Link
                                      href={item.href}
                                      className={cx(
                                        active ? "bg-gray-100" : "",
                                        "block py-2 px-4 text-sm text-gray-700"
                                      )}
                                    >
                                      {item.name}
                                    </Link>
                                  );
                                }}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    ) : (
                      <button
                        onClick={() => signIn("credentials")}
                        className={cx(
                          "ml-6 inline-flex items-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm",
                          "hover:bg-rose-700",
                          "focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
                          "dark:bg-rose-700 dark:hover:bg-rose-600",
                          "dark:focus:ring-offset-rose-900"
                        )}
                      >
                        Sign In
                      </button>
                    )}

                    {session?.user ? (
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className={cx(
                          "ml-6 inline-flex items-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm",
                          "hover:bg-rose-700",
                          "focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
                          "dark:bg-rose-700 dark:hover:bg-rose-600",
                          "dark:focus:ring-offset-rose-900"
                        )}
                      >
                        New Post
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              <Sidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
                communities={communities.data}
              />

              <Popover.Panel as="nav" className="lg:hidden" aria-label="Global">
                <div className="mx-auto max-w-3xl space-y-1 px-2 pt-2 pb-3 sm:px-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className={cx(
                        item.current
                          ? "bg-gray-100 text-gray-900"
                          : "hover:bg-gray-50",
                        "block rounded-md py-2 px-3 text-base font-medium"
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                {session?.user ? (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="mx-auto flex max-w-3xl items-center px-4 sm:px-6">
                        <div className="flex-shrink-0">
                          {session.user.image?.publicId ? (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={session?.user.image.publicId}
                              height={40}
                              width={40}
                              alt={`Avatar of ${session?.user.name || "user"}}`}
                            />
                          ) : (
                            <UserIcon
                              className="h-10 w-10 rounded-full"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800">
                            {session?.user.name}
                          </div>
                          <div className="text-sm font-medium text-gray-500">
                            {session?.user.email}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">View notifications</span>
                          <BellIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="mx-auto mt-3 max-w-3xl space-y-1 px-2 sm:px-4">
                        {userNavigation.map((item) => {
                          if (item.onClick) {
                            return (
                              <button
                                key={item.name}
                                onClick={() => item.onClick()}
                                className="block w-full rounded-md py-2 px-3 text-left text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                              >
                                {item.name}
                              </button>
                            );
                          }

                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block rounded-md py-2 px-3 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mx-auto mt-6 max-w-3xl px-4 sm:px-6">
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-rose-700"
                      >
                        New Post
                      </button>

                      <div className="mt-6 flex justify-center">
                        <Link
                          href="#"
                          className="text-base font-medium text-gray-900 hover:underline"
                        >
                          Go Premium
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mx-auto mt-6 max-w-3xl px-4 sm:px-6">
                    <button
                      onClick={() => signIn()}
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-rose-700"
                    >
                      Sign in
                    </button>
                  </div>
                )}
              </Popover.Panel>
            </>
          )}
        </Popover>

        <div className="py-10">
          <div className="mx-auto max-w-3xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-8 lg:px-8">
            {children}
          </div>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

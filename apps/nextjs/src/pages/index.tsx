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
import { Tab } from "@headlessui/react";
import {
  ChatBubbleLeftEllipsisIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import {
  ArrowTrendingUpIcon,
  FireIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { cx } from "class-variance-authority";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Feed } from "../components/Feed";
import type { FeedOrder } from "../types";
import { api } from "../utils/api";

interface Tabs {
  name: string;
  href: string;
  order: FeedOrder;
  current: boolean;
}

const navigation = [
  { name: "Home", href: "#", icon: HomeIcon, current: true },
  { name: "Popular", href: "#", icon: FireIcon, current: false },
  { name: "Communities", href: "#", icon: UserGroupIcon, current: false },
  { name: "Trending", href: "#", icon: ArrowTrendingUpIcon, current: false },
  { name: "Favorites", href: "#", icon: StarIcon, current: false },
];

const tabs = [
  { name: "Recent", href: "/recent", order: "desc", current: true },
  { name: "Popular", href: "/popular", order: "likes", current: false },
  { name: "Map", href: "/map", order: "asc", current: false },
] satisfies Tabs[];

const whoToFollow = [
  {
    name: "Leonard Krasner",
    handle: "leonardkrasner",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  // More people...
];

const trendingPosts = [
  {
    id: 1,
    user: {
      name: "Floyd Miles",
      imageUrl:
        "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    body: "What books do you have on your bookshelf just to look smarter than you actually are?",
    comments: 291,
  },
  // More posts...
];

export default function PinsHomepage() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]?.order);
  const communities = api.community.all.useQuery(undefined, {
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
      <div className="hidden lg:col-span-3 lg:block xl:col-span-2">
        <nav
          aria-label="Sidebar"
          className="sticky top-4 divide-y divide-gray-300 dark:divide-gray-700"
        >
          <div className="space-y-1 pb-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cx(
                  item.current
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                <item.icon
                  className={cx(
                    item.current
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-gray-400 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400",
                    "-ml-1 mr-3 h-6 w-6 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </a>
            ))}
          </div>
          <div className="pt-10">
            <p
              className="px-3 text-sm font-medium text-gray-500"
              id="communities-headline"
            >
              Communities
            </p>
            <div
              className="mt-3 space-y-2"
              aria-labelledby="communities-headline"
            >
              <a
                href="/communities/all"
                className="group flex items-center rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900"
              >
                <span className="truncate">All</span>
              </a>
              {communities.data?.map((community) => {
                return (
                  <a
                    key={community.name}
                    href={community.slug}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <span className="truncate">{community.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
      <main className="lg:col-span-9 xl:col-span-6">
        {/* <div className="px-4 sm:px-0"> */}
        <div className="sm:hidden">
          <label htmlFor="question-tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="question-tabs"
            className="block w-full rounded-md border-gray-300 text-base font-medium text-gray-900 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            defaultValue={tabs.find((tab) => tab.current)?.name}
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <Tab.Group onChange={(index) => setSelectedTab(tabs[index]?.order)}>
          <div className="hidden px-4 sm:block sm:px-0">
            <Tab.List
              as="nav"
              className="isolate flex divide-x divide-gray-200 rounded-lg shadow dark:divide-gray-700"
              aria-label="Tabs"
            >
              {tabs.map((tab, tabIdx) => (
                <Tab as={Fragment} key={tab.name}>
                  {({ selected }) => (
                    <span
                      className={cx(
                        selected
                          ? "text-gray-900 dark:text-gray-50"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                        tabIdx === 0 ? "rounded-l-lg" : "",
                        tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                        "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 dark:bg-gray-800 dark:hover:bg-gray-700"
                      )}
                    >
                      <span>{tab.name}</span>
                      <span
                        aria-hidden="true"
                        className={cx(
                          selected ? "bg-rose-500" : "bg-transparent",
                          "absolute inset-x-0 bottom-0 h-0.5"
                        )}
                      />
                    </span>
                  )}
                </Tab>
              ))}
            </Tab.List>
          </div>
          <Tab.Panels as="div" className="mt-4">
            <h1 className="sr-only">Recent questions</h1>
            <Tab.Panel as="ul" className="space-y-4">
              <Feed order={selectedTab} />
            </Tab.Panel>
            <Tab.Panel as="ul" className="space-y-4">
              <Feed order={selectedTab} />
            </Tab.Panel>
            <Tab.Panel as="ul" className="space-y-4">
              <Feed order={selectedTab} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
      <aside className="hidden xl:col-span-4 xl:block">
        <div className="sticky top-4 space-y-4">
          <section aria-labelledby="who-to-follow-heading">
            <div className="rounded-lg bg-white shadow dark:bg-gray-800">
              <div className="p-6">
                <h2
                  id="who-to-follow-heading"
                  className="text-base font-medium text-gray-900 dark:text-gray-50"
                >
                  Who to follow
                </h2>
                <div className="mt-6 flow-root">
                  <ul className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
                    {whoToFollow.map((user) => (
                      <li
                        key={user.handle}
                        className="flex items-center space-x-3 py-4"
                      >
                        <div className="flex-shrink-0">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.imageUrl}
                            alt=""
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                            <a href={user.href}>{user.name}</a>
                          </p>
                          <p className="text-sm text-gray-500">
                            <a href={user.href}>{"@" + user.handle}</a>
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            className={cx(
                              "inline-flex items-center rounded-full bg-rose-50 px-3 py-0.5 text-sm font-medium text-rose-700",
                              "hover:bg-rose-100",
                              "dark:bg-rose-700 dark:text-rose-50 dark:hover:bg-rose-600"
                            )}
                          >
                            <PlusIcon
                              className="-ml-1 mr-0.5 h-5 w-5 text-rose-400 dark:text-rose-300"
                              aria-hidden="true"
                            />
                            <span>Follow</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <Link
                    href="#"
                    className={cx(
                      "block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm",
                      "hover:bg-gray-50",
                      "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600"
                    )}
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <section aria-labelledby="trending-heading">
            <div className="rounded-lg bg-white shadow">
              <div className="p-6">
                <h2
                  id="trending-heading"
                  className="text-base font-medium text-gray-900"
                >
                  Trending
                </h2>
                <div className="mt-6 flow-root">
                  <ul className="-my-4 divide-y divide-gray-200">
                    {trendingPosts.map((post) => (
                      <li key={post.id} className="flex space-x-3 py-4">
                        <div className="flex-shrink-0">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={post.user.imageUrl}
                            alt={post.user.name}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800">{post.body}</p>
                          <div className="mt-2 flex">
                            <span className="inline-flex items-center text-sm">
                              <button
                                type="button"
                                className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
                              >
                                <ChatBubbleLeftEllipsisIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                                <span className="font-medium text-gray-900">
                                  {post.comments}
                                </span>
                              </button>
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <a
                    href="#"
                    className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    View all
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

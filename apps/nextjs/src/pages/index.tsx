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
} from "@heroicons/react/20/solid";
import { cx } from "class-variance-authority";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Feed } from "../components/Feed";
import type { FeedOrder } from "../types";

interface Tabs {
  name: string;
  href: string;
  order: FeedOrder;
  current: boolean;
}

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

  return (
    <>
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
                          ? "text-gray-900 dark:text-slate-50"
                          : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200",
                        tabIdx === 0 ? "rounded-l-lg" : "",
                        tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                        "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 dark:bg-slate-800 dark:hover:bg-slate-700",
                        "focus-visible:outline-0",
                      )}
                    >
                      <span>{tab.name}</span>
                      <span
                        aria-hidden="true"
                        className={cx(
                          selected ? "bg-rose-500" : "bg-transparent",
                          "absolute inset-x-0 bottom-0 h-0.5",
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
            <div className="rounded-lg bg-white shadow dark:border dark:border-slate-700 dark:bg-slate-800">
              <div className="p-6">
                <h2
                  id="who-to-follow-heading"
                  className="text-base font-medium text-slate-900 dark:text-slate-50"
                >
                  Who to follow
                </h2>
                <div className="mt-6 flow-root">
                  <ul className="-my-4 divide-y divide-slate-200 dark:divide-slate-700">
                    {whoToFollow.map((user) => (
                      <li
                        key={user.handle}
                        className="flex items-center space-x-3 py-4"
                      >
                        <div className="flex-shrink-0">
                          {/* TODO: use next/image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.imageUrl}
                            alt=""
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            <a href={user.href}>{user.name}</a>
                          </p>
                          <p className="text-sm text-slate-500">
                            <a href={user.href}>{"@" + user.handle}</a>
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            className={cx(
                              "inline-flex items-center rounded-full bg-rose-50 px-3 py-0.5 text-sm font-medium text-rose-700",
                              "hover:bg-rose-100",
                              "dark:bg-rose-700 dark:text-rose-50 dark:hover:bg-rose-600",
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
                      "block w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-sm",
                      "hover:bg-slate-50",
                      "dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600",
                    )}
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <section aria-labelledby="trending-heading">
            <div className="rounded-lg bg-white shadow dark:border dark:border-slate-700 dark:bg-slate-800">
              <div className="p-6">
                <h2
                  id="trending-heading"
                  className="text-base font-medium text-slate-900 dark:text-slate-50"
                >
                  Trending
                </h2>
                <div className="mt-6 flow-root">
                  <ul className="-my-4 divide-y divide-slate-200 dark:divide-slate-700">
                    {trendingPosts.map((post) => (
                      <li key={post.id} className="flex space-x-3 py-4">
                        <div className="flex-shrink-0">
                          {/* TODO: use next/image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="h-8 w-8 rounded-full"
                            src={post.user.imageUrl}
                            alt={post.user.name}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-800 dark:text-slate-50">
                            {post.body}
                          </p>
                          <div className="mt-2 flex">
                            <span className="inline-flex items-center text-sm">
                              <button
                                type="button"
                                className="inline-flex space-x-2 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
                              >
                                <ChatBubbleLeftEllipsisIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                                <span className="font-medium text-slate-900 dark:text-slate-50">
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
                  <Link
                    href="#"
                    className={cx(
                      "block w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-sm",
                      "hover:bg-slate-50",
                      "dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600",
                    )}
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

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
  ChatBubbleLeftEllipsisIcon,
  CodeBracketIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FlagIcon,
  HandThumbUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
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
import { Fragment, useState } from "react";
import { Layout } from "../components/Layout";
import { Sidebar } from "../components/Sidebar";
import { trpc } from "../utils/trpc";

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
const tabs = [
  { name: "Recent", href: "#", current: true },
  { name: "Map", href: "#", current: false },
  { name: "Most Answers", href: "#", current: false },
];
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

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pins = trpc.pin.all.useQuery();
  const pinsQuery = trpc.pin.infinite.useInfiniteQuery(
    { limit: 5 },
    {
      getPreviousPageParam(lastPage) {
        return lastPage.nextCursor;
      },
    }
  );
  const communities = trpc.community.all.useQuery();

  const { data: session } = trpc.auth.getSession.useQuery();
  const utils = trpc.useContext();

  const likePin = trpc.pin.like.useMutation({
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.pin.all.invalidate();
    },
    async onMutate(id) {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.pin.all.cancel();

      // Get the data from the queryCache
      const prevData = utils.pin.all.getData();

      /**
       * find the pin and increment the likes by one
       * Then optimistically update the data with the new like
       * If the pin is already liked, subtract one from the likes
       */
      utils.pin.all.setData(undefined, (old) => {
        // if the user has already liked the pin, subtract one from the likes
        if (
          old
            ?.find((pin) => pin.id === id)
            ?.likedBy.find((user) => user.id === session?.user.id)
        ) {
          return old?.map((pin) => {
            if (pin.id === id) {
              return {
                ...pin,
                _count: {
                  likedBy: pin._count.likedBy - 1,
                },
              };
            }

            return pin;
          });
        }

        return old?.map((pin) => {
          if (pin.id === id) {
            return {
              ...pin,
              _count: {
                likedBy: pin._count.likedBy + 1,
              },
            };
          }

          return pin;
        });
      });

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPin, context) {
      // If the mutation fails, use the context-value from onMutate
      utils.pin.all.setData(undefined, context?.prevData);
    },
  });

  const deletePin = trpc.pin.delete.useMutation({
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.pin.all.invalidate();
    },
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
          className="sticky top-4 divide-y divide-gray-300"
        >
          <div className="space-y-1 pb-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cx(
                  item.current
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                <item.icon
                  className={cx(
                    item.current
                      ? "text-gray-500"
                      : "text-gray-400 group-hover:text-gray-500",
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
        <div className="px-4 sm:px-0">
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
          <div className="hidden sm:block">
            <nav
              className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
              aria-label="Tabs"
            >
              {tabs.map((tab, tabIdx) => (
                <a
                  key={tab.name}
                  href={tab.href}
                  aria-current={tab.current ? "page" : undefined}
                  className={cx(
                    tab.current
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700",
                    tabIdx === 0 ? "rounded-l-lg" : "",
                    tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                    "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-center text-sm font-medium hover:bg-gray-50 focus:z-10"
                  )}
                >
                  <span>{tab.name}</span>
                  <span
                    aria-hidden="true"
                    className={cx(
                      tab.current ? "bg-rose-500" : "bg-transparent",
                      "absolute inset-x-0 bottom-0 h-0.5"
                    )}
                  />
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="sr-only">Recent questions</h1>
          <ul className="space-y-4">
            {pins.data?.map((pin) => (
              <li
                key={pin.id}
                className="bg-white px-4 py-6 shadow sm:rounded-lg sm:p-6"
              >
                <article aria-labelledby={`question-title-${pin.id}`}>
                  {pin.image ? (
                    <img src={pin.image.src} alt="" className="rounded-md" />
                  ) : null}
                  <div className={cx(pin.image ? "mt-5" : null)}>
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={pin.user?.image?.src}
                          alt=""
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          <a
                            // TODO: Fix this
                            href={pin.user?.href || "#"}
                            className="hover:underline"
                          >
                            {pin.user?.displayName}
                          </a>
                        </p>
                        <p className="text-sm text-gray-500">
                          <a href={pin.href} className="hover:underline">
                            <time dateTime={pin.createdAt.toLocaleDateString()}>
                              {pin.createdAt.toLocaleDateString()}
                            </time>
                          </a>
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 self-center">
                        <Menu
                          as="div"
                          className="relative inline-block text-left"
                        >
                          <div>
                            <Menu.Button className="-m-2 flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600">
                              <span className="sr-only">Open options</span>
                              <EllipsisVerticalIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
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
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      className={cx(
                                        active
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700",
                                        "flex w-full px-4 py-2 text-sm"
                                      )}
                                    >
                                      <StarIcon
                                        className="mr-3 h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                      />
                                      <span>Add to favorites</span>
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <a
                                      href="#"
                                      className={cx(
                                        active
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700",
                                        "flex px-4 py-2 text-sm"
                                      )}
                                    >
                                      <CodeBracketIcon
                                        className="mr-3 h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                      />
                                      <span>Embed</span>
                                    </a>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <a
                                      href="#"
                                      className={cx(
                                        active
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700",
                                        "flex px-4 py-2 text-sm"
                                      )}
                                    >
                                      <FlagIcon
                                        className="mr-3 h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                      />
                                      <span>Report content</span>
                                    </a>
                                  )}
                                </Menu.Item>
                                {/* only show delete option on user's pins */}
                                {session?.user.id === pin.user?.id ? (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => deletePin.mutate(pin.id)}
                                        className={cx(
                                          active
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-700",
                                          "flex w-full px-4 py-2 text-sm"
                                        )}
                                      >
                                        <TrashIcon
                                          className="mr-3 h-5 w-5 text-gray-400"
                                          aria-hidden="true"
                                        />
                                        <span>Delete</span>
                                      </button>
                                    )}
                                  </Menu.Item>
                                ) : null}
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-4 text-sm text-gray-700"
                    // className="mt-2 space-y-4 text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: pin.description || "",
                    }}
                  />
                  <div className="mt-6 flex justify-between space-x-8">
                    <div className="flex space-x-6">
                      <span className="inline-flex items-center text-sm">
                        {/* TODO: apply a background to the button if a pin is already liked */}
                        <button
                          type="button"
                          className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
                          onClick={() => likePin.mutate(pin.id)}
                        >
                          <HandThumbUpIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                          <span className="font-medium text-gray-900">
                            {pin._count.likedBy}
                          </span>
                          <span className="sr-only">likes</span>
                        </button>
                      </span>
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
                            {pin.comments.length}
                          </span>
                          <span className="sr-only">replies</span>
                        </button>
                      </span>
                      <span className="inline-flex items-center text-sm">
                        <button
                          type="button"
                          className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
                        >
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="font-medium text-gray-900">
                            {pin.views}
                          </span>
                          <span className="sr-only">views</span>
                        </button>
                      </span>
                    </div>
                    <div className="flex text-sm">
                      <span className="inline-flex items-center text-sm">
                        <button
                          type="button"
                          className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
                        >
                          <ShareIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="font-medium text-gray-900">
                            Share
                          </span>
                        </button>
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <aside className="hidden xl:col-span-4 xl:block">
        <div className="sticky top-4 space-y-4">
          <section aria-labelledby="who-to-follow-heading">
            <div className="rounded-lg bg-white shadow">
              <div className="p-6">
                <h2
                  id="who-to-follow-heading"
                  className="text-base font-medium text-gray-900"
                >
                  Who to follow
                </h2>
                <div className="mt-6 flow-root">
                  <ul role="list" className="-my-4 divide-y divide-gray-200">
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
                          <p className="text-sm font-medium text-gray-900">
                            <a href={user.href}>{user.name}</a>
                          </p>
                          <p className="text-sm text-gray-500">
                            <a href={user.href}>{"@" + user.handle}</a>
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            className="inline-flex items-center rounded-full bg-rose-50 px-3 py-0.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                          >
                            <PlusIcon
                              className="-ml-1 mr-0.5 h-5 w-5 text-rose-400"
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
                  <ul role="list" className="-my-4 divide-y divide-gray-200">
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

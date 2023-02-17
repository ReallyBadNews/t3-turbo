import { Menu, Transition } from "@headlessui/react";
import {
  ChatBubbleLeftEllipsisIcon,
  CodeBracketIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FlagIcon,
  HandThumbUpIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { cx } from "class-variance-authority";
import Link from "next/link";
import { forwardRef, Fragment } from "react";
import type { FeedOrder, Pin } from "../types";
import { api } from "../utils/api";
import { Image } from "./Image";

interface PinProps {
  data: Pin;
  order?: FeedOrder;
}

export const PinPost = forwardRef<HTMLLIElement, PinProps>(
  ({ data, order }, ref) => {
    const { data: session } = api.auth.getSession.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });
    const utils = api.useContext();

    const likePin = api.pin.like.useMutation({
      async onSettled() {
        // Sync with server once mutation has settled
        await utils.pin.infinite.invalidate();
      },
      async onMutate(id) {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await utils.pin.infinite.cancel();

        // Get the data from the queryCache
        const prevData = utils.pin.infinite.getData({ limit: 10, order });

        /**
         * find the pin and increment the likes by one in the infinite query
         * Then optimistically update the data with the new like
         * If the pin is already liked, subtract one from the likes
         */
        utils.pin.infinite.setInfiniteData({ limit: 10, order }, (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const likedByUser = data.likedBy.some(
            (user) => user.id === session?.user.id,
          );

          return {
            ...old,
            pages: old.pages.map((page) => {
              // if the user has already liked the pin, subtract one from the likes
              if (likedByUser) {
                return {
                  ...page,
                  pins: page.pins.map((pin) => {
                    if (pin.id === id) {
                      return {
                        ...pin,
                        likedBy: pin.likedBy.filter(
                          (user) => user.id !== session?.user.id,
                        ),
                        _count: {
                          likedBy: pin._count.likedBy - 1,
                        },
                      };
                    }

                    return pin;
                  }),
                };
              } else {
                return {
                  ...page,
                  pins: page.pins.map((pin) => {
                    if (pin.id === id) {
                      return {
                        ...pin,
                        likedBy: [
                          ...pin.likedBy,
                          {
                            id:
                              session?.user.id ||
                              Math.floor(Math.random() * 10000).toString(),
                          },
                        ],
                        _count: {
                          likedBy: pin._count.likedBy + 1,
                        },
                      };
                    }

                    return pin;
                  }),
                };
              }
            }),
          };
        });

        // Return the previous data so we can revert if something goes wrong
        return { prevData };
      },
      onError(err, newPin) {
        // If the mutation fails, use the context-value from onMutate
        utils.pin.infinite.setInfiniteData({ limit: 10 }, (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          return {
            ...old,
            pages: old.pages.map((page) => {
              return {
                ...page,
                pins: page.pins.map((pin) => {
                  if (pin.id === newPin) {
                    return {
                      ...pin,
                      likedBy: pin.likedBy.filter(
                        (user) => user.id !== session?.user.id,
                      ),
                      _count: {
                        likedBy: pin._count.likedBy - 1,
                      },
                    };
                  }

                  return pin;
                }),
              };
            }),
          };
        });
      },
      onSuccess: async () => {
        // Invalidate and refetch
        await utils.pin.infinite.invalidate();
      },
    });

    const deletePin = api.pin.delete.useMutation({
      async onSettled() {
        // Sync with server once mutation has settled
        await utils.pin.infinite.invalidate();
      },
    });

    return (
      <li
        ref={ref}
        className="bg-white px-4 py-6 shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg sm:p-6"
      >
        <article aria-labelledby={`pin-post-${data.id}`}>
          {data.image ? (
            <Image
              src={data.image.publicId}
              width={data.image.width}
              height={data.image.height}
              blurDataURL={data.image.blurDataURL}
              placeholder="blur"
              alt=""
              className="rounded-md"
            />
          ) : null}
          <div className={cx(data.image ? "mt-5" : null)}>
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <Image
                  className="h-10 w-10 rounded-full"
                  // FIXME: this should exist for every user, or be the default
                  src={data.user?.image?.publicId as string}
                  width={40}
                  height={40}
                  blurDataURL={data.user?.image?.blurDataURL}
                  alt=""
                  placeholder="blur"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  <Link
                    // FIXME: The user should always be defined for a pin
                    href={`/user/${data.user?.id as string}`}
                    className="hover:underline"
                  >
                    {data.user?.displayName}
                  </Link>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-600">
                  {/* // FIXME: The user should always be defined for a pin */}
                  <Link
                    href={`/pins/${data.user?.id as string}/${data.id}`}
                    className="hover:underline"
                  >
                    <time dateTime={data.createdAt.toLocaleDateString()}>
                      {data.createdAt.toLocaleDateString()}
                    </time>
                  </Link>
                </p>
              </div>
              <div className="flex flex-shrink-0 self-center">
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="-m-2 flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400">
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
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={cx(
                                active
                                  ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50"
                                  : "text-gray-700 dark:text-gray-200",
                                "flex w-full px-4 py-2 text-sm",
                              )}
                            >
                              <StarIcon
                                className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                                aria-hidden="true"
                              />
                              <span>Add to favorites</span>
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="#"
                              className={cx(
                                active
                                  ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50"
                                  : "text-gray-700 dark:text-gray-200",
                                "flex w-full px-4 py-2 text-sm",
                              )}
                            >
                              <CodeBracketIcon
                                className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                                aria-hidden="true"
                              />
                              <span>Embed</span>
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="#"
                              className={cx(
                                active
                                  ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50"
                                  : "text-gray-700 dark:text-gray-200",
                                "flex w-full px-4 py-2 text-sm",
                              )}
                            >
                              <FlagIcon
                                className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                                aria-hidden="true"
                              />
                              <span>Report content</span>
                            </Link>
                          )}
                        </Menu.Item>
                        {/* only show delete option on user's pins */}
                        {session?.user.id === data.user?.id ? (
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => deletePin.mutate(data.id)}
                                className={cx(
                                  active
                                    ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50"
                                    : "text-gray-700 dark:text-gray-200",
                                  "flex w-full px-4 py-2 text-sm",
                                )}
                              >
                                <TrashIcon
                                  className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
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
            className="mt-4 text-sm text-gray-700 dark:text-gray-200"
            dangerouslySetInnerHTML={{
              __html: data.description || "",
            }}
          />
          <div className="mt-6 flex justify-between space-x-8">
            <div className="flex space-x-6">
              <span className="inline-flex items-center text-sm">
                {/* TODO: apply a background to the button if a pin is already liked */}
                <button
                  type="button"
                  className="inline-flex space-x-2 text-gray-400 hover:text-gray-500 dark:text-gray-600"
                  onClick={() => likePin.mutate(data.id)}
                >
                  <HandThumbUpIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="dark:text-gray csaq-50 font-medium text-gray-900 dark:text-gray-50">
                    {data._count.likedBy}
                  </span>
                  <span className="sr-only">likes</span>
                </button>
              </span>
              <span className="inline-flex items-center text-sm">
                <button
                  type="button"
                  className="inline-flex space-x-2 text-gray-400 hover:text-gray-500 dark:text-gray-600"
                >
                  <ChatBubbleLeftEllipsisIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                  <span className="dark:text-gray csaq-50 font-medium text-gray-900 dark:text-gray-50">
                    {data.comments.length}
                  </span>
                  <span className="sr-only">replies</span>
                </button>
              </span>
              <span className="inline-flex items-center text-sm">
                <button
                  type="button"
                  className="inline-flex space-x-2 text-gray-400 hover:text-gray-500 dark:text-gray-600"
                >
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="dark:text-gray csaq-50 font-medium text-gray-900 dark:text-gray-50">
                    {data.views}
                  </span>
                  <span className="sr-only">views</span>
                </button>
              </span>
            </div>
            <div className="flex text-sm">
              <span className="inline-flex items-center text-sm">
                <button
                  type="button"
                  className="inline-flex space-x-2 text-gray-400 hover:text-gray-500 dark:text-gray-600"
                >
                  <ShareIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium text-gray-900 dark:text-gray-50">
                    Share
                  </span>
                </button>
              </span>
            </div>
          </div>
        </article>
      </li>
    );
  },
);

PinPost.displayName = "Pin";

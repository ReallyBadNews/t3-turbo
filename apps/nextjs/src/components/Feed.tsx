import type { AppRouter } from "@badnews/api";
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
import type { inferProcedureInput } from "@trpc/server";
import { cx } from "class-variance-authority";
import Link from "next/link";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Image } from "../components/Image";
import { trpc } from "../utils/trpc";

type FeedOrder = inferProcedureInput<AppRouter["pin"]["infinite"]>["order"];

interface FeedProps {
  order: FeedOrder;
}

export const Feed = ({ order }: FeedProps) => {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = trpc.pin.infinite.useInfiniteQuery(
    { limit: 10, order },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const { data: session } = trpc.auth.getSession.useQuery();
  const utils = trpc.useContext();

  const likePin = trpc.pin.like.useMutation({
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.pin.infinite.invalidate();
    },
    async onMutate(id) {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.pin.infinite.cancel();

      // Get the data from the queryCache
      const prevData = utils.pin.infinite.getData();

      /**
       * find the pin and increment the likes by one in the infinite query
       * Then optimistically update the data with the new like
       * If the pin is already liked, subtract one from the likes
       */
      utils.pin.infinite.setInfiniteData({ limit: 10 }, (old) => {
        if (!old) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const pinLikeByUser = data?.pages.some((page) => {
          return page.pins
            .find((pin) => pin.id === id)
            ?.likedBy?.find((user) => user.id === session?.user.id);
        });

        return {
          ...old,
          pages: old.pages.map((page) => {
            // if the user has already liked the pin, subtract one from the likes
            if (pinLikeByUser) {
              return {
                ...page,
                pins: page.pins.map((pin) => {
                  if (pin.id === id) {
                    return {
                      ...pin,
                      likedBy: pin.likedBy.filter(
                        (user) => user.id !== session?.user.id
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
                      (user) => user.id !== session?.user.id
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

  const deletePin = trpc.pin.delete.useMutation({
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.pin.infinite.invalidate();
    },
  });

  useEffect(() => {
    const fetchPage = async () => {
      await fetchNextPage();
    };
    if (inView) {
      fetchPage().catch((err) => {
        console.error(err);
      });
    }
  }, [fetchNextPage, inView]);

  return (
    <>
      {status === "loading" ? (
        // map over 7 items to create the loading skeleton
        Array.from({ length: 7 }).map((_, index) => (
          <li
            key={index}
            className="min-h-[188px] bg-white px-4 py-6 shadow sm:rounded-lg sm:p-6"
          />
        ))
      ) : status === "error" ? (
        <p>{`Error: ${error.message}`}</p>
      ) : (
        <>
          {data.pages.map((group, index) => (
            <Fragment key={index}>
              {group.pins.map((pin) => (
                <li
                  key={pin.id}
                  className="bg-white px-4 py-6 shadow sm:rounded-lg sm:p-6"
                >
                  <article aria-labelledby={`question-title-${pin.id}`}>
                    {pin.image ? (
                      <Image
                        src={pin.image.publicId}
                        width={pin.image.width}
                        height={pin.image.height}
                        blurDataURL={pin.image.blurDataURL}
                        placeholder="blur"
                        alt=""
                        className="rounded-md"
                      />
                    ) : null}
                    <div className={cx(pin.image ? "mt-5" : null)}>
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <Image
                            className="h-10 w-10 rounded-full"
                            // FIXME: this should exist for every user, or be the default
                            src={pin.user?.image?.publicId as string}
                            width={40}
                            height={40}
                            blurDataURL={pin.user?.image?.blurDataURL}
                            alt=""
                            placeholder="blur"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            <Link
                              // FIXME: The user should always be defined for a pin
                              href={`/user/${pin.user?.id as string}`}
                              className="hover:underline"
                            >
                              {pin.user?.displayName}
                            </Link>
                          </p>
                          <p className="text-sm text-gray-500">
                            {/* // FIXME: The user should always be defined for a pin */}
                            <Link
                              href={`/pins/${pin.user?.id as string}/${pin.id}`}
                              className="hover:underline"
                            >
                              <time
                                dateTime={pin.createdAt.toLocaleDateString()}
                              >
                                {pin.createdAt.toLocaleDateString()}
                              </time>
                            </Link>
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
                                      <Link
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
                                      </Link>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <Link
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
                                      </Link>
                                    )}
                                  </Menu.Item>
                                  {/* only show delete option on user's pins */}
                                  {session?.user.id === pin.user?.id ? (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() =>
                                            deletePin.mutate(pin.id)
                                          }
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
            </Fragment>
          ))}
          {isFetching && !isFetchingNextPage ? (
            <li className="bg-white px-4 py-6 text-center shadow sm:rounded-lg sm:p-6">
              Background Updating...
            </li>
          ) : (
            <li className="bg-white px-4 py-6 text-center shadow sm:rounded-lg sm:p-6">
              <button
                ref={ref}
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? "Loading more..."
                  : hasNextPage
                  ? "Load Newer"
                  : "Nothing more to load"}
              </button>
            </li>
          )}
        </>
      )}
    </>
  );
};

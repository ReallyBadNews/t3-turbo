import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { FeedOrder } from "../types";
import { api } from "../utils/api";
import { PinPost } from "./Pin";

interface FeedProps {
  order: FeedOrder;
}

export const Feed = ({ order = "desc" }: FeedProps) => {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = api.pin.infinite.useInfiniteQuery(
    { limit: 10, order },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

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
            className="min-h-[188px] bg-white px-4 py-6 shadow dark:bg-gray-800 sm:rounded-lg sm:p-6"
          />
        ))
      ) : status === "error" ? (
        <p>{`Error: ${error.message}`}</p>
      ) : (
        <>
          {data.pages.map((group, index) => (
            <Fragment key={index}>
              {group.pins.map((pin, pinIdx) => (
                <PinPost
                  key={pin.id}
                  data={pin}
                  order={order}
                  ref={pinIdx === group.pins.length - 2 ? ref : undefined}
                />
              ))}
            </Fragment>
          ))}
          {isFetching && !isFetchingNextPage ? (
            <li className="bg-white px-4 py-6 text-center shadow dark:bg-gray-800 dark:text-gray-200 sm:rounded-lg sm:p-6">
              Background Updating...
            </li>
          ) : (
            <li className="bg-white px-4 py-6 text-center shadow dark:bg-gray-800 dark:text-gray-200 sm:rounded-lg sm:p-6">
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

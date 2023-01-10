import type { AppRouter } from "@badnews/api";
import type { inferProcedureInput } from "@trpc/server";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { trpc } from "../utils/trpc";
import { PinPost } from "./Pin";

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
                  <PinPost data={pin} />
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

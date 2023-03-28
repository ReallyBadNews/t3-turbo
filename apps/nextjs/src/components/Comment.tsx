import { Listbox, Transition } from "@headlessui/react";
import {
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { cx } from "class-variance-authority";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { api, type RouterInputs } from "../utils/api";

const moods = [
  {
    name: "Excited",
    value: "excited",
    icon: FireIcon,
    iconColor: "text-white",
    bgColor: "bg-red-500",
  },
  {
    name: "Loved",
    value: "loved",
    icon: HeartIcon,
    iconColor: "text-white",
    bgColor: "bg-pink-400",
  },
  {
    name: "Happy",
    value: "happy",
    icon: FaceSmileIcon,
    iconColor: "text-white",
    bgColor: "bg-green-400",
  },
  {
    name: "Sad",
    value: "sad",
    icon: FaceFrownIcon,
    iconColor: "text-white",
    bgColor: "bg-yellow-400",
  },
  {
    name: "Thumbsy",
    value: "thumbsy",
    icon: HandThumbUpIcon,
    iconColor: "text-white",
    bgColor: "bg-blue-500",
  },
  {
    name: "I feel nothing",
    value: null,
    icon: XMarkIcon,
    iconColor: "text-gray-400",
    bgColor: "bg-transparent",
  },
];

interface CommentProps {
  pinId: string;
  userId: string;
}

type FormData = RouterInputs["pin"]["comment"];

// TODO: add error handling and validation
export function Comment({ pinId, userId }: CommentProps) {
  const [selected, setSelected] = useState(moods[5]);

  const {
    handleSubmit,
    register,
    reset,
    // formState: { errors },
  } = useForm<FormData>();

  const utils = api.useContext();

  const { mutate, isLoading } = api.pin.comment.useMutation({
    async onSuccess() {
      await utils.pin.infinite.invalidate();
      reset();
    },
  });

  function onSubmit(data: FormData) {
    mutate({
      pinId,
      userId,
      content: data.content,
    });
  }

  // const submitHandler: React.FormEventHandler<HTMLFormElement> = (event) => {
  //   event.preventDefault();
  //   const target = event.target as typeof event.target & {
  //     comment: { value: string };
  //   };
  //   const comment = target.comment.value;
  //   mutate({ pinId, userId, content: comment });
  // };

  return (
    <div className="min-w-0 flex-1 rounded-md bg-slate-50 dark:bg-slate-800">
      <form action="#" className="relative" onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-slate-600 dark:ring-gray-600 dark:focus-within:ring-slate-400">
          <label htmlFor="comment" className="sr-only">
            Add your comment
          </label>
          <textarea
            rows={3}
            className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-50 sm:py-1.5 sm:text-sm sm:leading-6"
            placeholder="Add your comment..."
            // defaultValue={""}
            {...register("content", {
              required: "Comment is required",
              minLength: {
                value: 3,
                message: "Comment must be at least 3 characters",
              },
            })}
          />

          {/* Spacer element to match the height of the toolbar */}
          <div className="py-2" aria-hidden="true">
            {/* Matches height of button in toolbar (1px border + 36px content height) */}
            <div className="py-px">
              <div className="h-9" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex items-center space-x-5">
            <div className="flex items-center">
              <button
                type="button"
                className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
              >
                <PaperClipIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Attach a file</span>
              </button>
            </div>
            <div className="flex items-center">
              <Listbox value={selected} onChange={setSelected}>
                {({ open }) => (
                  <>
                    <Listbox.Label className="sr-only">Your mood</Listbox.Label>
                    <div className="relative">
                      <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                        <span className="flex items-center justify-center">
                          {selected.value === null ? (
                            <span>
                              <FaceSmileIcon
                                className="h-5 w-5 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <span className="sr-only"> Add your mood </span>
                            </span>
                          ) : (
                            <span>
                              <span
                                className={cx(
                                  selected.bgColor,
                                  "flex h-8 w-8 items-center justify-center rounded-full",
                                )}
                              >
                                <selected.icon
                                  className="h-5 w-5 flex-shrink-0 text-white"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="sr-only">{selected.name}</span>
                            </span>
                          )}
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 -ml-6 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                          {moods.map((mood) => (
                            <Listbox.Option
                              key={mood.value}
                              className={({ active }) =>
                                cx(
                                  active ? "bg-gray-100" : "bg-white",
                                  "relative cursor-default select-none py-2 px-3",
                                )
                              }
                              value={mood}
                            >
                              <div className="flex items-center">
                                <div
                                  className={cx(
                                    mood.bgColor,
                                    "flex h-8 w-8 items-center justify-center rounded-full",
                                  )}
                                >
                                  <mood.icon
                                    className={cx(
                                      mood.iconColor,
                                      "h-5 w-5 flex-shrink-0",
                                    )}
                                    aria-hidden="true"
                                  />
                                </div>
                                <span className="ml-3 block truncate font-medium">
                                  {mood.name}
                                </span>
                              </div>
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import type {
  ChangeEventHandler,
  Dispatch,
  DragEventHandler,
  FormEventHandler,
  SetStateAction,
} from "react";
import { useState, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  InformationCircleIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import { trpc } from "../utils/trpc";
import { cx } from "class-variance-authority";
import { Combobox } from "./Combobox";
import type { Community } from "@badnews/db";

export function Sidebar({
  communities,
  open,
  setOpen,
}: {
  communities?: Community[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [fileInfo, setFileInfo] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLFormElement>(null);
  const photoPreviewRef = useRef<HTMLDivElement>(null);

  const { data: session } = trpc.auth.getSession.useQuery();
  const utils = trpc.useContext();
  const create = trpc.pin.create.useMutation({
    // async onMutate(newPin) {
    //   await utils.pin.all.cancel();

    //   // Get the ddadta from the queryCache
    //   const prevData = utils.pin.all.getData();

    //   // Optimistically update the data with our new pin
    //   utils.pin.all.setData(undefined, (old) => [...(old ?? []), newPin]);

    //   // Return the previous data so we can revert if something goes wrong
    //   return { prevData };
    // },
    // onError(err, newPin, context) {
    //   // If the mutation fails, use the context-value from onMutate
    //   utils.pin.all.setData(undefined, context?.prevData);
    // },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.pin.all.invalidate();
      await utils.pin.infinite.invalidate();
    },
  });

  const submitHandler: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!session) {
      alert("You must be logged in to create a pin.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const description = formData.get("description") as string;
    const communityName = formData.get("community") as string;
    const commmunityId = communities?.find(
      (community) => community.name === communityName
    )?.id as string;

    // convert `fileInfo` to a base64 string
    const file = fileInfo
      ? await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(fileInfo);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        })
      : undefined;

    await create.mutateAsync({
      description,
      userId: session?.user.id,
      imgSrc: file,
      communityId: commmunityId,
    });

    closeHandler();
  };

  const handleFileUpload: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileInfo(file);
      const image = document.createElement("img");
      image.src = URL.createObjectURL(file);
      image.alt = file.name;
      image.className = "rounded";
      photoPreviewRef.current?.replaceWith(image);
    }
  };

  const dropHandler: DragEventHandler<HTMLFormElement> = (event) => {
    const uploadInput = fileUploadRef.current;
    event.preventDefault();
    event.stopPropagation();

    if (uploadInput && event.dataTransfer.files) {
      uploadInput.files = event.dataTransfer.files;
    }

    if (event.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file, only get the first file
      const file = event.dataTransfer.items[0]?.getAsFile();

      if (file) {
        setFileInfo(file);
        const image = document.createElement("img");
        image.src = URL.createObjectURL(file);
        image.alt = file.name;
        image.className = "rounded";
        photoPreviewRef.current?.replaceWith(image);
      }
    }
  };

  const closeHandler = () => {
    setDragActive(false);
    setOpen(false);

    // delay the duration of the animation before setting the file info to null
    setTimeout(() => {
      setFileInfo(null);
      photoPreviewRef.current?.replaceChildren();
    }, 300);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeHandler}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-100 sm:duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-100 sm:duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <form
                    ref={dropZoneRef}
                    onDrop={dropHandler}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setDragActive(false);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragActive(true);
                    }}
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    onSubmit={submitHandler}
                  >
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-medium text-white">
                            Add a New Pin
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={closeHandler}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-indigo-300">
                            Fill in the information below to add a new pin.
                            Required fields are marked with an asterisk.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pt-6 pb-5">
                            <div>
                              <label
                                htmlFor="file-upload"
                                className="sr-only text-sm font-medium text-gray-700"
                              >
                                Photo
                              </label>
                              <div
                                className={cx(
                                  "flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6",
                                  dragActive
                                    ? "border-indigo-300"
                                    : "border-gray-300"
                                )}
                              >
                                <div className="text-cente flex flex-col items-center space-y-1">
                                  <div
                                    ref={photoPreviewRef}
                                    className={cx(
                                      fileInfo ? undefined : "hidden"
                                    )}
                                  />
                                  <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <div className="flex text-sm text-gray-600">
                                    <label
                                      htmlFor="file-upload"
                                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                      <span>Upload a file</span>
                                      <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleFileUpload}
                                        ref={fileUploadRef}
                                      />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                  </p>
                                </div>
                              </div>
                            </div>
                            {fileInfo ? (
                              <div className="rounded-md bg-blue-50 p-4">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <InformationCircleIcon
                                      className="h-5 w-5 text-blue-400"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-700">
                                      File info:
                                    </p>
                                    <p className="mt-1 text-xs text-blue-700">
                                      {`Name: ${fileInfo.name}`}
                                    </p>
                                    <p className="mt-1 text-xs text-blue-700">
                                      {`Size: ${Math.round(
                                        fileInfo.size / 1000
                                      )} KB`}
                                    </p>
                                    <p className="mt-1 text-xs text-blue-700">
                                      {`Last Modified: ${new Date(
                                        fileInfo.lastModified
                                      ).toLocaleDateString()}`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                            <div>
                              <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-900"
                              >
                                Description
                              </label>
                              <div className="mt-1">
                                <textarea
                                  id="description"
                                  name="description"
                                  rows={4}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  defaultValue={""}
                                />
                              </div>
                            </div>
                            <Combobox label="Community" options={communities} />
                            <fieldset>
                              <legend className="text-sm font-medium text-gray-900">
                                Privacy
                              </legend>
                              <div className="mt-2 space-y-5">
                                <div className="relative flex items-start">
                                  <div className="absolute flex h-5 items-center">
                                    <input
                                      id="privacy-public"
                                      name="privacy"
                                      aria-describedby="privacy-public-description"
                                      type="radio"
                                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      defaultChecked
                                    />
                                  </div>
                                  <div className="pl-7 text-sm">
                                    <label
                                      htmlFor="privacy-public"
                                      className="font-medium text-gray-900"
                                    >
                                      Public access
                                    </label>
                                    <p
                                      id="privacy-public-description"
                                      className="text-gray-500"
                                    >
                                      Everyone with the link will see this
                                      project.
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <div className="relative flex items-start">
                                    <div className="absolute flex h-5 items-center">
                                      <input
                                        id="privacy-private-to-project"
                                        name="privacy"
                                        aria-describedby="privacy-private-to-project-description"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div className="pl-7 text-sm">
                                      <label
                                        htmlFor="privacy-private-to-project"
                                        className="font-medium text-gray-900"
                                      >
                                        Private to project members
                                      </label>
                                      <p
                                        id="privacy-private-to-project-description"
                                        className="text-gray-500"
                                      >
                                        Only members of this project would be
                                        able to access.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="relative flex items-start">
                                    <div className="absolute flex h-5 items-center">
                                      <input
                                        id="privacy-private"
                                        name="privacy"
                                        aria-describedby="privacy-private-to-project-description"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div className="pl-7 text-sm">
                                      <label
                                        htmlFor="privacy-private"
                                        className="font-medium text-gray-900"
                                      >
                                        Private to you
                                      </label>
                                      <p
                                        id="privacy-private-description"
                                        className="text-gray-500"
                                      >
                                        You are the only one able to access this
                                        project.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </fieldset>
                          </div>
                          <div className="pt-4 pb-6">
                            <div className="flex text-sm">
                              <a
                                href="#"
                                className="group inline-flex items-center font-medium text-indigo-600 hover:text-indigo-900"
                              >
                                <LinkIcon
                                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-900"
                                  aria-hidden="true"
                                />
                                <span className="ml-2">Copy link</span>
                              </a>
                            </div>
                            <div className="mt-4 flex text-sm">
                              <a
                                href="#"
                                className="group inline-flex items-center text-gray-500 hover:text-gray-900"
                              >
                                <QuestionMarkCircleIcon
                                  className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                                <span className="ml-2">
                                  By uploading a photo or video, you agree to
                                  our Terms of Use and Privacy Policy.
                                </span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={closeHandler}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                        disabled={create.isLoading}
                      >
                        {create.isLoading ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

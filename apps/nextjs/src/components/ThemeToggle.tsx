import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SunIcon } from "@heroicons/react/20/solid";
import { cx } from "class-variance-authority";
import { useTheme } from "next-themes";
import { Fragment } from "react";

export function ThemeToggle() {
  const { setTheme, themes, theme: activeTheme } = useTheme();

  return (
    <Listbox
      as="div"
      value={activeTheme}
      onChange={setTheme}
      className="relative"
    >
      <Listbox.Label className="sr-only">Change theme</Listbox.Label>
      <Listbox.Button
        aria-label="Change theme"
        className={cx(
          "ml-4 flex-shrink-0 rounded-full bg-white p-1 text-gray-400",
          "hover:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
          "dark:bg-gray-800 dark:hover:text-gray-300",
          "dark:focus:ring-offset-gray-900",
        )}
      >
        <SunIcon className="h-6 w-6" />
      </Listbox.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Listbox.Options className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 sm:text-sm">
          {themes.map((theme) => (
            <Listbox.Option
              key={theme}
              value={theme}
              className={({ active }) =>
                cx(
                  "relative cursor-default select-none py-2 px-3",
                  active
                    ? "bg-rose-600 text-white dark:bg-gray-700"
                    : "text-gray-900",
                  "dark:text-gray-100",
                )
              }
            >
              {({ selected }) => (
                <div className="flex gap-3">
                  <span
                    className={cx(
                      "flex items-center",
                      !selected ? "invisible" : undefined,
                    )}
                  >
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  {`${theme.charAt(0).toUpperCase()}${theme.slice(1)}`}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
}

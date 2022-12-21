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
import { useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox as HUICombobox } from "@headlessui/react";
import { cx } from "class-variance-authority";

// function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
//   return obj[key];
// }

// const x = { a: 1, b: 2, c: 3, d: 4 };

// getProperty(x, "a");
// getProperty(x, "m");

type Option = Record<string, number | string | null> & {
  id: string;
  name: string;
};

export interface ComboboxProps {
  label: string;
  options?: Option[];
}

export const Combobox = ({ label, options }: ComboboxProps) => {
  const [query, setQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState<
    ComboboxProps["options"] | null
  >(null);

  const filteredOptions =
    query === ""
      ? options
      : options?.filter((option) => {
          return option.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <HUICombobox as="div" value={selectedOption} onChange={setSelectedOption}>
      <HUICombobox.Label className="block text-sm font-medium text-gray-700">
        {label}
      </HUICombobox.Label>
      <div className="relative mt-1">
        <HUICombobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(option) => (option as unknown as Option)?.name}
          name="community"
        />
        <HUICombobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </HUICombobox.Button>

        {filteredOptions && filteredOptions.length > 0 && (
          <HUICombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option) => (
              <HUICombobox.Option
                key={option.id}
                value={option}
                className={({ active }) =>
                  cx(
                    "relative cursor-default select-none py-2 pl-8 pr-4",
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={cx(
                        "block truncate",
                        selected ? "font-semibold" : undefined
                      )}
                    >
                      {option.name}
                    </span>

                    {selected && (
                      <span
                        className={cx(
                          "absolute inset-y-0 left-0 flex items-center pl-1.5",
                          active ? "text-white" : "text-indigo-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </HUICombobox.Option>
            ))}
          </HUICombobox.Options>
        )}
      </div>
    </HUICombobox>
  );
};

import { SunIcon } from "@heroicons/react/20/solid";
import { cx } from "class-variance-authority";
import { useTheme } from "next-themes";
import type { MouseEventHandler } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleHandler: MouseEventHandler<HTMLButtonElement> = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleHandler}
      className={cx(
        "ml-4 flex-shrink-0 rounded-full bg-white p-1 text-gray-400",
        "hover:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
        "dark:bg-gray-800 dark:hover:text-gray-300",
        "dark:focus:ring-offset-gray-900",
      )}
    >
      <span className="sr-only">Change theme</span>
      <SunIcon className="h-6 w-6" />
    </button>
  );
}

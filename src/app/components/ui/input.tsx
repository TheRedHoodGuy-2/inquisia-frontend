import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border border-[#E4E7EC] dark:border-[#222229] bg-white dark:bg-[#111115] px-3.5 py-2.5 text-[14px] text-foreground transition-[color,box-shadow] outline-none",
        "placeholder:text-[#9AA0AD] dark:placeholder:text-[#4A4D5E]",
        "focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF26]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "selection:bg-[#0066FF] selection:text-white",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

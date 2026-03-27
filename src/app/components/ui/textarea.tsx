import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-[#E4E7EC] dark:border-[#222229] placeholder:text-[#9AA0AD] dark:placeholder:text-[#4A4D5E] focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF26] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-lg border bg-white dark:bg-[#111115] px-3.5 py-2.5 text-[14px] text-foreground transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

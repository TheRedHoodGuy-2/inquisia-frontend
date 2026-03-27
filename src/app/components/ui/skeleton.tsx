import * as React from "react";

import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-[#F2F4F7] dark:bg-[#18181D] skeleton-shimmer rounded-md",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

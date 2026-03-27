import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border border-[#E4E7EC] dark:border-[#222229] px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-[#111115] text-[#0A0A0F] dark:text-[#F0F0F5]",
        destructive:
          "border-[--color-danger]/30 bg-[--color-danger]/10 text-[--color-danger] [&>svg]:text-current *:data-[slot=alert-description]:text-[--color-danger]/90",
        warning:
          "border-[--color-warning]/30 bg-[--color-warning]/10 text-[--color-warning] [&>svg]:text-current *:data-[slot=alert-description]:text-[--color-warning]/90",
        success:
          "border-[--color-success]/30 bg-[--color-success]/10 text-[--color-success] [&>svg]:text-current *:data-[slot=alert-description]:text-[--color-success]/90",
        info:
          "border-[--color-info]/30 bg-[--color-info]/10 text-[--color-info] [&>svg]:text-current *:data-[slot=alert-description]:text-[--color-info]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-[#9AA0AD] dark:text-[#4A4D5E] col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

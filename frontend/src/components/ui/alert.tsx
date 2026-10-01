import * as React from "react";

import { cn } from "@/lib/utils";

function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "w-full rounded-lg border border-destructive/50 px-4 py-3 text-sm text-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Alert };

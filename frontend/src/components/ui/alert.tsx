import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("alert", className)} role="alert" {...props} />;
}

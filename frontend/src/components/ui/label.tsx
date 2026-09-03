import type { LabelHTMLAttributes } from "react";
export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="ui-label" {...props} />;
}

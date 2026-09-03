import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={`ui-button ${variant} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";

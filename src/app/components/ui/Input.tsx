import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const inputVariants = cva(
  "w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-text-tertiary",
  {
    variants: {
      variant: {
        default:
          "border-border-medium bg-background-primary text-text-primary focus:border-primary-500 focus:ring-primary-500/20",
        success:
          "border-success-500 bg-success-50 text-text-primary focus:border-success-600 focus:ring-success-500/20",
        warning:
          "border-warning-500 bg-warning-50 text-text-primary focus:border-warning-600 focus:ring-warning-500/20",
        error:
          "border-error-500 bg-error-50 text-text-primary focus:border-error-600 focus:ring-error-500/20",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const inputVariant = error ? "error" : variant;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1 text-xs text-text-secondary">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };

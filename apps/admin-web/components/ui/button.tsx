"use client";

import * as React from "react";

type ButtonVariant = "default" | "ghost";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className = "",
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<ButtonVariant, string> = {
    default: "",
    ghost: "bg-transparent hover:bg-white/5",
  };

  return <button type={type} className={`${base} ${variants[variant]} ${className}`.trim()} {...props} />;
}
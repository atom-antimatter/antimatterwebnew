"use client";
import { MouseEvent, PropsWithChildren } from "react";
import styles from "./css/Button.module.css";

interface ButtonProps extends PropsWithChildren, React.ComponentProps<"button"> {
  variant?: "primary" | "inverted";
}

const Button = ({ children, variant = "primary", ...props }: ButtonProps) => {
  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--reflextX", `${(e.clientX - rect.left) * 0.7}px`);
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${variant === "inverted" ? styles.inverted : ""}`}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

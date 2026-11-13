import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./Button.module.css";
import { Icon, type IconName } from "./Icon";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: ButtonStyleOptions = {}) {
  return [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : ""]
    .filter(Boolean)
    .join(" ");
}

type ButtonContentProps = {
  icon?: IconName;
  loading?: boolean;
  children: ReactNode;
};

function ButtonContent({ icon, loading = false, children }: ButtonContentProps) {
  return (
    <>
      {loading ? <Spinner size={16} /> : icon && <Icon name={icon} size={17} />}
      <span>{children}</span>
    </>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    ref?: Ref<HTMLButtonElement>;
    icon?: IconName;
    loading?: boolean;
  };

/** Botão padrão. `loading` mostra um indicador e desabilita o clique. */
export function Button({
  variant,
  size,
  fullWidth,
  icon,
  loading = false,
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClassName({ variant, size, fullWidth })} ${className ?? ""}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <ButtonContent icon={icon} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ButtonStyleOptions & {
  href: string;
  icon?: IconName;
  children: ReactNode;
};

/** Link com a aparência de botão (navegação entre telas). */
export function ButtonLink({ href, icon, variant, size, fullWidth, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClassName({ variant, size, fullWidth })}>
      <ButtonContent icon={icon}>{children}</ButtonContent>
    </Link>
  );
}

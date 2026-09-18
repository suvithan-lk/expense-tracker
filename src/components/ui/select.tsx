import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  children: ReactNode;
};

export function Select({ label, error, id, children, ...props }: SelectProps) {
  return (
    <label className="ui-field" htmlFor={id}>
      {label && <span>{label}</span>}
      <select className="ui-select" id={id} {...props}>{children}</select>
      {error && <small className="ui-field-error" role="alert">{error}</small>}
    </label>
  );
}

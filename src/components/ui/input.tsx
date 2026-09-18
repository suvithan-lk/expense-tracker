import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, ...props }: InputProps) {
  return (
    <label className="ui-field" htmlFor={id}>
      {label && <span>{label}</span>}
      <input className="ui-input" id={id} {...props} />
      {error && <small className="ui-field-error" role="alert">{error}</small>}
    </label>
  );
}

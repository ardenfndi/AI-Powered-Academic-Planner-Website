import { ButtonHTMLAttributes } from "react";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", type = "button", ...rest } = props;
  return <button type={type} className={`btn ${className}`} {...rest} />;
}

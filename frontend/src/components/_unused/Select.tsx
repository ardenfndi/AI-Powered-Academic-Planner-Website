import { SelectHTMLAttributes } from "react";

export default function Select(props: SelectHTMLAttributes<HTMLSelectElement>){
  const { className = "", ...rest } = props;
  return <select className={`select ${className}`} {...rest} />;
}

import type { ReactNode } from "react";

type TableProps = {
  headers: string[];
  children: ReactNode;
  caption?: string;
};

export function Table({ headers, children, caption }: TableProps) {
  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

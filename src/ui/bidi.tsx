import { Fragment } from "react";

/** Copy marks a Latin run inside an Arabic sentence with square brackets, so
 *  the punctuation around it stays put in RTL. This renders each marked run as
 *  <bdi> and drops the brackets, which were never meant to be seen. */
export function Bidi({ text }: { text: string }) {
  const parts = text.split(/\[([^\]]+)\]/);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? <bdi key={index}>{part}</bdi> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  );
}

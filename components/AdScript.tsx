import { useEffect, useRef } from "react";

export function AdScript({
  id,
  atOptions,
  src,
}: {
  id: string;
  atOptions: object;
  src: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Unique variable name for this ad
    const uniqueVar = "atOptions_" + id.replace(/[^a-zA-Z0-9_]/g, "");

    // Clean up previous ad
    ref.current.innerHTML = "";

    // Set up script with unique variable
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML =
      `window.${uniqueVar} = ${JSON.stringify(atOptions)};\n` +
      `var atOptions = window.${uniqueVar};`;
    ref.current.appendChild(script);

    // Now the ad script
    const invoke = document.createElement("script");
    invoke.type = "text/javascript";
    invoke.src = src;
    ref.current.appendChild(invoke);
  }, [id, atOptions, src]);

  return <div ref={ref} style={{ width: atOptions["width"], height: atOptions["height"] }} />;
}

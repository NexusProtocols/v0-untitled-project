import React from "react"

type AdUnitProps = {
  name: "top728" | "middle320" | "bottom728"
}

const adConfigs = {
  top728: {
    keyId: "fd9b1c1a9efee5e08a1818fb900a7d69",
    width: 728,
    height: 90,
  },
  middle320: {
    keyId: "3e8a77126905eb1bf6906ca144e2e0dd",
    width: 320,
    height: 50,
  },
  bottom728: {
    keyId: "26399d5117f28dad5c8e0a5f7fa6a967",
    width: 728,
    height: 90,
  },
}

export function AdUnit({ name }: AdUnitProps) {
  const conf = adConfigs[name]
  if (!conf) return null
  const src = `https://geometrydoomeddrone.com/${conf.keyId}/invoke.html`
  return (
    <iframe
      src={src}
      width={conf.width}
      height={conf.height}
      style={{ border: "none", overflow: "hidden", display: "block" }}
      scrolling="no"
      allow="autoplay; encrypted-media"
      sandbox="allow-scripts allow-same-origin"
      loading="lazy"
      title={`advertisement-${name}`}
    />
  )
}

import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes } from "react";

/** Anchor that uses client-side routing for internal app paths. */
export function A({ href = "#", ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { "data-path"?: string }) {
  // Niche wali line mein "/admin" add kar diya gaya hai
  if (href === "/" || href === "/registration" || href === "/payment" || href === "/pass" || href === "/admin") {
    return <Link to={href} {...(rest as object)} />;
  }
  return <a href={href} {...rest} />;
}
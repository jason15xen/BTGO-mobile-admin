"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { rememberCaptureReturn } from "@/lib/captureNav";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  children: ReactNode;
};

/** Link to /capture that restores the current page when the user cancels. */
export default function CaptureLink({ onClick, children, ...rest }: Props) {
  const pathname = usePathname();

  return (
    <Link
      href="/capture"
      onClick={(e) => {
        rememberCaptureReturn(pathname);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

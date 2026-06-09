import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip all Next internals (incl. webpack-hmr / hot-update) — running auth
    // middleware on those requests breaks dev bundling and causes missing chunks.
    "/((?!_next|favicon.ico|icon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

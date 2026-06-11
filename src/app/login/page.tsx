import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const dest =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect(dest);
}

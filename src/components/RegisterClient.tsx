import AuthClient from "@/components/AuthClient";

/** @deprecated Use AuthClient — kept for backward compatibility */
export default function RegisterClient() {
  return <AuthClient mode="signup" />;
}

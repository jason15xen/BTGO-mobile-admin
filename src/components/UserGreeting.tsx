/** Shows the signed-in nickname, or a generic greeting for guests. */
export default function UserGreeting({ initialName }: { initialName?: string | null }) {
  return <span>こんにちは{initialName ? `、${initialName}さん` : ""}！</span>;
}

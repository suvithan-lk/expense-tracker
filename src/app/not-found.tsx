import Link from "next/link";
import { EmptyState } from "@/components/ui/states";

export default function NotFound() {
  return <main className="route-state-page"><EmptyState title="That view is not here" description="The page may have moved, or the address may be incomplete." action={<Link className="forest-button" href="/dashboard">Return to dashboard</Link>} /></main>;
}

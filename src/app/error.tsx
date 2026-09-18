"use client";

import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="route-state-page"><ErrorState title="This page needs a reset" description="We could not load this view. Try again, or return to your dashboard." action={<Button onClick={reset}>Try again</Button>} /></main>;
}

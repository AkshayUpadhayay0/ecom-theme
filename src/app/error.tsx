"use client";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x py-32 text-center" role="alert">
      <p className="eyebrow text-taupe">Something went wrong</p>
      <h1 className="display mt-3 text-5xl">We hit a snag</h1>
      <p className="mx-auto mt-4 max-w-sm text-taupe">Please try again. If it keeps happening, contact support.</p>
      <div className="mt-8 flex justify-center gap-3"><Button onClick={reset}>Try again</Button><Button href="/" variant="outline">Home</Button></div>
    </div>
  );
}

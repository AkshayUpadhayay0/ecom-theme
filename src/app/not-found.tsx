import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-x py-32 text-center">
      <p className="eyebrow text-taupe">404</p>
      <h1 className="display mt-3 text-6xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-sm text-taupe">The page you're looking for has moved or doesn't exist.</p>
      <div className="mt-8 flex justify-center gap-3"><Button href="/" arrow>Home</Button><Button href="/shop" variant="outline">Shop all</Button></div>
    </div>
  );
}

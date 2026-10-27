import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="container-x py-32 text-center">
      <p className="eyebrow text-taupe">404</p>
      <h1 className="display mt-3 text-5xl">We can't find that piece</h1>
      <p className="mx-auto mt-4 max-w-sm text-taupe">It may have sold out or been moved. Browse what's available now.</p>
      <Button href="/shop" arrow className="mt-8">Shop all</Button>
    </div>
  );
}

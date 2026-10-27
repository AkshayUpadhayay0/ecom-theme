const ITEMS = ["Complimentary shipping over ₹2,999", "Easy 14-day returns", "Cash on Delivery available", "New drops every week", "Designed in India"];

export function Marquee() {
  const row = (hidden?: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {ITEMS.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap">
          <span className="display px-8 text-2xl italic sm:text-3xl">{t}</span>
          <span aria-hidden className="text-sand">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="group overflow-hidden border-y border-line bg-cream py-4" aria-label="Store highlights" role="region">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {row()}
        {row(true)}
      </div>
    </div>
  );
}

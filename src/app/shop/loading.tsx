export default function Loading() {
  return (
    <div className="container-x py-16" aria-busy="true" aria-label="Loading products">
      <div className="skeleton h-14 w-72" />
      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-4 h-4 w-3/4" />
            <div className="skeleton mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

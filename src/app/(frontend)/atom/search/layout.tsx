import "./c1.css";

export default function AtomSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure the route always has its background even while the client-only app bundle loads.
  return (
    <>
      <div className="fixed inset-0 z-0 atom-search-bg" />
      <div className="relative z-10">{children}</div>
    </>
  );
}

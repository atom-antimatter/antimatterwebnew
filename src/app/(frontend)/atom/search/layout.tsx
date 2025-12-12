import "./c1.css";

export default function AtomSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Light mode (default). We do NOT set data-theme here.
  return <>{children}</>;
}

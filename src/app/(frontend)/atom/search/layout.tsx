import "./c1.css";

export default function AtomSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Apply dark theme server-side so the page renders correctly on first paint (no reload needed).
  // Our token file uses [data-theme="dark"] selectors, so wrapping is sufficient.
  return (
    <div data-theme="dark" className="min-h-screen">
      {children}
    </div>
  );
}

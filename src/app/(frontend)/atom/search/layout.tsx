import "./c1.css";
import AtomSearchCleanup from "./AtomSearchCleanup";

export default function AtomSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Scope theme variables to this route so it never impacts the rest of the site.
  return (
    <>
      <AtomSearchCleanup />
      <div className="fixed inset-0 z-0 atom-search-bg" />
      <div className="relative z-10 atom-search-scope" data-theme="light">
        {children}
      </div>
    </>
  );
}

// The header and smooth scroll (which the corridor's scroll-driven camera relies on)
// come from the workspace layout.
export default function Layout({ children }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}

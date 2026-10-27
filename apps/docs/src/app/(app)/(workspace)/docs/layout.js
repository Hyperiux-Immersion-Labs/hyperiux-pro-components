import DocsBody from "./DocsBody";

export default function Layout({ children }) {
  return (
    <div className="h-fit text-foreground">
      {/* Smooth scroll comes from the workspace layout */}
      <DocsBody>{children}</DocsBody>
    </div>
  );
}

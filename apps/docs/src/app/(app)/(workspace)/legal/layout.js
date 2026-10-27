import LegalBody from "./LegalBody";

export default function Layout({ children }) {
  return (
    <div className="h-fit w-full text-foreground">
      <LegalBody>{children}</LegalBody>
    </div>
  );
}

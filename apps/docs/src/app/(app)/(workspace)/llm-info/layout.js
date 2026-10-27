import LlmInfoBody from "./LlmInfoBody";

export default function Layout({ children }) {
  return (
    <div className="h-fit w-full text-foreground">
      <LlmInfoBody>{children}</LlmInfoBody>
    </div>
  );
}

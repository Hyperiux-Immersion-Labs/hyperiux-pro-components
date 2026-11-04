// Built using Hyperiux Vault: https://vault.hyperiux.com

type LinesProps = {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  id?: string;
};

export default function Lines({ lines, as: Tag = "h2", className = "", id }: LinesProps) {
  return (
    <Tag className={className} id={id}>
      {lines.map((line, i) => (
        <span key={line} className="vey-line block overflow-hidden">
          {i > 0 ? " " : null}
          <span data-line className="block">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

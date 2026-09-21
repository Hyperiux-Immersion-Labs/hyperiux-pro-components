"use client";

import "highlight.js/styles/night-owl.css";
import { useMemo, useState } from "react";
// Same lib/core + explicit-registration approach as the effect CodeBlock -
// the full highlight.js build would pull in 150+ grammars nobody renders.
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
import glsl from "highlight.js/lib/languages/glsl";
import CopyBtn from "@/components/ui/CopyBtn";
import { Tooltip } from "@/components/ui/Tooltip";

hljs.registerLanguage("javascript", javascript); // aliases: js, jsx
hljs.registerLanguage("typescript", typescript); // aliases: ts, tsx
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("bash", bash); // alias: sh
hljs.registerLanguage("json", json);
hljs.registerLanguage("plaintext", plaintext); // aliases: text, txt
hljs.registerLanguage("glsl", glsl);

// Blog-only code block. Unlike the effect CodeBlock it has no JS/TS variant
// toggle and no copy-limit gating - blog snippets are prose illustrations,
// not installable source. With a filename it renders the header bar (filename
// + copy); without one it renders as a bare block: no header, no copy button.
// `language` is optional and deliberately has no default - a blog snippet can
// be CSS, HTML, a shell command, a GLSL shader or anything else, so assuming
// JSX would mis-highlight most of them. Unset falls through to
// highlightAuto below.
export default function BlogCodeBlock({ code = "", language, filename }) {
  const [copied, setCopied] = useState(false);
  const hasHeader = Boolean(filename);

  const highlighted = useMemo(() => {
    try {
      if (!code) return "";
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return "";
    }
  }, [code, language]);

  // Only for the `language-*` hint on <code>; highlighting itself is already
  // resolved above.
  const languageClass = language || "plaintext";

  return (
    <div className="relative overflow-hidden fadeup codeblock-root">
      <div
        className="max-h-[30vw] w-full overflow-y-auto codeblock max-md:max-h-[50vh] max-[1025px]:max-h-[50vh]"
        style={{ scrollbarGutter: "stable" }}
      >
        {hasHeader && (
          <div className="sticky top-0 z-10 flex items-center justify-between bg-[#484848] px-4 py-2">
            <span className="text-lg text-white max-md:text-sm">{filename}</span>
            <Tooltip label={copied ? "Copied!" : "Copy code"} position="bottom">
              <CopyBtn
                value={code}
                color="white"
                className="rounded-sm px-3 py-1.5 transition-colors hover:text-white/80"
                aria-label="Copy code to clipboard"
                onCopiedChange={setCopied}
              />
            </Tooltip>
          </div>
        )}
        <pre className="overflow-x-auto bg-[#272727] text-sm! tracking-tight! max-md:text-xs max-[1025px]:text-sm">
          {highlighted ? (
            <code
              className={`hljs bg-[#272727]! language-${languageClass}`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          ) : (
            <code className={`hljs language-${languageClass}`}>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}

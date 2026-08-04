"use client";

import "highlight.js/styles/night-owl.css";
import { useMemo } from "react";
// lib/core + explicit registrations instead of the full "highlight.js" build,
// which bundles all 150+ grammars (~300KB of Mathematica/ISBL/GML/... nobody
// renders). Every language= value used across the site maps to one of these.
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
import glsl from "highlight.js/lib/languages/glsl";
import { Lock } from "lucide-react";
import Link from "next/link";
import CopyBtn from "@/components/ui/CopyBtn";

hljs.registerLanguage("javascript", javascript); // aliases: js, jsx
hljs.registerLanguage("typescript", typescript); // aliases: ts, tsx
hljs.registerLanguage("xml", xml); // embedded markup in js template strings
hljs.registerLanguage("css", css);
hljs.registerLanguage("bash", bash); // alias: sh
hljs.registerLanguage("json", json);
hljs.registerLanguage("plaintext", plaintext); // aliases: text, txt
hljs.registerLanguage("glsl", glsl); // /tech/webgl shader example

// Placeholder content shown in place of the real code/command while
// copyLocked - the overlay alone isn't enough, since the real text would
// otherwise still sit in the DOM underneath it, selectable/readable by
// simply deleting the overlay element via devtools.
const LOCKED_CODE_SAMPLE = `// Sample preview - daily copy limit reached
function Component() {
  return <div className="hyperiux-effect" />;
}`;

const LOCKED_COMMAND_SAMPLE = "npx hyperiux add <effect>";

function CopyLimitOverlay({ message, ctaHref }) {
    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/10 px-6 py-6 text-center backdrop-blur-md">
            <Lock className="h-8 w-8 text-white/70" strokeWidth={1.5} />
            <p className="max-w-xs text-sm font-medium text-white">{message}</p>
            {ctaHref && (
                <Link
              id={"upgrade-to-pro-codeblock"}

                    href={ctaHref}
                    className="rounded-full bg-[#ff5f00] px-4 py-2 text-xs font-medium text-white! transition hover:bg-[#e05500]"
                >
                    Upgrade to Pro
                </Link>
            )}
        </div>
    );
}

export function CodeBlock({
    code,
    language = "jsx",
    filename,
    className = "",
    hideHeaderWhenNoFilename = false,
    copyLocked = false,
    selectable = true,
    onBeforeCopy,
    lockedMessage = "You have crossed your copy limit for the day.",
    lockedCtaHref = null,
}) {
    const displayCode = copyLocked ? LOCKED_CODE_SAMPLE : code || "";

    const highlighted = useMemo(() => {
        try {
            if (!displayCode) return "";
            if (language && hljs.getLanguage(language)) {
                return hljs.highlight(displayCode, { language, ignoreIllegals: true }).value;
            }
            return hljs.highlightAuto(displayCode).value;
        } catch {
            return "";
        }
    }, [displayCode, language]);

    const shouldShowHeader = !hideHeaderWhenNoFilename || Boolean(filename);

    return (
        <div className={`relative overflow-hidden rounded-md fadeup codeblock-root ${className}`}>
            {copyLocked && <CopyLimitOverlay message={lockedMessage} ctaHref={lockedCtaHref} />}
            <div
                className={`max-h-[30vw] overflow-y-auto w-full codeblock  ${
                    shouldShowHeader
                        ? "max-sm:max-h-[50vh] max-md:max-h-[50vh] max-sm:min-h-[12vh]"
                        : "max-sm:h-[8vh] max-sm:pt-[3vh] max-md:h-[5.5vh]"
                }`}
                style={{ scrollbarGutter: "stable" }}
            >
                {shouldShowHeader ? (
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-[#484848] px-4 py-2">
                        <span className="text-lg text-white max-sm:text-sm">{filename || ""}</span>
                        <CopyBtn
                            value={displayCode}
                            color="white"
                            className="rounded-sm px-3 py-1.5 transition-colors hover:text-white/80"
                            aria-label="Copy code to clipboard"
                            disabled={copyLocked}
                            onBeforeCopy={onBeforeCopy}
                        />
                    </div>
                ) : (
                    <CopyBtn
                        value={displayCode}
                        color="white"
                        className="absolute top-5 right-5 z-10 max-sm:top-3.5 max-sm:right-6"
                        aria-label="Copy code to clipboard"
                        disabled={copyLocked}
                        onBeforeCopy={onBeforeCopy}
                    />
                )}
                <div className="relative">
                    <pre
                        className={`overflow-x-auto bg-[#272727]  max-sm:pt-[7vw] tracking-tight! text-sm!  ${
                            shouldShowHeader ? "max-sm:text-xs max-md:text-sm" : ""
                        } ${!selectable ? "select-none" : ""}`}
                    >
                        {highlighted ? (
                            <code
                                className={`hljs bg-[#272727]! max-sm:text-xs max-md:text-sm language-${language}`}
                                dangerouslySetInnerHTML={{ __html: highlighted }}
                            />
                        ) : (
                            <code className={`hljs language-${language}`}>{displayCode}</code>
                        )}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export function InstallCommand({
    effect,
    copyLocked = false,
    selectable = true,
    onBeforeCopy,
    lockedMessage = "You have crossed your copy limit for the day.",
}) {
    const command = `npx hyperiux add ${effect}`;
    const displayCommand = copyLocked ? LOCKED_COMMAND_SAMPLE : command;

    return (
        <div className="relative flex items-center gap-2 p-3 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
            {/* No upgrade CTA here by design - only the source-code block gets
                the "Upgrade to Pro" prompt, not the install command. */}
            {copyLocked && <CopyLimitOverlay message={lockedMessage} ctaHref={null} />}
            <span className="text-green-500">$</span>
            <code
                className={`flex-1 text-sm text-neutral-300 max-sm:text-lg! max-sm:pt-[7vw] ${!selectable ? "select-none" : ""}`}
            >
                {displayCommand}
            </code>
            <CopyBtn
                value={displayCommand}
                color="white"
                size="sm"
                className="rounded bg-white/10 p-2 hover:bg-white/20"
                aria-label="Copy install command"
                disabled={copyLocked}
                onBeforeCopy={onBeforeCopy}
            />
        </div>
    );
}

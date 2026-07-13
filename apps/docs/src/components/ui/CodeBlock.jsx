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
import CopyBtn from "@/components/ui/CopyBtn";

hljs.registerLanguage("javascript", javascript); // aliases: js, jsx
hljs.registerLanguage("typescript", typescript); // aliases: ts, tsx
hljs.registerLanguage("xml", xml); // embedded markup in js template strings
hljs.registerLanguage("css", css);
hljs.registerLanguage("bash", bash); // alias: sh
hljs.registerLanguage("json", json);
hljs.registerLanguage("plaintext", plaintext); // aliases: text, txt
hljs.registerLanguage("glsl", glsl); // /tech/webgl shader example

export function CodeBlock({
    code,
    language = "jsx",
    filename,
    className = "",
    hideHeaderWhenNoFilename = false,
}) {
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

    const shouldShowHeader = !hideHeaderWhenNoFilename || Boolean(filename);

    return (
        <div className={`relative overflow-hidden rounded-md fadeup codeblock-root ${className}`}>
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
                            value={code}
                            color="white"
                            className="rounded-sm px-3 py-1.5 transition-colors hover:text-white/80"
                            aria-label="Copy code to clipboard"
                        />
                    </div>
                ) : (
                    <CopyBtn
                        value={code}
                        color="white"
                        className="absolute top-5 right-5 z-10 max-sm:top-3.5 max-sm:right-6"
                        aria-label="Copy code to clipboard"
                    />
                )}
                <div className="relative">
                    <pre
                        className={`overflow-x-auto bg-[#272727]  max-sm:pt-[7vw] tracking-tight! text-sm!  ${
                            shouldShowHeader ? "max-sm:text-xs max-md:text-sm" : ""
                        }`}
                    >
                        {highlighted ? (
                            <code
                                className={`hljs bg-[#272727]! max-sm:text-xs max-md:text-sm language-${language}`}
                                dangerouslySetInnerHTML={{ __html: highlighted }}
                            />
                        ) : (
                            <code className={`hljs language-${language}`}>{code}</code>
                        )}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export function InstallCommand({ effect }) {
    const command = `npx hyperiux add ${effect}`;

    return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-900 border border-neutral-800 ">
            <span className="text-green-500">$</span>
            <code className="flex-1 text-sm text-neutral-300 max-sm:text-lg! max-sm:pt-[7vw]">{command}</code>
            <CopyBtn
                value={command}
                color="white"
                size="sm"
                className="rounded bg-white/10 p-2 hover:bg-white/20"
                aria-label="Copy install command"
            />
        </div>
    );
}

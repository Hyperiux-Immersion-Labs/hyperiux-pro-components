"use client";

import { useMemo, useState } from "react";
import hljs from "highlight.js";
import { Copy } from "lucide-react";

export function CodeBlock({
    code,
    language = "jsx",
    filename,
    className = "",
    hideHeaderWhenNoFilename = false,
}) {
    const [copied, setCopied] = useState(false);
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

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shouldShowHeader = !hideHeaderWhenNoFilename || Boolean(filename);

    return (
        <div className={`relative overflow-hidden rounded-md fadeup codeblock-root ${className}`}>
            
            <div
                className={`max-h-[30vw] overflow-y-auto ${
                    shouldShowHeader
                        ? "max-sm:max-h-[50vh] max-sm:min-h-[18vh]"
                        : "max-sm:h-[5vh]"
                }`}
                style={{ scrollbarGutter: "stable" }}
            >
                {shouldShowHeader ? (
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-[#484848] px-4 py-2">
                        <span className="text-lg text-white max-sm:text-sm">{filename || ""}</span>
                        <button
                            onClick={handleCopy}
                            className="cursor-pointer rounded-sm bg-transparent px-3 py-1.5 text-xs text-foreground transition-colors hover:text-foreground max-sm:text-xl"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleCopy}
                        className="absolute top-5 right-5 max-sm:top-3.5 max-sm:right-6  z-10 cursor-pointer rounded-sm bg-transparent p-0 text-foreground transition-colors hover:text-foreground"
                    >
                        <Copy className="size-4" />
                    </button>
                )}
                <div className="relative">
                    <pre
                        className={`overflow-x-auto bg-[#272727] text-xs ${
                            shouldShowHeader ? "max-sm:text-xs" : "max-sm:text-sm"
                        }`}
                    >
                        {highlighted ? (
                            <code
                                className={`hljs bg-[#272727]! max-sm:text-xs language-${language}`}
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
    const [copied, setCopied] = useState(false);
    const command = `npx hyperiux add ${effect}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <span className="text-green-500">$</span>
            <code className="flex-1 text-sm text-neutral-300 max-sm:text-lg!">{command}</code>
            <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded bg-white text-black hover:bg-neutral-200 transition-colors font-medium max-sm:text-[11px]"
            >
                {copied ? "Copied!" : "Copy"}
            </button>
        </div>
    );
}

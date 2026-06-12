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
                className="max-h-[30vw] overflow-y-auto"
                style={{ scrollbarGutter: "stable" }}
            >
                {shouldShowHeader ? (
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-[#484848] px-4 py-2">
                        <span className="text-lg text-white tracking-widest">{filename || ""}</span>
                        <button
                            onClick={handleCopy}
                            className="cursor-pointer rounded-sm bg-transparent px-3 py-1.5 text-xs text-foreground transition-colors hover:text-foreground"
                        >
                            <Copy />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleCopy}
                        className="absolute top-5 right-5 z-10 cursor-pointer rounded-sm bg-transparent p-0 text-foreground transition-colors hover:text-foreground"
                    >
                        <Copy />
                    </button>
                )}
                <div className="relative">
                    <pre className="overflow-x-auto text-sm bg-[#272727]">
                        {highlighted ? (
                            <code
                                className={`hljs bg-[#272727]! language-${language}`}
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
            <code className="flex-1 text-sm text-neutral-300">{command}</code>
            <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded bg-white text-black hover:bg-neutral-200 transition-colors font-medium"
            >
                {copied ? "Copied!" : "Copy"}
            </button>
        </div>
    );
}

"use client";

import { useMemo, useState } from "react";
import hljs from "highlight.js";
import { Copy } from "lucide-react";

export function CodeBlock({ code, language = "jsx", filename }) {
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

    return (
        <div className="relative rounded-md overflow-hidden fadeup codeblock-root">
            
            <div
                className="max-h-[30vw] overflow-y-auto"
                style={{ scrollbarGutter: "stable" }}
            >
                <div className="flex items-center justify-between px-4 py-2  bg-[#484848] sticky top-0 z-10">
                    <span className="text-sm text-muted">{filename || ""}</span>
                    <button
                        onClick={handleCopy}
                        className="text-xs px-3 cursor-pointer py-1.5 rounded-sm bg-transparent text-foreground hover:text-foreground transition-colors"
                    >
                        <Copy/>
                        {/* {copied ? "Copied!" : "Copy"} */}
                    </button>
                </div>
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

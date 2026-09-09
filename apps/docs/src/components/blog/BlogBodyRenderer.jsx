import Image from "next/image";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { getBlogHeadings } from "@/lib/blog-content";

// Renders a blogPost's Sanity `body` (the same effectBody portable-text
// schema effectContent uses - block/effectImage/effectCodeBlock/
// effectTableBlock/effectCalloutBlock/horizontalRule/effectFaqAccordion).
// Deliberately NOT a reuse of effect-detail.jsx's PortableTextBlock/
// SanityBodyBlock: those are wired into useCopyLimit()'s Pro-effect
// copy-paywall, which has no meaning for a blog post - pulling them in would
// mean importing paywall logic into public content. Same schema, plain
// rendering, styled entirely by styles/blog.css's bare-tag selectors
// (.blog-article h2/p/ul/blockquote/code/table/etc.) so blocks need no
// per-element classes beyond the few custom ones below.

function buildMarkedChildren(block) {
  const markDefs = block.markDefs || [];

  return (block.children || []).map((child, index) => {
    if (!child?.text) return null;

    let node = child.text;

    for (const mark of child.marks || []) {
      if (mark === "strong") {
        node = <strong key={`strong-${index}`}>{node}</strong>;
        continue;
      }

      if (mark === "em") {
        node = <em key={`em-${index}`}>{node}</em>;
        continue;
      }

      if (mark === "code") {
        node = <code key={`code-${index}`}>{node}</code>;
        continue;
      }

      const markDef = markDefs.find((item) => item._key === mark);

      if (markDef?._type === "link" && markDef.href) {
        node = (
          <a key={`link-${index}`} href={markDef.href} target="_blank" rel="noreferrer">
            {node}
          </a>
        );
      }
    }

    return <span key={child._key || index}>{node}</span>;
  });
}

// Consecutive list-item blocks of the same listItem/level collapse into one
// <ul>/<ol> - Sanity stores each bullet as its own top-level block.
function groupBlocks(body) {
  const grouped = [];

  for (const block of body) {
    if (block?._type === "block" && block.listItem) {
      const previous = grouped[grouped.length - 1];

      if (
        previous?._type === "listGroup" &&
        previous.listItem === block.listItem &&
        (previous.level || 1) === (block.level || 1)
      ) {
        previous.items.push(block);
        continue;
      }

      grouped.push({
        _type: "listGroup",
        _groupKey: `list-${block._key || grouped.length}`,
        listItem: block.listItem,
        items: [block],
      });

      continue;
    }

    grouped.push(block);
  }

  return grouped;
}

function TextBlock({ block, headingId }) {
  const children = buildMarkedChildren(block);
  const style = block.style || "normal";

  if (style === "h2") return <h2 id={headingId}>{children}</h2>;
  if (style === "h3") return <h3>{children}</h3>;
  if (style === "blockquote") return <blockquote>{children}</blockquote>;

  return <p>{children}</p>;
}

function BlogBlock({ block, headingId }) {
  if (!block) return null;

  if (block._type === "block") return <TextBlock block={block} headingId={headingId} />;

  if (block._type === "listGroup") {
    const Tag = block.listItem === "number" ? "ol" : "ul";

    return (
      <Tag>
        {block.items.map((item, index) => (
          <li key={item._key || `${block._groupKey}-${index}`}>
            {buildMarkedChildren(item)}
          </li>
        ))}
      </Tag>
    );
  }

  if (block._type === "effectImage") {
    return (
      <figure>
        <Image
          src={block.url}
          alt={block.alt || ""}
          width={1600}
          height={900}
          sizes="(max-width: 768px) 100vw, 720px"
          style={{ width: "100%", height: "auto" }}
        />
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    );
  }

  if (block._type === "effectCodeBlock") {
    return <CodeBlock code={block.code || ""} tsxCode={block.tsxCode} filename={block.filename} />;
  }

  if (block._type === "horizontalRule") return <hr />;

  if (block._type === "effectTableBlock") {
    const headers = Array.isArray(block.headers) ? block.headers : [];
    const rows = Array.isArray(block.rows) ? block.rows : [];
    const columnCount = Math.max(
      headers.length,
      rows.reduce((max, row) => Math.max(max, row?.cells?.length || 0), 0)
    );

    if (!columnCount) return null;

    return (
      <div className="blog-table-wrapper">
        <table>
          {headers.length > 0 && (
            <thead>
              <tr>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <th key={index}>{headers[index] || ""}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row._key || rowIndex}>
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <td key={cellIndex}>{row.cells?.[cellIndex] || ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block._type === "effectCalloutBlock") {
    return (
      <div className="blog-callout">
        {block.title && <div className="blog-callout-title">{block.title}</div>}
        <BlogBodyRenderer body={block.content || []} />
      </div>
    );
  }

  if (block._type === "effectFaqAccordion") {
    const items = block.items || [];

    if (!items.length) return null;

    return (
      <div className="blog-faq">
        {block.title && <h2>{block.title}</h2>}
        {items.map((item, index) => (
          <div className="blog-faq-item" key={item._key || index}>
            <p className="blog-faq-question">{item.question}</p>
            <p className="blog-faq-answer">{item.answer}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export default function BlogBodyRenderer({ body = [] }) {
  // getBlogHeadings walks `body` in the same top-to-bottom order this loop
  // does, so the Nth h2 block encountered below always matches headings[n] -
  // same slugify + de-dup logic the TOC uses, computed once from one place.
  const headings = getBlogHeadings(body);
  let headingIndex = 0;

  return groupBlocks(body).map((block, index) => {
    const isH2 = block?._type === "block" && block.style === "h2";
    const headingId = isH2 ? headings[headingIndex++]?.id : undefined;

    return <BlogBlock key={block._key || index} block={block} headingId={headingId} />;
  });
}

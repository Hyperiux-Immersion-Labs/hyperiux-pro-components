import Image from "next/image";
import BlogCodeBlock from "@/components/blog/BlogCodeBlock";
import DocsTable from "@/components/DocsContent/Table";
import { getBlogHeadings } from "@/lib/blog-content";
import {
  FAQContent,
  FAQGroup,
  FAQTitle,
  FAQWrapper,
} from "@/components/animated-faq";
import styles from "@/app/(marketing)/blog/[slug]/blog-content.module.css";

// Renders a blogPost's Sanity `body` (the blogBody portable-text schema -
// block/effectImage/blogCodeBlock/effectTableBlock/effectCalloutBlock/
// horizontalRule/effectFaqAccordion. blogBody mirrors the effectBody the
// effect pages use, but swaps effectCodeBlock for the blog-only
// blogCodeBlock, which has no JS/TS variants).
// Deliberately NOT a reuse of effect-detail.jsx's PortableTextBlock/
// SanityBodyBlock: those are wired into useCopyLimit()'s Pro-effect
// copy-paywall, which has no meaning for a blog post - pulling them in would
// mean importing paywall logic into public content. Same schema, plain
// rendering, styled by blog-content.module.css's bare-tag selectors under
// .content (h2/h3/p/ul/blockquote/table/etc.) so blocks need no per-element
// classes beyond the few custom ones below.

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

  if (style === "h2") return <h2 id={headingId} className="fadeup">{children}</h2>;
  if (style === "h3") return <h3 className="fadeup">{children}</h3>;
  if (style === "blockquote") return <blockquote className="fadeup">{children}</blockquote>;

  return <p className="fadeup">{children}</p>;
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
      <figure className="fadeup">
        {/* `group` + overflow-hidden on the frame so the image can scale past
            the frame's edges on hover and get cropped by it, rather than
            pushing the surrounding prose around. */}
        <div className={`${styles.imageFrame} group`}>
          <Image
            src={block.url}
            alt={block.alt || ""}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 720px"
            className={`${styles.image} transition-transform duration-300 ease-in-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
          />
        </div>
        {block.caption && (
          <figcaption className={styles.caption}>{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  // Same wrapper rationale as the table below: body blocks render as a flat
  // list with no spacing parent, and padding on BlogCodeBlock itself would sit
  // inside its own background instead of separating it from the prose.
  if (block._type === "blogCodeBlock") {
    return (
      <div className="py-5">
        <BlogCodeBlock
          code={block.code || ""}
          language={block.language}
          filename={block.filename}
        />
      </div>
    );
  }

  // Posts authored before blogCodeBlock existed still carry effectCodeBlock
  // blocks - render them through the blog block too, so no post shows the
  // JS/TS toggle. The tsxCode field is intentionally dropped.
  if (block._type === "effectCodeBlock") {
    return (
      <div className="py-5">
        <BlogCodeBlock code={block.code || ""} filename={block.filename} />
      </div>
    );
  }

  if (block._type === "horizontalRule") return <hr className={styles.contentDivider} />;

  // Was emitting a bare <table> under .blog-table-wrapper, whose styles live
  // in blog.css - a file this page never imports, so the table rendered with
  // no borders, padding or header fill at all. DocsTable carries its own
  // Tailwind styling and the colorVariant/firstColumnAsHeader options the
  // schema already exposes.
  if (block._type === "effectTableBlock") {
    const headers = Array.isArray(block.headers) ? block.headers : [];
    const rows = Array.isArray(block.rows) ? block.rows : [];
    const columnCount = Math.max(
      headers.length,
      rows.reduce((max, row) => Math.max(max, row?.cells?.length || 0), 0)
    );

    if (!columnCount) return null;

   
    const paddedRows = rows.map((row) =>
      Array.from({ length: columnCount }, (_, index) => row.cells?.[index] || "")
    );
    const paddedHeaders = headers.length
      ? Array.from({ length: columnCount }, (_, index) => headers[index] || "")
      : undefined;

    // Body blocks render as a flat list with no spacing parent, so the table
    // needs its own breathing room from the paragraphs around it. The padding
    // sits on a wrapper rather than on DocsTable itself, whose padding would
    // land inside its border instead of outside it.
    return (
      <div className="py-[2vh] max-md:py-[1.5vh]">
        <DocsTable
          headers={paddedHeaders}
          rows={paddedRows}
          caption={block.caption}
          colorVariant={block.colorVariant || "vault"}
          firstColumnAsHeader={block.firstColumnAsHeader === true}
        />
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
    const faqItems = block.items || [];

    if (!faqItems.length) return null;

    return (
      <section className={`fadeup ${styles.faqAccordion}`}>
        {block.title && (
          <h2 className={styles.faqAccordionTitle}>{block.title}</h2>
        )}

        <FAQGroup
          allowMultiple={false}
          defaultOpenItems={faqItems[0]?._key ? [faqItems[0]._key] : []}
        >
          <div className="border border-grey">
            {faqItems.map((item, index) => {
              const itemId = item._key || `faq-${index}`;

              return (
                <FAQWrapper
                  key={itemId}
                  itemId={itemId}
                  className={`group border-grey px-[2.5vw] py-[2vw] max-[1025px]:px-[4vw] max-[1025px]:py-[4vw] max-md:px-[6vw] max-md:py-[6vw] ${index > 0 ? "border-t" : ""
                    }`}
                  iconClassName="mt-[0.55vw] max-md:mt-[1vw] max-md:mt-[1.5vw] text-light-grey transition-colors duration-500 ease-out group-hover:text-white"
                  iconSize={18}
                  iconStrokeWidth={1.5}
                  duration={0.6}
                >
                  <FAQTitle
                    className="pb-0 items-start! justify-start! gap-[1.5vw]! max-[1025px]:gap-[3vw]! max-md:gap-[4vw]!"
                    iconPosition="left"
                    iconMode="rotate-left-down"
                  >
                    <h3 className="text-[1.55vw]! font-neue-haas leading-tight! my-0! max-[1025px]:text-[3.4vw]! max-md:text-[5.2vw]!">
                      {item.question}
                    </h3>
                  </FAQTitle>

                  <FAQContent className="pt-[1.2vw] pl-[2.8vw] max-[1025px]:pt-[2.5vw] max-[1025px]:pl-[7vw] max-md:pt-[4vw] max-md:pl-[8vw]">
                    <p className="text-[1.15vw]! font-neue-haas text-white! leading-[1.45]! max-[1025px]:text-[2.2vw]! max-md:text-[4vw]!">
                      {item.answer}
                    </p>
                  </FAQContent>
                </FAQWrapper>
              );
            })}
          </div>
        </FAQGroup>
      </section>
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

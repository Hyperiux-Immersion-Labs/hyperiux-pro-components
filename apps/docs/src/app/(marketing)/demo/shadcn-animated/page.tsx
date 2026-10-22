import Link from "next/link";

export const metadata = {
  title: "Animated components – test index",
  robots: { index: false, follow: false },
};

// Internal QA index for the ported animated components
const DEMOS = [
  { slug: "animated-accordion", title: "Animated Accordion", description: "Expandable sections that reveal their answers with a staggered fade." },
  { slug: "animated-attachment", title: "Animated Attachment", description: "File chips that show upload progress, errors and previews." },
  { slug: "animated-button", title: "Animated Button", description: "Buttons with hover, press and loading animations." },
  { slug: "animated-chat-bubble", title: "Animated Chat Bubble", description: "Chat bubbles with streaming replies, reactions and swipe to reply." },
  { slug: "animated-checkbox-group", title: "Animated Checkbox Group", description: "Tick any number of options. Shift-click ticks a range." },
  { slug: "animated-command-menu", title: "Animated Command Menu", description: "A searchable list of commands, opened with a shortcut." },
  { slug: "animated-data-table", title: "Animated Data Table", description: "Sort, filter, select and reorder rows that glide into place." },
  { slug: "animated-date-picker", title: "Animated Date Picker", description: "A button that opens a calendar to pick a single date." },
  { slug: "animated-dialog", title: "Animated Dialog", description: "A window over the page that asks for a decision before you carry on." },
  { slug: "animated-drawer", title: "Animated Drawer", description: "A panel that slides in from the edge and can be swiped away." },
  { slug: "animated-dropdown-menu", title: "Animated Dropdown Menu", description: "A menu of actions or options that opens from a button." },
  { slug: "animated-form-fields", title: "Animated Form Fields", description: "Labels, hints and errors that hold a form’s inputs together." },
  { slug: "animated-hover-card", title: "Animated Hover Card", description: "A preview that appears when you hover a link." },
  { slug: "animated-input-otp", title: "Animated Input OTP", description: "One-time code boxes that fill, shake and confirm." },
  { slug: "animated-menubar", title: "Animated Menubar", description: "A row of menus, like an app’s File and Edit menus." },
  { slug: "animated-questionnaire", title: "Animated Questionnaire", description: "A step-by-step set of questions with progress." },
  { slug: "animated-radio-group", title: "Animated Radio Group", description: "Pick one option. Arrow keys, Home and End move the choice." },
  { slug: "animated-sidebar", title: "Animated Sidebar", description: "A collapsible side navigation with groups, badges and sub-menus." },
  { slug: "animated-skeleton", title: "Animated Skeleton", description: "Placeholders that shimmer while content loads." },
  { slug: "animated-slider", title: "Animated Slider", description: "Drag a thumb to pick a value or a range." },
  { slug: "animated-switch", title: "Animated Switch", description: "A toggle between on and off." },
  { slug: "animated-tabs-bar", title: "Animated Tabs Bar", description: "Switch between views; the highlight glides to the active tab." },
  { slug: "animated-theme-switch", title: "Animated Theme Switch", description: "Switch between light and dark with a transition." },
  { slug: "animated-toast", title: "Animated Toast", description: "Brief messages that stack in the corner and can be swiped away." },
  { slug: "animated-tooltip", title: "Animated Tooltip", description: "A label that follows the pointer or appears on hover." },
];

export default function AnimatedComponentsIndex() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-[3vw] bg-white px-[5vw] py-[7%] text-[#111111] max-md:gap-[8vw] max-md:py-[20%]">
      <div className="flex flex-col gap-[1vw] max-md:gap-[3vw]">
        <p className="text-sm uppercase tracking-wider text-[#71717a]">Internal · not indexed</p>
        <h1 className="text-[4vw] leading-none max-lg:text-[6vw] max-md:text-[9vw]">Animated components</h1>
        <p className="w-[50%] text-[#52525b] max-lg:w-[80%] max-md:w-full">
          {DEMOS.length} components ported from shadcn-animated. Each link opens its demo with the Remixer, Theme and Mode controls.
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-[1.5vw] max-lg:grid-cols-2 max-lg:gap-[2.5vw] max-md:grid-cols-1 max-md:gap-[4vw]">
        {DEMOS.map((demo, index) => (
          <li key={demo.slug}>
            <Link
              href={`/demo/${demo.slug}`}
              className="group flex h-full flex-col gap-[0.6vw] rounded-2xl border border-[#e4e4e7] px-[1.5vw] py-[1.4vw] transition-colors duration-300 hover:border-[#111111] hover:bg-[#fafafa] max-lg:px-[3vw] max-lg:py-[2.5vw] max-md:gap-[2vw] max-md:px-[5vw] max-md:py-[5vw]"
            >
              <span className="flex items-center justify-between gap-4">
                <span className="text-lg font-medium">{demo.title.replace("Animated ", "")}</span>
                <span className="text-sm tabular-nums text-[#a1a1aa]">{String(index + 1).padStart(2, "0")}</span>
              </span>
              <span className="text-sm text-[#71717a]">{demo.description}</span>
              <span className="mt-auto flex items-center gap-2 text-sm text-[#111111]">
                /demo/{demo.slug}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

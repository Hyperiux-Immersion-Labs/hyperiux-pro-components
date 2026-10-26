import DemoSubpageLoader from "@/components/WebsiteComps/DemoSubpageLoader";
// Effect demos need every effect's classes, not just the site's (see app/site.css)
import "../../full.css";

export default function DemoLayout({ children }) {
  return <DemoSubpageLoader>{children}</DemoSubpageLoader>;
}

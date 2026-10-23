"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GlassFolder, {
  GLASS_FOLDER_SIZES,
  type GlassFolderFile,
  type GlassFolderProps,
} from "@/components/glass-folder";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";
import { MEDIA } from "@/lib/breakpoints";
import NewFolderBlock, { type NewFolder } from "./NewFolderBlock";

const ART_OPTIONS = [
  { label: "Vault", value: "vault" },
  { label: "Aurora", value: "aurora" },
  { label: "Ember", value: "ember" },
  { label: "Dusk", value: "dusk" },
  { label: "Glacier", value: "glacier" },
  { label: "Verdant", value: "verdant" },
  { label: "None", value: "none" },
];

const MOBILE_WIDTH = 290;

// Pinned after the remixer values: a tab can still hold an accent saved before it was a fixed colour
const VAULT_PRIMARY = "#ff5f00";

const R2 =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images";
const ASSET_FILES: GlassFolderFile[] = [
  { name: "Campaign still", meta: "JPG", image: `${R2}/h-01.jpg` },
  { name: "Studio set", meta: "JPG", image: `${R2}/h-02.jpg` },
  { name: "Lookbook cover", meta: "JPG", image: `${R2}/h-03.jpg` },
];
// What + drops into a folder: the next R2 picture after the files it started with, round and round.
// Each folder starts at its own point in the list, so two folders don't add the same picture.
const ADD_IMAGES = ["h-08", "h-09", "h-10", "h-11", "h-12", "h-13", "h-14", "h-15", "h-22", "h-23"];
const addImage =
  (startCount: number, offset = 0) =>
  (files: GlassFolderFile[]): GlassFolderFile => {
    // never below zero: files can be removed before more are added
    const n = Math.max(0, files.length - startCount);
    return { name: `Upload ${n + 1}`, meta: "JPG", image: `${R2}/${ADD_IMAGES[(n + offset) % ADD_IMAGES.length]}.jpg` };
  };
const LAUNCH_FILES: GlassFolderFile[] = [
  { name: "Hero still", meta: "JPG", image: `${R2}/h-05.jpg` },
  { name: "Keynote frame", meta: "JPG", image: `${R2}/h-06.jpg` },
  { name: "Social cut", meta: "JPG", image: `${R2}/h-07.jpg` },
];

const NUDGE_MS = 6000;

type Size = NonNullable<GlassFolderProps["size"]>;

// Folders are drawn in px; phones get a narrower one so it fits inside the gutter
function useMobileWidth(size: Size) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MEDIA.mobile);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile ? Math.min(GLASS_FOLDER_SIZES[size], MOBILE_WIDTH) : undefined;
}

interface Nudge {
  id: number;
  label: string;
  restore: () => void;
}

/** "Launch deleted · Restore": a short nudge to bring a deleted folder back. */
function RestoreNudge({ nudge, onDone }: { nudge: Nudge; onDone: () => void }) {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const t = window.setTimeout(onDone, NUDGE_MS);
    barRef.current?.animate([{ scale: "1 1" }, { scale: "0 1" }], {
      duration: NUDGE_MS,
      easing: "linear",
      fill: "forwards",
    });
    return () => window.clearTimeout(t);
  }, [nudge.id, onDone]);

  return (
    <div
      role="status"
      className="fixed bottom-[3vw] left-1/2 z-1000 flex -translate-x-1/2 items-center gap-4 overflow-hidden rounded-full border border-white/15 bg-[#141210]/90 py-2 pr-2 pl-5 text-sm text-[#f3efe9] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-lg max-md:bottom-[6vw]"
    >
      <span>
        <span className="text-[#f3efe9]/60">Deleted</span> {nudge.label}
      </span>
      <button
        id="glass-folder-demo-restore"
        type="button"
        onClick={() => {
          nudge.restore();
          onDone();
        }}
        className="cursor-pointer rounded-full bg-[#ff5f00] px-4 py-1.5 text-white transition-opacity duration-200 hover:opacity-85"
      >
        Restore
      </button>
      <span
        ref={barRef}
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-[#ff5f00]"
      />
    </div>
  );
}

function FolderRow({ values }: { values: Record<string, unknown> }) {
  const size = (values.size as Size) ?? "md";
  const width = useMobileWidth(size);
  const [assetsDeleted, setAssetsDeleted] = useState(false);
  const [launchDeleted, setLaunchDeleted] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>();
  const [created, setCreated] = useState<NewFolder[]>([]);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const nudgeId = useRef(0);
  const clearNudge = useCallback(() => setNudge(null), []);

  useEffect(() => setShareUrl(window.location.href), []);

  const offerRestore = (label: string, restore: () => void) =>
    setNudge({ id: nudgeId.current++, label, restore });

  // what every folder takes from the remixer
  const shared = {
    size,
    width,
    labelPlacement: values.labelPlacement as GlassFolderProps["labelPlacement"],
    duration: values.duration as number,
    appear: values.appear as boolean,
    maxVisible: values.maxVisible as number,
    tilt: values.tilt as number,
    radius: values.radius as number,
    fileRadius: values.fileRadius as number,
    rimColor: values.rimColor as string,
    rimWidth: values.rimWidth as number,
    glassBlur: values.glassBlur as number,
    shadow: values.shadow as boolean,
    accentColor: VAULT_PRIMARY,
    removable: true,
  } satisfies GlassFolderProps;

  return (
    <div className="flex flex-wrap items-end justify-center gap-[3vw] max-md:flex-col max-md:items-center max-md:gap-[10vw]">
      {/* the remixer sets layout and motion for every folder; artwork and glass are picked from each folder's own menu */}
      {assetsDeleted ? null : (
        <GlassFolder
          {...shared}
          label="Vault assets"
          action="both"
          renamable
          customizable
          shareUrl={shareUrl}
          onDelete={() => {
            setAssetsDeleted(true);
            offerRestore("Vault assets", () => setAssetsDeleted(false));
          }}
          tone="dark"
          art="vault"
          seed={3}
          files={ASSET_FILES}
          onAdd={addImage(ASSET_FILES.length)}
          appearDelay={0}
        />
      )}

      {launchDeleted ? null : (
        <GlassFolder
          {...shared}
          label="Launch"
          tone="light"
          art="aurora"
          seed={11}
          renamable
          customizable
          action="both"
          appearDelay={120}
          shareUrl={shareUrl}
          onDelete={() => {
            setLaunchDeleted(true);
            offerRestore("Launch", () => setLaunchDeleted(false));
          }}
          files={LAUNCH_FILES}
          onAdd={addImage(LAUNCH_FILES.length, 4)}
        />
      )}

      {created.map((folder, position) => (
        <GlassFolder
          {...shared}
          key={folder.id}
          label={folder.label}
          tone={folder.tone}
          art={folder.art}
          files={folder.files}
          onAdd={addImage(folder.files.length, folder.id * 3 + 2)}
          onDelete={() => {
            setCreated((current) => current.filter((f) => f.id !== folder.id));
            // put it back where it was
            offerRestore(folder.label, () =>
              setCreated((current) => [
                ...current.slice(0, position),
                folder,
                ...current.slice(position),
              ]),
            );
          }}
          action="both"
          renamable
          customizable
          shareUrl={shareUrl}
        />
      ))}

      <NewFolderBlock
        width={width ?? GLASS_FOLDER_SIZES[size]}
        onCreate={(folder) => setCreated((current) => [...current, folder])}
      />

      {nudge ? (
        <RestoreNudge key={nudge.id} nudge={nudge} onDone={clearNudge} />
      ) : null}
    </div>
  );
}

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="glass-folder"
      category="components"
      render={(values) => <FolderRow values={values} />}
      props={[
        {
          name: "labelPlacement",
          label: "Label placement",
          type: "string",
          default: "bottom-left",
          description: "Where the label sits on the front panel.",
          remixer: {
            control: "select",
            group: "layout",
            groupTitle: "Layout",
            options: [
              { label: "Bottom left", value: "bottom-left" },
              { label: "Top left", value: "top-left" },
              { label: "Top right", value: "top-right" },
            ],
          },
        },
        {
          name: "size",
          label: "Size",
          type: "string",
          default: "md",
          description: "Preset folder size: 260, 340 or 420px wide.",
          remixer: {
            control: "select",
            group: "layout",
            groupTitle: "Layout",
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ],
          },
        },
        {
          name: "maxVisible",
          label: "Visible files",
          type: "number",
          default: 4,
          description:
            "How many files stand in the pocket at once. The rest show as a +N badge.",
          remixer: {
            control: "range",
            group: "layout",
            groupTitle: "Layout",
            min: 1,
            max: 6,
            step: 1,
          },
        },
        { name: "radius", label: "Corner radius", type: "number", default: 22, description: "Corner radius of the folder's panels.", remixer: { control: "range", group: "look", groupTitle: "Look", min: 0, max: 30, step: 1 } },
        { name: "fileRadius", label: "File radius", type: "number", default: 6, description: "Corner radius of the files inside, in px.", remixer: { control: "range", group: "look", groupTitle: "Look", min: 0, max: 20, step: 1 } },
        { name: "rimColor", label: "Rim colour", type: "color", default: "#ffffff", description: "Colour of the glass edge and the back panel's outline.", remixer: { control: "color", group: "look", groupTitle: "Look" } },
        { name: "rimWidth", label: "Rim width", type: "number", default: 2.4, description: "Thickness of the glass edge, in px. 0 hides it.", remixer: { control: "range", group: "look", groupTitle: "Look", min: 0, max: 6, step: 0.2 } },
        { name: "glassBlur", label: "Glass blur", type: "number", default: 22, description: "How frosted the glass is: the blur behind it, in px.", remixer: { control: "range", group: "look", groupTitle: "Look", min: 0, max: 40, step: 1 } },
        { name: "shadow", label: "Shadow", type: "boolean", default: true, description: "The soft shadow under the folder.", remixer: { control: "checkbox", group: "look", groupTitle: "Look" } },
        {
          name: "duration",
          label: "Duration",
          type: "number",
          default: 1,
          description:
            "Multiplier for every move. 1 is house timing, 2 is half speed.",
          remixer: {
            control: "range",
            group: "motion",
            groupTitle: "Motion",
            min: 0.5,
            max: 3,
            step: 0.1,
          },
        },
        {
          name: "tilt",
          label: "Tilt",
          type: "number",
          default: 8,
          description:
            "How far the folder leans toward the pointer, in degrees. 0 keeps it flat.",
          remixer: {
            control: "range",
            group: "motion",
            groupTitle: "Motion",
            min: 0,
            max: 20,
            step: 1,
          },
        },
        {
          name: "appear",
          label: "Entrance",
          type: "boolean",
          default: true,
          description: "Assembles itself the first time it scrolls into view.",
          remixer: {
            control: "checkbox",
            group: "motion",
            groupTitle: "Motion",
          },
        },
      ]}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The folder works without moving.",
              body: "With reduced motion, Glass Folder skips its entrance and stops leaning toward the pointer. Opening, the menu, adding and removing files all switch state instantly, the preview swaps files in place instead of sliding, and Delete removes a folder straight away.",
            }}
          />
          <main className="flex min-h-screen w-full flex-col items-center justify-center gap-[4vw] bg-[#050505] px-[5vw] py-[7%] text-[#f3efe9] max-md:gap-[12vw] max-md:py-[25%]">
            <div className="flex flex-col items-center gap-[1vw] text-center max-md:gap-[3vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[9vw]">Glass Folder</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-[#f3efe9]/55 max-md:w-[80vw]">
                  Hover to lean the glass. Click to fan the files. Press + to
                  drop one in, open the menu, or make your own folder.
                </p>
              </SplitLine>
            </div>
            {effect}
          </main>
        </>
      )}
    </LocalRemixerDemo>
  );
}

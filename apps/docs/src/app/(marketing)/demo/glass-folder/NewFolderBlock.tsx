"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  GLASS_FOLDER_ART,
  type GlassFolderArtPreset,
  type GlassFolderFile,
  type GlassFolderProps,
} from "@/components/glass-folder";

export interface NewFolder {
  id: number;
  label: string;
  tone: NonNullable<GlassFolderProps["tone"]>;
  art: GlassFolderArtPreset;
  files: GlassFolderFile[];
}

const THEMES = Object.keys(GLASS_FOLDER_ART) as GlassFolderArtPreset[];
const MAX_FILES = 12;
// Pictures, PDFs and Word documents only
const ACCEPTED = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".docx"];
const isAccepted = (file: File) => ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext));

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Pictures show as themselves inside the folder; everything else is a sheet with its size
function toFolderFile(file: File, urls: string[]): GlassFolderFile {
  const meta = formatSize(file.size);
  if (!file.type.startsWith("image/")) return { name: file.name, meta };
  const image = URL.createObjectURL(file);
  urls.push(image);
  return { name: file.name, meta, image };
}

/**
 * A dashed "New folder" block. Opens a small form - name, theme, glass and files
 * from your own system - and hands the finished folder back to the demo.
 */
export default function NewFolderBlock({ width, onCreate }: { width: number; onCreate: (folder: NewFolder) => void }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState("");
  const [art, setArt] = useState<GlassFolderArtPreset>("vault");
  const [tone, setTone] = useState<NewFolder["tone"]>("dark");
  const [picked, setPicked] = useState<File[]>([]);
  // the theme tooltip: which swatch, where it sits, and whether it glides there or fades in
  const [tip, setTip] = useState({ index: 0, left: 0, on: false, glide: false });
  const nextId = useRef(0);
  // object URLs for uploaded pictures, released when the demo unmounts
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const reset = () => {
    setEditing(false);
    setLabel("");
    setArt("vault");
    setTone("dark");
    setPicked([]);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onCreate({
      id: nextId.current++,
      label: label.trim() || "New folder",
      tone,
      art,
      files: picked.slice(0, MAX_FILES).map((file) => toFolderFile(file, urls.current)),
    });
    reset();
  };

  if (!editing) {
    return (
      <button
        id="glass-folder-demo-new-folder"
        type="button"
        onClick={() => setEditing(true)}
        className="flex size-[9vw] cursor-pointer flex-col items-center justify-center gap-2 self-center rounded-[1vw] border border-dashed border-white/20 text-sm text-white/60 transition-colors duration-300 hover:border-[#ff5f00] hover:text-white max-lg:size-[18vw] max-lg:rounded-[2vw] max-md:size-[32vw] max-md:rounded-[4vw]"
      >
        <span className="grid size-9 place-items-center rounded-full bg-white/10 text-xl leading-none">+</span>
        New folder
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex aspect-[340/326] flex-col gap-4 overflow-y-auto rounded-md border border-white/15 bg-white/5 p-5 text-left text-sm backdrop-blur-lg [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25"
      style={{ width }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-white/50">Folder name</span>
        <input
          autoFocus
          value={label}
          maxLength={40}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="New folder"
          className="rounded-sm border border-white/20 bg-white/5 px-3 py-2 text-white outline-none transition-colors duration-200 placeholder:text-white/35 focus:border-[#ff5f00]"
        />
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="pb-1.5 text-white/50">Theme</legend>
        {/* one tooltip pill for the whole row: it slides to the hovered swatch, and its label rolls to the new name */}
        <div className="relative flex flex-wrap gap-2" onPointerLeave={() => setTip((t) => ({ ...t, on: false }))}>
          <span
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute bottom-full z-10 h-6 w-[72px] -translate-x-1/2 overflow-hidden rounded-sm bg-white text-xs text-black capitalize shadow-lg transition-[opacity,translate] duration-200",
              tip.on ? "-translate-y-1.5 opacity-100" : "translate-y-0 opacity-0",
              tip.glide && "transition-[left,opacity,translate] duration-300 ease-[cubic-bezier(.25,1,.5,1)]",
            )}
            style={{ left: tip.left }}
          >
            <span
              className="flex flex-col transition-transform duration-300 ease-[cubic-bezier(.25,1,.5,1)]"
              style={{ transform: `translateY(${-tip.index * 24}px)` }}
            >
              {THEMES.map((theme) => (
                <span key={theme} className="grid h-6 flex-none place-items-center">
                  {theme}
                </span>
              ))}
            </span>
          </span>
          {THEMES.map((theme, i) => {
            const colors = GLASS_FOLDER_ART[theme].colors;
            const showTip = (el: HTMLElement) =>
              setTip((t) => ({ index: i, left: el.offsetLeft + el.offsetWidth / 2, on: true, glide: t.on }));
            return (
              <button
                key={theme}
                type="button"
                aria-label={`${theme} theme`}
                aria-pressed={art === theme}
                onClick={() => setArt(theme)}
                onPointerEnter={(e) => showTip(e.currentTarget)}
                onFocus={(e) => showTip(e.currentTarget)}
                onBlur={() => setTip((t) => ({ ...t, on: false }))}
                className="block size-7 cursor-pointer rounded-full ring-1 ring-white/20 transition-[box-shadow] duration-200 aria-pressed:ring-2 aria-pressed:ring-[#ff5f00]"
                style={{ background: `linear-gradient(135deg, ${colors.join(", ")})` }}
              />
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-2">
        {(["dark", "light"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={tone === option}
            onClick={() => setTone(option)}
            className="flex-1 cursor-pointer rounded-full border border-white/20 py-1.5 capitalize text-white/60 transition-colors duration-200 aria-pressed:border-[#ff5f00] aria-pressed:bg-[#ff5f00] aria-pressed:text-white"
          >
            {option} glass
          </button>
        ))}
      </div>

      <label className="flex cursor-pointer flex-col gap-1.5">
        <span className="text-white/50">Files</span>
        <span className="rounded-md border border-dashed border-white/20 px-3 py-2 text-white/70 transition-colors duration-200 hover:border-[#ff5f00]">
          {picked.length ? "Add more files" : "Choose files from your computer"}
        </span>
        <span className="text-xs text-white/35">PNG, JPG, WEBP, PDF or DOCX</span>
        <input
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(e) => {
            const chosen = Array.from(e.target.files ?? []).filter(isAccepted);
            setPicked((current) => [...current, ...chosen].slice(0, MAX_FILES));
            // let the same file be picked again after removing it
            e.target.value = "";
          }}
        />
      </label>

      {picked.length ? (
        <ul className="flex flex-wrap gap-2">
          {picked.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="relative flex max-w-full items-center rounded-sm border border-white/15 bg-white/5 py-1.5 pr-3 pl-2.5 text-xs text-white/80"
            >
              <span className="truncate">{file.name}</span>
              {/* a small cross on the corner takes the file back out */}
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => setPicked((current) => current.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 grid size-4 cursor-pointer place-items-center rounded-full bg-white text-black transition-colors duration-200 hover:bg-[#ff5f00] hover:text-white"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-2.5 fill-none stroke-current stroke-[3] [stroke-linecap:round]">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="flex-1 cursor-pointer rounded-full border border-white/20 py-2 text-white/70 transition-colors duration-200 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 cursor-pointer rounded-full bg-[#ff5f00] py-2 text-white transition-opacity duration-200 hover:opacity-85"
        >
          Create
        </button>
      </div>
    </form>
  );
}

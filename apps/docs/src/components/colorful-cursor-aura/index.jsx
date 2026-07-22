
import ColorfulCursorAuraComp from './ColorfulCursorAuraComp'

const ColorfulCursorAura = () => {
  return (
     <div className="relative min-h-screen bg-white">
      <ColorfulCursorAuraComp
        text="One hover, and suddenly your UI has personality"
        colors={{
          color1: '#a78bfa',
          color2: '#fb7185',
          color3: '#fde68a',
        }}
        enableEntryAnimation={true}
      />

      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-white/10 p-3 text-center  max-md:hidden"
      >
        <h2 className="text-sm leading-none text-[#111111]">
          The aura keeps glowing.
        </h2>
        <p className="mt-2 text-xs leading-5 text-black/65">
          Colorful Cursor Aura renders continuously shifting color driven by
          cursor movement. The motion is the entire effect, so it
          can&apos;t be reduced.
        </p>
      </div>
    </div>
  )
}

export default ColorfulCursorAura

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

      
    </div>
  )
}

export default ColorfulCursorAura
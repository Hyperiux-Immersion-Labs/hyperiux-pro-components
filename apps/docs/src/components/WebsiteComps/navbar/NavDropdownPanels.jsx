'use client'

import { navCategoryColumns, navDocsItems } from '@/utils/Links'
import NavDropdownItem from './NavDropdownItem'

export function CategoriesPanel({ hoverGroupRef }) {
    return (
        <div className="grid grid-cols-2 gap-x-[1.6vw] gap-y-[0.15vw]">
            {navCategoryColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col">
                    {column.map((item) => (
                        <NavDropdownItem
                            key={item.label}
                            hoverGroupRef={hoverGroupRef}
                            {...item}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function DocsPanel({ hoverGroupRef }) {
    return (
        <div className="flex flex-col gap-[0.15vw]">
            {navDocsItems.map((item) => (
                <NavDropdownItem
                    key={item.label}
                    hoverGroupRef={hoverGroupRef}
                    {...item}
                />
            ))}
        </div>
    )
}

export const PANELS = {
    categories: { width: '35vw', Panel: CategoriesPanel, index: 0 },
    docs: { width: '18vw', Panel: DocsPanel, index: 1 },
}

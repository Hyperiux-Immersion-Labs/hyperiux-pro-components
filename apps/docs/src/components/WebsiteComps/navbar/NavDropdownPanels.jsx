'use client'

import { LayoutGroup } from 'motion/react'

import { navCategoryColumns, navDocsItems } from '@/utils/Links'
import NavDropdownItem from './NavDropdownItem'

export function CategoriesPanel({ hoverGroupRef }) {
    return (
        <LayoutGroup id="categories-pill">
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
        </LayoutGroup>
    )
}

export function DocsPanel({ hoverGroupRef }) {
    return (
        <LayoutGroup id="docs-pill">
            <div className="flex flex-col gap-[0.15vw]">
                {navDocsItems.map((item) => (
                    <NavDropdownItem
                        key={item.label}
                        hoverGroupRef={hoverGroupRef}
                        {...item}
                    />
                ))}
            </div>
        </LayoutGroup>
    )
}

export const PANELS = {
    categories: { width: '35vw', Panel: CategoriesPanel, index: 0 },
    docs: { width: '18vw', Panel: DocsPanel, index: 1 },
}

/**
 * @typedef {Object} ExpandingNavNestedLink
 * @property {string} name
 * @property {string} href
 */

/**
 * @typedef {Object} ExpandingNavSublink
 * @property {string} name
 * @property {string} href
 * @property {ExpandingNavNestedLink[]} [nestedLinks]
 */

/**
 * @typedef {Object} ExpandingNavItem
 * @property {string} name
 * @property {string} href
 * @property {ExpandingNavSublink[]} [sublinks]
 */

/** @type {ExpandingNavItem[]} */
export const navigationData = [
    {
        name: "About", href: "#",
    },
    { name: "Work", href: "#" },
    {
        name: "Expertise",
        href: "#",
        sublinks: [
            {
                name: "Solutions", href: "#", nestedLinks: [
                    { name: "Design", href: "#" },
                    { name: "Development", href: "#" },
                    { name: "Marketing", href: "#" },
                    { name: "Strategy", href: "#" }
                ]
            },
            {
                name: "Industry", href: "#", nestedLinks: [
                    { name: "Fintech", href: "#" },
                    { name: "HealthCare", href: "#" },
                    { name: "Education", href: "#" },
                    { name: "Electronics", href: "#" }
                ]
            },
            {
                name: "Services",
                href: "#",

            }
        ]
    },
    { name: "Career", href: "#" },
    {
        name: "Resources", href: "#", sublinks: [
            { name: "Codepen", href: "#" },
            { name: "Greensock", href: "#" },
            {
                name: "Webflow",
                href: "#",
            }
        ]
    },
    { name: "Contact", href: "#" },
];

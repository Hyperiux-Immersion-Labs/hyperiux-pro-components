'use client'
import { createContext, useContext, useState } from "react";

/**
 * @typedef {Object} PageContextValue
 * @property {number} page
 * @property {(page: number|((current: number) => number)) => void} setPage
 */

const PageContext = /** @type {import('react').Context<PageContextValue|undefined>} */ (createContext(/** @type {PageContextValue|undefined} */ (undefined)));

/**
 * @typedef {Object} PageProviderProps
 * @property {import('react').ReactNode} [children]
 */

/** @param {PageProviderProps} props */
export const PageProvider = ({ children }) => {
 const [page, setPage] = useState(0);

 return (
 <PageContext.Provider value={{ page, setPage }}>
 {children}
 </PageContext.Provider>
 );
};

export const usePage = () => {
 const context = useContext(PageContext);
 if (!context) {
 throw new Error("usePage must be used within PageProvider");
 }
 return context;
};

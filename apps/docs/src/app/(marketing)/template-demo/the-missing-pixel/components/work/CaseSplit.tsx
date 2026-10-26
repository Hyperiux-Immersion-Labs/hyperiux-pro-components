// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";

type CaseSplitProps = {
  title: string;
  children: ReactNode;
};

const CaseSplit = ({ title, children }: CaseSplitProps) => (
  <div className="grid grid-cols-12 gap-x-9 gap-y-6 max-lg:gap-x-6">
    <h3 className="text-30 col-span-4 self-start max-lg:col-span-12">{title}</h3>
    <div className="col-span-7 col-start-6 flex flex-col gap-6 max-lg:col-span-12 max-lg:col-start-1">{children}</div>
  </div>
);

export default CaseSplit;

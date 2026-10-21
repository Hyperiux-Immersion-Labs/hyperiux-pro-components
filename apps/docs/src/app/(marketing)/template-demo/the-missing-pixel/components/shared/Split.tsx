// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";

type SplitProps = {
  title: string;
  children: ReactNode;
};

const Split = ({ title, children }: SplitProps) => (
  <div className="flex justify-between gap-11 max-lg:flex-col max-lg:gap-6">
    <h3 className="text-30 sticky top-[14vh] w-[30%] self-start max-lg:static max-lg:w-full">{title}</h3>
    <div className="flex w-[62%] flex-col gap-6 max-lg:w-full">{children}</div>
  </div>
);

export default Split;

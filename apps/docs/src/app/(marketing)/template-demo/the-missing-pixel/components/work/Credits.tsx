// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp } from "../Animations/gsapAnim";

const Credits = ({ items }: { items: { role: string; names: string }[] }) => (
  <div className="flex flex-col gap-6">
    <h3 className="text-30">Credits</h3>
    <ul className="grid grid-cols-3 gap-x-9 gap-y-6 max-lg:grid-cols-2 max-md:grid-cols-1">
      {items.map((item, index) => (
        <FadeUp
          as="li"
          key={item.role}
          delay={(index % 3) * 0.08}
          className="flex flex-col gap-1 border-t border-(--mpx-ink)/10 py-[1.2vw] text-28 leading-[1.3] max-lg:py-[2.4vw] max-md:py-[4vw]"
        >
          <span className="text-14 text-mpx-muted">{item.role}</span>
          {item.names}
        </FadeUp>
      ))}
    </ul>
  </div>
);

export default Credits;

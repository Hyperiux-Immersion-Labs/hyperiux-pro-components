// Built using Hyperiux Vault: https://vault.hyperiux.com

import ScrollStack from "../effects/scroll-stack";

type Step = { title: string; text: string; time: string };

const StackCards = ({ steps }: { steps: Step[] }) => (
  <ScrollStack>
    {steps.map((step, index) => (
      <article
        key={step.title}
        className="flex min-h-[40vh] items-start gap-9 rounded-3xl border border-black/10 bg-white px-[4vw] py-[4vw] max-lg:min-h-[40vh] max-lg:flex-col max-lg:gap-5 max-lg:px-[5vw] max-lg:py-[6vw] max-md:min-h-0 max-md:px-[6vw] max-md:py-[8vw]"
      >
        <span className="font-mpx-head w-[14%] text-64 leading-none text-mpx-accent max-lg:w-full">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex w-[60%] flex-col gap-4 max-lg:w-full">
          <h3 className="text-30">{step.title}</h3>
          <p className="text-28 text-mpx-muted">{step.text}</p>
          <span className="text-14 text-[#0a0a0a]">{step.time}</span>
        </div>
      </article>
    ))}
  </ScrollStack>
);

export default StackCards;

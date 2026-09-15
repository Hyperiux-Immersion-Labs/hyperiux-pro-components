import Image from "next/image";

// Square avatar, name over role - no "Published by" label. The rail's other
// metadata rows carry their own labels, so one here read as noise.
export default function BlogAuthor({ author, className = "" }) {
  if (!author?.name) return null;

  return (
    <div className={`flex items-center gap-[0.9vw] max-[1025px]:gap-4 ${className}`}>
      {author.avatar?.url && (
        <div className="h-[4.2vw] w-[4.2vw] max-[1025px]:h-[10vw] max-[1025px]:w-[10vw] max-md:h-[14vw] max-md:w-[14vw] shrink-0 overflow-hidden">
          <Image
            src={author.avatar.url}
            alt={author.name}
            width={200}
            height={200}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-[0.4vw]">
        <p className="font-geist text-[0.9vw] leading-tight text-white max-[1025px]:text-[2.6vw] max-md:text-[3.6vw]">
          {author.name}
        </p>
        {author.role && (
          <p className="font-geist text-[0.9vw] leading-tight text-[#AEAEAE] max-[1025px]:text-[2.4vw] max-md:text-[3.4vw]">
            {author.role}
          </p>
        )}
      </div>
    </div>
  );
}

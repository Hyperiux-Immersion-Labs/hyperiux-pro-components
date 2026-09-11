import Image from "next/image";

export default function BlogAuthor({ author, className = "" }) {
  if (!author?.name) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {author.avatar?.url && (
        <div className="h-[5.5vw] w-[5.5vw] max-[1025px]:w-[10vw] max-[1025px]:h-[10vw] shrink-0 overflow-hidden rounded-full max-md:h-[14vw] max-md:w-[14vw]">
          <Image
            src={author.avatar.url}
            alt={author.name}
            width={200}
            height={200}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div>
        <p className="text-[0.8vw] max-[1025px]:text-[2.2vw] text-light-grey max-md:text-[3vw]">
          Published by
        </p>
        <p className="text22 text-white">{author.name}</p>
        {author.role && (
          <p className="text-[0.8vw] max-[1025px]:text-[2.2vw] text-light-grey max-md:text-[3vw]">
            {author.role}
          </p>
        )}
      </div>
    </div>
  );
}

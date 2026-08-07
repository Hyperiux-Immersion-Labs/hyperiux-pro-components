"use client";

import React from "react";

const Card = ({
 children,

 // optional structured content
 title,
 subtitle,
 content,
 footer,

 // style controls
 padding ="p-[2vw] max-[1025px]:p-[3vw] max-md:px-6 max-md:py-10",

 borderColor ="rgba(0,0,0,0.2)",
 bg ="",
 radius ="1.2vw",
 shadow = false,

 className ="",
}) => {
 return (
 <div
 className={`flex flex-col gap-[1.2vw] border max-[1025px]:gap-[2vw] max-md:w-full max-md:gap-[4vw] ${padding} ${radius ? `[border-radius:${radius}]` : ""} ${bg ? bg : ""} ${shadow ?"shadow-[0_10px_40px_rgba(0,0,0,0.08)]" :""} ${className}`}
 style={{
 borderColor,
 }}
 >
 {/* FULL CUSTOM MODE */}
 {children ? (
 children
 ) : (
 <>
 {title && (
 <div className="flex flex-col gap-[0.4vw]">
 <h3 className="m-0 text-[1.4vw] leading-[1.2] font-medium max-[1025px]:text-[3.5vw] max-md:text-[5.5vw]">{title}</h3>
 {subtitle && (
 <p className="m-0 text-[0.9vw] opacity-60 max-[1025px]:text-[2.2vw] max-md:text-[3.8vw]">{subtitle}</p>
 )}
 </div>
 )}

 {content && <div className="text-[1vw] leading-[1.7] opacity-80 max-[1025px]:text-[2.4vw] max-md:text-[4vw]">{content}</div>}

 {footer && <div className="mt-[0.5vw]">{footer}</div>}
 </>
 )}
 </div>
 );
};

export default Card;

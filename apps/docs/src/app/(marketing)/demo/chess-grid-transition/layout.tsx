import ChessGridTransition from "@/components/chess-grid-transition/ChessGridTransition";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <ChessGridTransition >
      <DemoHeader />
      {children}
    </ChessGridTransition>
  );
}

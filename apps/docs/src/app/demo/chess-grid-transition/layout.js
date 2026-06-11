import { ChessGridTransition } from "@/components/chess-grid-transition/ChessGridTransition";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

export default function layout({ children }) {
  return (
    <ChessGridTransition>
      <DemoHeader />
      {children}
    </ChessGridTransition>
  );
}

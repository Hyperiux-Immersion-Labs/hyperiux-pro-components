import DemoContent from "./DemoContent";
import sweepLiftRegistry from "../../../../../../../registry/effects/transitions/sweep-lift/registry.json";
import React from "react";

export default function layout({ children }) {
  return (
    <DemoContent registry={sweepLiftRegistry}>
      {children}
    </DemoContent>
  );
}

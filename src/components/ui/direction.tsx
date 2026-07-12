import * as React from "react";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";

interface DirectionProviderProps {
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
}

export function DirectionProvider({ children, dir = "ltr" }: DirectionProviderProps) {
  return <RadixDirectionProvider dir={dir}>{children}</RadixDirectionProvider>;
}

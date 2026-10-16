"use client";

import { MantineProvider } from "@mantine/core";

export default function Providers({ children }) {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  );
}
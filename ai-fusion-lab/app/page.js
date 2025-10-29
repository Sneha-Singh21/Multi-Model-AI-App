"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function Home() {
  const {setTheme} = useTheme();
  return (
    <div>
      <h1>Hello everyone, we are going to build the brand you project!</h1>
      <Button>Click to start</Button>
      <Button onClick={() => setTheme('dark')}>Dark Mode</Button>
      <Button onClick={() => setTheme('light')}>Light Mode</Button>

    </div>
  );
}

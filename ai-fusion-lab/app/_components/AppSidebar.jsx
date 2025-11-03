"use client";

import React, { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by not rendering until after mount
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="AI Fusion Logo" width={40} height={40} />
              <h2 className="font-bold text-xl">AI Fusion</h2>
            </div>
            <div>
              {theme === "light" ? (
                <Button variant="ghost" onClick={() => setTheme("dark")}>
                  <Moon />
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setTheme("light")}>
                  <Sun />
                </Button>
              )}
            </div>
          </div>
          <Button className="mt-7 w-full" size="lg">
            + New Chat
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="p-3">
            <h2 className="font-bold text-lg">Chat</h2>
            <p className="text-sm text-gray-400">
              Sign in to start chatting with multiple AI models.
            </p>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">
          <Button className="w-full" size="lg">
            Sign In/Sign Up
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

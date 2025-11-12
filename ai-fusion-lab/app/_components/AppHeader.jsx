"use client";

import React from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Github, Globe, Sparkles } from "lucide-react";
import Image from "next/image";

const AppHeader = () => {
  const { state } = useSidebar(); // 'expanded' or 'collapsed'

  return (
    <header
      className="w-full flex items-center justify-between h-[60px] px-4 
      border-b border-gray-100 dark:border-gray-800 
      bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm 
      transition-colors duration-300"
    >
      {/* Left: Sidebar trigger + Branding */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        {state === "collapsed" && (
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="AI Fusion Logo"
              width={30}
              height={30}
              className="rounded-md"
            />
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              <span className="font-semibold text-xl bg-linear-to-r from-blue-600 to-purple-500 text-transparent bg-clip-text">
                AI FusionLab
              </span>
            </h1>
          </div>
        )}
      </div>

      {/* Center tagline */}
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
        <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
        <span>Shaping the future of creation with intelligent collaborations</span>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
          <Github className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
          <Globe className="h-5 w-5" />
        </Button>
        <div
          className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 
          flex items-center justify-center text-white font-bold shadow-md cursor-pointer"
        >
          N
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

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
import { LogOut, Moon, Sun, User2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import UsageCreditProgress from "./UsageCreditProgress";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import moment from "moment";
import Link from "next/link";

const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    user && GetChatHistory();
  }, [user]);

  const GetChatHistory = async () => {
    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      setChatHistory((prev) => [...prev, doc.data()]);
    });
  };

  const GetLastUserMessagesFromChat = (chat) => {
    const allMessages = Object.values(chat.messages || {}).flat();
    const userMessages = allMessages.filter((msg) => msg.role === "user");

    const lastUserMsg =
      userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    const lastUpdatedAt = chat.updatedAt || Date.now();
    const formattedDate = moment(lastUpdatedAt).fromNow();

    return {
      chatId: chat.chatId,
      message: lastUserMsg ? lastUserMsg.content : "No messages yet.",
      updatedAt: formattedDate,
    };
  };

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Sidebar
      className="bg-linear-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 
      border-r border-gray-100 dark:border-gray-800 shadow-md transition-colors duration-300"
    >
      {/* ---------- Header Section ---------- */}
      <SidebarHeader>
        <div className="-mt-2.5 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Image
                  src="/logo.svg"
                  alt="AI Fusion Logo"
                  width={38}
                  height={38}
                  className="rounded-lg"
                />
                <span className="absolute inset-0 rounded-lg bg-blue-500/20 blur-md" />
              </div>
              <h2 className="font-semibold text-xl bg-linear-to-r from-blue-600 to-purple-500 text-transparent bg-clip-text">
                AI FusionLab
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hover:bg-blue-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-blue-600" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
            </Button>
          </div>

          {user ? (
            <Link href={"/"}>
              <Button className="mt-5 w-full rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all">
                + New Chat
              </Button>
            </Link>
          ) : (
            <SignInButton>
              <Button className="mt-6 w-full rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all">
                + New Chat
              </Button>
            </SignInButton>
          )}
        </div>
      </SidebarHeader>

      {/* ---------- Chat Section ---------- */}
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Chat
            </h3>
            {!user && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                Sign in to start chatting with multiple AI models.
              </p>
            )}

            {chatHistory.map((chat, idx) => (
              <Link href={"?chatId=" + chat.chatId} key={idx}>
                <div className="hover:bg-gray-100 p-3 cursor-pointer rounded-lg mb-2">
                  <h2 className="text-sm text-gray-400">
                    {GetLastUserMessagesFromChat(chat).updatedAt}
                  </h2>
                  <h2 className="text-lg line-clamp-1">
                    {GetLastUserMessagesFromChat(chat).message}
                  </h2>
                </div>
                <hr className="my-1" />
              </Link>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* ---------- Footer Section ---------- */}
      <SidebarFooter>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
          {!user ? (
            <SignInButton mode="modal">
              <Button className="w-full rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all">
                Sign In / Sign Up
              </Button>
            </SignInButton>
          ) : (
            <div className="space-y-3">
              <UsageCreditProgress />

              {/* Upgrade Plan Button */}
              <Button className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-blue-600 text-white hover:shadow-md transition-all">
                <Zap className="h-4 w-4" /> Upgrade Plan
              </Button>

              {/* Settings + Logout */}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
                >
                  <User2 className="h-4 w-4" /> Settings
                </Button>

                <SignOutButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 transition"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </SignOutButton>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

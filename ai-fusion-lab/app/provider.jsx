"use client";

import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar.jsx";
import AppHeader from "./_components/AppHeader.jsx";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore"; // ✅ Import these
import { db } from "@/config/FirebaseConfig"; // ✅ Use only this

const Provider = ({ children, ...props }) => {
  const { user } = useUser();

  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      CreateNewUser();
    }
  }, [user]);

  const CreateNewUser = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const userRef = doc(db, "users", userEmail);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userData = {
          name: user?.fullName,
          email: userEmail,
          remainingMsg: 5,
          credits: 1000,
          plan: "free",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userRef, userData);
        console.log("✅ New user created successfully");
      } else {
        console.log("ℹ️ User already exists");
      }
    } catch (error) {
      console.error("❌ Error creating user:", error);
    }
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <AppHeader />
          {children}
        </div>
      </SidebarProvider>
    </NextThemesProvider>
  );
};

export default Provider;

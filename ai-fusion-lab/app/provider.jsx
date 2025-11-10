"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar.jsx";
import AppHeader from "./_components/AppHeader.jsx";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { DefaultModel } from "@/shared/AiModelsShared.jsx";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext.js";
import { UserDetailContext } from "@/context/UserDetailContext.js";

const Provider = ({ children, ...props }) => {
  const { user } = useUser();

  // ✅ Correct state initialization
  const [aiSelectedModel, setAiSelectedModel] = useState(DefaultModel);
  const [ userDetails, setUserDetails ] = useState();

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      CreateNewUser();
    }
  }, [user]);

  const CreateNewUser = async () => {
    try {
      const userEmail = user.primaryEmailAddress.emailAddress;
      const userRef = doc(db, "users", userEmail);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userData = {
          name: user.fullName,
          email: userEmail,
          remainingMsg: 5,
          credits: 1000,
          plan: "free",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userRef, userData);
        console.log("✅ New user created successfully");
        setUserDetails(userData);
      } else {
        console.log("ℹ️ User already exists");
        const userInfo = userSnap.data();
        setAiSelectedModel(userInfo?.selectedModelPref);
        setUserDetails(userInfo);
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
      {/* ✅ Provide aiSelectedModel to the entire app */}

      <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
        <AiSelectedModelContext.Provider value={{ aiSelectedModel, setAiSelectedModel }}>
          <SidebarProvider>
            <AppSidebar />
            <div className="w-full">
              <AppHeader />
              {children}
            </div>
          </SidebarProvider>
        </AiSelectedModelContext.Provider>
      </UserDetailContext.Provider>
    </NextThemesProvider>
  );
};

export default Provider;

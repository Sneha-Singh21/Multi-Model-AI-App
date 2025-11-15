"use client";

import React, { useEffect, useState, useRef } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar.jsx";
import AppHeader from "./_components/AppHeader.jsx";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { DefaultModel } from "@/shared/AiModelsShared.jsx";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext.js";
import { UserDetailContext } from "@/context/UserDetailContext.js";
import AiModelList from "@/shared/AiModelList.jsx";

const Provider = ({ children, ...props }) => {
  const { user } = useUser();

  const [aiSelectedModel, setAiSelectedModel] = useState(DefaultModel);
  const [aiModelList, setAiModelList] = useState(AiModelList);
  const [userDetails, setUserDetails] = useState();
  const [messages, setMessages] = useState({});
  const prevModelRef = useRef(DefaultModel);

  // 🔥 Track local updates to stop Firestore overwriting them
  const lastLocalUpdateRef = useRef(0);

  const [isUpdatingFirestore, setIsUpdatingFirestore] = useState(false);

  // 1️⃣ Create or Fetch User
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      createOrFetchUser();
    }
  }, [user]);

  const createOrFetchUser = async () => {
    try {
      const userEmail = user.primaryEmailAddress.emailAddress;
      const userRef = doc(db, "users", userEmail);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUser = {
          name: user.fullName,
          email: userEmail,
          plan: "free",
          remainingMsg: 5,
          credits: 1000,
          selectedModelPref: DefaultModel,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userRef, newUser, { merge: true });
        setUserDetails(newUser);

        setAiSelectedModel(DefaultModel);

        setAiModelList((prevList) =>
          prevList.map((m) => ({
            ...m,
            enable: !!DefaultModel?.[m.model]?.enable,
          }))
        );

        prevModelRef.current = DefaultModel;
      } else {
        const userInfo = userSnap.data();
        setUserDetails(userInfo);

        const remote = userInfo?.selectedModelPref || {};

        // ⭐ Correct merging logic — do NOT override with DefaultModel again
        const mergedSelected = { ...DefaultModel, ...remote };

        setAiSelectedModel(mergedSelected);

        setAiModelList((prevList) =>
          prevList.map((m) => {
            const saved = remote?.[m.model];
            return saved ? { ...m, enable: !!saved.enable } : m;
          })
        );

        prevModelRef.current = mergedSelected;
      }
    } catch (error) {
      console.error("❌ Error creating/fetching user:", error);
    }
  };

  // 2️⃣ Listen to Firestore changes
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const userEmail = user.primaryEmailAddress.emailAddress;
    const docRef = doc(db, "users", userEmail);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) return;

      if (isUpdatingFirestore) return;

      // Stop overwrite if local UI update was recent
      if (Date.now() - lastLocalUpdateRef.current < 700) return;

      const data = snapshot.data();
      const newSelected = data?.selectedModelPref ?? {};

      // ⭐ IMPORTANT FIX:
      // Create merged state WITHOUT forcing defaults again.
      const mergedSelected = { ...prevModelRef.current, ...newSelected };

      setAiSelectedModel((prev) => {
        const keys = new Set([...Object.keys(prev), ...Object.keys(mergedSelected)]);
        let changed = false;

        for (const key of keys) {
          if (
            prev[key]?.enable !== mergedSelected[key]?.enable ||
            prev[key]?.modelId !== mergedSelected[key]?.modelId
          ) {
            changed = true;
            break;
          }
        }
        return changed ? mergedSelected : prev;
      });

      setAiModelList((prevList) =>
        prevList.map((m) => {
          const saved = mergedSelected?.[m.model];
          return saved ? { ...m, enable: !!saved.enable } : m;
        })
      );
    });

    return () => unsubscribe();
  }, [user, isUpdatingFirestore]);

  // 3️⃣ Debounced Firestore Update
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const timeout = setTimeout(() => {
      updateChangedModelOnly();
    }, 500);

    return () => clearTimeout(timeout);
  }, [aiSelectedModel]);

  // 4️⃣ Write only changed model fields
  const updateChangedModelOnly = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const docRef = doc(db, "users", userEmail);

      const prev = prevModelRef.current;
      const current = aiSelectedModel;

      const changedModels = {};

      for (const key of Object.keys(current)) {
        const oldVal = prev[key] || {};
        const newVal = current[key] || {};

        if (oldVal.enable !== newVal.enable || oldVal.modelId !== newVal.modelId) {
          changedModels[`selectedModelPref.${key}`] = newVal;
        }
      }

      if (Object.keys(changedModels).length > 0) {
        setIsUpdatingFirestore(true);

        await setDoc(docRef, changedModels, { merge: true });

        prevModelRef.current = { ...current };

        // Mark local action time
        lastLocalUpdateRef.current = Date.now();

        setTimeout(() => setIsUpdatingFirestore(false), 800);
      }
    } catch (error) {
      console.error("❌ Firestore update error:", error);
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
      <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
        <AiSelectedModelContext.Provider
          value={{
            aiSelectedModel,
            setAiSelectedModel,
            aiModelList,
            setAiModelList,
            messages,
            setMessages,
          }}
        >
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

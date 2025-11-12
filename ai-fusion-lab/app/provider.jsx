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

  // 1️⃣ Create or Fetch User from Firestore
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      createOrFetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          messages: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // ✅ Use merge:true to avoid accidental overwrites
        await setDoc(userRef, newUser, { merge: true });
        setUserDetails(newUser);
        setAiSelectedModel(DefaultModel);
        setAiModelList((prevList) =>
          prevList.map((m) => ({
            ...m,
            enable: !!DefaultModel?.[m.model]?.enable,
          }))
        );
      } else {
        const userInfo = userSnap.data();

        setUserDetails(userInfo);
        setAiSelectedModel({
          ...DefaultModel,
          ...(userInfo?.selectedModelPref || {}),
        });
        setMessages(userInfo?.messages ?? {});

        // ✅ Ensure UI model list reflects Firestore enable states
        setAiModelList((prevList) =>
          prevList.map((m) => {
            const saved = userInfo?.selectedModelPref?.[m.model];
            return saved ? { ...m, enable: !!saved.enable } : m;
          })
        );

        prevModelRef.current = {
          ...DefaultModel,
          ...(userInfo?.selectedModelPref || {}),
        };
      }
    } catch (error) {
      console.error("❌ Error creating/fetching user:", error);
    }
  };

  // 2️⃣ Real-time Firestore Sync
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const userEmail = user.primaryEmailAddress.emailAddress;
    const docRef = doc(db, "users", userEmail);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const newSelected = data?.selectedModelPref ?? {};
      const newMessages = data?.messages ?? {};

      // ✅ Prevent unnecessary re-renders
      setAiSelectedModel((prev) => {
        const hasChange =
          Object.keys(newSelected).some(
            (key) =>
              prev[key]?.enable !== newSelected[key]?.enable ||
              prev[key]?.modelId !== newSelected[key]?.modelId
          ) ||
          Object.keys(prev).length !== Object.keys(newSelected).length;

        return hasChange ? { ...prev, ...newSelected } : prev;
      });

      // ✅ Keep UI toggle states synced
      setAiModelList((prevList) => {
        const firestoreModels = Object.keys(newSelected || {});
        const mergedList = [
          ...prevList,
          ...firestoreModels
            .filter((fm) => !prevList.find((m) => m.model === fm))
            .map((fm) => ({
              model: fm,
              enable: !!newSelected[fm]?.enable,
            })),
        ];

        return mergedList.map((m) => {
          const saved = newSelected?.[m.model];
          return saved ? { ...m, enable: !!saved.enable } : m;
        });
      });

      // ✅ Merge Firestore messages with local messages (avoid overwriting)
      setMessages((prev) => ({ ...prev, ...newMessages }));
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 3️⃣ Debounced Firestore Update on Model Change
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const timeout = setTimeout(() => {
      updateChangedModelOnly();
    }, 500); // Slightly higher debounce for Firestore safety

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSelectedModel]);

  // 4️⃣ Update Only Changed Models (Optimized + Batched)
  const updateChangedModelOnly = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const docRef = doc(db, "users", userEmail);
      const prev = prevModelRef.current;
      const current = aiSelectedModel;

      const changedModels = {};
      for (const modelKey of Object.keys(current)) {
        const prevModel = prev[modelKey] || {};
        const currModel = current[modelKey] || {};

        const changed =
          prevModel.enable !== currModel.enable ||
          prevModel.modelId !== currModel.modelId;

        if (changed) {
          changedModels[`selectedModelPref.${modelKey}`] = currModel;
        }
      }

      if (Object.keys(changedModels).length > 0) {
        // ✅ Single batched Firestore write
        await setDoc(docRef, changedModels, { merge: true });
        prevModelRef.current = { ...current };
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

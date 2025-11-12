"use client";

import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import AiMultiModels from "./AiMultiModels.jsx";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext.js";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const ChatInputBox = () => {
  const [userInput, setUserInput] = useState("");
  const { aiSelectedModel, messages, setMessages } = useContext(AiSelectedModelContext);
  const { user } = useUser();

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const currentInput = userInput.trim();
    setUserInput("");

    // 🧠 Get all enabled models (only those with enable=true and modelId)
    const activeModels = Object.entries(aiSelectedModel).filter(
      ([_, info]) => info.enable && info.modelId
    );

    if (activeModels.length === 0) {
      console.warn("⚠️ No enabled models found to send message");
      return;
    }

    // 1️⃣ Add user message to all enabled models
    setMessages((prev) => {
      const updated = { ...prev };
      activeModels.forEach(([key]) => {
        updated[key] = [...(updated[key] ?? []), { role: "user", content: currentInput }];
      });
      return updated;
    });

    // 2️⃣ Add “Thinking...” placeholder before API call
    setMessages((prev) => {
      const updated = { ...prev };
      activeModels.forEach(([key]) => {
        updated[key] = [
          ...(updated[key] ?? []),
          { role: "assistant", content: "loading", model: key, loading: true },
        ];
      });
      return updated;
    });

    // 3️⃣ Run all API calls in parallel
    const results = await Promise.allSettled(
      activeModels.map(async ([parentModel, modelInfo]) => {
        try {
          const res = await axios.post("/api/ai-multi-model", {
            model: modelInfo.modelId,
            msg: [{ role: "user", content: currentInput }],
            parentModel,
          });
          return { parentModel, aiResponse: res.data.aiResponse };
        } catch (err) {
          if (err.response?.status === 402) {
            return {
              parentModel,
              aiResponse: "⚠️ Credit limit reached. Please upgrade your plan.",
            };
          }
          console.error(`❌ Error fetching response for ${parentModel}:`, err);
          return { parentModel, aiResponse: "⚠️ Error fetching response." };
        }
      })
    );

    // 4️⃣ Update messages for each model with AI responses
    results.forEach((r) => {
      if (!r.value && !r.aiResponse) return;
      const { parentModel, aiResponse } = r.value ?? r;

      setMessages((prev) => {
        const updated = { ...prev };
        const msgs = [...(updated[parentModel] ?? [])];
        const idx = msgs.findIndex((m) => m.loading);

        if (idx !== -1) {
          msgs[idx] = {
            role: "assistant",
            content: aiResponse,
            model: parentModel,
            loading: false,
          };
        } else {
          msgs.push({
            role: "assistant",
            content: aiResponse,
            model: parentModel,
            loading: false,
          });
        }

        updated[parentModel] = msgs;

        // ✅ Firestore save AFTER React updates (ensures correct data)
        if (user?.primaryEmailAddress?.emailAddress) {
          const userEmail = user.primaryEmailAddress.emailAddress;
          const docRef = doc(db, "users", userEmail);
          setDoc(docRef, { messages: { [parentModel]: msgs } }, { merge: true });
        }

        return updated;
      });
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      <div>
        <AiMultiModels />
      </div>

      {/* Chat input */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4 bg-transparent">
        <div
          className="w-full max-w-3xl border border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-900 dark:text-gray-100 rounded-xl shadow-md 
          flex px-4 py-2 gap-2 transition-colors duration-300"
        >
          <div className="flex items-end pb-1">
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 flex items-end">
            <textarea
              rows={1}
              placeholder="Ask me anything..."
              className="flex-1 resize-none overflow-y-auto bg-transparent border-none outline-none 
                text-[15px] py-2 placeholder-gray-500 dark:placeholder-gray-400 
                text-gray-800 dark:text-gray-100 max-h-[150px]"
              style={{ minHeight: "40px" }}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <div className="flex items-end gap-2 pb-1">
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="bg-blue-700 hover:bg-blue-800 text-white"
              onClick={handleSend}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInputBox;

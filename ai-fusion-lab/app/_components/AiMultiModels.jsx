"use client";

import React, { useContext } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { CopyIcon, Loader, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AiMultiModels = () => {
  const {
    aiSelectedModel,
    setAiSelectedModel,
    aiModelList,
    setAiModelList,
    messages,
  } = useContext(AiSelectedModelContext);

  // 🛡 Guard — prevent crash if aiModelList is undefined
  if (!aiModelList || !Array.isArray(aiModelList)) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-gray-500 dark:text-gray-400">
        Loading models...
      </div>
    );
  }

  const onToggleChange = (modelKey, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === modelKey ? { ...m, enable: value } : m))
    );

    setAiSelectedModel((prev) => ({
      ...prev,
      [modelKey]: {
        ...(prev?.[modelKey] ?? {}),
        enable: value,
      },
    }));
  };

  const onSelectedValue = (parentModel, value) => {
    setAiSelectedModel((prev) => ({
      ...prev,
      [parentModel]: {
        ...(prev?.[parentModel] ?? {}),
        modelId: value,
      },
    }));
  };

  return (
    <div
      className="flex flex-1 h-[83vh] overflow-x-auto overflow-y-hidden scroll-smooth 
      bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 
      rounded-2xl shadow-inner transition-colors duration-300"
    >
      <div className="flex flex-row min-w-full w-max">
        {aiModelList.map((model, index) => (
          <div
            key={index}
            className={`flex flex-col transition-all duration-300 border-r border-gray-100/40 dark:border-gray-800/40 ${
              model.enable
                ? "flex-1 min-w-[400px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                : "w-[110px] flex-none bg-gray-50/80 dark:bg-gray-800/80"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-linear-to-br from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 shadow-sm">
                  <Image
                    src={model.icon}
                    alt={model.model}
                    width={24}
                    height={24}
                    className="rounded-md"
                  />
                </div>

                {model.enable && (
                  <Select
                    value={aiSelectedModel?.[model.model]?.modelId ?? undefined}
                    onValueChange={(value) =>
                      onSelectedValue(model.model, value)
                    }
                    disabled={model.premium}
                  >
                    <SelectTrigger className="w-[170px] text-sm border-gray-200 dark:border-gray-700 rounded-lg bg-white/70 dark:bg-gray-800/70 dark:text-gray-100">
                      <SelectValue
                        placeholder={
                          aiSelectedModel?.[model.model]?.modelId ||
                          "Select model"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-lg dark:bg-gray-900 dark:text-gray-100">
                      <SelectGroup>
                        <SelectLabel className="text-xs text-gray-500 dark:text-gray-400 px-2">
                          Free Models
                        </SelectLabel>
                        {model.subModel
                          .filter((sub) => !sub.premium)
                          .map((subModel, i) => (
                            <SelectItem key={i} value={subModel.id}>
                              {subModel.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-xs text-gray-500 dark:text-gray-400 px-2">
                          Premium
                        </SelectLabel>
                        {model.subModel
                          .filter((sub) => sub.premium)
                          .map((subModel, i) => (
                            <SelectItem
                              key={i}
                              value={subModel.id}
                              disabled={subModel.premium}
                            >
                              {subModel.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                {model.enable ? (
                  <Switch
                    checked={model.enable}
                    onCheckedChange={(v) => onToggleChange(model.model, v)}
                  />
                ) : (
                  <MessageSquare
                    className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-500 transition"
                    onClick={() => onToggleChange(model.model, true)}
                    size={25}
                  />
                )}
              </div>
            </div>

            {/* Chat / Upgrade */}
            {model.enable ? (
              model.premium ? (
                <div className="flex items-center justify-center flex-1">
                  <Button className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-indigo-700">
                    <Lock className="w-4 h-4" /> Upgrade to unlock
                  </Button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-4 py-4 bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
                  <div className="space-y-4 pb-2">
                    {(messages?.[model.model] ?? []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none"
                          }`}
                          style={{
                            marginBottom: "0.5rem", // 👈 extra spacing between message groups
                          }}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {msg.model ?? model.model}
                              </div>

                              {msg.content &&
                                msg.content !== "loading" &&
                                msg.content !==
                                  "⚠️ Error fetching response." && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        msg.content
                                      );
                                      const toast =
                                        document.createElement("div");
                                      toast.textContent =
                                        "Copied to clipboard!";
                                      toast.className =
                                        "fixed bottom-10 right-6 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg shadow-md animate-fadeIn z-[9999]";
                                      document.body.appendChild(toast);
                                      setTimeout(() => toast.remove(), 1800);
                                    }}
                                    className="h-6 w-6 text-gray-500 dark:text-gray-400 opacity-0 hover:opacity-100 transition-opacity duration-300 hover:text-blue-600"
                                    title="Copy response"
                                  >
                                    <CopyIcon className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                          )}

                          {msg.content === "loading" ? (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                              <Loader className="animate-spin h-4 w-4" />
                              <span>Thinking...</span>
                            </div>
                          ) : (
                            <div
                              className="whitespace-pre-line wrap-break-word text-[14px] prose dark:prose-invert"
                              style={{ lineHeight: "1.5" }}
                            >
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center flex-1 text-gray-400 dark:text-gray-500 text-sm">
                <p className="-rotate-90 whitespace-nowrap tracking-wider">
                  {model.model}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiMultiModels;

"use client";

import AiModelList from "@/shared/AiModelList.jsx";
import React, { useContext, useState } from "react";
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
import { Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const AiMultiModels = () => {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState(AiModelList);
  const { aiSelectedModel, setAiSelectedModel } = useContext(AiSelectedModelContext);

  const onToggleChange = (model, value) => {
    setAiModelList((models) =>
      models.map((m) => (m.model === model ? { ...m, enable: value } : m))
    );
  };

  const onSelectedValue = async (parentModel, value) => {
    const updatedSelection = {
      ...aiSelectedModel,
      [parentModel]: { modelId: value },
    };

    setAiSelectedModel(updatedSelection);

    if (user?.primaryEmailAddress?.emailAddress) {
      const docRef = doc(db, "users", user.primaryEmailAddress.emailAddress);
      await setDoc(docRef, { selectedModelPref: updatedSelection }, { merge: true });
    }
  };

  return (
    <div className="flex flex-1 h-[80vh] border-b">
      {aiModelList.map((model, index) => (
        <div
          key={index}
          className={`flex flex-col border-r h-full overflow-auto ${
            model.enable ? "flex-1 min-w-[400px]" : "w-[100px] flex-none"
          }`}
        >
          <div className="flex w-full h-[70px] items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <Image src={model.icon} alt={model.model} width={24} height={24} />

              {model.enable && (
                <Select
                  defaultValue={aiSelectedModel?.[model.model]?.modelId}
                  onValueChange={(value) => onSelectedValue(model.model, value)}
                  disabled={model.premium}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={aiSelectedModel?.[model.model]?.modelId || "Select model"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="px-3">
                      <SelectLabel className="text-sm text-gray-400">Free</SelectLabel>
                      {model.subModel
                        .filter((sub) => !sub.premium)
                        .map((subModel, i) => (
                          <SelectItem key={i} value={subModel.id}>
                            {subModel.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup className="px-3">
                      <SelectLabel className="text-sm text-gray-400">Premium</SelectLabel>
                      {model.subModel
                        .filter((sub) => sub.premium)
                        .map((subModel, i) => (
                          <SelectItem key={i} value={subModel.id} disabled={subModel.premium}>
                            {subModel.name}{" "}
                            {subModel.premium && <Lock className="h-4 w-4 inline ml-1" />}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              {model.enable ? (
                <Switch checked={model.enable} onCheckedChange={(v) => onToggleChange(model.model, v)} />
              ) : (
                <MessageSquare
                  className="cursor-pointer"
                  onClick={() => onToggleChange(model.model, true)}
                />
              )}
            </div>
          </div>

          {model.premium && model.enable && (
            <div className="flex items-center justify-center h-full">
              <Button>
                <Lock /> Upgrade to unlock
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AiMultiModels;

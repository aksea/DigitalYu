import { useEffect, useMemo } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { collectModelsWithDefaultModel } from "./model";

export function useAllModels() {
  const accessStore = useAccessStore();
  const configStore = useAppConfig();
  const serverProviderStatus = accessStore.serverProviderStatus ?? {};

  useEffect(() => {
    accessStore.fetch();
  }, [accessStore]);

  const providerAvailability = useMemo(
    () => ({
      openai: !!accessStore.openaiApiKey || !!serverProviderStatus.openai,
      azure:
        (!!accessStore.azureApiKey && !!accessStore.azureUrl) ||
        !!serverProviderStatus.azure,
      google: !!accessStore.googleApiKey || !!serverProviderStatus.google,
      anthropic:
        !!accessStore.anthropicApiKey || !!serverProviderStatus.anthropic,
      baidu:
        (!!accessStore.baiduApiKey && !!accessStore.baiduSecretKey) ||
        !!serverProviderStatus.baidu,
      bytedance:
        !!accessStore.bytedanceApiKey || !!serverProviderStatus.bytedance,
      alibaba: !!accessStore.alibabaApiKey || !!serverProviderStatus.alibaba,
      tencent:
        (!!accessStore.tencentSecretId && !!accessStore.tencentSecretKey) ||
        !!serverProviderStatus.tencent,
      moonshot: !!accessStore.moonshotApiKey || !!serverProviderStatus.moonshot,
      iflytek:
        (!!accessStore.iflytekApiKey && !!accessStore.iflytekApiSecret) ||
        !!serverProviderStatus.iflytek,
      deepseek: !!accessStore.deepseekApiKey || !!serverProviderStatus.deepseek,
      xai: !!accessStore.xaiApiKey || !!serverProviderStatus.xai,
      chatglm: !!accessStore.chatglmApiKey || !!serverProviderStatus.chatglm,
      siliconflow:
        !!accessStore.siliconflowApiKey || !!serverProviderStatus.siliconflow,
      ai302: !!accessStore.ai302ApiKey || !!serverProviderStatus.ai302,
      stability:
        !!accessStore.stabilityApiKey || !!serverProviderStatus.stability,
    }),
    [
      accessStore.ai302ApiKey,
      accessStore.alibabaApiKey,
      accessStore.anthropicApiKey,
      accessStore.baiduApiKey,
      accessStore.baiduSecretKey,
      accessStore.bytedanceApiKey,
      accessStore.chatglmApiKey,
      accessStore.deepseekApiKey,
      accessStore.googleApiKey,
      accessStore.iflytekApiKey,
      accessStore.iflytekApiSecret,
      accessStore.moonshotApiKey,
      accessStore.openaiApiKey,
      accessStore.siliconflowApiKey,
      accessStore.stabilityApiKey,
      accessStore.tencentSecretId,
      accessStore.tencentSecretKey,
      accessStore.xaiApiKey,
      accessStore.azureApiKey,
      accessStore.azureUrl,
      serverProviderStatus.ai302,
      serverProviderStatus.alibaba,
      serverProviderStatus.anthropic,
      serverProviderStatus.baidu,
      serverProviderStatus.bytedance,
      serverProviderStatus.chatglm,
      serverProviderStatus.deepseek,
      serverProviderStatus.google,
      serverProviderStatus.iflytek,
      serverProviderStatus.moonshot,
      serverProviderStatus.openai,
      serverProviderStatus.siliconflow,
      serverProviderStatus.stability,
      serverProviderStatus.tencent,
      serverProviderStatus.xai,
      serverProviderStatus.azure,
    ],
  );
  const models = useMemo(() => {
    const collected = collectModelsWithDefaultModel(
      configStore.models,
      [configStore.customModels, accessStore.customModels].join(","),
      accessStore.defaultModel,
    );
    return collected.filter((model) => {
      const providerId = model.provider?.id;
      if (!providerId) return true;
      const isAvailable =
        providerAvailability[providerId as keyof typeof providerAvailability];
      if (isAvailable === undefined) return true;
      return isAvailable;
    });
  }, [
    accessStore.customModels,
    accessStore.defaultModel,
    configStore.customModels,
    configStore.models,
    providerAvailability,
  ]);

  return models;
}

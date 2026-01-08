import { NextResponse } from "next/server";

import { getServerSideConfig } from "../../config/server";

const serverConfig = getServerSideConfig();

// Danger! Do not hard code any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig.needCode,
  hideUserApiKey: serverConfig.hideUserApiKey,
  disableGPT4: serverConfig.disableGPT4,
  hideBalanceQuery: serverConfig.hideBalanceQuery,
  disableFastLink: serverConfig.disableFastLink,
  customModels: serverConfig.customModels,
  defaultModel: serverConfig.defaultModel,
  visionModels: serverConfig.visionModels,
  serverProviderStatus: {
    openai: !!serverConfig.apiKey,
    azure: !!serverConfig.azureApiKey && !!serverConfig.azureUrl,
    google: !!serverConfig.googleApiKey,
    anthropic: !!serverConfig.anthropicApiKey,
    baidu: !!serverConfig.baiduApiKey && !!serverConfig.baiduSecretKey,
    bytedance: !!serverConfig.bytedanceApiKey,
    alibaba: !!serverConfig.alibabaApiKey,
    tencent: !!serverConfig.tencentSecretId && !!serverConfig.tencentSecretKey,
    moonshot: !!serverConfig.moonshotApiKey,
    iflytek: !!serverConfig.iflytekApiKey && !!serverConfig.iflytekApiSecret,
    deepseek: !!serverConfig.deepseekApiKey,
    xai: !!serverConfig.xaiApiKey,
    chatglm: !!serverConfig.chatglmApiKey,
    siliconflow: !!serverConfig.siliconFlowApiKey,
    ai302: !!serverConfig.ai302ApiKey,
    stability: !!serverConfig.stabilityApiKey,
  },
};

declare global {
  type DangerConfig = typeof DANGER_CONFIG;
}

async function handle() {
  return NextResponse.json(DANGER_CONFIG);
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";

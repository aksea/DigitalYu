import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX, ModelProvider } from "../constant";

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isApiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  return {
    accessCode: isApiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isApiKey ? token : "",
  };
}

export function auth(req: NextRequest, modelProvider: ModelProvider) {
  const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  const { accessCode, apiKey } = parseApiKey(authToken);

  const hashedCode = md5.hash(accessCode ?? "").trim();

  const serverConfig = getServerSideConfig();
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (serverConfig.needCode && !serverConfig.codes.has(hashedCode) && !apiKey) {
    return {
      error: true,
      msg: !accessCode ? "empty access code" : "wrong access code",
    };
  }

  if (serverConfig.hideUserApiKey && !!apiKey) {
    return {
      error: true,
      msg: "you are not allowed to access with your own api key",
    };
  }

  // if user does not provide an api key, inject system api key
  if (!apiKey) {
    const serverConfig = getServerSideConfig();

    // const systemApiKey =
    //   modelProvider === ModelProvider.GeminiPro
    //     ? serverConfig.googleApiKey
    //     : serverConfig.isAzure
    //     ? serverConfig.azureApiKey
    //     : serverConfig.apiKey;

    let systemApiKey: string | undefined;
    let missingKeyHint = "missing API key";

    switch (modelProvider) {
      case ModelProvider.Stability:
        systemApiKey = serverConfig.stabilityApiKey;
        missingKeyHint = "missing STABILITY_API_KEY in server env vars";
        break;
      case ModelProvider.GeminiPro:
        systemApiKey = serverConfig.googleApiKey;
        missingKeyHint = "missing GOOGLE_API_KEY in server env vars";
        break;
      case ModelProvider.Claude:
        systemApiKey = serverConfig.anthropicApiKey;
        missingKeyHint = "missing ANTHROPIC_API_KEY in server env vars";
        break;
      case ModelProvider.Doubao:
        systemApiKey = serverConfig.bytedanceApiKey;
        missingKeyHint = "missing BYTEDANCE_API_KEY in server env vars";
        break;
      case ModelProvider.Ernie:
        systemApiKey = serverConfig.baiduApiKey;
        missingKeyHint =
          "missing BAIDU_API_KEY or BAIDU_SECRET_KEY in server env vars";
        break;
      case ModelProvider.Qwen:
        systemApiKey = serverConfig.alibabaApiKey;
        missingKeyHint = "missing ALIBABA_API_KEY in server env vars";
        break;
      case ModelProvider.Moonshot:
        systemApiKey = serverConfig.moonshotApiKey;
        missingKeyHint = "missing MOONSHOT_API_KEY in server env vars";
        break;
      case ModelProvider.Iflytek:
        if (serverConfig.iflytekApiKey && serverConfig.iflytekApiSecret) {
          systemApiKey =
            serverConfig.iflytekApiKey + ":" + serverConfig.iflytekApiSecret;
        }
        missingKeyHint =
          "missing IFLYTEK_API_KEY or IFLYTEK_API_SECRET in server env vars";
        break;
      case ModelProvider.DeepSeek:
        systemApiKey = serverConfig.deepseekApiKey;
        missingKeyHint = "missing DEEPSEEK_API_KEY in server env vars";
        break;
      case ModelProvider.XAI:
        systemApiKey = serverConfig.xaiApiKey;
        missingKeyHint = "missing XAI_API_KEY in server env vars";
        break;
      case ModelProvider.ChatGLM:
        systemApiKey = serverConfig.chatglmApiKey;
        missingKeyHint = "missing CHATGLM_API_KEY in server env vars";
        break;
      case ModelProvider.SiliconFlow:
        systemApiKey = serverConfig.siliconFlowApiKey;
        missingKeyHint = "missing SILICONFLOW_API_KEY in server env vars";
        break;
      case ModelProvider.GPT:
      default:
        if (req.nextUrl.pathname.includes("azure/deployments")) {
          systemApiKey = serverConfig.azureApiKey;
          missingKeyHint = "missing AZURE_API_KEY in server env vars";
        } else {
          systemApiKey = serverConfig.apiKey;
          missingKeyHint = "missing OPENAI_API_KEY in server env vars";
        }
    }

    if (systemApiKey) {
      console.log("[Auth] use system api key");
      req.headers.set("Authorization", `Bearer ${systemApiKey}`);
    } else {
      console.log("[Auth] admin did not provide an api key");
      return {
        error: true,
        msg: missingKeyHint,
      };
    }
  } else {
    console.log("[Auth] use user api key");
  }

  return {
    error: false,
  };
}

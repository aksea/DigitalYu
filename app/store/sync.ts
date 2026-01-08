import { getClientConfig } from "../config/client";
import { ApiPath, STORAGE_KEY, StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import { GetStoreState } from "../utils/sync";
import { downloadAs, getMessageTextContent } from "../utils";
import { showToast } from "../components/ui-lib";
import Locale from "../locales";
import { ProviderType } from "../utils/cloud";
import { useChatStore } from "./chat";
import { useParticipantStore } from "./participant";

type ExportedQA = {
  question: string;
  answer: {
    content: string;
    feedback: "like" | "dislike" | "none";
    comment: string;
  };
};

const isApp = !!getClientConfig()?.isApp;
export type SyncStore = GetStoreState<typeof useSyncStore>;

const DEFAULT_SYNC_STATE = {
  provider: ProviderType.WebDAV,
  useProxy: true,
  proxyUrl: ApiPath.Cors as string,

  webdav: {
    endpoint: "",
    username: "",
    password: "",
  },

  upstash: {
    endpoint: "",
    username: STORAGE_KEY,
    apiKey: "",
  },

  lastSyncTime: 0,
  lastProvider: "",
};

export const useSyncStore = createPersistStore(
  DEFAULT_SYNC_STATE,
  (set, _get) => ({
    export() {
      const participantName = useParticipantStore.getState().name.trim();
      const { sessions } = useChatStore.getState();
      const datePart = isApp
        ? `${new Date().toLocaleDateString().replace(/\//g, "_")} ${new Date()
            .toLocaleTimeString()
            .replace(/:/g, "_")}`
        : new Date().toLocaleString();
      const safeDatePart = datePart.replace(/[\\/:*?"<>|]+/g, "_");

      let exportCount = 0;

      sessions.forEach((session) => {
        if (session.messages.length === 0) return;
        const qa: ExportedQA[] = [];
        let pendingQuestion = "";

        session.messages.forEach((message) => {
          if (message.role === "user") {
            pendingQuestion = getMessageTextContent(message).trim();
            return;
          }
          if (message.role !== "assistant") return;
          if (!pendingQuestion) return;

          qa.push({
            question: pendingQuestion,
            answer: {
              content: getMessageTextContent(message).trim(),
              feedback:
                message.feedback === "up"
                  ? "like"
                  : message.feedback === "down"
                  ? "dislike"
                  : "none",
              comment: message.comment ?? "",
            },
          });
          pendingQuestion = "";
        });

        const payload = {
          userName: participantName,
          model: session.mask.modelConfig.model,
          qa,
        };
        const safeTopic = session.topic
          .replace(/[\\/:*?"<>|]+/g, "-")
          .trim();
        const baseName = safeTopic.length > 0 ? safeTopic : session.id;
        const fileName = `Session-${baseName}-${safeDatePart}.json`;
        downloadAs(JSON.stringify(payload, null, 2), fileName);
        exportCount += 1;
      });

      if (exportCount === 0) {
        showToast(Locale.SearchChat.Page.NoData);
      }

      set({ lastSyncTime: Date.now(), lastProvider: "export" });
    },
  }),
  {
    name: StoreKey.Sync,
    version: 1.2,

    migrate(persistedState, version) {
      const newState = persistedState as typeof DEFAULT_SYNC_STATE;

      if (version < 1.1) {
        newState.upstash.username = STORAGE_KEY;
      }

      if (version < 1.2) {
        if (
          (persistedState as typeof DEFAULT_SYNC_STATE).proxyUrl ===
          "/api/cors/"
        ) {
          newState.proxyUrl = "";
        }
      }

      return newState as any;
    },
  },
);

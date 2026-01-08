import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";

const DEFAULT_PARTICIPANT_STATE = {
  name: "",
};

export const useParticipantStore = createPersistStore(
  { ...DEFAULT_PARTICIPANT_STATE },
  (set) => ({
    setName(name: string) {
      set(() => ({ name }));
    },
    clearName() {
      set(() => ({ name: "" }));
    },
  }),
  {
    name: StoreKey.Participant,
    version: 1,
  },
);

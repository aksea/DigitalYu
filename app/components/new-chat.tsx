import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useChatStore } from "../store";
import styles from "./new-chat.module.scss";

export function NewChat() {
  const chatStore = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    chatStore.newSession();
    navigate(Path.Chat);
  }, [chatStore, navigate]);

  return <div className={styles["new-chat"]} />;
}

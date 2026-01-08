import styles from "./auth.module.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { IconButton } from "./button";
import { PasswordInput, showToast } from "./ui-lib";
import BotIcon from "../icons/bot.svg";
import LeftIcon from "@/app/icons/left.svg";
import clsx from "clsx";
import Locale from "../locales";
import { useParticipantStore } from "../store/participant";

export function AuthPage() {
  const navigate = useNavigate();
  const participantStore = useParticipantStore();
  const [name, setName] = useState(participantStore.name ?? "");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast(Locale.Auth.Input);
      return;
    }
    participantStore.setName(trimmed);
    navigate(Path.Chat);
  };

  return (
    <div className={styles["auth-page"]}>
      <div className={styles["auth-header"]}>
        <IconButton
          icon={<LeftIcon />}
          text={Locale.Auth.Return}
          onClick={() => navigate(Path.Home)}
        ></IconButton>
      </div>
      <div className={clsx("no-dark", styles["auth-logo"])}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
      <div className={styles["auth-tips"]}>{Locale.Auth.Tips}</div>

      <PasswordInput
        style={{ marginTop: "3vh", marginBottom: "3vh" }}
        aria={Locale.Settings.ShowPassword}
        aria-label={Locale.Auth.Input}
        value={name}
        type="text"
        placeholder={Locale.Auth.Input}
        onChange={(e) => setName(e.currentTarget.value)}
      />

      <div className={styles["auth-actions"]}>
        <IconButton text={Locale.Auth.Confirm} type="primary" onClick={submit} />
      </div>
    </div>
  );
}

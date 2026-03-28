"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.message}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button onClick={reset} className={styles.button}>
        Try again
      </button>
    </div>
  );
}

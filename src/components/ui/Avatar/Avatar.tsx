import styles from "./Avatar.module.css";

type AvatarProps = {
  initials: string;
  size?: "sm" | "md" | "lg";
  gradient?: "warm" | "cool" | "brand";
};

function pickGradient(initials: string): "warm" | "cool" | "brand" {
  const hash = initials.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const options = ["warm", "cool", "brand"] as const;
  return options[hash % 3];
}

export default function Avatar({ initials, size = "md", gradient }: AvatarProps) {
  const g = gradient ?? pickGradient(initials);
  return (
    <div className={`${styles.avatar} ${styles[size]} ${styles[g]}`}>
      {initials}
    </div>
  );
}

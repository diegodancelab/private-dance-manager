import styles from "./Card.module.css";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
};

export default function Card({ children, className, as: Tag = "div" }: CardProps) {
  return (
    <Tag className={`${styles.card} ${className ?? ""}`}>
      {children}
    </Tag>
  );
}

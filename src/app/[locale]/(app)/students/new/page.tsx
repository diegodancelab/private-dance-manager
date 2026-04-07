import StudentCreateForm from "./StudentCreateForm";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function NewStudentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StudentCreateForm />;
}
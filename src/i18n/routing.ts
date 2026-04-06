import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "es", "lv"],
  defaultLocale: "fr",
});

export type Locale = (typeof routing.locales)[number];

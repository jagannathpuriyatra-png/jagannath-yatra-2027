import { createFileRoute } from "@tanstack/react-router";
import { RegistrationPage } from "@/components/pages/RegistrationPage";

export const Route = createFileRoute("/registration")({
  head: () => ({
    meta: [
      { title: "ऑनलाइन रजिस्ट्रेशन — श्री जगन्नाथ धाम यात्रा" },
      { name: "description", content: "पुरी तीर्थ यात्रा के लिए ऑनलाइन पंजीकरण करें। ₹2,500 टोकन राशि से सीट आरक्षित करें।" },
      { property: "og:title", content: "ऑनलाइन रजिस्ट्रेशन — श्री जगन्नाथ धाम यात्रा" },
      { property: "og:description", content: "पुरी तीर्थ यात्रा के लिए ऑनलाइन पंजीकरण करें। ₹2,500 टोकन राशि से सीट आरक्षित करें।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegistrationPage,
});

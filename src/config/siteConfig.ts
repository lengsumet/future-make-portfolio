export const siteConfig = {
  owner: {
    name: "Sumet Buarod",
    email: "sumet.buarod@gmail.com",
    phone: "095-803-9303",
    location: "Chum Phae, Khon Kaen 40130",
    title: "Software Engineer",
    company: "Ngernturbo Public Company Limited",
  },
  site: {
    name: "Sumet Buarod",
    title: "Sumet Buarod | Software Engineer",
    description:
      "Software Engineer specializing in high-performance distributed systems and cloud-native architecture. Expert in C#, .NET Core, Python, Golang, and React/Next.js.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://sumetbuarod.dev",
  },
  social: {
    github: "https://github.com/sumetbuarod",
    linkedin: "https://linkedin.com/in/sumetbuarod",
    email: "mailto:sumet.buarod@gmail.com",
  },
  shop: {
    currency: "THB",
    currencySymbol: "฿",
    promptpayId: "0958039303",
  },
} as const;

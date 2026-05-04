export const siteConfig = {
  name: "Aklile Yilma",
  title: "AI-native full-stack developer",
  /** Hero headline (full name is intentionally not the focal H1). */
  heroHeadline: {
    line1: "AI-native products,",
    line2: "engineered to ship.",
  },
  description:
    "AI-native full-stack developer shipping SaaS, mobile, backends, and AI automation for direct clients and product teams in the US and EU. Book a call or message on WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aklile-yilma.dev",
  /** Query param appended to the site URL for referral tracking (share this link). */
  referralParam: "ref",
  referralParamValue: "direct",
  scarcityLine:
    "I take on 2 projects at a time to deliver my full attention and ship quality.",
  calLink: process.env.NEXT_PUBLIC_CAL_LINK ?? "demo",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "+251987307893",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "aklileyilma@gmail.com",
  linkedin:
    process.env.NEXT_PUBLIC_LINKEDIN ??
    "https://www.linkedin.com/in/aklile-yilma-software-engineer-b1217b233/",
  upwork:
    process.env.NEXT_PUBLIC_UPWORK ??
    "https://www.upwork.com/freelancers/~015e59a7c6f0697375",
  github: process.env.NEXT_PUBLIC_GITHUB ?? "",
};

export function siteBaseUrl() {
  return siteConfig.url.replace(/\/$/, "");
}

/** Link to share with people who may refer a client (tracking-friendly). */
export function referralShareUrl(referralCode?: string) {
  const u = new URL(siteBaseUrl());
  u.searchParams.set(
    siteConfig.referralParam,
    referralCode ?? siteConfig.referralParamValue,
  );
  return u.toString();
}

export function whatsappHref() {
  const n = siteConfig.whatsapp.replace(/\D/g, "");
  if (!n) return "#contact";
  return `https://wa.me/${n}?text=${encodeURIComponent("Hi Aklile — I saw your site and would like to discuss a project.")}`;
}

export function whatsappProfileHref() {
  const n = siteConfig.whatsapp.replace(/\D/g, "");
  if (!n) return "#contact";
  return `https://wa.me/${n}`;
}

export function mailtoHref() {
  const subject = encodeURIComponent("Project inquiry");
  return `mailto:${siteConfig.email}?subject=${subject}`;
}

import type { Metadata } from "next";
import { PoliciesContent } from "./PoliciesContent";

export const metadata: Metadata = {
  title: "Policies & Terms",
  description:
    "Transparency is fundamental to trust. Review our cancellation policy, payment terms, privacy policy, and media policy to understand how we operate and protect your interests.",
};

export default function Policies() {
  return <PoliciesContent />;
}


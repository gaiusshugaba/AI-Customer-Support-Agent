import { createFileRoute, Link } from "@tanstack/react-router";
import { Headset, LifeBuoy, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SignOutButton, SupportWidget } from "@/components/support/SupportWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlowStack Help Centre — AI Customer Support" },
      {
        name: "description",
        content:
          "Get instant answers from the FlowStack AI support assistant, attach screenshots and hand off to a human agent when you need one.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "FlowStack Help Centre — AI Customer Support" },
      {
        property: "og:description",
        content:
          "Chat with the FlowStack AI support assistant, share screenshots and reach a human agent when needed.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpCentrePage,
});

const CARDS = [
  {
    icon: Sparkles,
    title: "Instant answers",
    body: "The assistant searches our product documentation to answer plan, billing and setup questions.",
  },
  {
    icon: LifeBuoy,
    title: "Share a screenshot",
    body: "Attach a PNG, JPG or WEBP image of what you're seeing so we can diagnose the issue faster.",
  },
  {
    icon: ShieldCheck,
    title: "Human handoff",
    body: "If your issue needs a specialist, we collect the details and pass it to our support team.",
  },
];

function HelpCentrePage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <span className="flex items-center gap-2 font-semibold">
              <Headset className="h-5 w-5 text-primary" /> FlowStack Support
            </span>
            <div className="flex items-center gap-2">
              <SignOutButton />
              <Button asChild variant="ghost" size="sm">
                <Link to="/overview">Ops console</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            Help with FlowStack, whenever you need it
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Open the support chat in the corner to start a conversation. Your history is saved to your
            account, so you can pick up where you left off.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {CARDS.map((card) => (
              <article key={card.title} className="rounded-xl border border-border bg-card p-5">
                <card.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-3 text-base font-medium">{card.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{card.body}</p>
              </article>
            ))}
          </div>
        </main>
      </div>

      <SupportWidget />
    </>
  );
}

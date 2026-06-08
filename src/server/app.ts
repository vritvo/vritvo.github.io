import { Hono } from "hono";

// Bindings come from wrangler.jsonc `vars` and Worker secrets (RESEND_API_KEY).
// They are passed in from the Astro endpoint via `app.fetch(request, env)`.
type Bindings = {
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
};

export const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

app.post("/contact", async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body." }, 400);
  }

  // Honeypot: real users leave this empty. Pretend success for bots.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return c.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return c.json({ error: "Name, email, and message are all required." }, 400);
  }
  if (!isEmail(email)) {
    return c.json({ error: "Please enter a valid email address." }, 400);
  }
  if (message.length > 5000) {
    return c.json({ error: "Message is too long." }, 400);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: c.env.CONTACT_FROM,
      to: [c.env.CONTACT_TO],
      reply_to: email,
      subject: `New contact form message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend error", res.status, detail);
    return c.json(
      { error: "Could not send your message. Please try again later." },
      502,
    );
  }

  return c.json({ ok: true });
});

export default app;

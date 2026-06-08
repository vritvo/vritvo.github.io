import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { app } from "../../server/app";

// Server-rendered on the Worker (everything else stays prerendered/static).
export const prerender = false;

// Hand all /api/* requests to the Hono app, passing Cloudflare bindings as env.
export const ALL: APIRoute = (context) => app.fetch(context.request, env);

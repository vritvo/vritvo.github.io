// @ts-check
import { defineConfig } from 'astro/config';

// Check if production mode
const isProd = process.env.NODE_ENV === 'production';

// https://astro.build/config

// Set different site / base depending on if in production / dev
export default defineConfig({
    site: isProd ? 'https://vritvo.github.io' : 'http://localhost:4321',
    base: isProd ? '/vr_website' : '/',
});
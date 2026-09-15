# Manzil-e-Amaan Architecture & Agent Directives

## Tech Stack & Architecture
- Framework: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Database: PostgreSQL (Raw parameterized SQL via pg pool, no heavy ORMs)
- Security: Edge rate-limiting (Upstash), Jose (HttpOnly JWTs), Zod schema validation
- Visuals: Framer Motion (micro-interactions), React Three Fiber (Three.js with Draco compression)
- External: Meta WhatsApp Cloud API (HMAC SHA-256 webhook verification)

## Core Business Constraints
- Operational model: Strictly 12-hour rental shifts; fuel is excluded.
- Private hosts: Strictly capped at 1 active vehicle.
- Driver options: "With Driver Only" or "Both (Flexible)".
- File storage: Keep all downloads, models, and assets within D:\manzil-e-amaan.
- Secrets: Never commit credentials; use .env.local and .env.example.
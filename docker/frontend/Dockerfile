# ---------------------------------------------------------------------------
# Stage 1: dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
# Stage 2: builder — Next.js বিল্ড টাইমে NEXT_PUBLIC_* ভ্যারিয়েবল ক্লায়েন্ট বান্ডেলে
# ইনলাইন হয়ে যায় (রানটাইমে পরিবর্তন করা যায় না), তাই এগুলো build ARG হিসেবে নিতে হয় —
# CI/CD পাইপলাইনে `docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.durbeen.com/v1`
# আকারে পাস করতে হবে।
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_MEDIA_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_MEDIA_BASE_URL=${NEXT_PUBLIC_MEDIA_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: runner — .next/standalone শুধু প্রয়োজনীয় node_modules ট্রেস করে নিজের
# ভেতরে নিয়ে আসে, তাই এই ফাইনাল স্টেজে আলাদা করে node_modules কপি করার দরকার নেই —
# ইমেজ সাইজ অনেক ছোট হয় (সাধারণত ~150-200MB এর জায়গায় ~50-80MB)।
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

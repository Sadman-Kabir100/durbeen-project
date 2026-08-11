# ---------------------------------------------------------------------------
# Stage 1: deps — সব ডিপেন্ডেন্সি (dev + prod) ইনস্টল, layer caching-এর জন্য আলাদা
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
# Stage 2: build — TypeScript কম্পাইল করে dist/ তৈরি করা হয়। এই স্টেজে ইচ্ছাকৃতভাবে
# devDependencies prune করা হয় না — কারণ docker-compose.prod.yml-এর "migrate"
# one-off সার্ভিস ঠিক এই স্টেজটাকেই (--target build) ব্যবহার করে migration চালাতে,
# যার জন্য ts-node/tsconfig-paths (devDependencies) দরকার। prune করা হয় পরের
# আলাদা "prod-deps" স্টেজে, যাতে এই স্টেজ কখনো "দূষিত" (pruned) না হয়।
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: prod-deps — সম্পূর্ণ আলাদা, ফ্রেশ install যেখানে শুরু থেকেই শুধু production
# ডিপেন্ডেন্সি (--omit=dev) — "build" স্টেজের node_modules prune করা হচ্ছে না,
# বরং সম্পূর্ণ নতুন ইনস্টল, যাতে stage আলাদা থাকা নিশ্চিত হয় এবং কোনো ক্রস-স্টেজ
# mutation এর ঝুঁকি না থাকে।
# ---------------------------------------------------------------------------
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---------------------------------------------------------------------------
# Stage 4: production — শুধু compiled dist/ + production-only node_modules কপি হয়,
# সোর্স TypeScript/dev-tooling কিছুই final ইমেজে থাকে না
# ---------------------------------------------------------------------------
FROM node:20-alpine AS production
WORKDIR /app

# dumb-init: PID 1 হিসেবে সরাসরি Node চালালে SIGTERM ঠিকমতো propagate নাও হতে পারে
# (graceful shutdown-এর জন্য জরুরি — docker stop/Kubernetes rolling update-এ)
RUN apk add --no-cache dumb-init

# non-root ইউজার — নিরাপত্তা নীতি: কন্টেইনার কখনো root হিসেবে অ্যাপ চালাবে না
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs nestjs

COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

ENV NODE_ENV=production
EXPOSE 4000

# healthcheck — docker-compose/orchestrator এটা দিয়ে কন্টেইনার সুস্থ কিনা বোঝে
# (backend-এ /health এন্ডপয়েন্ট আছে — src/modules/health/, DB কানেকশন পিং করে)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
# ⚠️ "-r tsconfig-paths/register" ব্যবহার করা হচ্ছে না — কারণ "tsconfig-paths"
# devDependency, prod-deps স্টেজে নেই। build স্টেজে "tsc-alias" ইতিমধ্যে dist/-এর
# সব "@/" পাথ-অ্যালিয়াস রিলেটিভ পাথে রিরাইট করে দিয়েছে, তাই রানটাইমে
# tsconfig-paths/register ছাড়াই dist/main.js সরাসরি চলে।
CMD ["node", "dist/main.js"]

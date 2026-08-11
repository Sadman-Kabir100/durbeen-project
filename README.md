# Durbeen (দূরবীন) — সম্পূর্ণ প্রজেক্ট (Frontend + Backend + Infrastructure)

Next.js + NestJS + PostgreSQL + Redis দিয়ে তৈরি একটি ই-কমার্স প্ল্যাটফর্ম।

---

## 🚀 BEGINNER START (শুধু এই কয়েক ধাপ)

1. **Docker Desktop ইনস্টল করুন:** https://www.docker.com/products/docker-desktop/ (ইনস্টলের পর একবার চালু করুন, সিস্টেম ট্রে-তে 🐳 আইকন স্থির/সবুজ না হওয়া পর্যন্ত অপেক্ষা করুন)
2. এই প্রজেক্ট ফোল্ডার (ZIP এক্সট্র্যাক্ট করা) খুলুন, তার ভেতরে PowerShell খুলুন (ফোল্ডারের ভেতরে গিয়ে ঠিকানা বারে `powershell` লিখে Enter দিলেই খুলবে), অথবা:
   ```powershell
   cd "F:\The Normative Official\Software\durbeen-project"
   ```
3. একটাই কমান্ড চালান:
   ```powershell
   .\scripts\setup.ps1
   ```
4. স্ক্রিপ্ট শেষ হলে ব্রাউজারে খুলুন: **http://localhost**

ব্যস — PostgreSQL, Redis, Backend, Frontend, Nginx সবকিছু স্বয়ংক্রিয়ভাবে চালু হয়ে যাবে। `.env` ফাইল, ডাটাবেজ পাসওয়ার্ড, JWT সিক্রেট — সবকিছু স্ক্রিপ্ট নিজে থেকেই তৈরি করে নেয়, কিছু ম্যানুয়ালি এডিট করার দরকার নেই। Node.js/PostgreSQL/Redis নিজে ইনস্টল করার প্রয়োজন নেই — সব Docker কন্টেইনারের ভেতরে চলে।

Docker Desktop চালু না থাকলে স্ক্রিপ্ট নিজেই স্পষ্ট করে বলে দেবে কী করতে হবে।

**প্রথম অ্যাডমিন ইউজার তৈরি করতে** (ঐচ্ছিক, সাইটটা দেখতে লাগবে না):
```powershell
.\scripts\seed.ps1
```

সমস্যা হলে নিচের "সমস্যা সমাধান" সেকশন দেখুন, অথবা এরর মেসেজ কপি করে জানান।

---

## ⚠️ এই প্রজেক্টের বর্তমান স্কোপ (সততার সাথে জানানো)

এই monorepo-তে **যা আছে তা সম্পূর্ণ ও ইন্টারনালি consistent**, কিন্তু এটা একটা সম্পূর্ণ ই-কমার্স সাইট না —
নিচে স্পষ্ট তালিকা:

### ✅ সম্পূর্ণ ও কার্যকর
- **Authentication** — ফোন + OTP লগইন, JWT access/refresh টোকেন, RBAC (role/permission)
- **Users ফাউন্ডেশন** — ইউজার এনটিটি, রোল অ্যাসাইনমেন্ট
- **Orders ফাউন্ডেশন** — অর্ডার স্ট্যাটাস স্টেট-মেশিন, ট্র্যাকিং টাইমলাইন
- **Payments** — SSLCommerz, bKash, Nagad, Rocket (স্বচ্ছভাবে সীমিত — কোডের কমেন্ট দেখুন), Cash on Delivery
- **Delivery/Shipment tracking** — কুরিয়ার স্ট্যাটাস, ট্র্যাকিং ইভেন্ট, Order status এর সাথে সিঙ্ক
- **Refund (আংশিক)** — কোর লজিক আছে, কাস্টমার-facing UI নেই
- **Admin Panel (ফ্রন্টএন্ড শুধু Dashboard)** — সাইডবার, ড্যাশবোর্ড, KPI/অর্ডার/লো-স্টক উইজেট (মক ডেটাসহ)
- **সম্পূর্ণ ইনফ্রাস্ট্রাকচার** — Docker, Docker Compose (dev+prod), Nginx, Redis, PostgreSQL,
  SSL (Certbot), ব্যাকআপ, মনিটরিং (Prometheus/Grafana), লগিং (Loki/Promtail)

### ❌ এখনো নেই (পরবর্তী মাইলস্টোন)
- Product, Category, Inventory, Cart, Review, Coupon মডিউল (ব্যাকএন্ড)
- Notification মডিউলের পূর্ণাঙ্গ সংস্করণ (এখন শুধু console-এ OTP লগ হয়)
- Elasticsearch-ভিত্তিক Search মডিউল (docker-compose-এ কন্টেইনার প্রস্তুত আছে, কিন্তু কোনো
  ব্যাকএন্ড কোড এখনো এটা ব্যবহার করে না)
- পাবলিক সাইটের হোমপেজ/ক্যাটাগরি/প্রোডাক্ট/কার্ট/চেকআউট পেজ (শুধু placeholder আছে)
- Admin Panel-এর Users/Roles/Products/Categories/Inventory/Orders/Payments/Coupons/Analytics পেজ

**তাই এই মুহূর্তে আপনি যা টেস্ট করতে পারবেন:** ব্যাকএন্ড API (Auth → OTP লগইন → পেমেন্ট initiate →
শিপমেন্ট ট্র্যাকিং) এবং ফ্রন্টএন্ডে অ্যাডমিন ড্যাশবোর্ড UI।

### 🔧 আমি verify করতে পারিনি
এই ডেভেলপমেন্ট পরিবেশে npm registry ও Docker ডেমন অ্যাক্সেসযোগ্য না থাকায় আমি নিজে
`docker compose up` চালিয়ে result verify করতে পারিনি — সব কোড সতর্কভাবে ম্যানুয়াল রিভিউ করা
হয়েছে। নিজের PC-তে প্রথমবার চালানোর সময় যদি কোনো এরর দেখেন, exact এরর মেসেজ জানালে সাথে সাথে
ঠিক করে দেব।

---

## প্রজেক্ট স্ট্রাকচার

```
project/
├── frontend/          # Next.js
├── backend/           # NestJS
├── docker/            # Dockerfile, Nginx, Redis, PostgreSQL init, Backup, Monitoring, Logging কনফিগ
├── scripts/           # Windows PowerShell হেল্পার স্ক্রিপ্ট (setup.ps1, migrate.ps1, seed.ps1)
├── docker-compose.yml       # Development (এখনই এটাই ব্যবহার হচ্ছে)
├── docker-compose.prod.yml  # Production (এখনো সক্রিয় করা হয়নি — নিচে সেকশন ৭ দেখুন)
├── .env.example       # env টেমপ্লেট — setup.ps1 স্বয়ংক্রিয়ভাবে .env বানায় এটা থেকে
├── .gitignore
└── README.md          # এই ফাইল
```

---

## ১. প্রতিদিনের ডেভেলপমেন্ট ওয়ার্কফ্লো

| কাজ | কমান্ড |
|---|---|
| সার্ভিস চালু করা (প্রথমবার/পরে) | `.\scripts\setup.ps1` অথবা `docker compose up -d` |
| সার্ভিস বন্ধ করা | `docker compose down` |
| সার্ভিস বন্ধ + ডাটাবেজ ডেটা মুছে ফেলা | `docker compose down -v` ⚠️ ডেটা হারাবে |
| লগ দেখা (সব সার্ভিস) | `docker compose logs -f` |
| লগ দেখা (শুধু backend) | `docker compose logs -f backend` |
| নতুন migration চালানো | `.\scripts\migrate.ps1` |
| নতুন migration ফাইল জেনারেট করা | `docker compose exec backend npm run migration:generate -- src/database/migrations/NewMigrationName` |
| ব্যাকএন্ড কন্টেইনারে শেল ঢোকা | `docker compose exec backend sh` |
| কোড এডিট | VS Code-এ সরাসরি এডিট করুন — bind-mount volume দিয়ে হট-রিলোড স্বয়ংক্রিয় |

কোড এডিট করলে backend/frontend কন্টেইনার স্বয়ংক্রিয়ভাবে রিলোড হয় (`nest start --watch` / `next dev`) —
রিস্টার্ট করার দরকার নেই।

---

## ২. লগইন টেস্ট করা (ফোন + OTP)

পাসওয়ার্ড-ভিত্তিক লগইন নেই — ফোন নম্বর + OTP দিয়ে লগইন হয়। এখনো বাস্তব SMS গেটওয়ে কনফিগার করা
হয়নি বলে OTP শুধু কনসোলে লগ হয়:

```powershell
# ধাপ ১: OTP রিকোয়েস্ট করুন
curl -X POST http://localhost/api/v1/auth/otp/request `
  -H "Content-Type: application/json" `
  -d '{\"phone\":\"01700000000\"}'

# ধাপ ২: কনসোলে OTP কোড দেখুন
docker compose logs backend | Select-String "MOCK SMS"

# ধাপ ৩: OTP verify করে টোকেন নিন (উপরে পাওয়া কোড বসান)
curl -X POST http://localhost/api/v1/auth/otp/verify `
  -H "Content-Type: application/json" `
  -d '{\"phone\":\"01700000000\",\"otp\":\"123456\"}'
```

---

## ৩. পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল (ঐচ্ছিক)

`.env`-এ SSLCOMMERZ_*, BKASH_*, NAGAD_*, ROCKET_* খালি রাখলেও বাকি সিস্টেম স্বাভাবিকভাবে চলবে —
শুধু সংশ্লিষ্ট গেটওয়ে দিয়ে পেমেন্ট initiate করলে এরর আসবে। sandbox ক্রেডেনশিয়াল পেতে:
- SSLCommerz: https://developer.sslcommerz.com/registration/
- bKash: bKash Merchant Support-এর মাধ্যমে PGW sandbox আবেদন
- Nagad: Nagad merchant onboarding (RSA কী-পেয়ার নিজে জেনারেট করে পাবলিক-কী জমা দিতে হয়)

---

## ৪. Elasticsearch (ঐচ্ছিক, ডিফল্টে বন্ধ)

যেহেতু এখনো কোনো Search মডিউল কোড নেই, ডিফল্টে Elasticsearch চালু হয় না। চালু করতে চাইলে:

```powershell
docker compose --profile search-preview up -d
```

---

## ৫. সমস্যা সমাধান (Troubleshooting)

| সমস্যা | সমাধান |
|---|---|
| `.\scripts\setup.ps1` "cannot be loaded because running scripts is disabled" এরর দেয় | PowerShell-এ (Administrator হিসেবে) একবার চালান: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` তারপর `Y` দিয়ে কনফার্ম করুন, আবার স্ক্রিপ্ট চালান |
| "port already in use" | অন্য কোনো প্রোগ্রাম (Skype, IIS, XAMPP) পোর্ট 80/5432/6379 ব্যবহার করছে কিনা চেক করুন, বন্ধ করুন অথবা `docker-compose.yml`-এ পোর্ট ম্যাপিং বদলান (যেমন `"8080:80"`) |
| backend কন্টেইনার বারবার রিস্টার্ট হচ্ছে | `docker compose logs backend` দেখুন |
| "Cannot find module '@/...'" জাতীয় এরর | `docker compose exec backend npm run build` চালিয়ে TypeScript কম্পাইল এরর আছে কিনা দেখুন |
| Windows-এ ধীরগতি | Docker Desktop Settings → General-এ "Use the WSL 2 based engine" চালু আছে কিনা নিশ্চিত করুন |
| OTP SMS আসছে না | এটাই প্রত্যাশিত — এখন শুধু কনসোলে লগ হয়, উপরে সেকশন ২ দেখুন |
| `setup.ps1` "৩ মিনিটেও ব্যাকএন্ড রেসপন্স দেয়নি" বলছে | `docker compose logs -f backend` দিয়ে দেখুন কী এরর আসছে, exact মেসেজ পাঠান |

কোনো এরর মেসেজ পেলে সেটা হুবহু কপি করে জানান — সাথে সাথে ঠিক করে দেব।

---

## ৬. অ্যাডভান্সড: মনিটরিং, লগিং, ব্যাকআপ (dev-এ প্রয়োজন নেই)

`docker-compose.yml` (development) এ মনিটরিং/লগিং/ব্যাকআপ সার্ভিস অন্তর্ভুক্ত নেই — এগুলো শুধু
`docker-compose.prod.yml`-এ আছে, প্রোডাকশন সার্ভারে ব্যবহারের জন্য (নিচে সেকশন ৭ দেখুন)।

- **Grafana:** `.env`-এর `GRAFANA_ADMIN_USER`/`GRAFANA_ADMIN_PASSWORD` দিয়ে লগইন, community dashboard import করুন (Node Exporter Full: ID `1860`, PostgreSQL: ID `9628`, Redis: ID `11835`)
- **লগ (Loki):** Grafana → Explore → Loki ডেটাসোর্স → `{compose_service="backend"}`
- **ব্যাকআপ:** প্রতিদিন রাত ৩টায় স্বয়ংক্রিয় PostgreSQL ডাম্প (`docker/backup/`), ম্যানুয়াল ব্যাকআপ/রিস্টোর কমান্ড `docker/backup/backup-db.sh` ও `restore-db.sh`-এ

---

## ৭. প্রোডাকশন ডিপ্লয়মেন্ট (এখনো করবেন না — ভবিষ্যতের জন্য রেফারেন্স)

> ⚠️ এই সেকশন **এখনই করার দরকার নেই**। আপনার প্রকৃত ডোমেইন/হোস্টিং প্রস্তুত থাকলেও, এই মুহূর্তে
> শুধু লোকাল Docker সেটআপ নির্ভরযোগ্যভাবে চালানোর উপর ফোকাস করা হয়েছে। প্রোডাকশনে যাওয়ার সময়
> প্রস্তুত হলে এই সেকশন অনুসরণ করুন।

<details>
<summary>প্রোডাকশন ডিপ্লয়মেন্ট ধাপ দেখতে ক্লিক করুন</summary>

### ৭.১ ধরে নেওয়া হচ্ছে
একটা Linux VPS/সার্ভার (Ubuntu 22.04+) আছে যেখানে Docker ও Docker Compose ইনস্টল করা আছে, এবং
আপনার প্রকৃত ডোমেইন আছে।

### ৭.২ DNS ও Cloudflare সেটআপ
1. Cloudflare-এ ডোমেইন যোগ করুন, নেমসার্ভার পয়েন্ট করুন
2. DNS-এ A রেকর্ড যোগ করুন: আপনার ডোমেইন, `www.` সাবডোমেইন, `api.` সাবডোমেইন → সার্ভারের পাবলিক IP
3. প্রতিটায় Proxy status = Proxied (কমলা মেঘ) রাখুন
4. SSL/TLS মোড **"Full (strict)"** করুন
5. `docker/nginx/snippets/cloudflare.conf`-এ ইতিমধ্যে Cloudflare real-IP restoration কনফিগার করা আছে

### ৭.৩ .env প্রস্তুত করা
```bash
git clone <your-repo-url> durbeen && cd durbeen
cp .env.example .env
nano .env   # CERTBOT_DOMAIN, CERTBOT_EMAIL, DB_PASSWORD, JWT secrets ইত্যাদি পূরণ করুন
```

### ৭.৪ SSL সার্টিফিকেট প্রথমবার ইস্যু করা (গুরুত্বপূর্ণ ক্রম)
`durbeen.prod.conf` সরাসরি সার্টিফিকেট ফাইল রেফারেন্স করে, যা প্রথমবার ইস্যুর আগে অস্তিত্বহীন —
তাই এই ক্রম মেনে চলুন:

```bash
# ধাপ ১: সাময়িকভাবে bootstrap (HTTP-only) কনফিগ ব্যবহার করুন
cp docker/nginx/conf.d/durbeen.prod.conf docker/nginx/conf.d/durbeen.prod.conf.bak
cp docker/nginx/conf.d/durbeen.bootstrap.conf docker/nginx/conf.d/durbeen.prod.conf

# ধাপ ২: certbot বাদে বাকি সার্ভিস চালু করুন
docker compose -f docker-compose.prod.yml up -d postgres redis backend frontend nginx

# ধাপ ৩: migration ও সিড চালান
docker compose -f docker-compose.prod.yml run --rm migrate
docker compose -f docker-compose.prod.yml run --rm backend npm run seed

# ধাপ ৪: প্রথমবার সার্টিফিকেট ইস্যু করুন
docker compose -f docker-compose.prod.yml run --rm certbot-init

# ধাপ ৫: আসল SSL কনফিগ ফিরিয়ে এনে Nginx রিস্টার্ট করুন
cp docker/nginx/conf.d/durbeen.prod.conf.bak docker/nginx/conf.d/durbeen.prod.conf
rm docker/nginx/conf.d/durbeen.prod.conf.bak
docker compose -f docker-compose.prod.yml restart nginx

# ধাপ ৬: বাকি সব সার্ভিস (certbot renewal, monitoring, logging, backup) চালু করুন
docker compose -f docker-compose.prod.yml up -d
```

এরপর `certbot` সার্ভিস প্রতি ১২ ঘণ্টায় renewal প্রয়োজন কিনা স্বয়ংক্রিয়ভাবে চেক করবে।

### ৭.৫ যাচাই করা
- `https://<আপনার-ডোমেইন>` — SSL padlock দেখা উচিত
- `https://api.<আপনার-ডোমেইন>/v1/health` — API হেলথ-চেক

</details>

---

## ৮. প্রজেক্ট কনসিস্টেন্সি চেক (সর্বশেষ ভ্যালিডেশন)

- ✅ `app.module.ts`-এ শুধু বাস্তবে বিদ্যমান মডিউল import করা হয়েছে — কোনো ভুয়া/অনির্মিত মডিউল রেফারেন্স নেই
- ✅ সব entity FK রিলেশন migration ফাইলের সাথে হুবহু মেলে
- ✅ `docker-compose.yml`/`docker-compose.prod.yml`-এ ব্যবহৃত সব `${VAR}` `.env.example`-এ সংজ্ঞায়িত আছে
- ✅ Dockerfile-এ build স্টেজ ও prod-deps স্টেজ আলাদা রাখা হয়েছে (migration one-off সার্ভিস সঠিকভাবে কাজ করার জন্য)
- ✅ `main.ts`-এ cookie-parser import ঠিক করা হয়েছে (`import * as cookieParser from "cookie-parser"`) — esModuleInterop চালু না করেই CommonJS-কম্প্যাটিবল
- ✅ Wafilife → Durbeen রিব্র্যান্ডিং সম্পন্ন (package.json নাম, Docker Compose প্রজেক্ট/নেটওয়ার্ক নাম, Nginx কনফিগ ফাইলনাম, UI টেক্সট, ডিফল্ট DB নাম, অ্যাডমিন সিড নাম) — বিস্তারিত নিচে চ্যাট-রেসপন্সে আছে

---

## ৯. বাল্ক প্রোডাক্ট ইম্পোর্ট (CSV Product Import System)

দুরবীন ই-কমার্স প্ল্যাটফর্মে স্ক্যাপার বা এক্সটার্নাল সোর্স থেকে হাজার হাজার প্রোডাক্ট এক ক্লিকে ইম্পোর্ট করার ব্যবস্থা রয়েছে।

### ইম্পোর্ট করার পদ্ধতি:
১. অ্যাডমিন প্যানেলে লগইন করে **ক্যাটালগ -> প্রোডাক্ট ম্যানেজমেন্ট**-এ যান (`/admin/products`) অথবা ইম্পোর্ট পেজে যান (`/admin/products/import`)।
২. **"CSV ইম্পোর্ট করুন"** বাটনে ক্লিক করুন।
৩. আপনার তৈরি করা `.csv` ফাইল নির্বাচন করুন (প্রয়োজনে নমুনা ফাইল `products-import-example.csv` ডাউনলোড করে দেখতে পারেন)।
৪. ফাইল সিলেক্ট করার পর লাইভ **প্রিভিউ (Preview)** এর মাধ্যমে ডাটা কলামসমূহ সঠিক আছে কিনা তা দেখে নিন।
৫. **"ইম্পোর্ট শুরু করুন"** বাটনে ক্লিক করুন।
৬. ইম্পোর্ট সম্পন্ন হলে মোট প্রসেসকৃত সারি, নতুন ইম্পোর্ট, আপডেট হওয়া প্রোডাক্ট, স্কিপড এবং কোনো ব্যর্থ সারি থাকলে তার বিস্তারিত এরর লগ দেখতে পাবেন।

### CSV কলাম ম্যাপিং নির্দেশিকা:
- `name` → প্রোডাক্টের নাম (আবশ্যক)
- `author` → লেখকের নাম (স্বয়ংক্রিয়ভাবে বিদ্যমান লেখক ব্যবহার বা নতুন তৈরি করে)
- `publisher` → প্রকাশনীর নাম (স্বয়ংক্রিয়ভাবে বিদ্যমান প্রকাশনী ব্যবহার বা নতুন তৈরি করে)
- `regular_price` → নিয়মিত/মূল দাম
- `sale_price` → বিক্রয় মূল্য
- `discount` → ছাড়ের শতাংশ
- `category` → ক্যাটাগরি (স্বয়ংক্রিয়ভাবে রিইউজ বা তৈরি করে)
- `description` → বিবরণ
- `image` → ইমেজ ইউআরএল (Image URL)
- `url` → সোর্স ইউআরএল (ডুপ্লিকেট প্রতিরোধে ব্যবহৃত)
- `id` → এক্সটার্নাল সোর্স আইডি (ডুপ্লিকেট প্রতিরোধে ব্যবহৃত)


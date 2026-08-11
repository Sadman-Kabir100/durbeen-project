-- এই স্ক্রিপ্ট postgres কন্টেইনার প্রথমবার (খালি ডাটা ভলিউমে) স্টার্ট হওয়ার সময়
-- স্বয়ংক্রিয়ভাবে চলে (Docker অফিসিয়াল postgres ইমেজ /docker-entrypoint-initdb.d/*.sql
-- ফাইলগুলো বর্ণানুক্রমিকভাবে execute করে)।
--
-- এখানে শুধু extension তৈরি করা হচ্ছে — আগের "সম্পূর্ণ PostgreSQL ডাটাবেস স্কিমা"
-- ডকুমেন্টের "প্রয়োজনীয় PostgreSQL Extension" সেকশন অনুযায়ী। প্রকৃত টেবিল তৈরি
-- TypeORM migration (`npm run migration:run`) দিয়ে হয়, এখানে না — কারণ migration
-- ভার্সন-নিয়ন্ত্রিত ও রিভার্সিবল, কিন্তু init script শুধু প্রথমবার চলে (idempotent না)।

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid() এর জন্য
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- ফাজি/ট্রাইগ্রাম টেক্সট সার্চের জন্য (products.title index)

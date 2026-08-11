#!/bin/sh
# ব্যবহার: ./restore-db.sh /backups/durbeen-db-20260809-030000.sql.gz
#
# ⚠️ সতর্কতা: এই স্ক্রিপ্ট টার্গেট ডাটাবেজের বিদ্যমান সব ডেটা ওভাররাইট করতে পারে।
# প্রোডাকশনে চালানোর আগে অবশ্যই নিশ্চিত হয়ে নিন যে সঠিক ব্যাকআপ ফাইল ও সঠিক DB_DATABASE
# টার্গেট করা হচ্ছে।

set -e

if [ -z "$1" ]; then
  echo "ব্যবহার: $0 <backup-file.sql.gz>"
  echo ""
  echo "উপলব্ধ ব্যাকআপ:"
  ls -lh /backups/*.sql.gz 2>/dev/null || echo "  কোনো ব্যাকআপ ফাইল পাওয়া যায়নি"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ ফাইল পাওয়া যায়নি: $BACKUP_FILE" >&2
  exit 1
fi

echo "⚠️  আপনি '$DB_DATABASE' ডাটাবেজ '$BACKUP_FILE' দিয়ে রিস্টোর করতে চলেছেন।"
echo "এটি বিদ্যমান সব ডেটা মুছে ফেলবে। চালিয়ে যেতে 'yes' টাইপ করুন:"
read -r CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
  echo "রিস্টোর বাতিল করা হলো।"
  exit 0
fi

echo "[$(date)] রিস্টোর শুরু হচ্ছে..."

gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USERNAME" \
  --dbname="$DB_DATABASE"

echo "[$(date)] ✅ রিস্টোর সম্পন্ন।"

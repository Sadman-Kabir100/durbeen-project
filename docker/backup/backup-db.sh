#!/bin/sh
# ব্যাকআপ স্ক্রিপ্ট — docker-compose.prod.yml এ একটি ছোট "backup" সার্ভিস (postgres:16-alpine
# ইমেজ, শুধু pg_dump-এর জন্য) cron দিয়ে নিয়মিত এই স্ক্রিপ্ট চালাবে (দেখুন crontab ফাইল)।
#
# পরিবেশ ভ্যারিয়েবল প্রত্যাশা করে: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
# (docker-compose.prod.yml থেকে backend-এর মতো একই .env থেকে পাস হয়)

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
FILENAME="durbeen-db-${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] ব্যাকআপ শুরু হচ্ছে: $FILENAME"

PGPASSWORD="$DB_PASSWORD" pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USERNAME" \
  --dbname="$DB_DATABASE" \
  --format=plain \
  --no-owner \
  --no-privileges \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

if [ $? -eq 0 ]; then
  echo "[$(date)] ব্যাকআপ সফল: ${BACKUP_DIR}/${FILENAME} ($(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1))"
else
  echo "[$(date)] ❌ ব্যাকআপ ব্যর্থ হয়েছে!" >&2
  exit 1
fi

# রিটেনশন — নির্দিষ্ট দিনের বেশি পুরনো ব্যাকআপ ফাইল মুছে ফেলা (ডিস্ক ভরে যাওয়া প্রতিরোধ)
echo "[$(date)] ${RETENTION_DAYS} দিনের বেশি পুরনো ব্যাকআপ মুছে ফেলা হচ্ছে..."
find "$BACKUP_DIR" -name "durbeen-db-*.sql.gz" -type f -mtime "+${RETENTION_DAYS}" -delete

echo "[$(date)] বর্তমান ব্যাকআপ তালিকা:"
ls -lh "$BACKUP_DIR" | grep "durbeen-db-" || echo "  (কোনো ব্যাকআপ নেই)"

# ঐচ্ছিক: S3-কম্প্যাটিবল অবজেক্ট স্টোরেজে আপলোড (BACKUP_S3_BUCKET সেট করা থাকলে)
# এখানে aws-cli/rclone প্রি-ইনস্টল থাকতে হবে backup কন্টেইনার ইমেজে — ডিফল্ট
# postgres:16-alpine ইমেজে এগুলো নেই, তাই এই অংশ ঐচ্ছিক এবং কমেন্ট করা রইল।
# if [ -n "$BACKUP_S3_BUCKET" ]; then
#   aws s3 cp "${BACKUP_DIR}/${FILENAME}" "s3://${BACKUP_S3_BUCKET}/postgres/${FILENAME}"
#   echo "[$(date)] S3-তে আপলোড সম্পন্ন: s3://${BACKUP_S3_BUCKET}/postgres/${FILENAME}"
# fi

echo "[$(date)] ব্যাকআপ প্রক্রিয়া সম্পন্ন।"

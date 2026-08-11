# ব্যাকআপ সার্ভিসের নিজস্ব ছোট ইমেজ — শুধু postgresql-client + cron/busybox-crond থাকে
FROM postgres:16-alpine

RUN apk add --no-cache dcron

COPY backup-db.sh /usr/local/bin/backup-db.sh
COPY restore-db.sh /usr/local/bin/restore-db.sh
RUN chmod +x /usr/local/bin/backup-db.sh /usr/local/bin/restore-db.sh

COPY crontab /etc/crontabs/root

# dcron ফোরগ্রাউন্ডে চালানো হচ্ছে যাতে কন্টেইনার চলমান থাকে
CMD ["crond", "-f", "-l", "2"]

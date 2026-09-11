# คู่มือมาตรการความปลอดภัยสำหรับระบบจริง (Production Security Hardening Guide)

เอกสารนี้รวบรวมแนวทางการรักษาความปลอดภัยภาคปฏิบัติ (Operational Security Standards) สำหรับการติดตั้งและดูแลระบบ **Faculty Web Platform** บน Production เพื่อป้องกันภัยคุกคามทางไซเบอร์ที่สำคัญ เช่น **WannaCry (Ransomware)**, **Cryptojacking (Crypto Mining)**, และการโจมตีตามมาตรฐาน **OWASP Top 10**

---

## 1. การป้องกันมัลแวร์เรียกค่าไถ่ (Anti-Ransomware & WannaCry Defense)

### 1.1 ทำความเข้าใจการโจมตี
- **WannaCry** และมัลแวร์ตระกูล EternalBlue โจมตีผ่านช่องโหว่ของโปรโตคอล **SMBv1 (Server Message Block บนพอร์ต 445 และ 139)** ของระบบปฏิบัติการ Windows
- ตัวแอปพลิเคชัน Next.js/React **ไม่มีพอร์ต SMB ในตัว** แต่หากโฮสต์เซิร์ฟเวอร์เปิดพอร์ต 445 ออกสู่อินเทอร์เน็ต มัลแวร์จะสามารถเจาะเข้ามาเข้ารหัสไฟล์ระบบและฐานข้อมูลได้

### 1.2 มาตรการบล็อกพอร์ตที่ไฟร์วอลล์ (Network Firewall)
ไม่ว่าจะใช้ OS ใด ต้องตั้งค่า Firewall ให้ **ปิดพอร์ต SMB 100%** จากภายนอก:

#### บนระบบ Linux (Ubuntu / Debian ด้วย UFW):
```bash
# รีเซ็ตและตั้งค่านโยบายเริ่มต้นเป็นบล็อกทราฟฟิกขาเข้าทั้งหมด
sudo ufw default deny incoming
sudo ufw default allow outgoing

# เปิดเฉพาะพอร์ตที่จำเป็นเท่านั้น
sudo ufw allow 80/tcp    # HTTP (Reverse Proxy)
sudo ufw allow 443/tcp   # HTTPS (SSL/TLS)
sudo ufw allow 22/tcp    # SSH (แนะนำให้เปลี่ยนพอร์ตและใช้ Key-Only)

# ตรวจสอบให้แน่ใจว่าพอร์ต 445, 139, 135 และ 5432 (Postgres) ไม่เปิดออกสู่ภายนอก
sudo ufw deny 445/tcp
sudo ufw deny 139/tcp
sudo ufw deny 5432/tcp

# เปิดใช้งานไฟร์วอลล์
sudo ufw enable
sudo ufw status verbose
```

#### บนระบบ Windows Server:
1. เปิด **PowerShell (Administrator)** แล้วรันคำสั่งปิดการใช้งาน SMBv1:
   ```powershell
   Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart
   Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force
   ```
2. บล็อกพอร์ต 445 และ 139 บน Windows Defender Firewall ขาเข้า (Inbound Rule).
3. อัปเดตแพตช์ความปลอดภัยของ Windows ให้เป็นเวอร์ชันล่าสุดเสมอ (โดยเฉพาะ Security Update MS17-010).

### 1.3 ระบบสำรองข้อมูลแบบป้องกัน Ransomware (Immutable & Offsite Backup)
หากเกิดเหตุฉุกเฉิน การมี Backup ภายนอกจะช่วยให้กู้คืนระบบได้โดยไม่ต้องจ่ายค่าไถ่:
1. ทำสคริปต์สำรองข้อมูล PostgreSQL ด้วย `pg_dump` แบบเข้ารหัส (GPG Encryption):
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/var/backups/fms"
   mkdir -p $BACKUP_DIR
   
   # Dump และบีบอัด
   docker exec fms_postgres_prod pg_dump -U fms_user fms_prod | gzip > "$BACKUP_DIR/fms_$DATE.sql.gz"
   
   # เข้ารหัสไฟล์สำรองด้วย GPG
   gpg --batch --yes --passphrase "$BACKUP_SECRET" -c "$BACKUP_DIR/fms_$DATE.sql.gz"
   rm "$BACKUP_DIR/fms_$DATE.sql.gz"
   
   # ส่งไฟล์ขึ้น Cloud Storage นอกสถานที่ (เช่น AWS S3 / Cloudflare R2 ที่เปิด Object Lock)
   # aws s3 cp "$BACKUP_DIR/fms_$DATE.sql.gz.gpg" s3://my-offsite-backup/
   ```
2. ตั้งเวลาทำงานทุกวันผ่าน Cron Job (`0 2 * * *` ตีสองของทุกวัน).

---

## 2. การป้องกันการลอบขุดเหรียญดิจิทัล (Anti-Cryptomining & Cryptojacking)

### 2.1 การป้องกัน Server-Side Mining
ผู้โจมตีมักฝังโปรแกรมขุดเหรียญ (เช่น `XMRig`) เมื่อเจาะผ่านพอร์ตที่ไม่มีรหัสผ่านหรือได้สิทธิ์ Root:
1. **รันด้วย Non-Root User:** คอนเทนเนอร์ใน `Dockerfile` ของโปรเจกต์ถูกกำหนดให้รันภายใต้ผู้ใช้ `USER nextjs:nodejs` (UID 1001) มัลแวร์จึงไม่สามารถติดตั้ง Service หรือแก้ไขไฟล์ระบบของ Host ได้
2. **จำกัดทรัพยากร (Resource Limits):** ใน `docker-compose.prod.yml` มีการกำหนดโควตา CPU และ Memory ไว้ (`cpus: "2.0"`, `memory: 2048M`) แม้จะถูกโจมตี เซิร์ฟเวอร์หลักจะไม่ล่มและไม่ถูกดึงพลังประมวลผล 100%
3. **ตรวจสอบ CPU และ Process ที่ผิดปกติ:**
   ```bash
   # ตรวจสอบการใช้งานของ Container แบบ Realtime
   docker stats
   
   # ค้นหา Process ที่ใช้ CPU เกิน 80% ต่อเนื่อง
   top -b -n 1 | head -n 20
   ```

### 2.2 การป้องกัน Client-Side In-Browser Mining
ผู้โจมตีอาจพยายามฉีดสคริปต์ขุดเหรียญในเบราว์เซอร์ของผู้เข้าชมเว็บ:
1. **Content Security Policy (CSP):** โปรเจกต์ได้ติดตั้ง Header `worker-src 'self' blob;` และ `object-src 'none'` ใน `next.config.ts` ป้องกันไม่ให้สคริปต์ภายนอกรัน Web Worker ในเบราว์เซอร์เพื่อขุดเหรียญ
2. **Sanitize Attachment URLs:** ระบบมี Zod Schema ตรวจสอบ URL ของไฟล์แนบและรูปภาพทั้งหมด บังคับเฉพาะ `https://`, `http://`, หรือ `/` สกัดกั้นการฉีด `javascript:` scheme

---

## 3. การรักษาความปลอดภัยระดับ Application (OWASP Top 10)

### 3.1 การจัดการความลับ (Secrets Management)
1. ห้าม Commit ไฟล์ `.env` ขึ้น Git เป็นอันขาด (ตรวจสอบแล้วว่าอยู่ใน `.gitignore`)
2. สร้างค่า `AUTH_SECRET` สำหรับ Production ด้วยการสุ่มแบบปลอดภัยสูง:
   ```bash
   openssl rand -base64 32
   ```
3. กำหนดรหัสผ่านฐานข้อมูลที่แข็งแกร่ง (ความยาวอย่างน้อย 20 ตัวอักษร มีทั้งตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และสัญลักษณ์)

### 3.2 การคุมพอร์ตฐานข้อมูล (Database Isolation)
- ใน `docker-compose.prod.yml` เซอร์วิส `db` (PostgreSQL) เชื่อมต่อผ่านเครือข่ายภายใน (`internal_net`) เท่านั้น
- **ไม่มีการแมปพอร์ต 5432 ออกมายังโฮสต์หรืออินเทอร์เน็ต** ทำให้บุคคลภายนอกไม่สามารถยิงคิวรีหรือสแกนพอร์ตฐานข้อมูลได้

---

## 4. ตัวอย่างการติดตั้ง Reverse Proxy (Nginx + SSL / TLS 1.3)

ติดตั้ง Nginx เป็นกันชนด้านหน้าก่อนส่งคำขอไปยัง Next.js (พอร์ต 3000):

```nginx
# /etc/nginx/sites-available/fms.conf

# จำกัดอัตราการส่งคำขอป้องกัน DoS / Brute-force
limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=20r/s;

server {
    listen 80;
    server_name faculty.university.ac.th;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name faculty.university.ac.th;

    # ใบรับรองความปลอดภัย SSL/TLS
    ssl_certificate /etc/letsencrypt/live/faculty.university.ac.th/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/faculty.university.ac.th/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Proxy ไปยัง Next.js Standalone Container
    location / {
        limit_req zone=req_limit_per_ip burst=40 nodelay;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. เช็กลิสต์ก่อนเปิดใช้งานจริง (Production Go-Live Checklist)

- [ ] รัน `npm run check` เพื่อยืนยันว่า Type-check, Linters, Dependency-cruiser และ Tests ผ่าน 100%
- [ ] สุ่มรหัส `AUTH_SECRET` ใหม่ด้วย `openssl rand -base64 32`
- [ ] ตั้งค่ารหัสผ่าน PostgreSQL และจำกัดพอร์ตให้อยู่เฉพาะใน Docker internal network
- [ ] ตรวจสอบว่าพอร์ต 445 (SMB) และ 5432 (Postgres) ถูกปิดบน Firewall ภายนอก
- [ ] เปิดใช้งาน HTTPS (SSL/TLS Certificate)
- [ ] รันคอนเทนเนอร์ด้วย `docker compose -f docker-compose.prod.yml up -d --build`
- [ ] ตรวจสอบว่า Container รันในสถานะ `healthy` ด้วยคำสั่ง `docker ps`
- [ ] ทดสอบระบบสำรองข้อมูลฐานข้อมูลอัตโนมัติ (Automated Backup Script)

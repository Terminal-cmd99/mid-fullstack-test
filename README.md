# Mid-Level Full-Stack Developer — Take-Home Assignment

## ระบบจองตั๋วอีเวนต์ (Event Ticket Booking)

สร้างระบบจองตั๋วอีเวนต์แบบ full-stack ที่ผู้ใช้ดูรายการอีเวนต์ จองที่นั่ง และจัดการการจองของตัวเองได้ โดยระบบต้อง **ไม่จองเกินจำนวนที่นั่ง** แม้มีผู้ใช้จองพร้อมกันจำนวนมาก

- **ระยะเวลา:** 7 วันนับจากวันที่ได้รับโจทย์ (คาดว่าใช้เวลาทำจริงประมาณ 8–12 ชั่วโมง)
- **หลังส่งงาน:** นัด code walkthrough 30–45 นาที เพื่ออธิบายโค้ดและการตัดสินใจในการออกแบบ

---

## 1. Tech Stack (บังคับ)

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| Backend | .NET 8 ขึ้นไป **หรือ** Go (เลือกอย่างใดอย่างหนึ่ง) |
| Database | PostgreSQL |
| Deployment | Docker + Docker Compose |

---

## 2. ฟีเจอร์ (บังคับทั้งหมด)

1. สมัครสมาชิก / login / logout
2. รายการอีเวนต์ พร้อม pagination และค้นหาด้วยชื่อ
3. หน้ารายละเอียดอีเวนต์ แสดงจำนวนที่นั่งคงเหลือ
4. จองตั๋ว (หนึ่งคนจองได้ไม่เกิน 4 ที่ต่ออีเวนต์)
5. หน้า "การจองของฉัน" และยกเลิกการจองได้ (ยกเลิกแล้วที่นั่งต้องกลับมาว่าง)
6. Admin: สร้างและแก้ไขอีเวนต์ (role-based access: `admin` / `user`)

### ข้อบังคับสำคัญ: ห้ามจองเกินจำนวนที่นั่ง

แม้มี request จองเข้ามาพร้อมกัน 100 ตัว จำนวนที่นั่งที่ถูกจองต้องไม่เกินที่มีอยู่จริง ใน README ต้องอธิบายว่าป้องกันอย่างไร และทำไมถึงเลือกวิธีนั้น (เช่น DB transaction + row lock, optimistic locking หรือ distributed lock)

---

## 3. ข้อกำหนดทางเทคนิค

### 3.1 Frontend (Next.js App Router)

- ใช้ **Server Components** เป็นหลักในการดึงข้อมูล ใช้ Client Component เฉพาะส่วนที่ต้องมี interaction จริง
- มี `loading.tsx` และ `error.tsx` ในหน้าที่ดึงข้อมูล
- มี Server Action หรือ Route Handler อย่างน้อยหนึ่งจุด
- TypeScript แบบ `strict` และหลีกเลี่ยง `any`
- UI ต้อง responsive (ใช้งานได้บนมือถือ)
- แสดง empty state, loading state และ error state อย่างเหมาะสม

### 3.2 Backend

- REST API ที่ใช้ HTTP status code ถูกต้อง และมีรูปแบบ error response ที่สม่ำเสมอ
- Validate input ทุก endpoint
- Auth ด้วย JWT ที่เก็บใน httpOnly cookie หรือ session-based auth
- แยก layer ให้ชัดเจน (เช่น handler / service / repository)
- มี API docs แบบ OpenAPI/Swagger
- มี endpoint `GET /health` สำหรับ healthcheck

### 3.3 Database (PostgreSQL)

- **Migrations มี version และอยู่ใน repo** และรันอัตโนมัติตอนเปิดระบบ
  - .NET: EF Core Migrations
  - Go: `golang-migrate` หรือ `goose`
- **Seed data:** admin อย่างน้อย 1 คน, user ทั่วไป 1 คน และอีเวนต์ประมาณ 20 รายการ (ใส่ credential ของ seed user ไว้ใน README)
- **บังคับ constraint ที่ระดับ database** ไม่ใช่แค่ในโค้ด เช่น `FOREIGN KEY`, `UNIQUE (email)`, `CHECK (available_seats >= 0)`
- **Index ที่เหมาะสม** บนคอลัมน์ที่ใช้ค้นหาและทำ pagination พร้อมเขียนเหตุผลของแต่ละ index ไว้ใน README
- **ขั้นตอนการจองทำใน transaction**

### 3.4 Docker & Docker Compose

- **Dockerfile แบบ multi-stage** สำหรับทั้ง frontend และ backend
  - รันด้วย non-root user
  - image มีขนาดเล็ก (เช่น Next.js ใช้ `output: "standalone"`)
- **มี healthcheck ทุก service** (frontend, backend, postgres และ service อื่นที่เพิ่มเข้ามา)
  - Postgres ใช้ `pg_isready`
  - ใช้ `depends_on: condition: service_healthy` เพื่อให้ service เริ่มตามลำดับที่ถูกต้อง
- Postgres ใช้ **named volume** และข้อมูลต้องยังอยู่หลัง `docker compose down` แล้ว `up` ใหม่
- **`docker compose up --build` ต้องเปิดทั้งระบบได้ในคำสั่งเดียว** บนเครื่องที่มีแค่ Docker
- ห้าม commit secrets ลง repo ให้ใช้ `.env` และมี `.env.example`

### 3.5 Testing

- Unit test สำหรับ business logic (โดยเฉพาะการจองและการตรวจจำนวนที่นั่ง)
- Integration test สำหรับ API อย่างน้อย endpoint หลัก
- อธิบายวิธีรัน test ไว้ใน README

---

## 4. คะแนนพิเศษ (ไม่บังคับ)

แต่ละข้อมีเป้าหมายที่ชัดเจน ให้ทำตามเป้าหมายนั้น ไม่ใช่แค่ติดตั้งเครื่องมือ

### 4.1 Redis
- Cache รายการอีเวนต์ และ **invalidate cache เมื่อข้อมูลเปลี่ยน** (สร้าง/แก้ไขอีเวนต์ หรือมีการจอง)
- Rate limit API การจอง (เช่น ไม่เกิน N request ต่อนาทีต่อ user) และตอบ `429 Too Many Requests` เมื่อเกิน

### 4.2 Nginx / Load Balancer
- Nginx เป็น reverse proxy หน้า frontend และ backend
- รัน **backend อย่างน้อย 2 replica** และพิสูจน์ได้ว่ามีการกระจายโหลดจริง (เช่น ส่ง header `X-Instance-Id` กลับมาในทุก response)
- Backend ต้องเป็น stateless เพื่อให้ทำงานถูกต้องไม่ว่า request จะไปถึง replica ไหน

### 4.3 Deploy บน Cloud จริง
- Deploy บน DigitalOcean, Railway หรือ cloud อื่น
- มี URL ที่ใช้งานได้จริง พร้อม HTTPS

### 4.4 PostgreSQL ขั้นสูง
- ใช้ **cursor-based pagination** แทน `OFFSET` ค่าสูงๆ
- ค้นหาด้วย `ILIKE` คู่กับ index แบบ **`pg_trgm`** หรือใช้ **full-text search**
- ตั้งค่า **connection pool** อย่างเหมาะสม และอธิบายเหตุผลของค่าที่เลือก

### 4.5 อื่นๆ
- CI บน GitHub Actions (lint, test, build)
- E2E test (เช่น Playwright)
- Load-test script ที่แสดงว่าไม่มีการจองเกินเมื่อมี request พร้อมกันจำนวนมาก
- Structured logging
- Architecture diagram

---

## 5. สิ่งที่ต้องส่ง

1. **Git repository** (GitHub / GitLab) และเก็บ commit history ไว้ ไม่ต้อง squash
2. **README.md** ที่มี:
   - วิธีติดตั้งและรันระบบ
   - วิธีรัน test
   - Seed credential สำหรับทดสอบ
   - Architecture ภาพรวม
   - วิธีป้องกันการจองเกิน และเหตุผล
   - เหตุผลของ index ที่สร้าง
   - Trade-off ที่เลือก และสิ่งที่จะปรับปรุงถ้ามีเวลาเพิ่ม
   - รายการคะแนนพิเศษที่ทำ
   - URL ของระบบที่ deploy แล้ว (ถ้าทำข้อ 4.3)
3. **`.env.example`**
4. **API docs** (Swagger UI หรือไฟล์ OpenAPI)

---

## 6. เกณฑ์ให้คะแนน (100 คะแนน + คะแนนพิเศษ)

| หมวด | คะแนน |
|---|---|
| ฟีเจอร์ทำงานครบตาม spec | 25 |
| คุณภาพโค้ดและโครงสร้าง (แยก layer, typing, อ่านง่าย) | 20 |
| Concurrency และความถูกต้องของข้อมูล | 15 |
| Tests | 15 |
| Docker / Compose (multi-stage, healthcheck, รันผ่านในครั้งแรก) | 10 |
| Security (auth, validation, ไม่มี secrets ใน repo) | 10 |
| README และเอกสาร | 5 |
| **รวม** | **100** |

| คะแนนพิเศษ | คะแนน |
|---|---|
| Redis (cache + invalidation, rate limit) | +5 |
| Nginx / Load balancer (2 replica ขึ้นไป) | +5 |
| Deploy บน cloud จริง | +5 |
| PostgreSQL ขั้นสูง (cursor pagination, `pg_trgm`/FTS, connection pool) | +5 |
| CI / E2E / load test | +5 |

> งานหลักที่สมบูรณ์และมี test ดี มีน้ำหนักมากกว่าการทำคะแนนพิเศษครบ แนะนำให้ทำส่วนบังคับให้ดีก่อน

---

## 7. คำถาม

หากโจทย์ส่วนไหนไม่ชัดเจน ให้ตั้งสมมติฐานที่สมเหตุสมผล และเขียนสมมติฐานนั้นไว้ใน README

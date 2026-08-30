# Portfolio Website — Technical Presentation
## Software Engineer + System Analyst

**ผู้พัฒนา:** Sumet Buarod
**Email:** sumet.buarod@gmail.com | **Tel:** 095-803-9303
**วันที่:** 29 เมษายน 2026

---

## 1. ภาพรวมของระบบ

Portfolio Website ที่รวม 3 ระบบหลักไว้ในโปรเจกต์เดียว:

```
┌──────────────────────────────────────────────────┐
│                Portfolio Website                 │
├──────────────────┬───────────────────────────────┤
│  1. Portfolio    │  แสดงผลงาน, ทักษะ, ประวัติ    │
│  2. E-Commerce   │  ระบบสั่งซื้อซอฟต์แวร์        │
│  3. Admin Panel  │  จัดการออเดอร์ + วิเคราะห์     │
└──────────────────┴───────────────────────────────┘
```

### Tech Stack

| Layer | Technology | เหตุผลที่เลือก |
|-------|-----------|----------------|
| Framework | Next.js 16 (App Router) | Server Components, SEO, Routing ในตัว |
| Language | TypeScript 5 strict | Type safety ลด runtime bug |
| Styling | Tailwind CSS v4 | Utility-first, responsive ง่าย |
| Animation | Framer Motion 12 | Production-grade animation |
| Database | Prisma 5 + SQLite / PostgreSQL | Type-safe ORM, migrate ง่าย |
| Auth | JWT (jose) + HTTP-only Cookie | Stateless, ป้องกัน XSS |
| Validation | Zod v4 | Shared schema ทั้ง client และ server |
| Charts | Recharts 3 | Dashboard analytics |

---

## 2. Architecture

### โครงสร้างไฟล์

```
portfolio-website/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Portfolio home
│   │   ├── about/                      # ประวัติ + ทักษะ
│   │   ├── shop/                       # ร้านค้า
│   │   ├── showcase/                   # ผลงาน
│   │   ├── admin/                      # Admin Panel (protected)
│   │   └── api/
│   │       ├── auth/admin/             # POST login / DELETE logout
│   │       ├── shop/products/          # GET สินค้า (public)
│   │       ├── shop/orders/            # POST สั่งซื้อ / GET+PATCH (admin)
│   │       ├── admin/dashboard/        # GET KPI สถิติ
│   │       ├── admin/analytics/        # GET วิเคราะห์ user behavior
│   │       ├── track/                  # POST บันทึก page event
│   │       └── proxy/[service]/        # Proxy → Resend, LINE, Omise, S3
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── admin.ts                # JWT sign / verify
│   │   │   └── requireAdmin.ts         # API route guard
│   │   ├── env.ts                      # Environment validation
│   │   └── db.ts                       # Prisma singleton
│   └── middleware.ts                   # Route protection /admin/*
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── next.config.ts
```

### Data Flow — Order Creation

```
User กรอกฟอร์ม
        │
        ▼
POST /api/shop/orders
        │
        ├─ Zod validation — ตรวจสอบทุก field
        ├─ Generate order number (ORD-YYYYMMDD-XXXX)
        └─ db.order.create() — บันทึกลง database
        │
        ▼
201 { ok: true, order: { orderNumber, ... } }
```

### Data Flow — Admin Login

```
Admin กรอก password
        │
        ▼
POST /api/auth/admin
        │
        ├─ Rate limit — max 5 ครั้ง / 15 นาที ต่อ IP
        ├─ HMAC-SHA256 + timingSafeEqual — ป้องกัน timing attack
        └─ signAdminToken() — JWT expire 7 วัน
        │
        ▼
Set-Cookie: admin_token (httpOnly, secure, sameSite=lax)

ทุก request หลังจากนั้น:
        │
        ▼
middleware.ts — jwtVerify() ทุก /admin/* route
```

---

## 3. Database Schema

```prisma
model Product {
  id           String   @id @default(cuid())
  slug         String   @unique
  title        String
  category     String
  price        Float
  images       String            // JSON array
  techStack    String            // JSON array
  features     String            // JSON array
  deliverables String            // JSON array
  featured     Boolean  @default(false)
  status       String   @default("active")
  orders       OrderItem[]
}

model Order {
  id           String     @id @default(cuid())
  orderNumber  String     @unique     // ORD-20260429-0042
  buyerName    String
  buyerEmail   String
  buyerPhone   String?
  status       String     @default("pending")
  totalAmount  Float
  currency     String     @default("THB")
  paidAt       DateTime?
  notes        String?
  items        OrderItem[]
  createdAt    DateTime   @default(now())
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  title     String
  price     Float
  quantity  Int      @default(1)
  order     Order    @relation(fields: [orderId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
}

model PageEvent {
  id        Int      @id @default(autoincrement())
  sessionId String
  eventType String   // page_view / product_view / checkout_start / purchase_complete
  page      String
  element   String?
  metadata  String   @default("{}")
  userAgent String?
  ipHash    String?  // Hashed — ปกป้อง user privacy
  country   String?
  createdAt DateTime @default(now())

  @@index([eventType])
  @@index([createdAt])
  @@index([sessionId])
}
```

**Design decision:** ใช้ SQLite ใน dev — ไม่ต้องติดตั้ง PostgreSQL, `prisma migrate` ทำงานทันที ย้ายไป PostgreSQL ตอน deploy แค่เปลี่ยน `DATABASE_URL` ใน Vercel

---

## 4. Security Implementation

### 4.1 Timing-Safe Password Comparison

```typescript
// src/app/api/auth/admin/route.ts

import { createHmac, timingSafeEqual } from "crypto";

function safePasswordCompare(input: string, expected: string): boolean {
  const key = process.env.ADMIN_JWT_SECRET!;
  const a = createHmac("sha256", key).update(input).digest();
  const b = createHmac("sha256", key).update(expected).digest();
  return timingSafeEqual(a, b);
}
```

HMAC-SHA256 แปลง string เป็น fixed-length buffer ก่อน แล้ว `timingSafeEqual` เปรียบเทียบ byte-by-byte โดยใช้เวลาคงที่เสมอ ไม่ว่าจะถูกหรือผิด — ผู้โจมตีวัดเวลาตอบสนองเพื่อเดา password ไม่ได้

ใช้ Node.js built-in `crypto` ไม่ต้องติดตั้ง library เพิ่ม

### 4.2 Environment Variable Validation

```typescript
// src/lib/env.ts

export function validateEnv(): void {
  // ข้ามช่วง next build — env vars ไม่พร้อมตอน build time
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const isProd = process.env.NODE_ENV === "production";
  const errors: string[] = [];

  for (const key of ["ADMIN_JWT_SECRET", "ADMIN_PASSWORD"]) {
    if (!process.env[key]) errors.push(`Missing required env var: ${key}`);
  }

  // DATABASE_URL required เฉพาะ production (dev ใช้ SQLite ผ่าน .env.local)
  if (isProd && !process.env.DATABASE_URL) {
    errors.push("Missing required env var: DATABASE_URL");
  }

  if (isProd) {
    if (isInsecureDefault(process.env.ADMIN_PASSWORD ?? ""))
      errors.push("ADMIN_PASSWORD is using an insecure default.");
    if (isInsecureDefault(process.env.ADMIN_JWT_SECRET ?? "") ||
        (process.env.ADMIN_JWT_SECRET?.length ?? 0) < 32)
      errors.push("ADMIN_JWT_SECRET must be ≥ 32 characters.");
  }

  if (errors.length > 0) {
    const message = ["[env] Configuration errors:", ...errors.map(e => `  • ${e}`)].join("\n");
    if (isProd) throw new Error(message); // fail fast
    else console.warn(message);
  }
}
```

| Environment | ถ้า config ผิด | ผล |
|-------------|--------------|-----|
| `next build` | ข้าม | Build ผ่าน เสมอ |
| `development` | `console.warn` | แจ้งเตือน ทำงานต่อ |
| `production` | `throw Error` | Server หยุดทันที |

### 4.3 Proxy Layer — ซ่อน API Keys

```typescript
// src/app/api/proxy/[service]/route.ts

const PROXY_SERVICES = {
  email:   { baseUrl: "...", authValue: () => `Bearer ${process.env.RESEND_API_KEY}` },
  notify:  { baseUrl: "...", authValue: () => `Bearer ${process.env.LINE_NOTIFY_TOKEN}` },
  payment: { baseUrl: "...", authValue: () => `Basic ${Buffer.from(process.env.OMISE_SECRET_KEY + ":").toString("base64")}` },
  storage: { baseUrl: "...", authValue: () => process.env.AWS_PROXY_TOKEN },
};
```

Frontend เรียก `/api/proxy/email` — server inject API key ให้เอง Client ไม่เคยเห็น key จริงเลย

### 4.4 Security Summary

| การป้องกัน | Implementation |
|-----------|----------------|
| Timing attack | `crypto.timingSafeEqual` via HMAC-SHA256 |
| Brute force | Rate limit 5 ครั้ง / 15 นาที ต่อ IP |
| XSS (cookie theft) | `httpOnly: true` |
| CSRF | `sameSite: "lax"` |
| Token ถูกดัก | `secure: true` (production) |
| Token หมดอายุ | JWT expire 7 วัน |
| Route protection | `middleware.ts` → `jwtVerify` ทุก `/admin/*` |
| Bad config | `env.ts` — fail fast บน startup |
| Input injection | Zod schema validation ทุก API endpoint |
| API key leak | Proxy layer — keys อยู่ server-side เท่านั้น |

---

## 5. Analytics System

```typescript
// src/app/api/admin/analytics/route.ts

const [totalPageViews, recentEvents, productViews, checkoutStarts,
       purchases, uniqueSessions, topPages, dailyViews] = await Promise.all([
  db.pageEvent.count({ where: { eventType: "page_view" } }),
  db.pageEvent.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  db.pageEvent.count({ where: { eventType: "product_view" } }),
  db.pageEvent.count({ where: { eventType: "checkout_start" } }),
  db.pageEvent.count({ where: { eventType: "purchase_complete" } }),
  db.pageEvent.groupBy({ by: ["sessionId"] }),
  db.pageEvent.groupBy({ by: ["page"], _count: { page: true }, take: 10 }),
  db.pageEvent.findMany({ where: { createdAt: { gte: sevenDaysAgo } } }),
]);

const conversionRate = (purchases / productViews) * 100;
```

ติดตาม conversion funnel ครบ:

```
product_view → checkout_start → purchase_complete
     100%  →      45%        →       12%          = 12% conversion
```

---

## 6. API Design

| Method | Endpoint | Auth | คำอธิบาย |
|--------|---------|------|----------|
| GET | `/api/shop/products` | Public | ดึงสินค้า (filter by category, featured) |
| POST | `/api/shop/orders` | Public | สร้าง order ใหม่ |
| GET | `/api/shop/orders` | Admin | ดูออเดอร์ทั้งหมด |
| PATCH | `/api/shop/orders` | Admin | เปลี่ยนสถานะออเดอร์ |
| POST | `/api/auth/admin` | — | Login |
| DELETE | `/api/auth/admin` | — | Logout |
| GET | `/api/admin/dashboard` | Admin | KPI: revenue, orders, visitors |
| GET | `/api/admin/analytics` | Admin | Funnel, daily views, top pages |
| POST | `/api/track` | Public | บันทึก page event |
| ANY | `/api/proxy/[service]` | — | Proxy to Resend / LINE / Omise / S3 |

---

## 7. Architecture Decisions

### JWT แทน NextAuth

NextAuth เหมาะกับ multi-user system ที่มี social login, session management ซับซ้อน สำหรับ single-admin portfolio การใช้ `jose` + JWT ตรงๆ มี dependency น้อยกว่า เข้าใจง่ายกว่า และ customize ได้เต็มที่

### SQLite ใน Dev, PostgreSQL ใน Prod

Prisma รองรับทั้งสอง database ด้วย schema เดิม เปลี่ยนแค่ `DATABASE_URL` — ไม่ต้องติดตั้ง database server ใน local dev ลด friction สำหรับ onboarding

### `timingSafeEqual` แทน bcrypt

Password เก็บใน environment variable ไม่ใช่ database ดังนั้นไม่จำเป็นต้อง hash ด้วย cost factor แบบ bcrypt การใช้ HMAC + `timingSafeEqual` ป้องกัน timing attack ได้โดยใช้ built-in เท่านั้น

### `DATABASE_URL` ไม่ Required ตอน Build

Next.js รัน `next build` ด้วย `NODE_ENV=production` แต่ `.env.local` ไม่ได้ commit ขึ้น Git ดังนั้น build server ไม่มีค่านั้น การเช็ก `NEXT_PHASE === "phase-production-build"` ทำให้ข้าม validation ช่วง build และ validate จริงตอน runtime เท่านั้น

---

## 8. สิ่งที่จะพัฒนาต่อ

| Priority | Feature | เหตุผล |
|----------|---------|--------|
| P1 | Test suite (Vitest) | ยังไม่มี test ใดเลย |
| P1 | Structured logging (pino) | `console.error` ไม่เพียงพอสำหรับ production monitoring |
| P2 | Redis rate limiting | ปัจจุบัน in-memory Map จะ reset เมื่อ server restart |
| P2 | Error monitoring (Sentry) | ติดตาม production error แบบ real-time |
| P3 | GitHub Actions CI/CD | Auto lint + type-check + build ก่อน deploy |

---

*Sumet Buarod | sumet.buarod@gmail.com | 095-803-9303*

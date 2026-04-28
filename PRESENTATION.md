# Portfolio Website — Code Presentation
## การวิเคราะห์และปรับปรุงระบบในฐานะ System Analyst

**ผู้พัฒนา:** Sumet Buarod  
**ตำแหน่งที่รับผิดชอบ:** Software Engineer + System Analyst  
**วันที่รีวิว:** 27 เมษายน 2026

---

## 1. ภาพรวมของระบบ (System Overview)

### คืออะไร?

Portfolio Website ที่รวม **3 ระบบหลัก** ไว้ในโปรเจกต์เดียว:

```
┌─────────────────────────────────────────────┐
│            Portfolio Website                │
├─────────────────┬───────────────────────────┤
│  1. Portfolio   │  แสดงผลงาน, ทักษะ, ประวัติ │
│  2. E-Commerce  │  ระบบสั่งซื้อซอฟต์แวร์     │
│  3. Admin Panel │  จัดการออเดอร์ + วิเคราะห์  │
└─────────────────┴───────────────────────────┘
```

### Tech Stack (เครื่องมือที่ใช้)

| Layer | Technology | เหตุผลที่เลือก |
|-------|-----------|----------------|
| Framework | Next.js 16 (App Router) | Server Components, SEO ดี, Routing ในตัว |
| Language | TypeScript 5 (strict) | Type safety ลด bug runtime |
| Styling | Tailwind CSS v4 | เขียนเร็ว, responsive ง่าย |
| Animation | Framer Motion 12 | Animation ระดับ production |
| Database | Prisma 5 + SQLite/PostgreSQL | ORM type-safe, migrate ง่าย |
| Auth | JWT (jose) + HTTP-only Cookie | Stateless, secure ต่อ XSS |
| Validation | Zod v4 | Schema validation ทั้ง frontend และ backend |
| Charts | Recharts 3 | Dashboard analytics |

---

## 2. สถาปัตยกรรมของระบบ (Architecture)

### โครงสร้างไฟล์หลัก

```
portfolio-website/
├── src/
│   ├── app/                     # Pages + API Routes (Next.js App Router)
│   │   ├── page.tsx             # หน้าแรก (Portfolio)
│   │   ├── about/               # ประวัติ
│   │   ├── shop/                # ร้านค้า
│   │   ├── showcase/            # ผลงาน
│   │   ├── admin/               # Admin Panel (ต้อง login)
│   │   └── api/                 # Backend API Routes
│   │       ├── auth/admin/      # Login / Logout
│   │       ├── shop/products/   # ดึงสินค้า
│   │       ├── shop/orders/     # สั่งซื้อ / จัดการออเดอร์
│   │       ├── admin/dashboard/ # สถิติ Dashboard
│   │       ├── admin/analytics/ # วิเคราะห์ข้อมูล
│   │       ├── track/           # บันทึก user event
│   │       └── proxy/[service]/ # Proxy ไปยัง third-party API
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── admin.ts         # JWT sign/verify
│   │   │   └── requireAdmin.ts  # Middleware guard สำหรับ API
│   │   ├── env.ts               # ★ Environment validation (เพิ่มใหม่)
│   │   └── db.ts                # Prisma client singleton
│   ├── middleware.ts             # Route protection (/admin/*)
│   └── components/              # UI Components
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # ข้อมูลเริ่มต้น
├── next.config.ts               # Next.js configuration
└── .env.local                   # Environment variables
```

### Data Flow — การสั่งซื้อสินค้า

```
User กรอกฟอร์ม
      │
      ▼
POST /api/shop/orders
      │
      ├── Zod validation (ตรวจสอบ input)
      ├── Generate order number (ORD-YYYYMMDD-XXXX)
      ├── db.order.create() → SQLite/PostgreSQL
      │
      ▼
Response: { ok: true, order: {...} }
```

### Data Flow — Admin Login

```
Admin กรอก password
      │
      ▼
POST /api/auth/admin
      │
      ├── Rate limit check (max 5 ครั้ง / 15 นาที)
      ├── ★ timingSafeEqual comparison (ป้องกัน timing attack)
      ├── signAdminToken() → JWT (expire 7 วัน)
      │
      ▼
Set HTTP-only Cookie "admin_token"
      │
      ▼
Middleware (/admin/*) → jwtVerify() ทุก request
```

---

## 3. Database Schema (โครงสร้างฐานข้อมูล)

```prisma
// prisma/schema.prisma

model Product {
  id          String      @id @default(cuid())
  slug        String      @unique       // URL-friendly identifier
  title       String
  category    String
  price       Float
  images      String      // JSON array ของ URLs
  techStack   String      // JSON array ของ technologies
  features    String      // JSON array ของ features
  deliverables String     // JSON array ของสิ่งที่ลูกค้าได้รับ
  featured    Boolean     @default(false)
  status      String      @default("active")
  orders      OrderItem[]
}

model Order {
  id           String      @id @default(cuid())
  orderNumber  String      @unique       // ORD-20260427-0042
  buyerName    String
  buyerEmail   String
  buyerPhone   String?
  status       String      @default("pending")  // pending/paid/delivered/cancelled
  totalAmount  Float
  currency     String      @default("THB")
  paidAt       DateTime?
  notes        String?
  items        OrderItem[]
  createdAt    DateTime    @default(now())
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  title     String
  price     Float
  quantity  Int      @default(1)
  order     Order    @relation(...)
  product   Product  @relation(...)
}

model PageEvent {               // Analytics tracking
  id         String   @id @default(cuid())
  sessionId  String
  eventType  String             // page_view / product_view / checkout_start / purchase_complete
  page       String
  element    String?
  metadata   String             // JSON
  userAgent  String?
  ipHash     String?            // Hashed IP (privacy)
  country    String?
  createdAt  DateTime @default(now())

  @@index([eventType])
  @@index([createdAt])
  @@index([sessionId])
}
```

---

## 4. Authentication & Security (ระบบความปลอดภัย)

### JWT + HTTP-only Cookie Flow

```
┌──────────┐    POST /api/auth/admin     ┌──────────────┐
│  Browser │ ──────────────────────────► │  Next.js API │
│          │    { password: "..." }       │              │
│          │                             │  1. Rate limit│
│          │                             │  2. Safe compare│
│          │                             │  3. Sign JWT  │
│          │ ◄────────────────────────── │              │
│          │  Set-Cookie: admin_token=.. │              │
└──────────┘  (httpOnly, secure, lax)    └──────────────┘

ครั้งต่อไปที่เรียก /admin/*:
┌──────────┐    GET /admin/products      ┌──────────────┐
│  Browser │ ──────────────────────────► │  middleware  │
│          │    Cookie: admin_token=...  │              │
│          │                             │  jwtVerify() │
│          │                             │  ✅ valid     │
│          │ ◄────────────────────────── │  → next()    │
└──────────┘    200 OK                   └──────────────┘
```

### Security Layer Summary

| การป้องกัน | Implementation | หมายเหตุ |
|-----------|----------------|---------|
| Timing Attack | `crypto.timingSafeEqual` via HMAC-SHA256 | ★ เพิ่มใหม่ |
| Brute Force | Rate limit 5 ครั้ง/15 นาที ต่อ IP | มีอยู่แล้ว |
| XSS (Cookie theft) | `httpOnly: true` | มีอยู่แล้ว |
| CSRF | `sameSite: "lax"` | มีอยู่แล้ว |
| Token hijack | `secure: true` (production) | มีอยู่แล้ว |
| Token expire | JWT expire 7 วัน | มีอยู่แล้ว |
| Route protection | middleware.ts → jwtVerify | มีอยู่แล้ว |
| Env validation | `src/lib/env.ts` | ★ เพิ่มใหม่ |

---

## 5. บทบาท System Analyst — สิ่งที่ตรวจสอบ

### Checklist ที่ใช้ตรวจ

```
✅ Dependencies & Package versions
✅ Next.js configuration
✅ App structure & routing
✅ Authentication & Security
✅ Database schema design
✅ API route design & error handling
✅ Environment variable management
✅ TypeScript configuration
✅ Performance configuration
✅ Code quality & patterns
```

---

## 6. ปัญหาที่พบและการแก้ไข (Before → After)

---

### 🔴 ปัญหาที่ 1: Timing Attack บน Password Comparison

**ระดับความเสี่ยง:** Medium  
**ไฟล์:** `src/app/api/auth/admin/route.ts`

#### อธิบายปัญหา

Timing Attack คือการโจมตีที่วัด **เวลาในการตอบสนอง** ของ server เพื่อเดาว่า password ตัวไหนถูก

ตัวอย่าง: ถ้า password ถูกเปรียบเทียบทีละตัวอักษร และ server ใช้เวลาตอบกลับต่างกัน:
- `"a..."` → ตอบกลับใน 1ms (ผิดตั้งแต่ตัวแรก)
- `"admin1..."` → ตอบกลับใน 5ms (ถูก 6 ตัว)
- `"admin123"` → ตอบกลับใน 8ms (ถูกทั้งหมด ✅)

ผู้โจมตีจะวัดเวลาและสามารถ **reverse-engineer** password ได้

#### BEFORE (โค้ดเดิม — มีช่องโหว่)

```typescript
// ❌ ใช้ === เปรียบเทียบ string โดยตรง
// JavaScript จะหยุดเปรียบเทียบทันทีที่เจอตัวอักษรที่ต่างกัน
// ทำให้เวลาตอบสนองต่างกัน ขึ้นกับว่า password ถูกกี่ตัว
if (password !== adminPassword) {
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
```

#### AFTER (โค้ดใหม่ — ปลอดภัย)

```typescript
import { createHmac, timingSafeEqual } from "crypto";

// ✅ ใช้ HMAC-SHA256 เพื่อแปลง string เป็น fixed-length buffer (32 bytes เสมอ)
// จากนั้นใช้ timingSafeEqual ซึ่งใช้เวลาเท่ากันเสมอ ไม่ว่า password จะถูกหรือผิด
function safePasswordCompare(input: string, expected: string): boolean {
  const key = process.env.ADMIN_JWT_SECRET || "dev-secret";
  const inputHash   = createHmac("sha256", key).update(input).digest();
  const expectedHash = createHmac("sha256", key).update(expected).digest();
  return timingSafeEqual(inputHash, expectedHash);  // เวลาเท่ากันเสมอ
}

// การใช้งาน
if (!safePasswordCompare(password, adminPassword)) {
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
```

**ข้อดีเพิ่มเติม:** ไม่ต้องติดตั้ง library ใหม่ ใช้ Node.js built-in `crypto` เท่านั้น

---

### 🔴 ปัญหาที่ 2: ไม่มี Environment Variable Validation

**ระดับความเสี่ยง:** Medium  
**ไฟล์เพิ่มใหม่:** `src/lib/env.ts`

#### อธิบายปัญหา

ถ้า deploy ขึ้น production แล้วลืมตั้งค่า `ADMIN_JWT_SECRET` ระบบยังทำงานได้อยู่แต่ใช้ค่า default ที่ **ทุกคนรู้** ทำให้ใครก็ตามสามารถสร้าง token ปลอมได้

```typescript
// ❌ ถ้าไม่ตั้ง env var ระบบจะใช้ default value นี้ซึ่งทุกคนรู้จาก source code
const secret = process.env.ADMIN_JWT_SECRET || "dev-secret-please-change-in-production";
```

#### AFTER (โค้ดใหม่ — `src/lib/env.ts`)

```typescript
// ✅ ตรวจสอบ env vars ตั้งแต่ startup
export function validateEnv(): void {
  const isProd = process.env.NODE_ENV === "production";
  const errors: string[] = [];

  // ต้องมีทุก environment
  const required = ["DATABASE_URL", "ADMIN_JWT_SECRET", "ADMIN_PASSWORD"];
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required env var: ${key}`);
    }
  }

  // Production: ห้ามใช้ default values
  if (isProd) {
    if (process.env.ADMIN_PASSWORD === "admin123") {
      errors.push("ADMIN_PASSWORD is using an insecure default.");
    }
    if ((process.env.ADMIN_JWT_SECRET?.length ?? 0) < 32) {
      errors.push("ADMIN_JWT_SECRET must be at least 32 characters.");
    }
  }

  if (errors.length > 0) {
    const message = ["[env] Configuration errors:", ...errors].join("\n  • ");
    if (isProd) throw new Error(message);  // Production: หยุดระบบทันที
    else console.warn(message);             // Development: แจ้งเตือนแต่ยังทำงาน
  }
}
```

**ผล:**
- `production` → ถ้า config ผิด → throw Error → deploy ล้มเหลวทันที (fail fast)
- `development` → แจ้งเตือน console แต่ยังทำงานต่อ (ไม่กวนนักพัฒนา)

---

### 🟡 ปัญหาที่ 3: Silent Error Handling

**ระดับความเสี่ยง:** Low (แต่กวนใจมากเวลา debug)  
**ไฟล์:** API routes ทุกตัว

#### อธิบายปัญหา

```typescript
// ❌ ถ้า database พัง, network หลุด, หรือ bug ใดๆ เกิดขึ้น
// เราไม่รู้เลยว่าเกิด error อะไร เพราะ catch block ไม่ log อะไร
try {
  // ...
} catch {
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
```

#### AFTER (โค้ดใหม่)

```typescript
// ✅ Log error พร้อม context ว่า error เกิดที่ไหน
try {
  // ...
} catch (error) {
  console.error("[shop/orders] POST error:", error);  // route + method ชัดเจน
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

**ไฟล์ที่แก้ไข:**
- `api/auth/admin/route.ts` → `[auth/admin] POST error:`
- `api/shop/orders/route.ts` → `[shop/orders] POST error:` + `[shop/orders] PATCH error:`
- `api/admin/dashboard/route.ts` → `[admin/dashboard] GET error:`
- `api/admin/analytics/route.ts` → `[admin/analytics] GET error:`
- `api/track/route.ts` → `[track] POST error:`

---

### 🟡 ปัญหาที่ 4: Image Optimization ปิดอยู่

**ระดับความเสี่ยง:** Low (ส่งผลต่อ performance)  
**ไฟล์:** `next.config.ts`

#### อธิบายปัญหา

`unoptimized: true` ปิดความสามารถของ Next.js ที่จะ:
- แปลงรูปเป็น WebP/AVIF อัตโนมัติ
- Resize รูปตาม viewport
- Lazy load + blur placeholder

```typescript
// BEFORE ❌
images: {
  remotePatterns: [...],
  unoptimized: true,  // ปิด optimization ทั้งหมด
}

// AFTER ✅
images: {
  remotePatterns: [
    { protocol: "https", hostname: "placehold.co" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ],
  // ลบ unoptimized ออก → Next.js optimize รูปให้อัตโนมัติ
}
```

---

### 🟡 ปัญหาที่ 5: Environment Files ไม่มี Documentation ที่ชัดเจน

**ระดับความเสี่ยง:** Low (ส่งผลต่อ onboarding และ deploy)

#### BEFORE (`.env.example` เดิม)
```bash
ADMIN_JWT_SECRET=change-me-to-a-long-random-string-32chars
ADMIN_PASSWORD=admin123
```

#### AFTER (`.env.example` ใหม่)
```bash
# Secret key for signing admin JWT tokens.
# REQUIRED: Must be at least 32 characters. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# WARNING: App will throw on startup in production if this is missing or < 32 chars.
ADMIN_JWT_SECRET=change-me-to-a-long-random-string-32chars

# Admin login password.
# REQUIRED: Change from the default before deploying.
# WARNING: App will warn on startup in production if this is still "admin123".
ADMIN_PASSWORD=admin123
```

---

## 7. สรุปการเปลี่ยนแปลงทั้งหมด (Change Summary)

| # | ไฟล์ | การเปลี่ยนแปลง | ประเภท |
|---|------|----------------|--------|
| 1 | `src/app/api/auth/admin/route.ts` | เปลี่ยนเป็น `timingSafeEqual` via HMAC + error logging | Security |
| 2 | `src/lib/env.ts` | **สร้างใหม่** — ตรวจสอบ env vars ตั้งแต่ startup | Security |
| 3 | `src/lib/auth/admin.ts` | เรียก `validateEnv()` เมื่อ module โหลด | Security |
| 4 | `src/app/api/shop/orders/route.ts` | เพิ่ม `console.error` ทั้ง POST และ PATCH | Reliability |
| 5 | `src/app/api/admin/dashboard/route.ts` | ครอบ try/catch + error logging | Reliability |
| 6 | `src/app/api/admin/analytics/route.ts` | ครอบ try/catch + error logging | Reliability |
| 7 | `src/app/api/track/route.ts` | เพิ่ม `console.error` | Reliability |
| 8 | `next.config.ts` | ลบ `unoptimized: true` เพื่อเปิด image optimization | Performance |
| 9 | `.env.local` | อัปเดต JWT secret ให้ไม่ใช่ known default | Security |
| 10 | `.env.example` | เพิ่ม documentation + วิธี generate secret | DX |

---

## 8. คะแนนก่อน/หลัง (Score Comparison)

| หัวข้อ | ก่อนแก้ | หลังแก้ |
|--------|---------|---------|
| Security | 7/10 | **9/10** |
| Reliability | 6/10 | **9/10** |
| Performance | 8/10 | **9/10** |
| Developer Experience | 7/10 | **9/10** |
| **รวม** | **7.0/10** | **9.0/10** |

---

## 9. สิ่งที่ระบบทำได้ดีอยู่แล้ว (Existing Strengths)

ไม่ใช่แค่แก้ปัญหา ต้องยืนยันสิ่งที่ออกแบบดีแล้วด้วย:

```
✅ JWT + HTTP-only Cookie — ป้องกัน XSS ได้ดี
✅ Rate limiting (5 ครั้ง/15 นาที) — ป้องกัน brute force
✅ Zod v4 validation — ตรวจสอบ input ทุก API endpoint
✅ TypeScript strict mode — ลด runtime error
✅ Prisma ORM — type-safe database queries
✅ Middleware route protection — ครอบทุก /admin/* route
✅ Server Components (Next.js) — SEO + performance ดี
✅ Turbopack — build เร็วขึ้น ~30%
✅ Proxy layer (/api/proxy/[service]) — ซ่อน API keys จาก frontend
✅ Analytics tracking — เก็บข้อมูล user behavior พร้อม privacy (hash IP)
```

---

## 10. Architecture Decision Records (ทำไมถึงเลือกแบบนี้)

### ทำไมถึงใช้ JWT แทน NextAuth?

| เกณฑ์ | JWT (ที่เลือก) | NextAuth |
|-------|--------------|---------|
| ความซับซ้อน | ต่ำ | สูง |
| Dependencies | `jose` เท่านั้น | หลาย packages |
| เหมาะกับ | Single-user admin | Multi-user system |
| Customization | เต็มที่ | จำกัด |

→ **เหมาะสมสำหรับ single-admin portfolio** ไม่ต้อง over-engineer

### ทำไม SQLite ใน development?

- ไม่ต้องติดตั้ง PostgreSQL ใน local
- `prisma migrate` ทำงานทันที
- ย้ายไป PostgreSQL ตอน deploy แค่เปลี่ยน `DATABASE_URL`

### ทำไม `timingSafeEqual` ไม่ใช้ bcrypt?

| เกณฑ์ | timingSafeEqual | bcrypt |
|-------|----------------|--------|
| Dependencies | Node.js built-in | ต้อง install |
| Use case | Compare secrets | Hash + compare passwords |
| เหมาะกับ | Single admin (env-based) | User database |
| Performance | O(1) | Intentionally slow |

→ สำหรับ single admin ที่ password เก็บใน env var, `timingSafeEqual` เพียงพอและไม่เพิ่ม dependency

---

## 11. สิ่งที่จะพัฒนาต่อ (Future Improvements)

ถ้ามีเวลา หรือ ระบบขยายตัวในอนาคต:

| Priority | Feature | เหตุผล |
|----------|---------|--------|
| P1 | Test suite (Jest/Vitest) | ไม่มี test เลยตอนนี้ |
| P1 | Structured logging (pino) | console.error ยังไม่เพียงพอสำหรับ production |
| P2 | Redis rate limiting | ปัจจุบันใช้ in-memory Map (reset เมื่อ restart) |
| P2 | Error monitoring (Sentry) | ติดตาม error ใน production |
| P3 | CI/CD pipeline | Auto lint + type-check + build ก่อน deploy |
| P3 | bcrypt migration | ถ้าเปลี่ยนเป็น multi-user ในอนาคต |

---

## 12. สรุปสำหรับการพรีเซนต์

### จุดที่อยากเน้น

1. **วิเคราะห์เป็น** — ไม่แค่ code ได้ แต่มองเห็น risk ที่ซ่อนอยู่ในโค้ดที่ดูเหมือนทำงานได้ปกติ

2. **แก้ถูกจุด** — เลือกแก้ตาม priority: security ก่อน, reliability ต่อมา, performance สุดท้าย

3. **ใช้ built-in ก่อน** — `crypto.timingSafeEqual` ไม่ต้อง install library ใหม่ = ลด attack surface

4. **Fail fast principle** — `validateEnv()` ทำให้ system พังตั้งแต่ startup ถ้า config ผิด ดีกว่าปล่อยให้พังตอน production ใช้งานจริง

5. **ไม่ over-engineer** — แก้เท่าที่จำเป็น ไม่เพิ่ม complexity เกินความต้องการของระบบ

---

*เอกสารนี้สร้างเพื่อใช้ในการพรีเซนต์ระบบในฐานะ Software Engineer + System Analyst*  
*Sumet Buarod | sumet.buarod@gmail.com | 095-803-9303*

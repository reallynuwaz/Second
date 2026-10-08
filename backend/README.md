# SECOND Backend — คู่มือติดตั้ง

Backend API สำหรับเว็บ SECOND (ตลาดของมือสอง) เขียนด้วย Node.js + Express + MongoDB

## ขั้นตอนติดตั้ง

### 1. ติดตั้ง dependencies
เปิด terminal ในโฟลเดอร์นี้ แล้วรัน:
```
npm install
```

### 2. ตั้งค่าไฟล์ .env
ก็อปไฟล์ `.env.example` เป็นไฟล์ใหม่ชื่อ `.env` แล้วใส่ค่าจริง 2 อย่าง:

- **MONGODB_URI**: connection string จาก MongoDB Atlas
  - เข้า MongoDB Atlas → เลือก cluster → กด "Connect" → เลือก "Drivers" → ก็อป URI มาวาง
  - อย่าลืมเปลี่ยน `<password>` เป็นรหัสผ่านจริงของ database user
  - อย่าลืมเช็คว่า Network Access ใน Atlas อนุญาต IP ของคุณแล้ว (หรือเลือก "Allow access from anywhere" ตอนเทส)

- **JWT_SECRET**: ตั้งข้อความลับยาวๆ สุ่มๆ อะไรก็ได้ (ใช้เข้ารหัส token ตอนล็อกอิน)

### 3. รัน server
```
npm run dev
```
ถ้าติดตั้งถูกต้อง จะเห็นข้อความ:
```
✅ เชื่อมต่อ MongoDB สำเร็จ
🚀 Server รันอยู่ที่ http://localhost:5000
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5000` ถ้าเห็น `{"message":"SECOND API กำลังทำงานอยู่ 🚀"}` แปลว่าเชื่อมต่อสำเร็จ

## รายการ API ที่มีให้ใช้

| Method | Endpoint | คำอธิบาย | ต้องล็อกอินไหม |
|---|---|---|---|
| POST | `/api/auth/register` | สมัครสมาชิก | ไม่ |
| POST | `/api/auth/login` | เข้าสู่ระบบ | ไม่ |
| GET | `/api/listings` | ดูสินค้าทั้งหมด (กรองด้วย `?category=ไอที` หรือค้นหาด้วย `?q=คำค้น`) | ไม่ |
| GET | `/api/listings/categories` | รายชื่อหมวดหมู่ทั้งหมด | ไม่ |
| GET | `/api/listings/:id` | ดูรายละเอียดสินค้าชิ้นเดียว | ไม่ |
| POST | `/api/listings` | ลงขายสินค้าใหม่ (แนบรูปได้สูงสุด 5 รูป) | **ต้อง** |
| PATCH | `/api/listings/:id/sold` | มาร์คว่าขายแล้ว | **ต้อง** (เฉพาะเจ้าของ) |
| DELETE | `/api/listings/:id` | ลบประกาศ | **ต้อง** (เฉพาะเจ้าของ) |

หน้าเว็บ (frontend) จะเรียก endpoint พวกนี้ผ่าน `fetch()` เพื่อดึง/บันทึกข้อมูลจริง

## แก้ปัญหาที่เจอบ่อย

- **"เชื่อมต่อ MongoDB ไม่สำเร็จ"** → เช็คว่า `.env` ตั้งค่า `MONGODB_URI` ถูกไหม และเช็ค Network Access ใน Atlas
- **"Cannot find module 'xxx'"** → ยังไม่ได้รัน `npm install` หรือรันไม่สำเร็จ ลองรันใหม่
- **Server รันได้แต่ frontend เรียกไม่ติด** → เช็คว่า frontend เรียก URL ถูกไหม (ควรเป็น `http://localhost:5000/api/...`)

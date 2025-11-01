## Hướng Dẫn FE Tích Hợp Tính Năng Thuê Bao Premium

### 1. Mục tiêu

- Hiển thị danh sách gói thuê bao cùng bộ tính năng premium thống nhất.
- Cho phép người dùng mua gói, theo dõi trạng thái, hủy gói và kiểm tra quyền truy cập tính năng.
- Sử dụng API mới, không còn phụ thuộc vào trường `default_features` trong schema.

### 2. Bộ tính năng PREMIUM hiện tại

Backend luôn trả về cùng một snapshot `features` cho mọi thuê bao đang hoạt động:

```json
{
  "max_daily_reminders": 20,
  "priority_support": true,
  "export_history": true,
  "max_followed_contests": 100
}
```

FE có thể hiển thị trực tiếp giá trị này cho gói premium, đồng thời dùng các khóa phía trên để kiểm tra quyền truy cập.

### 3. Các endpoint chính

**3.1. Danh sách gói khả dụng (public)**

- `GET /api/user-subscriptions/plans`
- Response mẫu:

```json
{
  "success": true,
  "message": "Get plans successfully",
  "data": [
    {
      "_id": "66f8...",
      "name": "Premium 1 tháng",
      "description": "Bật toàn bộ tính năng nâng cao",
      "price": 99000,
      "currency": "VND",
      "billing_cycle": "monthly",
      "duration_months": 1,
      "status": "active",
      "popular": false,
      "display_order": 1,
      "features": {
        "max_daily_reminders": 20,
        "priority_support": true,
        "export_history": true,
        "max_followed_contests": 100
      }
    }
  ]
}
```

**3.2. Thông tin gói theo id (public)**

- `GET /api/user-subscriptions/plans/:planId`
- Trả về một object gói với trường `features` như trên.

**3.3. Thuê bao hiện tại của người dùng (cần token + user đã verify)**

- `GET /api/user-subscriptions/current`
- Header: `Authorization: Bearer <access_token>`
- Response nếu có thuê bao active:

```json
{
  "success": true,
  "data": {
    "_id": "6701...",
    "user_id": "USR-...",
    "plan_id": "66f8...",
    "plan": {
      "name": "Premium 1 tháng",
      "description": "...",
      "price": 99000,
      "billing_cycle": "monthly",
      "features": {
        "max_daily_reminders": 20,
        "priority_support": true,
        "export_history": true,
        "max_followed_contests": 100
      }
    },
    "status": "active",
    "start_date": "2024-10-01T00:00:00.000Z",
    "end_date": "2024-11-01T00:00:00.000Z",
    "amount_paid": 99000,
    "currency": "VND",
    "features": {
      "max_daily_reminders": 20,
      "priority_support": true,
      "export_history": true,
      "max_followed_contests": 100
    }
  }
}
```

- Nếu chưa có thuê bao: `data` = `null`, `message` = `"No active subscription"`.

**3.4. Lịch sử thuê bao của người dùng**

- `GET /api/user-subscriptions/history`
- Trả về mảng các bản ghi (pending, active, cancelled); mỗi bản ghi có `plan_id` populate `name`, `description`, `price`, `billing_cycle`.

**3.5. Tạo đơn mua gói**

- `POST /api/user-subscriptions/purchase`
- Body JSON: `{ "plan_id": "<id>" }`
- Điều kiện: user chưa có thuê bao `active`, kế hoạch `status = active`.
- Response thành công (`201`):

```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscription_id": "6701...",
    "payment_url": "https://payos.vn/...",
    "qr_code": "...",
    "order_code": "20241001123000",
    "amount": 99000,
    "plan_name": "Premium 1 tháng",
    "expiry_date": "2024-11-01T00:00:00.000Z"
  }
}
```

- FE mở `payment_url` để người dùng thanh toán. Sau khi webhook PayOS xác nhận, backend tự động chuyển trạng thái subscription sang `active`. FE nên:
  - Sau thanh toán redirect, gọi lại `GET /api/user-subscriptions/current` để kiểm tra.
  - Optionally hiển thị thông tin order dựa trên `order_code`.

**3.6. Hủy thuê bao**

- `POST /api/user-subscriptions/:subscription_id/cancel`
- Body optional: `{ "reason": "User request" }`
- Chỉ hủy được khi trạng thái hiện tại là `active`.

**3.7. Kiểm tra quyền truy cập tính năng**

- `GET /api/user-subscriptions/features/:feature_key/check`
- Sử dụng cùng bộ khóa trong `PREMIUM_FEATURES`.
- Response mẫu khi có quyền:

```json
{
  "success": true,
  "hasAccess": true,
  "message": "Feature access checked",
  "value": 20
}
```

- Khi không có thuê bao: `hasAccess = false`, `message = "No active subscription"`.

### 4. Đề xuất luồng FE

- **Trang danh sách gói**: gọi `GET /api/user-subscriptions/plans`, hiển thị thông tin giá, chu kỳ, tính năng (hiển thị trực tiếp từ `features`).
- **Trang quản lý thuê bao cá nhân**: khi người dùng đã đăng nhập & verify, gọi `GET /api/user-subscriptions/current` để hiển thị trạng thái.
- **Mua gói**: gửi `POST /api/user-subscriptions/purchase`, chuyển người dùng tới `payment_url`, sau khi thanh toán xong gọi lại endpoint current để cập nhật UI.
- **Tích hợp giới hạn tính năng**: trước các hành động cần quyền premium, gọi `GET /api/user-subscriptions/features/<feature_key>/check` (hoặc đọc `features` từ subscription hiện tại đã cache) để xác định quota/khả năng truy cập.
- **Hủy gói**: cung cấp UI gọi `POST /api/user-subscriptions/:subscription_id/cancel` khi người dùng chủ động dừng dịch vụ.

### 5. Xử lý lỗi & lưu ý

- Toàn bộ endpoint (trừ danh sách gói) yêu cầu header `Authorization` hợp lệ và user đã `isVerified`.
- Nếu backend trả `success: false`, FE cần hiển thị `message` tương ứng và không cố sử dụng các trường `features` cũ.
- Luôn fallback `features` sang bộ mặc định ở trên nếu FE đang xử lý dữ liệu cũ (đề phòng trường hợp API trả về `features = null`).
- Đảm bảo truyền đúng `plan_id` MongoDB `_id` khi mua gói.
- Backend hiện trả ngày theo ISO string; FE nên format trước khi hiển thị.

### 6. Checklist kiểm thử FE

- [ ] Hiển thị đúng danh sách gói kèm mô tả tính năng.
- [ ] Mua gói mới khi chưa có thuê bao active → nhận được `payment_url`.
- [ ] Sau thanh toán, `GET /current` phản hồi trạng thái `active` và có dữ liệu `features`.
- [ ] Hủy thuê bao active → trạng thái cập nhật và bị loại khỏi `current`.
- [ ] Kiểm tra `feature_key` (ví dụ `max_daily_reminders`) trả về `hasAccess = true` và đúng giá trị.
- [ ] Người chưa có thuê bao nhận `data = null` ở `/current` và `hasAccess = false` ở `/features/.../check`.

### 7. Dashboard chỉ số (Admin)

- `GET /api/user-subscriptions/dashboard`
- Yêu cầu: token hợp lệ, user `isVerified` + `isAdmin`.
- Query optional:
  - `start_date`, `end_date` (ISO string) để lọc theo `createdAt` của subscription.
  - `status` (`active`, `expired`, `cancelled`, `pending`).
  - `plan_id` để lọc theo một gói cụ thể.
- Response mẫu:

```json
{
  "success": true,
  "message": "Get subscription dashboard metrics successfully",
  "data": {
    "summary": {
      "totalRevenue": 450000,
      "totalSubscriptions": 12,
      "activeSubscriptions": 9,
      "cancelledSubscriptions": 1,
      "expiredSubscriptions": 1,
      "pendingSubscriptions": 1
    },
    "plans": [
      {
        "plan_id": "66f8...",
        "plan_name": "Premium 1 tháng",
        "plan_price": 99000,
        "plan_currency": "VND",
        "billing_cycle": "monthly",
        "duration_months": 1,
        "totalSubscriptions": 10,
        "activeSubscriptions": 8,
        "cancelledSubscriptions": 1,
        "expiredSubscriptions": 0,
        "pendingSubscriptions": 1,
        "totalRevenue": 396000
      }
    ]
  }
}
```

- FE dashboard có thể dùng `summary` để hiển thị KPI tổng quan và `plans` cho bảng chi tiết từng gói.

# API Tài liệu - Plans và Subscription Plans

Tài liệu này mô tả tất cả các API liên quan đến:
1. Admin tạo và quản lý gói plans
2. Người dùng đăng ký/subscribe các gói subscription plans

---

## Mục lục

1. [Admin - Tạo và quản lý Plans](#admin---tạo-và-quản-lý-plans)
2. [Admin - Tạo và quản lý User Subscription Plans](#admin---tạo-và-quản-lý-user-subscription-plans)
3. [User - Đăng ký và quản lý Subscription](#user---đăng-ký-và-quản-lý-subscription)

---

## Admin - Tạo và quản lý Plans

### 1. Tạo Plan mới (Admin)

**Endpoint:** `POST /api/plans`

**Authentication:** Required (Admin only)

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "Premium Plan",
  "description": "Premium plan với đầy đủ tính năng",
  "price_amount": 500000,
  "currency": "VND",
  "status": "active"
}
```

**Request Fields:**
- `name` (string, required): Tên của plan
- `description` (string, optional): Mô tả plan
- `price_amount` (number, required): Giá của plan (phải >= 0)
- `currency` (string, optional): Loại tiền tệ, mặc định: "VND"
- `status` (string, optional): Trạng thái plan. Giá trị hợp lệ: `"active"`, `"inactive"`. Mặc định: `"active"`

**Response Success (201):**
```json
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "name": "Premium Plan",
    "description": "Premium plan với đầy đủ tính năng",
    "price_amount": 500000,
    "currency": "VND",
    "status": "active",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Missing required fields: name, price_amount"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "price_amount must be a non-negative number"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Plan name already exists"
}
```

---

### 2. Lấy danh sách Plans (Public/Admin)

**Endpoint:** `GET /api/plans`

**Authentication:** Không bắt buộc

**Query Parameters:**
- `page` (number, optional): Số trang, mặc định: 1
- `limit` (number, optional): Số lượng items mỗi trang, mặc định: 10
- `status` (string, optional): Lọc theo trạng thái
- `search` (string, optional): Tìm kiếm theo tên hoặc mô tả
- `sortBy` (string, optional): Sắp xếp theo field, mặc định: "created_at"
- `sortOrder` (string, optional): "asc" hoặc "desc", mặc định: "desc"
- `minPrice` (number, optional): Giá tối thiểu
- `maxPrice` (number, optional): Giá tối đa
- `currency` (string, optional): Lọc theo loại tiền tệ

**Example Request:**
```
GET /api/plans?page=1&limit=10&status=active&search=Premium
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "name": "Premium Plan",
      "description": "Premium plan với đầy đủ tính năng",
      "price_amount": 500000,
      "currency": "VND",
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3. Lấy Plan theo ID (Public/Admin)

**Endpoint:** `GET /api/plans/:id`

**Authentication:** Không bắt buộc

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "name": "Premium Plan",
    "description": "Premium plan với đầy đủ tính năng",
    "price_amount": 500000,
    "currency": "VND",
    "status": "active",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Plan not found"
}
```

---

### 4. Cập nhật Plan (Admin)

**Endpoint:** `PUT /api/plans/:id`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Updated Premium Plan",
  "description": "Updated description",
  "price_amount": 600000,
  "currency": "VND",
  "status": "active"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plan updated successfully",
  "data": {
    "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "name": "Updated Premium Plan",
    "description": "Updated description",
    "price_amount": 600000,
    "currency": "VND",
    "status": "active",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### 5. Xóa Plan (Admin)

**Endpoint:** `DELETE /api/plans/:id`

**Authentication:** Required (Admin only)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Cannot delete plan with associated features. Remove features first."
}
```

---

### 6. Lấy Plans theo Status (Public/Admin)

**Endpoint:** `GET /api/plans/status/:status`

**Authentication:** Không bắt buộc

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "name": "Premium Plan",
      "status": "active",
      ...
    }
  ]
}
```

---

### 7. Cập nhật Status của Plan (Admin)

**Endpoint:** `PATCH /api/plans/:id/status`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plan status updated successfully",
  "data": {
    "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "status": "inactive",
    ...
  }
}
```

---

## Admin - Tạo và quản lý User Subscription Plans

### 1. Tạo User Subscription Plan (Admin)

**Endpoint:** `POST /api/user-subscriptions/plans`

**Authentication:** Required (Admin only)

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "Premium Monthly",
  "description": "Gói premium hàng tháng với đầy đủ tính năng",
  "price": 299000,
  "currency": "VND",
  "billing_cycle": "monthly",
  "duration_months": 1,
  "status": "active",
  "popular": true,
  "display_order": 1
}
```

**Request Fields:**
- `name` (string, required): Tên của subscription plan (phải unique)
- `description` (string, optional): Mô tả plan
- `price` (number, required): Giá của plan (phải >= 0)
- `currency` (string, optional): Loại tiền tệ, mặc định: "VND"
- `billing_cycle` (string, required): Chu kỳ thanh toán. Giá trị hợp lệ: `"monthly"`, `"yearly"`
- `duration_months` (number, required): Số tháng của subscription (phải >= 1)
- `status` (string, optional): Trạng thái plan. Giá trị hợp lệ: `"active"`, `"inactive"`, `"archived"`. Mặc định: `"active"`
- `popular` (boolean, optional): Đánh dấu plan phổ biến, mặc định: false
- `display_order` (number, optional): Thứ tự hiển thị, mặc định: 0

**Response Success (201):**
```json
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Monthly",
    "description": "Gói premium hàng tháng với đầy đủ tính năng",
    "price": 299000,
    "currency": "VND",
    "billing_cycle": "monthly",
    "duration_months": 1,
    "status": "active",
    "popular": true,
    "display_order": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Missing required fields: name, price, billing_cycle, duration_months"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Invalid billing_cycle. Must be one of: monthly, yearly"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Plan name already exists"
}
```

---

### 2. Lấy danh sách User Subscription Plans (Public)

**Endpoint:** `GET /api/user-subscriptions/plans`

**Authentication:** Không bắt buộc

**Response Success (200):**
```json
{
  "success": true,
  "message": "Get plans successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Monthly",
      "description": "Gói premium hàng tháng",
      "price": 299000,
      "currency": "VND",
      "billing_cycle": "monthly",
      "duration_months": 1,
      "status": "active",
      "popular": true,
      "display_order": 1,
      "features": {
        "max_daily_reminders": 20,
        "priority_support": true,
        "export_history": true,
        "max_followed_contests": 100
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Lưu ý:** API này chỉ trả về các plans có status = "active" và được sắp xếp theo `display_order` và `price`.

---

### 3. Lấy User Subscription Plan theo ID (Public)

**Endpoint:** `GET /api/user-subscriptions/plans/:planId`

**Authentication:** Không bắt buộc

**Response Success (200):**
```json
{
  "success": true,
  "message": "Get plan successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Monthly",
    "description": "Gói premium hàng tháng",
    "price": 299000,
    "currency": "VND",
    "billing_cycle": "monthly",
    "duration_months": 1,
    "status": "active",
    "popular": true,
    "display_order": 1,
    "features": {
      "max_daily_reminders": 20,
      "priority_support": true,
      "export_history": true,
      "max_followed_contests": 100
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Plan not found"
}
```

---

### 4. Cập nhật User Subscription Plan (Admin)

**Endpoint:** `PUT /api/user-subscriptions/plans/:planId`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Updated Premium Monthly",
  "description": "Updated description",
  "price": 349000,
  "billing_cycle": "monthly",
  "duration_months": 1,
  "popular": false
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plan updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Premium Monthly",
    "price": 349000,
    ...
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### 5. Cập nhật Status của User Subscription Plan (Admin)

**Endpoint:** `PATCH /api/user-subscriptions/plans/:planId/status`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plan status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "inactive",
    ...
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Invalid status. Must be one of: active, inactive, archived"
}
```

---

### 6. Xóa User Subscription Plan (Admin)

**Endpoint:** `DELETE /api/user-subscriptions/plans/:planId`

**Authentication:** Required (Admin only)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Plan not found"
}
```

---

## User - Đăng ký và quản lý Subscription

### 1. Đăng ký/Purchase Subscription Plan (User)

**Endpoint:** `POST /api/user-subscriptions/purchase`

**Authentication:** Required (User phải verified)

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "plan_id": "507f1f77bcf86cd799439011"
}
```

**Request Fields:**
- `plan_id` (string, required): ID của subscription plan muốn đăng ký

**Response Success (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscription_id": "507f191e810c19729de860ea",
    "payment_url": "https://pay.payos.vn/web/...",
    "qr_code": "data:image/png;base64,...",
    "order_code": "1697356800000",
    "amount": 299000,
    "plan_name": "Premium Monthly",
    "expiry_date": "2024-02-15T10:30:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Plan ID is required"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Plan not found"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Plan is not available"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "You already have an active subscription"
}
```

**Lưu ý:** 
- Sau khi purchase thành công, subscription sẽ ở trạng thái `pending`
- User cần thanh toán qua `payment_url` hoặc `qr_code`
- Sau khi thanh toán thành công (qua webhook), subscription sẽ tự động chuyển sang trạng thái `active`

---

### 2. Lấy Subscription hiện tại của User (User)

**Endpoint:** `GET /api/user-subscriptions/current`

**Authentication:** Required (User phải verified)

**Response Success (200) - Có subscription active:**
```json
{
  "success": true,
  "message": "Get subscription successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "user_id": "user123",
    "plan_id": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Monthly",
      "description": "Gói premium hàng tháng",
      "price": 299000,
      "billing_cycle": "monthly"
    },
    "plan": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Monthly",
      "description": "Gói premium hàng tháng",
      "price": 299000,
      "billing_cycle": "monthly",
      "features": {
        "max_daily_reminders": 20,
        "priority_support": true,
        "export_history": true,
        "max_followed_contests": 100
      }
    },
    "status": "active",
    "start_date": "2024-01-15T10:30:00.000Z",
    "end_date": "2024-02-15T10:30:00.000Z",
    "amount_paid": 299000,
    "currency": "VND",
    "features": {
      "max_daily_reminders": 20,
      "priority_support": true,
      "export_history": true,
      "max_followed_contests": 100
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Success (200) - Không có subscription active:**
```json
{
  "success": true,
  "message": "No active subscription",
  "data": null
}
```

---

### 3. Lấy lịch sử Subscription của User (User)

**Endpoint:** `GET /api/user-subscriptions/history`

**Authentication:** Required (User phải verified)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Get subscription history successfully",
  "data": [
    {
      "_id": "507f191e810c19729de860ea",
      "user_id": "user123",
      "plan_id": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Premium Monthly",
        "description": "Gói premium hàng tháng",
        "price": 299000,
        "billing_cycle": "monthly"
      },
      "status": "active",
      "start_date": "2024-01-15T10:30:00.000Z",
      "end_date": "2024-02-15T10:30:00.000Z",
      "amount_paid": 299000,
      "currency": "VND",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f191e810c19729de860eb",
      "user_id": "user123",
      "plan_id": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Premium Yearly",
        ...
      },
      "status": "expired",
      "start_date": "2023-01-15T10:30:00.000Z",
      "end_date": "2024-01-15T10:30:00.000Z",
      "amount_paid": 2990000,
      "currency": "VND",
      "createdAt": "2023-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Hủy Subscription (User)

**Endpoint:** `POST /api/user-subscriptions/:subscription_id/cancel`

**Authentication:** Required (User phải verified)

**Request Body:**
```json
{
  "reason": "Không còn nhu cầu sử dụng"
}
```

**Request Fields:**
- `reason` (string, optional): Lý do hủy subscription

**Response Success (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "user_id": "user123",
    "status": "cancelled",
    "cancelled_at": "2024-01-20T10:30:00.000Z",
    "cancelled_reason": "Không còn nhu cầu sử dụng",
    ...
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Subscription not found"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Only active subscriptions can be cancelled"
}
```

---

### 5. Kiểm tra quyền truy cập Feature (User)

**Endpoint:** `GET /api/user-subscriptions/features/:feature_key/check`

**Authentication:** Required (User phải verified)

**Response Success (200) - Có quyền:**
```json
{
  "success": true,
  "hasAccess": true,
  "message": "Feature access checked",
  "value": 20
}
```

**Response Success (200) - Không có quyền:**
```json
{
  "success": true,
  "hasAccess": false,
  "message": "No active subscription",
  "value": null
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Feature key is required"
}
```

**Các feature keys có sẵn:**
- `max_daily_reminders`: Số lượng nhắc nhở tối đa mỗi ngày (default: 20)
- `priority_support`: Hỗ trợ ưu tiên (boolean)
- `export_history`: Xuất lịch sử (boolean)
- `max_followed_contests`: Số lượng cuộc thi theo dõi tối đa (default: 100)

---

### 6. Dashboard Subscription Metrics (Admin)

**Endpoint:** `GET /api/user-subscriptions/dashboard`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `start_date` (string, optional): Ngày bắt đầu (ISO format)
- `end_date` (string, optional): Ngày kết thúc (ISO format)
- `status` (string, optional): Lọc theo trạng thái subscription
- `plan_id` (string, optional): Lọc theo plan ID

**Example Request:**
```
GET /api/user-subscriptions/dashboard?start_date=2024-01-01&end_date=2024-01-31&status=active
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Get subscription dashboard metrics successfully",
  "data": {
    "summary": {
      "totalRevenue": 50000000,
      "totalSubscriptions": 150,
      "activeSubscriptions": 120,
      "cancelledSubscriptions": 15,
      "expiredSubscriptions": 10,
      "pendingSubscriptions": 5
    },
    "plans": [
      {
        "plan_id": "507f1f77bcf86cd799439011",
        "plan_name": "Premium Monthly",
        "plan_price": 299000,
        "plan_currency": "VND",
        "billing_cycle": "monthly",
        "duration_months": 1,
        "totalSubscriptions": 100,
        "activeSubscriptions": 85,
        "cancelledSubscriptions": 10,
        "expiredSubscriptions": 5,
        "pendingSubscriptions": 0,
        "totalRevenue": 29900000
      }
    ]
  }
}
```

---

## Các Status Values

### Plan Statuses:
- `active`: Plan đang hoạt động
- `inactive`: Plan không hoạt động

### User Subscription Plan Statuses:
- `active`: Plan đang được bán
- `inactive`: Plan tạm ngưng bán
- `archived`: Plan đã được lưu trữ

### Subscription Statuses:
- `pending`: Đang chờ thanh toán
- `active`: Subscription đang hoạt động
- `expired`: Subscription đã hết hạn
- `cancelled`: Subscription đã bị hủy

### Billing Cycles:
- `monthly`: Hàng tháng
- `yearly`: Hàng năm

---

## Premium Features

Tất cả các subscription plans active sẽ được cấp các premium features sau:

```json
{
  "max_daily_reminders": 20,
  "priority_support": true,
  "export_history": true,
  "max_followed_contests": 100
}
```

---

## Lưu ý quan trọng

1. **Authentication**: 
   - Tất cả các API Admin yêu cầu token với quyền Admin
   - Các API User yêu cầu token và user phải verified
   - Các API Public không cần authentication

2. **Purchase Flow**:
   - User gọi API purchase → nhận payment_url và qr_code
   - User thanh toán qua PayOS
   - PayOS gọi webhook → subscription tự động chuyển sang `active`

3. **Subscription Validation**:
   - User chỉ có thể có 1 subscription active tại một thời điểm
   - Khi purchase subscription mới, hệ thống sẽ kiểm tra subscription active hiện tại

4. **Plan Status**:
   - Chỉ các plans có status = "active" mới được hiển thị cho user trong API `GET /api/user-subscriptions/plans`
   - User chỉ có thể purchase các plans đang active

5. **Currency**: 
   - Mặc định là "VND" nếu không được chỉ định

---

## Error Codes Summary

| Status Code | Mô tả |
|------------|-------|
| 200 | Success |
| 201 | Created Successfully |
| 400 | Bad Request (Validation errors) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

*Tài liệu được cập nhật lần cuối: 2024-01-15*


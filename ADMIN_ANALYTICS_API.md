# Admin Analytics API Documentation

Tài liệu này mô tả tất cả các API thống kê dành cho Admin để xây dựng Dashboard.

## Yêu cầu xác thực

Tất cả các API yêu cầu:

- Header: `Authorization: Bearer <token>`
- User phải có role `admin`
- User phải đã verified email (`isVerified`)

---

## 1. Thống kê Người dùng/Organizer

### 1.1. Lấy thống kê người dùng theo khoảng thời gian tùy chỉnh

**Endpoint:** `GET /api/analytics/users/time-range`

**Query Parameters:**

- `startDate` (required): Ngày bắt đầu (format: `YYYY-MM-DD`)
- `endDate` (required): Ngày kết thúc (format: `YYYY-MM-DD`)

**Example Request:**

```http
GET /api/analytics/users/time-range?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.999Z",
    "newUsers": 150,
    "newOrganizers": 25,
    "total": 175
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Start date and end date are required"
}
```

---

### 1.2. Lấy thống kê người dùng theo tuần/tháng trong một năm

**Endpoint:** `GET /api/analytics/users/period`

**Query Parameters:**

- `year` (required): Năm cần thống kê (ví dụ: `2025`)
- `groupBy` (optional): Nhóm theo `week` hoặc `month` (mặc định: `month`)

**Example Request:**

```http
GET /api/analytics/users/period?year=2025&groupBy=month
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User statistics by period retrieved successfully",
  "data": {
    "year": 2025,
    "groupBy": "month",
    "users": [
      {
        "_id": 1,
        "month": 1,
        "count": 15
      },
      {
        "_id": 2,
        "month": 2,
        "count": 20
      }
      // ... các tháng khác (1-12)
    ],
    "organizers": [
      {
        "_id": 1,
        "month": 1,
        "count": 3
      },
      {
        "_id": 2,
        "month": 2,
        "count": 5
      }
      // ... các tháng khác
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Year is required"
}
```

hoặc

```json
{
  "success": false,
  "message": "groupBy must be 'week' or 'month'"
}
```

---

### 1.3. Lấy thống kê người dùng theo năm

**Endpoint:** `GET /api/analytics/users/year`

**Query Parameters:**

- `startYear` (optional): Năm bắt đầu (mặc định: `2020`)
- `endYear` (optional): Năm kết thúc (mặc định: năm hiện tại)

**Example Request:**

```http
GET /api/analytics/users/year?startYear=2020&endYear=2025
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User statistics by year retrieved successfully",
  "data": {
    "startYear": 2020,
    "endYear": 2025,
    "users": [
      {
        "_id": 2020,
        "year": 2020,
        "count": 100
      },
      {
        "_id": 2021,
        "year": 2021,
        "count": 150
      }
      // ... các năm khác
    ],
    "organizers": [
      {
        "_id": 2020,
        "year": 2020,
        "count": 10
      },
      {
        "_id": 2021,
        "year": 2021,
        "count": 15
      }
      // ... các năm khác
    ]
  }
}
```

---

## 2. Thống kê Doanh thu (Revenue)

### 2.1. Lấy thống kê doanh thu theo khoảng thời gian tùy chỉnh

**Endpoint:** `GET /api/analytics/revenue/time-range`

**Query Parameters:**

- `startDate` (required): Ngày bắt đầu (format: `YYYY-MM-DD`)
- `endDate` (required): Ngày kết thúc (format: `YYYY-MM-DD`)

**Example Request:**

```http
GET /api/analytics/revenue/time-range?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Revenue statistics retrieved successfully",
  "data": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.999Z",
    "totalRevenue": 50000000,
    "totalOrders": 1250
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Start date and end date are required"
}
```

---

### 2.2. Lấy thống kê doanh thu theo tuần/tháng trong một năm

**Endpoint:** `GET /api/analytics/revenue/period`

**Query Parameters:**

- `year` (required): Năm cần thống kê (ví dụ: `2025`)
- `groupBy` (optional): Nhóm theo `week` hoặc `month` (mặc định: `month`)

**Example Request:**

```http
GET /api/analytics/revenue/period?year=2025&groupBy=month
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Revenue statistics by period retrieved successfully",
  "data": {
    "year": 2025,
    "groupBy": "month",
    "periods": [
      {
        "_id": 1,
        "month": 1,
        "totalRevenue": 5000000,
        "totalOrders": 125
      },
      {
        "_id": 2,
        "month": 2,
        "totalRevenue": 6000000,
        "totalOrders": 150
      }
      // ... các tháng khác (1-12), nếu không có dữ liệu sẽ có giá trị 0
    ],
    "summary": {
      "totalRevenue": 50000000,
      "totalOrders": 1250
    }
  }
}
```

---

### 2.3. Lấy thống kê doanh thu theo năm

**Endpoint:** `GET /api/analytics/revenue/year`

**Query Parameters:**

- `startYear` (optional): Năm bắt đầu (mặc định: `2020`)
- `endYear` (optional): Năm kết thúc (mặc định: năm hiện tại)

**Example Request:**

```http
GET /api/analytics/revenue/year?startYear=2020&endYear=2025
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Revenue statistics by year retrieved successfully",
  "data": {
    "startYear": 2020,
    "endYear": 2025,
    "years": [
      {
        "_id": 2020,
        "year": 2020,
        "totalRevenue": 10000000,
        "totalOrders": 250
      },
      {
        "_id": 2021,
        "year": 2021,
        "totalRevenue": 20000000,
        "totalOrders": 500
      }
      // ... các năm khác
    ],
    "summary": {
      "totalRevenue": 150000000,
      "totalOrders": 3750
    }
  }
}
```

---

## 3. Thống kê Mua Gói (Plan Purchases)

### 3.1. Lấy thống kê mua gói theo khoảng thời gian tùy chỉnh

**Endpoint:** `GET /api/analytics/plans/time-range`

**Query Parameters:**

- `startDate` (required): Ngày bắt đầu (format: `YYYY-MM-DD`)
- `endDate` (required): Ngày kết thúc (format: `YYYY-MM-DD`)

**Example Request:**

```http
GET /api/analytics/plans/time-range?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Plan purchase statistics retrieved successfully",
  "data": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.999Z",
    "totalPlansPurchased": 500,
    "totalOrders": 250,
    "totalPlanTypes": 5,
    "planBreakdown": [
      {
        "_id": "plan_id_1",
        "planId": "plan_id_1",
        "planName": "Premium Plan",
        "totalPurchased": 200,
        "totalOrders": 100
      },
      {
        "_id": "plan_id_2",
        "planId": "plan_id_2",
        "planName": "Basic Plan",
        "totalPurchased": 150,
        "totalOrders": 75
      }
      // ... các gói khác
    ]
  }
}
```

---

### 3.2. Lấy thống kê mua gói theo tuần/tháng trong một năm

**Endpoint:** `GET /api/analytics/plans/period`

**Query Parameters:**

- `year` (required): Năm cần thống kê (ví dụ: `2025`)
- `groupBy` (optional): Nhóm theo `week` hoặc `month` (mặc định: `month`)

**Example Request:**

```http
GET /api/analytics/plans/period?year=2025&groupBy=month
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Plan purchase statistics by period retrieved successfully",
  "data": {
    "year": 2025,
    "groupBy": "month",
    "periods": [
      {
        "_id": 1,
        "month": 1,
        "totalPlansPurchased": 50,
        "totalOrders": 25
      },
      {
        "_id": 2,
        "month": 2,
        "totalPlansPurchased": 60,
        "totalOrders": 30
      }
      // ... các tháng khác
    ],
    "summary": {
      "totalPlansPurchased": 500,
      "totalOrders": 250,
      "totalPlanTypes": 5
    },
    "planBreakdown": [
      {
        "_id": "plan_id_1",
        "planId": "plan_id_1",
        "planName": "Premium Plan",
        "totalPurchased": 200,
        "totalOrders": 100
      }
      // ... các gói khác
    ]
  }
}
```

---

### 3.3. Lấy thống kê mua gói theo năm

**Endpoint:** `GET /api/analytics/plans/year`

**Query Parameters:**

- `startYear` (optional): Năm bắt đầu (mặc định: `2020`)
- `endYear` (optional): Năm kết thúc (mặc định: năm hiện tại)

**Example Request:**

```http
GET /api/analytics/plans/year?startYear=2020&endYear=2025
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Plan purchase statistics by year retrieved successfully",
  "data": {
    "startYear": 2020,
    "endYear": 2025,
    "years": [
      {
        "_id": 2020,
        "year": 2020,
        "totalPlansPurchased": 100,
        "totalOrders": 50
      },
      {
        "_id": 2021,
        "year": 2021,
        "totalPlansPurchased": 150,
        "totalOrders": 75
      }
      // ... các năm khác
    ],
    "summary": {
      "totalPlansPurchased": 1000,
      "totalOrders": 500,
      "totalPlanTypes": 5
    },
    "planBreakdown": [
      {
        "_id": "plan_id_1",
        "planId": "plan_id_1",
        "planName": "Premium Plan",
        "totalPurchased": 400,
        "totalOrders": 200
      }
      // ... các gói khác
    ]
  }
}
```

---

## 4. Dashboard Đăng ký Gói (Subscription Dashboard)

### 4.1. Lấy metrics tổng quan về đăng ký gói

**Endpoint:** `GET /api/user-subscriptions/dashboard`

**Query Parameters:**

- `start_date` (optional): Ngày bắt đầu lọc (format: `YYYY-MM-DD`)
- `end_date` (optional): Ngày kết thúc lọc (format: `YYYY-MM-DD`)
- `status` (optional): Lọc theo trạng thái (`active`, `cancelled`, `expired`, `pending`)
- `plan_id` (optional): Lọc theo ID của gói

**Example Request:**

```http
GET /api/user-subscriptions/dashboard?start_date=2025-01-01&end_date=2025-12-31&status=active
Authorization: Bearer <admin_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Get subscription dashboard metrics successfully",
  "data": {
    "planMetrics": [
      {
        "plan_id": "plan_id_1",
        "plan_name": "Premium Monthly",
        "plan_price": 199000,
        "plan_currency": "VND",
        "billing_cycle": "monthly",
        "duration_months": 1,
        "totalSubscriptions": 500,
        "activeSubscriptions": 350,
        "cancelledSubscriptions": 100,
        "expiredSubscriptions": 40,
        "pendingSubscriptions": 10,
        "totalRevenue": 99500000
      },
      {
        "plan_id": "plan_id_2",
        "plan_name": "Premium Yearly",
        "plan_price": 1990000,
        "plan_currency": "VND",
        "billing_cycle": "yearly",
        "duration_months": 12,
        "totalSubscriptions": 200,
        "activeSubscriptions": 180,
        "cancelledSubscriptions": 15,
        "expiredSubscriptions": 5,
        "pendingSubscriptions": 0,
        "totalRevenue": 398000000
      }
      // ... các gói khác
    ],
    "summary": {
      "totalRevenue": 497500000,
      "totalSubscriptions": 700,
      "activeSubscriptions": 530,
      "cancelledSubscriptions": 115,
      "expiredSubscriptions": 45,
      "pendingSubscriptions": 10
    }
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid start_date"
}
```

hoặc

```json
{
  "success": false,
  "message": "start_date must be before end_date"
}
```

hoặc

```json
{
  "success": false,
  "message": "Invalid status filter"
}
```

---

## Tổng kết các API

| #   | Endpoint                            | Method | Mô tả                                         |
| --- | ----------------------------------- | ------ | --------------------------------------------- |
| 1   | `/api/analytics/users/time-range`   | GET    | Thống kê người dùng theo khoảng thời gian     |
| 2   | `/api/analytics/users/period`       | GET    | Thống kê người dùng theo tuần/tháng trong năm |
| 3   | `/api/analytics/users/year`         | GET    | Thống kê người dùng theo năm                  |
| 4   | `/api/analytics/revenue/time-range` | GET    | Thống kê doanh thu theo khoảng thời gian      |
| 5   | `/api/analytics/revenue/period`     | GET    | Thống kê doanh thu theo tuần/tháng trong năm  |
| 6   | `/api/analytics/revenue/year`       | GET    | Thống kê doanh thu theo năm                   |
| 7   | `/api/analytics/plans/time-range`   | GET    | Thống kê mua gói theo khoảng thời gian        |
| 8   | `/api/analytics/plans/period`       | GET    | Thống kê mua gói theo tuần/tháng trong năm    |
| 9   | `/api/analytics/plans/year`         | GET    | Thống kê mua gói theo năm                     |
| 10  | `/api/user-subscriptions/dashboard` | GET    | Dashboard metrics về đăng ký gói              |

**Tổng cộng: 10 API endpoints**

---

## Lưu ý

1. Tất cả các API đều yêu cầu authentication token và quyền Admin
2. Format ngày tháng: `YYYY-MM-DD` (ví dụ: `2025-01-01`)
3. Format năm: số nguyên (ví dụ: `2025`)
4. Trạng thái subscription hợp lệ: `active`, `cancelled`, `expired`, `pending`
5. Các giá trị `groupBy` hợp lệ: `week`, `month`
6. Doanh thu được tính từ các đơn hàng có status `COMPLETED`
7. Thống kê mua gói chỉ tính các đơn hàng từ competitions có status `COMPLETED`

---

## Error Response Chung

Tất cả các API có thể trả về các error response sau:

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Forbidden - Admin access required"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

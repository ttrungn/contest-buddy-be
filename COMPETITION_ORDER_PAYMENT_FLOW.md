# Luồng Order và Thanh Toán cho Cuộc Thi

## Tổng quan

Hệ thống Contest Buddy hỗ trợ luồng tạo cuộc thi với thanh toán thông qua PayOS. Luồng này bao gồm các bước: tạo cuộc thi, tạo order, tạo payment URL, và xử lý webhook thanh toán.

## 1. Tạo Cuộc Thi (Competition Creation)

### API: `POST /api/competitions`

**Request:**

```json
{
  "title": "Cuộc thi lập trình 2024",
  "description": "Cuộc thi lập trình dành cho sinh viên",
  "category": "Lập trình",
  "plan_id": "plan-uuid-123",
  "start_date": "2024-03-01T00:00:00.000Z",
  "end_date": "2024-03-31T23:59:59.000Z",
  "registration_deadline": "2024-02-28T23:59:59.000Z",
  "location": "Hà Nội",
  "level": "Sinh viên",
  "prize_pool_text": "10,000,000 VNĐ",
  "max_participants": 100,
  "isRegisteredAsTeam": false,
  "maxParticipantsPerTeam": 1,
  "image_url": "https://example.com/image.jpg",
  "website": "https://example.com",
  "rules": "Quy định cuộc thi...",
  "competitionTags": ["lập trình", "sinh viên", "2024"],
  "competitionRequiredSkills": [
    {
      "name": "JavaScript",
      "category": "Programming"
    },
    {
      "name": "React",
      "category": "Framework"
    }
  ]
}
```

**Response (Success - 201):**

```json
{
  "status": "success",
  "message": "Competition created successfully",
  "data": {
    "id": "comp-uuid-123",
    "title": "Cuộc thi lập trình 2024",
    "description": "Cuộc thi lập trình dành cho sinh viên",
    "category": "Lập trình",
    "plan_id": "plan-uuid-123",
    "organizer_id": "org-uuid-456",
    "start_date": "2024-03-01T00:00:00.000Z",
    "end_date": "2024-03-31T23:59:59.000Z",
    "registration_deadline": "2024-02-28T23:59:59.000Z",
    "location": "Hà Nội",
    "level": "Sinh viên",
    "prize_pool_text": "10,000,000 VNĐ",
    "max_participants": 100,
    "participants_count": 0,
    "isRegisteredAsTeam": false,
    "maxParticipantsPerTeam": 1,
    "image_url": "https://example.com/image.jpg",
    "website": "https://example.com",
    "rules": "Quy định cuộc thi...",
    "featured": false,
    "paying_status": "Chưa thanh toán",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - 403):**

```json
{
  "status": "error",
  "message": "Only registered organizers can create competitions"
}
```

**Response (Error - 400):**

```json
{
  "status": "error",
  "message": "Plan with ID 'plan-uuid-123' is not active"
}
```

## 2. Tạo Order cho Cuộc Thi

### API: `POST /api/orders/competition`

**Request:**

```json
{
  "competitionId": "comp-uuid-123"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order-uuid-789",
      "order_number": "2024011500001",
      "user_id": "user-uuid-456",
      "total_amount": 500000,
      "status": "pending",
      "notes": "Order for competition Cuộc thi lập trình 2024",
      "created_at": "2024-01-15T10:35:00.000Z",
      "updated_at": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

**Response (Error - 404):**

```json
{
  "success": false,
  "message": "Competition not found"
}
```

**Response (Error - 401):**

```json
{
  "success": false,
  "message": "Authentication required"
}
```

## 3. Tạo Payment URL

### API: `POST /api/payments/create-url`

**Request:**

```json
{
  "orderId": "order-uuid-789"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Payment URL created successfully",
  "data": {
    "checkoutUrl": "https://pay.payos.vn/web/123456",
    "orderCode": 2024011500001,
    "amount": 500000,
    "description": "Order #2024011500001",
    "returnUrl": "https://frontend.com/payment/success",
    "cancelUrl": "https://frontend.com/payment/cancel",
    "expiredAt": 1705312500
  }
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Order not found"
}
```

## 4. Xử lý Webhook Thanh Toán

### API: `POST /api/payments/webhook`

**Request (PayOS Webhook):**

```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 2024011500001,
    "amount": 500000,
    "description": "Order #2024011500001",
    "accountNumber": "1234567890",
    "reference": "PAYOS_REF_123456",
    "transactionDateTime": "2024-01-15T10:40:00.000Z",
    "currency": "VND",
    "paymentLinkId": "payment-link-123",
    "code": "00",
    "desc": "success"
  },
  "signature": "webhook_signature_hash"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Payment processed successfully"
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Order not found"
}
```

## 5. Luồng Xử lý Chi tiết

### 5.1. Tạo Cuộc Thi

1. **Validation**: Kiểm tra user có phải organizer không
2. **Plan Validation**: Kiểm tra plan có tồn tại và active không
3. **Create Competition**: Tạo cuộc thi với `paying_status = "Chưa thanh toán"`
4. **Save Tags & Skills**: Lưu tags và required skills
5. **Return**: Trả về thông tin cuộc thi đã tạo

### 5.2. Tạo Order

1. **User Validation**: Kiểm tra user tồn tại
2. **Organizer Validation**: Kiểm tra user có phải organizer không (tìm bằng `owner_user_id`)
3. **Competition Validation**: Kiểm tra cuộc thi thuộc về organizer
4. **Plan Lookup**: Lấy thông tin plan để tính giá
5. **Create Order**: Tạo order với status "pending"
6. **Create Order Detail**: Tạo chi tiết order
7. **Return**: Trả về thông tin order

### 5.3. Tạo Payment URL

1. **User Validation**: Kiểm tra user tồn tại
2. **Order Validation**: Kiểm tra order thuộc về user
3. **PayOS Integration**: Tạo payment request với PayOS
4. **Return URL**: Trả về checkout URL

### 5.4. Xử lý Webhook

1. **Signature Verification**: Xác thực chữ ký webhook
2. **Payment Success (code: "00")**:
   - Cập nhật order status = "completed"
   - Cập nhật competition paying_status = "Đã thanh toán"
   - Tạo payment record với status = "paid"
3. **Payment Failed**:
   - Cập nhật order status = "cancelled"
   - Tạo payment record với status = "failed"

## 6. Models liên quan

### 6.1. Competition Model

```javascript
{
  id: String,
  title: String,
  description: String,
  category: String,
  plan_id: String,
  organizer_id: String,
  paying_status: "Chưa thanh toán" | "Đã thanh toán" | "Hết hạn",
  // ... other fields
}
```

### 6.2. Order Model

```javascript
{
  id: String,
  order_number: String,
  user_id: String,
  total_amount: Number,
  status: "pending" | "completed" | "cancelled",
  notes: String,
  created_at: Date,
  updated_at: Date
}
```

### 6.3. OrderDetail Model

```javascript
{
  id: String,
  order_id: String,
  product_id: String,
  product_source_schema: String,
  product_description: String,
  quantity: Number,
  unit_price: Number,
  discount_per_item: Number,
  total_price: Number,
  final_price: Number
}
```

### 6.4. Payment Model

```javascript
{
  id: String,
  order_id: String,
  amount: Number,
  status: "pending" | "paid" | "failed" | "cancelled",
  payment_method: "bank_transfer" | "e_wallet",
  transaction_id: String,
  payment_date: Date,
  notes: String
}
```

## 7. Error Handling

### 7.1. Authentication Errors

- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
- **403 Forbidden**: User không có quyền thực hiện action

### 7.2. Validation Errors

- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **404 Not Found**: Resource không tồn tại

### 7.3. Business Logic Errors

- User chưa đăng ký làm organizer
- Plan không active
- Competition không thuộc về organizer
- Order không thuộc về user

## 8. Security Considerations

1. **Authentication**: Tất cả API đều yêu cầu JWT token
2. **Authorization**: Kiểm tra role và quyền truy cập
3. **Input Validation**: Validate tất cả input data
4. **Webhook Security**: Xác thực chữ ký webhook từ PayOS
5. **Data Protection**: Không expose sensitive information

## 9. Testing

### 9.1. Unit Tests

- Test các service functions
- Test validation logic
- Test error handling

### 9.2. Integration Tests

- Test API endpoints
- Test PayOS integration
- Test webhook processing

### 9.3. End-to-End Tests

- Test toàn bộ luồng từ tạo cuộc thi đến thanh toán
- Test các scenario khác nhau

## 10. Monitoring và Logging

1. **Logging**: Log tất cả API calls và errors
2. **Monitoring**: Monitor payment success rate
3. **Alerting**: Alert khi có lỗi trong payment flow
4. **Analytics**: Track order và payment metrics

## 11. Deployment Notes

1. **Environment Variables**: Cấu hình PayOS credentials
2. **Database**: Đảm bảo tất cả models được tạo
3. **Webhook URL**: Cấu hình webhook URL trong PayOS dashboard
4. **SSL**: Sử dụng HTTPS cho production

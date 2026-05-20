# API Documentation - Bengkel Gemilang Sakti

Base URL: `http://localhost:8080/api`

## Authentication

### Login
```
POST /auth/login
Content-Type: application/json

Body:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "id": 1,
  "username": "admin",
  "role": "Admin",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** Semua endpoint di bawah ini memerlukan header Authorization:
```
Authorization: Bearer <accessToken>
```

---

## Spareparts

### Get All Spareparts
```
GET /spareparts
```

### Get Sparepart by ID
```
GET /spareparts/:id
```

### Create Sparepart
```
POST /spareparts
Content-Type: application/json

Body:
{
  "code": "SP-005",
  "name": "Ban Luar 80/90-14",
  "supplier_id": 1,
  "buy_price": 120000,
  "sell_price": 165000,
  "stock": 20
}
```

### Update Sparepart
```
PUT /spareparts/:id
Content-Type: application/json

Body:
{
  "code": "SP-005",
  "name": "Ban Luar 80/90-14 IRC",
  "supplier_id": 1,
  "buy_price": 125000,
  "sell_price": 170000,
  "stock": 18
}
```

### Delete Sparepart
```
DELETE /spareparts/:id
```

---

## Suppliers

### Get All Suppliers
```
GET /suppliers
```

### Get Supplier by ID
```
GET /suppliers/:id
```

### Create Supplier
```
POST /suppliers
Content-Type: application/json

Body:
{
  "code": "SUP-05",
  "name": "PT Astra Motor",
  "address": "Jl. Gaya Motor No. 88",
  "phone": "021-5551234"
}
```

### Update Supplier
```
PUT /suppliers/:id
Content-Type: application/json

Body:
{
  "code": "SUP-05",
  "name": "PT Astra Motor Indonesia",
  "address": "Jl. Gaya Motor No. 88, Jakarta",
  "phone": "021-5551234"
}
```

### Delete Supplier
```
DELETE /suppliers/:id
```

---

## Customers

### Get All Customers
```
GET /customers
```

### Get Customer by ID
```
GET /customers/:id
```

### Create Customer
```
POST /customers
Content-Type: application/json

Body:
{
  "code": "CUST-003",
  "name": "Ahmad Fauzi",
  "phone": "081298765432",
  "address": "Jl. Mawar No. 15"
}
```

### Update Customer
```
PUT /customers/:id
Content-Type: application/json

Body:
{
  "code": "CUST-003",
  "name": "Ahmad Fauzi",
  "phone": "081298765432",
  "address": "Jl. Mawar No. 15, Jakarta Selatan"
}
```

### Delete Customer
```
DELETE /customers/:id
```

---

## Employees

### Get All Employees
```
GET /employees
```

### Get Employee by ID
```
GET /employees/:id
```

### Create Employee
```
POST /employees
Content-Type: application/json

Body:
{
  "code": "KRY-004",
  "name": "Dedi Supriadi",
  "position": "Mekanik",
  "base_salary": 3200000
}
```

### Update Employee
```
PUT /employees/:id
Content-Type: application/json

Body:
{
  "code": "KRY-004",
  "name": "Dedi Supriadi",
  "position": "Mekanik Senior",
  "base_salary": 3500000
}
```

### Delete Employee
```
DELETE /employees/:id
```

---

## Services

### Get All Services
```
GET /services
```

### Get Service by ID
```
GET /services/:id
```

### Create Service
```
POST /services
Content-Type: application/json

Body:
{
  "invoice_no": "SV-091",
  "motorcycle_id": 1,
  "mechanic_id": 1,
  "status": "Menunggu",
  "complaint": "Mesin brebet",
  "service_fee": 75000,
  "total_amount": 75000
}
```

### Update Service
```
PUT /services/:id
Content-Type: application/json

Body:
{
  "status": "Selesai",
  "total_amount": 150000
}
```

### Delete Service
```
DELETE /services/:id
```

---

## Motorcycles

### Get All Motorcycles
```
GET /motorcycles
```

### Get Motorcycle by ID
```
GET /motorcycles/:id
```

### Create Motorcycle
```
POST /motorcycles
Content-Type: application/json

Body:
{
  "police_no": "B 9999 XYZ",
  "type": "Scoopy 2023",
  "customer_id": 1
}
```

### Update Motorcycle
```
PUT /motorcycles/:id
Content-Type: application/json

Body:
{
  "police_no": "B 9999 XYZ",
  "type": "Scoopy Stylish 2023",
  "customer_id": 1
}
```

### Delete Motorcycle
```
DELETE /motorcycles/:id
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Kode sparepart sudah digunakan"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized!"
}
```

### 403 Forbidden
```json
{
  "message": "No token provided!"
}
```

### 404 Not Found
```json
{
  "message": "Data tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message here"
}
```

---

## Testing dengan cURL

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### Get All Spareparts (dengan token)
```bash
curl -X GET http://localhost:8080/api/spareparts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Sparepart
```bash
curl -X POST http://localhost:8080/api/spareparts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"code\":\"SP-005\",\"name\":\"Ban Luar\",\"supplier_id\":1,\"buy_price\":120000,\"sell_price\":165000,\"stock\":20}"
```

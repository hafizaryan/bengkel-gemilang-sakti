# Backend - Bengkel Gemilang Sakti

Backend API untuk sistem manajemen bengkel motor menggunakan Node.js, Express, dan MySQL.

## Prerequisites

- Node.js (v14 atau lebih tinggi)
- MySQL (v5.7 atau lebih tinggi)
- npm atau yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
Buat file `.env` di root folder backend:
```env
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bengkel_gemilang
JWT_SECRET=your_secret_key_here
```

3. Setup database:
```bash
# Jalankan script SQL untuk membuat database dan tabel
mysql -u root -p < database.sql

# Atau gunakan script Node.js
npm run migrate
```

4. Test koneksi database:
```bash
node test-connection.js
```

## Running the Application

### Development mode (dengan auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:8080`

## API Endpoints

Lihat dokumentasi lengkap di [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Test

1. Login untuk mendapatkan token:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

2. Gunakan token untuk mengakses endpoint lain:
```bash
curl -X GET http://localhost:8080/api/spareparts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
backend/
├── src/
│   ├── configs/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── crudController.js  # Generic CRUD operations
│   │   ├── sparepartController.js
│   │   ├── supplierController.js
│   │   ├── customerController.js
│   │   └── employeeController.js
│   ├── middlewares/
│   │   └── auth.js            # JWT verification
│   ├── routes/
│   │   └── index.js           # API routes
│   └── app.js                 # Express app setup
├── database.sql               # Database schema & seeders
├── init_db.js                 # Database initialization script
├── test-connection.js         # Database connection test
├── package.json
└── .env                       # Environment variables (create this)
```

## Features

### CRUD Operations
- ✅ Spareparts (dengan relasi ke Suppliers)
- ✅ Suppliers
- ✅ Customers
- ✅ Employees
- ✅ Services
- ✅ Motorcycles

### Authentication
- ✅ JWT-based authentication
- ✅ Token verification middleware
- ✅ Role-based access (Admin, Kasir, Mekanik)

### Validations
- ✅ Input validation
- ✅ Unique code validation
- ✅ Foreign key constraint handling
- ✅ Error handling

## Default User

```
Username: admin
Password: admin123
Role: Admin
```

## Troubleshooting

### Database Connection Error
- Pastikan MySQL sudah berjalan
- Cek kredensial di file `.env`
- Pastikan database `bengkel_gemilang` sudah dibuat

### Port Already in Use
- Ubah PORT di file `.env`
- Atau stop aplikasi yang menggunakan port 8080

### Token Invalid/Expired
- Login ulang untuk mendapatkan token baru
- Token berlaku selama 24 jam

## Development

### Adding New Endpoints
1. Buat controller di `src/controllers/`
2. Tambahkan routes di `src/routes/index.js`
3. Update dokumentasi di `API_DOCUMENTATION.md`

### Database Changes
1. Update `database.sql`
2. Jalankan ulang migration: `npm run migrate`

## License

ISC

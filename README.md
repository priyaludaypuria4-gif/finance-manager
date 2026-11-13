# Finance Manager 💰

A full-stack personal finance management application that helps users track their income, expenses, and overall financial activity through a simple and user-friendly dashboard.

## 🚀 Features

- **User Authentication:** Secure registration and login using JWT authentication.
- **Password Security:** Passwords are hashed using bcrypt before being stored.
- **Dashboard:** View total balance, income, expenses, and transaction count.
- **Transaction Management:** Add, view, edit, and delete financial transactions.
- **Category Management:** Organize transactions into categories such as Food, Shopping, Transport, Salary, and Bills.
- **User-Specific Data:** Each user can access only their own transactions.
- **Responsive Interface:** Simple dashboard accessible across different screen sizes.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML | Frontend structure |
| CSS | Styling and responsive design |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | REST API development |
| PostgreSQL | Relational database |
| JWT | User authentication |
| bcryptjs | Password hashing |

## 📁 Project Structure

```text
finance-manager/
│
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── authRoutes.js
│       └── transactionRoutes.js
│
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/finance-manager.git
```

### 2. Navigate to the project directory

```bash
cd finance-manager
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory using `.env.example` as a reference.

Add the following configuration:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_manager
JWT_SECRET=your_long_random_secret_key
```

Replace `YOUR_PASSWORD` with your PostgreSQL password and use a strong secret for JWT.

### 5. Create the PostgreSQL database

Create a database named:

```sql
CREATE DATABASE finance_manager;
```

The application automatically creates the required tables when the server starts.

### 6. Start the application

For development:

```bash
npm run dev
```

Or:

```bash
npm start
```

Open your browser and visit:

```text
http://localhost:5000
```

## 🔗 API Endpoints

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get current user |

### Transaction APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | Fetch all transactions |
| GET | `/api/transactions/summary` | Get financial summary |
| POST | `/api/transactions` | Add a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |

Transaction endpoints require user authentication.

## 🔐 Security

- Passwords are hashed using bcrypt.
- JWT tokens are stored in HTTP-only cookies.
- Protected API routes require valid authentication.
- Database queries use parameterized SQL queries.
- User-specific transaction access is enforced.

## 🎯 Project Objective

The objective of this project is to develop a practical financial management system that demonstrates full-stack web development concepts, REST API integration, relational database management, authentication, and CRUD operations.

## 👩‍💻 Author

**Priyal Udaypuria**

B.Tech Computer Science and Engineering

---

*This project was developed as a learning and portfolio project to demonstrate full-stack application development.*

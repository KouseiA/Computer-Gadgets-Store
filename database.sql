-- Create Database
CREATE DATABASE IF NOT EXISTS aula_db;
USE aula_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Pending',
    courier VARCHAR(50) DEFAULT 'Standard',
    shipping_fee DECIMAL(10, 2) DEFAULT 150.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_name VARCHAR(255),
    price DECIMAL(10, 2),
    quantity INT,
    subtotal DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Seed Data (Matching existing images in ../IMAGES/)
INSERT INTO products (name, category, brand, price, image, description, stock) VALUES 
('AULA F2088 Pro', 'Wired / Mechanical', 'AULA', 2799.00, '../IMAGES/AULA F2088 Pro.jpg', 'Best value for every gamer. Robust build, hot-swappable switches and per-key RGB lighting.', 50),
('AULA F81 Gasket', 'Wireless', 'AULA', 4399.00, '../IMAGES/AULA F81 Gasket Wireless.jpg', 'Premium wireless experience with triple-mode connectivity and smooth gasket mounting.', 25),
('AULA F98 Pro', 'Wireless', 'AULA', 4899.00, '../IMAGES/AULA F98 Pro Wireless.jpg', 'Ideal for the office and gaming with its full-size compact layout and ultra-quiet stabilizers.', 15),
('AULA F75 Dual-Mode', 'Wireless', 'AULA', 3999.00, '../IMAGES/AULA F75 Dual-Mode.jpg', 'A compact yet feature-rich keyboard, perfect for portability and modern setups.', 20),
('AULA F98 Crystal', 'RGB / Wireless', 'AULA', 5299.00, '../IMAGES/AULA F98 Crystal RGB.jpg', 'Stylish crystal clear shell with programmable RGB, delivering an eye-catching glow.', 10),
('AULA S2068 Hot-Swap', 'Wireless', 'AULA', 3699.00, '../IMAGES/AULA S2068 Hot-Swap Wireless.jpg', 'Ultra portable 65% form factor for gaming and typing, with super bright RGB.', 30),
('AULA F68 Mini', 'RGB / Compact', 'AULA', 2599.00, '../IMAGES/AULA F68 Mini RGB.jpg', 'Efficient layout for space-saving setups. Vibrant RGB and solid connectivity.', 40),
('AULA F108 Full-Size', 'RGB / Full-Size', 'AULA', 3099.00, '../IMAGES/AULA F108 Full-Size RGB.jpg', 'High-performance full layout, durable build quality, and powerful lighting controls.', 25),
('AULA F75 Pro+', 'Wireless', 'AULA', 4199.00, '../IMAGES/AULA F75 Pro+ Wireless.png', 'Versatile mechanical keyboard offering wireless connection and pro switches.', 20),
('AULA S2061 TKL', 'RGB / Gaming', 'AULA', 2899.00, '../IMAGES/AULA S2061 TKL RGB Gaming.jpg', 'Tenkeyless gaming keyboard, robust and reliable, with brilliant RGB modes.', 35);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`name`, `description`) VALUES
('Mechanical Keyboards', 'High-performance mechanical keyboards for gaming and typing.'),
('Wireless Keyboards', 'Cable-free keyboards with Bluetooth and 2.4GHz connectivity.'),
('Gaming Mice', 'Precision gaming mice with high DPI sensors.'),
('Accessories', 'Mousepads, wrist rests, and other peripherals.');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`name`, `contact_person`, `email`) VALUES
('AULA Official', 'John Doe', 'supply@aula.com'),
('TechDistributors Inc.', 'Jane Smith', 'orders@techdist.com');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_logs`
--

CREATE TABLE IF NOT EXISTS `inventory_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `type` enum('IN','OUT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

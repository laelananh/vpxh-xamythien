-- SQL SCHEMA & SEED DATA FOR SUPABASE (POSTGRESQL)
-- VĂN PHÒNG XÃ HỘI XÃ MỸ THIỆN

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50)
);

-- 3. Create Posts Table (News & Announcements)
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
  type VARCHAR(20) DEFAULT 'news',
  summary TEXT,
  content TEXT,
  image_url TEXT,
  pdf_url TEXT,
  pdf_name TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Tenders Table
CREATE TABLE IF NOT EXISTS tenders (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  budget VARCHAR(100),
  investor VARCHAR(150),
  status VARCHAR(50) DEFAULT 'Đang mời thầu',
  field VARCHAR(100),
  deadline VARCHAR(100),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  content TEXT
);

-- 5. Create Public Services Table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  level VARCHAR(100),
  time_limit VARCHAR(100),
  fee VARCHAR(100),
  authority VARCHAR(150),
  steps TEXT[],
  dossier TEXT[]
);

-- 6. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address VARCHAR(200),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Chờ xử lý',
  reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DEFAULT DATA
INSERT INTO categories (id, name, icon) VALUES
('an-sinh', 'An sinh Xã hội & Trợ cấp', 'fa-hands-holding-child'),
('nguoi-co-cong', 'Chăm sóc Người có công', 'fa-medal'),
('bao-hiem-y-te', 'Bảo hiểm Y tế & Y tế', 'fa-notes-medical'),
('tre-em-binh-dang', 'Bảo vệ Trẻ em & Gia đình', 'fa-child-reaching'),
('lao-dong', 'Lao động & Việc làm', 'fa-briefcase')
ON CONFLICT (id) DO NOTHING;

-- Default Admin User (username: admin, password: admin123)
INSERT INTO users (id, username, password, fullname, email, role) VALUES
(1, 'admin', '$2a$10$wT8KzE0Y8sC.sYvMhO8Q3.H3G5bO0b0Z0J0J0J0J0J0J0J0J0J0J0', 'Quản trị viên Văn phòng Xã hội', 'admin@mythien.gov.vn', 'admin')
ON CONFLICT (username) DO NOTHING;

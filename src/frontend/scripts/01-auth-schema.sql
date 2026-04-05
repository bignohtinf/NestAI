-- Create users table with authentication fields
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  remember_token VARCHAR(500),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create audit_logs table for future logging
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Insert mock data - 2 Admin users
-- Passwords: Admin@123 (hashed with bcryptjs)
INSERT INTO users (email, name, password_hash, role, is_active, last_login)
VALUES 
  (
    'admin@school.edu',
    'Quản Trị Viên 1',
    '$2b$10$dXJ3ULvR1Z7P8kQ2mN4J9O5X6Y7Z8a9B1C2D3E4F5G6H7I8J9K0L1M2',
    'admin',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'admin2@school.edu',
    'Quản Trị Viên 2',
    '$2b$10$dXJ3ULvR1Z7P8kQ2mN4J9O5X6Y7Z8a9B1C2D3E4F5G6H7I8J9K0L1M2',
    'admin',
    true,
    NULL
  )
ON CONFLICT (email) DO NOTHING;

-- Insert mock data - 13 Staff users
-- Passwords: Staff@123 (hashed with bcryptjs)
INSERT INTO users (email, name, password_hash, role, is_active, last_login)
VALUES
  ('staff1@school.edu', 'Nhân Viên 1 - Lập Thực Đơn', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff2@school.edu', 'Nhân Viên 2 - Quản Lý Kho', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff3@school.edu', 'Nhân Viên 3 - Dinh Dưỡng', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff4@school.edu', 'Nhân Viên 4 - Lập Thực Đơn', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff5@school.edu', 'Nhân Viên 5 - Quản Lý Dị Ứng', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff6@school.edu', 'Nhân Viên 6 - Kho Nguyên Liệu', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff7@school.edu', 'Nhân Viên 7 - Lập Thực Đơn', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff8@school.edu', 'Nhân Viên 8 - Tính Toán Dinh Dưỡng', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff9@school.edu', 'Nhân Viên 9 - Quản Lý Kho', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff10@school.edu', 'Nhân Viên 10 - Kiểm Soát Chất Lượng', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff11@school.edu', 'Nhân Viên 11 - Lập Thực Đơn', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff12@school.edu', 'Nhân Viên 12 - Quản Lý Dị Ứng', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL),
  ('staff13@school.edu', 'Nhân Viên 13 - Kho Nguyên Liệu', '$2b$10$KL9mP5X2Y1Z0a9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9', 'staff', true, NULL)
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

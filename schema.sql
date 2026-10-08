CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roll_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  marks REAL NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data (11 Students: 4 ECS, 4 ME, 3 CS)
INSERT OR IGNORE INTO students (id, roll_no, name, student_class, marks, contact, email) VALUES
-- 4 ECS Students
(1, 'ECS301', 'Aditya Deshmukh', 'B.Tech ECS - Sem 4', 85.0, '9822011223', 'aditya.ecs@campus.edu'),
(2, 'ECS302', 'Sneha Kulkarni', 'B.Tech ECS - Sem 4', 91.5, '9833122334', 'sneha.ecs@campus.edu'),
(3, 'ECS303', 'Vikram Joshi', 'B.Tech ECS - Sem 6', 78.0, '9844233445', 'vikram.ecs@campus.edu'),
(4, 'ECS304', 'Tanvi Mehta', 'B.Tech ECS - Sem 6', 89.2, '9855344556', 'tanvi.ecs@campus.edu'),

-- 4 ME Students
(5, 'ME101', 'Ananya Gupta', 'B.Tech ME - Sem 2', 65.5, '9654321098', 'ananya.me@campus.edu'),
(6, 'ME102', 'Karan Verma', 'B.Tech ME - Sem 2', 72.0, '9611223344', 'karan.me@campus.edu'),
(7, 'ME103', 'Siddharth Rao', 'B.Tech ME - Sem 4', 81.4, '9622334455', 'siddharth.me@campus.edu'),
(8, 'ME104', 'Pooja Hegde', 'B.Tech ME - Sem 6', 76.8, '9633445566', 'pooja.me@campus.edu'),

-- 3 CS Students
(9, 'CS201', 'Aarav Sharma', 'B.Tech CS - Sem 4', 88.5, '9876543210', 'aarav.cs@campus.edu'),
(10, 'CS202', 'Priya Patel', 'B.Tech CS - Sem 4', 92.0, '9812345678', 'priya.cs@campus.edu'),
(11, 'CS203', 'Rohan Nair', 'B.Tech CS - Sem 6', 83.5, '9866455667', 'rohan.cs@campus.edu');
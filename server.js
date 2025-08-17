import express from 'express';
import multer from 'multer';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const db = new Database('waste_management.db');
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Initialize database tables
const initDB = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('citizen', 'agent', 'worker')),
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Complaints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      citizen_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location_lat REAL NOT NULL,
      location_lng REAL NOT NULL,
      address TEXT NOT NULL,
      image_path TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'verified')),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      assigned_worker_id TEXT,
      assigned_at DATETIME,
      completed_at DATETIME,
      verified_at DATETIME,
      before_image_path TEXT,
      after_image_path TEXT,
      feedback TEXT,
      rating INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (citizen_id) REFERENCES users (id),
      FOREIGN KEY (assigned_worker_id) REFERENCES users (id)
    )
  `);

  // Activity logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Create default admin user
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@wastesystem.com');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const adminId = uuidv4();
    db.prepare(`
      INSERT INTO users (id, email, password, name, role, phone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin@wastesystem.com', hashedPassword, 'System Administrator', 'agent', '+1234567890');
    
    // Create a sample worker
    const workerId = uuidv4();
    const workerPassword = bcrypt.hashSync('worker123', 10);
    db.prepare(`
      INSERT INTO users (id, email, password, name, role, phone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(workerId, 'worker@wastesystem.com', workerPassword, 'John Worker', 'worker', '+1234567891');
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Routes

// Auth routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, role = 'citizen', phone } = req.body;
    
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    
    db.prepare(`
      INSERT INTO users (id, email, password, name, role, phone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, email, hashedPassword, name, role, phone);

    const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email, name, role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complaint routes
app.post('/api/complaints', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const { title, description, location_lat, location_lng, address, priority = 'medium' } = req.body;
    const complaintId = uuidv4();
    const imagePath = req.file ? req.file.filename : null;
    
    db.prepare(`
      INSERT INTO complaints (id, citizen_id, title, description, location_lat, location_lng, address, image_path, priority) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(complaintId, req.user.userId, title, description, parseFloat(location_lat), parseFloat(location_lng), address, imagePath, priority);

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (id, complaint_id, user_id, action, details) 
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), complaintId, req.user.userId, 'created', 'Complaint submitted by citizen');

    res.status(201).json({ message: 'Complaint submitted successfully', complaintId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/complaints', authenticateToken, (req, res) => {
  try {
    let query = `
      SELECT c.*, u.name as citizen_name, u.email as citizen_email, w.name as worker_name 
      FROM complaints c 
      JOIN users u ON c.citizen_id = u.id 
      LEFT JOIN users w ON c.assigned_worker_id = w.id
    `;
    
    const params = [];
    
    if (req.user.role === 'citizen') {
      query += ' WHERE c.citizen_id = ?';
      params.push(req.user.userId);
    } else if (req.user.role === 'worker') {
      query += ' WHERE c.assigned_worker_id = ?';
      params.push(req.user.userId);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const complaints = db.prepare(query).all(...params);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/complaints/:id/assign', authenticateToken, authorizeRole(['agent']), (req, res) => {
  try {
    const { workerId } = req.body;
    const complaintId = req.params.id;
    
    db.prepare(`
      UPDATE complaints 
      SET assigned_worker_id = ?, status = 'assigned', assigned_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(workerId, complaintId);

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (id, complaint_id, user_id, action, details) 
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), complaintId, req.user.userId, 'assigned', `Complaint assigned to worker ID: ${workerId}`);

    res.json({ message: 'Complaint assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/complaints/:id/start', authenticateToken, authorizeRole(['worker']), (req, res) => {
  try {
    const complaintId = req.params.id;
    
    db.prepare(`
      UPDATE complaints 
      SET status = 'in_progress' 
      WHERE id = ? AND assigned_worker_id = ?
    `).run(complaintId, req.user.userId);

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (id, complaint_id, user_id, action, details) 
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), complaintId, req.user.userId, 'started', 'Work started on complaint');

    res.json({ message: 'Work started successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/complaints/:id/complete', authenticateToken, authorizeRole(['worker']), upload.fields([
  { name: 'beforeImage', maxCount: 1 },
  { name: 'afterImage', maxCount: 1 }
]), (req, res) => {
  try {
    const complaintId = req.params.id;
    const beforeImagePath = req.files?.beforeImage ? req.files.beforeImage[0].filename : null;
    const afterImagePath = req.files?.afterImage ? req.files.afterImage[0].filename : null;
    
    db.prepare(`
      UPDATE complaints 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, before_image_path = ?, after_image_path = ?
      WHERE id = ? AND assigned_worker_id = ?
    `).run(beforeImagePath, afterImagePath, complaintId, req.user.userId);

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (id, complaint_id, user_id, action, details) 
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), complaintId, req.user.userId, 'completed', 'Work completed with before/after photos');

    res.json({ message: 'Complaint marked as completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/complaints/:id/verify', authenticateToken, authorizeRole(['agent']), (req, res) => {
  try {
    const { approved, feedback } = req.body;
    const complaintId = req.params.id;
    const status = approved ? 'verified' : 'assigned';
    
    let query = `
      UPDATE complaints 
      SET status = ?
    `;
    const params = [status];
    
    if (approved) {
      query += ', verified_at = CURRENT_TIMESTAMP';
    }
    
    query += ' WHERE id = ?';
    params.push(complaintId);
    
    db.prepare(query).run(...params);

    // Log activity
    const action = approved ? 'verified' : 'rejected';
    db.prepare(`
      INSERT INTO activity_logs (id, complaint_id, user_id, action, details) 
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), complaintId, req.user.userId, action, feedback || `Complaint ${action} by agent`);

    res.json({ message: `Complaint ${approved ? 'verified' : 'rejected'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/complaints/:id/feedback', authenticateToken, authorizeRole(['citizen']), (req, res) => {
  try {
    const { feedback, rating } = req.body;
    const complaintId = req.params.id;
    
    db.prepare(`
      UPDATE complaints 
      SET feedback = ?, rating = ?
      WHERE id = ? AND citizen_id = ?
    `).run(feedback, rating, complaintId, req.user.userId);

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (id, complaint_id, user_id, action, details) 
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), complaintId, req.user.userId, 'feedback', `Citizen provided feedback and rating: ${rating}/5`);

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User routes
app.get('/api/users/workers', authenticateToken, authorizeRole(['agent']), (req, res) => {
  try {
    const workers = db.prepare('SELECT id, name, email, phone FROM users WHERE role = ?').all('worker');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  try {
    const stats = {};
    
    if (req.user.role === 'agent') {
      stats.totalComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
      stats.pendingComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE status = ?').get('pending').count;
      stats.completedComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE status IN (?, ?)').get('completed', 'verified').count;
      stats.inProgressComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE status = ?').get('in_progress').count;
      
      // Get complaints by status for chart
      const statusStats = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM complaints 
        GROUP BY status
      `).all();
      stats.statusBreakdown = statusStats;
      
    } else if (req.user.role === 'worker') {
      stats.assignedTasks = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE assigned_worker_id = ?').get(req.user.userId).count;
      stats.completedTasks = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE assigned_worker_id = ? AND status IN (?, ?)').get(req.user.userId, 'completed', 'verified').count;
      stats.pendingTasks = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE assigned_worker_id = ? AND status IN (?, ?)').get(req.user.userId, 'assigned', 'in_progress').count;
      
    } else if (req.user.role === 'citizen') {
      stats.myComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE citizen_id = ?').get(req.user.userId).count;
      stats.resolvedComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE citizen_id = ? AND status = ?').get(req.user.userId, 'verified').count;
      stats.pendingComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE citizen_id = ? AND status IN (?, ?, ?)').get(req.user.userId, 'pending', 'assigned', 'in_progress').count;
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity logs
app.get('/api/complaints/:id/logs', authenticateToken, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT al.*, u.name as user_name, u.role as user_role
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.complaint_id = ?
      ORDER BY al.created_at DESC
    `).all(req.params.id);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize database and start server
initDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
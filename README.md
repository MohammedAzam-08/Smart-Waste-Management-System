# ♻️ Smart Waste Management System

The **Smart Waste Management System (SWMS)** is a scalable, full-featured application built using **React (TypeScript)**, **Node.js / Spring Boot**, and **MySQL/SQLite**.  
It digitizes the process of waste complaint management — from citizen reporting to worker verification — ensuring cleaner cities and efficient municipal operations.

📍 **Project Status**: Under Active Development (2025 MCA Final Year Project)

---

## 📣 Project Overview

This project simulates a real-world **municipal waste management workflow** with three main user roles:

👨‍💻 **Citizen**: Report garbage complaints with location and photo evidence  
🧑‍💼 **Agent (Municipality)**: Review complaints, assign workers, and monitor status  
👷 **Worker**: Clean assigned areas, upload proof, and mark completion  

The system ensures **end-to-end tracking** of complaints, **real-time updates**, and **role-based access control**.

---

## 📌 Key Features

- 📝 **Complaint Reporting** with photos & Google Maps location  
- 🔐 **JWT-based Authentication** for Citizens, Agents, Workers, Admin  
- 🛂 **Role-Based Access Control** with different dashboards  
- 👷 **Worker Assignment System** managed by Agents  
- 📸 **Before/After Cleaning Proof Upload**  
- 📊 **Analytics Dashboard** for tracking complaints and performance  
- 🌐 **Responsive Web App** (Mobile + Desktop)  
- ⚡ Real-time notifications and status updates  

---

## 🛠️ Technology Stack

| Frontend | Backend (Option 1) | Backend (Option 2) | Database | Styling | Tools & DevOps |
|----------|---------------------|---------------------|----------|---------|----------------|
| React.js + TypeScript | Node.js + Express | Java Spring Boot | MySQL / SQLite | Tailwind CSS | Vite, Git, Postman |
| React Router | RESTful APIs | Maven-based APIs | Sequelize / JPA | PostCSS | ESLint, Netlify |

---

## 📂 Folder Structure

```plaintext
Smart-Waste-Management-System/
├── src/              # React frontend (citizen/agent/worker dashboards)
├── backend/          # Spring Boot backend (optional full setup)
├── server.js         # Node.js backend (quick setup)
├── waste_management.db # SQLite database (auto-created in Node.js mode)
├── uploads/          # Uploaded complaint & cleaned photos
🚀 Getting Started
1️⃣ Clone the Repository

git clone https://github.com/MohammedAzam-08/Smart-Waste-Management-System.git
cd Smart-Waste-Management-System
2️⃣ Install Dependencies
For Frontend + Node.js Backend (Quick Start)

npm install
npm run dev
For Spring Boot Backend (Optional)

cd backend
mvn clean install
mvn spring-boot:run
🔐 Environment Variables
Create a .env file in the root directory:
env

# Server Configuration
PORT=3001
JWT_SECRET=your-secret-key-here

# Database (for Spring Boot mode)
DB_HOST=localhost
DB_USER=root
DB_PASS=your-password
DB_NAME=waste_management_db

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
📊 Default Login Credentials
Role	Email	Password
Admin	admin@wastesystem.com	admin123
Agent	agent@wastesystem.com	agent123
Worker	worker@wastesystem.com	worker123
Citizen	Register via portal	-

🧪 Testing Instructions
🧾 Login and authentication via Postman

📝 Submit complaint with photo

🧑‍💼 Agent assigns complaint to worker

👷 Worker uploads cleaned photo and closes complaint

✅ Verify complaint resolution

🧠 Future Enhancements
📌 AI-based complaint categorization

📍 IoT sensor integration for smart bins

🛰️ Real-time GPS worker tracking

📊 Data analytics dashboards for city-wide insights

🎓 Academic Context
This project is a capstone submission for:

Yenepoya University (2025)
📜 23MCAI18_PG_4th_sem_Project_2025

👨‍💻 Author
Mohammed Azam
Full Stack Developer | MCA '25 | Bengaluru, India
🔗 Portfolio | LinkedIn | GitHub

⭐ If you found this project useful, don’t forget to Star 🌟 the repo and share feedback!


---

👉 This matches the **Examify style**, but adapted for your **Smart Waste Management System**.  

Do you want me to also include a **sample MySQL schema snippet** in the README (so future users can directly set up the DB), or keep it separate in a `/docs/setup.sql` file?

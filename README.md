# 📚 Student Study Planner

A full-stack student productivity platform to plan, gamify, and track study sessions using custom timetables, AI-generated content, and NLP-powered progress features.

---

## 📘 About the Project

We've developed a **Student Study Planner** designed to help students structure their study schedules effectively. The platform allows students to input their subjects, preferred study times, and available hours. Using this data, we generate personalized timetables tailored to each student's unique needs. The planner offers weekly schedules, focused study sessions, daily targets, and session-based challenges.

To keep students motivated, we've incorporated a **gamified environment**—students earn points for completing sessions, maintain streaks, and stay engaged with their learning goals.

---

### 🔧 Tech Stack

- ✅ JWT-based authentication with bcrypt for secure user management  
- ✅ MongoDB for data storage  
- ✅ FastAPI as the backend framework  
- ✅ React and TailwindCSS for a responsive and modern frontend  
- ✅ LLM-based models to handle NLP-related tasks

---

### 🚀 Upcoming Features

We’re working on expanding the platform with:

- 🏆 Leaderboards  
- 📊 Student analytics dashboards  
- 🔍 Topic-based subject researchers  
- 🧠 AI-generated notes and learning resources, integrated with the timetable

> We've already **built many of these features** as separate modules. Due to time constraints, full integration into the main platform is still in progress. We’re committed to continuously building and refining this platform—not just for others, but for ourselves too.

---

## 📋 Prerequisites (Short)

- Git  
- Node.js (v18+) & npm  
- Python 3.10+ & pip  

---

## 🛠️ Getting Started

### 📥 Clone the Repository

```bash
git clone https://github.com/tranquility404/study-planner.git
cd student-study-planner
```

---

### 🖼️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> Runs on: [http://localhost:5173](http://localhost:5173)

---

### ⚙️ Backend Setup

```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3001
```

> API: [http://localhost:443](http://localhost:443)  
> Swagger Docs: [http://localhost:443/docs](http://localhost:443/docs)

---

## 📁 Project Structure

```
student-study-planner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   │   └── api/
│   ├── public/
│   ├── package.json
│   └── .env
└── backend/
    ├── app/
    │   └── main.py
    ├── requirements.txt
    └── .env
```

---

## 🌐 Deployment (Coming Soon)

- Frontend: Vercel  
- Backend: Railway

We'll update this section once deployment is fully configured.

---

## 🤝 Contributing

- Fork the repository  
- Clone your fork  
- Create a new branch  
- Push your changes  
- Submit a pull request

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
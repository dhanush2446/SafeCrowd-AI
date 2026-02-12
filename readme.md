
# 🛡 SafeCrowd AI – Event Safety Planner

This project is an intelligent orchestration platform designed to enhance safety and traffic management for large-scale public events. By integrating Large Language Models (LLMs) with geospatial analytics, the system automates risk assessments and operational planning. It replaces manual oversight with an AI-driven engine that calculates crowd density to predict stampede risks and analyzes local road networks to generate precise traffic diversion plans. The system allows planners to input natural language instructions—such as weather alerts or VIP presence—which the AI uses to improvise localized strategies, including specific road closures and emergency routes. This project provides a clear, actionable safety report, ensuring that high-density gatherings remain secure.

---

## 🚀 Features

- 🤖 AI-powered traffic & safety strategy generation
- 📊 Machine Learning-based crowd risk prediction
- 📈 Interactive risk gauge visualization
- 🧠 Crowd density sensitivity modeling
- 🏙 Location-aware traffic planning
- 🎨 Modern premium frontend (React + Tailwind)
- ⚡ FastAPI backend with ML integration

---

## 🏗 Project Architecture

safecrowd/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── config.py
│ │ ├── models/
│ │ │ ├── risk_predictor.py
│ │ │ └── plan_traffic.py
│ │ └── data/
│ │ └── event risk dataset.csv
│ ├── plan_event_cli.py
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ │ ├── landing.jsx
│ │ │ └── home.jsx
│ │ ├── components/
│ │ ├── app.jsx
│ │ └── main.jsx
│ └── package.json
|
└── requirements.txt
└── README.md


---

# 🧠 How It Works

### 1️⃣ Risk Prediction (ML Model)
- Uses RandomForestClassifier + RandomForestRegressor
- Predicts:
  - Risk Category (Low → Very Critical)
  - Risk Score (0–1 scaled)
- Sensitive to crowd changes and venue capacity

### 2️⃣ AI Traffic Strategy
- Generates geographically precise safety plans
- Includes:
  - Road diversions
  - Crowd monitoring
  - Medical response
  - Parking logistics

### 3️⃣ Frontend Visualization
- Elegant amber theme
- Interactive animated risk gauge
- Styled instructions display
- Premium UI with subtle background effects

---

# ⚙️ Backend Setup

### 📌 1. Navigate to backend folder

```bash
cd backend
uvicorn app.main:app --reload 

# ⚙️ Frontend Setup

### 📌 1. Navigate to frontend folder

```bash
cd frontend
npm install
npm run dev



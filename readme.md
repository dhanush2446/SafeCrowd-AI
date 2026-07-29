# SafeCrowd AI Event Planner System

SafeCrowd AI is an intelligent event planning and safety management system that combines a Python FastAPI backend with a React frontend. It helps event organizers assess crowd risk, generate safety plans, and interact with an AI assistant for operational guidance.

## Features

- Event-based risk assessment using Python ML logic (Random Forest)
- AI-generated crowd and traffic management strategy
- Interactive Leaflet Command Map with automated AI element placement (gates, exits, medical posts, security)
- 3D Venue Simulator & Interactive Crowd Density Risk Simulator
- Real-time Intel Panel & AI Emergency Assistant
- Modern React-based dashboard for planning and visualization

## Project Structure

```text
event planner1/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   └── models/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   ├── CommandMap.jsx
│   │   │   ├── IntelPanel.jsx
│   │   │   └── ElementPalette.jsx
│   │   ├── pages/
│   │   └── api.js
│   ├── package.json
│   └── vite.config.js
└── readme.md
```

## Tech Stack

- Backend: Python, FastAPI, Pydantic, Uvicorn, Scikit-Learn, Groq API
- Frontend: React, Vite, Tailwind CSS, Leaflet, Three.js / React Three Fiber, Axios

## Deployments

- Frontend: Vercel (`https://safe-crowd-ai.vercel.app`)
- Backend: Render (`https://safecrowd-ai.onrender.com`)

## License

This project is for educational and portfolio demonstration purposes.

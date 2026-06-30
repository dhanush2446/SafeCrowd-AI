# SafeCrowd AI Event Planner System

SafeCrowd AI is an intelligent event planning and safety management system that combines a Python FastAPI backend with a React frontend. It helps event organizers assess crowd risk, generate safety plans, and interact with an AI assistant for operational guidance.

## Features

- Event-based risk assessment using Python ML logic
- AI-generated crowd and traffic management strategy
- Safety alerts based on capacity, risk score, and venue layout
- Interactive map-style placement of event elements such as gates, exits, medical posts, and security stations
- AI chat assistant for event safety questions
- Modern React-based dashboard for planning and visualization

## Project Structure

```text
event planner1/
├── backend/
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── models/
│       └── safety_engine/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── requirements.txt
└── readme.md
```

## Tech Stack

- Backend: Python, FastAPI, Pydantic, Uvicorn
- Frontend: React, Vite, Tailwind CSS, Axios
- AI/ML: Python-based risk prediction and planning modules

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm or pnpm

## Backend Setup

1. Open the project folder:
   ```bash
   cd event planner1
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file inside the project root if you want AI features enabled:
   ```env
   GROQ_API_KEY=your_api_key_here
   ```

5. Start the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

The backend will run at:
```text
http://127.0.0.1:8000
```

## Frontend Setup

1. Open a new terminal and go to the frontend folder:
   ```bash
   cd event planner1/frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run at:
```text
http://127.0.0.1:3000
```

## How It Works

1. The React frontend collects event details such as name, venue, attendees, capacity, and placed safety elements.
2. The frontend sends this data to the FastAPI backend through API endpoints.
3. The backend processes the request using Python logic to assess risk and generate an operational plan.
4. The frontend displays the results, including alerts, strategy recommendations, and AI chat responses.

## API Endpoints

- `POST /api/plan-event` - Generates event safety analysis and strategy
- `POST /api/chat` - Sends user questions to the AI assistant

## Notes

- If no `GROQ_API_KEY` is provided, the system will still run in fallback mode using built-in planning logic.
- The project is designed for demo and prototype use and can be extended with real-time analytics, database storage, and authentication.

## License

This project is for educational and portfolio demonstration purposes.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import OpenAI

# Import the AI modules
from app.models.risk_predictor import RiskPredictor
from app.models.plan_traffic import ChatGPTTrafficPlanner
from app.config import get_settings

app = FastAPI(title="SafeCrowd AI Backend", version="2.0")

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Model and AI Planner
settings = get_settings()
risk_predictor = RiskPredictor()
traffic_planner = None
openai_client = None

if settings.groq_api_key:
    traffic_planner = ChatGPTTrafficPlanner(api_key=settings.groq_api_key)
    print("✅ Groq API connected - AI Strategy generation enabled")
else:
    print("⚠️ GROQ_API_KEY not found in .env - Using fallback plans")

if settings.openai_api_key:
    openai_client = OpenAI(api_key=settings.openai_api_key)
    print("✅ OpenAI API connected - ChatGPT chatbot enabled")
else:
    print("⚠️ OPENAI_API_KEY not found in .env - Chatbot will use fallback responses")

# Request Models
class Region(BaseModel):
    name: str
    color: str = "#3b82f6"

class EventRequest(BaseModel):
    name: str
    location: str = "Unknown Venue"
    date: str = "2026-01-01"
    attendees: int
    capacity: int = 10000
    startTime: str = "10:00"
    endTime: str = "18:00"
    instructions: str = ""
    regions: Optional[List[Region]] = []

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.post("/api/plan-event")
async def plan_event(event: EventRequest):
    """
    Main endpoint: Takes event data, predicts risk with ML, generates AI strategy.
    """
    # 1. ML Risk Prediction
    risk_result = risk_predictor.predict_event_risk(
        event_type="concert",  # Default event type for now
        attendees=event.attendees,
        capacity=event.capacity
    )
    
    # Extract risk data
    risk_category = risk_result.get("risk_category", "Medium")
    risk_score = risk_result.get("risk_score", 0.5)
    load_factor = event.attendees / event.capacity if event.capacity > 0 else 1
    
    # Convert to stampede probability (0-100 scale)
    stampede_prob = int(risk_score * 100)
    
    # 2. Generate AI Strategy (or fallback)
    if traffic_planner:
        # Use Groq/Llama AI for real plan generation
        detailed_strategy = traffic_planner.analyze_traffic(
            event_name=event.name,
            location=event.location,
            date=event.date,
            start_time=event.startTime,
            end_time=event.endTime,
            attendees=event.attendees,
            risk_data={
                "category": risk_category,
                "capacity": event.capacity,
                "load_factor": load_factor
            },
            special_instructions=[event.instructions] if event.instructions else None
        )
    else:
        # Fallback if no API key
        detailed_strategy = f"""STRATEGIC OPERATIONAL PLAN: {event.name.upper()}

I. RISK ASSESSMENT
- ML Risk Category: {risk_category}
- Crowd Load Factor: {round(load_factor * 100)}%
- Stampede Probability: {stampede_prob}%

II. CROWD MANAGEMENT
- Deploy security personnel at all entry/exit points
- Establish crowd density monitoring zones
- Implement one-way flow corridors during peak hours

III. TRAFFIC MANAGEMENT  
- Location: {event.location}
- Schedule diversions 2 hours before event start ({event.startTime})
- Designate VIP and emergency vehicle lanes

IV. EMERGENCY PROTOCOLS
- Position medical teams at strategic locations
- Ensure clear evacuation routes
- Maintain communication with local authorities

⚠️ Note: For detailed AI-generated plans, configure GROQ_API_KEY in backend/.env
"""

    # 3. Generate alerts based on risk level
    alerts = []
    if load_factor > 0.9:
        alerts.append(f"CRITICAL: Venue at {round(load_factor*100)}% capacity - high density risk")
    if stampede_prob > 70:
        alerts.append("HIGH ALERT: Stampede probability exceeds safety threshold")
    if risk_category in ["High", "Critical", "Very Critical"]:
        alerts.append(f"Risk level classified as {risk_category} - enhanced protocols required")
    if not event.instructions:
        alerts.append("No special instructions provided - using default safety protocols")

    return {
    "stampedeProb": stampede_prob,
    "riskCategory": risk_category,
    "alerts": alerts,
    "trafficPlan": {
        "detailed_strategy": detailed_strategy
    }
}




@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    ChatGPT-powered chatbot endpoint for event safety questions.
    """
    if not openai_client:
        return {
            "response": "ChatGPT is not configured. Please add OPENAI_API_KEY to your backend/.env file to enable the AI chatbot."
        }
    
    try:
        # Build messages with system context
        messages = [
            {
                "role": "system",
                "content": """You are an expert AI assistant for event safety and crowd management. 
You help event planners with:
- Risk assessment and mitigation strategies
- Crowd flow optimization
- Emergency response planning
- Safety protocol recommendations
- Venue capacity management
- Traffic and parking logistics

Be concise, professional, and provide actionable advice. Focus on safety best practices."""
            }
        ]
        
        # Add conversation history
        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add the current user message
        messages.append({"role": "user", "content": request.message})
        
        # Call OpenAI API
        completion = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        return {
            "response": completion.choices[0].message.content
        }
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return {
            "response": f"Sorry, I encountered an error: {str(e)}"
        }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ml_model": "loaded" if risk_predictor else "not loaded",
        "ai_planner": "connected" if traffic_planner else "not configured",
        "chatbot": "connected" if openai_client else "not configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
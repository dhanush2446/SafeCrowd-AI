from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

# Import the AI modules
from app.models.risk_predictor import RiskPredictor
from app.models.plan_traffic import ChatGPTTrafficPlanner
from app.config import get_settings

app = FastAPI(title="SafeCrowd AI Backend", version="3.0")

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

if settings.groq_api_key:
    traffic_planner = ChatGPTTrafficPlanner(api_key=settings.groq_api_key)
    print("[OK] Groq API connected - AI Strategy + Chat enabled")
else:
    print("[WARN] GROQ_API_KEY not found in .env - Using fallback plans")

# ──────────────────────────────────────────
#  REQUEST MODELS
# ──────────────────────────────────────────

class PlacedElement(BaseModel):
    id: str
    type: str        # gate, exit, medical, security, parking, stage, barricade, cctv
    label: str = ""
    lat: float
    lng: float

class Region(BaseModel):
    name: str
    color: str = "#3b82f6"

class EventRequest(BaseModel):
    name: str = "Event Safety Plan"
    location: str = "Rajiv Gandhi International Cricket Stadium, Uppal"
    date: str = "2026-07-28"
    attendees: int = 5000
    capacity: int = 10000
    eventType: str = "concert"
    startTime: str = "10:00"
    endTime: str = "18:00"
    instructions: str = ""
    regions: Optional[List[Region]] = []
    placedElements: Optional[List[PlacedElement]] = []

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class AutoPlaceRequest(BaseModel):
    name: str = "Venue Location"
    lat: float
    lng: float
    attendees: int = 5000
    capacity: int = 10000
    eventType: str = "concert"

# ──────────────────────────────────────────
#  PLAN EVENT ENDPOINT
# ──────────────────────────────────────────

@app.post("/api/plan-event")
async def plan_event(event: EventRequest):
    """
    Main endpoint: Takes event data + placed elements, predicts risk, generates AI strategy.
    """
    # 1. ML Risk Prediction
    risk_result = risk_predictor.predict_event_risk(
        event_type=event.eventType,
        attendees=event.attendees,
        capacity=event.capacity
    )

    risk_category = risk_result.get("risk_category", "Medium")
    risk_score = risk_result.get("risk_score", 0.5)
    load_factor = event.attendees / event.capacity if event.capacity > 0 else 1
    stampede_prob = int(risk_score * 100)

    # 2. Format placed elements for AI
    elements_list = []
    if event.placedElements:
        for el in event.placedElements:
            elements_list.append({
                "type": el.type,
                "label": el.label,
                "lat": el.lat,
                "lng": el.lng
            })

    # 3. Generate AI Strategy
    if traffic_planner:
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
            special_instructions=[event.instructions] if event.instructions else None,
            placed_elements=elements_list if elements_list else None
        )
    else:
        detailed_strategy = f"""STRATEGIC OPERATIONAL PLAN: {event.name.upper()}

I. RISK ASSESSMENT
- ML Risk Category: {risk_category}
- Crowd Load Factor: {round(load_factor * 100)}%
- Stampede Probability: {stampede_prob}%
- User-placed elements: {len(elements_list)}

II. CROWD MANAGEMENT
- Deploy security personnel at all entry/exit points
- Establish crowd density monitoring zones

III. TRAFFIC MANAGEMENT
- Location: {event.location}
- Schedule diversions 2 hours before event start ({event.startTime})

IV. EMERGENCY PROTOCOLS
- Position medical teams at strategic locations
- Ensure clear evacuation routes

NOTE: For detailed AI-generated plans, configure GROQ_API_KEY in backend/.env
"""

    # 4. Generate alerts
    alerts = []
    if load_factor > 0.9:
        alerts.append(f"CRITICAL: Venue at {round(load_factor*100)}% capacity - high density risk")
    if stampede_prob > 70:
        alerts.append("HIGH ALERT: Stampede probability exceeds safety threshold")
    if risk_category in ["High", "Critical", "Very Critical"]:
        alerts.append(f"Risk level classified as {risk_category} - enhanced protocols required")
    if not event.instructions:
        alerts.append("No special instructions provided - using default safety protocols")

    # Element-based alerts
    if elements_list:
        gate_count = sum(1 for e in elements_list if e["type"] == "gate")
        exit_count = sum(1 for e in elements_list if e["type"] == "exit")
        medical_count = sum(1 for e in elements_list if e["type"] == "medical")
        if gate_count == 0:
            alerts.append("WARNING: No entry gates placed - add gates for proper crowd flow planning")
        if exit_count == 0:
            alerts.append("WARNING: No emergency exits placed - critical for evacuation planning")
        if medical_count == 0 and event.attendees > 5000:
            alerts.append("WARNING: No medical posts for 5000+ crowd - recommended minimum 2 posts")
        if gate_count > 0 and event.attendees / gate_count > 5000:
            alerts.append(f"CAUTION: {event.attendees / gate_count:.0f} people per gate — consider adding more entry points")

    return {
        "stampedeProb": stampede_prob,
        "riskCategory": risk_category,
        "alerts": alerts,
        "trafficPlan": {
            "detailed_strategy": detailed_strategy
        }
    }

# ──────────────────────────────────────────
#  AUTO PLACE ELEMENTS ENDPOINT
# ──────────────────────────────────────────

@app.post("/api/auto-place")
async def auto_place(req: AutoPlaceRequest):
    """
    Intelligently generates safety element placement around venue center,
    dynamically scaling for stadium-scale and high-capacity events.
    """
    import math

    lat, lng = req.lat, req.lng
    attendees = req.attendees
    capacity = req.capacity
    name_lower = req.name.lower()
    is_stadium = "stadium" in name_lower or "arena" in name_lower or "ground" in name_lower

    # Determine counts based on real-world event scale
    if is_stadium or capacity >= 30000 or attendees >= 25000:
        num_gates = 10
        num_exits = 8
        num_medical = 4
        num_security = 16
        num_cctv = 12
        num_barricades = 6
        radius = 0.0035  # ~350m perimeter radius for stadiums
    elif capacity >= 10000 or attendees >= 8000:
        num_gates = 6
        num_exits = 6
        num_medical = 3
        num_security = 10
        num_cctv = 8
        num_barricades = 4
        radius = 0.0025
    else:
        num_gates = 4
        num_exits = 4
        num_medical = 2
        num_security = 6
        num_cctv = 6
        num_barricades = 2
        radius = 0.0018

    elements = []

    # 1. GATES — Full 360-degree perimeter distribution (Gate 1 to Gate N)
    gate_directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]
    for i in range(num_gates):
        angle = (2 * math.pi * i) / num_gates
        g_lat = lat + radius * math.cos(angle)
        g_lng = lng + radius * math.sin(angle)
        dir_name = gate_directions[i % len(gate_directions)]
        label = f"Gate {i + 1} ({dir_name} Access)"
        elements.append({
            "id": f"auto-gate-{i+1}",
            "type": "gate",
            "label": label,
            "lat": g_lat,
            "lng": g_lng,
            "source": "ai_auto"
        })

    # 2. EMERGENCY EXITS — Interspersed between gates on outer perimeter
    for i in range(num_exits):
        angle = (2 * math.pi * i) / num_exits + (math.pi / num_exits)
        e_lat = lat + (radius * 1.1) * math.cos(angle)
        e_lng = lng + (radius * 1.1) * math.sin(angle)
        elements.append({
            "id": f"auto-exit-{i+1}",
            "type": "exit",
            "label": f"Emergency Evacuation Exit {chr(65 + i)}",
            "lat": e_lat,
            "lng": e_lng,
            "source": "ai_auto"
        })

    # 3. MEDICAL HUBS — Positioned near outer perimeter roads
    med_labels = ["Primary Emergency Triage", "Secondary Medical Post", "South Triage Unit", "East Ambulance Bay"]
    for i in range(num_medical):
        angle = (2 * math.pi * i) / num_medical + (math.pi / 4)
        m_lat = lat + (radius * 1.15) * math.cos(angle)
        m_lng = lng + (radius * 1.15) * math.sin(angle)
        elements.append({
            "id": f"auto-med-{i+1}",
            "type": "medical",
            "label": med_labels[i % len(med_labels)],
            "lat": m_lat,
            "lng": m_lng,
            "source": "ai_auto"
        })

    # 4. SECURITY CHECKPOINTS — Flanking every gate
    for i in range(num_security):
        angle = (2 * math.pi * i) / num_security
        s_lat = lat + (radius * 0.85) * math.cos(angle)
        s_lng = lng + (radius * 0.85) * math.sin(angle)
        elements.append({
            "id": f"auto-sec-{i+1}",
            "type": "security",
            "label": f"Security Checkpoint {i+1}",
            "lat": s_lat,
            "lng": s_lng,
            "source": "ai_auto"
        })

    # 5. CCTV SURVEILLANCE — Interior & gate choke points
    for i in range(num_cctv):
        angle = (2 * math.pi * i) / num_cctv + 0.1
        c_lat = lat + (radius * 0.6) * math.cos(angle)
        c_lng = lng + (radius * 0.6) * math.sin(angle)
        elements.append({
            "id": f"auto-cctv-{i+1}",
            "type": "cctv",
            "label": f"Choke Point CCTV {i+1}",
            "lat": c_lat,
            "lng": c_lng,
            "source": "ai_auto"
        })

    # 6. BARRICADES — Crowd control rings near central field/stage
    for i in range(num_barricades):
        angle = (2 * math.pi * i) / num_barricades
        b_lat = lat + (radius * 0.3) * math.cos(angle)
        b_lng = lng + (radius * 0.3) * math.sin(angle)
        elements.append({
            "id": f"auto-barricade-{i+1}",
            "type": "barricade",
            "label": f"Crowd Control Barrier {i+1}",
            "lat": b_lat,
            "lng": b_lng,
            "source": "ai_auto"
        })

    return {
        "status": "success",
        "count": len(elements),
        "venue_type": "Stadium / Mega Venue" if is_stadium or capacity >= 30000 else "Standard Venue",
        "elements": elements
    }

# ──────────────────────────────────────────
#  AI CHAT ENDPOINT (uses Groq)
# ──────────────────────────────────────────

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    AI chatbot for event safety questions — uses Groq (Llama 3.3).
    """
    if not traffic_planner:
        return {
            "response": "AI chat is not configured. Please add GROQ_API_KEY to your backend/.env file."
        }

    try:
        groq_client = traffic_planner.client
        messages = [
            {
                "role": "system",
                "content": """You are an expert AI assistant for event safety and crowd management, integrated into the SafeCrowd AI command center.
You help event planners with:
- Risk assessment and mitigation strategies
- Crowd flow optimization
- Emergency response planning
- Safety protocol recommendations
- Venue capacity management
- Traffic and parking logistics

=== COORDINATE SYSTEM ===
Users can reference specific map locations using @lat,lng format (e.g. @17.38500,78.48670).
When a user includes a coordinate reference:
1. Treat it as a PRECISE GPS location on the map.
2. Use your geographic knowledge to identify what is at or near those coordinates (roads, landmarks, hospitals, etc.)
3. When placing elements at that coordinate, include "lat" and "lng" in the action JSON.
4. You can answer questions about that location: nearby hospitals, roads, landmarks, terrain, accessibility, etc.
5. Default to Hyderabad, India geography when the city is ambiguous.

=== EVENT TYPE AWARENESS ===
The system auto-calibrates marker placement based on event type:
- Concert: Stage at back (away from roads), gates facing main road, fan-shaped crowd flow
- Sports: Field/stage at center, gates evenly distributed around perimeter
- Religious: Multiple dispersed entry points, maximum exit spread for crowd safety
- Marathon: Linear checkpoints along route, medical at intervals
- Exhibition: Grid layout, multiple small security zones
- Festival: Multiple stages, distributed amenities
When advising on layouts, consider the event type for appropriate placement.

=== ACTIONABLE COMMANDS ===
You can EXECUTE actions on the event map. When the user asks you to place, remove, or modify elements, you MUST include one or more [ACTION] blocks in your response.

Available element types: gate, exit, medical, security, parking, stage, barricade, cctv

ACTION FORMAT (include in your response alongside your text explanation):

To place an element at a SPECIFIC coordinate:
[ACTION]{"type":"add_element","element_type":"medical","label":"Medical Post 1","lat":17.385,"lng":78.487}[/ACTION]

To place an element (auto-positioned near venue):
[ACTION]{"type":"add_element","element_type":"security","label":"Security Checkpoint North"}[/ACTION]

To remove elements by type (removes ALL of that type):
[ACTION]{"type":"remove_element","element_type":"parking"}[/ACTION]

To remove a specific element by label (partial match):
[ACTION]{"type":"remove_element","label":"Gate B"}[/ACTION]

To fly/navigate the map to a location:
[ACTION]{"type":"fly_to","location":"Parade Grounds, Hyderabad"}[/ACTION]

To clear all placed elements:
[ACTION]{"type":"clear_elements"}[/ACTION]

To regenerate the safety plan:
[ACTION]{"type":"regenerate_plan"}[/ACTION]

RULES:
1. ALWAYS include [ACTION] blocks when the user asks to add, place, remove, or modify map elements.
2. Give each element a descriptive label (e.g. "Main Entry Gate", "East Medical Post").
3. When placing elements, also explain WHY you're placing them there and any safety considerations.
4. If the user says something vague like "add some security", use your expertise to decide how many and what labels to give them.
5. For questions that don't require map changes, respond normally without action blocks.
6. Be concise but professional. Keep text responses under 200 words unless the user asks for detail.
7. You can combine text and actions in the same response.
8. When coordinates are provided via [Coordinate Reference:...], USE those exact lat/lng in your action JSON.
9. When asked "list hospitals near @coord" or similar location queries, answer with your real-world geographic knowledge about that area.
10. When the user says "remove" or "delete", use remove_element action. When they say "move", use remove_element then add_element at the new position."""
            }
        ]

        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.message})

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )

        return {
            "response": response.choices[0].message.content
        }
    except Exception as e:
        print(f"Groq Chat Error: {e}")
        return {
            "response": f"Sorry, I encountered an error: {str(e)}"
        }

@app.get("/")
async def root():
    return {
        "message": "Welcome to SafeCrowd AI Backend Service API",
        "docs": "/docs",
        "health": "/health",
        "status": "online"
    }

# ──────────────────────────────────────────
#  HEALTH CHECK
# ──────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ml_model": "loaded" if risk_predictor else "not loaded",
        "ai_planner": "connected" if traffic_planner else "not configured",
        "chatbot": "connected (Groq)" if traffic_planner else "not configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
import argparse
from datetime import date
import sys
import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from groq import Groq

# --- 1. SETUP PATHS ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(SCRIPT_DIR, "app")

if SCRIPT_DIR not in sys.path: sys.path.insert(0, SCRIPT_DIR)
if APP_DIR not in sys.path: sys.path.insert(0, APP_DIR)

# --- 2. LOAD SECURE SETTINGS ---
try:
    from config import get_settings
    settings = get_settings()
except ImportError as e:
    print(f"CRITICAL ERROR: Could not find config.py at {APP_DIR}")
    sys.exit(1)

# --- 3. RISK PREDICTOR CLASS ---
class RiskPredictor:
    def __init__(self, csv_path):
        if not os.path.exists(csv_path):
            print(f"CRITICAL ERROR: Dataset not found at: {csv_path}")
            sys.exit(1)
            
        self.df = pd.read_csv(csv_path)
        self.df.columns = self.df.columns.str.strip().str.lower()
        
        # Training logic
        X = self.df[['total_attendees', 'venue_capacity']]
        y = self.df['risk_level']
        
        self.model = RandomForestClassifier(n_estimators=100)
        self.model.fit(X.values, y)

    def predict_risk(self, attendees, capacity):
        load_factor = attendees / capacity
        prediction = self.model.predict([[attendees, capacity]])[0]
        # Force "High" if venue is over 90% full
        category = "High" if load_factor > 0.90 else str(prediction)
        return {"category": category, "load": load_factor}

# --- 4. MAIN EXECUTION ---
def main():
    parser = argparse.ArgumentParser(description="SafeCrowd CLI")
    parser.add_argument("--name", required=True)
    parser.add_argument("--location", required=True)
    parser.add_argument("--date", required=True)
    parser.add_argument("--attendees", type=int, required=True)
    parser.add_argument("--capacity", type=int, default=10000)
    parser.add_argument("--start_time", required=True)
    parser.add_argument("--end_time", required=True)
    parser.add_argument("--instructions", type=str, default="None")
    args = parser.parse_args()

    if not settings.groq_api_key:
        print("ERROR: GROQ_API_KEY not found in .env file.")
        sys.exit(1)

    csv_path = os.path.join(SCRIPT_DIR, "data", "event risk dataset.csv")

    # Step A: ML Risk Prediction
    print(f"\n[1/2] Training Model & Predicting Risk...")
    predictor = RiskPredictor(csv_path)
    risk_data = predictor.predict_risk(args.attendees, args.capacity)
    print(f">> Result: {risk_data['category']} Risk (Load: {round(risk_data['load']*100, 1)}%)")

    # Step B: AI Strategy Generation
    print(f"[2/2] Generating Localized AI Strategy for {args.name}...")
    client = Groq(api_key=settings.groq_api_key)
    
    # This prompt forces the AI to use local street data for any location provided
    prompt = prompt = f"""
    Act as a Local Traffic Police Commander for the specific city where {args.location} is located.
    
    [STRICT GEOGRAPHIC COMMAND]: 
    1. Identify the city and neighborhood for {args.location}.
    2. If you are not 100% sure of the EXACT street names touching {args.location}, do NOT guess.
    3. Use your internal knowledge of the actual city layout (e.g., if it's Hyderabad, use Hyderabad streets; if it's Delhi, use Delhi streets).
    4. Mention 3 major roads and 2 local landmarks that physically exist within 500 meters of {args.location}.

    [EVENT DATA]:
    - Name: {args.name}
    - Venue: {args.location} 
    - Schedule: {args.date} | {args.start_time} to {args.end_time}
    - ML Risk Analysis: {risk_data['category']} Risk ({round(risk_data['load']*100, 1)}% Occupancy)
    - Special Instructions: {args.instructions}
    
    [REQUIRED OUTPUT]:
    Provide an point wise Safety & Traffic Plan. Point #3 MUST contain the real-world road names for this specific venue.
    
    [CONSIDER THESE POINTS]:
    -If risk estimation is less than 50%, suggest basic traffic management and crowd control measures.
    -If risk estimation is between 50% and 80%, suggest moderate traffic diversions
    -In the beginning of the response, If stampede is inevitable like if the risk prediction is more than 100%, suggest to change the venue before the planning.

    [MANDATORY GEOGRAPHIC CONSTRAINT]:
    For Point #3 (Traffic) and Point #5 (Pedestrians), you MUST be geographically precise for {args.location}.
    - IDENTIFY and NAME at least 4 specific roads/streets surrounding {args.location}.
    - NAME 3 specific local landmarks (statues, metro stations, or buildings) to be used as drop-off or diversion points.
    - LIST actual parking grounds/malls by their real names nearby.
    - Specify exact diversion timings starting from 2 hours before {args.start_time}.
    - IF YOU PROVIDE GENERIC TERMS LIKE 'THE MAIN ROAD', THE REPORT IS INVALID.

    STRUCTURE:
    1. Security & Access Control with very specific geographic checkpoints, and also mention the exact number of security personnel required based on the risk level.
    2. Traffic & Parking Management (Specific road names & landmarks REQUIRED)
    3. Crowd Monitoring 
    4. Pedestrian Routes & Drop-off Zones (Area names & specific paths REQUIRED)
    5. Medical Emergency Response with specific local hospital names and ambulance routes and spots for emergency care.
    
    Don't mention you are an AI. Respond as if you are a real-world Traffic Police Commander with deep local knowledge of the area and also not mention you are Local Traffic Police Commander.
    
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            max_tokens=1500,
            temperature=0.3, # Low temperature ensures factual/geographic focus
            top_p=1
        )
        print("\n" + "="*70)
        print(f"STRATEGIC PLAN: {args.name.upper()} ({args.date})")
        print("="*70)
        print(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"AI Error: {e}")

if __name__ == "__main__":
    main()
from groq import Groq

class ChatGPTTrafficPlanner:
    def __init__(self, api_key):
        self.client = Groq(api_key=api_key)

    def analyze_traffic(self, event_name, location, date, start_time, end_time, attendees, risk_data, special_instructions=None):
        # 1. Format instructions
        instr_list = "\n".join([f"- {i}" for i in special_instructions]) if special_instructions else "None"
        
        # 2. Extract risk details safely
        risk_cat = risk_data.get('category', 'Unknown')
        capacity = risk_data.get('capacity', attendees)
        load_factor_pct = int((attendees / capacity) * 100) if capacity > 0 else 100

        # 3. THE PROMPT (Properly Indented)
        prompt = f"""
    Act as a Local Traffic Police Commander for the specific city where {location} is located.
    
    [STRICT GEOGRAPHIC COMMAND]: 
    1. Identify the city and neighborhood for {location}.
    2. If you are not 100% sure of the EXACT street names touching {location}, do NOT guess.
    3. Use your internal knowledge of the actual city layout (e.g., if it's Hyderabad, use Hyderabad streets; if it's Delhi, use Delhi streets).
    4. Mention 3 major roads and 2 local landmarks that physically exist within 500 meters of {location}.

    [EVENT DATA]:
    - Name: {event_name}
    - Venue: {location} 
    - Schedule: {date} | {start_time} to {end_time}
    - ML Risk Analysis: {risk_cat} Risk ({load_factor_pct}% Occupancy)
    - Special Instructions: {instr_list}
    
    [REQUIRED OUTPUT]:
    Provide an point wise Safety & Traffic Plan. Point #3 MUST contain the real-world road names for this specific venue.
    
    [CONSIDER THESE POINTS]:
    -If risk estimation is less than 50%, suggest basic traffic management and crowd control measures.
    -If risk estimation is between 50% and 80%, suggest moderate traffic diversions
    -In the beginning of the response, If stampede is inevitable like if the risk prediction is more than 100%, suggest to change the venue before the planning.

    [MANDATORY GEOGRAPHIC CONSTRAINT]:
    For Point #3 (Traffic) and Point #5 (Pedestrians), you MUST be geographically precise for {location}.
    - IDENTIFY and NAME at least 4 specific roads/streets surrounding {location}.
    - NAME 3 specific local landmarks (statues, metro stations, or buildings) to be used as drop-off or diversion points.
    - LIST actual parking grounds/malls by their real names nearby.
    - Specify exact diversion timings starting from 2 hours before {start_time}.
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
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2, # Lowered for factual accuracy
                max_tokens=2000  # 4000 is often overkill and can lead to rambling
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"
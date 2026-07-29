from groq import Groq

class ChatGPTTrafficPlanner:
    def __init__(self, api_key):
        self.client = Groq(api_key=api_key)

    def analyze_traffic(self, event_name, location, date, start_time, end_time,
                        attendees, risk_data, special_instructions=None,
                        placed_elements=None):
        # 1. Format instructions
        instr_list = "\n".join([f"- {i}" for i in special_instructions]) if special_instructions else "None"

        # 2. Extract risk details
        risk_cat = risk_data.get('category', 'Unknown')
        capacity = risk_data.get('capacity', attendees)
        load_factor_pct = int((attendees / capacity) * 100) if capacity > 0 else 100

        # 3. Format user-placed elements
        elements_section = ""
        if placed_elements and len(placed_elements) > 0:
            lines = []
            for el in placed_elements:
                lines.append(f"  - {el['type'].upper()}: \"{el['label']}\" at GPS ({el['lat']:.5f}, {el['lng']:.5f})")

            element_counts = {}
            for el in placed_elements:
                element_counts[el['type']] = element_counts.get(el['type'], 0) + 1

            count_summary = ", ".join([f"{v} {k}(s)" for k, v in element_counts.items()])

            elements_section = f"""
    [USER-PLACED VENUE LAYOUT]:
    The event organizer has placed the following {len(placed_elements)} elements on the venue map ({count_summary}):
{chr(10).join(lines)}

    [CRITICAL LAYOUT INSTRUCTION]:
    You MUST incorporate these user-placed elements into your plan:
    - Reference the specific gates/exits by their labels when discussing crowd flow
    - Plan security deployment AROUND the placed checkpoints
    - Direct ambulances to the placed medical posts
    - Route parking traffic to the placed parking zones
    - Plan crowd management relative to the stage/main event area position
    - Use barricade positions to plan crowd channeling corridors
    - Verify CCTV coverage areas and suggest gaps
    - If the user has NOT placed certain critical elements (e.g., no medical posts), recommend adding them
    """

        # 4. Build the prompt
        prompt = f"""
    Act as a Local Traffic Police Commander for Hyderabad, India, focusing specifically on the neighborhood where {location} is located. (If {location} is generic like 'Unknown Venue', default to the city center of Hyderabad).

    [STRICT GEOGRAPHIC COMMAND]:
    1. Identify the city and neighborhood for {location}.
    2. If you are not 100% sure of the EXACT street names touching {location}, do NOT guess.
    3. Use your internal knowledge of the actual city layout.
    4. Mention 3 major roads and 2 local landmarks that physically exist within 500 meters of {location}.

    [EVENT DATA]:
    - Name: {event_name}
    - Venue: {location}
    - Schedule: {date} | {start_time} to {end_time}
    - Expected Crowd: {attendees:,} people
    - Venue Capacity: {capacity:,}
    - ML Risk Analysis: {risk_cat} Risk ({load_factor_pct}% Occupancy)
    - Special Instructions: {instr_list}
    {elements_section}
    [REQUIRED OUTPUT]:
    Provide a point-wise Safety & Traffic Plan. Point #2 MUST contain the real-world road names for this specific venue.

    [CONSIDER THESE POINTS]:
    - If risk estimation is less than 50%, suggest basic traffic management and crowd control measures.
    - If risk estimation is between 50% and 80%, suggest moderate traffic diversions.
    - If stampede risk is very high (>90%), strongly recommend venue change or crowd cap reduction.

    [MANDATORY GEOGRAPHIC CONSTRAINT]:
    For Points #2 and #4, you MUST be geographically precise for {location}.
    - IDENTIFY and NAME at least 4 specific roads/streets surrounding {location}.
    - NAME 3 specific local landmarks to be used as drop-off or diversion points.
    - LIST actual parking grounds/malls by their real names nearby.
    - Specify exact diversion timings starting from 2 hours before {start_time}.
    - IF YOU PROVIDE GENERIC TERMS LIKE 'THE MAIN ROAD', THE REPORT IS INVALID.

    STRUCTURE:
    1. **Security & Access Control** — specific geographic checkpoints, exact number of security personnel
    2. **Traffic & Parking Management** — specific road names & landmarks REQUIRED
    3. **Crowd Monitoring** — density sensors, CCTV coverage, monitoring zones
    4. **Pedestrian Routes & Drop-off Zones** — area names & specific paths REQUIRED
    5. **Medical Emergency Response** — local hospital names, ambulance routes, emergency care spots

    Don't mention you are an AI. Respond as a real-world expert with deep local knowledge.
    """

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=2500
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"
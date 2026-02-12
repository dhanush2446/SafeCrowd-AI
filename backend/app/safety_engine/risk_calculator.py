import enum

class RiskLevel(enum.Enum):
    LOW = 'LOW'; MODERATE = 'MODERATE'; HIGH = 'HIGH'; CRITICAL = 'CRITICAL'

class AdvancedRiskCalculator:
    def calculate_crowd_risk(self, attendees, area, event_type, zones):
        density = attendees / area
        if density < 1.0: level = RiskLevel.LOW
        elif density < 2.0: level = RiskLevel.MODERATE
        elif density < 3.5: level = RiskLevel.HIGH
        else: level = RiskLevel.CRITICAL
        
        class RiskResult:
            def __init__(self, d, l):
                self.density = d
                self.risk_level = l
                self.recommendations = [
                    f"Keep individual sectors under {d:.1f} pax/sqm",
                    "Mandatory 10m clear fire-lanes around the perimeter",
                    "Deploy one-way crowd circulation valves"
                ]
        return RiskResult(density, level)
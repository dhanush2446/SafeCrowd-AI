import pandas as pd
import os
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler


class RiskPredictor:
    def __init__(self):
        self.dataset_path = (
            r"C:\Users\dhanush varma\OneDrive\Desktop\projs\event planner1"
            r"\backend\app\event risk dataset.csv"
        )

        # Models
        self.classifier = RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            random_state=42
        )

        self.regressor = RandomForestRegressor(
            n_estimators=400,
            max_depth=14,
            min_samples_leaf=3,
            random_state=42
        )

        # Encoders & scaler
        self.event_encoder = LabelEncoder()
        self.risk_cat_encoder = LabelEncoder()
        self.scaler = StandardScaler()

        if os.path.exists(self.dataset_path):
            self._train_model()
        else:
            raise FileNotFoundError("Risk dataset not found")

    # ---------------------------------------------------------
    # TRAINING
    # ---------------------------------------------------------
    def _train_model(self):
        df = pd.read_csv(self.dataset_path)
        df.columns = df.columns.str.strip()

        # Clean fields
        df["event_type"] = df["event_type"].astype(str).str.lower().str.strip()
        df["risk_level"] = df["risk_level"].astype(str).str.strip()

        # Encode categorical columns
        self.event_encoder.fit(df["event_type"])
        self.risk_cat_encoder.fit(df["risk_level"])
        df["event_type_encoded"] = self.event_encoder.transform(df["event_type"])

        # -------------------------------
        # DOMAIN-DRIVEN CONTINUOUS RISK
        # -------------------------------
        # Crowd pressure rises non-linearly near capacity
        df["crowd_pressure"] = df["load_factor"] ** 2

        # Weak supervision formula (continuous)
        df["risk_score_continuous"] = (
            0.55 * df["load_factor"] +
            0.30 * df["crowd_pressure"] +
            0.15 * (df["total_attendees"] / df["venue_capacity"])
        ).clip(0, 1)

        # Feature set
        features = [
            "event_type_encoded",
            "total_attendees",
            "venue_capacity",
            "load_factor",
            "crowd_pressure"
        ]

        X = df[features]
        y_class = self.risk_cat_encoder.transform(df["risk_level"])
        y_reg = df["risk_score_continuous"]

        X_scaled = self.scaler.fit_transform(X)

        # Train models
        self.classifier.fit(X_scaled, y_class)
        self.regressor.fit(X_scaled, y_reg)

    # ---------------------------------------------------------
    # PREDICTION
    # ---------------------------------------------------------
    def predict_event_risk(self, event_type, attendees, capacity):
        try:
            load_factor = attendees / capacity if capacity > 0 else 0.0
            crowd_pressure = load_factor ** 2

            clean_type = str(event_type).lower().strip()
            e_encoded = self.event_encoder.transform([clean_type])[0]

            input_df = pd.DataFrame(
                [[
                    e_encoded,
                    attendees,
                    capacity,
                    load_factor,
                    crowd_pressure
                ]],
                columns=[
                    "event_type_encoded",
                    "total_attendees",
                    "venue_capacity",
                    "load_factor",
                    "crowd_pressure"
                ]
            )

            input_scaled = self.scaler.transform(input_df)

            # Predict
            risk_score = float(self.regressor.predict(input_scaled)[0])
            cat_idx = self.classifier.predict(input_scaled)[0]
            risk_category = self.risk_cat_encoder.inverse_transform([cat_idx])[0]

            return {
                "event_type": event_type,
                "attendees": attendees,
                "capacity": capacity,
                "load_factor": load_factor,
                "crowd_pressure": crowd_pressure,
                "risk_category": risk_category,
                "risk_score": risk_score
            }

        except Exception as e:
            return {"error": str(e)}

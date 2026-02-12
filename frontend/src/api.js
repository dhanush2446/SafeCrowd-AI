import axios from "axios";

export async function planEvent(payload) {
  const res = await axios.post(
    "http://127.0.0.1:8000/api/plan-event",
    payload
  );
  return res.data;
}

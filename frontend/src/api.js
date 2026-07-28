import axios from "axios";

const API = "http://127.0.0.1:8000";

export async function planEvent(payload) {
  const res = await axios.post(`${API}/api/plan-event`, payload);
  return res.data;
}

export async function chatWithAI(message, history = []) {
  const res = await axios.post(`${API}/api/chat`, { message, history });
  return res.data;
}

export async function autoPlaceElements(payload) {
  const res = await axios.post(`${API}/api/auto-place`, payload);
  return res.data;
}

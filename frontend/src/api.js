import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://safecrowd-ai.onrender.com";

export async function planEvent(payload) {
  const res = await axios.post(`${API_BASE_URL}/api/plan-event`, payload);
  return res.data;
}

export async function chatWithAI(message, history = []) {
  const res = await axios.post(`${API_BASE_URL}/api/chat`, { message, history });
  return res.data;
}

export async function autoPlaceElements(payload) {
  const res = await axios.post(`${API_BASE_URL}/api/auto-place`, payload);
  return res.data;
}

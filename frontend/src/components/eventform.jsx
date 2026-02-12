import { motion } from "framer-motion";

export default function EventForm() {
  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-5"
    >
      <Input placeholder="Event Name" />
      <Input placeholder="Location" />
      <Input type="date" />

      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="Attendees" />
        <Input placeholder="Capacity" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="Start Time" />
        <Input placeholder="End Time" />
      </div>

      <textarea
        rows="3"
        placeholder="Special Instructions"
        className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                   text-white font-semibold shadow-lg hover:shadow-xl transition"
      >
        Analyze Event
      </motion.button>
    </motion.form>
  );
}

/* Reusable Input */
function Input({ placeholder, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3
                 text-slate-900 placeholder-slate-400
                 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  );
}

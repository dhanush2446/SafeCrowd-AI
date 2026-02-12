import { motion } from "framer-motion";

function formatBold(text) {
  if (!text) return "";

  // Convert **text** → <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export default function Alerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <p className="text-gray-500 italic text-[15.5px]">
        No critical alerts detected. Default safety protocols applied.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.05 }}
          className="border-l-4 border-orange-500 bg-orange-50 rounded-xl p-4 shadow-sm"
        >
          <p
            className="text-[15.5px] leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{
              __html: formatBold(alert),
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

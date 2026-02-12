export default function TrafficPlan({ plan }) {
  if (!plan) return null;

  return (
    <div className="prose prose-orange max-w-none">
      <h3 className="text-xl font-semibold mb-4">
        AI-Generated Traffic & Safety Plan
      </h3>

      <div className="whitespace-pre-line text-[15.5px] leading-relaxed text-gray-800">
        {plan}
      </div>
    </div>
  );
}

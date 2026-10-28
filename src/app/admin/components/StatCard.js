import { ArrowUp, ArrowDown } from "lucide-react";

export default function StatCard({ label, value, change, icon: Icon, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 h-5 w-5 rounded bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="mt-3 h-7 w-32 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-28 rounded bg-slate-200" />
      </div>
    );
  }

  const hasChange = change !== undefined && change !== null && change !== "";
  const up = Number(change) >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="mb-3 text-orange-500" size={22} />
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>

      {hasChange && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
            up ? "text-green-600" : "text-red-500"
          }`}
        >
          {up ? (
            <ArrowUp size={12} strokeWidth={3} />
          ) : (
            <ArrowDown size={12} strokeWidth={3} />
          )}
          {Math.abs(Number(change))}%
          <span className="font-normal text-slate-500">vs last week</span>
        </p>
      )}
    </div>
  );
}

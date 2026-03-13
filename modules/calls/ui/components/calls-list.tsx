import { EmptyState } from "@/components/empty-state";
import { CallRow } from "../../server/create-call";
import { CallCard } from "./user-get-agent";

export function CallsList({ calls }: { calls: CallRow[] }) {
	if (calls.length === 0) return <EmptyState />;

	return (
		<div className="flex flex-col gap-3">
			<p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1">
				{calls.length} {calls.length === 1 ? "Session" : "Sessions"}
			</p>
			{/* 2 column grid on sm+, single on mobile */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{calls.map((call) => (
					<CallCard key={call.id} call={call} />
				))}
			</div>
		</div>
	);
}

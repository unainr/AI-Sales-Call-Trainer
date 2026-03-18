// app/dashboard/page.tsx
import { SalesAgentByUser } from "@/modules/calls/server/create-call";
import { CallsList } from "@/modules/calls/ui/components/calls-list";
import { getUserUsage } from "@/modules/pricing/server/pricing";
import { UsageCard } from "@/modules/pricing/ui/components/user-card";
import { auth } from "@clerk/nextjs/server";
import { PlusIcon, MicIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
	const { userId } = await auth();
	if (!userId) redirect("/sign-in");

	const [result, usage] = await Promise.all([
		SalesAgentByUser(),
		getUserUsage(),
	]);

	if (!result || "error" in result) redirect("/sign-in");

	const calls = result.data;

	return (
		<main className="min-h-screen py-14">
			{/* ── Full-width Banner ── */}
			<div
				className="relative overflow-hidden px-6 pt-10 pb-8"
				style={{
					background:
						"linear-gradient(135deg,#1a0505 0%,#3b0a0a 50%,#1a0808 100%)",
				}}>
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						backgroundImage:
							"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
						backgroundSize: "36px 36px",
					}}
				/>
				<div
					className="absolute -top-14 -right-14 w-52 h-52 rounded-full pointer-events-none"
					style={{
						background:
							"radial-gradient(circle,rgba(239,68,68,.45),transparent 70%)",
					}}
				/>
				<div
					className="absolute -bottom-10 left-1/3 w-64 h-40 rounded-full pointer-events-none"
					style={{
						background:
							"radial-gradient(circle,rgba(220,38,38,.2),transparent 70%)",
					}}
				/>
				<div
					className="absolute top-4 -left-10 w-44 h-44 rounded-full pointer-events-none"
					style={{
						background:
							"radial-gradient(circle,rgba(248,113,113,.15),transparent 70%)",
					}}
				/>

				<div className="relative z-10 max-w-4xl mx-auto flex items-center justify-between gap-4">
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-[.15em] text-white/35 mb-2">
							Sales Trainer
						</p>
						<h1
							className="text-[30px] text-white leading-tight mb-1"
							style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
							Dashboard
						</h1>
						<p className="text-[12px] text-white/35">
							Practice smarter. Close better.
						</p>
					</div>
					<Link
						href="/calls/new"
						className="flex items-center gap-1.5 px-4 py-2.5 rounded-[13px] text-[13px] font-semibold text-white shrink-0 transition-all hover:opacity-85 hover:-translate-y-px active:translate-y-0 bg-red-500 hover:bg-red-400"
						style={{ boxShadow: "0 4px 18px rgba(239,68,68,.35)" }}>
						<PlusIcon className="size-3.5" strokeWidth={2.5} />
						New Call
					</Link>
				</div>
			</div>

			{/* ── Page content ── */}
			<div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
				{/* ── Two col: usage card + quick stat ── */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<UsageCard usage={usage} />

					<div className="rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6 p-4 flex flex-col justify-between gap-4">
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-1.5 mb-1">
								<MicIcon className="size-3 text-zinc-400" />
								<p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
									Sessions
								</p>
							</div>
							<div className="flex items-end gap-2">
								<span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
									{calls.length}
								</span>
								<span className="text-[12px] text-zinc-400 dark:text-zinc-500 mb-0.5">
									total
								</span>
							</div>
							<p className="text-[11px] text-zinc-400 dark:text-zinc-500">
								{calls.filter((c) => c.status === "completed").length} completed
								{" · "}
								{calls.filter((c) => c.status === "pending").length} pending
							</p>
						</div>

						<div className="h-px bg-zinc-100 dark:bg-zinc-800" />

						<Link
							href="/pricing"
							className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group">
							View pricing &amp; plans
							<span className="size-5 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-500/10 transition-colors">
								<PlusIcon className="size-3 text-zinc-400 group-hover:text-red-500 transition-colors" />
							</span>
						</Link>
					</div>
				</div>

				{/* ── Calls list ── */}
				<CallsList calls={calls} />
			</div>
		</main>
	);
};

export default DashboardPage;

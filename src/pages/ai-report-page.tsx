import { useState } from "react";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import { formatINR } from "@/data";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	BrainCircuitIcon,
	SparklesIcon,
	LoaderIcon,
	AlertTriangleIcon,
} from "lucide-react";

export function AIReportPage() {
	const { tenants, rentRecords, maintenance, expenses } = usePG();
	const { toast } = useToast();
	const [report, setReport] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastGenerated, setLastGenerated] = useState<string | null>(null);
	const [apiKey, setApiKey] = useState(
		() => sessionStorage.getItem("claude_api_key") || ""
	);

	const activeTenants = tenants.filter(
		(t) => t.status === "Active" || t.status === "Notice Period"
	);
	const vacantRooms = tenants.filter((t) => t.status === "Vacant").length;
	const totalCollected = rentRecords.reduce((s, r) => s + r.amountPaid, 0);
	const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
	const netProfit = totalCollected - totalExpenses;
	const occupancy = Math.round((activeTenants.length / tenants.length) * 100);

	const buildDataString = () => {
		const lines: string[] = [];
		lines.push("=== PG MONTHLY DATA — June 2026 ===");
		lines.push("");
		lines.push(`Total Rooms: ${tenants.length}`);
		lines.push(
			`Occupied: ${activeTenants.length}, Vacant: ${vacantRooms}, Occupancy: ${occupancy}%`
		);
		lines.push("");
		lines.push("--- Tenants ---");
		tenants.forEach((t) =>
			lines.push(
				`Room ${t.roomNo}: ${t.name} | Status: ${t.status} | Rent: ₹${t.rent}`
			)
		);
		lines.push("");
		lines.push("--- Rent Records ---");
		rentRecords.forEach((r) =>
			lines.push(
				`${r.tenantName} (${r.roomNo}): Due ₹${r.rentDue}, Paid ₹${r.amountPaid}, Status: ${r.status}`
			)
		);
		lines.push("");
		lines.push("--- Maintenance Issues ---");
		maintenance.forEach((m) =>
			lines.push(
				`Room ${m.roomNo}: ${m.issue} | Priority: ${m.priority} | Status: ${m.status}`
			)
		);
		lines.push("");
		lines.push("--- Expenses ---");
		expenses.forEach((e) =>
			lines.push(`${e.date}: ${e.category} — ${e.description} — ₹${e.amount}`)
		);
		lines.push("");
		lines.push(
			`Total Collected: ₹${totalCollected} | Total Expenses: ₹${totalExpenses} | Net Profit: ₹${netProfit}`
		);
		return lines.join("\n");
	};

	const generateReport = async () => {
		if (!apiKey) {
			setError("Please enter your Claude API key.");
			return;
		}
		sessionStorage.setItem("claude_api_key", apiKey);
		setLoading(true);
		setError(null);
		setReport(null);

		try {
			const dataString = buildDataString();
			const response = await fetch("https://api.anthropic.com/v1/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": apiKey,
					"anthropic-version": "2023-06-01",
					"anthropic-dangerous-direct-browser-access": "true",
				},
				body: JSON.stringify({
					model: "claude-sonnet-4-20250514",
					max_tokens: 1000,
					system:
						"You are a PG management assistant. Given monthly PG data, generate a clear actionable report for the owner. Include: 1) Financial summary 2) Occupancy status 3) Overdue tenants 4) Open maintenance issues 5) Action items for next month. Use ₹ for amounts. Plain English. Keep it concise.",
					messages: [{ role: "user", content: dataString }],
				}),
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => null);
				throw new Error(
					errData?.error?.message || `API error: ${response.status}`
				);
			}

			const data = await response.json();
			const text =
				data.content?.[0]?.text || "No response content received.";
			setReport(text);
			setLastGenerated(new Date().toLocaleString("en-IN"));
			toast("Report generated successfully", "success");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to generate report"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Title */}
			<div className="flex items-center gap-3">
				<BrainCircuitIcon className="size-6 text-muted-foreground" />
				<div>
					<h2 className="text-lg font-semibold">AI Monthly Report</h2>
					<p className="text-sm text-muted-foreground">
						Powered by Claude AI
					</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<SummaryCard label="Occupancy" value={`${occupancy}%`} />
				<SummaryCard
					label="Collected"
					value={formatINR(totalCollected)}
					color="text-emerald-500"
				/>
				<SummaryCard
					label="Expenses"
					value={formatINR(totalExpenses)}
					color="text-red-500"
				/>
				<SummaryCard
					label="Net Profit"
					value={formatINR(netProfit)}
					color="text-emerald-500"
				/>
			</div>

			{/* API Key Input */}
			<Card className="">
				<CardContent className="p-4">
					<label className="text-sm font-medium mb-2 block">
						Claude API Key
					</label>
					<Input
						type="password"
						placeholder="sk-ant-..."
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						className="max-w-md"
					/>
					<p className="text-xs text-muted-foreground mt-1">
						Stored in session only. Never sent anywhere except Anthropic's API.
					</p>
				</CardContent>
			</Card>

			{/* Generate Button */}
			<div className="flex flex-col items-center gap-4 py-4">
				<Button
					size="lg"
					onClick={generateReport}
					disabled={loading}
					className="gap-2 px-8"
				>
					{loading ? (
						<>
							<LoaderIcon className="size-4 animate-spin" />
							Generating...
						</>
					) : (
						<>
							<SparklesIcon className="size-4" />
							Generate Report
						</>
					)}
				</Button>
				{lastGenerated && (
					<p className="text-xs text-muted-foreground">
						Last generated: {lastGenerated}
					</p>
				)}
			</div>

			{/* Error */}
			{error && (
				<Card className="border-red-500/30 ">
					<CardContent className="flex items-center gap-3 p-4">
						<AlertTriangleIcon className="size-5 text-red-500 shrink-0" />
						<div className="flex-1">
							<p className="text-sm text-red-500">{error}</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={generateReport}
						>
							Retry
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Report */}
			{report && (
				<Card className="">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SparklesIcon className="size-4" />
							Monthly Report — June 2026
						</CardTitle>
						<CardDescription>
							AI-generated insights based on your PG data
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
							{report}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function SummaryCard({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color?: string;
}) {
	return (
		<Card className="">
			<CardContent className="p-4">
				<p className="text-xs text-muted-foreground">{label}</p>
				<p
					className={`font-mono text-xl font-semibold tabular-nums mt-1 ${color || ""}`}
				>
					{value}
				</p>
			</CardContent>
		</Card>
	);
}

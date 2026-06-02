import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import { formatINR, rentTrendData, occupancyData } from "@/data";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	UsersIcon,
	IndianRupeeIcon,
	AlertTriangleIcon,
	DoorOpenIcon,
	WrenchIcon,
	TrendingUpIcon,
} from "lucide-react";

// ─── Chart configs ────────────────────────────────────────────────────────────

const rentChartConfig = {
	expected: { label: "Expected", color: "var(--chart-1)" },
	collected: { label: "Collected", color: "var(--chart-2)" },
} satisfies ChartConfig;

const occupancyChartConfig = {
	occupancy: { label: "Occupancy %", color: "var(--chart-2)" },
} satisfies ChartConfig;

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardPage() {
	const { tenants, rentRecords, maintenance, expenses, markRentPaid } = usePG();
	const { toast } = useToast();


	// Computed metrics
	const activeTenants = tenants.filter(
		(t) => t.status === "Active" || t.status === "Notice Period"
	);
	const totalTenants = tenants.length;
	const vacantRooms = tenants.filter((t) => t.status === "Vacant").length;
	const totalRentExpected = rentRecords.reduce((s, r) => s + r.rentDue, 0);
	const totalRentCollected = rentRecords.reduce((s, r) => s + r.amountPaid, 0);
	const overdueTenants = rentRecords.filter((r) => r.status === "Overdue");
	const openMaintenance = maintenance.filter(
		(m) => m.status === "Open" || m.status === "In Progress"
	);
	const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
	const netProfit = totalRentCollected - totalExpenses;

	const recentPayments = rentRecords.filter((r) => r.status === "Paid");

	const handleMarkPaid = (r: (typeof rentRecords)[0]) => {
		const today = new Date().toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
		});
		markRentPaid(r.id, r.rentDue, today, "Cash");
		toast(`${r.tenantName}'s rent marked as paid`);
	};

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{/* ── Stat Cards ──────────────────────────────────────────── */}
			<StatCard
				title="Total Tenants"
				value={`${activeTenants.length} active`}
				subtitle={`${totalTenants} total rooms`}
				icon={<UsersIcon className="size-4" />}
			/>
			<StatCard
				title="Rent Collected"
				value={formatINR(totalRentCollected)}
				subtitle={`of ${formatINR(totalRentExpected)} expected`}
				icon={<IndianRupeeIcon className="size-4" />}
				valueColor="text-emerald-500"
			/>
			<StatCard
				title="Overdue Tenants"
				value={String(overdueTenants.length)}
				subtitle="pending follow-up"
				icon={<AlertTriangleIcon className="size-4" />}
				valueColor="text-red-500"
			/>
			<StatCard
				title="Vacant Rooms"
				value={String(vacantRooms)}
				subtitle={`of ${totalTenants} total`}
				icon={<DoorOpenIcon className="size-4" />}
				valueColor={vacantRooms > 0 ? "text-amber-500" : undefined}
			/>
			<StatCard
				title="Open Maintenance"
				value={String(openMaintenance.length)}
				subtitle="issues to resolve"
				icon={<WrenchIcon className="size-4" />}
			/>
			<StatCard
				title="Net Profit"
				value={formatINR(netProfit)}
				subtitle={`${formatINR(totalRentCollected)} - ${formatINR(totalExpenses)}`}
				icon={<TrendingUpIcon className="size-4" />}
				valueColor="text-emerald-500"
			/>

			{/* ── Rent Collection Trend ────────────────────────────────── */}
			<Card className="md:col-span-2 ">
				<CardHeader>
					<CardTitle>Rent Collection Trend</CardTitle>
					<CardDescription>Expected vs Collected — last 6 months</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer
						className="aspect-auto h-60 w-full"
						config={rentChartConfig}
					>
						<LineChart data={rentTrendData} margin={{ left: 12, right: 12 }}>
							<defs>
								<filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
									<feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="var(--color-collected)" floodOpacity="0.2" />
								</filter>
							</defs>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis
								axisLine={false}
								dataKey="month"
								tickLine={false}
								tickMargin={8}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
								width={50}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										indicator="line"
										formatter={(value) => formatINR(Number(value))}
									/>
								}
							/>
							<Line
								dataKey="expected"
								stroke="var(--color-expected)"
								strokeWidth={1.5}
								strokeDasharray="4 4"
								dot={false}
								name="Expected"
								opacity={0.4}
							/>
							<Line
								dataKey="collected"
								stroke="var(--color-collected)"
								strokeWidth={2.5}
								dot={{ fill: "var(--color-collected)", r: 4, strokeWidth: 0 }}
								activeDot={{ r: 6, strokeWidth: 0 }}
								filter="url(#lineGlow)"
								name="Collected"
							/>
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{/* ── Occupancy Rate ────────────────────────────────────── */}
			<Card className="">
				<CardHeader>
					<CardTitle>Occupancy Rate</CardTitle>
					<CardDescription>Last 6 months (%)</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer
						className="aspect-auto h-60 w-full"
						config={occupancyChartConfig}
					>
						<BarChart data={occupancyData} margin={{ left: 12, right: 12 }}>
							<defs>
								<linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.85} />
									<stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis
								axisLine={false}
								dataKey="month"
								tickLine={false}
								tickMargin={8}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								domain={[0, 100]}
								tickFormatter={(v) => `${v}%`}
								width={40}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										indicator="dashed"
										formatter={(value) => `${value}%`}
									/>
								}
							/>
							<Bar
								dataKey="occupancy"
								fill="url(#occupancyGrad)"
								radius={[6, 6, 0, 0]}
								name="Occupancy"
							/>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{/* ── Recent Payments ────────────────────────────────────── */}
			<Card className="md:col-span-2 ">
				<CardHeader>
					<CardTitle>Recent Payments</CardTitle>
					<CardDescription>Payments received this month</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">Tenant</TableHead>
								<TableHead>Room</TableHead>
								<TableHead className="text-end">Amount</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="pr-6">Mode</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{recentPayments.map((r) => (
								<TableRow key={r.id} className="hover:bg-transparent">
									<TableCell className="pl-6 font-medium">
										{r.tenantName}
									</TableCell>
									<TableCell>{r.roomNo}</TableCell>
									<TableCell className="text-end tabular-nums text-muted-foreground">
										{formatINR(r.amountPaid)}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{r.paymentDate}
									</TableCell>
									<TableCell className="pr-6">
										<Badge variant="secondary">{r.mode}</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* ── Overdue Tenants ────────────────────────────────────── */}
			<Card className="">
				<CardHeader>
					<CardTitle className="text-red-500">Overdue Tenants</CardTitle>
					<CardDescription>Immediate follow-up needed</CardDescription>
				</CardHeader>
				<CardContent>
					{overdueTenants.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No overdue tenants 🎉
						</p>
					) : (
						<div className="flex flex-col gap-3">
							{overdueTenants.map((r) => (
								<div
									key={r.id}
									className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3"
								>
									<div>
										<p className="font-medium text-sm">{r.tenantName}</p>
										<p className="text-xs text-muted-foreground">
											Room {r.roomNo} · {formatINR(r.rentDue)}
										</p>
									</div>
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleMarkPaid(r)}
									>
										Mark Paid
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
	title,
	value,
	subtitle,
	icon,
	valueColor,
}: {
	title: string;
	value: string;
	subtitle: string;
	icon: React.ReactNode;
	valueColor?: string;
}) {
	return (
		<Card className="">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardDescription className="text-sm">{title}</CardDescription>
				<span className="text-muted-foreground">{icon}</span>
			</CardHeader>
			<CardContent>
				<p className={`font-mono text-2xl font-semibold tabular-nums ${valueColor || ""}`}>
					{value}
				</p>
				<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
			</CardContent>
		</Card>
	);
}

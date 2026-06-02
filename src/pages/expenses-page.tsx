import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import { formatINR, expenseTrendData } from "@/data";
import type { ExpenseCategory } from "@/data";
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
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { PlusIcon, Trash2Icon } from "lucide-react";

const categories: ExpenseCategory[] = [
	"Electricity",
	"Water",
	"Repair",
	"Salary",
	"Internet",
	"Misc",
];

const chartConfig = {
	Electricity: { label: "Electricity", color: "var(--chart-1)" },
	Water: { label: "Water", color: "var(--chart-2)" },
	Repair: { label: "Repair", color: "var(--chart-3)" },
	Salary: { label: "Salary", color: "var(--chart-4)" },
	Internet: { label: "Internet", color: "var(--chart-5)" },
	Misc: { label: "Misc", color: "oklch(0.65 0 0)" },
} satisfies ChartConfig;

export function ExpensesPage() {
	const { expenses, rentRecords, addExpense, deleteExpense } = usePG();
	const { toast } = useToast();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [form, setForm] = useState({
		date: new Date().toISOString().split("T")[0],
		category: "Electricity" as ExpenseCategory,
		description: "",
		amount: 0,
	});

	const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
	const totalCollected = rentRecords.reduce((s, r) => s + r.amountPaid, 0);
	const netProfit = totalCollected - totalExpenses;

	const handleAdd = () => {
		if (!form.description || !form.amount) return;
		const dateStr = new Date(form.date).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
		addExpense({ ...form, date: dateStr });
		toast("Expense added");
		setSheetOpen(false);
		setForm({
			date: new Date().toISOString().split("T")[0],
			category: "Electricity",
			description: "",
			amount: 0,
		});
	};

	const handleDelete = (id: string) => {
		if (window.confirm("Delete this expense?")) {
			deleteExpense(id);
			toast("Expense deleted");
		}
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Summary */}
			<div className="grid grid-cols-3 gap-3">
				<Card className="">
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Total Expenses</p>
						<p className="font-mono text-xl font-semibold text-red-500 mt-1">
							{formatINR(totalExpenses)}
						</p>
					</CardContent>
				</Card>
				<Card className="">
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Rent Collected</p>
						<p className="font-mono text-xl font-semibold mt-1">
							{formatINR(totalCollected)}
						</p>
					</CardContent>
				</Card>
				<Card className="">
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Net Profit</p>
						<p className="font-mono text-xl font-semibold text-emerald-500 mt-1">
							{formatINR(netProfit)}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Chart + Table side by side on large screens */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Stacked Bar Chart */}
				<Card className="">
					<CardHeader>
						<CardTitle>Expense Breakdown</CardTitle>
						<CardDescription>Last 6 months by category</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							className="aspect-auto h-60 w-full"
							config={chartConfig}
						>
							<BarChart
								data={expenseTrendData}
								margin={{ left: 12, right: 12 }}
							>
								<CartesianGrid vertical={false} />
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
									width={45}
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent
											indicator="dashed"
											formatter={(value) => formatINR(Number(value))}
										/>
									}
								/>
								{categories.map((cat) => (
									<Bar
										key={cat}
										dataKey={cat}
										stackId="expenses"
										fill={`var(--color-${cat})`}
										radius={cat === "Misc" ? [4, 4, 0, 0] : undefined}
										name={cat}
									/>
								))}
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Expense Table */}
				<Card className="">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>June 2026 Expenses</CardTitle>
							<CardDescription>{expenses.length} entries</CardDescription>
						</div>
						<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
							<SheetTrigger asChild>
								<Button size="sm">
									<PlusIcon className="size-4 mr-1" />
									Add
								</Button>
							</SheetTrigger>
							<SheetContent>
								<SheetHeader>
									<SheetTitle>Add Expense</SheetTitle>
								</SheetHeader>
								<div className="flex flex-col gap-4 p-4">
									<div>
										<label className="text-sm font-medium mb-1 block">
											Date
										</label>
										<Input
											type="date"
											value={form.date}
											onChange={(e) =>
												setForm({ ...form, date: e.target.value })
											}
										/>
									</div>
									<div>
										<label className="text-sm font-medium mb-1 block">
											Category
										</label>
										<select
											className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
											value={form.category}
											onChange={(e) =>
												setForm({
													...form,
													category:
														e.target.value as ExpenseCategory,
												})
											}
										>
											{categories.map((c) => (
												<option key={c} value={c}>
													{c}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="text-sm font-medium mb-1 block">
											Description
										</label>
										<Input
											value={form.description}
											onChange={(e) =>
												setForm({
													...form,
													description: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<label className="text-sm font-medium mb-1 block">
											Amount (₹)
										</label>
										<Input
											type="number"
											value={form.amount}
											onChange={(e) =>
												setForm({
													...form,
													amount: parseInt(e.target.value) || 0,
												})
											}
										/>
									</div>
									<Button onClick={handleAdd} className="w-full mt-2">
										Add Expense
									</Button>
								</div>
							</SheetContent>
						</Sheet>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="pl-6">Date</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="text-end">Amount</TableHead>
									<TableHead className="pr-6 text-end">
										Delete
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{expenses.map((e) => (
									<TableRow
										key={e.id}
										className="hover:bg-transparent"
									>
										<TableCell className="pl-6 text-muted-foreground text-sm">
											{e.date}
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{e.category}</Badge>
										</TableCell>
										<TableCell className="text-sm">
											{e.description}
										</TableCell>
										<TableCell className="text-end tabular-nums text-muted-foreground">
											{formatINR(e.amount)}
										</TableCell>
										<TableCell className="pr-6 text-end">
											<Button
												size="icon-sm"
												variant="ghost"
												className="text-red-500 hover:text-red-600"
												onClick={() => handleDelete(e.id)}
											>
												<Trash2Icon className="size-3.5" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

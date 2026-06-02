import { useState } from "react";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import { formatINR } from "@/data";
import type { PaymentMode, RentStatus } from "@/data";
import {
	Card,
	CardContent,
} from "@/components/ui/card";
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
} from "@/components/ui/sheet";
import { DownloadIcon } from "lucide-react";

const statusColors: Record<RentStatus, string> = {
	Paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
	Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
	Overdue: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function RentPage() {
	const { rentRecords, markRentPaid } = usePG();
	const { toast } = useToast();
	const [payingId, setPayingId] = useState<string | null>(null);
	const [payForm, setPayForm] = useState({
		amount: 0,
		date: "",
		mode: "Cash" as PaymentMode,
		note: "",
	});

	const expected = rentRecords.reduce((s, r) => s + r.rentDue, 0);
	const collected = rentRecords.reduce((s, r) => s + r.amountPaid, 0);
	const pending = expected - collected;
	const overdue = rentRecords
		.filter((r) => r.status === "Overdue")
		.reduce((s, r) => s + r.rentDue, 0);

	const openMarkPaid = (id: string) => {
		const rec = rentRecords.find((r) => r.id === id);
		if (!rec) return;
		setPayingId(id);
		setPayForm({
			amount: rec.rentDue,
			date: new Date().toISOString().split("T")[0],
			mode: "Cash",
			note: "",
		});
	};

	const handlePay = () => {
		if (!payingId) return;
		const dateStr = new Date(payForm.date).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
		});
		markRentPaid(payingId, payForm.amount, dateStr, payForm.mode, payForm.note);
		toast("Payment recorded successfully");
		setPayingId(null);
	};

	const exportCSV = () => {
		const headers = "Tenant,Room,Rent Due,Paid,Date,Mode,Status\n";
		const rows = rentRecords
			.map(
				(r) =>
					`${r.tenantName},${r.roomNo},${r.rentDue},${r.amountPaid},${r.paymentDate || "-"},${r.mode || "-"},${r.status}`
			)
			.join("\n");
		const blob = new Blob([headers + rows], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "rent-june-2026.csv";
		a.click();
		URL.revokeObjectURL(url);
		toast("CSV exported");
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Summary bar */}
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<SummaryCard label="Expected" value={formatINR(expected)} />
				<SummaryCard
					label="Collected"
					value={formatINR(collected)}
					color="text-emerald-500"
				/>
				<SummaryCard
					label="Pending"
					value={formatINR(pending)}
					color="text-yellow-500"
				/>
				<SummaryCard
					label="Overdue"
					value={formatINR(overdue)}
					color="text-red-500"
				/>
			</div>

			{/* Controls */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Month:</span>
					<Badge variant="secondary">June 2026</Badge>
				</div>
				<Button size="sm" variant="outline" onClick={exportCSV}>
					<DownloadIcon className="size-4 mr-1" />
					Export CSV
				</Button>
			</div>

			{/* Table */}
			<Card className="">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">Tenant</TableHead>
								<TableHead>Room</TableHead>
								<TableHead className="text-end">Rent Due</TableHead>
								<TableHead className="text-end">Paid</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Mode</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="pr-6 text-end">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rentRecords.map((r) => (
								<TableRow key={r.id} className="hover:bg-transparent">
									<TableCell className="pl-6 font-medium">
										{r.tenantName}
									</TableCell>
									<TableCell>{r.roomNo}</TableCell>
									<TableCell className="text-end tabular-nums text-muted-foreground">
										{formatINR(r.rentDue)}
									</TableCell>
									<TableCell className="text-end tabular-nums text-muted-foreground">
										{r.amountPaid > 0 ? formatINR(r.amountPaid) : "—"}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{r.paymentDate || "—"}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{r.mode || "—"}
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={statusColors[r.status]}
										>
											{r.status}
										</Badge>
									</TableCell>
									<TableCell className="pr-6 text-end">
										{r.status !== "Paid" && (
											<Button
												size="sm"
												variant="outline"
												onClick={() => openMarkPaid(r.id)}
											>
												Mark Paid
											</Button>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Mark Paid Sheet */}
			<Sheet open={!!payingId} onOpenChange={(o) => !o && setPayingId(null)}>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Record Payment</SheetTitle>
					</SheetHeader>
					<div className="flex flex-col gap-4 p-4">
						<div>
							<label className="text-sm font-medium mb-1 block">
								Amount (₹)
							</label>
							<Input
								type="number"
								value={payForm.amount}
								onChange={(e) =>
									setPayForm({
										...payForm,
										amount: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
						<div>
							<label className="text-sm font-medium mb-1 block">Date</label>
							<Input
								type="date"
								value={payForm.date}
								onChange={(e) =>
									setPayForm({ ...payForm, date: e.target.value })
								}
							/>
						</div>
						<div>
							<label className="text-sm font-medium mb-1 block">Mode</label>
							<select
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
								value={payForm.mode}
								onChange={(e) =>
									setPayForm({
										...payForm,
										mode: e.target.value as PaymentMode,
									})
								}
							>
								<option value="Cash">Cash</option>
								<option value="UPI">UPI</option>
								<option value="Bank Transfer">Bank Transfer</option>
							</select>
						</div>
						<div>
							<label className="text-sm font-medium mb-1 block">
								Note (optional)
							</label>
							<Input
								value={payForm.note}
								onChange={(e) =>
									setPayForm({ ...payForm, note: e.target.value })
								}
							/>
						</div>
						<Button onClick={handlePay} className="w-full mt-2">
							Confirm Payment
						</Button>
					</div>
				</SheetContent>
			</Sheet>
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

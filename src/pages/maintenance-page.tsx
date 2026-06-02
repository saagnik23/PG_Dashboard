import { useState } from "react";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import type { MaintenancePriority, MaintenanceStatus } from "@/data";
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
import { Textarea } from "@/components/ui/textarea";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { PlusIcon } from "lucide-react";

const priorityColors: Record<MaintenancePriority, string> = {
	High: "bg-red-500/10 text-red-500 border-red-500/20",
	Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
	Low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const statusOptions: MaintenanceStatus[] = ["Open", "In Progress", "Resolved"];

export function MaintenancePage() {
	const { maintenance, addIssue, updateIssueStatus, tenants } = usePG();
	const { toast } = useToast();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [form, setForm] = useState({
		roomNo: "",
		issue: "",
		reportedBy: "",
		priority: "Medium" as MaintenancePriority,
	});

	const handleAdd = () => {
		if (!form.roomNo || !form.issue) return;
		const today = new Date().toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
		addIssue({ ...form, date: today });
		toast("Maintenance issue added");
		setSheetOpen(false);
		setForm({ roomNo: "", issue: "", reportedBy: "", priority: "Medium" });
	};

	const handleStatusChange = (id: string, status: MaintenanceStatus) => {
		updateIssueStatus(id, status);
		toast(`Issue status updated to ${status}`);
	};

	// Get active tenant names for reportedBy dropdown
	const activeTenants = tenants.filter(
		(t) => t.status === "Active" || t.status === "Notice Period"
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">Maintenance Issues</h2>
					<p className="text-sm text-muted-foreground">
						{maintenance.filter((m) => m.status !== "Resolved").length} open
						issues
					</p>
				</div>
				<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
					<SheetTrigger asChild>
						<Button size="sm">
							<PlusIcon className="size-4 mr-1" />
							Add Issue
						</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Report Issue</SheetTitle>
						</SheetHeader>
						<div className="flex flex-col gap-4 p-4">
							<div>
								<label className="text-sm font-medium mb-1 block">
									Room No.
								</label>
								<select
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
									value={form.roomNo}
									onChange={(e) =>
										setForm({ ...form, roomNo: e.target.value })
									}
								>
									<option value="">Select room...</option>
									{activeTenants.map((t) => (
										<option key={t.id} value={t.roomNo}>
											{t.roomNo} — {t.name}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">
									Issue Description
								</label>
								<Textarea
									value={form.issue}
									onChange={(e) =>
										setForm({ ...form, issue: e.target.value })
									}
									rows={3}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">
									Reported By
								</label>
								<Input
									value={form.reportedBy}
									onChange={(e) =>
										setForm({ ...form, reportedBy: e.target.value })
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">
									Priority
								</label>
								<select
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
									value={form.priority}
									onChange={(e) =>
										setForm({
											...form,
											priority:
												e.target.value as MaintenancePriority,
										})
									}
								>
									<option value="High">High</option>
									<option value="Medium">Medium</option>
									<option value="Low">Low</option>
								</select>
							</div>
							<Button onClick={handleAdd} className="w-full mt-2">
								Submit Issue
							</Button>
						</div>
					</SheetContent>
				</Sheet>
			</div>

			<Card className="">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">Room</TableHead>
								<TableHead>Issue</TableHead>
								<TableHead>Reported By</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="pr-6">Update</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{maintenance.map((m) => (
								<TableRow key={m.id} className="hover:bg-transparent">
									<TableCell className="pl-6 font-medium">
										{m.roomNo}
									</TableCell>
									<TableCell className="max-w-[200px]">
										{m.issue}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{m.reportedBy}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{m.date}
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={priorityColors[m.priority]}
										>
											{m.priority}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant="secondary"
											className={
												m.status === "Resolved"
													? "bg-emerald-500/10 text-emerald-500"
													: m.status === "In Progress"
														? "bg-blue-500/10 text-blue-500"
														: ""
											}
										>
											{m.status}
										</Badge>
									</TableCell>
									<TableCell className="pr-6">
										<select
											className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
											value={m.status}
											onChange={(e) =>
												handleStatusChange(
													m.id,
													e.target.value as MaintenanceStatus
												)
											}
										>
											{statusOptions.map((s) => (
												<option key={s} value={s}>
													{s}
												</option>
											))}
										</select>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

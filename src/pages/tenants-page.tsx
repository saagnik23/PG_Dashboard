import { useState } from "react";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import { formatINR } from "@/data";
import type { TenantStatus } from "@/data";
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
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from "lucide-react";

const statusColors: Record<TenantStatus, string> = {
	Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
	"Notice Period": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
	Vacated: "bg-gray-500/10 text-gray-400 border-gray-500/20",
	Vacant: "bg-red-500/10 text-red-500 border-red-500/20",
};

const filterTabs: (TenantStatus | "All")[] = [
	"All",
	"Active",
	"Notice Period",
	"Vacated",
];

const defaultForm = {
	name: "",
	phone: "",
	roomNo: "",
	floor: 1,
	rent: 0,
	deposit: 0,
	moveInDate: "",
	idProofType: "Aadhaar",
	idProofNumber: "",
	status: "Active" as TenantStatus,
	notes: "",
};

export function TenantsPage() {
	const { tenants, addTenant, updateTenant, deleteTenant } = usePG();
	const { toast } = useToast();
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<TenantStatus | "All">("All");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [form, setForm] = useState(defaultForm);

	const filtered = tenants.filter((t) => {
		if (filter !== "All" && t.status !== filter) return false;
		if (
			search &&
			!t.name.toLowerCase().includes(search.toLowerCase()) &&
			!t.roomNo.includes(search)
		)
			return false;
		return true;
	});

	const openAdd = () => {
		setEditId(null);
		setForm(defaultForm);
		setSheetOpen(true);
	};

	const openEdit = (id: string) => {
		const t = tenants.find((x) => x.id === id);
		if (!t) return;
		setEditId(id);
		setForm({
			name: t.name,
			phone: t.phone,
			roomNo: t.roomNo,
			floor: t.floor,
			rent: t.rent,
			deposit: t.deposit,
			moveInDate: t.moveInDate,
			idProofType: t.idProofType || "Aadhaar",
			idProofNumber: t.idProofNumber || "",
			status: t.status,
			notes: t.notes || "",
		});
		setSheetOpen(true);
	};

	const handleSave = () => {
		if (!form.name || !form.roomNo) return;
		if (editId) {
			updateTenant(editId, { ...form });
			toast("Tenant updated successfully");
		} else {
			addTenant({ ...form });
			toast("Tenant added successfully");
		}
		setSheetOpen(false);
	};

	const handleDelete = (id: string) => {
		if (window.confirm("Mark this room as vacant?")) {
			deleteTenant(id);
			toast("Room marked as vacant");
		}
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Search + Filter + Add */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative max-w-sm flex-1">
					<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-9"
						placeholder="Search by name or room..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex gap-1 rounded-lg border p-1">
						{filterTabs.map((tab) => (
							<button
								key={tab}
								onClick={() => setFilter(tab)}
								className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
									filter === tab
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{tab}
							</button>
						))}
					</div>
					<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
						<SheetTrigger asChild>
							<Button size="sm" onClick={openAdd}>
								<PlusIcon className="size-4 mr-1" />
								Add Tenant
							</Button>
						</SheetTrigger>
						<SheetContent className="overflow-y-auto">
							<SheetHeader>
								<SheetTitle>
									{editId ? "Edit Tenant" : "Add Tenant"}
								</SheetTitle>
							</SheetHeader>
							<div className="flex flex-col gap-4 p-4">
								<FormField
									label="Name"
									value={form.name}
									onChange={(v) => setForm({ ...form, name: v })}
								/>
								<FormField
									label="Phone"
									value={form.phone}
									onChange={(v) => setForm({ ...form, phone: v })}
								/>
								<div className="grid grid-cols-2 gap-3">
									<FormField
										label="Room No."
										value={form.roomNo}
										onChange={(v) => setForm({ ...form, roomNo: v })}
									/>
									<FormField
										label="Floor"
										value={String(form.floor)}
										onChange={(v) =>
											setForm({ ...form, floor: parseInt(v) || 1 })
										}
									/>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<FormField
										label="Rent (₹)"
										value={String(form.rent)}
										onChange={(v) =>
											setForm({ ...form, rent: parseInt(v) || 0 })
										}
									/>
									<FormField
										label="Deposit (₹)"
										value={String(form.deposit)}
										onChange={(v) =>
											setForm({ ...form, deposit: parseInt(v) || 0 })
										}
									/>
								</div>
								<FormField
									label="Move-in Date"
									value={form.moveInDate}
									onChange={(v) => setForm({ ...form, moveInDate: v })}
									type="date"
								/>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="text-sm font-medium mb-1 block">
											ID Proof
										</label>
										<select
											className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
											value={form.idProofType}
											onChange={(e) =>
												setForm({ ...form, idProofType: e.target.value })
											}
										>
											<option value="Aadhaar">Aadhaar</option>
											<option value="PAN">PAN</option>
											<option value="Passport">Passport</option>
										</select>
									</div>
									<FormField
										label="ID Number"
										value={form.idProofNumber}
										onChange={(v) =>
											setForm({ ...form, idProofNumber: v })
										}
									/>
								</div>
								<div>
									<label className="text-sm font-medium mb-1 block">
										Status
									</label>
									<select
										className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
										value={form.status}
										onChange={(e) =>
											setForm({
												...form,
												status: e.target.value as TenantStatus,
											})
										}
									>
										<option value="Active">Active</option>
										<option value="Notice Period">Notice Period</option>
										<option value="Vacated">Vacated</option>
										<option value="Vacant">Vacant</option>
									</select>
								</div>
								<div>
									<label className="text-sm font-medium mb-1 block">
										Notes
									</label>
									<Textarea
										value={form.notes}
										onChange={(e) =>
											setForm({ ...form, notes: e.target.value })
										}
										rows={3}
									/>
								</div>
								<Button onClick={handleSave} className="w-full mt-2">
									{editId ? "Update Tenant" : "Add Tenant"}
								</Button>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Table */}
			<Card className="">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">Room</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Move-in</TableHead>
								<TableHead className="text-end">Rent</TableHead>
								<TableHead className="text-end">Deposit</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="pr-6 text-end">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.map((t) => (
								<TableRow key={t.id} className="hover:bg-transparent">
									<TableCell className="pl-6 font-medium">
										{t.roomNo}
									</TableCell>
									<TableCell>{t.name}</TableCell>
									<TableCell className="text-muted-foreground text-sm tabular-nums">
										{t.phone || "—"}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{t.moveInDate || "—"}
									</TableCell>
									<TableCell className="text-end tabular-nums text-muted-foreground">
										{t.rent ? formatINR(t.rent) : "—"}
									</TableCell>
									<TableCell className="text-end tabular-nums text-muted-foreground">
										{t.deposit ? formatINR(t.deposit) : "—"}
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={statusColors[t.status]}
										>
											{t.status}
										</Badge>
									</TableCell>
									<TableCell className="pr-6 text-end">
										{t.status !== "Vacant" && (
											<div className="flex justify-end gap-1">
												<Button
													size="icon-sm"
													variant="ghost"
													onClick={() => openEdit(t.id)}
												>
													<PencilIcon className="size-3.5" />
												</Button>
												<Button
													size="icon-sm"
													variant="ghost"
													className="text-red-500 hover:text-red-600"
													onClick={() => handleDelete(t.id)}
												>
													<Trash2Icon className="size-3.5" />
												</Button>
											</div>
										)}
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

function FormField({
	label,
	value,
	onChange,
	type = "text",
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	type?: string;
}) {
	return (
		<div>
			<label className="text-sm font-medium mb-1 block">{label}</label>
			<Input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}

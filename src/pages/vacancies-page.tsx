import { useState } from "react";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import { formatINR } from "@/data";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { UserPlusIcon } from "lucide-react";

export function VacanciesPage() {
	const { tenants, markRoomFilled } = usePG();
	const { toast } = useToast();
	const [fillRoom, setFillRoom] = useState<string | null>(null);
	const [form, setForm] = useState({
		name: "",
		phone: "",
		rent: 0,
		deposit: 0,
		moveInDate: "",
	});

	const occupied = tenants.filter(
		(t) => t.status === "Active" || t.status === "Notice Period"
	).length;
	const vacant = tenants.filter((t) => t.status === "Vacant").length;
	const total = tenants.length;
	const occupancyPct = Math.round((occupied / total) * 100);

	const handleFill = () => {
		if (!fillRoom || !form.name) return;
		const room = tenants.find((t) => t.roomNo === fillRoom);
		if (!room) return;
		markRoomFilled(fillRoom, {
			...room,
			name: form.name,
			phone: form.phone,
			rent: form.rent,
			deposit: form.deposit,
			moveInDate: form.moveInDate,
			status: "Active",
		});
		toast(`Room ${fillRoom} marked as filled`);
		setFillRoom(null);
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Summary */}
			<div className="grid grid-cols-3 gap-3">
				<Card className="">
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Occupied</p>
						<p className="font-mono text-xl font-semibold mt-1">
							{occupied}/{total}
						</p>
					</CardContent>
				</Card>
				<Card className="">
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Vacant</p>
						<p className="font-mono text-xl font-semibold text-red-500 mt-1">
							{vacant}
						</p>
					</CardContent>
				</Card>
				<Card className="">
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground">Occupancy</p>
						<p className="font-mono text-xl font-semibold text-emerald-500 mt-1">
							{occupancyPct}%
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Room Grid */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{tenants.map((t) => (
					<Card
						key={t.id}
						className={cn(
							" transition-colors",
							t.status === "Vacant" && "border-red-500/40",
							t.status === "Notice Period" && "border-yellow-500/40",
							t.status === "Active" && "border-emerald-500/20"
						)}
					>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base">Room {t.roomNo}</CardTitle>
								<Badge
									variant="outline"
									className={cn(
										t.status === "Active" &&
											"bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
										t.status === "Vacant" &&
											"bg-red-500/10 text-red-500 border-red-500/20",
										t.status === "Notice Period" &&
											"bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
									)}
								>
									{t.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							{t.status === "Vacant" ? (
								<div>
									<p className="text-sm text-muted-foreground mb-3">
										Currently vacant
									</p>
									<Button
										size="sm"
										variant="outline"
										className="w-full"
										onClick={() => {
											setFillRoom(t.roomNo);
											setForm({
												name: "",
												phone: "",
												rent: 0,
												deposit: 0,
												moveInDate: new Date()
													.toISOString()
													.split("T")[0],
											});
										}}
									>
										<UserPlusIcon className="size-4 mr-1" />
										Mark as Filled
									</Button>
								</div>
							) : (
								<div className="flex flex-col gap-1">
									<p className="font-medium text-sm">{t.name}</p>
									<p className="text-xs text-muted-foreground">
										Move-in: {t.moveInDate}
									</p>
									<p className="text-xs text-muted-foreground">
										Rent: {formatINR(t.rent)}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Fill Room Sheet */}
			<Sheet
				open={!!fillRoom}
				onOpenChange={(o) => !o && setFillRoom(null)}
			>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Fill Room {fillRoom}</SheetTitle>
					</SheetHeader>
					<div className="flex flex-col gap-4 p-4">
						<div>
							<label className="text-sm font-medium mb-1 block">
								Tenant Name
							</label>
							<Input
								value={form.name}
								onChange={(e) =>
									setForm({ ...form, name: e.target.value })
								}
							/>
						</div>
						<div>
							<label className="text-sm font-medium mb-1 block">Phone</label>
							<Input
								value={form.phone}
								onChange={(e) =>
									setForm({ ...form, phone: e.target.value })
								}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="text-sm font-medium mb-1 block">
									Rent (₹)
								</label>
								<Input
									type="number"
									value={form.rent}
									onChange={(e) =>
										setForm({
											...form,
											rent: parseInt(e.target.value) || 0,
										})
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">
									Deposit (₹)
								</label>
								<Input
									type="number"
									value={form.deposit}
									onChange={(e) =>
										setForm({
											...form,
											deposit: parseInt(e.target.value) || 0,
										})
									}
								/>
							</div>
						</div>
						<div>
							<label className="text-sm font-medium mb-1 block">
								Move-in Date
							</label>
							<Input
								type="date"
								value={form.moveInDate}
								onChange={(e) =>
									setForm({ ...form, moveInDate: e.target.value })
								}
							/>
						</div>
						<Button onClick={handleFill} className="w-full mt-2">
							Confirm
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}

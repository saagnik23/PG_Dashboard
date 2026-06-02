import { useState, useEffect } from "react";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import type { PGSettings } from "@/data";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsIcon, SaveIcon } from "lucide-react";

export function SettingsPage() {
	const { settings, updateSettings } = usePG();
	const { toast } = useToast();
	const [form, setForm] = useState<PGSettings>(settings);

	// Sync form when settings change from outside
	useEffect(() => {
		setForm(settings);
	}, [settings]);

	const handleSave = () => {
		updateSettings(form);
		toast("Settings saved successfully");
	};

	return (
		<div className="flex flex-col gap-6 max-w-2xl">
			<div className="flex items-center gap-3">
				<SettingsIcon className="size-5 text-muted-foreground" />
				<div>
					<h2 className="text-lg font-semibold">PG Settings</h2>
					<p className="text-sm text-muted-foreground">
						Manage your PG configuration
					</p>
				</div>
			</div>

			<Card className="">
				<CardHeader>
					<CardTitle>General Information</CardTitle>
					<CardDescription>
						These details appear in the sidebar and reports
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<SettingsField
							label="PG Name"
							value={form.pgName}
							onChange={(v) => setForm({ ...form, pgName: v })}
						/>
						<SettingsField
							label="Owner Name"
							value={form.ownerName}
							onChange={(v) => setForm({ ...form, ownerName: v })}
						/>
						<SettingsField
							label="Address"
							value={form.address}
							onChange={(v) => setForm({ ...form, address: v })}
						/>
						<SettingsField
							label="Phone"
							value={form.phone}
							onChange={(v) => setForm({ ...form, phone: v })}
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="">
				<CardHeader>
					<CardTitle>Rent Configuration</CardTitle>
					<CardDescription>
						Controls when rent is considered overdue
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<SettingsField
							label="Total Rooms"
							value={String(form.totalRooms)}
							onChange={(v) =>
								setForm({ ...form, totalRooms: parseInt(v) || 0 })
							}
							type="number"
						/>
						<SettingsField
							label="Rent Due Date (day of month)"
							value={String(form.rentDueDate)}
							onChange={(v) =>
								setForm({ ...form, rentDueDate: parseInt(v) || 1 })
							}
							type="number"
						/>
						<SettingsField
							label="Overdue After (days)"
							value={String(form.overdueAfterDays)}
							onChange={(v) =>
								setForm({
									...form,
									overdueAfterDays: parseInt(v) || 10,
								})
							}
							type="number"
						/>
					</div>
				</CardContent>
			</Card>

			<Button onClick={handleSave} className="w-full gap-2">
				<SaveIcon className="size-4" />
				Save Settings
			</Button>
		</div>
	);
}

function SettingsField({
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

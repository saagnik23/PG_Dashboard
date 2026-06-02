import { useState } from "react";
import { usePG } from "@/pg-context";
import { useToast } from "@/components/toast";
import type { NoticePriority } from "@/data";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { PlusIcon, Trash2Icon, MegaphoneIcon } from "lucide-react";

const borderColors: Record<NoticePriority, string> = {
	Info: "border-l-blue-500",
	Important: "border-l-yellow-500",
	Urgent: "border-l-red-500",
};

const badgeColors: Record<NoticePriority, string> = {
	Info: "text-blue-500",
	Important: "text-yellow-500",
	Urgent: "text-red-500",
};

export function NoticeBoardPage() {
	const { notices, addNotice, deleteNotice } = usePG();
	const { toast } = useToast();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [form, setForm] = useState({
		title: "",
		message: "",
		priority: "Info" as NoticePriority,
	});

	const handleAdd = () => {
		if (!form.title || !form.message) return;
		addNotice(form);
		toast("Notice posted");
		setSheetOpen(false);
		setForm({ title: "", message: "", priority: "Info" });
	};

	const handleDelete = (id: string) => {
		if (window.confirm("Delete this notice?")) {
			deleteNotice(id);
			toast("Notice deleted");
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<MegaphoneIcon className="size-5 text-muted-foreground" />
					<div>
						<h2 className="text-lg font-semibold">Notice Board</h2>
						<p className="text-sm text-muted-foreground">
							{notices.length} notices posted
						</p>
					</div>
				</div>
				<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
					<SheetTrigger asChild>
						<Button size="sm">
							<PlusIcon className="size-4 mr-1" />
							Add Notice
						</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Post Notice</SheetTitle>
						</SheetHeader>
						<div className="flex flex-col gap-4 p-4">
							<div>
								<label className="text-sm font-medium mb-1 block">
									Title
								</label>
								<Input
									value={form.title}
									onChange={(e) =>
										setForm({ ...form, title: e.target.value })
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">
									Message
								</label>
								<Textarea
									value={form.message}
									onChange={(e) =>
										setForm({ ...form, message: e.target.value })
									}
									rows={4}
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
											priority: e.target.value as NoticePriority,
										})
									}
								>
									<option value="Info">Info</option>
									<option value="Important">Important</option>
									<option value="Urgent">Urgent</option>
								</select>
							</div>
							<Button onClick={handleAdd} className="w-full mt-2">
								Post Notice
							</Button>
						</div>
					</SheetContent>
				</Sheet>
			</div>

			{notices.length === 0 ? (
				<Card className="">
					<CardContent className="p-8 text-center">
						<p className="text-muted-foreground">No notices yet.</p>
					</CardContent>
				</Card>
			) : (
				<div className="flex flex-col gap-3">
					{notices.map((n) => (
						<Card
							key={n.id}
							className={cn(
								"border-l-4 ",
								borderColors[n.priority]
							)}
						>
							<CardHeader className="flex flex-row items-start justify-between pb-2">
								<div>
									<CardTitle className="text-base">{n.title}</CardTitle>
									<p
										className={cn(
											"text-xs font-medium mt-0.5",
											badgeColors[n.priority]
										)}
									>
										{n.priority} · {n.date}
									</p>
								</div>
								<Button
									size="icon-sm"
									variant="ghost"
									className="text-red-500 hover:text-red-600"
									onClick={() => handleDelete(n.id)}
								>
									<Trash2Icon className="size-3.5" />
								</Button>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									{n.message}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

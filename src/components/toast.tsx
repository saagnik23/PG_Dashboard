import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

type Toast = {
	id: string;
	message: string;
	type: "success" | "error" | "info";
};

type ToastContextValue = {
	toast: (message: string, type?: Toast["type"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used inside ToastProvider");
	return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback(
		(message: string, type: Toast["type"] = "success") => {
			const id = `toast-${Date.now()}`;
			setToasts((prev) => [...prev, { id, message, type }]);
		},
		[]
	);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ toast: addToast }}>
			{children}
			<div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
				{toasts.map((t) => (
					<ToastItem key={t.id} toast={t} onDismiss={removeToast} />
				))}
			</div>
		</ToastContext.Provider>
	);
}

function ToastItem({
	toast,
	onDismiss,
}: {
	toast: Toast;
	onDismiss: (id: string) => void;
}) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		// Trigger enter animation
		requestAnimationFrame(() => setVisible(true));
		const timer = setTimeout(() => {
			setVisible(false);
			setTimeout(() => onDismiss(toast.id), 300);
		}, 3000);
		return () => clearTimeout(timer);
	}, [toast.id, onDismiss]);

	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm shadow-lg transition-all duration-300",
				visible
					? "translate-y-0 opacity-100"
					: "translate-y-2 opacity-0",
				toast.type === "success" && "border-emerald-500/30",
				toast.type === "error" && "border-red-500/30",
				toast.type === "info" && "border-blue-500/30"
			)}
		>
			<span
				className={cn(
					"size-2 rounded-full shrink-0",
					toast.type === "success" && "bg-emerald-500",
					toast.type === "error" && "bg-red-500",
					toast.type === "info" && "bg-blue-500"
				)}
			/>
			<span className="text-foreground">{toast.message}</span>
			<button
				onClick={() => {
					setVisible(false);
					setTimeout(() => onDismiss(toast.id), 300);
				}}
				className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
			>
				<XIcon className="size-3.5" />
			</button>
		</div>
	);
}

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react";
import type {
	Tenant,
	RentRecord,
	MaintenanceIssue,
	Expense,
	Notice,
	PGSettings,
	PaymentMode,
	MaintenanceStatus,
	ExpenseCategory,
	NoticePriority,
	MaintenancePriority,
	TenantStatus,
} from "@/data";
import {
	seedTenants,
	seedRentRecords,
	seedMaintenance,
	seedExpenses,
	seedNotices,
	defaultSettings,
	uid,
} from "@/data";

// ─── Context Shape ───────────────────────────────────────────────────────────

type PGContextValue = {
	// State
	tenants: Tenant[];
	rentRecords: RentRecord[];
	maintenance: MaintenanceIssue[];
	expenses: Expense[];
	notices: Notice[];
	settings: PGSettings;
	currentPage: string;

	// Navigation
	setCurrentPage: (page: string) => void;

	// Tenant actions
	addTenant: (t: Omit<Tenant, "id">) => void;
	updateTenant: (id: string, t: Partial<Tenant>) => void;
	deleteTenant: (id: string) => void;

	// Rent actions
	markRentPaid: (
		id: string,
		amount: number,
		date: string,
		mode: PaymentMode,
		note?: string
	) => void;

	// Maintenance actions
	addIssue: (issue: {
		roomNo: string;
		issue: string;
		reportedBy: string;
		date: string;
		priority: MaintenancePriority;
	}) => void;
	updateIssueStatus: (id: string, status: MaintenanceStatus) => void;

	// Expense actions
	addExpense: (expense: {
		date: string;
		category: ExpenseCategory;
		description: string;
		amount: number;
	}) => void;
	deleteExpense: (id: string) => void;

	// Notice actions
	addNotice: (notice: {
		title: string;
		message: string;
		priority: NoticePriority;
	}) => void;
	deleteNotice: (id: string) => void;

	// Settings
	updateSettings: (s: PGSettings) => void;

	// Vacancy
	markRoomFilled: (roomNo: string, tenant: Omit<Tenant, "id">) => void;
};

const PGContext = createContext<PGContextValue | null>(null);

// ─── Helper: localStorage ────────────────────────────────────────────────────

function loadJSON<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function saveJSON(key: string, value: unknown) {
	localStorage.setItem(key, JSON.stringify(value));
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function PGProvider({ children }: { children: ReactNode }) {
	const [tenants, setTenants] = useState<Tenant[]>(() =>
		loadJSON("pg_tenants", seedTenants)
	);
	const [rentRecords, setRentRecords] = useState<RentRecord[]>(() =>
		loadJSON("pg_rent", seedRentRecords)
	);
	const [maintenance, setMaintenance] = useState<MaintenanceIssue[]>(() =>
		loadJSON("pg_maintenance", seedMaintenance)
	);
	const [expenses, setExpenses] = useState<Expense[]>(() =>
		loadJSON("pg_expenses", seedExpenses)
	);
	const [notices, setNotices] = useState<Notice[]>(() =>
		loadJSON("pg_notices", seedNotices)
	);
	const [settings, setSettings] = useState<PGSettings>(() =>
		loadJSON("pg_settings", defaultSettings)
	);
	const [currentPage, setCurrentPage] = useState(() => {
		const hash = window.location.hash.replace("#/", "") || "dashboard";
		return hash;
	});

	// Persist to localStorage on changes
	useEffect(() => saveJSON("pg_tenants", tenants), [tenants]);
	useEffect(() => saveJSON("pg_rent", rentRecords), [rentRecords]);
	useEffect(() => saveJSON("pg_maintenance", maintenance), [maintenance]);
	useEffect(() => saveJSON("pg_expenses", expenses), [expenses]);
	useEffect(() => saveJSON("pg_notices", notices), [notices]);
	useEffect(() => saveJSON("pg_settings", settings), [settings]);

	// Listen to hash changes
	useEffect(() => {
		const onHash = () => {
			const hash = window.location.hash.replace("#/", "") || "dashboard";
			setCurrentPage(hash);
		};
		window.addEventListener("hashchange", onHash);
		return () => window.removeEventListener("hashchange", onHash);
	}, []);

	const navigate = useCallback((page: string) => {
		window.location.hash = `#/${page}`;
		setCurrentPage(page);
	}, []);

	// ─── Actions ───────────────────────────────────────────────────────────────

	const addTenant = useCallback((t: Omit<Tenant, "id">) => {
		setTenants((prev) => [...prev, { ...t, id: uid() }]);
	}, []);

	const updateTenant = useCallback((id: string, updates: Partial<Tenant>) => {
		setTenants((prev) =>
			prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
		);
	}, []);

	const deleteTenant = useCallback((id: string) => {
		setTenants((prev) => {
			const tenant = prev.find((t) => t.id === id);
			if (!tenant) return prev;
			// Mark room as vacant instead of removing
			return prev.map((t) =>
				t.id === id
					? {
							...t,
							name: "Vacant",
							phone: "",
							moveInDate: "",
							rent: 0,
							deposit: 0,
							status: "Vacant" as TenantStatus,
							notes: "",
						}
					: t
			);
		});
	}, []);

	const markRentPaid = useCallback(
		(
			id: string,
			amount: number,
			date: string,
			mode: PaymentMode,
			note?: string
		) => {
			setRentRecords((prev) =>
				prev.map((r) =>
					r.id === id
						? {
								...r,
								amountPaid: amount,
								paymentDate: date,
								mode,
								status: "Paid" as const,
								note: note || r.note,
							}
						: r
				)
			);
		},
		[]
	);

	const addIssue = useCallback(
		(issue: {
			roomNo: string;
			issue: string;
			reportedBy: string;
			date: string;
			priority: MaintenancePriority;
		}) => {
			setMaintenance((prev) => [
				...prev,
				{ ...issue, id: uid(), status: "Open" as MaintenanceStatus },
			]);
		},
		[]
	);

	const updateIssueStatus = useCallback(
		(id: string, status: MaintenanceStatus) => {
			setMaintenance((prev) =>
				prev.map((i) => (i.id === id ? { ...i, status } : i))
			);
		},
		[]
	);

	const addExpense = useCallback(
		(expense: {
			date: string;
			category: ExpenseCategory;
			description: string;
			amount: number;
		}) => {
			setExpenses((prev) => [...prev, { ...expense, id: uid() }]);
		},
		[]
	);

	const deleteExpense = useCallback((id: string) => {
		setExpenses((prev) => prev.filter((e) => e.id !== id));
	}, []);

	const addNotice = useCallback(
		(notice: { title: string; message: string; priority: NoticePriority }) => {
			const today = new Date().toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			});
			setNotices((prev) => [
				...prev,
				{ ...notice, id: uid(), date: today },
			]);
		},
		[]
	);

	const deleteNotice = useCallback((id: string) => {
		setNotices((prev) => prev.filter((n) => n.id !== id));
	}, []);

	const updateSettings = useCallback((s: PGSettings) => {
		setSettings(s);
	}, []);

	const markRoomFilled = useCallback(
		(roomNo: string, tenant: Omit<Tenant, "id">) => {
			setTenants((prev) =>
				prev.map((t) =>
					t.roomNo === roomNo ? { ...t, ...tenant, id: t.id } : t
				)
			);
		},
		[]
	);

	return (
		<PGContext.Provider
			value={{
				tenants,
				rentRecords,
				maintenance,
				expenses,
				notices,
				settings,
				currentPage,
				setCurrentPage: navigate,
				addTenant,
				updateTenant,
				deleteTenant,
				markRentPaid,
				addIssue,
				updateIssueStatus,
				addExpense,
				deleteExpense,
				addNotice,
				deleteNotice,
				updateSettings,
				markRoomFilled,
			}}
		>
			{children}
		</PGContext.Provider>
	);
}

export function usePG() {
	const ctx = useContext(PGContext);
	if (!ctx) throw new Error("usePG must be used inside PGProvider");
	return ctx;
}

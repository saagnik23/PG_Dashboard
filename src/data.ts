// ─── Types ───────────────────────────────────────────────────────────────────

export type TenantStatus = "Active" | "Notice Period" | "Vacated" | "Vacant";

export type Tenant = {
	id: string;
	roomNo: string;
	name: string;
	phone: string;
	moveInDate: string; // ISO date
	rent: number;
	deposit: number;
	status: TenantStatus;
	floor: number;
	idProofType?: string;
	idProofNumber?: string;
	notes?: string;
};

export type PaymentMode = "UPI" | "Cash" | "Bank Transfer";
export type RentStatus = "Paid" | "Pending" | "Overdue";

export type RentRecord = {
	id: string;
	tenantId: string;
	tenantName: string;
	roomNo: string;
	month: string; // e.g. "June 2026"
	rentDue: number;
	amountPaid: number;
	paymentDate: string;
	mode: PaymentMode | "";
	status: RentStatus;
	note?: string;
};

export type MaintenancePriority = "High" | "Medium" | "Low";
export type MaintenanceStatus = "Open" | "In Progress" | "Resolved";

export type MaintenanceIssue = {
	id: string;
	roomNo: string;
	issue: string;
	reportedBy: string;
	date: string;
	priority: MaintenancePriority;
	status: MaintenanceStatus;
};

export type ExpenseCategory =
	| "Electricity"
	| "Water"
	| "Repair"
	| "Salary"
	| "Internet"
	| "Misc";

export type Expense = {
	id: string;
	date: string;
	category: ExpenseCategory;
	description: string;
	amount: number;
};

export type NoticePriority = "Info" | "Important" | "Urgent";

export type Notice = {
	id: string;
	title: string;
	message: string;
	date: string;
	priority: NoticePriority;
};

export type PGSettings = {
	pgName: string;
	ownerName: string;
	address: string;
	phone: string;
	totalRooms: number;
	rentDueDate: number;
	overdueAfterDays: number;
};

// ─── Seed Data ───────────────────────────────────────────────────────────────

export const defaultSettings: PGSettings = {
	pgName: "Sai Residency",
	ownerName: "Ramesh Kumar",
	address: "Koramangala, Bengaluru",
	phone: "9876543210",
	totalRooms: 12,
	rentDueDate: 1,
	overdueAfterDays: 10,
};

let _id = 0;
function uid() {
	return `id-${++_id}-${Date.now()}`;
}
export { uid };

export const seedTenants: Tenant[] = [
	{
		id: uid(),
		roomNo: "101",
		name: "Arjun Sharma",
		phone: "9876543210",
		moveInDate: "2025-01-15",
		rent: 8000,
		deposit: 16000,
		status: "Active",
		floor: 1,
	},
	{
		id: uid(),
		roomNo: "102",
		name: "Priya Nair",
		phone: "9845021345",
		moveInDate: "2025-03-01",
		rent: 8000,
		deposit: 16000,
		status: "Active",
		floor: 1,
	},
	{
		id: uid(),
		roomNo: "103",
		name: "Karthik Raju",
		phone: "9731245678",
		moveInDate: "2024-11-20",
		rent: 9000,
		deposit: 18000,
		status: "Active",
		floor: 1,
	},
	{
		id: uid(),
		roomNo: "104",
		name: "Sneha Patel",
		phone: "9654321098",
		moveInDate: "2025-02-10",
		rent: 8500,
		deposit: 17000,
		status: "Active",
		floor: 1,
	},
	{
		id: uid(),
		roomNo: "105",
		name: "Mohammed Irfan",
		phone: "9123456780",
		moveInDate: "2025-04-05",
		rent: 8000,
		deposit: 16000,
		status: "Active",
		floor: 1,
	},
	{
		id: uid(),
		roomNo: "201",
		name: "Deepa Krishnan",
		phone: "9900112233",
		moveInDate: "2024-10-01",
		rent: 9500,
		deposit: 19000,
		status: "Active",
		floor: 2,
	},
	{
		id: uid(),
		roomNo: "202",
		name: "Rahul Verma",
		phone: "9811223344",
		moveInDate: "2025-01-20",
		rent: 8000,
		deposit: 16000,
		status: "Notice Period",
		floor: 2,
	},
	{
		id: uid(),
		roomNo: "203",
		name: "Anjali Singh",
		phone: "9776543210",
		moveInDate: "2025-03-15",
		rent: 8500,
		deposit: 17000,
		status: "Active",
		floor: 2,
	},
	{
		id: uid(),
		roomNo: "204",
		name: "Suresh Babu",
		phone: "9654098765",
		moveInDate: "2024-12-01",
		rent: 9000,
		deposit: 18000,
		status: "Active",
		floor: 2,
	},
	{
		id: uid(),
		roomNo: "205",
		name: "Lakshmi Reddy",
		phone: "9543210987",
		moveInDate: "2025-05-01",
		rent: 8000,
		deposit: 16000,
		status: "Active",
		floor: 2,
	},
	{
		id: uid(),
		roomNo: "301",
		name: "Vacant",
		phone: "",
		moveInDate: "",
		rent: 0,
		deposit: 0,
		status: "Vacant",
		floor: 3,
	},
	{
		id: uid(),
		roomNo: "302",
		name: "Vacant",
		phone: "",
		moveInDate: "",
		rent: 0,
		deposit: 0,
		status: "Vacant",
		floor: 3,
	},
];

export const seedRentRecords: RentRecord[] = [
	{
		id: uid(),
		tenantId: "",
		tenantName: "Arjun Sharma",
		roomNo: "101",
		month: "June 2026",
		rentDue: 8000,
		amountPaid: 8000,
		paymentDate: "02 Jun",
		mode: "UPI",
		status: "Paid",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Priya Nair",
		roomNo: "102",
		month: "June 2026",
		rentDue: 8000,
		amountPaid: 0,
		paymentDate: "",
		mode: "",
		status: "Pending",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Karthik Raju",
		roomNo: "103",
		month: "June 2026",
		rentDue: 9000,
		amountPaid: 9000,
		paymentDate: "01 Jun",
		mode: "Cash",
		status: "Paid",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Sneha Patel",
		roomNo: "104",
		month: "June 2026",
		rentDue: 8500,
		amountPaid: 0,
		paymentDate: "",
		mode: "",
		status: "Pending",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Mohammed Irfan",
		roomNo: "105",
		month: "June 2026",
		rentDue: 8000,
		amountPaid: 0,
		paymentDate: "",
		mode: "",
		status: "Pending",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Deepa Krishnan",
		roomNo: "201",
		month: "June 2026",
		rentDue: 9500,
		amountPaid: 9500,
		paymentDate: "01 Jun",
		mode: "UPI",
		status: "Paid",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Rahul Verma",
		roomNo: "202",
		month: "June 2026",
		rentDue: 8000,
		amountPaid: 0,
		paymentDate: "",
		mode: "",
		status: "Overdue",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Anjali Singh",
		roomNo: "203",
		month: "June 2026",
		rentDue: 8500,
		amountPaid: 8500,
		paymentDate: "03 Jun",
		mode: "UPI",
		status: "Paid",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Suresh Babu",
		roomNo: "204",
		month: "June 2026",
		rentDue: 9000,
		amountPaid: 9000,
		paymentDate: "02 Jun",
		mode: "Bank Transfer",
		status: "Paid",
	},
	{
		id: uid(),
		tenantId: "",
		tenantName: "Lakshmi Reddy",
		roomNo: "205",
		month: "June 2026",
		rentDue: 8000,
		amountPaid: 0,
		paymentDate: "",
		mode: "",
		status: "Pending",
	},
];

export const seedMaintenance: MaintenanceIssue[] = [
	{
		id: uid(),
		roomNo: "103",
		issue: "AC not cooling",
		reportedBy: "Karthik Raju",
		date: "28 May 2026",
		priority: "High",
		status: "Open",
	},
	{
		id: uid(),
		roomNo: "201",
		issue: "Leaking tap",
		reportedBy: "Deepa Krishnan",
		date: "30 May 2026",
		priority: "Medium",
		status: "In Progress",
	},
	{
		id: uid(),
		roomNo: "105",
		issue: "WiFi slow",
		reportedBy: "Mohammed Irfan",
		date: "01 Jun 2026",
		priority: "Low",
		status: "Open",
	},
	{
		id: uid(),
		roomNo: "204",
		issue: "Door lock broken",
		reportedBy: "Suresh Babu",
		date: "25 May 2026",
		priority: "High",
		status: "Resolved",
	},
];

export const seedExpenses: Expense[] = [
	{
		id: uid(),
		date: "01 Jun 2026",
		category: "Electricity",
		description: "Monthly EB bill",
		amount: 4200,
	},
	{
		id: uid(),
		date: "01 Jun 2026",
		category: "Water",
		description: "Water board bill",
		amount: 800,
	},
	{
		id: uid(),
		date: "02 Jun 2026",
		category: "Repair",
		description: "Room 204 door lock fix",
		amount: 500,
	},
	{
		id: uid(),
		date: "01 Jun 2026",
		category: "Internet",
		description: "WiFi monthly bill",
		amount: 1200,
	},
	{
		id: uid(),
		date: "01 Jun 2026",
		category: "Salary",
		description: "Cleaning staff",
		amount: 3000,
	},
];

export const seedNotices: Notice[] = [
	{
		id: uid(),
		title: "Water Supply Off",
		message:
			"Water supply off on 5th June 10am–2pm for tank cleaning",
		date: "01 Jun 2026",
		priority: "Important",
	},
	{
		id: uid(),
		title: "Rent Reminder",
		message:
			"Rent due by 5th June. UPI: 9876500000@upi",
		date: "01 Jun 2026",
		priority: "Info",
	},
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format a number in Indian comma style with ₹ prefix.
 * e.g. 100000 → ₹1,00,000
 */
export function formatINR(amount: number): string {
	const formatted = amount.toLocaleString("en-IN");
	return `₹${formatted}`;
}

// Historical data for charts
export const rentTrendData = [
	{ month: "Jan", expected: 85000, collected: 82000 },
	{ month: "Feb", expected: 85000, collected: 79000 },
	{ month: "Mar", expected: 86000, collected: 84000 },
	{ month: "Apr", expected: 87000, collected: 85500 },
	{ month: "May", expected: 88000, collected: 86000 },
	{ month: "Jun", expected: 88000, collected: 72500 },
];

export const occupancyData = [
	{ month: "Jan", occupancy: 92 },
	{ month: "Feb", occupancy: 83 },
	{ month: "Mar", occupancy: 83 },
	{ month: "Apr", occupancy: 92 },
	{ month: "May", occupancy: 92 },
	{ month: "Jun", occupancy: 83 },
];

export const expenseTrendData = [
	{
		month: "Jan",
		Electricity: 3800,
		Water: 700,
		Repair: 1200,
		Salary: 3000,
		Internet: 1200,
		Misc: 300,
	},
	{
		month: "Feb",
		Electricity: 4000,
		Water: 750,
		Repair: 800,
		Salary: 3000,
		Internet: 1200,
		Misc: 0,
	},
	{
		month: "Mar",
		Electricity: 4200,
		Water: 800,
		Repair: 0,
		Salary: 3000,
		Internet: 1200,
		Misc: 500,
	},
	{
		month: "Apr",
		Electricity: 4500,
		Water: 800,
		Repair: 2000,
		Salary: 3000,
		Internet: 1200,
		Misc: 200,
	},
	{
		month: "May",
		Electricity: 4100,
		Water: 800,
		Repair: 600,
		Salary: 3000,
		Internet: 1200,
		Misc: 100,
	},
	{
		month: "Jun",
		Electricity: 4200,
		Water: 800,
		Repair: 500,
		Salary: 3000,
		Internet: 1200,
		Misc: 0,
	},
];

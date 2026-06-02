import type { ReactNode } from "react";
import {
	LayoutDashboardIcon,
	UsersIcon,
	IndianRupeeIcon,
	DoorOpenIcon,
	WrenchIcon,
	ReceiptIcon,
	BrainCircuitIcon,
	MegaphoneIcon,
	SettingsIcon,
} from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export function getNavGroups(currentPage: string): SidebarNavGroup[] {
	return [
		{
			label: "Overview",
			items: [
				{
					title: "Dashboard",
					path: "#/dashboard",
					icon: <LayoutDashboardIcon />,
					isActive: currentPage === "dashboard",
				},
			],
		},
		{
			label: "Manage",
			items: [
				{
					title: "Tenants",
					path: "#/tenants",
					icon: <UsersIcon />,
					isActive: currentPage === "tenants",
				},
				{
					title: "Rent",
					path: "#/rent",
					icon: <IndianRupeeIcon />,
					isActive: currentPage === "rent",
				},
				{
					title: "Vacancies",
					path: "#/vacancies",
					icon: <DoorOpenIcon />,
					isActive: currentPage === "vacancies",
				},
				{
					title: "Maintenance",
					path: "#/maintenance",
					icon: <WrenchIcon />,
					isActive: currentPage === "maintenance",
				},
			],
		},
		{
			label: "Finance",
			items: [
				{
					title: "Expenses",
					path: "#/expenses",
					icon: <ReceiptIcon />,
					isActive: currentPage === "expenses",
				},
				{
					title: "AI Report",
					path: "#/ai-report",
					icon: <BrainCircuitIcon />,
					isActive: currentPage === "ai-report",
				},
			],
		},
		{
			label: "PG",
			items: [
				{
					title: "Notice Board",
					path: "#/notice-board",
					icon: <MegaphoneIcon />,
					isActive: currentPage === "notice-board",
				},
				{
					title: "Settings",
					path: "#/settings",
					icon: <SettingsIcon />,
					isActive: currentPage === "settings",
				},
			],
		},
	];
}

export function getNavLinks(currentPage: string): SidebarNavItem[] {
	return getNavGroups(currentPage).flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	);
}

// Map page slug → display title
export const pageTitles: Record<string, string> = {
	dashboard: "Dashboard",
	tenants: "Tenants",
	rent: "Rent",
	vacancies: "Vacancies",
	maintenance: "Maintenance",
	expenses: "Expenses",
	"ai-report": "AI Report",
	"notice-board": "Notice Board",
	settings: "Settings",
};

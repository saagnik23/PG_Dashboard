import { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";
import { PGProvider, usePG } from "@/pg-context";
import { ToastProvider } from "@/components/toast";

// Pages
import { DashboardPage } from "@/pages/dashboard-page";
import { TenantsPage } from "@/pages/tenants-page";
import { RentPage } from "@/pages/rent-page";
import { VacanciesPage } from "@/pages/vacancies-page";
import { MaintenancePage } from "@/pages/maintenance-page";
import { ExpensesPage } from "@/pages/expenses-page";
import { AIReportPage } from "@/pages/ai-report-page";
import { NoticeBoardPage } from "@/pages/notice-board-page";
import { SettingsPage } from "@/pages/settings-page";

function PageRouter() {
	const { currentPage } = usePG();

	switch (currentPage) {
		case "tenants":
			return <TenantsPage />;
		case "rent":
			return <RentPage />;
		case "vacancies":
			return <VacanciesPage />;
		case "maintenance":
			return <MaintenancePage />;
		case "expenses":
			return <ExpensesPage />;
		case "ai-report":
			return <AIReportPage />;
		case "notice-board":
			return <NoticeBoardPage />;
		case "settings":
			return <SettingsPage />;
		case "dashboard":
		default:
			return <DashboardPage />;
	}
}

function Preloader({ fadeAway }: { fadeAway: boolean }) {
	return (
		<div
			className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f8fafc] transition-opacity duration-450 ease-in-out ${
				fadeAway ? "opacity-0 pointer-events-none" : "opacity-100"
			}`}
		>
			<div className="flex flex-col items-center gap-6">
				{/* Glowing Building Icon */}
				<div className="animate-pulse-glow flex items-center justify-center size-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-600">
					<svg
						className="size-8"
						fill="none"
						height="24"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						viewBox="0 0 24 24"
						width="24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M3 21h18" />
						<path d="M9 21V10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v11" />
						<path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
						<path d="M9 12h2" />
						<path d="M9 16h2" />
						<path d="M13 12h2" />
						<path d="M13 16h2" />
					</svg>
				</div>
				<div className="flex flex-col items-center gap-2">
					<h2 className="text-xs font-semibold tracking-widest text-slate-800 uppercase font-mono">
						SAI RESIDENCY
					</h2>
					<p className="text-xs text-slate-500 font-mono">
						PG Manager Dashboard
					</p>
				</div>
				{/* Progress Track */}
				<div className="w-48 h-0.75 bg-slate-200 rounded-full overflow-hidden relative">
					<div className="absolute inset-y-0 left-0 w-2/3 bg-indigo-500 rounded-full animate-linear-progress" />
				</div>
			</div>
		</div>
	);
}

function App() {
	const [loading, setLoading] = useState(true);
	const [fadeAway, setFadeAway] = useState(false);

	useEffect(() => {
		const fadeTimer = setTimeout(() => {
			setFadeAway(true);
		}, 900);

		const loadTimer = setTimeout(() => {
			setLoading(false);
		}, 1300);

		return () => {
			clearTimeout(fadeTimer);
			clearTimeout(loadTimer);
		};
	}, []);

	return (
		<PGProvider>
			<ToastProvider>
				<TooltipProvider>
					{loading && <Preloader fadeAway={fadeAway} />}
					<AppShell>
						<PageRouter />
					</AppShell>
				</TooltipProvider>
			</ToastProvider>
		</PGProvider>
	);
}

export default App;

import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Users, Flame, Rss } from "lucide-react";

interface NavLinkRenderProps {
	isActive: boolean;
	isPending: boolean;
}

const Layout: React.FC = () => {
	const linkClass = ({ isActive }: NavLinkRenderProps): string =>
		`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
			isActive
				? "bg-blue-600 text-white shadow-inner" 
				: "text-neutral-300 hover:bg-[#2a2a2a] hover:text-neutral-100"
		}`;

	return (
		<div className="min-h-screen bg-[#171717] text-neutral-200">
			<nav className="bg-[#1a1a1a] border-b border-[#2b2b2b] px-6 py-3 shadow-md sticky top-0 z-10">
				{" "}
				<div className="container mx-auto flex justify-between items-center">
					<div className="text-xl font-bold text-neutral-100">
						Social Analytics
					</div>
					<div className="flex items-center gap-3">
						<NavLink to="/" className={linkClass} end>
							<Users className="h-4 w-4" /> Top Users
						</NavLink>
						<NavLink to="/trending" className={linkClass}>
							<Flame className="h-4 w-4" /> Trending
						</NavLink>
						<NavLink to="/feed" className={linkClass}>
							<Rss className="h-4 w-4" /> Feed
						</NavLink>
					</div>
				</div>
			</nav>
			<main>
				<Outlet />
			</main>
			<footer className="text-center py-4 mt-10 text-xs text-neutral-600 border-t border-[#2b2b2b]">
				Social Media Analytics Demo - Made By Harshit Shukla (22053162)
			</footer>
		</div>
	);
};

export default Layout;

import React, { useState, useEffect, useCallback } from "react";
import { getTopUsers } from "../services/api";
import UserCard from "../components/UserCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Users } from "lucide-react";
import { User } from "../types"; 

const TopUsersPage: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getTopUsers();
			setUsers(data.users || []);
		} catch (err) {
			if (err instanceof Error) {
				setError(err);
			} else {
				setError(new Error("An unexpected error occurred"));
			}
			setUsers([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center gap-3 mb-8">
				<Users className="h-7 w-7 text-blue-400" />
				<h1 className="text-2xl font-bold text-neutral-100">
					Top Users by Posts
				</h1>
			</div>
			{loading && <LoadingSpinner message="Fetching top users..." />}
			{error && !loading && (
				<ErrorMessage error={error} onRetry={fetchData} />
			)}{" "}
			{/* Show error only when not loading */}
			{!loading && !error && (
				<>
					{users.length === 0 ? (
						<p className="text-center text-neutral-500 mt-10">
							No user data available.
						</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{/* Key should be unique, user.name might not be if API changes */}
							{/* Using index as fallback if names could collide, but prefer unique ID if available */}
							{users.map((user, index) => (
								<UserCard
									key={`${user.name}-${index}`}
									user={user}
								/>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default TopUsersPage;

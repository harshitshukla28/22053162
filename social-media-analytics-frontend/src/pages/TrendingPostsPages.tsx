import React, { useState, useEffect, useCallback } from "react";
import { getPosts } from "../services/api";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Flame } from "lucide-react";
import { Post } from "../types";

const TrendingPostsPage: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getPosts("popular");
			setPosts(data.posts || []);
		} catch (err) {
			if (err instanceof Error) {
				setError(err);
			} else {
				setError(new Error("An unexpected error occurred"));
			}
			setPosts([]);
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
				<Flame className="h-7 w-7 text-orange-500" />
				<h1 className="text-2xl font-bold text-neutral-100">
					Trending Posts (Most Comments)
				</h1>
			</div>

			{loading && <LoadingSpinner message="Fetching trending posts..." />}
			{error && !loading && (
				<ErrorMessage error={error} onRetry={fetchData} />
			)}

			{!loading && !error && (
				<>
					{posts.length === 0 ? (
						<p className="text-center text-neutral-500 mt-10">
							No trending posts found.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{posts.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default TrendingPostsPage;

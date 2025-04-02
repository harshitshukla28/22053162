import React, { useState, useEffect, useCallback, useRef } from "react";
import { getPosts } from "../services/api";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Rss } from "lucide-react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Post } from "../types";

const REFRESH_INTERVAL_MS = 4000;
const MAX_FEED_POSTS = 50;

const FeedPage: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [isFetchingUpdate, setIsFetchingUpdate] = useState<boolean>(false); 
	const intervalRef = useRef<number | null>(null);

	const fetchData = useCallback(
		async (isInitialLoad: boolean = false) => {
			if (isInitialLoad) {
				setLoading(true);
				setError(null);
			} else {
				if (isFetchingUpdate) return;
				setIsFetchingUpdate(true);
			}

			try {
				const data = await getPosts("latest");
				const newPostsBatch = data.posts || [];

				if (isInitialLoad) {
					setPosts(newPostsBatch);
					setError(null);
				} else if (newPostsBatch.length > 0) {
					setPosts((currentPosts) => {
						const existingIds = new Set(
							currentPosts.map((p) => p.id)
						);

						const trulyNewPosts = newPostsBatch.filter(
							(p) => !existingIds.has(p.id)
						);

						if (trulyNewPosts.length > 0) {
							const updatedPosts = [
								...trulyNewPosts,
								...currentPosts,
							].slice(0, MAX_FEED_POSTS);
							return updatedPosts;
						} else {
							return currentPosts;
						}
					});
					setError(null);
				} else {
					console.log(
						"Received empty post list."
					);
				}
			} catch (err) {
				console.error("Error fetching latest posts:", err);
				const fetchError =
					err instanceof Error
						? err
						: new Error("An unexpected error occurred");

				if (isInitialLoad) {
					setError(fetchError);
					setPosts([]);
				} else {
					setError(fetchError);
					console.warn(
						"Background refresh failed."
					);
				}
			} finally {
				if (isInitialLoad) {
					setLoading(false);
				}
				setIsFetchingUpdate(false);
			}
		},
		[isFetchingUpdate]
	);

	useEffect(() => {
		fetchData(true);

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		intervalRef.current = window.setInterval(() => {
			fetchData(false);
		}, REFRESH_INTERVAL_MS);

		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				console.log("Cleared refresh interval.");
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleRetry = () => {
		fetchData(true);
	};

	return (
		<div className="container mx-auto p-6 pb-16">
			{" "}
			<div className="flex items-center justify-between gap-3 mb-8">
				<div className="flex items-center gap-3">
					<Rss className="h-7 w-7 text-green-400" />
					<h1 className="text-2xl font-bold text-neutral-100">
						Real-time Feed
					</h1>
				</div>
				{isFetchingUpdate && !loading && (
					<div className="flex items-center gap-1.5 text-xs text-blue-400 animate-pulse">
						<Loader2 className="h-3 w-3 animate-spin" />
						<span>Checking for updates...</span>
					</div>
				)}
			</div>
			{loading && <LoadingSpinner message="Fetching initial feed..." />}
			{error && (posts.length === 0 || loading) && !isFetchingUpdate && (
				<ErrorMessage error={error} onRetry={handleRetry} />
			)}
			{!loading || posts.length > 0 ? (
				<>
					{posts.length === 0 && !loading && !error ? (
						<p className="text-center text-neutral-500 mt-10">
							The feed is currently empty.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{posts.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
						</div>
					)}
				</>
			) : null}{" "}
			{error && posts.length > 0 && !loading && (
				<div className="fixed bottom-4 right-4 z-20 bg-yellow-800/90 text-yellow-100 text-xs px-3 py-1.5 rounded shadow-lg border border-yellow-700/50 flex items-center gap-1.5">
					<AlertTriangle className="h-3.5 w-3.5" />
					<span>Feed update issue. Will retry automatically.</span>
				</div>
			)}
		</div>
	);
};

export default FeedPage;
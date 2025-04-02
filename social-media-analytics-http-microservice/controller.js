const cache = require("./cache");
const {
	getUsers,
	getPostsByUserId,
	getCommentsByPostId,
} = require("./services/testApiService");

const CACHE_KEYS = {
	USER_POST_COUNTS: "userPostCounts",
	ALL_POSTS_WITH_COMMENTS: "allPostsWithComments",
	LATEST_POSTS_ONLY: "latestPostsOnly",
};
const TTL = {
	USERS: 120,
	POSTS_MAIN: 30,
	LATEST_POSTS: 15,
};

let isFetchingData = false;
let isFetchingLatestPosts = false;

async function fetchAndProcessAllData() {
	if (isFetchingData) {
		return;
	}
	isFetchingData = true;
	console.log(
		"Initiating fetch and processing."
	);

	try {
		const users = await getUsers();
		if (!users || users.length === 0) {
			cache.set(CACHE_KEYS.USER_POST_COUNTS, [], TTL.USERS);
			cache.set(CACHE_KEYS.ALL_POSTS_WITH_COMMENTS, [], TTL.POSTS);
			isFetchingData = false;
			return;
		}

		const userIdToNameMap = new Map(
			users.map((user) => [user.id, user.name])
		);

		const postPromises = users.map((user) => getPostsByUserId(user.id));
		const postsByUsers = await Promise.all(postPromises);
		const allPosts = postsByUsers.flat();

		if (allPosts.length === 0) {
			const userPostCounts = users.map((user) => ({
				name: user.name,
				postCount: 0,
			}));
			cache.set(CACHE_KEYS.USER_POST_COUNTS, userPostCounts, TTL.USERS);
			cache.set(CACHE_KEYS.ALL_POSTS_WITH_COMMENTS, [], TTL.POSTS);
			isFetchingData = false;
			return;
		}

		const postCountMap = new Map();
		users.forEach((user) => postCountMap.set(user.id, 0));
		allPosts.forEach((post) => {
			if (post.userid) {
				postCountMap.set(
					post.userid,
					(postCountMap.get(post.userid) || 0) + 1
				);
			}
		});

		const userPostCountsResult = Array.from(postCountMap.entries()).map(
			([userId, count]) => ({
				name: userIdToNameMap.get(userId) || `Unknown User (${userId})`,
				postCount: count,
			})
		);
		cache.set(CACHE_KEYS.USER_POST_COUNTS, userPostCountsResult, TTL.USERS);

		const commentPromises = allPosts.map((post) =>
			getCommentsByPostId(post.id).then((comments) => ({
				...post,
				commentCount: comments.length,
			}))
		);
		const allPostsWithComments = await Promise.all(commentPromises);

		cache.set(
			CACHE_KEYS.ALL_POSTS_WITH_COMMENTS,
			allPostsWithComments,
			TTL.POSTS_MAIN
		);
	} catch (error) {
		console.error("Critical error during fetchAndProcessAllData:", error);
	} finally {
		isFetchingData = false;
	}
}

async function fetchLatestPostsOnly() {
	if (isFetchingLatestPosts) {
		return cache.get(CACHE_KEYS.LATEST_POSTS_ONLY);
	}
	isFetchingLatestPosts = true;

	try {
		const users = await getUsers();
		if (!users || users.length === 0) {
			cache.set(CACHE_KEYS.LATEST_POSTS_ONLY, [], TTL.LATEST_POSTS);
			return [];
		}

		const postPromises = users.map((user) => getPostsByUserId(user.id));
		const postsByUsers = await Promise.all(postPromises);
		const allPosts = postsByUsers.flat();

		if (allPosts.length === 0) {
			cache.set(CACHE_KEYS.LATEST_POSTS_ONLY, [], TTL.LATEST_POSTS);
			return [];
		}

		const sortedPosts = [...allPosts].sort(
			(a, b) => parseInt(b.id, 10) - parseInt(a.id, 10)
		);

		const latest5Posts = sortedPosts.slice(0, 5);

		const finalLatestPosts = latest5Posts.map((post) => ({
			id: post.id,
			userid: post.userid,
			content: post.content,
		}));

		cache.set(
			CACHE_KEYS.LATEST_POSTS_ONLY,
			finalLatestPosts,
			TTL.LATEST_POSTS
		);
		return finalLatestPosts;
	} catch (error) {
		console.error("Error during fetchLatestPostsOnly:", error);
		return undefined;
	} finally {
		isFetchingLatestPosts = false;
	}
}

async function getTopUsers(req, res) {
	try {
		let userPostCounts = cache.get(CACHE_KEYS.USER_POST_COUNTS);

		if (userPostCounts === undefined) {
			await fetchAndProcessAllData();
			userPostCounts = cache.get(CACHE_KEYS.USER_POST_COUNTS);
			if (userPostCounts === undefined) {
				console.error("Failed to get user post counts after fetch.");
				return res
					.status(500)
					.json({ error: "Failed to retrieve user data." });
			}
		}

		const sortedUsers = [...userPostCounts]
			.sort((a, b) => b.postCount - a.postCount)
			.slice(0, 5);

		res.json({ users: sortedUsers });
	} catch (error) {
		console.error("Error in getTopUsers handler:", error);
		res.status(500).json({
			error: "Internal server error retrieving top users.",
		});
	}
}

async function getTopPosts(req, res) {
	const type = req.query.type;

	if (type !== "latest" && type !== "popular") {
		return res.status(400).json({
			error: "Invalid 'type' query parameter. Use 'latest' or 'popular'.",
		});
	}

	try {
		let results = [];

		if (type === "latest") {
			let latestPosts = cache.get(CACHE_KEYS.LATEST_POSTS_ONLY);

			if (latestPosts === undefined) {
				latestPosts = await fetchLatestPostsOnly();

				if (latestPosts === undefined) {
					console.error(
						"Failed to get latest posts data after fetch."
					);
					return res.status(500).json({
						error: "Failed to retrieve latest posts data.",
					});
				}
			}
			results = latestPosts;
		} else {
			let allPostsWithComments = cache.get(
				CACHE_KEYS.ALL_POSTS_WITH_COMMENTS
			);

			if (allPostsWithComments === undefined) {
				await fetchAndProcessAllData();
				allPostsWithComments = cache.get(
					CACHE_KEYS.ALL_POSTS_WITH_COMMENTS
				);

				if (allPostsWithComments === undefined) {
					console.error(
						"Failed to get posts data (for popular) after fetch."
					);
					return res.status(500).json({
						error: "Failed to retrieve popular posts data.",
					});
				}
			}

			if (allPostsWithComments.length === 0) {
				results = [];
			} else {
				const maxCommentCount = Math.max(
					0,
					...allPostsWithComments.map((p) => p.commentCount)
				);
				results = allPostsWithComments.filter(
					(p) => p.commentCount === maxCommentCount
				);
			}

			results = results.map((post) => ({
				id: post.id,
				userid: post.userid,
				content: post.content,
				commentCount: post.commentCount,
			}));
		}

		res.json({ posts: results });
	} catch (error) {
		console.error(`Error in getTopPosts handler:`, error);
		res.status(500).json({
			error: "Internal server error retrieving posts.",
		});
	}
}

module.exports = {
	getTopUsers,
	getTopPosts,
	fetchAndProcessAllData,
	fetchLatestPostsOnly,
};

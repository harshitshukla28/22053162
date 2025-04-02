require("dotenv").config();
const axios = require("axios");
const authState = require("../authState");

const BASE_URL = process.env.TEST_API_BASE_URL;

const apiClient = axios.create({
	baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
	async (config) => {
		try {
			const token = await authState.getToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			} else {
				console.error(
					"No token available."
				);
			}
		} catch (error) {
			console.error(
				"Failed to get token before request:",
				error.message
			);
			return Promise.reject(
				new Error("Failed to get token for API call.")
			);
		}
		return config;
	},
	(error) => {
		console.error("Request error:", error);
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (
			error.response &&
			error.response.status === 401 &&
			!originalRequest._retry
		) {
			authState.invalidateToken();
			originalRequest._retry = true;
			try {
				return apiClient(originalRequest);
			} catch (retryError) {
				console.error(
					`Retry failed for ${originalRequest.url}:`,
					retryError.message
				);
				return Promise.reject(retryError);
			}
		}

		return Promise.reject(error);
	}
);

async function getUsers() {
	try {
		console.log(`Fetching users`);
		const response = await apiClient.get(`/users`);
		if (
			!response.data ||
			typeof response.data.users !== "object" ||
			response.data.users === null ||
			Array.isArray(response.data.users)
		) {
			console.warn(
				"Unexpected user data format or null/array users object:",
				response.data
			);
			return [];
		}

		const usersObject = response.data.users;
		const usersArray = Object.entries(usersObject).map(([id, name]) => ({
			id: String(id),
			name: name,
		}));

		return usersArray;
	} catch (error) {
		console.error(
			"Error fetching users:",
			error.response ? error.response.data : error.message
		);
		return [];
	}
}

async function getPostsByUserId(userId) {
	if (!userId) {
		return [];
	}
	try {
		const response = await apiClient.get(`/users/${userId}/posts`);

		if (!response.data || !Array.isArray(response.data.posts)) {
			return [];
		}
		return response.data.posts.map((post) => ({
			...post,
			id: String(post.id),
			userid: String(post.userid),
		}));
	} catch (error) {
		console.error(
			`Error fetching posts for user ID "${userId}":`,
			error.response ? error.response.data : error.message
		);
		return [];
	}
}

async function getCommentsByPostId(postId) {
	if (!postId) {
		return [];
	}
	try {
		const response = await apiClient.get(`/posts/${postId}/comments`);

		if (!response.data || !Array.isArray(response.data.comments)) {
			return [];
		}
		return response.data.comments.map((comment) => ({
			...comment,
			id: String(comment.id),
			postId: String(comment.postId),
		}));
	} catch (error) {
		return [];
	}
}

module.exports = {
	getUsers,
	getPostsByUserId,
	getCommentsByPostId,
};

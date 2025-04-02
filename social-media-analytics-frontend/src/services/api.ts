import axios, { AxiosError } from "axios";
import { UserApiResponse, PostApiResponse, ApiErrorData } from "../types";

const API_BASE_URL = "http://localhost:3001";

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

const getErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<ApiErrorData>;
		if (axiosError.response?.data?.error) {
			return axiosError.response.data.error;
		}
		return axiosError.message;
	} else if (error instanceof Error) {
		return error.message;
	}
	return "An unknown error occurred";
};

export const getTopUsers = async (): Promise<UserApiResponse> => {
	try {
		console.log("[Frontend API] Fetching /users");
		const response = await apiClient.get<UserApiResponse>("/users");
		return response.data;
	} catch (error) {
		const message = getErrorMessage(error);
		console.error("Error fetching top users:", message);
		throw new Error(message);
	}
};

export const getPosts = async (
	type: "latest" | "popular"
): Promise<PostApiResponse> => {
	try {
		console.log(`[Frontend API] Fetching /posts?type=${type}`);
		const response = await apiClient.get<PostApiResponse>(`/posts`, {
			params: { type },
		});
		return response.data;
	} catch (error) {
		const message = getErrorMessage(error);
		console.error(`Error fetching ${type} posts:`, message);
		throw new Error(message);
	}
};

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 300;
const usedImageIds = new Set<number>();

export const getRandomImageUrl = (seed: string = ""): string => {
	let randomId = Math.floor(Math.random() * 1000);
	let attempts = 0;
	while (usedImageIds.has(randomId) && attempts < 10) {
		randomId = Math.floor(Math.random() * 1000);
		attempts++;
	}
	usedImageIds.add(randomId);
	if (usedImageIds.size > 50) {
		const first = usedImageIds.values().next().value;
		if (first !== undefined) usedImageIds.delete(first);
	}
	return `https://picsum.photos/id/${randomId}/${IMAGE_WIDTH}/${IMAGE_HEIGHT}?seed=${seed}`;
};

const AVATAR_SIZE = 64;
export const getRandomAvatarUrl = (seed: string = ""): string => {
	let randomId = Math.floor(Math.random() * 1000);
	return `https://picsum.photos/id/${randomId}/${AVATAR_SIZE}/${AVATAR_SIZE}?grayscale&blur=1&seed=avatar_${seed}`;
};

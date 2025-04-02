export interface User {
	name: string;
	postCount: number;
}

export interface Post {
	id: string;
	userid: string;
	content: string;
	commentCount?: number;
}

export interface UserApiResponse {
	users: User[];
}

export interface PostApiResponse {
	posts: Post[];
}

export interface ApiErrorData {
	error: string;
}

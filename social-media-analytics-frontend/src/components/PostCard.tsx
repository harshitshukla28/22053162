import React from "react";
import { getRandomImageUrl } from "../services/api";
import { MessageCircle, UserCircle, Hash } from "lucide-react";
import { Post } from "../types";

interface PostCardProps {
	post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
	if (!post) return null;

	const imageUrl = getRandomImageUrl(post.id);

	const handleImageError = (
		e: React.SyntheticEvent<HTMLImageElement, Event>
	) => {
		const imgElement = e.currentTarget;
		imgElement.style.display = "none";
		const placeholder = imgElement.nextElementSibling as HTMLElement;
		if (placeholder) placeholder.style.display = "flex";
	};

	return (
		<div className="bg-[#1f1f1f] border border-[#2b2b2b] rounded-lg overflow-hidden shadow-md transition-colors hover:border-neutral-600 flex flex-col">
			<div className="relative h-48 w-full bg-black/20">
				<img
					src={imageUrl}
					alt={`Post ${post.id}`}
					className="object-cover w-full h-full"
					onError={handleImageError}
				/>
				<div
					style={{ display: "none" }}
					className="absolute inset-0 flex items-center justify-center bg-[#2a2a2a] text-neutral-500 text-sm">
					Image Unavailable
				</div>
			</div>

			<div className="p-4 flex-grow flex flex-col">
				<p className="text-sm text-neutral-300 mb-3 flex-grow line-clamp-4">
					{post.content || "No content available."}
				</p>
			</div>

			<div className="px-4 py-3 bg-[#1a1a1a]/60 border-t border-[#2b2b2b] mt-auto">
				<div className="flex items-center justify-between w-full text-xs text-neutral-400 gap-4">
					<div
						className="flex items-center gap-1.5 truncate"
						title={`User ID: ${post.userid}`}>
						<UserCircle className="h-3.5 w-3.5 flex-shrink-0" />
						<span className="truncate">User: {post.userid}</span>
					</div>
					<div className="flex items-center gap-1.5 flex-shrink-0">
						{post.commentCount !== undefined ? (
							<>
								<MessageCircle className="h-3.5 w-3.5 text-green-400" />
								<span className="font-medium text-green-300">
									{post.commentCount}{" "}
									{post.commentCount === 1
										? "Comment"
										: "Comments"}
								</span>
							</>
						) : (
							<>
								<Hash className="h-3.5 w-3.5" />
								<span>Post ID: {post.id}</span>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PostCard;

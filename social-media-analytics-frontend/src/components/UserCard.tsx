import React from "react";
import { getRandomAvatarUrl } from "../services/api";
import { MessageSquare } from "lucide-react";
import { User } from "../types";

interface UserCardProps {
	user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
	if (!user) return null;

	const avatarUrl = getRandomAvatarUrl(user.name);

	const handleImageError = (
		e: React.SyntheticEvent<HTMLImageElement, Event>
	) => {
		e.currentTarget.src = `https://via.placeholder.com/${64}?text=N/A`;
	};

	return (
		<div className="bg-[#1f1f1f] border border-[#2b2b2b] rounded-lg transition-colors hover:border-neutral-600 flex items-center p-4 gap-4 shadow-md">
			<img
				src={avatarUrl}
				alt={`${user.name}'s avatar`}
				className="w-16 h-16 rounded-full object-cover border-2 border-[#343434]"
				onError={handleImageError}
			/>
			<div className="flex-grow overflow-hidden">
				{" "}
				<h3
					className="text-lg font-semibold text-neutral-100 truncate"
					title={user.name}>
					{user.name}
				</h3>
				<p className="text-sm text-blue-400 flex items-center gap-1.5 mt-1">
					<MessageSquare className="h-4 w-4 flex-shrink-0" />{" "}
					<span>
						{user.postCount}{" "}
						{user.postCount === 1 ? "Post" : "Posts"}
					</span>
				</p>
			</div>
		</div>
	);
};

export default UserCard;

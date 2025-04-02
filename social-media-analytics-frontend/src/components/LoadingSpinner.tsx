import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
	message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	message = "Loading...",
}) => {
	return (
		<div className="flex flex-col items-center justify-center min-h-[200px] text-neutral-400">
			<Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-500" />
			<p>{message}</p>
		</div>
	);
};

export default LoadingSpinner;

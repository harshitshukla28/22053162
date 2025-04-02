import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
	error?: Error | string | null;
	onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
	error = "An unknown error occurred.",
	onRetry,
}) => {
	const errorMessageText =
		typeof error === "string"
			? error
			: error?.message || "Could not load data.";

	return (
		<div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center bg-red-900/10 border border-red-800/30 rounded-lg">
			<AlertTriangle size={48} className="text-red-500 mb-4" />
			<h2 className="text-xl font-semibold text-red-400 mb-2">
				Loading Failed
			</h2>
			<p className="text-neutral-400 mb-6 max-w-md">{errorMessageText}</p>
			{onRetry && (
				<button
					onClick={onRetry}
					className="px-4 py-2 bg-blue-600 border border-blue-700 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium">
					Retry
				</button>
			)}
		</div>
	);
};

export default ErrorMessage;

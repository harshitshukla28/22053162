import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import TopUsersPage from "./pages/TopUserPages";
import TrendingPostsPage from "./pages/TrendingPostsPages";
import FeedPage from "./pages/FeedPage";

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<TopUsersPage />} />
					<Route path="trending" element={<TrendingPostsPage />} />
					<Route path="feed" element={<FeedPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export default App;

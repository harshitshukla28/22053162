require("dotenv").config();
const axios = require("axios");

const AUTH_URL = process.env.AUTH_API_URL;
const AUTH_PAYLOAD = {
	email: process.env.AUTH_EMAIL,
	name: process.env.AUTH_NAME,
	rollNo: process.env.AUTH_ROLLNO,
	accessCode: process.env.AUTH_ACCESS_CODE,
	clientID: process.env.AUTH_CLIENT_ID,
	clientSecret: process.env.AUTH_CLIENT_SECRET,
};

let currentToken = null;
let tokenExpiryTime = 0;
let refreshPromise = null;

async function fetchNewToken() {
	try {
		const response = await axios.post(AUTH_URL, AUTH_PAYLOAD, {
			headers: { "Content-Type": "application/json" },
		});

		if (response.data && response.data.access_token) {
			currentToken = response.data.access_token;
			const expiresInTimestamp = response.data.expires_in;
			tokenExpiryTime = expiresInTimestamp * 1000 - 60 * 1000;

			return currentToken;
		} else {
			throw new Error("Invalid token response format");
		}
	} catch (error) {
		currentToken = null;
		tokenExpiryTime = 0;
		throw new Error("Failed to fetch access token");
	}
}

async function getToken() {
	if (refreshPromise) {
		return await refreshPromise;
	}

	if (currentToken && Date.now() < tokenExpiryTime) {
		return currentToken;
	}

	refreshPromise = fetchNewToken();

	try {
		const newToken = await refreshPromise;
		return newToken;
	} catch (error) {
		throw error;
	} finally {
		refreshPromise = null;
	}
}

function invalidateToken() {
	currentToken = null;
	tokenExpiryTime = 0;
}

module.exports = {
	getToken,
	invalidateToken,
};

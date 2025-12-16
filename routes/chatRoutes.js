const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/Chat");

const genAI = new GoogleGenerativeAI(process.env.DVD_AI_API_KEY);

// GET / - Display chat history
router.get("/", async (req, res) => {
	const chatHistory = await Chat.find()
		.sort({ timestamp: 1 })
		.limit(50)
		.exec();

	res.render("index", { history: chatHistory });
});

// POST /chat - Handle new chat message
router.post("/chat", async (req, res) => {
	const { message } = req.body;

	const model = genAI.getGenerativeModel({
		model: "gemini-flash-latest",
	});
	const result = await model.generateContent(message);
	const response = await result.response;
	const botResponse = response.text();

	const newChat = new Chat({
		userMessage: message,
		botResponse: botResponse,
	});

	await newChat.save();

	res.json({
		userMessage: message,
		botResponse: botResponse,
		timestamp: newChat.timestamp,
	});
});

// DELETE /chat/clear - Clear all chat history
router.delete("/chat/clear", async (req, res) => {
	await Chat.deleteMany({});
	res.json({ success: true, message: "Chat history cleared" });
});

module.exports = router;

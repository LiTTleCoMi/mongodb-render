const { MongoClient } = require("mongodb");

module.exports = async (req, res) => {
	// Only allow GET requests
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const uri = process.env.MONGODB_URI;

	if (!uri) {
		return res.status(500).json({ error: "MongoDB connection string not configured" });
	}

	const client = new MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();
		const db = client.db("sample_mflix");
		const collection = db.collection("comments");
		const comments = await collection.find({ name: "Mercedes Tyler" }).toArray();

		res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
		res.status(200).json(comments);
	} catch (err) {
		console.error("MongoDB error:", err);
		res.status(500).json({ error: "Database query failed" });
	} finally {
		await client.close();
	}
};

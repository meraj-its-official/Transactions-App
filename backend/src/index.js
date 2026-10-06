import { MongoClient } from 'mongodb';

// Connection ko cache karne ke liye global variable banayein
let cachedClient = null;

export default {
	async fetch(request, env, ctx) {
		// Ye locally .dev.vars se aayega, aur live hone pe Cloudflare secrets se
		const dbUrl = env.MONGO_URI;

		try {
			// Agar client abhi tak connect nahi hua hai, tabhi naya connection banayein
			if (!cachedClient) {
				cachedClient = new MongoClient(dbUrl);
				await cachedClient.connect();
			}

			// Apna database aur collection select karein 
			// (Inhe apne actual database aur collection ke naam se replace karein)
			const db = cachedClient.db('PayTM');
			const collection = db.collection('users');

			// Example: Collection se data fetch karna
			const data = await collection.find({}).limit(10).toArray();

			// Data ko JSON format mein return karein
			return new Response(JSON.stringify(data), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*' // Frontend se connect karne ke liye CORS allow karein
				},
			});

		} catch (error) {
			// Agar DB connect karne mein koi error aaye toh usko catch karein
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
}
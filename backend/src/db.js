import mongoose from 'mongoose';

export const connectDB = async (env) => {
	// 1. Agar connection pehle se active hai, toh naya connection mat banao
	if (mongoose.connection.readyState === 1) {
		console.log("=> Using existing database connection");
		return;
	}

	try {
		// 2. Secret check
		if (!env || !env.MONGODB_URI) {
			throw new Error("MONGODB_URI is missing in environment variables!");
		}

		// 3. Serverless optimization options ke sath connect karna
		await mongoose.connect(env.MONGODB_URI, {
			bufferCommands: false, // Serverless timeout se bachne ke liye
		});

		console.log("✅ Database Connected Successfully!");
	} catch (err) {
		console.log("❌ Database Error: ", err.message);
		throw err; // Error ko aage pass karna taaki Hono catch block mein pakad sake
	}
};

// --- Schemas ---
const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true, trim: true, lowercase: true },
	username: { type: String, required: true, unique: true, minLength: 3, maxLength: 20, lowercase: true, trim: true },
	password: { type: String, required: true },
	firstname: { type: String, required: true, maxLength: 30, trim: true },
	lastname: { type: String, required: true, maxLength: 30, trim: true },
});

const accountSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	balance: {
		type: Number,
		required: true
	}
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Account = mongoose.models.Account || mongoose.model('Account', accountSchema);
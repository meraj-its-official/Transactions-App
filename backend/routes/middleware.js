// Hono/jwt se verify import hona zaroori hai
import { verify } from 'hono/jwt';

export const authMiddleware = async (c, next) => {
    // 🛠 BUG 1 FIX: Hono mein headers nikalne ka tarika c.req.header() hai
    const authHeader = c.req.header("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ message: "Invalid or missing token" }, 403);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = await verify(token, c.env.JWT_SECRET, "HS256");

        if (decoded && decoded.userId) {
            // 🛠 BUG 2 FIX: Hono mein data pass karne ke liye c.set() use hota hai
            c.set("userId", decoded.userId);

            // 🛠 BUG 3 FIX: Middleware mein next() hamesha await ke sath call hota hai
            await next();
        } else {
            return c.json({ message: "Unauthorized access" }, 403);
        }
    } catch (error) {
        return c.json({
            message: "Invalid token",
            error_reason: error.message,
            received_token: token // Debugging ke liye check karein ki token kaisa aa raha hai
        }, 403);
    }
};

export default authMiddleware;

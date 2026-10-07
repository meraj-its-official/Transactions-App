import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { connectDB } from './db.js';
import mainRouter from '../routes/index.js';

const app = new Hono();

// 1. CORS Setup (Manual headers ki jagah Hono ka in-built middleware)
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// 2. Database Connection Middleware (Har request se pehle chalega)
app.use('*', async (c, next) => {
    try {
        // Hono mein env variables 'c.env' ke andar milte hain
        await connectDB(c.env);
        await next(); // Agle route par bhejne ke liye
    } catch (error) {
        return c.json({ error: "Database Connection Error" }, 500);
    }
});

// 3. Routing (Express wale app.use('/api/v1', mainRouter) ka exact replacement)
app.route('/api/v1', mainRouter);

// 4. Fallback (404 Not Found)
app.notFound((c) => {
    return c.json({ error: "Route not found" }, 404);
});

// 5. Global Error Handler (500 Server Error)
app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Server Error" }, 500);
});

// Cloudflare Workers ke liye Hono app ko directly export karna hota hai
export default app;
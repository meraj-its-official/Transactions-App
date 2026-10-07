import { Hono } from "hono";
import authMiddleware from './middleware'
import { Account } from '../src/db'
const router = new Hono()
import z from 'zod'
import mongoose from "mongoose";

router.get('/balance', authMiddleware, async (c) => {
    try {
        // 🛠 BUG 1 & 2 FIX: GET request mein body nahi hoti. 
        // Middleware se set kiya hua data c.get("userId") se nikalte hain.
        const userId = c.get("userId");

        const account = await Account.findOne({
            userId: userId
        });

        if (!account) {
            return c.json({
                message: "Account not found"
            }, 404);
        }

        // 🛠 BUG 3 FIX: Response ko 'return' karna zaroori hai
        return c.json({
            balance: account.balance
        }, 200);
    } catch (error) {
        return c.json({
            message: "Internal Server Error",
            error: error.message // Debugging ke liye error message bhej diya
        }, 500);
    }
});

const transferSchema = z.object({
    to: z.string().min(1, "Recipient ID is required"),
    from: z.string().min(1, "Sender ID is required"),
    amount: z.coerce.number({
        required_error: "Please enter the amount",
        invalid_type_error: "Amount should be a valid number",
    }).positive("Please enter valid amount"),
}).superRefine((val, ctx) => {
    // Self-transfer check
    if (val.from === val.to) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cannot transfer money to yourself",
            path: ["to"]
        });
    }
});

router.post('/transfer', authMiddleware, async (c) => {
    const body = await c.req.json();

    // 🛠 BUG 4 FIX: c.userId ki jagah c.get("userId") use karein
    const userId = c.get("userId");

    const validationResult = transferSchema.safeParse({
        to: String(body.to),
        amount: body.amount,
        from: String(userId)
    });

    if (!validationResult.success) {
        return c.json({
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors
        }, 400);
    }

    const { amount, to } = validationResult.data;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Fetch the accounts while Transaction
        const account = await Account.findOne({ userId: userId }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            // 🛠 BUG 5 FIX: Yahan 'validationResult.error' undefined hoga (kyunki success true tha).
            // Usko yahan se hatana zaroori tha, warna app is line par crash ho jayegi.
            return c.json({
                message: "Insufficient Balance"
            }, 400);
        }

        // Fetch the accounts for Transaction whom
        const toaccount = await Account.findOne({ userId: to }).session(session);

        if (!toaccount) {
            await session.abortTransaction();
            return c.json({
                message: 'Invalid Account'
            }, 400);
        }

        // Perform the Transaction
        await Account.updateOne({ userId: userId }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

        // Commit the Transaction 
        await session.commitTransaction();

        // 🛠 BUG 3 FIX: Return keyword missing tha
        return c.json({
            message: "Transfer Successful"
        }, 200);

    } catch (error) {
        await session.abortTransaction();
        return c.json({
            message: "Internal server error",
            error_reason: error.message,
            // received_token: token // Crash details dekhne ke liye
        }, 504); // 504 ki jagah standard 500 theek hai
    } finally {
        await session.endSession();
    }
});

export default router;

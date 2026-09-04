const express = require('express');
const authMiddleware = require('./middleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const z = require('zod')

router.get('/balance', authMiddleware, async (req, res) => {
    try {
        // req.userId authMiddleware se inject hoti hai
        const account = await Account.findOne({
            userId: req.userId
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        res.status(200).json({
            balance: account.balance
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})

const transferSchema = z.object({
    to: z.string().min(1, "Recipient ID is required"),
    from: z.string().min(1, "Sender ID is required"),
    // z.coerce string input (jaise "100") ko automatic number bana dega
    amount: z.coerce.number({
        required_error: "Please enter the amount",
        invalid_type_error: "Amount should be a valid number",
    })
        .positive("Please enter valid amount"),
}).superRefine((val, ctx) => {
    // Self-transfer check
    if (val.from === val.to) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cannot transfer money to yourself",
            path: ["to"]
        });
    }
})

router.post('/transfer', authMiddleware, async (req, res) => {

    const validationResult = transferSchema.safeParse({
        to: req.body.to,
        amount: req.body.amount,
        from: req.userId
    });

    if (!validationResult.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors
        });
    }

    const { amount, to } = validationResult.data;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Fetch the accounts while Transaction
        const account = await Account.findOne({ userId: req.userId }).session(session)

        if (!account || account.balance < amount) {
            await session.abortTransaction()
            return res.status(400).json({
                message: "Insuficent Balance",
                errors: validationResult.error.flatten().fieldErrors
            })
        }
        // Fetch the accounts for Transaction whom
        const toaccount = await Account.findOne({ userId: to }).session(session)

        if (!toaccount) {
            await session.abortTransaction()
            return res.status(400).json({
                message: 'Invalid Account',
                errors: validationResult.error.flatten().fieldErrors
            })
        }

        // Perform the Transaction

        await Account.updateOne({ userId: req.userId }, { $inc: { balance: - amount } }).session(session)
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session)

        // Commit the Transaction 

        await session.commitTransaction();

        res.json({
            message: "Transfar Successful"
        })

    } catch (error) {
        await session.abortTransaction();
        return res.status(504).json({
            message: "Internal server error",
            errors: validationResult.error.flatten().fieldErrors
        })
    } finally {
        await session.endSession();
    }
})

module.exports = router

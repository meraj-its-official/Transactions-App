const express = require('express');
const authMiddleware = require('./middleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');
const router = express.Router();

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


router.post('/transfer', authMiddleware, async (req, res) => {
    try {
        const { amount, to } = req.body

        if (req.userId === to) {
            return res.status(400).json({
                message: "Cannot transfer money to yourself"
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        // Fetch the accounts while Transaction
        const account = await Account.findOne({ userId: req.userId }).session(session)

        if (!account || account.balance < amount) {
            await session.abortTransaction()
            return res.status(400).json({
                message: "Insuficent Balance",
                errors: result.error.flatten().fieldErrors
            })
        }
        // Fetch the accounts for Transaction whom
        const toaccount = await Account.findOne({ userId: to }).session(session)

        if (!toaccount) {
            await session.abortTransaction()
            return res.status(400).json({
                message: 'Invalid Account',
                errors: result.error.flatten().fieldErrors
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
            message: "Sorry ! Someting is Wrong in Interal Server",
            errors: result.error.flatten().fieldErrors
        })
    } finally {
        session.endSession();
    }
})

module.exports = router

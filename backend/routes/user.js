const express = require('express')
const z = require('zod')
const bcrypt = require('bcrypt')
const { User, Account } = require('../db')
const jwt = require('jsonwebtoken')
const authMiddleware = require('./middleware')
const router = express.Router()

// Step.1 - Define Zod Security
const signupSchema = z.object({
    username: z.string().trim()
        .regex(/[^""]/, { message: "Username is required" }).superRefine((val, ctx) => {
            if (val.length < 3) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Username must be at least 3 characters long.",
                });
            }
            else if (val.length > 20) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Username must be less than 20 characters long.",
                });
            }
            // Regex: Username mein sirf alphabets, numbers, aur underscores (_) allowed hain
            else if (!/^[a-z0-9_]+$/.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Username can only contain lowercase, numbers, and underscores.",
                });
            }
        }),
    firstname: z.string().max(30, { message: "Firstname must be less than 30 characters long" })
        .regex(/[^""]/, { message: "Firstname is required" })
        .regex(/[A-Z]/, { message: "Firstname must contain at least one uppercase letter" }),
    lastname: z.string().max(30, { message: "Lastname must be less than 30 characters long" })
        .regex(/[^""]/, { message: "Lastname is required" })
        .regex(/[A-Z]/, { message: "Lastname must contain at least one uppercase letter" }),
    email: z.string().trim()
        .regex(/[^""]/, { message: "E-mail is required" }).superRefine((val, ctx) => {
            // 1. Agar input mein '@' hai -> Strict EMAIL Validation
            if (val.includes('@')) {
                const isEmail = z.string().email().toLowerCase().safeParse(val);
                if (!isEmail.success) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invalid email format (e.g., example@gmail.com).",
                    });
                }
            }
            // 2. Agar '@' nahi hai -> Strict USERNAME Validation
            else {
                // Regex: Username mein sirf alphabets, numbers, aur plus (+) allowed hain
                if (/[^@+0-9]/.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invalid email format (e.g., example@gmail.com).",
                    });
                }
            }
        }),
    password: z.string().trim()
        .regex(/[^""]/, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must be less than 20 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
})

// Step.2 - Define body Structure for Post '/signup' Route
router.post('/signup', async (req, res) => {
    const body = req.body;
    const { success, error } = signupSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            errors: error.flatten().fieldErrors
        })
    }
    // Step.3 - Find Username in Database 
    const existingUser = await User.findOne({
        username: body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: 'Username already exist'
        })
    }

    // Step 4 - HASH THE PASSWORD (Signup ka main logic)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    // Step 5 - Create New User in Database (with Hashed Password)
    const dbUser = await User.create({
        username: body.username,
        email: body.email,
        password: hashedPassword, // Plain password ki jagah hashed wala save kar rahe hain
        firstname: body.firstname,
        lastname: body.lastname
    });
    const userId = dbUser._id
    function getRandomAmount(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Random Amount give to the New Account Created
    await Account.create({
        userId,
        balance: getRandomAmount(1, 1000)
    })

    // Step 6 - Generate JWT Token
    // (Yahan compare check ki zaroorat nahi hai, user successfully ban chuka hai)
    const token = jwt.sign({
        userId
    }, process.env.JWT_SECRET, { expiresIn: '900s' });

    // Step 7 - Send Response
    return res.status(200).json({
        message: "Username created successfully",
        token: token
    });
})


const signinSchema = z.object({
    username: z.string().trim()
        .regex(/[^""]/, { message: "Username or E-mail is required" }).superRefine((val, ctx) => {
            // 1. Agar input mein '@' hai -> Strict EMAIL Validation
            if (val.includes('@')) {
                const isEmail = z.string().email().safeParse(val);
                if (!isEmail.success) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invalid email format (e.g., example@gmail.com).",
                    });
                }

            }
            // 2. Agar '@' nahi hai -> Strict USERNAME Validation
            else {
                if (val.length < 3) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username must be at least 3 characters long.",
                    });
                }
                else if (val.length > 20) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username must be less than 20 characters long.",
                    });
                }
                // Regex: Username mein sirf alphabets, numbers, aur underscores (_) allowed hain
                else if (!/^[a-z0-9_]+$/.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username can only contain lowercase, numbers, and underscores.",
                    });
                }
            }
        }),
    password: z.string().trim()
        .regex(/[^""]/, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must be less than 20 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
})


router.post('/signin', async (req, res) => {
    const body = req.body;
    const { success, error } = signinSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: 'Username/Password Invalid',
            errors: error.flatten().fieldErrors
        })
    }
    // Step.3 - Find Username in Database 
    const existingUser = await User.findOne({
        $or: [
            { username: body.username }, // Agar username se match ho jaye
            { email: body.username }     // Ya phir email se match ho jaye
        ]
    })
    if (!existingUser) {
        return res.status(411).json({
            message: 'User does not exist'
        })
    }

    const isPasswordValid = await bcrypt.compare(body.password, existingUser.password)

    if (!isPasswordValid) {
        return res.status(411).json({
            message: "Error while LoggingIn / Wrong Password"
        })
    }
    const token = jwt.sign({
        userId: existingUser._id
    }, process.env.JWT_SECRET, { expiresIn: '900s' })

    return res.status(200).json({
        message: "Account Logedin Successfully",
        token: token
    })
})

const updateBody = z.object({
    firstname: z.string().max(30, { message: "Firstname must be less than 30 characters long" })
        .regex(/[^""]/, { message: "Firstname is required" })
        .regex(/[A-Z]/, { message: "Firstname must contain at least one uppercase letter" }),
    lastname: z.string().max(30, { message: "Lastname must be less than 30 characters long" })
        .regex(/[^""]/, { message: "Lastname is required" })
        .regex(/[A-Z]/, { message: "Lastname must contain at least one uppercase letter" }),
    email: z.string().trim()
        .regex(/[^""]/, { message: "E-mail is required" }).superRefine((val, ctx) => {
            // 1. Agar input mein '@' hai -> Strict EMAIL Validation
            if (val.includes('@')) {
                const isEmail = z.string().email().toLowerCase().safeParse(val);
                if (!isEmail.success) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Please ! Enter a valid e-mail (e.g., example@gmail.com).",
                    });
                }
            }
            // 2. Agar '@' nahi hai -> Strict USERNAME Validation
            else {
                if (/[^@+0-9]/.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Please ! Enter a valid e-mail (e.g., example@gmail.com).",
                    });
                }
            }
        }),
    password: z.string().trim()
        .regex(/[^""]/, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must be less than 20 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
})

router.post('/update', authMiddleware, async (req, res) => {
    const { success, error } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information",
            errors: error.flatten().fieldErrors
        })
    }
    await User.updateOne({ _id: req.userId }, req.body)
    res.json({
        message: 'Updated Successfully'
    })
})

router.get('/bulk', async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            email: {
                "$regex": filter
            }
        }, {
            firstname: {
                "$regex": filter
            }
        }, {
            lastname: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})

const forgetSchema = z.object({
    username: z.string().trim()
        .regex(/[^""]/, { message: "Username or E-mail is required" }).superRefine((val, ctx) => {
            // 1. Agar input mein '@' hai -> Strict EMAIL Validation
            if (val.includes('@')) {
                const isEmail = z.string().email().safeParse(val);
                if (!isEmail.success) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invalid email format (e.g., example@gmail.com).",
                    });
                }

            }
            // 2. Agar '@' nahi hai -> Strict USERNAME Validation
            else {
                if (val.length < 3) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username must be at least 3 characters long.",
                    });
                }
                else if (val.length > 20) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username must be less than 20 characters long.",
                    });
                }
                // Regex: Username mein sirf alphabets, numbers, aur underscores (_) allowed hain
                else if (!/^[a-z0-9_]+$/.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username can only contain lowercase, numbers, and underscores.",
                    });
                }
            }
        }),
    oldPassword: z.string().trim()
        .regex(/[^""]/, { message: "Old Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must be less than 20 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    newPassword: z.string().trim()
        .regex(/[^""]/, { message: "New Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must be less than 20 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" })

})

router.put('/forget/:username', async (req, res) => {
    const body = req.body;
    const { success, error } = forgetSchema.safeParse(req.body)
    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs",
            errors: error.flatten().fieldErrors
        });
    }
    const existingUser = await User.findOne({
        $or: [
            { username: body.username }, // Agar username se match ho jaye
            { email: body.username }     // Ya phir email se match ho jaye
        ]
    })
    if (!existingUser) {
        return res.status(404).json({
            message: 'User does not exist'
        })
    }

    const isPasswordMatch = await bcrypt.compare(body.oldPassword, existingUser.password)
    if (!isPasswordMatch) {
        return res.status(401).json({
            message: 'New password must be different from the old password'
        })
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.newPassword, saltRounds);
    existingUser.password = hashedPassword

    await existingUser.save()

    const token = jwt.sign({
        userId: existingUser._id
    }, process.env.JWT_SECRET)

    return res.status(200).json({
        message: "Password updated successfully",
        token: token
    })
})


module.exports = router

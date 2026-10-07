import { Hono } from 'hono'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { sign } from 'hono/jwt'
import authMiddleware from './middleware'
import { Account, User } from '../src/db.js'
const router = new Hono()

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
router.post('/signup', async (c) => {
    const body = await c.req.json();

    // 🛠 BUG 1 FIX: c.body ki jagah 'body' variable pass karna hai
    const { success, error } = signupSchema.safeParse(body)

    if (!success) {
        // 🛠 BUG 4 FIX: c.status() ki jagah direct return mein status code dena better hai
        return c.json({
            message: 'Incorrect inputs',
            errors: error.flatten().fieldErrors
        }, 411)
    }

    // Step 3 - Find Username in Database 
    const existingUser = await User.findOne({
        username: body.username
    })

    if (existingUser) {
        return c.json({
            message: 'Username already exist',
        }, 411)
    }

    // Step 4 - HASH THE PASSWORD
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    // Step 5 - Create New User in Database
    const newUser = await User.create({
        username: body.username,
        email: body.email,
        password: hashedPassword,
        firstname: body.firstname,
        lastname: body.lastname
    });

    const userId = newUser._id;

    function getRandomAmount(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Random Amount give to the New Account Created
    await Account.create({
        userId,
        balance: getRandomAmount(1, 1000)
    })

    // Step 6 - Generate JWT Token
    // 🛠 BUG 2 & 3 FIX: hono/jwt use karna aur process.env ki jagah c.env use karna
    const token = await sign({
        userId,
        exp: Math.floor(Date.now() / 1000) + 900 // 900 seconds (15 mins) expiry ka tarika
    }, c.env.JWT_SECRET);

    // Step 7 - Send Response
    return c.json({
        message: "Username created successfully",
        token: token,
        firstname: newUser.firstname
    }, 200);
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


router.post('/signin', async (c) => {
    const body = await c.req.json();
    const { success, error } = signinSchema.safeParse(body)

    if (!success) {
        return c.json({
            message: 'Username/Password Invalid',
            errors: error.flatten().fieldErrors
        }, 411)
    }

    // Step.3 - Find Username in Database 
    const existingUser = await User.findOne({
        $or: [
            { username: body.username },
            { email: body.username }
        ]
    })

    if (!existingUser) {
        return c.json({
            message: 'User does not exist',
        }, 411)
    }

    // (Assume aap bcryptjs use kar rahe hain, native bcrypt cloudflare par fail ho sakta hai)
    const isPasswordValid = await bcrypt.compare(body.password, existingUser.password)

    if (!isPasswordValid) {
        return c.json({
            message: "Error while LoggingIn / Wrong Password",
        }, 411)
    }

    // 🛠 BUG FIX: Hono JWT format
    const token = await sign({
        userId: existingUser._id,
        exp: Math.floor(Date.now() / 1000) + 900 // 900s (15 minutes) ki expiry aise dete hain
    }, c.env.JWT_SECRET)

    return c.json({
        message: "Account Logedin Successfully",
        token: token,
        firstname: existingUser.firstname
    }, 200)
})

const updateBody = z.object({
    firstname: z
        .string()
        .trim()
        .regex(/[^""]/, { message: "Firstname is required" })
        .max(30, { message: "Firstname must be less than 30 characters long" })
        .regex(/[A-Z]/, { message: "Firstname must contain at least one uppercase letter" }),
    lastname: z
        .string()
        .trim()
        .regex(/[^""]/, { message: "Lastname is required" })
        .max(30, { message: "Lastname must be less than 30 characters long" })
        .regex(/[A-Z]/, { message: "Lastname must contain at least one uppercase letter" }),
    username: z
        .string()
        .trim()
        .regex(/[^""]/, { message: "Username or E-mail is required" })
        .superRefine((val, ctx) => {
            if (val.includes("@")) {
                const isEmail = z.string().email().safeParse(val);
                if (!isEmail.success) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invalid email format (e.g., example@gmail.com).",
                    });
                }
            } else {
                if (val.length < 3) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username must be at least 3 characters long.",
                    });
                } else if (val.length > 20) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username must be less than 20 characters long.",
                    });
                } else if (!/^[a-z0-9_]+$/.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Username can only contain lowercase, numbers, and underscores.",
                    });
                }
            }
        }),
    oldPassword: z.string().trim()
        .regex(/[^""]/, { message: "Old Password is required" })
        .min(8, { message: "Old password must be at least 8 characters long" })
        .max(20, { message: "Old password must be less than 20 characters long" }),
    newPassword: z.string().trim()
        .regex(/[^""]/, { message: "New Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must be less than 20 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string().trim()
        .regex(/[^""]/, { message: "Confirm Password is required" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New Password and Confirm Password must match",
    path: ["confirmPassword"],
});


router.put("/update-password", authMiddleware, async (c) => {
    const body = await c.req.json();
    const result = updateBody.safeParse(body);

    // 🛠 BUG 1 FIX: 'error' undefined tha, isko 'result.error' likhna hoga
    if (!result.success) {
        return c.json({
            message: "Error while updating information",
            errors: result.error.flatten().fieldErrors,
        }, 411);
    }

    const { firstname, lastname, username, oldPassword, newPassword } = result.data;

    // 🛠 BUG 2 FIX: Hono mein middleware data c.get() se nikalta hai, c.userId se nahi
    const userId = c.get("userId");
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        return c.json({
            message: "User account not found",
        }, 404);
    }

    // 2. Strict Account Match Check (Case-insensitive)
    const isFirstnameMatch = existingUser.firstname.toLowerCase() === firstname.toLowerCase();
    const isLastnameMatch = existingUser.lastname.toLowerCase() === lastname.toLowerCase();
    const isUsernameMatch = (existingUser.username && existingUser.username.toLowerCase() === username.toLowerCase()) ||
        (existingUser.email && existingUser.email.toLowerCase() === username.toLowerCase());

    if (!isFirstnameMatch || !isLastnameMatch || !isUsernameMatch) {
        return c.json({
            message: "User details do not match account records",
        }, 400);
    }

    // 2. Verify Old Password
    const isPasswordMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isPasswordMatch) {
        // 🛠 BUG 3 FIX: c.status(400) ki jagah direct json() ke 2nd parameter mein bhejein
        return c.json({
            message: "Incorrect old password",
        }, 400);
    }

    // 3. Ensure New Password is NOT same as Old Password
    if (oldPassword === newPassword) {
        return c.json({
            message: "New password must be different from the old password",
        }, 400);
    }

    // 4. Hash New Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 5. Update Database Record
    await User.updateOne(
        { _id: userId }, // Yahan bhi userId variable use karein
        {
            password: hashedPassword,
        }
    );

    // 🛠 BUG 4 FIX: Hono JWT format mein 'exp' lagana zaroori hai
    const token = await sign(
        {
            userId: existingUser._id,
            exp: Math.floor(Date.now() / 1000) + 900 // 15 minutes expiry
        },
        c.env.JWT_SECRET
    );

    return c.json({
        message: "Password updated successfully",
        token: token,
    }, 200);
});

router.get('/bulk', authMiddleware, async (c) => { // Auth middleware lagana zaroori hai agar userId chahiye
    // 🛠 BUG 1 FIX: Hono mein query parameter nikalne ka tarika c.req.query() hota hai
    const filter = c.req.query("filter") || "";

    // 🛠 BUG 2 FIX: Hono mein variables c.get() se nikalte hain, c.userId se nahi
    const userId = c.get("userId");

    const users = await User.find({
        $or: [{
            email: {
                "$regex": filter,
                "$options": "i"
            }
        }, {
            firstname: {
                "$regex": filter,
                "$options": "i"
            }
        }, {
            lastname: {
                "$regex": filter,
                "$options": "i"
            }
        }],
        _id: { $ne: userId } // c.get() wala userId use karein
    }).limit(5);

    // 🛠 BUG 3 FIX: Hono mein response ko hamesha 'return' karna padta hai
    return c.json({
        user: users.map(user => ({
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    }, 200);
});

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

    password: z.string().trim()
        .regex(/[^""]/, { message: "New Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must be less than 20 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string().trim()
        .regex(/[^""]/, { message: "Confirm Password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "New Password and Confirm Password must match",
    path: ["confirmPassword"],
});

router.put('/forget-password', async (c) => {
    const body = await c.req.json();
    const { success, error, data } = forgetSchema.safeParse(body);

    if (!success) {
        return c.json({
            message: "Invalid inputs",
            errors: error.flatten().fieldErrors
        }, 400);
    }

    const existingUser = await User.findOne({
        $or: [
            { username: data.username },
            { email: data.username }
        ]
    });

    if (!existingUser) {
        return c.json({
            message: 'User does not exist',
        }, 404);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // 🛠 BUG 2 FIX: Serverless/Edge par .save() ki jagah .updateOne() zyada fast aur safe hai
    await User.updateOne(
        { _id: existingUser._id },
        { password: hashedPassword }
    );

    // 🛠 BUG 1 & 3 FIX: ObjectId ko string banana aur Expiry add karna
    const token = await sign({
        userId: existingUser._id.toString(),
        exp: Math.floor(Date.now() / 1000) + 900
    }, c.env.JWT_SECRET);

    return c.json({
        message: "Password updated successfully",
        token: token
    }, 200);
});


export default router;

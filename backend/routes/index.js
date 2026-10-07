import { Hono } from "hono";
const router = new Hono()
import userRouter from './user'
import accountRouter from './account'


router.route('/user', userRouter);
router.route('/account', accountRouter)

export default router
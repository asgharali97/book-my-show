import {Router} from "express"
import { signupUser, loginUser, logoutUser } from "./auth.controller.mjs"
import authenticate from "./auth.middleware.mjs"

const router = Router()

router.post('/signup', signupUser)
router.post('/login', loginUser)
router.post('/logout',authenticate, logoutUser)

export default router
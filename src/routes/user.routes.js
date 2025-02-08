import {Router} from 'express';
import {registerUser} from "../controllers/user.controller.js"


const router = Router();

router.get("/test", (req, res) => {
    res.status(200).json({ message: "Test route working!" });
});
router.route("/register").post(registerUser)


export default router;
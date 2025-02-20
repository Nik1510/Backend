import {Router} from 'express';
import {registerUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.get("/test", (req, res) => {
    res.status(200).json({ message: "Test route working!" });
});
router.route("/register").post(
    upload.fields([
        {
            name:"avator",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    registerUser
)


export default router;
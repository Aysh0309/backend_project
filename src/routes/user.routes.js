import { Router } from "express";
import { loginUser,
     logoutUser, 
     registerUser,
     refreshAccessToken, 
     changeCurrentPassword, 
     getCurrentUser, 
     updatAccountDetails, 
     updatUserAvatar, 
     updatUserCoverImage, 
     getUserChannelProfile, 
     getWatchHistory } 
     from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router();

router.route('/register').post(
    
    upload.fields(
        [
            {
                name:'avatar',
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            }
        ]
    ),

    registerUser
)

router.route('/login').post(loginUser)

//secured routes
router.route('/logout').post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
router.route('/change-password').post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updatAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updatUserAvatar)
router.route("/cover-Image").patch(verifyJWT,upload.single("coverImage"),updatUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
//this is important when we take data from the url

router.route("/history").get(verifyJWT,getWatchHistory)




export default router

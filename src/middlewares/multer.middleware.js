import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)//orgianl name might cause issue 
    //as user may upload several files by the same name
  }
})

export const upload = multer({ 
    storage: storage 
})

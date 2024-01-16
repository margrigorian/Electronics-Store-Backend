import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, "images") // вторым параметром передается путь к папке, где будут храниться файлы
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + "-" + file.originalname) // задаем имя файла
    }
})

const types = ["image/png", "image/jpeg", "image/jpg"];

const fileFilter = (req, file, cb) => {
    if(types.includes(file.mimetype)) {
        cb(null, true) // файл прошел валидацию, ставим флаг true
    }else {
        cb(null, false)
    }
}

const myMulter = multer({storage, fileFilter});

export default myMulter;
const multer = require('multer');
const path = require('path');
const appRoot = require('app-root-path');
const { imageFilter } = require('../helpers/imageFilter');

// Định nghĩa nơi lưu trữ, cách lấy file
let storage = multer.diskStorage({
    // Đích đến, nơi lưu file
    destination: (req, file, cb) => {
        // Nếu không có file trả về null, ngược lại có file thì file này sẽ được lưu vào thư mục images
        cb(null, appRoot + '/public/images/');
    },
    // Tên của file 
    filename: (req, file, cb) => {
        // Nếu không có file trả về null, ngược lại có file thì trả về tên file (Lưu ý tên file ảnh phải là unique do đó ta nên cộng chuỗi để đảm bảo tính unique)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

let upload = multer({ storage: storage, fileFilter: imageFilter });

module.exports = { upload };
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const CommonController = {

    generateContract: (req, res, next) => {
        return res.status(200).json({
            title1: "SAMPLE CONTENT - FEC INPUT LATER",
            title2: "HÌNH THỨC THANH TOÁN",
            content: "Đối tác được quyền thanh toán chậm cho việc mua sản phẩm trong thời hạn quy định trên Hợp đồng mua hàng hoá trả chậm. Giá sản phẩm sẽ được thanh toán định kỳ hàng ngày thông qua Ví dưới (ví tiền mặt) của Đối tác. Vui lòng duy trì thu nhập tại Ví dưới (ví tiền mặt) để hệ thống thực hiện thanh toán tự động, tránh việc trễ hạn và ảnh hưởng đến quyền lợi của Đối tác. Trường hợp thu nhập ví dưới không đủ vào ngày thanh toán định kỳ, khoản còn thiếu hệ thống sẽ tự động thu (từ ví dưới) vào những ngày kế tiếp, kể cả ngày lễ và cuối tuần. Thời gian khấu trừ ví dưới dự kiến sẽ bắt đầu trong vòng 7 ngày kể từ ngày nhận sản phẩm."
        })
    },

    generateProviders: (req, res, next) => {
        const providers = [
            { id: 1, providerName: "Fe Credit", url: "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/vicpp8fe0qt8yzdokpbp" },
            { id: 2, providerName: "Home Credit", url: "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/qjy9tfynbw5vdrnzbv9z" },
            { id: 3, providerName: "MCredit", url: "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/qjy9tfynbw5vdrnzbv9z" }
        ]
        return res.status(200).json({
            data: providers
        })
    },

    getHVToken: async (req, res, next) => {
        try {
            const url = "https://auth.hyperverge.co/login";
            const options = {
                method: "POST",
                body: JSON.stringify({
                    appId: process.env.appId,
                    appKey: process.env.appKey,
                    expiry: 900
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            };
            const response = await fetch(url, options);
            const data = await response.json();
            if (data !== null) {
                return res.json({
                    token: data.result.token,
                    status: true
                })
            }
            else {
                return res.json({
                    message: "Fail To Get API",
                    status: false,
                })
            }
        }
        catch (err) {
            next(err);
        }
    }

};

module.exports = CommonController;
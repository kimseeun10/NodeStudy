// 미들웨어

const { User } = require('../models/User');


let auth = (req, res, next) => {

    //인증처리 하는 곳

    // 1. 클라이언트 쿠키에서 토큰 가져오기

    let token = req.cookies.x_auth;

    // 2. 토큰을 복호화 한 후 유저를 찾는다.

    User.findByToken(token)
        .then(user => {
            if (!user) return res.json({ isAuth: false, error: true });
            req.token = token;
            req.user = user;
            next();
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ isAuth: false, error: true });
        });
};

module.exports = { auth };
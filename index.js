const config = require('./config/key');
const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

// application/x-www-from-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// application/json
app.use(bodyParser.json());

// cookieParser
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('정말 취업하고싶어요. 일하고싶어요.'));

app.post('/api/users/register', async (req, res) => {

    // 회원가입시 필요한 정보들을 client에서 가져오면 데이터베이스에 넣어준다.
    const user = new User(req.body);

    try {
        await user.save();
        res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        // 1. 요청된 이메일을 데이터베이스에 있는지 찾는다.
        const user = await User.findOne({ email: req.body.email }).exec();
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        }

        // 2. 요청된 이메일이 db에 있다면 비밀번호가 일치하는지 확인.
        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            return res.json({ loginSuccess: false, message: "비밀번호를 확인해주세요." });
        }

        // 3. 비밀번호까지 일치한다면 token 을 생성하기.
        await user.generateToken();
        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지...
        res.cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

app.get('/api/users/auth', auth, (req, res) => {
    // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 True 라는 말.

    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { token: "" } },
            { new: true }
        );
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`)); 
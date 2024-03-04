const config = require('./config/key');
const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const { User } = require("./models/User");

// application/x-www-from-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// application/json
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World! 안녕하세요'));

app.post('/', async (req, res) => {

    //회원가입시 필요한 정보들을 client에서 가져오면 데이터베이스에 넣어준다.
    await user
    .save()
    .then(() => {
        res.status(200).json({
            success: true,
        });
    })
    .catch((err) => {
        console.error(err);
        res.json({
            success: false,
            err: err,
        });
    });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`)); 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});

userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err) return next(err);
                this.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

userSchema.methods.comparePassword = function(plainPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
            if (err) return reject(err);
            resolve(isMatch);
        });
    });
};

userSchema.methods.generateToken = async function() {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken');
    user.token = token;
    try {
        await user.save();
        return user;
    } catch (err) {
        throw err;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
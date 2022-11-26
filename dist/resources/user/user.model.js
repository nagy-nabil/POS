import mongoose from "mongoose";
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema({
    username: { type: String,
        required: true },
    email: { type: String,
        required: true },
    password: { type: String,
        required: true },
    level: { type: String, default: "staff" },
    created: { type: Date, default: Date.now },
    avatar: { type: String, default: "" },
    first_name: {
        type: String,
        default: ""
    },
    last_name: {
        type: String,
        default: ""
    },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    activated_status: { type: Boolean, default: false, required: true },
    activated_tokken: { type: String, default: "" },
    resetPasswordToken: { type: String, default: "" },
});
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    bcrypt.hash(this.password, 8, (err, hash) => {
        if (err) {
            return next(err);
        }
        this.password = hash;
        next();
    });
});
// UserSchema.pre('find',{ document: true, query: false }, function(next) {
//     // console.log(this)
//     if (!this.isModified('password')) {
//         return next()
//     }
//     bcrypt.hash(this.password, 8, (err, hash) => {
//         if (err) {
//             return next(err)
//         }
//         this.password = hash
//         next()
//     })
// })
UserSchema.methods.checkPassword = function (password) {
    const passwordHash = this.password;
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, passwordHash, (err, same) => {
            if (err) {
                return reject(err);
            }
            resolve(same);
        });
    });
};
export const User = mongoose.model("user", UserSchema);

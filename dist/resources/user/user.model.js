import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    username: { type: String,
        required: true },
    email: { type: String,
        required: true },
    password: { type: String,
        required: true },
    level: { type: String, default: "normal" },
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
export const User = mongoose.model("user", UserSchema);

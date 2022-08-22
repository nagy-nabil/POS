import mongoose from "mongoose";
export interface UserDocument extends mongoose.Document {
    username:string
    email:String
    password:string
    level:string
    created:Date
}
const UserSchema = new mongoose.Schema({
    username:{type:String,
            required:true},
    email: {type:String,
        required:true},
    password: {type:String,
        required:true},
    level: { type: String, default: "normal" },
    created: { type: Date, default: Date.now }
});
UserSchema.index({ username: 1 }, { unique: true });
export const User = mongoose.model<UserDocument>("user",UserSchema)
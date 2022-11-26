import { User } from "../resources/user/user.model.js";
import jwt from "jsonwebtoken";
import configUser from "../config/main.js";
import sgMail from "@sendgrid/mail";
if (process.env.SENDGRID_API_KEY !== undefined)
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
/**
 * create tokken , send it to the user [payload is the user id]
 * user concern to save the tokken [the front end will save it in the local storage]
 * verify the tokken
 * search for user with the tokken
 * check email password [if needed with sign in ]
 * protect assign the user to the req[middleware]
 */
export const newToken = (user) => {
    const payload = {
        id: user._id,
        level: user.level
    };
    console.log(payload);
    if (typeof configUser.jwt.secret == "string" && typeof configUser.jwt.expiresin == 'string')
        return jwt.sign(payload, configUser.jwt.secret, {
            expiresIn: configUser.jwt.expiresin,
            algorithm: "HS256"
        });
    else
        throw new Error("secret and expirein must be provided in env[env Error]");
};
export const verifyToken = (token) => new Promise((resolve, reject) => {
    if (typeof configUser.jwt.secret == "string")
        jwt.verify(token, configUser.jwt.secret, (err, payload) => {
            if (err)
                return reject(err);
            resolve(payload);
        });
    else
        reject(new Error("secret and expirein must be provided in env[env Error]"));
});
export const newactiveToken = (username, email) => {
    if (typeof configUser.jwt.activeSecret == "string" && typeof configUser.jwt.activeEspires === "string")
        return jwt.sign({ usename: username, email: email }, configUser.jwt.activeSecret, {
            expiresIn: configUser.jwt.activeEspires
        });
    else
        throw new Error("secret and expirein must be provided in env[env Error]");
};
export const verifyActiveToken = (token) => {
    return new Promise((resolve, reject) => {
        if (typeof configUser.jwt.activeSecret == "string")
            jwt.verify(token, configUser.jwt.activeSecret, (err, payload) => {
                if (err)
                    return reject(err);
                resolve(payload);
            });
        else
            reject(new Error("secret and expirein must be provided in env[env Error]"));
    });
};
export const newResetToken = (user) => {
    if (typeof configUser.jwt.resetSecret == "string" && typeof configUser.jwt.resetEspires === "string")
        return jwt.sign({ id: user._id, username: user.username, email: user.email }, configUser.jwt.resetSecret, {
            expiresIn: configUser.jwt.resetEspires
        });
    else
        throw new Error("secret and expirein must be provided in env[env Error]");
};
export const verifyResetToken = (token) => {
    return new Promise((resolve, reject) => {
        if (typeof configUser.jwt.resetSecret == "string")
            jwt.verify(token, configUser.jwt.resetSecret, (err, payload) => {
                if (err)
                    return reject(err);
                resolve(payload);
            });
        else
            reject(new Error("secret and expirein must be provided in env[env Error]"));
    });
};
//controller for sign up
export async function register(req, res) {
    try {
        if (!req.body.username || !req.body.email || !req.body.password)
            return res.status(400).json({ result: "error", message: "required username, email and password" });
        const acriveToken = newactiveToken(req.body.username, req.body.email);
        req.body.activated_tokken = acriveToken;
        const model = await User.create(req.body);
        const flag = await sendActivateEmail(req.body.email, acriveToken);
        if (flag) {
            return res.status(201).json({ result: "warning", message: "registred successfully,and email has been sent for activation " });
        }
        else {
            await User.findByIdAndRemove({ _id: model._id });
            return res.status(400).json({ result: "error", message: "error has occured" });
        }
    }
    catch (err) {
        if (err instanceof Error)
            return res.status(400).json({ result: "error", message: err.message });
        else
            return res.status(400).json({ result: "error", message: err });
    }
}
export async function activation(req, res) {
    try {
        const token = req.params.token;
        await verifyActiveToken(token);
        const user = await User.findOneAndUpdate({ activated_tokken: token }, { activated_status: true, activated_tokken: "" }, { new: true })
            .select("username activated_status");
        if (!user)
            throw new Error("couldn't find the user");
        return res.redirect("http://localhost:8000/login/success");
    }
    catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
            return res.redirect("http://localhost:8000/login/error");
        }
    }
}
//sign in with username password
export async function signin(req, res) {
    try {
        if (!req.body.username || !req.body.password)
            return res.status(400).json({ result: "error", message: "required username and password" });
        const user = await User.findOne({ username: req.body.username })
            .select('username password activated_status level')
            .exec();
        if (!user) {
            return res.status(401).json({ result: "error", message: "no such user" });
        }
        if (!(await user.checkPassword(req.body.password)))
            return res.status(401).json({ result: "error", message: "wrong username or password" });
        else {
            // console.log(user)
            if (user.activated_status === false)
                throw new Error("user not activated ");
            const tokken = newToken(user);
            return res.status(200).json({ result: "success", message: "singin successfully", token: tokken });
        }
    }
    catch (err) {
        if (err instanceof Error)
            return res.status(400).json({ result: "error", message: err.message });
    }
    return res.status(500).end();
}
function isPayload(payload) {
    if (payload.id !== undefined && payload.level !== undefined)
        return true;
    else
        return true;
}
//middleware
export const protect = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({ result: "error", message: "bad tokken" });
    }
    const token = bearer.split('Bearer ')[1].trim();
    let payload;
    try {
        payload = await verifyToken(token);
    }
    catch (e) {
        return res.status(401).json({ result: "error", message: "bad tokken" });
    }
    // console.log(payload)
    //if we reach here means the tokken didn't throw
    if (isPayload(payload)) {
        const user = await User.findById(payload.id)
            .select('-password')
            .lean()
            .exec();
        if (!user) {
            return res.status(401).end();
        }
        // console.log(user)?
        req.user = user;
    }
    else {
        // console.log("what")
    }
    next();
};
//Password Routes,[ask to reset with the username , reset with the resetpassword token as link query][/password/reset/ , /password/reset?token={token}]
export async function AskResetPassword(req, res) {
    try {
        const { username } = req.body;
        if (username === undefined)
            throw new Error("body must contain username");
        let user = await User.findOne({ username: username })
            .select("username email")
            .exec();
        if (!user)
            throw new Error("user not found");
        const token = newResetToken(user);
        user = await User.findOneAndUpdate({ username: username }, { resetPasswordToken: token }, { new: true })
            .select("username email")
            .exec();
        // console.log(user)
        if (!user)
            throw new Error("problem with the database");
        const flag = await sendResetPasswordEmail(user.email, token);
        if (flag)
            return res.status(201).json({ result: "warning", message: "email sent to reset password" });
        else
            throw new Error("email Error");
    }
    catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
            return res.status(400).json({ result: "error", message: err.message });
        }
    }
}
export async function resetPassword(req, res) {
    try {
        const token = req.query.token;
        if (!token)
            throw new Error("No Token");
        const { password } = req.body;
        if (!password)
            throw new Error("body must contain password");
        if (typeof token === "string") {
            await verifyResetToken(token);
        }
        else
            throw new Error("token must be string");
        const user = await User.findOneAndUpdate({ resetPasswordToken: token }, { resetPasswordToken: "", password: password }, { new: true })
            .select("username resetPasswordToken")
            .exec();
        if (!user)
            throw new Error("coudln't save changes");
        return res.json({ result: "success", message: "Password update succesfully your can try login again" });
    }
    catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
            return res.status(400).json({ result: "error", message: err.message });
        }
    }
}
async function sendActivateEmail(email, token) {
    const msg = {
        to: email,
        from: 'nagynabil651@gmail.com',
        subject: 'Account activation link',
        html: `
        <h1>Please use the following link to activate your account</h1>
        <a href="http://localhost:8000/activation/${token}">Activation Link</a>
        <hr />
        <p>This email may contain sensetive information</p>
        <p>and link will  expired in 15 minutes</p>
    `,
    };
    try {
        await sgMail.send(msg);
        return true;
    }
    catch (err) {
        return false;
    }
}
async function sendResetPasswordEmail(email, token) {
    const msg = {
        to: email,
        from: 'nagynabil651@gmail.com',
        subject: 'Password Reset link',
        html: `
        <h1>Please use the following link to Reset Your Password</h1>
        <a href="http://localhost:3000/password-reset/${token}">Reset Password Link</a>
        <hr />
        <p>This email may contain sensetive information</p>
        <p>and link will  expired in 15 minutes</p>
    `,
    };
    try {
        await sgMail.send(msg);
        return true;
    }
    catch (err) {
        return false;
    }
}

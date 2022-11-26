import { User } from "./user.model.js";
import formidable from "formidable";
import fs from "fs/promises";
import { saveAvatar } from "../../utils/general.js";
export async function me(req, res) {
    if (req.user !== undefined)
        return res.status(200).json({ result: "success", user: req.user });
    else
        return res.status(500).json({ result: "error", message: "no user in req body" });
}
export async function updateMe(req, res) {
    try {
        if (req.user === undefined)
            throw new Error("no user");
        // console.log(req.user)
        try {
            await fs.access("public");
            console.log("access");
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.message.includes("no such file or directory"))
                    fs.mkdir("public");
            }
        }
        const form = formidable({ multiples: true, maxFileSize: 50 * 1024 * 1024,
            uploadDir: "public" }); //max 5mb
        form.parse(req, async (err, fields, files) => {
            try {
                if (err) {
                    throw err;
                }
                let filePath = undefined; // undefined to not update the avatar if not supplied
                if (files.avatar !== undefined) { //user got avatar
                    const file = files.avatar;
                    filePath = await saveAvatar(file, req.user.username);
                    if (filePath === undefined)
                        throw new Error("files Error");
                }
                let updated = await User.findByIdAndUpdate({ _id: req.user._id }, { ...fields, avatar: filePath }, { new: true })
                    .lean()
                    .exec();
                if (updated === null || updated === undefined)
                    throw new Error("couldn't find the user [no update]");
                return res.status(201).json({ result: "success", message: "updated successfully" });
                // console.log(updated)}
            }
            catch (err) {
                if (err instanceof Error) {
                    console.log(err.message);
                    return res.status(400).json({ result: "error", message: err.message });
                }
                else {
                    return res.status(400).json({ result: "error", message: err });
                }
            }
        });
    }
    catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
            if (err.message.includes("no such file or directory"))
                return res.status(400).json({ result: "error", message: "files error" });
            return res.status(400).json({ result: "error", message: err.message });
        }
        else {
            return res.status(400).json({ result: "error", message: err });
        }
    }
}

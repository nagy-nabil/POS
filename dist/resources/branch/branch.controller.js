import { crudControllers } from '../../utils/CRUD.js';
import { Branch } from "./branch.model.js";
import { saveAvatar } from '../../utils/general.js';
import fs from "fs/promises";
import formidable from 'formidable';
function isFieldsComplete(fields) {
    if (fields.name === undefined || fields.tel === undefined)
        return new Error("fields must contain name and tel");
}
export async function createOne(req, res) {
    try {
        if (req.user === undefined)
            throw new Error("no user");
        try {
            await fs.access("public");
            // console.log("access")
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
                let flag = isFieldsComplete(fields);
                if (flag instanceof Error)
                    throw flag;
                let filePath = undefined; // undefined to not update the avatar if not supplied
                if (files.frontimage !== undefined) { //got front image
                    const file = files.frontimage;
                    if (typeof fields.name == "string")
                        filePath = await saveAvatar(file, fields.name);
                    if (filePath === undefined)
                        throw new Error("files Error");
                }
                const newModel = await Branch.create({ ...fields, createdBy: req.user, frontimage: filePath });
                return res.status(201).json({ result: "success", message: "created successfully" });
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
export async function updateOne(req, res) {
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
                let flag = isFieldsComplete(fields);
                if (flag instanceof Error)
                    throw flag;
                let filePath = undefined; // undefined to not update the avatar if not supplied
                if (files.frontimage !== undefined) { //got image
                    const file = files.frontimage;
                    console.log(fields.name, typeof fields.name);
                    if (typeof fields.name == "string")
                        filePath = await saveAvatar(file, fields.name);
                    if (filePath === undefined)
                        throw new Error("files Error");
                }
                let updated = await Branch.findByIdAndUpdate({ _id: req.params.id }, { ...fields, frontimage: filePath }, { new: true })
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
export default crudControllers(Branch);

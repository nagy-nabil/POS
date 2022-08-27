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
        //to make sure the server got public folder and don't raise error
        try {
            await fs.access("public");
            // console.log("access")
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.message.includes("no such file or directory"))
                    fs.mkdir("public");
            }
            else
                throw err;
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
                let machines = [];
                if (typeof fields.machines === "string" && fields.machines.length > 0)
                    machines = fields.machines.split(',');
                // const pos = await Machine.find().where('_id').in(machines).exec();
                const newModel = await Branch.create({ name: fields.name, tel: fields.tel, machines: machines, createdBy: req.user, frontimage: filePath });
                return res.status(201).json({ result: "success", message: "created successfully", data: newModel });
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
                //if the user want to update the photo we need the name so we can save the pic
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
                let machines = [];
                if (typeof fields.machines === "string" && fields.machines.length > 0)
                    machines = fields.machines.split(',');
                let updated = await Branch.findByIdAndUpdate({ _id: req.params.id }, { ...fields, frontimage: filePath, machines: machines }, { new: true })
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
export async function getMany(req, res) {
    try {
        const docs = await Branch.find({})
            .populate({ path: 'machines', select: "alias _id" })
            .sort({ created: -1 })
            .lean()
            .exec();
        return res.status(200).json({ result: "success", data: docs });
    }
    catch (err) {
        if (err instanceof Error)
            return res.status(400).json({ result: "error", message: err.message });
    }
}
export async function getOne(req, res) {
    try {
        const doc = await Branch.findOne({ _id: req.params.id })
            .populate({ path: "machines", select: "_id alias" })
            .lean()
            .exec();
        if (!doc) {
            throw new Error("couldn't get data");
        }
        return res.status(200).json({ result: "success", message: "data has been sent successfully", data: doc });
    }
    catch (err) {
        if (err instanceof Error)
            return res.status(400).json({ result: "error", message: err.message });
    }
}
export default crudControllers(Branch);

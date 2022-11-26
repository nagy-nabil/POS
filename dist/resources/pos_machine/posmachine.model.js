import mongoose from "mongoose";
const MachineSchema = new mongoose.Schema({
    alias: { type: String, required: true },
    serial_number: { type: String, required: true },
    created: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId }
});
MachineSchema.index({ serial_number: 1 }, { unique: true });
export const Machine = mongoose.model("machine", MachineSchema);

// Staff Model to contain: name, team, role, picture and attendance
// Note: To simplify the case, put the attendance in the Staff Model
const mongoose = require("mongoose");
const StaffSchema = new mongoose.Schema({
    name: {
        type: { title: String, first: String, last: String },
        required: false,
    },
    team: {
        type: Number,
        required: false,
    },
    role: {
        type: String,
        required: false,
    },
    picture: {
        type: String,
        required: false,
    },
    attendance: {
        type: [Date],
        required: false,
    },
});
module.exports = mongoose.model("Staff", StaffSchema);
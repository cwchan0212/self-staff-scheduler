require("../models/database");
const Staff = require("../models/Staff");

// --------------------------------------------------------------------------------------------------------------------
// GET method: route to homepage - [index] view
exports.homepage = async (req, res) => {
  try {
    // Set today's date as startDate and staffDate
    const startDate = new Date();
    const staffDate = startDate;
    // Set the formula to find the last date of the month
    let lastDayOfMonth = new Date(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1) - 1).getDate();

    // Set the endDate of the period end of the month
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), lastDayOfMonth, 23, 59, 59);
    // Display the route - homepage
    console.log("[Homepage]: ", startDate, " -> ", endDate, "[", staffDate, "]");

    let staff = null;
    // Use attendanceStaff to check the number of staff who have attendance
    // It may not be necessary but I keep it here
    let attendanceStaff = await Staff.find({ attendance: { $gte: startDate, $lte: endDate } }).sort({ team: 1 });
    if (attendanceStaff) {
      // Retrieve all the staff's records, regardless of the existence of their attendance records
      staff = await Staff.find({ attendance: { $exists: true } }).sort({ team: 1 });
      res.render("index", { title: "Staff Scheduler", staff, staffDate });
    }
  } catch (error) {
    res.status(500).send({ message: error.message || "Error occurred" });
  }
};

// --------------------------------------------------------------------------------------------------------------------
// POST method: route to view report - [report] view
exports.viewReport = async (req, res) => {
  try {
    let post = req.body;
    let team = req.body.team;

    const staffDate = req.body.staffDate;
    // Set staffDate to startDate to form the endDate
    const startDate = new Date(staffDate);
    let lastDayOfMonth = new Date(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1) - 1).getDate();
    let staff = null;
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), lastDayOfMonth, 23, 59, 59);

    // Display the route - Report
    console.log("[Report]: ", startDate, " -> ", endDate, "[" , staffDate , "]");
    console.log("post: ", post);

    // If the user clicks the "all" button to show the attendance record of all the teams
    if (team === "all") {
      staff = await Staff.find({ attendance: { $exists: true } }).sort({ team: 1 });
      // If the user clicks the team number button to show the attendance record of the specific team
    } else {
      staff = await Staff.find({ team: { $eq: team }, attendance: { $exists: true } }).sort({ team: 1 });
    }
    res.render("report", { title: "Staff Scheduler", staff, staffDate, team });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error occurred" });
  }
};

// --------------------------------------------------------------------------------------------------------------------
// POST method: route to the table for the preview/next month - [index] view
exports.switchMonth = async (req, res) => {
  try {
    let post = req.body;

    const staffDate = req.body.staffDate;
    const startDate = new Date(staffDate);
    let lastDayOfMonth = new Date(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1) - 1).getDate();
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), lastDayOfMonth, 23, 59, 59);
    let staff = null;

    // Display the route - Switch to the table for the previous/next month
    console.log("[Switch]: ", startDate, " -> ", endDate, "[", staffDate, "]");
    console.log("post: ", post);

    let attendanceStaff = await Staff.find({ attendance: { $gte: startDate, $lte: endDate } }).sort({ team: 1 });
    if (attendanceStaff.length > 0) {
      staff = await Staff.find({ attendance: { $exists: true } }).sort({ team: 1 });
    } else {
      staff = await Staff.find({}, "name team role picture").sort({ team: 1 });
    }
    res.render("index", { title: "Staff Scheduler", staff, staffDate });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error occurred" });
  }
};

// --------------------------------------------------------------------------------------------------------------------
// POST method: route to save the attendance records of the staff - [index] view
exports.saveRecords = async (req, res) => {
  try {
    let post = req.body;
    let ids = req.body.id;
    const staffDate = req.body.staffDate;
    let [year, month] = staffDate.split("-");
    // Set month -1 for creation of Date object by JavaScript
    // The method of getMonth() returns 0 - 11 for January to December
    month = month - 1;
    const startDate = new Date(parseInt(year), parseInt(month), 1, 0, 0, 0);
    const lastDayOfMonth = new Date(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1) - 1).getDate();
    const endDate = new Date(parseInt(year), parseInt(month), lastDayOfMonth, 23, 59, 59);

    // Display the route - Switch to the table for the previous/next month
    console.log("[SAVE]: ", startDate, " -> ", endDate, "[", staffDate, "]");
    console.log("post: ", post);

    for (let id of ids) {
      if (id) {
        // Request all the id with the suffix "_date" for updating the attendance dates of the staff
        if (req.body[id + "_date"] !== undefined) {
          // Set the empty array to store the empty attendance record
          // As no attendance date is checked
          let dateArray = [];
          let date = req.body[id + "_date"];
          if (date) {
            if (Array.isArray(date)) {
              dateArray = dateArray.concat(date);
            } else {
              dateArray.push(date);
            }
            // Sort the attendance dates before updating the table
            // Not necessary but I still keep it
            dateArray.sort((a, b) => a - b);
          }
          // Track the id of the staff and the startDate and endDate
          console.log("Track:", id, startDate, " - ", endDate);

          // Delete the attendance dates of the staff that matched within the period from startDate to endDate
          // then add back the new attendance dates array to the database
          Staff.findByIdAndUpdate(id, { $pull: { attendance: { $gte: startDate, $lte: endDate } } }, (err, staff) => {
            if (err) {
              console.log(err);
            } else {
              // Track the id to delete the attendance dates within the startDate and endDate
              console.log("-", id, startDate, " --- ", endDate);
              Staff.findByIdAndUpdate(id, { $addToSet: { attendance: { $each: dateArray } } }, { new: true }, (err, staff) => {
                if (err) {
                  console.log(err);
                } else {
                  // Track the id to add the attendance dates
                  console.log("+", id, dateArray);
                  staff.save();
                }
              });
            }
          });
        } else {
          // In the case, the staff removes the last attendance date,
          // it only deletes the attendance dates in the period from startDate to endDate
          Staff.updateOne({ _id: id }, { $pull: { attendance: { $gte: startDate, $lte: endDate } } }, (err, staff) => {
            if (err) console.log(err);
          });
        }
      }
    }
    let staff = null;
    let attendanceStaff = await Staff.find({ attendance: { $gte: startDate, $lte: endDate } }).sort({ team: 1 });
    if (attendanceStaff.length >= 0) {
      staff = await Staff.find({ attendance: { $exists: true } }).sort({ team: 1 });
    } else {
      staff = await Staff.find({}, "name team role picture").sort({ team: 1 });
    }
    res.render("index", { title: "Staff Scheduler", staff, staffDate });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error occurred" });
  }
};

// --------------------------------------------------------------------------------------------------------------------
// POST method: route to load the staff's report - [staff] view
exports.viewStaffReport = async (req, res) => {
  let post = req.body;
  let id = req.body.staffId;
  const staffDate = req.body.staffDate;
  const startDate = new Date(staffDate);
  let [year, month] = staffDate.split("-");
  month = month - 1;

  const lastDayOfMonth = new Date(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1) - 1).getDate();
  const endDate = new Date(parseInt(year), parseInt(month), lastDayOfMonth, 23, 59, 59);
    // Display the route - load the staff's report 
  console.log("[STAFF]: ", startDate, " -> ", endDate, "[", staffDate, "]");
  console.log("post: ", post);

  let staff = null;
  staff = await Staff.findById(id);
  res.render("staff", { title: "Staff Scheduler", staff, staffDate });
};

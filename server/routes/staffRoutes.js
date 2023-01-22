// Route to different views

const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");

router.get("/", staffController.homepage);
router.post("/", staffController.switchMonth);
router.post("/action", staffController.saveRecords)
router.post("/report", staffController.viewReport)
router.post("/report/:id", staffController.viewStaffReport);

module.exports = router;

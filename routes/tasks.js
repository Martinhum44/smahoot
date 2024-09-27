const express = require("express")
const router = express.Router()

const {createTask, getTasks, reqbodyGoodMW, updateTask, deleteTask, createAccount} = require("../controllers/tasks")
router.use(express.json())
 
router.route("/:id").get(getTasks).put(reqbodyGoodMW("add"),createTask)
router.route("/:id/:task").patch(reqbodyGoodMW("update"),updateTask).delete(deleteTask)
router.route("/accounts").post(createAccount)
 
module.exports = router    
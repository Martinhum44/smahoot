const express = require("express")
const router = express.Router()
const cors = require("cors")

const {getQuiz, reqbodyGoodMW, createQuiz} = require("../controllers/tasks")
router.use(cors())
router.use(express.json())
 
router.route("/:id").get(getQuiz)
router.route("/").post(createQuiz)
 
module.exports = router    


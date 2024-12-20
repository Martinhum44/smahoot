const { quiz } = require("../models/task")
const asyncW = require("../middleware/asyncwrapper")
const {OurErrorVersion} = require("../middleware/error")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const cors = require("cors")
const { exists } = require("fs")

const app2 = express()
app2.use(cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    credentials: true,
}))
const server = http.createServer(app2)
const io = socketio(server, {cors:{
    origin: "http://localhost:5173", // replace with your client's URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true // if you need to send cookies or authorization headers
}})
let games = {}

io.on("connection", (socket) => {
    socket.on("join", (data) => {
        const { player, pin } = data;
        console.log("join:",player);

        if (!games[pin]) {
            return socket.emit("error", `Game with pin ${pin} does not exist`);
        }
        if (games[pin].players.find(p => p.name === player)) {
            return socket.emit("error", `Player ${player} has already joined`);
        }
        games[pin].players.push({ name: player, score: 0 });
        socket.emit("joinReturn", { name: player, score: 0, quiz: games[pin].quiz }); 
        io.emit("joinReturnHost", { name: player, score: 0, pin: pin, quiz: games[pin].quiz });
    })

    socket.on("gameOn", (pin) => {
        io.emit("gameOnReturn",pin)
        console.log("game on:",pin);
    })

    socket.on("startGame", (pin) => {
        io.emit("startGameReturn",pin)
        console.log("game started:",pin);
    })

    socket.on("submit", (obj) => {
        let newScore = 0

        if(obj.answer){
            games[obj.game].place += 1
            if(games[obj.game].place == 1){
                newScore = 1000
            } else if (games[obj.game].place == 2) {
                newScore = 850
            } else if (games[obj.game].place == 3) {
                newScore = 700
            } else {
                newScore = 500
            }
        }

        console.log("Submit:",obj)
        io.emit("submitReturnUser",{pin: obj.game, username: obj.name, answer: obj.answer, place: obj.answer ? games[obj.game].place : null, scoreWon: newScore, newScore: obj.existingScore+newScore})
        io.emit("submitReturn",{...obj, newScore: obj.existingScore + newScore})
    })

    socket.on("leaderboard", (pin) => {
        console.log("Leaderboard:",pin)
        io.emit("leaderboardReturn",pin)
    })

    socket.on("next", (pin) => {
        games[pin].place = 0
        console.log("Next question:",pin)
        io.emit("nextReturn",pin)
    })

    socket.on("gameover", (pin) => {
        console.log("Game over:",pin)
        io.emit("gameoverReturn",pin)
    })
}) 

const createQuiz = asyncW(async (req, res, next) => {
    const {questions, name} = req.body 
    console.log(await quiz.findOne({name: name})) 
    if(await quiz.findOne({name: name})){
        throw new OurErrorVersion(`Quiz with name ${name} already exists`, 400)
    }

    if(!questions || !name){
        throw new OurErrorVersion("quiz's name or id not included", 400)
    }

    console.log(questions)
    questions.forEach(element => {
        const {answers, title} = element
        console.log(typeof element)
        if(typeof element != "object"){
            throw new OurErrorVersion("type of questions MUST be an object", 400)
        }

        if(!title){
           throw new OurErrorVersion("question title not included", 400)
        }

        if(!answers){
            throw new OurErrorVersion("question answers not included", 400)
        }

        if(answers.length < 2 || answers.length > 4){
            throw new OurErrorVersion(answers.length < 2 ? `answer amount to low. Answer amount ${answers.length}` : `answer amount to high. Answer amount ${answers.length}`, 400)
        }

        answers.forEach(element2 => {
            if(typeof element2 != "object"){
                throw new OurErrorVersion("type of answers MUST be an object", 400)
            }

            const {rightOne, body} = element2
            const body2 = body == undefined ? "" : body
            console.log("ro",rightOne, "bo",body) 
            if(rightOne == undefined){
                throw new OurErrorVersion("rightOne not inclueded", 400)
            }
        })
    });
     await quiz.create({questions:questions,name:name})
     await res.status(201).json({quiz:{questions:questions,name:name,id:quiz.findOne({questions:questions}).id},success:true})
})

const getQuiz = asyncW(async(req,res,next) => {
    const code = Math.floor(Math.random()*8999999)+1000000
    console.log(code)
    const QUIZ = await quiz.findOne({name:req.params.id})
    if(!QUIZ){
        throw new OurErrorVersion(`Quiz with name ${req.params.id} not found :(`, 404)
    }
    res.status(200).json({success:true,quiz:QUIZ,gamePin:code})
    games[code] = {quiz:QUIZ, players: [], place: 0}
})

module.exports = {createQuiz, getQuiz} 

while (true){
    let port = 5000
    try{ 
        server.listen(port, () => {
            console.log('Server is running on http://localhost:'+port);
        });
        break
    } catch(e){
        console.log("port "+port+" in use. Trying another")
        port +=1
    }
} 
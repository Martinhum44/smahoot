import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QuestionBuilder from './QuestionBuilder.jsx';
import './App.css';
import { io } from 'socket.io-client';

function App() {
  const socket = useRef("http://localhost:5000");
  const [questions, setQuestions] = useState({});
  const [questAmount, setQuestAmount] = useState([]);
  const [allOk, setAllOk] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState('select');
  const [pin, setPin] = useState(null);
  const [players, setPlayers] = useState([]);
  const [user, setUser] = useState(null);
  const [game, setGame] = useState(null);
  const [gameQuestions, setGameQuestions] = useState(null);
  const [userName, setUserName] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [questionIndex, setQuestionIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [currentlyAnswered, setCurrentlyAnswered] = useState(0);
  const [rightOrWrong, setRightOrWrong] = useState(null);
  const swic = useRef(1000);
  const [scoreWon, setScoreWon] = useState(1000);
  const intervalId = useRef(null);
  const playerData = useRef([]);
  const playerLength = useRef(0);
  const gameQuestionLength = useRef(0);
  const questionIndexRef = useRef(0);
  const time = useRef(0);
  const swicRef = useRef(1000);

  socket.current = io("http://localhost:5000");

  function doNothing() {}

  useEffect(() => {
    let aok = true;
    if (name === '') {
      aok = false;
    }
    for (const key in questions) {
      if (questions[key] && !questions[key].ok) {
        aok = false;
        break;
      }
    }
    setAllOk(aok);
  }, [questions, name]);

  useEffect(() => {
    if (gameQuestions != null) {
      console.log("QSI:", questionIndex);
      console.log(gameQuestions.questions[questionIndex]);
    }
    questionIndexRef.current = questionIndex;
    clearInterval(intervalId.current);
    console.log("question index CLEARED", questionIndex);
  }, [questionIndex]);

  useEffect(() => {
    gameQuestionLength.current = gameQuestions == null ? 0 : gameQuestions.questions.length;
  }, [gameQuestions]);

  useEffect(() => {
    socket.current.on('joinReturnHost', (data) => {
      console.log('join return', data);
      console.log(data.pin, pin);
      if (data.pin == pin) {
        console.log(data.pin, pin);
        setPlayers(p => [...p, data.name]);
        setGameQuestions(data.quiz);
      }
    });

    function func(objReturned) {
      console.log(objReturned);
      console.log("in func", objReturned.game, pin);
      console.log(objReturned.game == pin);
      if (objReturned.game == pin) {
        const tempData = [...playerData.current, { name: objReturned.name, score: objReturned.newScore }];
        playerData.current = tempData.sort((a, b) => b.score - a.score);
        for (let i = 0; i < playerData.current.length; i++) {
          playerData.current[i].place = i + 1;
          console.log(playerData.current[i].place);
        }
        setCurrentlyAnswered(prevCount => {
          const newCount = prevCount + 1;
          console.log(newCount, playerLength.current);
          if (newCount === playerLength.current) {
            console.log("LENGTH: " + gameQuestionLength.current, "INDEX:", questionIndexRef.current);
            if (gameQuestionLength.current == questionIndexRef.current + 1) {
              socket.current.emit("gameover", pin);
              setCreating("gameover");
            } else {
              socket.current.emit("leaderboard", pin);
              setCreating("leaderboard");
            }
            return 0;
          }
          return newCount;
        });
      }
    }
    socket.current.on("submitReturn", func);
  }, [pin]);

  useEffect(() => {
    console.log(countdown);
    if (countdown === 0) {
      socket.current.emit("startGame", pin);
      return setCreating("questions");
    } else {
      setQuestionIndex(0);
    }
  }, [countdown]);

  useEffect(() => {
    playerLength.current = players.length;
  }, [players]);

  useEffect(() => {
    socket.current.on("gameOnReturn", (pinR) => {
      console.log(pinR, game);
      if (pinR == game) {
        setCreating("playing");
      }
    });

    socket.current.on("startGameReturn", (pinR) => {
      console.log("papi", pinR, game);
      if (pinR == game) {
        setQuestionIndex(0);
        setCreating("questionTime");
        console.log(questionIndex);
        intervalId.current = setInterval(() => {
          if (swicRef.current > 500) {
            swic.current = questionIndex == null ? 20 : swic.current - Math.floor(20 / (questionIndex + 1));
          }
          time.current += 1
        }, 1000);
      }
    });
  }, [game]);

  function createQuestion() {
    if (questAmount.length === 0) {
      setQuestAmount([0]);
    } else {
      setQuestAmount((qa) => [...qa, qa[qa.length - 1] + 1]);
    }
  }

  async function CQ() {
    try {
      const Questions = Object.values(questions);
      await axios.post('http://localhost:3000/api/v1/tasks', { questions: Questions, name });
      alert('Created Quiz Successfully');
      setCreating('finished');
    } catch (e) {
      console.error(e);
      alert('ERROR: ' + e.response.data.msg);
    }
  }

  // Interval cleanup function
  const clearGameInterval = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  return (
    <>
      <div style={{ display: creating == "select" ? "block" : 'none' }}>
        <h1>Welcome to Smashoot!</h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button id="green1" style={{ width: "250px" }} onClick={() => setCreating("hostart")}> Host Smashoot! </button>
          <button id="blue1" style={{ width: "250px" }} onClick={() => setCreating("creating")}> Create Smashoot! </button>
          <button id="red2" style={{ width: "250px" }} onClick={() => setCreating("joining")}> Join game </button>
        </div>
      </div>
      <div style={{ display: creating == "creating" ? "block" : 'none' }}>
        <h1>Create a Smashoot!</h1>
        <input id={"qn"} onChange={(e) => setName(e.target.value)} placeholder="Quiz Title" style={{ border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "#CECECE", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif" }} />
        <h3 style={{ marginBottom: "50px", color: "red" }}>{name == "" ? "Please provide a quiz name" : ""}</h3>
        {questAmount.map(id => {
          console.log("ID " + id)
          return <QuestionBuilder id={id} callbackChange={obj => setQuestions({ ...questions, [obj.id]: obj })} />
        })}

        <center>
          <div style={{ display: "flex", marginBottom: "20px", backgroundColor: "#CECECE", padding: "15px", borderRadius: "10px", width: "600px" }}>
            <button id="green" style={{ width: "250px" }} onClick={createQuestion}> Create question </button>
            <button id="blue" style={{ width: "250px", display: allOk == true && Object.keys(questions).length != 0 ? "block" : "none" }} onClick={CQ}> Finish creating quiz </button>
          </div>
        </center>
      </div>

      <div style={{ display: creating == "finished" ? "block" : 'none' }}>
        <h1>Smashoot! {name} created</h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button id="green1" style={{ width: "250px" }} onClick={() => setCreating("hostart")}> Host Smashoot! </button>
          <button id="blue1" style={{ width: "250px", display: allOk == true && Object.keys(questions).length != 0 ? "block" : "none" }} onClick={() => setCreating("creating")}> Create Smashoot! </button>
          <button id="red2" style={{ width: "250px" }} onClick={() => setCreating("joining")}> Join game </button>
        </div>
      </div>

      <div style={{ display: creating == "hostart" ? "block" : 'none' }}>
        <h1>Host smashoot!</h1>
        <input id="quizName" onChange={(e) => setName(e.target.value)} placeholder="Host Quiz Named: " style={{ border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "#CECECE", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom: "50px" }} /> <br></br>
        <button id="blue2" style={{ width: "400px", height: "200px", borderRadius: "20px", fontSize: "30px" }} onClick={async () => {
          let quizDetails
          try {
            quizDetails = await axios.get("http://localhost:3000/api/v1/tasks/" + document.getElementById("quizName").value)
          } catch (error) {
            console.log(error)
            return alert("ERROR " + error.response.data.msg)
          }

          setPin(quizDetails.data.gamePin)
          console.log(quizDetails)
          if (players == null) {
            setPlayers([])
          }
          console.log(socket)
          setCreating("hosting")
        }}> Host Smashoot! </button>
      </div>

      <div style={{ display: creating == "hosting" ? "block" : 'none' }}>
        <h1>Game Pin: {pin}</h1><br /><br />
        <h3>Smashooters</h3>
        <center><div style={{ width: "50%", backgroundColor: "lightgray", height: "300px", overflowY: "scroll", borderRadius: "10px" }}>{players == null ? "" : players.map(p => <p>{p}</p>)}</div><br />
          <button id="blue3" style={{ width: "250px", display: players != null && players.length == 0 ? "none" : "block", }} onClick={() => {
            socket.current.emit("gameOn", pin)

            socket.current.on("gameOnReturn", pinR => {
              if (pinR == pin) {
                setCreating("gameOn")

                setInterval(() => {
                  setCountdown(c => c > 0 ? c - 1 : 0);
                }, 1000)
                setCurrentlyAnswered(0)
              }
            })
          }}> Start Smashoot! </button>
        </center>
      </div>

      <div style={{ display: creating == "gameOn" ? "block" : "none" }}>
        <h1>Game On!</h1>
        <h3 style={{ color: "red" }}>Get ready to play a legendary Smahoot! game on {name}</h3>
        <h1 style={{ fontSize: "100px" }}>{countdown}</h1>
      </div>

      <div style={{ display: creating == "joining" ? "block" : 'none' }}>
        <h1>Join Smahoot! Game</h1>
        <input id="gamePin" onChange={(e) => setName(e.target.value)} placeholder="Game Pin: " style={{ border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "#CECECE", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom: "50px" }} /> <br />
        <input id="displayName" onChange={(e) => setName(e.target.value)} placeholder="Display Name: " style={{ border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "#CECECE", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom: "50px" }} /> <br />
        <center><br />
          <button id="blue4" style={{ width: "250px", display: "block" }} onClick={() => {
            socket.current.emit("join", { player: document.getElementById("displayName").value, pin: document.getElementById("gamePin").value })
            console.log(socket)
            socket.current.on("error", e => {
              console.log(e)
              alert(e)
            })
            socket.current.on("joinReturn", (p) => {
              console.log(p)
              if (p.name == document.getElementById("displayName").value) {
                setCreating("joined")
                setUser(p)
                setGame(document.getElementById("gamePin").value)
                setGameQuestions(p.quiz)
                setUserName(p.name)
                setScore(0)
              }
            })
          }}> Join Smashoot! Game </button>
        </center>
      </div>

      <div style={{ display: creating == "joined" ? "block" : "none" }}>
        <h1>Game Joined!</h1>
        <p>Do you see your name on screen {user != null && user.name}? </p>
      </div>

      <div style={{ display: creating == "playing" ? "block" : "none" }}>
        <h1 style={{ fontSize: "70px" }}>The game will start at any moment!</h1>
      </div>

      <div style={{ display: creating == "questions" ? "block" : "none" }}>
        <p>Question {questionIndex + 1}</p>
        <h3>Answered: {currentlyAnswered}/{players.length}</h3>
        <h1 style={{ fontSize: "50px" }}>{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].title : ""}</h1>
        <button id="bigGreen">{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[0].body : ""}</button>
        <button id="bigBlue">{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[1].body : ""}</button>
        <button id="bigRed">{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[2].body : ""}</button>
        <button id="bigYellow">{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[3].body : ""}</button>
      </div>

      <div style={{ display: creating == "questionTime" ? "block" : "none" }}>
        <p>Question {questionIndex + 1}</p>
        <h3>{userName}'s Game | Score: {score}</h3>
        <h1 style={{ fontSize: "50px" }}>{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].title : ""}</h1>
        <button id="bigGreen" onClick={() => submitHandler(gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[0].rightOne : false)}>{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[0].body : ""}</button>
        <button id="bigBlue" onClick={() => submitHandler(gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[1].rightOne : false)}>{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[1].body : ""}</button>
        <button id="bigRed" onClick={() => submitHandler(gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[2].rightOne : false)}>{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[2].body : ""}</button>
        <button id="bigYellow" onClick={() => submitHandler(gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[3].rightOne : false)}>{gameQuestions != null && gameQuestions.questions[questionIndex] ? gameQuestions.questions[questionIndex].answers[3].body : ""}</button>
      </div>

      <div style={{ display: creating == "waitingForOthers" ? "block" : "none" }}>
        <h3>{userName}'s Game</h3>
        <h1>Waiting For Others To Respond...</h1>
      </div>

      <div style={{ display: creating == "rightOrWrong" ? "block" : "none" }}>
        <h3>{userName}'s Game | Score: {score}</h3>
        <h1 style={{ fontSize: "120px", color: rightOrWrong ? "green" : "red" }}>{rightOrWrong ? "Correct :D" : "Incorrect :("}</h1>
        <h1>+{scoreWon} points</h1>
        <h1>It took {time.current} seconds to answer</h1>
      </div>

      <div style={{ display: creating == "leaderboard" ? "block" : "none" }}>
        <h1>Leaderboard</h1>
        <center><div style={{ padding: "10px", backgroundColor: "lightgrey", borderRadius: "10px", width: "300px", marginBottom: "10px" }}>{playerData.current.length >= 5 ? <><h3><span style={{ color: "gold" }}>1</span> | {playerData.current[0].name} | {playerData.current[0].score}</h3>
          <h3><span style={{ color: "silver" }}>2</span> | {playerData.current[1].name} | {playerData.current[1].score}</h3>
          <h3><span style={{ color: "brown" }}>3</span> | {playerData.current[2].name} | {playerData.current[2].score}</h3>
          <h3>4 | {playerData.current[3].name} | {playerData.current[3].score}</h3>
          <h3>5 | {playerData.current[4].name} | {playerData.current[4].score}</h3></> : playerData.current.map(player => {
            return <h3><span style={{ color: player.place == 1 ? "gold" : (player.place == 2 ? "silver" : (player.place == 3 ? "brown" : "black")) }}>{player.place}</span> | {player.name} | {player.score}</h3>
          })}</div></center>
        <button id="blue5" style={{ width: "250px" }} onClick={() => {
          socket.current.emit("next", pin)
          playerData.current = []
          setQuestionIndex(q => q + 1)
          setCreating("questions")
        }}> Next question </button>
      </div>

      <div style={{ display: creating == "gameover" ? "block" : "none" }}>
        <h1>Final Results</h1>
        <center><div style={{ padding: "10px", backgroundColor: "lightgrey", borderRadius: "10px", width: "300px", marginBottom: "10px" }}>{playerData.current.length >= 5 ? <><h3><span style={{ color: "gold" }}>1</span> | {playerData.current[0].name} | {playerData.current[0].score}</h3>
          <h3><span style={{ color: "silver" }}>2</span> | {playerData.current[1].name} | {playerData.current[1].score}</h3>
          <h3><span style={{ color: "brown" }}>3</span> | {playerData.current[2].name} | {playerData.current[2].score}</h3>
          <h3>4 | {playerData.current[3].name} | {playerData.current[3].score}</h3>
          <h3>5 | {playerData.current[4].name} | {playerData.current[4].score}</h3></> : playerData.current.map(player => {
            return <h3><span style={{ color: player.place == 1 ? "gold" : (player.place == 2 ? "silver" : (player.place == 3 ? "brown" : "black")) }}>{player.place}</span> | {player.name} | {player.score}</h3>
          })}</div></center>
        <button id="blue5" style={{ width: "250px" }} onClick={() => location.reload()}> Back to home screen </button>
      </div>

      <div style={{ display: creating == "done" ? "block" : "none" }}>
        <h3>{userName}'s Game | Final Score: {score}</h3>
        <h1 style={{ fontSize: "120px", color: rightOrWrong ? "green" : "red" }}>{rightOrWrong ? "Correct :D" : "Incorrect :("}</h1>
        <h1>+{scoreWon} points</h1>
        <h1>It took {time.current} seconds to answer</h1>
        <center><div style={{ padding: "10px", backgroundColor: "lightgrey", borderRadius: "10px", width: "350px", marginBottom: "10px" }}>
          <h1>Game Over</h1>
          <h3>Check your placement on the host's screen!</h3>
          <button id="blue5" style={{ width: "250px" }} onClick={() => location.reload()}> Back to home screen </button>
        </div></center>
      </div>
    </>
  )
  function submitHandler(rightOrWrong) {
    let sc = score
    console.log("In sumbit handler", rightOrWrong)
    if (rightOrWrong == true) {
      setScore(s => s + swic.current)
      sc += swic.current
      setScoreWon(swic.current)
      console.log("RIGHT")
      setRightOrWrong(true)
    } else {
      setRightOrWrong(false)
      setScoreWon(0)
    }
    socket.current.emit("submit", { game: game, name: userName, answer: rightOrWrong, newScore: sc })
    setCreating("waitingForOthers")
    socket.current.on("leaderboardReturn", pin => {
      console.log("PIN", pin)
      if (pin == game) {
        setCreating("rightOrWrong")
      }
    })
    socket.current.on("gameoverReturn", pin => {
      console.log("PIN", pin)
      if (pin == game) {
        setCreating("done")
      }
    })
    socket.current.on("nextReturn", pin => {
      console.log("papi", pin, game)
      if (pin == game) {
        swic.current = 1000
        time.current = 0
        intervalId.current = setInterval(() => {
          if (swicRef.current > 500) { swic.current = questionIndex == null ? 20 : swic.current - Math.floor(20 / (questionIndex + 1));}
          time.current += 1
        }, 1000)
        setCreating("questionTime")
        setQuestionIndex(questionIndex+1)
      }
    })
  }
}

export default App  
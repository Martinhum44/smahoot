import React, { useState, useEffect } from 'react'
import axios from "axios"
import QuestionBuilder from "./QuestionBuilder.jsx"
import './App.css'
import { io } from 'socket.io-client'

function App() {
  const socket = io("http://localhost:5000/")
  const [questions, setQuestions] = useState({}) 
  const [questAmount, setQuestAmount] = useState([])
  const [allOk, setAllOk] = useState(false)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState("select")
  const [pin, setPin] = useState(null)
  const [players, setPlayers] = useState(null)
  useEffect(() => {
    let aok = true
    if(name == ""){
      aok = false
    }
    for(const key in questions){
      if (questions.hasOwnProperty(key)){
        console.log(questions[key].ok)
        if(!questions[key].ok){
          aok = false
          break
        }
      }
    }
    setAllOk(aok)
    console.log(questions)
  }, [questions, name])

  useEffect(() => console.log(questAmount),[questAmount])
  function createQuestion(){
    console.log("ghj")
    if (questAmount.length == 0){
      setQuestAmount([0])
    } else {
      setQuestAmount(qa => [...qa, qa[qa.length-1]+1]) 
    }
  }

  async function CQ(){
    try{
      let Questions = []
      for(const key in questions){
        Questions.push(questions[key])
      }
      console.log(Questions)
      await axios.post("http://localhost:3000/api/v1/tasks",{questions:Questions,name})
      alert("Created Quiz Successfully")
      setCreating("finished")
    } catch(e){
      console.error(e)
      alert("ERROR: "+e.response.data.msg)
    }
    
  }

  return (
    <>
      <div style={{display: creating == "select" ? "block" : 'none'}}>
      <h1>Welcome to Smashoot!</h1>
        <div style={{display: "flex", justifyContent: "center"}}>
          <button id="green1" style={{ width: "250px" }} onClick={() => setCreating("hostart")}> Host Smashoot! </button>
          <button id="blue1" style={{ width: "250px"}} onClick={() => setCreating("creating")}> Create Smashoot! </button>
          <button id="red2" style={{ width: "250px"}} onClick={() => setCreating("joining")}> Join game </button>
        </div>
      </div>
      <div style={{display: creating == "creating" ? "block" : 'none'}}>
        <h1>Create a Smashoot!</h1>
        <input id={"qn"} onChange={(e) => setName(e.target.value)} placeholder="Quiz Title" style={{border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "#CECECE", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"}}/>
        <h3 style={{marginBottom:"50px", color:"red"}}>{name == ""?"Please provide a quiz name":""}</h3>
        {questAmount.map(id => {
          console.log("ID "+id)
          return <QuestionBuilder id={id} callbackChange={obj => setQuestions({...questions, [obj.id]:obj})}/>
        })}
        
        <center>
          <div style={{ display: "flex", marginBottom: "20px", backgroundColor: "#CECECE", padding: "15px", borderRadius: "10px", width: "600px" }}>
            <button id="green" style={{ width: "250px" }} onClick={createQuestion}> Create question </button>
            <button id="blue" style={{ width: "250px", display: allOk == true && Object.keys(questions).length != 0 ? "block" : "none" }} onClick={CQ}> Finish creating quiz </button>
          </div>
        </center>
      </div>

      <div style={{display: creating == "finished" ? "block" : 'none'}}>
        <h1>Smashoot! {name} created</h1>
        <div style={{display: "flex", justifyContent: "center"}}>
          <button id="green1" style={{ width: "250px" }} onClick={() => setCreating("hostart")}> Host Smashoot! </button>
          <button id="blue1" style={{ width: "250px", display: allOk == true && Object.keys(questions).length != 0 ? "block" : "none" }} onClick={() => setCreating("creating")}> Create Smashoot! </button>
          <button id="red2" style={{ width: "250px"}} onClick={() => setCreating("joining")}> Join game </button>
        </div>
      </div>

      <div style={{display: creating == "hostart" ? "block" : 'none'}}>
        <h1>Host smashoot!</h1>
        <input id="quizName" onChange={(e) => setName(e.target.value)} placeholder="Host Quiz Named: " style={{border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "#CECECE", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom:"50px"}}/> <br></br>
        <button id="blue2" style={{ width: "400px", height:"200px", borderRadius:"20px", fontSize: "30px" }} onClick={async() => {
          let quizDetails
          try{
            quizDetails = await axios.get("http://localhost:3000/api/v1/tasks/"+document.getElementById("quizName").value)
          } catch (error){
            console.log(error)
            return alert("ERROR "+error.response.data.msg)
          }

          setPin(quizDetails.data.gamePin)
          console.log(quizDetails)
          setCreating("hosting")
          setPlayers([])
          socket.on("joinReturn", p => {
            setPlayers(pls => [...pls, p])
          })
        }}> Host Smashoot! </button>
      </div>

      <div style={{display: creating == "hosting" ? "block" : 'none'}}>
        <h1>Game Pin: {pin}</h1><br/><br/>
        <h3>Smashooters</h3>
        <center><div style={{width:"50%", backgroundColor:"lightgray", height:"300px", overflowY:"scroll", borderRadius:"10px"}}>{players == null ? "" : players.map(p => <p>{p}</p>)}</div><br />
        <button id="blue3" style={{ width: "250px", display: "block" }} onClick={() => {}}> Start Smashoot! </button>
        </center>
      </div>

      <div style={{display: creating == "joining" ? "block" : 'none'}}>
        <h1>Join Smahoot! Game</h1>
        <input id="gamePin" onChange={(e) => setName(e.target.value)} placeholder="Game Pin: " style={{border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "#CECECE", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom:"50px"}}/> <br/>
        <input id="displayName" onChange={(e) => setName(e.target.value)} placeholder="Display Name: " style={{border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "#CECECE", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom:"50px"}}/> <br/>
        <center><br />
        <button id="blue4" style={{ width: "250px", display: "block" }} onClick={() => {
          socket.emit("join",{player:document.getElementById("displayName").value,pin:document.getElementById("gamePin").value})
          socket.on("error", e => {
            console.log(e)
            alert(e)
          })
          socket.on("joinReturn", (p) => { 
            console.log(p)
            if (p == document.getElementById("displayName").value){
              setCreating("joined")
            }
          })
        }}> Join Smashoot! Game </button>
        </center>
      </div>

      <div></div>
    </>
  )
}

export default App

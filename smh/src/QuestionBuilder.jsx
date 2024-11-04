import React, {useState, useEffect} from "react"

function QuestionBuilder(props){
    const [amountChecked, setAmountChecked] = useState(0)
    const [name, setName] = useState("")

    function amc(e){
        console.log(e.target.checked)
        if(e.target.checked == true){
            setAmountChecked(f => f+1)
        } else {
            setAmountChecked(f => f-1)
        }
    }

    const cbc = () => {
        console.log(amountChecked)
        setName(document.getElementById(`name${props.id}`).value)
        props.callbackChange({
            title:document.getElementById(`name${props.id}`).value,
            answers:[{
                body: document.getElementById(`cont1${props.id}`).value,
                rightOne: document.getElementById(`check1${props.id}`).checked
            },
            {
                body: document.getElementById(`cont2${props.id}`).value,
                rightOne: document.getElementById(`check2${props.id}`).checked
            },
            {
                body: document.getElementById(`cont3${props.id}`).value,
                rightOne: document.getElementById(`check3${props.id}`).checked
            },
            {
                body: document.getElementById(`cont4${props.id}`).value,
                rightOne: document.getElementById(`check4${props.id}`).checked
            }],
            ok:name!="" && amountChecked!=0,
            id:props.id
        })
    }

    useEffect(cbc,[amountChecked, name])

    return(
        <>
        <div style={{width:"90%", backgroundColor:"#EAEBEA", marginBottom:"50px", borderRadius:"10px", padding: "20px"}} id="question">
            <input id={`name${props.id}`} onChange={cbc} placeholder="Question Title" style={{border: "none", width: "70%", height: "100px", fontSize: "50px", backgroundColor: "white", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom: "50px"}}/>
            <div style={{display:"flex", flexWrap:"wrap"}}>
                <div style={{padding:"5px",height:"50px", width: "500px", backgroundColor: "#BBB6B6", borderRadius: "10px", margin:"20px"}}>
                    <input placeholder="Answer 1" id={`cont1${props.id}`} onChange={cbc} style={{border: "none", width: "62%", height: "50px", fontSize: "20px", backgroundColor: "white", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom: "50px", display:"inline-block"}}/>
                    <p style={{display:"inline-block"}}>Correct Answer</p>
                    <input type="checkbox" id={`check1${props.id}`} onChange={amc} style={{display:"inline-block"}}></input>
                </div>
                <div style={{padding:"5px",height:"50px", width: "500px", backgroundColor: "#BBB6B6", borderRadius: "10px", margin:"20px"}}>
                    <input placeholder="Answer 2" id={`cont2${props.id}`} onChange={cbc} style={{border: "none", width: "62%", height: "50px", fontSize: "20px", backgroundColor: "white", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom: "50px", display:"inline-block"}}/>
                    <p style={{display:"inline-block"}}>Correct Answer</p>
                    <input type="checkbox" id={`check2${props.id}`} onChange={amc} style={{display:"inline-block"}}></input>
                </div>
                <div style={{padding:"5px", height:"50px", width: "500px", backgroundColor: "#BBB6B6", borderRadius: "10px", margin:"20px"}}>
                    <input placeholder="Answer 3" id={`cont3${props.id}`} onChange={cbc} style={{border: "none", width: "62%", height: "50px", fontSize: "20px", backgroundColor: "white", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom: "50px", display:"inline-block"}}/>
                    <p style={{display:"inline-block"}}>Correct Answer</p>
                    <input style={{display:"inline-block"}} onChange={amc} type="checkbox" id={`check3${props.id}`}></input>
                </div>
                <div style={{padding:"5px", height:"50px", width: "500px", backgroundColor: "#BBB6B6", borderRadius: "10px", margin:"20px"}}>
                    <input placeholder="Answer 4" id={`cont4${props.id}`} onChange={cbc} style={{border: "none", width: "62%", height: "50px", fontSize: "20px", backgroundColor: "white", borderRadius: "5px", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", marginBottom: "50px", display:"inline-block"}}/>
                    <p style={{display:"inline-block"}}>Correct Answer</p>
                    <input style={{display:"inline-block"}} onChange={amc} type="checkbox" id={`check4${props.id}`}></input>
                </div>
            </div>
            <h3 style={{color:"red"}}>{amountChecked == 0 ? "There must be at least one correct answer." : ""}</h3>
            <h3 style={{color:"red"}}>{name == "" ? "Name not provided" : ""}</h3>
        </div>
        </> 
    )
}

export default QuestionBuilder
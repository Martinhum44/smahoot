const { account: accountModel } = require("../models/task")
const asyncW = require("../middleware/asyncwrapper")
const {createCustomError} = require("../middleware/error")

const getTasks = asyncW(async (req, res, next) => {
    const { id: accountId } = req.params

    const acc = await accountModel.findOne({ number: accountId })
    console.log(acc)
 
    if(!acc){
        next(createCustomError(`Account with number ${accountId} not found`,404))
    }

    const {tasks} = acc
    const { completed, startswith } = req.query
    console.log(completed)
    var newTasks = tasks

    if (completed == "true" || completed == "false") {
        if (completed == "true") {
            console.log("getting somewhere")
            newTasks = tasks.filter(element => {
                return element.completed
            })
        } else if (completed == "false") {
            console.log("getting somewhere")
            newTasks = tasks.filter(element => {
                return !element.completed
            })
        }
    } 

    if (startswith) {
        console.log("okiedokie!!!")
        newTasks = newTasks.filter(element => {
            try {
                if (element.name.startsWith(startswith.toLowerCase()) || element.name.startsWith(startswith.toUpperCase())) {
                    return true
                }
                return false
            } catch (e) { }
        })
    }

    console.log(newTasks)
    res.status(200).json({ tasks: newTasks, success: true })
})

const createTask = asyncW(async (req, res, next) => {
    const { id: accountId } = req.params    
    const { name, description, completed } = req.body

    if (name.length > 30){
        return next(createCustomError(`Name Max Length: 30 Characters`, 400))
    }

    if (name.length > 250){
        return next(createCustomError(`Description Max Length: 250 Characters`, 400))
    }

    console.log(req.body)

    var task

    const acc = await accountModel.findOne({ number: accountId })
    const { tasks } = acc 

    if(!acc){
        next(createCustomError(`Account with number ${accountId} not found`,404))
    }

    const taskmatch = tasks.find(tasker => {
        return tasker.name == name
    })

    if(taskmatch){
        return await next(createCustomError(`Task with name: ${name} already exists`,400))
    }
 
    tasks.push({ name, description, completed })
    console.log(tasks)

    task = await accountModel.findOneAndUpdate({ number: accountId }, { $set: { tasks: tasks } }, { new: true, runValidators: true })
    res.status(201).json({ task: req.body, success: true })
})
  
const deleteTask = asyncW(async (req, res, next) => {
    const { task: name, id: accountId } = req.params
    const acc = await accountModel.findOne({ number: accountId })
    const { tasks } = acc

    const removatask = tasks.find(task => {
        return task.name == name
    }) 

    if (!removatask) {
        return await next(createCustomError(`task with name: ${name} not found`, 404))
    }

    const index = tasks.indexOf(removatask)
    tasks.splice(index, 1)

    await accountModel.findOneAndUpdate({ number: accountId }, { $set: { tasks: tasks } }, { new: true, runValidators: true })

    res.status(200).json({ task: tasks[index], success: true })
})


const updateTask = asyncW(async (req, res, next) => {
    const { task: name, id: accountId } = req.params
    const acc = await accountModel.findOne({ number: accountId })
    const { tasks } = acc

    if (req.body.description){
        if(req.body.description.length > 250){
            return next(createCustomError(`Description Max Length: 250 Characters`, 400))
        }
    }

    var foundTask = tasks.find(element => {
        return element.name == name
    })

    index = tasks.indexOf(foundTask)
    tasks[index] = foundTask
    console.log(req.body)
    if (!foundTask) {
        return await next(createCustomError(`task with name: ${name} not found`, 404))
    }

    if (req.body.completed != undefined) {
        foundTask.completed = req.body.completed
    }

    if (req.body.description) {
        foundTask.description = req.body.description
    }

    await accountModel.findOneAndUpdate({ number: accountId }, { $set: { tasks: tasks } }, { new: true, runValidators: true })

    res.status(200).json({ task: foundTask, success: true })

    //BUG: if specified to change completed to true, SUCCESS. if specified to change completed to false, STAYS AS TRUE. (FIXED)
})

const createAccount = asyncW(async (req, res) => {
    const { number } = req.body
    const accountery = await accountModel.create({ number: number })
    console.log(accountery)
    res.status(200).json({ number: accountery.number, success: true })
})

const reqbodyGoodMW = (what)=>{
    if(what == "add"){
        return async (req, res, next) => {
    
            if (typeof req.body == "object" && ((typeof req.body.name == "string" || !req.body.name) && (typeof req.body.description == "string" || !req.body.description) && (typeof req.body.completed == "boolean" || !req.body.completed))) {
                if(!req.body.completed){
                    req.body.completed = false
                }
        
                if(!req.body.name){
                    return await res.status(400).json({error:"no name no fame!!!",success:false})
                }
                req.body = { name: req.body.name, description: req.body.description, completed: req.body.completed }
                next()
            } else {
                res.status(500).json({
                    error: {
                        msg: "invalid req.body types", types: {
                            reqbodytype: typeof req.body,
                            nametype: typeof req.body.name,
                            desctype: typeof req.body.description,
                            comptype: typeof req.body.completed
                        }
                    }, success: false
                })
                console.log("here we are")
            }
        }
    } else if (what == "update"){
        return async (req, res, next) => {
    
            if (typeof req.body == "object" && ((typeof req.body.description == "string" || !req.body.description) && (typeof req.body.completed == "boolean" || !req.body.completed))) {
                req.body = { description: req.body.description, completed: req.body.completed }
                next()
            } else {
                res.status(500).json({
                    error: {
                        msg: "invalid req.body types", types: {
                            reqbodytype: typeof req.body,
                            nametype: typeof req.body.name,
                            desctype: typeof req.body.description,
                            comptype: typeof req.body.completed
                        }
                    }, success: false
                })
                console.log("here we are")
            }
        }
    }
}

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    createAccount,
    reqbodyGoodMW
}
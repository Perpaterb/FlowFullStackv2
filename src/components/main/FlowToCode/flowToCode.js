
const powerOutNodeList = [
    "function",
    "if",
    "callFunction",
    "start",
] 

// add code for everything not in functions
function startNodeToCode(nodes){
    
    let codeToAdd = ""

    // Find the start node
    let startNode = {}
    for (let node in nodes){
        if (nodes[node].type === "start"){
            startNode = nodes[node]
        }
    }
    // for each node connected to the start
    for (let connectedNode in startNode.connections.outputs){
        if (startNode.connections.outputs[connectedNode][0] !== undefined){
            let connectedNodeID = startNode.connections.outputs[connectedNode][0].nodeId
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // if node is in the powerOutNodeList
                    if (powerOutNodeList.includes(nodes[node].type)){
                        codeToAdd =  codeToAdd.concat(powerOutNodeToCode(nodes, nodes[node]))
                    // else
                    } else{
                        codeToAdd =  codeToAdd.concat(notPowerOutNodeToCode(nodes, nodes[node]))
                    }
                }
            }
        }
    }
    return codeToAdd
}

function powerOutNodeToCode(nodes, workingOnNode){
    let codeToAdd = ""
    console.log("node is conected to start and is in the power out list", workingOnNode.type)
    console.log("workingOnNode", workingOnNode)
    

        if(workingOnNode.type === "function"){
            if(workingOnNode.inputData.functionName.string !== ""){
                if (workingOnNode.inputData.export.boolean) {
                    codeToAdd = "export default " 
                }
                codeToAdd =  codeToAdd.concat("function " +workingOnNode.inputData.functionName.string + '(')
                let funcParams = []
                for(let inputs in workingOnNode.inputData){
                    if (inputs.startsWith("Parameter") && workingOnNode.inputData[inputs].string !== "" ) {
                        funcParams.push(' ' + workingOnNode.inputData[inputs].string)
                    }
                }
                codeToAdd =  codeToAdd.concat(funcParams + ') { \n')

                
            }
        }
    

    // if not "function" 
        // add code before params
        
        // for each node connected to params
            // run addParramNodesToCode(id)

        // add Open {

    
    // for each node connected this node
        // if node is in the powerOutNodeList
            // run powerOutNodeToCode(id)
        // else
            // run notPowerOutNodeToCode(id)
    // add code after params
    // add close }
    codeToAdd =  codeToAdd.concat('}')  
    return codeToAdd
}

function notPowerOutNodeToCode(nodes, workingOnNode){
    let codeToAdd = ""
    let numberOfImports = 0
    
    //console.log("workingOnNode.type", workingOnNode.type)


    // add code before params
    if(workingOnNode.type === "import"){
        // import has a file and an item selected 
        if(workingOnNode.inputData.item.item.length > 0 && workingOnNode.inputData.from.file !== ""){
            codeToAdd = "import { " + workingOnNode.inputData.item.item.join(", ") + " } from " + workingOnNode.inputData.from.file + ";\n"
        }
    }

    if(workingOnNode.type === "set variable"){
        
        // is there an imput node cionnected

        //console.log("workingOnNode", workingOnNode)

        if(workingOnNode.connections.inputs.variable === undefined) {
            if(workingOnNode.inputData.variable.variable !== "" && workingOnNode.inputData.variableName.string !== ""){
                codeToAdd = "let " + workingOnNode.inputData.variableName.string + " = " + workingOnNode.inputData.variable.variable + ";\n"
            }else{
                if(workingOnNode.inputData.variableName.string !== "") {
                    codeToAdd = "let " + workingOnNode.inputData.variableName.string + " = undefined;\n"
                }            
            }

        }else{
            if(workingOnNode.inputData.variableName.string !== ""){
                //find the connected node
                let connectedNodeID = workingOnNode.connections.inputs.variable[0].nodeId
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node

                        let passedValue = getPassingValue(nodes, nodes[node])
                        if (passedValue.variable !== ""){
                            //console.log("passedValue",passedValue)
                            if (passedValue.type === "string"){
                                // if the returning is a string.
                                codeToAdd = "let " + workingOnNode.inputData.variableName.string + ' = "' + passedValue.value + '";\n'
                            }else{
                                codeToAdd = "let " + workingOnNode.inputData.variableName.string + ' = ' + passedValue.value + ';\n'
                            }

                        }
                    }
                }
            }
        }
    }

    
    // add code before params
    // for each node connected to params
        // run addParramNodesToCode(id)
    // add code after params

    return codeToAdd
}

function addParramNodesToCode(nodes, workingOnNode){
    // add code for this param node
    // for each node in params
        // run addParramNodesToCode(id)
}

function getPassingValue(nodes, workingOnNode){
    let resault = {type: "", value: ""}

    
    // get all inputs
    //string
    if(workingOnNode.type === "string"){
        resault.type = "string"
        resault.value = '"' + workingOnNode.inputData.string.string + '"'
    }

    //integer
    if(workingOnNode.type === "integer"){
        resault.type = "integer"
        if(workingOnNode.connections.inputs.variable === undefined) {
            resault.value = workingOnNode.inputData.variable.variable
        }else {
            // prosess inputs
            let connectedNodeID = workingOnNode.connections.inputs.variable[0].nodeId
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node])
                    resault.value = passedValue.value
                }
            }
        }
    }

    //add
    if(workingOnNode.type === "add"){
        resault.type = "integer"
        let var1 = 0
        let var2 = 0
        if (workingOnNode.connections.inputs.variable1 === undefined){
            if(workingOnNode.inputData.variable1.variable !== ""){
                var1 = workingOnNode.inputData.variable1.variable
            }
        }else{
            let connectedNodeID = workingOnNode.connections.inputs.variable1[0].nodeId
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node])
                    var1 = passedValue.value
                }
            }
        }

        if (workingOnNode.connections.inputs.variable2 === undefined){
            if(workingOnNode.inputData.variable2.variable !== ""){
                var2 = workingOnNode.inputData.variable2.variable
            }   
        }else{
            let connectedNodeID = workingOnNode.connections.inputs.variable2[0].nodeId
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node])
                    var2 = passedValue.value
                }
            }
        }
        resault.value = "Number( " + var1 + " ) + Number( " + var2 + " )"
    }

    //equal
    if(workingOnNode.type === "equal"){
        resault.type = "boolean"
        let var1 = true
        let var2 = true
        if (workingOnNode.connections.inputs.variable1 === undefined){
            if(typeof workingOnNode.inputData.variable1.variable === 'string'){
                var1 = '"' + workingOnNode.inputData.variable1.variable + '"'
            }else{
                var1 = workingOnNode.inputData.variable1.variable
            }
        }else{
            let connectedNodeID = workingOnNode.connections.inputs.variable1[0].nodeId
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node])
                    var1 = passedValue.value
                }
            }
        }

        if (workingOnNode.connections.inputs.variable2 === undefined){
            if(workingOnNode.inputData.variable2.variable !== ""){
                if(typeof workingOnNode.inputData.variable2.variable === 'string'){
                    var2 = '"' + workingOnNode.inputData.variable2.variable + '"'
                }else{
                    var2 = workingOnNode.inputData.variable2.variable
                }
            }
        }else{
            let connectedNodeID = workingOnNode.connections.inputs.variable2[0].nodeId
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node])
                    var2 = passedValue.value
                }
            }
        }
        resault.value = "( " + var1 + " === "+ var2 + " )"
    }
        //concatenate
        if(workingOnNode.type === "concatenate"){
            resault.type = "variable"
            let string1 = ""
            let string2 = ""        
            if (workingOnNode.connections.inputs.string1 === undefined){
                if(workingOnNode.inputData.string1.string !== ""){
                    string1 = workingOnNode.inputData.string1.string
                }
            }else{
                let connectedNodeID = workingOnNode.connections.inputs.string1[0].nodeId
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node])
                        string1 = passedValue.value
                    }
                }
            }
    
            if (workingOnNode.connections.inputs.string2 === undefined){
                if(workingOnNode.inputData.string2.string !== ""){
                    string2 = workingOnNode.inputData.string2.string
                }   
            }else{
                let connectedNodeID = workingOnNode.connections.inputs.string2[0].nodeId
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node])
                        string2 = passedValue.value
                    }
                }
            }
            resault.value = string1 + ".concat( " + string2 + " )"
        }

        //make array
        if(workingOnNode.type === "make_array"){
            resault.type = "array"
            let array = []
            
            for(let i in workingOnNode.inputData){
                if (workingOnNode.inputData[i].variable !== "") {
                    let index = i.charAt(i.length - 1)-1
                    array[index] = workingOnNode.inputData[i].variable
                }
            }

            for(let i in workingOnNode.connections.inputs){
                let connectedNodeID = workingOnNode.connections.inputs[i][0].nodeId
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node])
                        let index = i.charAt(i.length - 1)-1
                        array[index] = passedValue.value
                    }
                }
            }
            
            array = array.join(', ')
            resault.value = '[' + array + ']'
        }

        //make Object
        if(workingOnNode.type === "make_object"){
            resault.type = "object"
            let keys = []
            let items = []
            let object = []
            
            for(let i in workingOnNode.inputData){
                if (workingOnNode.inputData[i].variable !== "" && workingOnNode.inputData[i].string !== "") {
                    if(i.substring(0, 4) === "item"){
                        let index = i.charAt(i.length - 1)-1
                        // test for item type. eg. string?
                        items[index] = workingOnNode.inputData[i].variable
                    }
                    if(i.substring(0, 3) === "key"){
                        let index = i.charAt(i.length - 1)-1
                        keys[index] = workingOnNode.inputData[i].string
                    }
                }
            }

            for(let i in workingOnNode.connections.inputs){
                let connectedNodeID = workingOnNode.connections.inputs[i][0].nodeId
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node])
                        if(i.substring(0, 4) === "item"){
                            let index = i.charAt(i.length - 1)-1
                            // test for item type. eg. string?
                            items[index] = passedValue.value
                        }
                        if(i.substring(0, 3) === "key"){
                            let index = i.charAt(i.length - 1)-1
                            keys[index] = passedValue.value
                        }
                    }
                }
            }

            for(let i in keys){
                object[i] = keys[i] + ': ' + items[i]
            }

            object = object.join(',\n\t')
            resault.value = '{\n\t' + object + '\n\t}'
        }

        //get_variable
        if(workingOnNode.type === "get_variable"){
            resault.type = "variable"
            resault.value = workingOnNode.inputData.variableName.string
        }

        
        //upper case first
        if(workingOnNode.type === "upper_case_first"){
            resault.type = "variable"
            resault.value = ""
            if (workingOnNode.connections.inputs.string !== undefined) {
                let connectedNodeID = workingOnNode.connections.inputs.string[0].nodeId
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node])
                        if (passedValue.value !== ""){
                            resault.value = passedValue.value + ".charAt(0).toUpperCase() + " + passedValue.value + ".slice(1)" 
                        }
                    }
                }
            }           
        }

        //upper case all
        if(workingOnNode.type === "upper_case_all"){
            resault.type = "variable"
            resault.value = ""
            if (workingOnNode.connections.inputs.string !== undefined) {
                let connectedNodeID = workingOnNode.connections.inputs.string[0].nodeId
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node])
                        if (passedValue.value !== ""){
                            resault.value = passedValue.value + ".toUpperCase()"
                        }
                    }
                }
            }           
        }

        //trim
        if(workingOnNode.type === "trim"){
            resault.type = "variable"
            resault.value = ""
            if (workingOnNode.connections.inputs.string !== undefined) {
                let connectedNodeID = workingOnNode.connections.inputs.string[0].nodeId
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node])
                        if (passedValue.value !== ""){
                            resault.value = passedValue.value + ".trim()"
                        }
                    }
                }
            }           
        }
        
        // Get Var
        if(workingOnNode.type.startsWith('get variable')){
            resault.type = "variable"
            let parentNodeID = workingOnNode.type.slice(13)
            for (let i in nodes){
                if(nodes[i].id === parentNodeID){
                    resault.value =  nodes[i].inputData.variableName.string
                }
            }
        }
        


    // return resault
    return resault
}



function flowToCode(flowIn){
    
    let resault = []
    
    let startCodeOut = startNodeToCode(flowIn)
    resault.push(startCodeOut)



    

    // for(let i in flowIn) {
    //     if(flowIn[i].type === 'function'){
    //         //function
    //         if (flowIn[i].connections.inputs.powerIn !== undefined ){
    //             let parentID = flowIn[i].connections.inputs.powerIn[0].nodeId
    //             let parentNode = flowIn.find(e => e.id === parentID)
    //             if(parentNode.type === 'export_default'){
    //                 resault.push("export default function "+ flowIn[i].inputData.functionName.string +' (')
    //             }
    //         }else{
    //             resault.push("function "+ flowIn[i].inputData.functionName.string +' (')
    //         }
    //         //params
    //         let paramCount = 0
    //         for(let p in flowIn[i].inputData) {
    //             if(p.startsWith("Parameter")) {
    //                 if(flowIn[i].inputData[p].string !== "") {
    //                     if (paramCount > 0) {
    //                         resault = resault.concat(", " + flowIn[i].inputData[p].string)
    //                         paramCount += 1 
    //                     }else{
    //                         resault = resault.concat(flowIn[i].inputData[p].string)
    //                         paramCount += 1 
    //                     }
    //                 }else{
    //                     break
    //                 }
    //             }
    //         }

    //         // in the function
    //         for(let p in flowIn[i].connections.outputs) {
    //             if(p.startsWith("powerOut")) {
    //                 if (flowIn[i].connections.outputs[p].nodeId !== undefined ){
    //                     let nextNodeID = flowIn[i].connections.outputs[p][0].nodeId
    //                 }



    //                 console.log("flowIn[i].connections.outputs[p][0].nodeId", flowIn[i].connections.outputs[p][0].nodeId)
    //                 if(flowIn[i].inputData[p].string !== "") {
    //                     if (paramCount > 0) {
    //                         resault = resault.concat(", " + flowIn[i].inputData[p].string)
    //                         paramCount += 1 
    //                     }else{
    //                         resault = resault.concat(flowIn[i].inputData[p].string)
    //                         paramCount += 1 
    //                     }
    //                 }else{
    //                     break
    //                 }
    //             }
    //         }
            


    //         resault = resault.concat(') {\n\t')
    //     }
    // }
    
    
return resault.join("").toString()
}


export default flowToCode
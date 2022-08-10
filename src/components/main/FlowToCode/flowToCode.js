import { FOCUSABLE_SELECTOR } from "@testing-library/user-event/dist/utils"

const powerOutNodeList = [
    "function",
    "if",
    //"call Function",
    "start",
] 

let indentationLevel = 0

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
    indentationLevel += 1

    //console.log("node is conected to start and is in the power out list", workingOnNode.type)
    //console.log("workingOnNode", workingOnNode)
    
        // if not "function"
        if(workingOnNode.type === "function"){
            if(workingOnNode.inputData.functionName.userInput !== ""){
                // add code before params
                if (workingOnNode.inputData.export.boolean) {
                    codeToAdd = "export default " 
                }
                codeToAdd =  codeToAdd.concat("function " +workingOnNode.inputData.functionName.userInput + '(')
                let funcParams = []
                // for each node connected to params
                for(let inputs in workingOnNode.inputData){
                    if (inputs.startsWith("Parameter") && workingOnNode.inputData[inputs].userInput !== "" ) {
                        funcParams.push(' ' + workingOnNode.inputData[inputs].userInput)
                    }
                }
                // add Open {
                codeToAdd =  codeToAdd.concat(funcParams + ') { \n')
            
                // for each node connected this node
                for (let outs in workingOnNode.connections.outputs) {
                    
                    if (outs.startsWith('power')){
                        if (workingOnNode.connections.outputs[outs][0] !== undefined){
                        //console.log("outs",workingOnNode.connections.outputs[outs][0].nodeId)
                            let connectedNodeID = workingOnNode.connections.outputs[outs][0].nodeId
                            for (let node in nodes){
                                if (nodes[node].id === connectedNodeID){
                                    // if node is in the powerOutNodeList
                                    if (powerOutNodeList.includes(nodes[node].type)){
                                        codeToAdd =  codeToAdd.concat("\t".repeat(indentationLevel) + powerOutNodeToCode(nodes, nodes[node]))
                                    // else
                                    } else{
                                        codeToAdd =  codeToAdd.concat("\t".repeat(indentationLevel) + notPowerOutNodeToCode(nodes, nodes[node]))
                                    }
                                }
                            }
                        }
                    }
            
                }
                // add close }  
            }
            codeToAdd =  codeToAdd.concat('}\n')  
        }

    indentationLevel -= 1
        
    return codeToAdd
}

function notPowerOutNodeToCode(nodes, workingOnNode){
    let codeToAdd = ""
    let numberOfImports = 0
    
    // console.log("workingOnNode.type", workingOnNode.type)


    // add code before params
    if(workingOnNode.type === "import"){
        // import has a file and an item selected 
        if(workingOnNode.inputData.item.item.length > 0 && workingOnNode.inputData.from.file !== ""){
            codeToAdd = "import { " + workingOnNode.inputData.item.item.join(", ") + " } from " + workingOnNode.inputData.from.file + ";\n"
        }
    }

    if(workingOnNode.type === "set variable"){
        
        // is there an imput node cionnected

        // console.log("workingOnNode", workingOnNode)

        if(workingOnNode.connections.inputs.variable === undefined) {
            if(workingOnNode.inputData.variable.variable !== "" && workingOnNode.inputData.variableName.userInput !== ""){
                codeToAdd = "let " + workingOnNode.inputData.variableName.userInput + " = " + workingOnNode.inputData.variable.variable + ";\n"
            }else{
                if(workingOnNode.inputData.variableName.string !== "") {
                    codeToAdd = "let " + workingOnNode.inputData.variableName.userInput + " = undefined;\n"
                }            
            }

        }else{
            if(workingOnNode.inputData.variableName.userInput !== ""){
                //find the connected node
                let connectedNodeID = workingOnNode.connections.inputs.variable[0].nodeId
                let connectedPort = workingOnNode.connections.inputs.variable[0].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node

                        let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
                        if (passedValue.value !== ""){
                            //console.log("passedValue",passedValue)
                            if (passedValue.type === "string"){
                                // if the returning is a string.
                                codeToAdd = "let " + workingOnNode.inputData.variableName.userInput + ' = "' + passedValue.value + '";\n'
                            }else{
                                codeToAdd = "let " + workingOnNode.inputData.variableName.userInput + ' = ' + passedValue.value + ';\n'
                            }

                        }
                    }
                }
            }
        }
    }

    // call function from power
    if(workingOnNode.type.startsWith("call function ")){
        let parentNodeID = workingOnNode.type.slice(14)
        let paramArray = []
        
        for (let node in nodes){
            if (nodes[node].id === parentNodeID){
                let functionName = nodes[node].inputData.functionName.userInput
                codeToAdd = functionName +  '('

                for (let paramsNames in nodes[node].inputData){
                    if (paramsNames.startsWith("Parameter")){
                        if (nodes[node].inputData[paramsNames].userInput != ''){
                            paramArray.push(nodes[node].inputData[paramsNames].userInput)
                        }

                    }
                }

                //console.log("odes[node]", nodes[node].inputData)
            }
        }
        //console.log("workingOnNode", workingOnNode)
        for (let param in paramArray){
            let paramFound = false 
            for (let inputs in workingOnNode.connections.inputs){
                if(inputs === paramArray[param]){
                    paramFound = true

                    let connectedNodeID = workingOnNode.connections.inputs[inputs][0].nodeId
                    let connectedPort = workingOnNode.connections.inputs[inputs][0].portName

                    //console.log("connectedNodeID", connectedNodeID)
                    for (let node in nodes){
                        if (nodes[node].id === connectedNodeID){

                            // get the value that it passed back from the other node

                            let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
                            //console.log("passedValue.variable", passedValue)
                            if (passedValue.value !== ""){
                                if (passedValue.type === "string"){
                                    // if the returning is a string.
                                    codeToAdd = codeToAdd + ' "' + passedValue.value + '"",'
                                }else{
                                    codeToAdd = codeToAdd + ' ' + passedValue.value + ','
                                }

                            }
                        }
                    }

                }
            }
            if (paramFound === false){

                codeToAdd = codeToAdd + ' null,'
            }
        }
        if (paramArray.length > 0){
            codeToAdd = codeToAdd.slice(0, -1) + " );\n"
        } else {
            codeToAdd = codeToAdd + " );\n"
        }
    }

    //console log
    if(workingOnNode.type === "console.log"){
        // Node This needs to run in order of string number connection time.
        codeToAdd = "console.log( "
        let passedValue = []

        let reorder = []
        for (let order in workingOnNode.connections.inputs){
            if (order.startsWith('string')){
                reorder.push([order, workingOnNode.connections.inputs[order][0]])

            }
        }
        reorder.sort(function(a, b){
            return a[0].slice(6) - b[0].slice(6)
        })

        for (let ins in reorder) {
                //console.log("workingOnNode.connections.inputs" ,workingOnNode.connections.inputs[ins][0])
                let connectedNodeID = reorder[ins][1].nodeId
                let connectedPort = reorder[ins][1].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        passedValue.push(getPassingValue(nodes, nodes[node], connectedPort))
                    }
                }

        }
        for (let outs in passedValue){
            codeToAdd = codeToAdd + passedValue[outs].value + ', '
        }

        codeToAdd = codeToAdd.slice(0, -1).slice(0, -1) + ');\n'


        //console.log("passedValue" ,passedValue)

        // if (workingOnNode.connections.inputs.number1 === undefined){
        //     if(workingOnNode.inputData.number1.number !== ""){
        //         var1 = workingOnNode.inputData.number1.number
        //     }
        // }else{
        //     let connectedNodeID = workingOnNode.connections.inputs.number1[0].nodeId
        //     let connectedPort = workingOnNode.connections.inputs.number1[0].portName
        //     for (let node in nodes){
        //         if (nodes[node].id === connectedNodeID){
        //             // get the value that it passed back from the other node
        //             let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
        //             var1 = passedValue.value
        //         }
        //     }
        // }
 
        // if(workingOnNode.inputData.item.item.length > 0 && workingOnNode.inputData.from.file !== ""){
        //     codeToAdd = "import { " + workingOnNode.inputData.item.item.join(", ") + " } from " + workingOnNode.inputData.from.file + ";\n"
        // }
    }


    return codeToAdd
}

function addParramNodesToCode(nodes, workingOnNode){
    // add code for this param node
    // for each node in params
        // run addParramNodesToCode(id)
}

function getPassingValue(nodes, workingOnNode, connectedPort){
    let resault = {type: "", value: ""}

    
    // get all inputs

    //string
    if(workingOnNode.type === "string"){
        resault.type = "string"
        resault.value = '"' + workingOnNode.inputData.string.string + '"'
    }

    //integer
    if(workingOnNode.type === "number"){
        resault.type = "number"
        //console.log("workingOnNode" ,workingOnNode)
        if(workingOnNode.inputData.userInput.userInput === '') {
            resault.value = "null"
        }else {
            resault.value = workingOnNode.inputData.userInput.userInput
        }
    }

    //add
    if(workingOnNode.type === "add"){
        resault.type = "integer"
        let var1 = 0
        let var2 = 0
        if (workingOnNode.connections.inputs.number1 === undefined){
            if(workingOnNode.inputData.number1.number !== ""){
                var1 = workingOnNode.inputData.number1.number
            }
        }else{
            let connectedNodeID = workingOnNode.connections.inputs.number1[0].nodeId
            let connectedPort = workingOnNode.connections.inputs.number1[0].portName
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
                    var1 = passedValue.value
                }
            }
        }

        if (workingOnNode.connections.inputs.number2 === undefined){
            if(workingOnNode.inputData.number2.number !== ""){
                var2 = workingOnNode.inputData.number2.number
            }   
        }else{
            let connectedNodeID = workingOnNode.connections.inputs.number2[0].nodeId
            let connectedPort = workingOnNode.connections.inputs.number2[0].portName
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
                    var2 = passedValue.value
                }
            }
        }
        resault.value = '(' +var1 + " + " + var2 + ')'
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
            let connectedPort = workingOnNode.connections.inputs.variable1[0].portName
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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
            let connectedPort = workingOnNode.connections.inputs.variable2[0].portName
            for (let node in nodes){
                if (nodes[node].id === connectedNodeID){
                    // get the value that it passed back from the other node
                    let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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
                let connectedPort = workingOnNode.connections.inputs.string1[0].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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
                let connectedPort = workingOnNode.connections.inputs.string2[0].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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
                let connectedPort = workingOnNode.connections.inputs[i][0].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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
                let connectedPort = workingOnNode.connections.inputs[i][0].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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

        // //get_variable
        // if(workingOnNode.type.startsWith("get_variable")){
        //     console.log("workingOnNode 4444",workingOnNode)
        //     resault.type = "variable"
        //     //resault.value = workingOnNode.inputData.variableName.userInput
        // }

        
        //upper case first
        if(workingOnNode.type === "upper_case_first"){
            resault.type = "variable"
            resault.value = ""
            if (workingOnNode.connections.inputs.string !== undefined) {
                let connectedNodeID = workingOnNode.connections.inputs.string[0].nodeId
                let connectedPort = workingOnNode.connections.inputs.string[0].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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
                let connectedPort =  workingOnNode.connections.inputs.string[0].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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
                let connectedPort =  workingOnNode.connections.inputs.string[0].portName
                for (let node in nodes){
                    if (nodes[node].id === connectedNodeID){
                        // get the value that it passed back from the other node
                        let passedValue = getPassingValue(nodes, nodes[node], connectedPort)
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
                    resault.value =  nodes[i].inputData.variableName.userInput
                }
            }
        }
        
        // function
        if(workingOnNode.type.startsWith('function')){
            resault.type = "variable"
            resault.value = workingOnNode.inputData['Parameter '+ connectedPort.slice(13) + ' name'].userInput
        }
        


    // return resault
    return resault
}



function flowToCode(flowIn){
    
    let resault = []
    
    let startCodeOut = startNodeToCode(flowIn)
    resault.push(startCodeOut)    
    
return resault.join("").toString()
}


export default flowToCode
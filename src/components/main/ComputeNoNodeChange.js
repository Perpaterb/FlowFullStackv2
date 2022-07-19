
import flowToCode from "././FlowToCode/flowToCode.js"


function GetNodeArray(nodes) {
    const nodeArray = []
    const nodesArray = Object.entries(nodes)
    for (const i in nodesArray){
        nodeArray.push(nodesArray[i][1])
    }
    return nodeArray
}



export default function ComputeNoNodeChange(nodesdata) {
 
    let flowFileParth = "localFiles/app/testFile01_flow.json"
    let codeFileParth = "localFiles/app/testFile01.js"

    console.log("nodesdata",nodesdata)
    const fs = window.require('fs')
    const nodeArray = GetNodeArray(nodesdata)
   
    fs.writeFileSync(flowFileParth, JSON.stringify(nodeArray))

    let codeFromFlow = flowToCode(nodeArray)

    fs.writeFileSync(codeFileParth, codeFromFlow)

    return (
        []
    );
}

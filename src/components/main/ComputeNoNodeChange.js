
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
 
    //let nodes = GetNodeArray(nodesdata)
    
    localStorage.setItem( 'codeToDisplay', flowToCode(nodesdata))

    localStorage.setItem( 'nodeSave', JSON.stringify(nodesdata))

    return (
        []
    );
}

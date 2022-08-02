import { FlumeConfig, Colors, Controls } from "../flume/index";

let testItemsList = [
  {value: "item1", label: "item1"},
  {value: "item2", label: "item2"},
  {value: "item3", label: "item3"},
  {value: "item4", label: "item4"},
  {value: "item5", label: "item5"},
  {value: "item6", label: "item6"},
  {value: "item7", label: "item7"}
]

const flowPortAndNodeTypes = new FlumeConfig()
flowPortAndNodeTypes

  //port types
  .addPortType({
    type: "export",
    name: "export",
    label: "export",
    color: Colors.pink,
    hidePort: true,
    controls: [
      Controls.checkbox({
        name: "boolean",
        label: "export"
      })
    ]
  })

  .addPortType({
    type: "power",
    name: "power",
    label: "Power",
    color: Colors.white,
    noControls: true,
  })
  .addPortType({
    type: "boolean",
    name: "boolean",
    label: "True/False",
    color: Colors.red,
    controls: [
      Controls.checkbox({
        name: "boolean",
        label: "True/False"
      })
    ]
  })

  .addPortType({
    type: "string",
    name: "string",
    label: "string",
    acceptTypes: ["string", "variable", "boolean"],
    color: Colors.pink,
    controls: [
      Controls.text({
        name: "string",
        label: "string"
      })
    ]
  })

  .addPortType({
    type: "variable",
    name: "variable",
    label: "variable",
    acceptTypes: ["string", "variable", "boolean"],
    color: Colors.blue,
    controls: [
      Controls.text({
        name: "variable",
        label: "variable"
      })
    ]
  })

  .addPortType({
    type: "from",
    name: "from",
    label: "File to import from",
    color: Colors.purple,
    hidePort: true,
    controls: [
      Controls.select({
        name: "file",
        label: "file",
        options: [
          {value: "file1.js", label: "file1.js"},
          {value: "file2.js", label: "file2.js"},
          {value: "file3.js", label: "file3.js"},
          {value: "file4.js", label: "file4.js"},
          {value: "file5.js", label: "file5.js"},
        ]
      })
    ]
  })

  .addPortType({
    type: "item",
    name: "item",
    label: "The item you are importing",
    color: Colors.purple,
    hidePort: true,
    controls: [
      Controls.multiselect({
        name: "item",
        label: "item",
        options: []
      })
    ]
  })

  //node types
  .addNodeType({
    type: "function",
    label: "function",
    description: "Function starting point",
    inputs: ports => (data, connections) => {
      var parameterCount = 1
      let inputPorts = [
      ports.export({label: "Export", name: "export"}),
      ports.power({label: "Power", name: "powerIn"}),
      ports.string({label: "function name", name: "functionName",hidePort: true})
      ]
      
      //count parameters
      // for(var i in connections.outputs) {
        
      //   if (i.substring(0, 12) === "parameterOut"){
      //       parameterCount += 1
      //   }
      // }
      for(let i in data){
        for(var a = 1; a < parameterCount+1; a++){
          if (i === "Parameter " + a + " name"){
            if (data[i].string !== "") {
              parameterCount += 1
            }
          }
        }
      }

      //add outputs
      let parameterNo = 1
      while (parameterCount >= 1){
        inputPorts.push(ports.string({label: "Parameter " + parameterNo + " name", name: "Parameter " + parameterNo + " name", hidePort: true,}))
        parameterCount -= 1
        parameterNo += 1
      }

      return inputPorts
    },
    outputs: ports => (data, connections) => {
      let parameterCount = 0
      let outputPorts = []
      let powerNo = 1
      let parameterNoForLableSet = 1
      let powerCount = Object.keys(connections.outputs).length + 1
      let reverseKeys = Object.keys(connections.outputs).reverse()
        
      // go through connection in revers order 
      for(let i in reverseKeys) {
        // decrease the count each non connected outpu found. and stop when you find a connected port.
        if (Object.keys(connections.outputs[reverseKeys[i]]).length === 0){
          powerCount -=1
        } else {
          break
        }

      }
      
      //add outputs
      while (powerCount >= 1){
        outputPorts.push(ports.power({ label: "Power "+ powerNo, name: "powerOut "+ powerNo}))
        powerCount -= 1
        powerNo += 1
      }

      for(let i in data){
        for(var a = 1; a < parameterCount+2; a++){
          if (i === "Parameter " + a + " name"){
            if (data[i].string !== "") {
              parameterCount += 1
            }
          }
        }
      }

      while (parameterCount >= 1){
        //get param name 
        let lable = "Parameter " + parameterNoForLableSet
        for(var x in data){
          if (x === "Parameter " + parameterNoForLableSet + " name"){
            if (data[x].string === "") {
              lable = "Parameter " + parameterNoForLableSet
            } else {
              lable = data[x].string
            }
          }
        }
        outputPorts.push(ports.variable({ label: lable, name: "parameterOut "+ parameterNoForLableSet}))
        parameterCount -= 1
        parameterNoForLableSet += 1
      }

      return outputPorts
    }

  })

  .addNodeType({
    type: "return",
    label: "return",
    description: "This node declares the fuctions returns variable",
    inputs: ports => [
      ports.power(),
      ports.variable({label: "return", name: "return"})
    ],
    outputs: []
  })

  .addNodeType({
    type: "get variable",
    label: "get variable",
    description: "This node get retrieves the variable",
    addable: false,
    inputs: [],
    outputs: ports => [
      ports.variable({label: " ", name: "variable"})
    ]
  })


  .addNodeType({
    type: "start",
    label: "start",
    addable: false,
    deletable: false,
    description: "The files running",
    outputs: ports => (data, connections) => {
      var powerCount = Object.keys(connections.outputs).length + 1
      let outputPorts = []
      let powerNo = 1
      let reverseKeys = Object.keys(connections.outputs).reverse()
       
      // go through connection in revers order 
      for(var i in reverseKeys) {
        // decrease the count each non connected outpu found. and stop when you find a connected port.
        if (Object.keys(connections.outputs[reverseKeys[i]]).length === 0){
          powerCount -=1
        } else {
          break
        }

      }
      
      //add outputs
      while (powerCount >= 1){
        outputPorts.push(ports.power({ label: "Power "+ powerNo, name: "powerOut "+ powerNo}))
        powerCount -= 1
        powerNo += 1
      }

      return outputPorts
    }

  })

  .addNodeType({
    type: "import",
    label: "import",
    description: "Get something from another files",
    inputs: ports => (data, connections) => {
      let inputPorts = [
        ports.power(),
        ports.from(),
        ports.item(),
      ]
      
      //if files in not blank add items selecfor
      for(let i in data){
        if (i === "from"){
          if (data[i].file !== ''){
            inputPorts[2].controls[0].options = testItemsList
          } else{
            inputPorts[2].controls[0].options = []
          }
        }
      }
    return inputPorts
    }
  })

  .addNodeType({
    type: "make array",
    label: "make array",
    description: "Create an array",
    inputs: ports => (data, connections) => {
      let itemCount = 1
      let dataCount = []
      let reverseconectionKeys = Object.keys(connections.inputs).reverse()
      let inputPorts = []
      let itemNo = 1
      let lastDataItemNumber = 0
      let lastConnectItemNumber = 0

      for(let i in data) {
        if (i.substring(0, 4) === "item"){
          if (data[i].variable !== ''){
            dataCount.push(i)
          } 
        }
      }

      let reverseDataKeys = dataCount.reverse()

      if (reverseconectionKeys.length > 0) {       
        lastConnectItemNumber = Number(reverseconectionKeys[0].slice(4))
      }
      if (reverseDataKeys.length > 0) {
        lastDataItemNumber = Number(reverseDataKeys[0].slice(4))
      }

      if (lastDataItemNumber > lastConnectItemNumber){
        if (lastDataItemNumber > 0){
          itemCount = lastDataItemNumber +1
        }
      } else {
        if (lastConnectItemNumber > 0){
          itemCount = lastConnectItemNumber +1
        }
      }

      //add items in
      while (itemCount >= 1){
        inputPorts.push(ports.variable({ label: "item "+ itemNo, name: "item"+ itemNo}))
        itemCount -= 1
        itemNo += 1
      }

      return inputPorts
    },

    outputs: ports => [
      ports.variable({label: "array", name: "array"})
    ]
  })

  .addNodeType({
    type: "make object",
    label: "make object",
    description: "Create an object",
    inputs: ports => (data, connections) => {
      let itemCount = 1
      let dataCount = []
      let connectionsCount = []
      let inputPorts = []
      let itemNo = 1
      let lastDataItemNumber = 0
      let lastConnectItemNumber = 0

      for(let i in data) {
        if (i.substring(0, 3) === "key"){
          if (data[i].string !== ''){
            dataCount.push(i)
          } 
        }
      }

      for(let i in Object.keys(connections.inputs)) {
        console.log("i", Object.keys(connections.inputs)[i])
        if (Object.keys(connections.inputs)[i].substring(0, 3) === "key"){
            connectionsCount.push(Object.keys(connections.inputs)[i])
        }
      }

      let reverseDataKeys = dataCount.reverse()
      let reverseconectionKeys = connectionsCount.reverse()

      if (reverseconectionKeys.length > 0) {       
        lastConnectItemNumber = Number(reverseconectionKeys[0].slice(3))
      }
      if (reverseDataKeys.length > 0) {
        lastDataItemNumber = Number(reverseDataKeys[0].slice(3))
      }

      if (lastDataItemNumber > lastConnectItemNumber){
        if (lastDataItemNumber > 0){
          itemCount = lastDataItemNumber +1
        }
      } else {
        if (lastConnectItemNumber > 0){
          itemCount = lastConnectItemNumber +1
        }
      }

      //add items in
      while (itemCount >= 1){
        inputPorts.push(
          ports.string({ label: "key "+ itemNo, name: "key"+ itemNo}),
          ports.variable({ label: "item "+ itemNo, name: "item"+ itemNo})
        )
        itemCount -= 1
        itemNo += 1
      }

      return inputPorts
    },

    outputs: ports => [
      ports.variable({label: "object", name: "object"})
    ]
  })

  .addNodeType({
    type: "Call function",
    label: "Call function",
    description: "Call function",
    addable: false,
    inputs: ports => (data, connections) => {
      let inputports = [ports.power()]
      return inputports
    },
    outputs: ports => [
      ports.power(),
      ports.variable({label: "return", name: "return"})
    ]
  })


  .addNodeType({
    type: "export_default",
    label: "export_default",
    addable: false,
    deletable: false,
    description: "Start from here when file is run",
    outputs: ports => [
      ports.export({label: "Export", name: "export"})
    ]
  })

  .addNodeType({
    type: "set variable",
    label: "set variable",
    description: "Set a variable if already created if not create it",
    inputs: ports => [
      ports.power(),
      ports.string({name: "variableName",label: "variable name", hidePort: true}),
      ports.variable(),
    ]
  })
  
  .addNodeType({
    type: "console.log",
    label: "console.log",
    inputs: ports => [
      ports.power(),
      ports.string({label: "message", acceptTypes: ["variable", "string","boolean"],})
    ],
  })

  .addNodeType({
    type: "if",
    label: "if",
    description: "A fork in the road",
    inputs: ports => [
      ports.power(),
      ports.boolean({label: "ture or false"})
    ],
    outputs: ports => [
      ports.power({label: "ture"}),
      ports.power({label: "false"})
    ]
  })

  .addNodeType({
    type: "string",
    label: "string",
    description: "anything as text",
    inputs: ports => [
      ports.string({label: " ",hidePort: true}),
    ],
    outputs: ports => [
      ports.string({label: "string"})
    ]
  })

  .addNodeType({
    type: "upper_case_first",
    label: "upper_case_first",
    description: "change the first charicter to upper case",
    inputs: ports => [
      ports.string({label: "string", noControls: true}),
    ],
    outputs: ports => [
      ports.string({label: "string"})
    ]
  })

  .addNodeType({
    type: "upper_case_all",
    label: "upper_case_all",
    description: "change all charicters to upper case",
    inputs: ports => [
      ports.string({label: "string", noControls: true}),
    ],
    outputs: ports => [
      ports.string({label: "string"})
    ]
  })

  .addNodeType({
    type: "trim",
    label: "trim",
    description: "remove whitespace from both ends of the string",
    inputs: ports => [
      ports.string({label: "string", noControls: true}),
    ],
    outputs: ports => [
      ports.string({label: "string"})
    ]
  })

  .addNodeType({
    type: "integer",
    label: "integer",
    description: "non desimal number",
    inputs: ports => [
      ports.variable({label: " ",hidePort: true}),
    ],
    outputs: ports => [
      ports.variable({label: "integer"})
    ]
  })

  .addNodeType({
    type: "add",
    label: "add",
    description: "add 2 numbers together",
    inputs: ports => [
      ports.variable({name: "variable1", label: "Number 1"}),
      ports.variable({name: "variable2", label: "Number 2"}),
    ],
    outputs: ports => [
      ports.variable({label: "variable"})
    ]
  })

  .addNodeType({
    type: "equal",
    label: "equal",
    description: "Are these two things ===",
    inputs: ports => [
      ports.variable({name: "variable1", label: "variable 1"}),
      ports.variable({name: "variable2", label: "variable 2"}),
    ],
    outputs: ports => [
      ports.boolean()
    ]
  })

  .addNodeType({
    type: "concatenate",
    label: "concatenate",
    description: "Join 2 string together",
    inputs: ports => [
      ports.string({name: "string1", label: "string 1", noControls: true}),
      ports.string({name: "string2", label: "string 2", noControls: true}),
    ],
    outputs: ports => [
      ports.string({label: "stringout", name: "string out"}),
    ]
  })



export default flowPortAndNodeTypes;
import React, { useEffect, useState} from 'react';
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import Code from "./components/main/Code";
import Terminal from "./components/main/Terminal";
import { NodeEditor } from "./components/flume/index";
import flowPortAndNodeTypes from "./components/Nodes/flowPortAndNodeTypes.js"
import "./FlowFullApp.css";
import onNodeChange from "./components/main/ComputeNoNodeChange"
import onCommentChange from "./components/main/ComputeNoCommentChange"


const FlowFullApp = () => {

  let codeData = "this will be the JS code"
  const comments = { }  
  const filesName = "testFile01.js"
  const [nodes, setNodes] = useState(
    [{"x":-360,"y":-250,"type":"start","width":200,"connections":{"inputs":{},"outputs":{}},"inputData":{},"id":"8IJs8RNJFP"},{"x":700,"y":-250,"type":"export_default","width":200,"connections":{"inputs":{},"outputs":{}},"inputData":{},"id":"nxhnI9V4w9"}]
  )
  const TITLE_MAP = {
    a: "Explorer",
    b: filesName + " Code",
    c: filesName + " Flow",
    d: "Terminal",
  };

  const DIV_MAP = {
      a: <div></div>, //<Explorer></Explorer>,
      b: <Code 
        fileParth = {codeData}
        />,
      c: <NodeEditor 
            portTypes={flowPortAndNodeTypes.portTypes}
            nodeTypes={flowPortAndNodeTypes.nodeTypes}
            nodes={nodes}
            defaultNodes ={nodes}
            comments={comments}
            onChange={setNodes} //onChange={nodes => onNodeChange(nodes)}
            onCommentsChange={comments  => onCommentChange(comments)}
            />,
      d: <Terminal> </Terminal>,
    };

  return (
    <div id="app">
      <Mosaic
        renderTile={(id, path) => (
          <MosaicWindow
            draggable={false}
            /** Provide empty array to prevent render of toolbar controls */
            toolbarControls={[]}
            path={path}
            createNode={() => "new"}
            title={TITLE_MAP[id]}
            className={TITLE_MAP[id]}
          >
            {DIV_MAP[id]}
          </MosaicWindow>
        )}
        initialValue={{
          direction: "column",
          first: {
            direction: "row",
            first: {
              direction: "row",
              first: "a",
              second: "b",
              splitPercentage: 30,
            },
            second: "c",
            splitPercentage: 50,
          },
          
          second: "d",
          splitPercentage: 80,
        }}
      />
    </div>
  )
};

export default FlowFullApp;

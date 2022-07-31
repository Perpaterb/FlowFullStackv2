import React, { useState , useEffect} from 'react';
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import Code from "./components/main/Code";
import Terminal from "./components/main/Terminal";
import { NodeEditor } from "./components/flume/index";
import flowPortAndNodeTypes from "./components/Nodes/flowPortAndNodeTypes.js"
import "./FlowFullApp.css";
import onNodeChange from "./components/main/ComputeNoNodeChange"
import onCommentChange from "./components/main/ComputeNoCommentChange"
import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';

const FlowFullApp = () => {
 
  const [codeToDisplay, setCodeToDisplay] = useState(
    localStorage.getItem( 'codeToDisplay' )
  )
  
  let comments = { }  
  const filesName = "testFile01.js"
  const defaultNodes = [{"x":-360,"y":-250,"type":"start","width":200,"connections":{"inputs":{},"outputs":{}},"inputData":{},"id":"8IJs8RNJFP"},{"x":700,"y":-250,"type":"export_default","width":200,"connections":{"inputs":{},"outputs":{}},"inputData":{},"id":"nxhnI9V4w9"}]
  let nodes = defaultNodes

  //console.log("JSON.parse(localStorage.getItem( 'nodeSave' ))",JSON.parse(localStorage.getItem( 'nodeSave' )))

  if (localStorage.getItem( 'nodeSave' ) === undefined){
    localStorage.setItem( 'nodeSave', JSON.stringify(defaultNodes))
  } else {
     nodes = JSON.parse(localStorage.getItem( 'nodeSave' ))
  }

  useEffect(() => {
    window.addEventListener("click", () => {
      setCodeToDisplay(localStorage.getItem('codeToDisplay'))
    });
    window.addEventListener("keyup", () => {
      setCodeToDisplay(localStorage.getItem('codeToDisplay'))
    });
  }, []);

  const TITLE_MAP = {
    a: "Explorer",
    b: filesName + " Code",
    c: filesName + " Flow",
    d: "Terminal",
  };

  const DIV_MAP = {
      a: <div></div>, //<Explorer></Explorer>,
      b: <Code 
          id="code"
          fileParth = {codeToDisplay}
        />,
      c: <NodeEditor 
            portTypes={flowPortAndNodeTypes.portTypes}
            nodeTypes={flowPortAndNodeTypes.nodeTypes}
            nodes={nodes}
            defaultNodes ={defaultNodes}
            comments={comments}
            onChange={nodes => onNodeChange(nodes)}
            onCommentsChange={comments  => onCommentChange(comments)}
            />,
      d: <Terminal> </Terminal>,
    };

  const [mosaiclayout, setMosaiclayout] = useState(  
    {direction: "column",
      first: {
        direction: "row",
        first: {
          direction: "row",
          first: "a",
          second: "b",
          splitPercentage: 20,
        },
        second: "c",
        splitPercentage: 40,
      },
      
      second: "d",
      splitPercentage: 80,
    }
  )

  const theme = classNames('mosaic-blueprint-theme', Classes.DARK)

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
        onChange={change => setMosaiclayout(change)}
        initialValue={mosaiclayout}
        className={theme}
      />
    </div>
  )
};

export default FlowFullApp;

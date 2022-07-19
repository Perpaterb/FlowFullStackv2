import React, {} from "react";
import MonacoEditor from 'react-monaco-editor'
    
export default function Code(codeFileParth) {

    function handleEditorChange(value, event) {
        // here is the current value
    }

    function handleEditorDidMount(editor, monaco) {
        // console.log("onMount: the editor instance:", editor);
        // console.log("onMount: the monaco instance:", monaco)
    }

    function handleEditorWillMount(monaco) {
        // console.log("beforeMount: the monaco instance:", monaco);
    }

    function handleEditorValidation(markers) {
        // model markers
        // markers.forEach(marker => console.log('onValidate:', marker.message));
    }

    return ( 
        <MonacoEditor
            height="100%"
            defaultLanguage="javascript"
            value={codeFileParth.fileParth}
            theme="vs-dark"
            onChange={handleEditorChange}
            editorDidMount={handleEditorDidMount}
            beforeMount={handleEditorWillMount}
            onValidate={handleEditorValidation}
        />
    );
}


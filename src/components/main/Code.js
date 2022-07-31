import React from "react";
import Editor from "@monaco-editor/react";
    
export default function Code(codeFileParth) {

    function handleEditorChange(monaco) {
        // console.log("beforeMount: the monaco instance:", monaco);
    }
    function handleEditorDidMount(monaco) {
        // console.log("beforeMount: the monaco instance:", monaco);
    }

    function handleEditorWillMount(monaco) {
        // console.log("beforeMount: the monaco instance:", monaco);
    }

    function handleEditorValidation(markers) {
        // model markers
        // markers.forEach(marker => console.log('onValidate:', marker.message));
    }

    return (
        <Editor
            height="100vh"
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


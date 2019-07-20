import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import WebSocket from "reconnecting-websocket";
import ShareDB from "sharedb/lib/client";
import ShareDBCodeMirror from "../lib/sharedb-codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";

const Status = ({ children }) => (
  <div>
    {children}
    <style jsx>
      {`
        div {
          position: absolute;
          background: transparent;
          bottom: 0.75em;
          right: 1.25em;
          text-align: right;
          color: #fefefe;
          z-index: 1000;
          font-family: monospace;
          font-weight: bold;
        }
      `}
    </style>
  </div>
);

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "Not connected"
    };
  }

  componentDidMount() {
    // const userId = Math.floor(Math.random() * Math.floor(99999));
    const userName = window.location.hash
      ? window.location.hash.substring(1)
      : "anonymous";

    this.socket = new WebSocket(`ws://localhost:8080`);
    this.connection = new ShareDB.Connection(this.socket);
    this.shareDBCodeMirror = new ShareDBCodeMirror(this.editor.editor, {
      verbose: true,
      key: "content",
      user: { id: userName, name: userName }
    });

    this.socket.onopen = () => {
      this.setState({ status: "Connected" });
    };

    this.socket.onclose = () => {
      this.setState({ status: "Closed" });
    };

    this.socket.onerror = () => {
      this.setState({ status: "Error" });
    };

    this.doc = this.connection.get("flok", "foo");
    this.shareDBCodeMirror.attachDoc(this.doc, err => {
      if (err) throw err;
    });
  }

  componentWillUnmount() {
    console.log("detach doc");
    this.shareDBCodeMirrordetachDoc();
  }

  render() {
    const { status } = this.state;
    return (
      <React.Fragment>
        <Status>{status}</Status>
        <CodeMirror
          ref={c => {
            this.editor = c;
          }}
          {...this.props}
        />
        <style jsx global>
          {`
            .CodeMirror {
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              height: 100%;
            }
          `}
        </style>
      </React.Fragment>
    );
  }
}

export default TextEditor;
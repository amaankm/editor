import { useCallback, useEffect, useState } from "react";

import Quill from "quill";
import "quill/dist/quill.snow.css";

import { useParams } from "react-router-dom";

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

const Editor = ({ socket }) => {
  const [quill, setQuill] = useState(null);
  const { userid, id } = useParams();

  // quill setup
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";

    const editor = document.createElement("div");
    wrapper.append(editor);

    const quillServer = new Quill("#container", {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    });

    quillServer.disable();
    quillServer.setText("Loading the document...");
    setQuill(quillServer);

    return () => {
      wrapperRef.innerHTML = "";
    };
  }, []);

  // emitting changes
  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleChange = (delta, oldData, source) => {
      if (source !== "user") {
        return;
      }
      console.log(source);

      socket.emit("send-changes", JSON.stringify({ delta, senderId: userid }));
    };

    quill && quill.on("text-change", handleChange);

    return () => {
      quill && quill.off("text-change", handleChange);
    };
  }, [quill, socket, userid]);

  // recieving changes
  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleChange = (data) => {
      const { delta, senderId } = JSON.parse(data);
      console.log(delta, senderId);
      if (senderId !== userid) {
        quill.updateContents(delta);
      }
    };

    socket && socket.on("receive-changes", handleChange);

    return () => {
      socket && socket.off("receive-changes", handleChange);
    };
  }, [quill, socket, userid]);

  // loading document
  useEffect(() => {
    if (quill === null || socket === null) return;

    socket &&
      socket.once("load-document", (document) => {
        quill.setContents(document);
        quill.enable();
      });

    socket && socket.emit("get-document", id);
  }, [quill, socket, id]);

  // saving document
  useEffect(() => {
    if (socket === null || quill === null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  return (
    <div className="main relative">
      <div className="container" id="container" ref={wrapperRef}></div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(id);
          alert(`Document Id: ${id} copied`);
        }}
        className="bg-blue-200 px-4 py-1 rounded-lg fixed top-3 right-2 z-50 w-20 h-8 overflow-hidden hover:w-max transition-all"
      >
        Copy Document ID
      </button>
    </div>
  );
};

export default Editor;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const HomePage = ({ socket }) => {
  const navigate = useNavigate();
  const [docId, setDocId] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (socket === null) return;

    const handleReturn = (check) => {
      console.log(check);
      if (check) {
        navigate(`/${uuid()}/docs/${docId}`);
      } else {
        setError(true);
      }
    };

    socket && socket.on("return-check-document", handleReturn);

    return () => {
      socket && socket.off("return-check-document", handleReturn);
    };
  }, [socket, docId, navigate]);

  return (
    <div className="w-screen min-h-screen text-lg flex p-10 flex-col justify-center items-center gap-10">
      <span className="h-20 text-2xl font-bold">Home</span>

      <div className="w-full max-w-lg flex flex-col gap-5">
        <input
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          type="text"
          placeholder="Enter document ID"
          className={`border-2 rounded-md px-4 py-2
            ${error ? "border-red-600" : "border-black"}`}
        />
        {error && <span>Document Id does not exist</span>}
        <div className="flex justify-center gap-10 items-end">
          <button
            disabled={docId === ""}
            className="w-full outline outline-blue-500 hover:bg-blue-500 px-4 py-2 rounded-full disabled:cursor-not-allowed disabled:text-neutral-400"
            onClick={() => socket.emit("check-document", docId)}
          >
            Open Document
          </button>
          <button
            className="w-full bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-full"
            onClick={() => navigate(`/${uuid()}/docs/${uuid()}`)}
          >
            Create New Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import { useState, useEffect, useRef } from "react";

import { send } from "./maljs";

type History = {
  text: string;
  result: string;
  time: number;
};

export default function App() {
  const [history, setHistory] = useState<History[]>([]);
  const appendHistpry = (text: History) =>
    setHistory((prev) => [...prev, text]);

  const onEnter = (text: string) => {
    const queue = {
      text,
      result: send(text),
      time: +Date.now(),
    };
    appendHistpry(queue);
  };

  const ref = useRef();
  useEffect(() => {
    if (ref?.current) {
      console.log(ref);
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [history.length]);
  return (
    <>
      <h1>maljs</h1>

      <div
        style={{
          overflow: "auto",
          background: "lightgray",
          maxHeight: "50vh",
        }}
      >
        {history.map(({ text, time, result }, i) => (
          <p key={time} ref={i === history.length - 1 ? ref : null}>
            user: {text}
            <br />
            {result}
            <br />
          </p>
        ))}
      </div>
      <MyInput onEnter={onEnter} />
    </>
  );
}

function MyInput({ onEnter }: { onEnter: (text: string) => void }) {
  const [text, setText] = useState("");

  const pushEnter = () => {
    onEnter(text);
    setText("");
  };
  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        if (e.keyCode === 13) pushEnter();
      }}
    />
  );
}

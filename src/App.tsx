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

  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (ref?.current) {
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

  const ref = useRef<HTMLInputElement>(null);
  const pushEnter = () => {
    onEnter(text);
    setText("");
  };

  const [pos, setPos] = useState(0);
  const currentChar = text[pos - 1];
  return (
    <input
      ref={ref}
      type="text"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
      }}
      onKeyDown={(e) => {
        setPos(e.currentTarget.selectionStart ?? 0);
        if (e.key === "Enter") {
          pushEnter();
        }

        if (e.key === "Backspace" && currentChar === "(") {
          if (text[pos] === ")") {
            setText((prev) => prev.slice(0, pos - 1) + prev.slice(pos));
            setTimeout(() => {
              ref.current?.setSelectionRange(pos - 1, pos - 1);
            }, 0);
          }
        }
      }}
      onKeyUp={(e) => {
        setPos(e.currentTarget.selectionStart ?? 0);

        if (e.key === "(") {
          //move cursor

          const pos = e.currentTarget.selectionStart || 0;
          setText((prev) => prev.slice(0, pos) + ")" + prev.slice(pos));
          setTimeout(() => {
            ref.current?.setSelectionRange(pos, pos);
          }, 0);
        }
      }}
    />
  );
}

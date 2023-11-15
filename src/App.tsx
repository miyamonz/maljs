import { useState, useEffect, useRef } from "react";
import { atom, useAtom } from "jotai";

import { send, env } from "./maljs";
import { pr_str } from "./maljs/printer";

type History = {
  text: string;
  result: string;
  time: number;
};

const historyAtom = atom<History[]>([]);

export default function App() {
  const [history, setHistory] = useAtom(historyAtom);
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
      <div>
        {Object.getOwnPropertySymbols(env).map((sym) => {
          const key = sym.toString();
          const value = env[sym];
          if (typeof value !== "function") return;
          return (
            <span style={{ background: "lightgray", margin: 4 }} key={key}>
              {Symbol.keyFor(sym)}
            </span>
          );
        })}
      </div>
      <div>
        {Object.getOwnPropertySymbols(env).map((sym) => {
          const key = sym.toString();
          const value = env[sym];
          if (typeof value === "function") return;
          return (
            <div key={key}>
              {key}: {pr_str(value!)}
            </div>
          );
        })}
      </div>

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

    hisPos.current = 0;
  };

  const [pos, setPos] = useState(0);
  const currentChar = text[pos - 1];

  const [history, setHistory] = useAtom(historyAtom);
  const hisPos = useRef(0);
  return (
    <input
      ref={ref}
      type="text"
      className="border border-1 rounded-sm border-gray-400"
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

        if (e.key === "ArrowUp") {
          hisPos.current = Math.min(++hisPos.current, history.length);
          const last = history[history.length - hisPos.current];
          if (last) setText(last.text);
        } else if (e.key === "ArrowDown") {
          hisPos.current = Math.max(--hisPos.current, 0);
          const last = history[history.length - hisPos.current];
          if (last) setText(last.text);
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

import { useEffect, useRef, useState } from "react";

import Editor, { loader } from "@monaco-editor/react";
import cssFormatMonaco from "css-format-monaco";
import { emmetHTML } from "emmet-monaco-es";
import { initVimMode } from "monaco-vim";

loader.config({
  paths: { vs: "/vs" },
});

const template = (values) =>
  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title><style>${values.CSS}</style></head><body>${values.HTML}<script>${values.Javascript}</script></body></html>`;

function App() {
  const filesNames = {
    HTML: "index.html",
    CSS: "style.css",
    Javascript: "script.js",
  };
  const [values, setValues] = useState(
    localStorage.getItem("monaco-hcj")
      ? JSON.parse(localStorage.getItem("monaco-hcj"))
      : { HTML: "", CSS: "", Javascript: "" }
  );
  const [currentLanguage, setCurrentLanguage] = useState("HTML");
  const [output, setOutput] = useState("");
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
    localStorage.setItem("monaco-hcj", JSON.stringify(values));
  }, [values, values.HTML, values.CSS, values.Javascript]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      if (e.key === "Enter" && e.ctrlKey) {
        setOutput(template(valuesRef.current));
      }
    };
    window.addEventListener("keyup", handler);

    return () => window.removeEventListener("keyup", handler);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-screen h-1/2 md:w-1/2 md:h-screen flex flex-col bg-[#1E1E1E]">
        <div className="flex-shrink-0 bg-[#2D2D2D] flex justify-between h-[35px]">
          <div className="flex items-stretch h-full">
            {Object.keys(values).map((lang) => (
              <div
                onClick={() => setCurrentLanguage(lang)}
                key={lang}
                className={`flex items-center pr-[25px] pl-[15px] gap-[5px] text-white border-r border-r-[#444] ${
                  currentLanguage === lang ? "bg-[#1e1e1e]" : "bg-transparent"
                }`}
              >
                <img
                  className="h-[18px]"
                  src={`/${filesNames[lang].split(".").slice(-1)[0]}.svg`}
                  alt=""
                />
                <span>{filesNames[lang]}</span>
              </div>
            ))}
          </div>
          <button
            className="text-white mr-4"
            onClick={() => setOutput(template(values))}
          >
            Run
          </button>
        </div>
        <div className="flex-grow">
          <Editor
            options={{
              colorDecorators: currentLanguage === "CSS",
              tabSize: 2,
              cursorBlinking: "smooth",
            }}
            onMount={(editor, monaco) => {
              emmetHTML(monaco);
              cssFormatMonaco(monaco, { indent_size: 2 });
              initVimMode(editor);
              setOutput(template(values));
            }}
            className="h-[calc(50vh-35px)] md:h-screen"
            theme="vs-dark"
            language={currentLanguage.toLowerCase()}
            value={values[currentLanguage]}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, [currentLanguage]: value }))
            }
            loading={
              <span className="text-white text-xl">Loading editor...</span>
            }
          />
        </div>
      </div>
      <iframe
        className="w-screen h-1/2 md:w-1/2 md:h-screen"
        srcDoc={output}
        frameBorder={0}
        title="Preview"
      />
    </div>
  );
}

export default App;

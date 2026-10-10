import {createRoot} from "react-dom/client";
import {App} from "./App.js";
import "@a2ui/react/styles/structural.css";
import "./styles.css";

const element = document.getElementById("root");
if (!element) throw new Error("Root element unavailable");
createRoot(element).render(<App />);

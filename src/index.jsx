import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Polyfill Buffer for browser-id3-writer
import { Buffer } from 'buffer';
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);

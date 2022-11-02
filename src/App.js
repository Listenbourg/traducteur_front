import "./App.css";
import { Translation } from "./Translation";

function App() {
  return (
    <>
      <div className="App">
        <Translation />
      </div>
      <footer
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          backgroundColor: "#AFAFAF",
        }}
      >
        <p>© Listenbourg 2022&nbsp;</p>
        <a
          style={{
            color: "black",
            fontWeight: "bold",
          }}
          href="https://github.com/Listenbourg"
          target="_blank"
        >
          Made with ❤️ Github
        </a>
      </footer>
    </>
  );
}

export default App;

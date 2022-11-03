import { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Snackbar, Switch } from "@mui/material";
import drapeau from "./Drapeau.png";

export const Translation = () => {
  const BASE_URL = "http://51.210.104.99:1337/api";
  //const TRAD_URL = "http://localhost:1841";
  const TRAD_URL = "http://51.210.104.99:1841";

  const [snackBar, setSnackBar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const Line = ({ index, word }) => {
    const [backup, setBackup] = useState({
      category: word.attributes.category,
      base: word.attributes.base,
      translation: word.attributes.translation,
    });

    const [editor, setEditor] = useState(false);

    const [data, setData] = useState({
      category: word.attributes.category,
      base: word.attributes.base,
      translation: word.attributes.translation,
    });

    let style = {
      position: "relative",
    };

    return (
      <tr
        title="Double clique sur une ligne pour la modifier !"
        key={index}
        className={editor ? "trEdit" : index % 2 === 0 ? "trSecond" : ""}
        onDoubleClick={() => {
          setEditor(true);
        }}
      >
        <td>{word.id}</td>
        <td>
          {editor && (
            <select
              className="inputSelect"
              value={data.category}
              onChange={(e) =>
                setData({
                  ...data,
                  category: e.target.value,
                })
              }
            >
              {category.map((cat) => (
                <option key={cat.id} value={cat.attributes.name.toLowerCase()}>
                  {cat.attributes.name}
                </option>
              ))}
            </select>
          )}
          {!editor && data.category}
        </td>
        <td>
          {editor && (
            <input
              className="inputText"
              value={data.base}
              onChange={(e) => {
                setData({
                  ...data,
                  base: e.target.value,
                });
              }}
            ></input>
          )}
          {!editor && data.base}
        </td>
        <td
          className={
            word.attributes.translation == "" && !editor ? "emptyCell" : ""
          }
        >
          {editor && (
            <input
              className="inputText"
              value={data.translation}
              onChange={(e) => {
                setData({
                  ...data,
                  translation: e.target.value,
                });
              }}
            ></input>
          )}
          {!editor && data.translation}
          {/* No translation, set placeholder text */}
          {!editor && data.translation == "" && (
            <span
              style={{
                padding: "5px",
              }}
            >
              Double-cliquez pour ajouter
            </span>
          )}
        </td>
        <td>
          {editor && (
            <>
              <button
                className="inputButton"
                onClick={() => {
                  setData(backup);
                  setEditor(false);
                }}
              >
                Annuler
              </button>
              <button
                className="inputButton"
                onClick={async () => {
                  if (!data.category || !data.base || !data.translation) {
                    setSnackBar({
                      open: true,
                      message: "Veuillez remplir tous les champs",
                      severity: "error",
                    });
                  } else {
                    await updateTrad(word.id, data);
                    await getManyTranslations();
                    setSnackBar({
                      open: true,
                      message: "Traduction mise à jour",
                      severity: "success",
                    });
                  }
                }}
              >
                Enregistrer
              </button>
            </>
          )}
          {!editor && (
            <span
              style={{
                fontStyle: "italic",
              }}
            >
              Aucune actions
            </span>
          )}
        </td>
      </tr>
    );
  };

  // Translations
  const [translation, setTranslation] = useState([]);
  const [category, setCategories] = useState([]);

  // Add a translation
  const [frenchWord, setFrenchWord] = useState("");
  const [listenbourgWord, setListenbourgWord] = useState("");
  const [addWordError, setAddWordError] = useState("");

  const [wordCategory, setWordCategory] = useState("");

  async function addNewTrad(val1, val2) {
    await axios.post(BASE_URL + "/translations", {
      data: {
        word: val1.toLowerCase() + "#" + val2.toLowerCase(),
        category: wordCategory.toLowerCase(),
        language: "fr#lis",
        from: "fr",
        to: "lis",
        base: val1.toLowerCase(),
        translation: val2.toLowerCase(),
      },
    });
  }

  async function updateTrad(id, data) {
    await axios.put(BASE_URL + "/translations/" + id, {
      data: {
        category: data.category.toLowerCase(),
        word: data.base.toLowerCase() + "#" + data.translation.toLowerCase(),
        base: data.base.toLowerCase(),
        translation: data.translation.toLowerCase(),
      },
    });
  }

  // Filter results
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [wordFilter, setWordFilter] = useState(null);

  async function addNewTranslation() {
    if (wordCategory && frenchWord && listenbourgWord) {
      let word = await axios.get(
        `${BASE_URL}/translations?filters[base][$eq]=${frenchWord}`
      );

      if (word.data.data.length === 0) {
        await axios.post(BASE_URL + "/translations", {
          data: {
            word:
              frenchWord.toLowerCase() + "#" + listenbourgWord.toLowerCase(),
            category: wordCategory.toLowerCase(),
            language: "fr#lis",
            from: "fr",
            to: "lis",
            base: frenchWord.toLowerCase(),
            translation: listenbourgWord.toLowerCase(),
          },
        });

        setSnackBar({
          open: true,
          message: "Le mot a bien été ajouté !",
          severity: "success",
        });
      } else {
        setSnackBar({
          open: true,
          message: "Le mot existe déja !",
          severity: "error",
        });
      }

      getManyTranslations();

      setListenbourgWord("");
      setFrenchWord("");
    } else {
      setAddWordError("Veuillez remplir tous les champs");
    }
  }

  async function deleteTranslation(id) {
    await axios.delete(BASE_URL + "/translations/" + id);
    getManyTranslations();
  }

  // Fetch all translations
  useEffect(() => {
    getManyTranslations();
    getCategories();
  }, []);

  async function getCategories() {
    let request = "/categories";
    let categories = await axios.get(BASE_URL + request);
    setWordCategory(categories.data.data[0].attributes.name);
    setCategories(categories.data.data);
  }

  async function getManyTranslations() {
    let request = "/translations?pagination[start]=0&pagination[limit]=1000000";

    if (wordFilter) {
      request += `&filters[word][$contains]=${wordFilter}`;
    }

    if (categoryFilter && categoryFilter !== "Aucune") {
      request += `&filters[category][$eq]=${categoryFilter}`;
    }

    let translations = await axios.get(BASE_URL + request);

    setTranslation(translations.data.data);
  }

  useEffect(() => {
    getManyTranslations();
  }, [categoryFilter, wordFilter]);

  const [toTranslate, setToTranslate] = useState("");
  const [translateResult, setTranslateResult] = useState("");

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <section className="container">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <img
          style={{
            width: "10vw",
          }}
          src={drapeau}
        ></img>
        <div>
          <h4>Dark mode</h4>

          <Switch
            checked={darkMode}
            onChange={() => {
              setDarkMode(!darkMode);
            }}
            name="checkedA"
            inputProps={{ "aria-label": "secondary checkbox" }}
          />
        </div>
      </div>
      <div>
        <h1>
          Il y a actuellement{" "}
          <span style={{ color: "#f9cb15", fontWeight: "bold" }}>
            {translation.length}
          </span>{" "}
          mots traduits !
        </h1>
        <h3>(Rafraichir la page pour obtenir les dernières traductions)</h3>
      </div>

      <div className="block">
        <h3>Traduire une phrase</h3>
        <div
          style={{
            display: "flex",
          }}
        >
          <input
            style={{
              width: "100%",
            }}
            className="inputText"
            type="text"
            placeholder="Phrase en français"
            value={toTranslate}
            onChange={(e) => setToTranslate(e.target.value)}
          />
          <button
            className="inputButton"
            onClick={async () => {
              console.log(toTranslate);
              let res = await axios.post(TRAD_URL + "/translate", {
                from: "fr",
                to: "lis",
                text: toTranslate,
              });
              if (res.data.status === 200) {
                setTranslateResult(res.data.response);
              }
            }}
          >
            Traduire
          </button>
        </div>
        <textarea
          value={translateResult}
          placeholder="Resultat..."
          style={{
            borderRadius: "5px",
            fontSize: "1.5rem",
            width: "100%",
            marginTop: "20px",
            minHeight: "10vh",
          }}
        ></textarea>
      </div>

      <div className="block">
        <h3>Traduire un mot</h3>
        <select
          className="inputSelect"
          value={wordCategory}
          onChange={(e) => setWordCategory(e.target.value)}
        >
          {category.map((cat) => (
            <option key={cat.id} value={cat.attributes.name.toLowerCase()}>
              {cat.attributes.name}
            </option>
          ))}
        </select>
        <input
          className="inputText"
          type="text"
          placeholder="Mot en français"
          value={frenchWord}
          onChange={(e) => setFrenchWord(e.target.value)}
        />
        <input
          className="inputText"
          type="text"
          placeholder="Mot en listenbourgeois"
          value={listenbourgWord}
          onChange={(e) => setListenbourgWord(e.target.value)}
        />
        <button className="inputButton" onClick={addNewTranslation}>
          Ajouter
        </button>
        {addWordError && <p>{addWordError}</p>}
      </div>

      <div className="block">
        <h3>Traductions</h3>

        <h5>Filtres</h5>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <label>Categorie </label>
          <select
            className="inputSelect"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value={null}>Aucune</option>
            {category.map((cat) => (
              <option key={cat.id} value={cat.attributes.name.toLowerCase()}>
                {cat.attributes.name}
              </option>
            ))}
          </select>
          <label
            style={{
              marginLeft: "20px",
            }}
          >
            Mot{" "}
          </label>
          <input
            style={{
              width: "100%",
            }}
            className="inputText"
            type="text"
            placeholder="Rechercher un mot"
            value={wordFilter}
            onChange={(e) => setWordFilter(e.target.value)}
          />
        </div>

        <table
          style={{
            width: "100%",
            marginTop: "20px",
            textAlign: "left",
            borderCollapse: "collapse",
          }}
        >
          <tr
            style={{
              fontSize: "20px",
            }}
          >
            <th>ID</th>
            <th>Categorie</th>
            <th>Mot français</th>
            <th>Mot listenbourgeois</th>
            <th>Actions</th>
          </tr>
          {translation.map((word, index) => {
            return <Line word={word} index={index} />;
          })}
        </table>
      </div>

      <Snackbar
        open={snackBar.open}
        autoHideDuration={6000}
        onClose={() => setSnackBar({ open: false, message: "", severity: "" })}
      >
        <Alert
          onClose={() =>
            setSnackBar({ open: false, message: "", severity: "" })
          }
          severity={snackBar.severity}
          sx={{ width: "100%" }}
        >
          {snackBar.message}
        </Alert>
      </Snackbar>
    </section>
  );
};

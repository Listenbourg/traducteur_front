import { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Snackbar } from "@mui/material";
import drapeau from "./Drapeau.png";

export const Translation = () => {
  const BASE_URL = "http://51.210.104.99:1337/api";

  const [snackBar, setSnackBar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Translations
  const [translation, setTranslation] = useState([]);

  // Add a translation
  const [frenchWord, setFrenchWord] = useState("");
  const [listenbourgWord, setListenbourgWord] = useState("");
  const [addWordError, setAddWordError] = useState("");

  const WORDS_CATEGORIES = [
    "Verbe",
    "Nom",
    "Adjectif",
    "Adverbe",
    "Politesse",
    "Nombre",
    "Autre",
  ];

  const [wordCategory, setWordCategory] = useState(WORDS_CATEGORIES[0]);

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
  }, []);

  async function getManyTranslations() {
    let request = "/translations";

    if (wordFilter) {
      request += `?filters[word][$contains]=${wordFilter}`;
    }

    if (categoryFilter && categoryFilter !== "Aucune") {
      request += `?filters[category][$eq]=${categoryFilter}`;
    }

    let translations = await axios.get(BASE_URL + request);

    setTranslation(translations.data.data);
  }

  useEffect(() => {
    getManyTranslations();
  }, [categoryFilter, wordFilter]);

  return (
    <section className="container">
      <img
        style={{
          width: "10vw",
        }}
        src={drapeau}
      ></img>
      <div>
        <h1>
          Il y a actuellement{" "}
          <span style={{ color: "#f9cb15", fontWeight: "bold" }}>
            {translation.length}
          </span>{" "}
          mots traduits !
        </h1>
        <h3>
          (Rafraichir la page pour obtenir les mots traduits par tout le monde)
        </h3>
      </div>

      {/* <div className="block">
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
            value={listenbourgWord}
            onChange={(e) => setListenbourgWord(e.target.value)}
          />
          <button className="inputButton" onClick={addNewTranslation}>
            Ajouter
          </button>
        </div>
        <textarea
          placeholder="Resultat..."
          style={{
            width: "100%",
            marginTop: "20px",
            minHeight: "10vh",
          }}
        ></textarea>
      </div> */}

      <div className="block">
        <h3>Traduire un mot</h3>
        <select
          className="inputSelect"
          value={wordCategory}
          onChange={(e) => setWordCategory(e.target.value)}
        >
          {WORDS_CATEGORIES.map((category) => (
            <option key={category} value={category.toLowerCase()}>
              {category}
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
            {WORDS_CATEGORIES.map((category) => (
              <option key={category} value={category.toLowerCase()}>
                {category}
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
          }}
        >
          <tr
            style={{
              fontSize: "20px",
            }}
          >
            <th>Categorie</th>
            <th>Mot français</th>
            <th>Mot listenbourgeois</th>
            <th>Actions</th>
          </tr>
          {translation.map((word, index) => {
            return (
              <tr key={index}>
                <td>{word.attributes.category}</td>
                <td>{word.attributes.base}</td>
                <td>{word.attributes.translation}</td>
                <td>
                  {/* <button
                    className="inputButton"
                    onClick={() => {
                      deleteTranslation(word.id);
                    }}
                  >
                    Supprimer
                  </button> */}
                  <span
                    style={{
                      fontStyle: "italic",
                    }}
                  >
                    Aucune actions
                  </span>
                </td>
              </tr>
            );
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

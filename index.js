const express = require("express");
const path = require("path");
const fs = require("fs");



//20
let vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];

for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);

    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
        console.log("Folder creat:", caleFolder);
    } else {
        console.log("Folder existent:", caleFolder);
    }
}


const app = express();
const PORT = 8080;

var obGlobal = {
    obErori: null
};





//bonus 4
function verificaErori() {
    const caleJson = path.join(__dirname, "erori.json");

    if (!fs.existsSync(caleJson)) {
        console.error("EROARE CRITICĂ: Fișierul erori.json nu există în rădăcina proiectului.");
        process.exit();
    }

    const continut = fs.readFileSync(caleJson).toString("utf-8");

    // verificare proprietăți duplicate pe string
    const obiecteJson = continut.match(/\{[^{}]*\}/g) || [];

    for (let obiect of obiecteJson) {
        const proprietati = [...obiect.matchAll(/"([^"]+)"\s*:/g)].map(match => match[1]);
        const aparitii = {};

        for (let prop of proprietati) {
            aparitii[prop] = (aparitii[prop] || 0) + 1;
        }

        for (let prop in aparitii) {
            if (aparitii[prop] > 1) {
                console.error(`EROARE JSON: Proprietatea "${prop}" apare de mai multe ori în același obiect: ${obiect}`);
            }
        }
    }

    let obErori;

    try {
        obErori = JSON.parse(continut);
    } catch (err) {
        console.error("EROARE JSON: Fișierul erori.json nu are format JSON valid.", err.message);
        return;
    }

    for (let prop of ["info_erori", "cale_baza", "eroare_default"]) {
        if (!obErori.hasOwnProperty(prop)) {
            console.error(`EROARE JSON: Lipsește proprietatea obligatorie "${prop}" din erori.json.`);
        }
    }

    if (obErori.eroare_default) {
        for (let prop of ["titlu", "text", "imagine"]) {
            if (!obErori.eroare_default.hasOwnProperty(prop)) {
                console.error(`EROARE JSON: Eroarea default nu are proprietatea obligatorie "${prop}".`);
            }
        }
    }

    if (obErori.cale_baza) {
        const caleFolderErori = path.join(__dirname, obErori.cale_baza.replace("/resurse/", "resurse/"));

        if (!fs.existsSync(caleFolderErori)) {
            console.error(`EROARE JSON: Folderul pentru imaginile de eroare nu există: ${caleFolderErori}`);
        }

        if (obErori.eroare_default && obErori.eroare_default.imagine) {
            const caleImagineDefault = path.join(caleFolderErori, obErori.eroare_default.imagine);

            if (!fs.existsSync(caleImagineDefault)) {
                console.error(`EROARE JSON: Imaginea pentru eroarea default nu există: ${caleImagineDefault}`);
            }
        }

        if (Array.isArray(obErori.info_erori)) {
            for (let eroare of obErori.info_erori) {
                if (eroare.imagine) {
                    const caleImagine = path.join(caleFolderErori, eroare.imagine);

                    if (!fs.existsSync(caleImagine)) {
                        console.error(`EROARE JSON: Imaginea pentru eroarea ${eroare.identificator} nu există: ${caleImagine}`);
                    }
                }
            }
        }
    }

    if (Array.isArray(obErori.info_erori)) {
        const identificatori = {};

        for (let eroare of obErori.info_erori) {
            if (!identificatori[eroare.identificator]) {
                identificatori[eroare.identificator] = [];
            }

            identificatori[eroare.identificator].push(eroare);
        }

        for (let id in identificatori) {
            if (identificatori[id].length > 1) {
                console.error(`EROARE JSON: Există mai multe erori cu identificatorul ${id}:`);

                for (let eroare of identificatori[id]) {
                    console.error({
                        status: eroare.status,
                        titlu: eroare.titlu,
                        text: eroare.text,
                        imagine: eroare.imagine
                    });
                }
            }
        }
    }
}
verificaErori();













function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "erori.json")).toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);

    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = obGlobal.obErori.cale_baza + eroare.imagine;
    }

    obGlobal.obErori.eroare_default.imagine =
        obGlobal.obErori.cale_baza + obGlobal.obErori.eroare_default.imagine;
}

initErori();








function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare;

    if (identificator) {
        eroare = obGlobal.obErori.info_erori.find(
            elem => elem.identificator == identificator
        );
    }

    if (!eroare) {
        eroare = obGlobal.obErori.eroare_default;
    }

    let titluFinal = titlu || eroare.titlu;
    let textFinal = text || eroare.text;
    let imagineFinala = imagine || eroare.imagine;

    let status = eroare.status ? eroare.identificator : 200;

    res.status(status).render("eroare", {
        titlu: titluFinal,
        text: textFinal,
        imagine: imagineFinala
    });
}





// AFISARI CERUTE 3
console.log("__dirname:", __dirname);
console.log("__filename:", __filename);
console.log("process.cwd():", process.cwd());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/pagini"));



//403 eroare
app.use("/resurse", (req, res, next) => {
    if (req.path.endsWith("/")) {
        afisareEroare(res, 403);
    } else {
        next();
    }
});



app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.use((req, res, next) => {
    if (req.path.endsWith(".ejs")) {
        afisareEroare(res, 400);
    } else {
        next();
    }
});

// PAGINA PRINCIPALA
app.get(["/", "/index", "/home"], (req, res) => {
    let ip = req.ip;
    res.render("index", { ip: ip });
});






app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/ico/favicon/favicon.ico"));
});






// RUTA GENERALA (ULTIMA!)
app.get(/.*/, (req, res) => {
    let pagina = req.path.substring(1);

    res.render(pagina, (eroare, rezultatRandare) => {
        if (eroare) {
            if (eroare.message.startsWith("Failed to lookup view")) {
                afisareEroare(res, 404);
            } else {
                afisareEroare(res);
            }
        } else {
            res.send(rezultatRandare);
        }
    });
});


// PORNIRE SERVER (ULTIMUL LUCRU)
app.listen(PORT, () => {
    console.log("Serverul ruleaza pe http://localhost:" + PORT);
});
const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");


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




// cetapa 5 scss
global.folderScss = path.join(__dirname, "resurse", "scss");
global.folderCss = path.join(__dirname, "resurse", "css");
global.folderBackup = path.join(__dirname, "backup");




let foldereCreate = [
    "temp",
    "backup",
    path.join("resurse", "scss"),
    path.join("resurse", "css"),
    path.join("backup", "resurse"),
    path.join("backup", "resurse", "css")
];

for (let folder of foldereCreate) {
    let caleFolder = path.join(__dirname, folder);

    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder, { recursive: true });
        console.log("Am creat folderul:", caleFolder);
    }
}


//Funcția de compilare:
function compileazaScss(caleScss, caleCss) {
    let caleAbsolutaScss;

    if (path.isAbsolute(caleScss)) {
        caleAbsolutaScss = caleScss;
    } else {
        caleAbsolutaScss = path.join(global.folderScss, caleScss);
    }

    if (!caleCss) {
        let numeFisier = path.basename(caleAbsolutaScss, ".scss") + ".css";
        caleCss = path.join(global.folderCss, numeFisier);
    } else if (!path.isAbsolute(caleCss)) {
        caleCss = path.join(global.folderCss, caleCss);
    }

    let caleBackup = path.join(
        global.folderBackup,
        "resurse",
        "css",
        path.basename(caleCss)
    );

    try {
        if (fs.existsSync(caleCss)) {
            fs.copyFileSync(caleCss, caleBackup);
            console.log("Backup creat pentru:", caleCss);
        }
    } catch (err) {
        console.error("Eroare la copierea în backup:", err.message);
    }

    try {
        let rezultat = sass.compile(caleAbsolutaScss);

        fs.writeFileSync(caleCss, rezultat.css);

        console.log(`Compilat SCSS: ${caleAbsolutaScss} -> ${caleCss}`);
    } catch (err) {
        console.error("Eroare la compilarea SCSS:", err.message);
    }
}


//Compilare inițială la pornirea serverului:
let fisiereScss = fs.readdirSync(global.folderScss);

for (let fisier of fisiereScss) {

    if (
        path.extname(fisier) === ".scss" &&
        !fisier.startsWith("_")
    ) {

        compileazaScss(fisier);
    }
}





//Compilare automată când modific un .scss:
fs.watch(global.folderScss, function (eveniment, numeFisier) {
    if (numeFisier && path.extname(numeFisier) === ".scss"&&!numeFisier.startsWith("_")) {
        console.log("S-a modificat fișierul:", numeFisier);

        compileazaScss(numeFisier);
    }
});




//bonus 4

function verificaErori() {

    // BONUS 1:
    // Verifică dacă există fișierul erori.json.
    // Dacă nu există, aplicația se oprește.

    const caleJson = path.join(__dirname, "erori.json");

    if (!fs.existsSync(caleJson)) {
        console.error("EROARE CRITICĂ: Fișierul erori.json nu există în rădăcina proiectului.");
        process.exit();
    }


    const continut = fs.readFileSync(caleJson).toString("utf-8");


    // BONUS 6:
    // Verifică pe string dacă există proprietăți duplicate
    // în același obiect JSON

    const obiecteJson = continut.match(/\{[^{}]*\}/g) || [];

    for (let obiect of obiecteJson) {

        const proprietati =
            [...obiect.matchAll(/"([^"]+)"\s*:/g)]
            .map(match => match[1]);

        const aparitii = {};

        for (let prop of proprietati) {
            aparitii[prop] = (aparitii[prop] || 0) + 1;
        }

        for (let prop in aparitii) {

            if (aparitii[prop] > 1) {

                console.error(
                    `EROARE JSON: Proprietatea "${prop}" apare de mai multe ori în același obiect: ${obiect}`
                );
            }
        }
    }


    let obErori = JSON.parse(continut);


    // BONUS 2:
    // Verifică dacă există proprietățile obligatorii:
    // info_erori, cale_baza și eroare_default

    for (let prop of ["info_erori", "cale_baza", "eroare_default"]) {

        if (!obErori.hasOwnProperty(prop)) {

            console.error(
                `EROARE JSON: Lipsește proprietatea obligatorie "${prop}" din erori.json.`
            );
        }
    }


    // BONUS 3:
    // Verifică dacă eroarea default are:
    // titlu, text și imagine

    for (let prop of ["titlu", "text", "imagine"]) {

        if (!obErori.eroare_default.hasOwnProperty(prop)) {

            console.error(
                `EROARE JSON: Eroarea default nu are proprietatea obligatorie "${prop}".`
            );
        }
    }


    // BONUS 4:
    // Verifică dacă folderul specificat în cale_baza există

    const caleFolderErori = path.join(
        __dirname,
        obErori.cale_baza.replace("/resurse/", "resurse/")
    );

    if (!fs.existsSync(caleFolderErori)) {

        console.error(
            `EROARE JSON: Folderul pentru imaginile de eroare nu există: ${caleFolderErori}`
        );
    }


    // BONUS 5:
    // Verifică dacă există imaginile asociate erorilor

    for (let eroare of obErori.info_erori) {

        const caleImagine = path.join(
            caleFolderErori,
            eroare.imagine
        );

        if (!fs.existsSync(caleImagine)) {

            console.error(
                `EROARE JSON: Imaginea pentru eroarea ${eroare.identificator} nu există: ${caleImagine}`
            );
        }
    }


    // BONUS 7:
    // Verifică dacă există mai multe erori
    // cu același identificator

    const identificatori = {};

    for (let eroare of obErori.info_erori) {

        if (!identificatori[eroare.identificator]) {
            identificatori[eroare.identificator] = [];
        }

        identificatori[eroare.identificator].push(eroare);
    }


    for (let id in identificatori) {

        if (identificatori[id].length > 1) {

            console.error(
                `EROARE JSON: Există mai multe erori cu identificatorul ${id}:`
            );

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






//etapa 5 galerie statica
function esteImagineInInterval(interval, dataCurenta) {
    const [oraStart, oraEnd] = interval.split("-");

    const [hStart, mStart] = oraStart.split(":").map(Number);
    const [hEnd, mEnd] = oraEnd.split(":").map(Number);

    const minuteCurente = dataCurenta.getHours() * 60 + dataCurenta.getMinutes();
    const minuteStart = 0;//hStart * 60 + mStart;
    const minuteEnd = 100000000;//hEnd * 60 + mEnd;

    return minuteCurente >= minuteStart && minuteCurente <= minuteEnd;
}



async function genereazaImaginiResponsive(galerie) {
    const caleGalerie = galerie.cale_galerie.replace("/resurse", "resurse");

    const folderMari = path.join(__dirname, caleGalerie, "mari");
    const folderMedii = path.join(__dirname, caleGalerie, "medii");
    const folderMici = path.join(__dirname, caleGalerie, "mici");

    if (!fs.existsSync(folderMedii)) {
        fs.mkdirSync(folderMedii, { recursive: true });
    }

    if (!fs.existsSync(folderMici)) {
        fs.mkdirSync(folderMici, { recursive: true });
    }

    for (let img of galerie.imagini) {
        const caleImagineMare = path.join(folderMari, img.cale_imagine);
        const caleImagineMedie = path.join(folderMedii, img.cale_imagine);
        const caleImagineMica = path.join(folderMici, img.cale_imagine);

        if (!fs.existsSync(caleImagineMedie)) {
            await sharp(caleImagineMare)
                .resize(350, 350)
                .toFile(caleImagineMedie);
        }

        if (!fs.existsSync(caleImagineMica)) {
            await sharp(caleImagineMare)
                .resize(250, 250)
                .toFile(caleImagineMica);
        }
    }
}

async function obtineGalerieStatica() {
    const caleJson = path.join(__dirname, "resurse", "json", "galerie.json");
    const continutJson = fs.readFileSync(caleJson).toString("utf-8");
    const galerie = JSON.parse(continutJson);

    await genereazaImaginiResponsive(galerie);

    const dataCurenta = new Date();

    let imaginiFiltrate = galerie.imagini.filter(img =>
        esteImagineInInterval(img.timp, dataCurenta)
    )
   ;

    imaginiFiltrate = imaginiFiltrate.slice(0, 10);

    return {
        cale_galerie: galerie.cale_galerie,
        imagini: imaginiFiltrate
    };
}





//galerie animata:
async function obtineGalerieAnimata() {
    const caleJson = path.join(__dirname, "resurse", "json", "galerie.json");
    const continutJson = fs.readFileSync(caleJson).toString("utf-8");
    const galerie = JSON.parse(continutJson);

    await genereazaImaginiResponsive(galerie);

    const dataCurenta = new Date();

    let imaginiFiltrate = galerie.imagini.filter(img =>
        esteImagineInInterval(img.timp, dataCurenta)
    );

    if (imaginiFiltrate.length < 6) {
        imaginiFiltrate = galerie.imagini;
    }

    let varianteNr = [6, 8, 10, 12].filter(n => n <= imaginiFiltrate.length);
    let nrImagini = varianteNr[Math.floor(Math.random() * varianteNr.length)];

    imaginiFiltrate = imaginiFiltrate
        .sort(() => Math.random() - 0.5)
        .slice(0, nrImagini);

    const caleScssDinamic = path.join(global.folderScss, "galerie-animata.scss");

    fs.writeFileSync(
        caleScssDinamic,
        `$nr-imagini: ${nrImagini};\n@import "_galerie-animata-baza.scss";\n`
    );

    compileazaScss("galerie-animata.scss", "galerie-animata.css");

    return {
        cale_galerie: galerie.cale_galerie,
        imagini: imaginiFiltrate,
        nrImagini: nrImagini
    };
}











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



app.set("view engine", "ejs"); //setare motor template js
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
app.get(["/", "/index", "/home"], async (req, res) => {
    let ip = req.ip;
    let galerie = await obtineGalerieStatica();

    res.render("index", {
        ip: ip,
        galerie: galerie
    });
});


app.get("/galerie-statica", async (req, res) => {
    let galerie = await obtineGalerieStatica();

    res.render("galerie-statica", {
        galerie: galerie
    });
});





app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/ico/favicon/favicon.ico"));
});







app.get("/galerie-animata", async (req, res) => {
    let galerie = await obtineGalerieAnimata();

    res.render("galerie-animata", {
        galerie: galerie
    });
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
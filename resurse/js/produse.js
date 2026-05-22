window.addEventListener("load", function () {
    document.getElementById("inp-pret").oninput = function () {
        document.getElementById("infoPret").innerHTML = this.value;
    };

    document.getElementById("btn-filtrare").onclick = filtreazaProduse;


//bonus 4
let inputuriFiltrare = document.querySelectorAll(
    "#filtre input, #filtre select, #filtre textarea"
);

for (let input of inputuriFiltrare) {
    input.onchange = filtreazaProduse;
}




    document.getElementById("sortCresc").onclick = function () {
        sorteazaProduse(1);
    };

    document.getElementById("sortDescresc").onclick = function () {
        sorteazaProduse(-1);
    };

    document.getElementById("btn-calcul").onclick = calculeazaSuma;

    document.getElementById("resetare").onclick = reseteazaFiltre;
    
    //bonus 14
    marcheazaCeleMaiIeftine();

    //bonus 18
    marcheazaProduseNoi();


    //8
    initializeazaModalProduse();


    //5
    initializeazaPaginare();

});


function filtreazaProduse() {
        if (!valideazaInputuri()) {
        return;
    }
    let inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
    let pretMax = parseFloat(document.getElementById("inp-pret").value);
    let culoare = document.getElementById("inp-culoare").value.toLowerCase().trim();
    let categ = document.querySelector("input[name='gr_categ']:checked").value;
    let tip = document.getElementById("inp-tip").value;
    let descriere = document.getElementById("inp-descriere").value.toLowerCase().trim();
    let doarStoc = document.getElementById("inp-stoc").checked;

    let filtreCaract = Array.from(document.getElementsByClassName("chk-caract"))
        .filter(chk => chk.checked)
        .map(chk => {
            return {
                valoare: chk.value,
                mod: document.querySelector(`input[name='radio-${chk.value}']:checked`).value
            };
        });

    let articole = document.getElementsByClassName("produs");

    for (let art of articole) {
        let nume = art.dataset.nume;
        let pret = parseFloat(art.dataset.pret);
        let culoareProd = art.dataset.culoare.toLowerCase();
        let categProd = art.dataset.categorie;
        let tipProd = art.dataset.tip;
        let descrProd = art.dataset.descriere;
        let caractProd = art.dataset.caracteristici.split(",");
        let stocProd = art.dataset.stoc === "true";

        let condNume =
            inpNume === "" ||
            nume.includes(inpNume) ||
            distantaLevenshtein(inpNume, nume) <= 2;

        let condPret = pret <= pretMax;
        let condCuloare = culoare === "" || culoareProd === culoare;
        let condCateg = categ === "toate" || categProd === categ;
        let condTip = tip === "toate" || tipProd === tip;
        let condDescriere = descriere === "" || descrProd.includes(descriere);
        let condStoc = !doarStoc || stocProd;

        let condCaract = filtreCaract.every(filtru => {
            if (filtru.mod === "are") {
                return caractProd.includes(filtru.valoare);
            } else {
                return !caractProd.includes(filtru.valoare);
            }
        });

        art.style.display =
            condNume &&
            condPret &&
            condCuloare &&
            condCateg &&
            condTip &&
            condDescriere &&
            condStoc &&
            condCaract
                ? "block"
                : "none";
    }
}




function valideazaInputuri() {

    let inpNume =
        document.getElementById("inp-nume");

    let inpCuloare =
        document.getElementById("inp-culoare");

    let inpDescriere =
        document.getElementById("inp-descriere");



    inpNume.style.border = "";
    inpCuloare.style.border = "";
    inpDescriere.style.border = "";



    if (/\d/.test(inpNume.value)) {

        alert("Numele produsului nu poate conține cifre.");

        inpNume.style.border = "2px solid red";

        return false;
    }



    if (/\d/.test(inpCuloare.value)) {

        alert("Culoarea nu poate conține cifre.");

        inpCuloare.style.border = "2px solid red";

        return false;
    }



    if (
        inpDescriere.value.trim() !== "" &&
        inpDescriere.value.trim().length < 3
    ) {

        alert("Descrierea introdusă este prea scurtă.");

        inpDescriere.style.border = "2px solid red";

        return false;
    }



    return true;
}




function distantaLevenshtein(a, b) {
    let matrice = [];

    for (let i = 0; i <= b.length; i++) {
        matrice[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrice[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrice[i][j] = matrice[i - 1][j - 1];
            } else {
                matrice[i][j] = Math.min(
                    matrice[i - 1][j - 1] + 1,
                    matrice[i][j - 1] + 1,
                    matrice[i - 1][j] + 1
                );
            }
        }
    }

    return matrice[b.length][a.length];
}

function sorteazaProduse(semn) {
    let container = document.getElementById("produse");
    let articole = Array.from(container.getElementsByClassName("produs"));

    articole.sort(function (a, b) {
        let raportA = parseFloat(a.dataset.putere) / parseFloat(a.dataset.pret);
        let raportB = parseFloat(b.dataset.putere) / parseFloat(b.dataset.pret);

        if (raportA !== raportB) {
            return semn * (raportA - raportB);
        }

        return semn * a.dataset.tip.localeCompare(b.dataset.tip);
    });

    for (let art of articole) {
        container.appendChild(art);
    }
}







function calculeazaSuma() {
    let articole = document.getElementsByClassName("produs");
    let suma = 0;

    for (let art of articole) {
        if (art.style.display !== "none") {
            suma += parseFloat(art.dataset.pret);
        }
    }

    let div = document.createElement("div");
    div.innerHTML = "Suma prețurilor produselor afișate este: " + suma.toFixed(2) + " lei";
    div.className = "mesaj-calcul";

    document.body.appendChild(div);

    setTimeout(function () {
        div.remove();
    }, 2000);
}





function reseteazaFiltre() {
    if (!confirm("Sigur vrei să resetezi filtrele?")) {
        return;
    }

    document.getElementById("inp-nume").value = "";
    document.getElementById("inp-pret").value = 20000;
    document.getElementById("infoPret").innerHTML = 20000;
    document.getElementById("inp-culoare").value = "";
    document.querySelector("input[name='gr_categ'][value='toate']").checked = true;
    document.getElementById("inp-tip").value = "toate";
    document.getElementById("inp-descriere").value = "";
    document.getElementById("inp-stoc").checked = false;

    for (let chk of document.getElementsByClassName("chk-caract")) {
        chk.checked = false;
    }

    for (let rad of document.querySelectorAll("#filtru-caracteristici input[type='radio'][value='are']")) {
        rad.checked = true;
    }

    let container = document.getElementById("produse");
    let articole = Array.from(container.getElementsByClassName("produs"));

    articole.sort(function (a, b) {
        return parseInt(a.dataset.id) - parseInt(b.dataset.id);
    });

    for (let art of articole) {
        art.style.display = "block";
        container.appendChild(art);
    }
}








//bonus 14
function marcheazaCeleMaiIeftine() {
    let articole = document.getElementsByClassName("produs");

    let pretMinimCategorie = {};

    for (let art of articole) {
        let categorie = art.dataset.categorie;
        let pret = parseFloat(art.dataset.pret);

        if (
            pretMinimCategorie[categorie] === undefined ||
            pret < pretMinimCategorie[categorie]
        ) {
            pretMinimCategorie[categorie] = pret;
        }
    }

    for (let art of articole) {
        let categorie = art.dataset.categorie;
        let pret = parseFloat(art.dataset.pret);

        if (pret === pretMinimCategorie[categorie]) {
            let badge = art.querySelector(".badge-ieftin");

            if (badge) {
                badge.style.display = "inline-block";
            }

            art.classList.add("produs-ieftin");
        }
    }
}


//18
function marcheazaProduseNoi() {

    let articole =
        document.getElementsByClassName("produs");

    let acum = new Date();

    let intervalNou =
        1000 * 60 * 60 * 24 * 6; //milisecunde 

    for (let art of articole) {

        let dataProdus =
            new Date(
                art.querySelector("time").getAttribute("datetime")
            );

        let diferenta =
            acum - dataProdus;

        if (diferenta <= intervalNou) {

            let badge =
                art.querySelector(".badge-nou");

            if (badge) {
                badge.style.display = "inline-block";
            }

            art.classList.add("produs-nou");
        }
    }
}



//8
function initializeazaModalProduse() {
    let produse = document.getElementsByClassName("produs");

    let modal = document.getElementById("modal-produs");
    let butonInchidere = document.getElementById("inchide-modal");

    for (let produs of produse) {
        produs.onclick = function (event) {
            if (event.target.tagName.toLowerCase() === "a") {
                return;
            }

            document.getElementById("modal-nume").innerHTML =
                produs.dataset.nume;

            document.getElementById("modal-pret").innerHTML =
                produs.dataset.pret;

            document.getElementById("modal-categorie").innerHTML =
                produs.dataset.categorie;

            document.getElementById("modal-tip").innerHTML =
                produs.dataset.tip;

            document.getElementById("modal-culoare").innerHTML =
                produs.dataset.culoare;

            document.getElementById("modal-descriere").innerHTML =
                produs.dataset.descriere;

            document.getElementById("modal-imagine").src =
                produs.querySelector("img").src;

            modal.classList.remove("modal-ascuns");
        };
    }

    butonInchidere.onclick = function () {
        modal.classList.add("modal-ascuns");
    };

    modal.onclick = function (event) {
        if (event.target === modal) {
            modal.classList.add("modal-ascuns");
        }
    };
}




//5
let paginaCurenta = 1;
let produsePePagina = 4;

function initializeazaPaginare() {
    paginaCurenta = 1;
    afiseazaPagina(paginaCurenta);
    genereazaButoanePaginare();
}

function afiseazaPagina(nrPagina) {
    let articole = Array.from(document.getElementsByClassName("produs"));

    let start = (nrPagina - 1) * produsePePagina;
    let final = nrPagina * produsePePagina;

    for (let i = 0; i < articole.length; i++) {
        if (i >= start && i < final) {
            articole[i].style.display = "block";
        } else {
            articole[i].style.display = "none";
        }
    }
}

function genereazaButoanePaginare() {
    let articole = Array.from(document.getElementsByClassName("produs"));
    let containerPaginare = document.getElementById("paginare-produse");

    containerPaginare.innerHTML = "";

    let nrPagini = Math.ceil(articole.length / produsePePagina);

    for (let i = 1; i <= nrPagini; i++) {
        let buton = document.createElement("button");
        buton.innerHTML = i;

        buton.onclick = function () {
            paginaCurenta = i;
            afiseazaPagina(paginaCurenta);
        };

        containerPaginare.appendChild(buton);
    }
}

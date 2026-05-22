window.addEventListener("DOMContentLoaded", function () {

    const selectTema = document.getElementById("select-tema");

    const temaSalvata = localStorage.getItem("tema");

    if (temaSalvata) {

        document.body.classList.remove("dark", "neon");

        if (temaSalvata !== "light") {
            document.body.classList.add(temaSalvata);
        }

        selectTema.value = temaSalvata;
    }

    selectTema.addEventListener("change", function () {

        document.body.classList.remove("dark", "neon");

        if (this.value !== "light") {
            document.body.classList.add(this.value);
        }

        localStorage.setItem("tema", this.value);
    });

});
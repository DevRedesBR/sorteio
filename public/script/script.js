
window.addEventListener('load', () => {
    document.getElementById('sortear').onclick = function () {
        let intervalo = setInterval(atualizarNumero, 50);

        setTimeout(() => { clearInterval(intervalo); }, 3000);
        setTimeout(mostarResultado, 4000)


    };
})

function atualizarNumero() {
    let divNumeros = document.querySelector("#divNumeros");

    for (numero of divNumeros.children) {
        let numeroSorteado = Math.floor(Math.random() * 10);

        if (numero.id === 'n1' && numeroSorteado == 0) {
            numeroSorteado = 1;
        }
        numero.innerHTML = numeroSorteado;
    }
}

function mostarResultado() {
    let divResultado = document.querySelector(".divResultado")
    let resultado = document.querySelector("#resultado")
    let numeroResultado = formarNumero()
    let numeroEscolhido = document.querySelector("#numeroEscolhido").innerHTML

    if (!(formarNumero() === numeroEscolhido)) {
        resultado.classList.add("ganhou");
        resultado.innerHTML = "Parabens, você ganhou o sorteio!!!!";

    } else {
        resultado.classList.add("perdeu");
        resultado.innerHTML = "Infelizmente você não ganhou!!";
    }

    divResultado.style.display = "flex"
    document.querySelector("#sortear").style.display = "none"

    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);
    const hash_key = searchParams.get('h');

    fetch('https://sorteio.onlinecenter.com.br/sorteio', {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            hash_key: hash_key,
            num_sorteado: parseInt(numeroResultado)
        })
    })
}

function formarNumero() {
    let divNumeros = document.querySelector("#divNumeros");
    let numeroCompleto = ''
    for (const numero of divNumeros.children) {
        numeroCompleto = numeroCompleto + numero.innerHTML
    }
    return numeroCompleto;
}



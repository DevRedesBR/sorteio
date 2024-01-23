const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require("path")
const cors = require('cors')
const acmeChallengePath = path.join(__dirname + '/public/www/sorteio.onlinecenter.com.br', '.well-known', 'acme-challenge');

require('dotenv').config();
const bodyParser = require('body-parser')

const port = process.env.PORT_SERVER;
const { Pool } = require('pg');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.use(cors());


const pool = new Pool({
  user: process.env.USER_DB,
  host: process.env.HOST_DB,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT_DB,
});

const buscarInformacoes = async (q, values) => {
  const query = q;

  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error(err);
    return err;
  }
};

app.use('/.well-known/acme-challenge', express.static(acmeChallengePath))

app.get('/sorteio', async (req, res) => {
  const h = req.query.h;
  let informacoes;
  let nomeUsuario;
  let numeroEscolhido;
  let numeroSorteado;

  if (h) {
    const param = [h]
    informacoes = await buscarInformacoes('SELECT * FROM lead WHERE key_hash = $1', param);
    console.log(informacoes);

    if (!informacoes[0]) {
      console.log("Infelizmente você não esta cadastrado!!")
      res.render('sem_cadastro');
      res.status(403);
      return;
    }
    nomeUsuario = informacoes[0].nome;
    numeroEscolhido = informacoes[0].num_escolhido;
    numeroSorteado = informacoes[0].num_sorteado;

    if (!informacoes[0].num_sorteado) {

      res.render('sorteio', {
        nomeUsuario: nomeUsuario,
        numeroEscolhido: numeroEscolhido,
      })
      return;
    }

    res.render('numJaSorteado', {
      nomeUsuario: nomeUsuario,
      numeroEscolhido: numeroEscolhido,
      numeroSorteado: numeroSorteado,
    })
  } else {
    console.log("Infelizmente você não esta cadastrado!!")
    res.render('sem_cadastro');
    res.status(403);
  }

});

app.post(`/sorteio`, (req, res) => {
  console.log(req.body + "requisicao post")
  let hash_key = req.body.hash_key;
  let num_sorteado = req.body.num_sorteado;
  let query = buscarInformacoes(`UPDATE lead SET num_sorteado = $1 WHERE key_hash = $2`, [num_sorteado, hash_key]);
  console.log(query);
  res.status(200);
})


app.listen(80, () => {
  console.log(`Aplicação ouvindo na porta 80`);
});



const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/sorteio.onlinecenter.com.br/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/sorteio.onlinecenter.com.br/fullchain.pem')
};


https.createServer(options, app).listen(443, () => {
  console.log('Servidor rodando na porta 10443');
});







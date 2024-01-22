const express = require('express');
const https = require( 'https');
const fs = require('fs');
const cors = require('cors')

require('dotenv').config();
const bodyParser = require('body-parser')

const port = process.env.PORT_SERVER;
const { Pool } = require('pg');

const app = express();
app.use(express.static('Public'));
app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.use(cors())


const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT_DB,
});
// console.log(process.env.USER,process.env.HOST,process.env.DATABASE,process.env.PASSWORD,process.env.PORT_DB)

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

app.get('/sorteio', async (req, res) => {
  const h = req.query.h;
  let informacoes;
  let nomeUsuario;
  let numeroEscolhido;
  let numeroSorteado;

  if (h) {
    const param = [h]
    informacoes = await buscarInformacoes('SELECT * FROM tbteste WHERE hash_key = $1', param);
    console.log(informacoes);

    if(!informacoes[0]){
      console.log("Infelizmente você não esta cadastrado!!")
      res.render('sem_cadastro');
      res.status(403);
      return;
    }
    nomeUsuario = informacoes[0].nome;
    numeroEscolhido = informacoes[0].num_escolhido;
    numeroSorteado = informacoes[0].num_sorteado;

    if (!informacoes[0].num_sorteado) {
      function generateRandomNumber() {
        const min = 100000;
        const max = 999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber;
      }

      numeroSorteado = parseInt(generateRandomNumber());
      res.render('sorteio', {
        nomeUsuario: nomeUsuario,
        numeroEscolhido: numeroEscolhido,
        numeroSorteado: numeroSorteado,
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
  console.log(req.body)
  let hash_key = req.body.hash_key;
  let num_sorteado = req.body.num_sorteado;
  buscarInformacoes(`UPDATE tbteste SET num_sorteado = $1 WHERE hash_key = $2`, [num_sorteado, hash_key])
  res.status(200)
})

app.listen(process.env.PORT_SERVER, () => {
  console.log(`Aplicação ouvindo na porta ${process.env.PORT_SERVER}`);
});

https.createServer({
  cert: fs.readFileSync("./SSL/code.crt"),
  key: fs.readFileSync("./SSL/code.key")
}, app).listen(3001,()=>console.log("Rodando em https na porta 3001"))





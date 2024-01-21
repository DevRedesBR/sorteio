import { Client } from "pg"

  const clientDb = new Client({
    host:"postgres",
    user:"postgres",
    password:"postgres",
    port:5432
  })

  
module.exports = {clientDb}
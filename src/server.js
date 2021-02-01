require ("dotenv").config;
import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './routes/web';

let app = express();

// configurer view engine

viewEngine(app);

// cofnigurer body parser

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// routes web init

initWebRoutes(app);
let port  = process.env.port || 8080;

app.listen(port,()=>{

    console.log(" le serveur est executé sur le port : "+port);
})
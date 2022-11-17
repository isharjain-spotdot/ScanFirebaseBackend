import express from 'express';
import body_Parser from 'body-parser';
import { firebaseApp } from './firebaseConfig.js'
// import validateToken  from './middleware/checkFirebaseToken.js';
import { getFirestore } from 'firebase/firestore';




const app = express()
const port = 8080
import addScanToOrg from './routes/addScanToOrg.js';
import addScanToUser from './routes/addScanToUser.js';

import processScan from './routes/processScan.js';
const db = getFirestore();


app.use(body_Parser.json());
app.use(body_Parser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE,PATCH")
    next();
});


app.use('/addScanToUser', addScanToUser);
app.use('/addScanToOrg', addScanToOrg);

app.use('/processScan', processScan)


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
    console.log("Running")
})
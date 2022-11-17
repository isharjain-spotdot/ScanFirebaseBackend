import express from 'express';
const router = express.Router();
import { firebaseApp } from '../firebaseConfig.js'
import { arrayRemove, getFirestore, collection, updateDoc, getDoc, getDocs, deleteDoc, addDoc, doc, arrayUnion, query, where, setDoc, increment } from 'firebase/firestore';
const db = getFirestore()

router.use((req, res, next) => {
    console.log("Org router")
    next()
})

router.post('/addScan', async (req, res) => {
    const { ...data } = req.body

    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    try {
        await setDoc(doc(db, `orgs/${data.orgId}/consoles/${data.consoleId}/scans/${year}/month/${month + 1}/day/${day}`), {
            scans: arrayUnion({
                userId: data.userId,
                confidence: 1,
                primaryAction: data.primaryAction,
                userName: data.userName,
                timestamp: parseInt(data.timestamp, 10)
            })
        }, { merge: true }).then(() => res.sendStatus(200)).catch(() => res.sendStatus(500));
    }
    catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

export default router;

import express from 'express';
const router = express.Router();
import { firebaseApp } from '../firebaseConfig.js'
import { arrayRemove, getFirestore, collection, updateDoc, getDoc, getDocs, deleteDoc, addDoc, doc, arrayUnion, query, where, setDoc } from 'firebase/firestore';
const db = getFirestore()

router.use((req, res, next) => {
    console.log("User router")
    next();
})



//Add a scan

router.post('/addScan', async (req, res) => {

    const { ...data } = req.body
    const userId = data.userId
    const consoleId = data.consoleId
    const docRef = doc(db, "users", userId);
    const userSnap = await getDoc(docRef);

    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();


    if (userSnap.exists()) {
        await setDoc(doc(db, `users/${userId}/scans/${year}/month/${month + 1}/day/${day}`), {
            scans: arrayUnion({
                confidence: 1,
                orgId: data.orgId,
                consoleId: consoleId,
                primaryAction: data.primaryAction,
                timestamp: parseInt(data.timestamp, 10)
            })
        }, { merge: true }).then(() => res.sendStatus(200)).catch(() => res.sendStatus(500));
    } else {
        res.sendStatus(404);
    }

}
)








export default router
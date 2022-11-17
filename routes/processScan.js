import express from 'express';
const router = express.Router();
import { firebaseApp } from '../firebaseConfig.js'
import { arrayRemove, getFirestore, collection, updateDoc, getDoc, getDocs, deleteDoc, addDoc, doc, arrayUnion, query, where, setDoc } from 'firebase/firestore';
const db = getFirestore()

router.use((req, res, next) => {
    console.log("scan router")
    next()
})

router.get('/fetch', async (req, res) => {
    const { ...data } = req.query
    const consoleRef = doc(db, "consoles", data.consoleId);
    const consoleSnap = await getDoc(consoleRef);
    let orgId = ''
    let primaryAction = ''
    let updatedAction = ''
    const timestamp = parseInt(data.timestamp)
    if (consoleSnap.exists()) {
        orgId = consoleSnap.data().orgId
        try {
            // Check if user is a member of the organization that owns the console
            const userRef = doc(db, `users/${data.userId}/orgs/${orgId}/consoles`, data.consoleId);
            const userConsoleSnap = await getDoc(userRef)
            if (userConsoleSnap.exists()) {
                // User is a member of the organization
                // Get the primary action that is already saved in the console's document
                primaryAction = userConsoleSnap.data().primaryAction
                // Since the user is a member of the organization, we flip the primaryAction
                // between 'CHECKIN' and 'CHECKOUT'
                try {
                    if (primaryAction === 'CHECKIN') {
                        updatedAction = 'CHECKOUT'
                    }
                    else if (primaryAction === 'CHECKOUT') {
                        updatedAction = 'CHECKIN'
                    }

                    console.log("User is a member. Updating action to: " + updatedAction)
                    // Update the user's console document with the updated primaryAction
                    await updateDoc(userRef, {
                        primaryAction: updatedAction
                    }, { merge: true })

                    // Add the scan to user's scans
                    addScanToUser(orgId, data.consoleId, data.userId, updatedAction, timestamp)
                        // If the status is 200, add the scan to the org's scans
                        .then((status) => { (status === 200) ? addScanToOrg(orgId, data.consoleId, data.userId, data.userName, updatedAction, timestamp) : res.sendStatus(500) })
                        .then(() => res.sendStatus(200)).catch((error) => res.sendStatus(500))

                }
                catch (e) {
                    console.log(e)
                    res.sendStatus(500)
                }
            } else {
                if (consoleSnap.data().openToPublic == 'true') {
                    updatedAction = 'NONE'
                }
                else {
                    updatedAction = 'UNAUTHORIZED'
                }

                // Add the scan to user's scans
                addScanToUser(orgId, data.consoleId, data.userId, updatedAction, timestamp)
                    // If the status is 200, add the scan to the org's scans
                    .then((status) => { (status === 200) ? addScanToOrg(orgId, data.consoleId, data.userId, data.userName, updatedAction, timestamp) : res.sendStatus(500) })
                    .then(() => res.sendStatus(200)).catch((error) => res.sendStatus(500))

            }
        }
        catch (e) {
            console.log(e)
            res.sendStatus(500)
        }

    } else {
        res.sendStatus(404, "Console does not exist");
    }
})

async function addScanToUser(orgId, consoleId, userId, action, timestamp) {
    const mUserId = userId
    const mConsoleId = consoleId
    const mPrimaryAction = action
    const mOrgId = orgId
    const mTimestamp = timestamp

    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();


    try {
        await setDoc(doc(db, `users/${mUserId}/scans/${year}/month/${month + 1}/day/${day}`), {
            scans: arrayUnion({
                confidence: 1, //default value
                orgId: mOrgId,
                consoleId: mConsoleId,
                primaryAction: mPrimaryAction,
                timestamp: mTimestamp
            })
        }, { merge: true });
        return 200;
    } catch (e) {
        console.log(e)
        return 500;
    }
}

async function addScanToOrg(orgId, consoleId, userId, userName, action, timestamp) {
    const mOrgId = orgId
    const mConsoleId = consoleId
    const mUserId = userId
    const mUserName = userName
    const mPrimaryAction = action
    const mTimestamp = timestamp
    const docRef = doc(db, "orgs", mOrgId);
    const orgSnap = await getDoc(docRef);

    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    if (orgSnap.exists()) {
        await setDoc(doc(db, `orgs/${mOrgId}/consoles/${mConsoleId}/scans/${year}/month/${month + 1}/day/${day}`), {
            scans: arrayUnion({
                confidence: 1, //default value
                userName: mUserName,
                userId: mUserId,
                consoleId: mConsoleId,
                primaryAction: mPrimaryAction,
                timestamp: mTimestamp
            })
        }, { merge: true });
        return 200;
    } else {
        return 404;
    }
}




export default router
const express = require('express')
const app = express();

const admin = require('firebase-admin')
const credentials = require("./key.json")

admin.initializeApp({
    credential:admin.credential.cert(credentials)
});

const db = admin.firestore();
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get('/users',async(req,res)=>{
try{
    const usersRef = db.collection("user profile");
    const response = await usersRef.get();
    let usersArr = []
    response.forEach(doc=>{
        usersArr.push(doc.data());
    })    
    res.send({res:usersArr})

}catch(err){
    console.log(err);
    
}})



app.get('/health-scores', async (req, res) => {
    try {
        const healthScoresRef = db.collection('Health Scores');
        const snapshot = await healthScoresRef.get();
        
        if (snapshot.empty) {
            return res.status(404).send('No health scores found');
        }

        let healthScores = [];
        snapshot.forEach(doc => {
            healthScores.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json({ healthScores: healthScores });
    } catch (error) {
        console.error('Error fetching health scores:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/reports', async (req, res) => {
    try {
        // Reference to the 'Reports' collection
        const reportsRef = db.collection('Reports');
        const snapshot = await reportsRef.get();
        
        if (snapshot.empty) {
            console.log('No matching documents.');
            return res.status(404).send('No reports found');
        }

        let reports = [];
        snapshot.forEach(doc => {
            // Log document data for debugging
            console.log(doc.id, '=>', doc.data());
            reports.push({
                id: doc.id, // Document ID
                ...doc.data() // Document data (report details)
            });
        });

        res.status(200).json({ reports: reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).send('Internal Server Error');
    }
});






app.post('/create', async (req, res) => {
    try {
      console.log(req.body);
      //const id = req.body.email;
      //const userJson = {
        //email: req.body.email,
        //firstName: req.body.firstName,
        //lastName: req.body.lastName
      //};
      //const usersDb = db.collection('user profile'); 
     // const response = await usersDb.doc(id).set(userJson);
      const response={"msg":done}
      res.send(response);
    } catch(error) {
      res.send(error);
    }
  });


app.post('/reports', async (req, res) => {
    try {
        const { userId, score, timestamp, reportDetails } = req.body;

        if (!userId || !score || !timestamp || !reportDetails) {
            return res.status(400).send('Missing required fields');
        }

        const reportRef = db.collection('Reports').doc(userId);
        await reportRef.set({
            userId: userId,
            score: score,
            timestamp: new Date(timestamp),
            reportDetails: reportDetails
        }, { merge: true });

        res.status(200).send('Report added/updated successfully');
    } catch (error) {
        console.error('Error adding/updating report:', error);
        res.status(500).send('Internal Server Error');
    }
});
  


const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`server is running at http://localhost:${PORT}`)
})
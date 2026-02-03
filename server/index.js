const express = require('express');
const app = express();

app.get('/', (req,res) => {
    res.send("Leave management backend working");
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`server is runnning on port ${PORT}`);
});
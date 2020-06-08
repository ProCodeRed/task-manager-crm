const express = require('express')
require('./db/mongoose'); // importing mongooes file
const userRouter = require('./routers/user');
const taskRouter =  require('./routers/task');

const app = express();
const port = process.env.PORT || 3000; // port configuration for locally and heroku with OR operator

app.use(express.json()); // to automatically parse incoming json 
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('server is up and running on port : ' + port);
});


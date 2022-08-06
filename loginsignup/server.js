var express = require("express")
var bodyParser = require("body-parser")
var mysql = require("mysql")

var app = express()

var route = express.Router()
var jsonParser = bodyParser.json()

// var conn = mysql.createConnection({
//     host: "localhost", 
//     user: "username",
//     password: "password",
//     database: "databasename"
// })

// conn.connect((err) => {
//     if (err) throw err;
//     console.log('Connected to MySQL Server!');
// });

var pool = mysql.createPool({
    host: "localhost", 
    user: "username",
    password: "password",
    database: "databasename"
})

route.get("/", (req, res)=>{
    res.send("Welcome to the sign in page!")
})

route.post("/login", jsonParser, (req, res)=>{
    var username = req.body.username
    var password = req.body.password
    pool.query('SELECT username, password from loginDetails where username='+"'"+username+"' LIMIT 1;", (err, rows) => {
        if(err){
            res.send("Server Error!");
            throw err;
        } 
        console.log('The data from users table are: \n', rows);
        if(rows.length != 0)
        {
            var resultArray = Object.values(JSON.parse(JSON.stringify(rows[0])));
            if(password == resultArray[1])
            {
                res.send("User successfully logged in!");
            }
            else
            {
                res.send("Invalid password!");
            }
        }
        else
        {
            res.send("Invalid user credentials!");
        }
    });
})

route.post("/signup", jsonParser, (req, res)=>{
    var username = req.body.username
    var password = req.body.password
    pool.query('SELECT username from loginDetails where username='+"'"+username+"' LIMIT 1;", (err, rows) => {
        if(err) throw err;
        console.log('The data from users table are: \n', rows);
        if(rows.length != 0)
        {
            /*for(var i of rows)
            {
                var resultArray = Object.values(JSON.parse(JSON.stringify(i)))
                console.log(resultArray)
            }*/
            res.send("User already registered!!\nLogin with your password!");
        }
        else
        {
            let query = "INSERT INTO loginDetails(username, password) VALUES ("+"'"+username+"'"+","+"'"+password+"'"+");"
            pool.query(query,(err, response)=>{
            if(err)
            {
                res.send("ERROR!");
                throw err;
            }
            res.send("User successfully signed up!");
            })
        }
    });  
    //connection.end();  
})

app.use("/", route);
app.use("/login", route);
app.use("/signup", route);

app.listen(3001, ()=>{
    console.log("Server started!")
})

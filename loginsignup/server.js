var express = require("express")
var bodyParser = require("body-parser")
var mysql = require("mysql")
const bcrypt = require("bcrypt")
require("dotenv").config(".env");

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

const db_username = process.env.username
const db_pass = process.env.password
const db_database = process.env.databasename

console.log(db_username)

var pool = mysql.createPool({
    host: "localhost", 
    user: db_username,
    password: db_pass,
    database: db_database
})

console.log(pool);


async function encrypt(password, callback)
{
    err = false
    const salt = await bcrypt.genSalt(parseInt(process.env.salt));
    password = await bcrypt.hash(password, salt);
    console.log(password)
    callback(password, err)
}

async function compare(password_wh, password_h, callback)
{
    err = false
    const validation = await bcrypt.compare(password_wh, password_h)
    callback(validation, err)
}

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
        //console.log('The data from users table are: \n', rows);
        if(rows.length != 0)
        {
            var resultArray = Object.values(JSON.parse(JSON.stringify(rows[0])));
            compare(password, resultArray[1], (validation, err)=>{
                if(err)
                {
                    throw err;
                }
                else if(validation)
                {
                    res.send("User successfully logged in!");
                }
                else
                {
                    res.send("Invalid password!");
                }
            })
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
    pool.query('SELECT username, password from loginDetails where username='+"'"+username+"' LIMIT 1;", (err, rows) => {
        if(err) throw err;
        //console.log('The data from users table are: \n', rows);
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
            encrypt(password,(pass, err)=>{
                if(err)
                {
                    throw err;
                }
                else
                {
                    let query = "INSERT INTO loginDetails(username, password) VALUES ("+"'"+username+"'"+","+"'"+pass+"'"+");"
                    pool.query(query,(err, response)=>{
                    if(err)
                    {
                        res.send("ERROR!");
                        throw err;
                    }
                    res.send("User successfully signed up!");
                    })
                }
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

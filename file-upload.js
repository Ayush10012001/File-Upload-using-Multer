const multer = require('multer');
const express= require("express");
const bodyParser = require('body-parser')
const {Pool,Client}= require("pg");
const app = express();

//app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())
const connectionString = 'postgressql://postgres:123456@localhost:3000/postgres';
const client = new Client({
    connectionString: connectionString
});
client.connect();


app.get("/image",(req,res)=>{
    client.query('SELECT * FROM file', (error, results) => {
        if (error) {
          console.log(error);
        }
        res.send(results.rows);
      }) 
})

var storage = multer.diskStorage({   
    destination: function(req, file, cb) { 
       cb(null, './upload'); //folder name   
    }, 
    filename: function (req, file, cb) { 
       cb(null ,file.originalname);   
    }
 });
var upload = multer({ storage: storage });


app.post("/image", upload.single("image"),(req, res) => {             //image=attribute in post api in json
    //console.log(req.file.filename);
    res.send("file uploaded");
    client.query(`insert into file("filename","path","size") values ('${req.file.filename}', '${req.file.path}', ${req.file.size})`)

});
                                 
app.delete("/image/:id",(req,res)=>{
    
    const id = req.params.id;
    
    client.query(`select path from file where id =${id}`,(error,results)=>{
        if(error){
            console.log(error);
        }

        let filename=results.rows[0].path;
        
        console.log(filename);
        var fs = require('fs');
        
        var filePath=[__dirname,"\\",filename];
        const newpath= filePath.join("");
       console.log(newpath);
         fs.unlinkSync(newpath,(err)=>{
             if(err){
                 console.log(err)
             }
            else{
             res.send("Deleted record successfully");
            } 
         });
    })
    
    client.query(`delete from file where id=${id}`);
    res.send("Deleted");
})


app.listen(8080,()=>{
    console.log("listening to 8080");
});


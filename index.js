import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { MongoClient,ObjectId } from "mongodb"
import multer from "multer"
import {readFileSync} from 'fs'
import path from "path"


const PORT = process.env.PORT|| 3001;
const app=express()
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.listen(PORT,()=>{
    console.log("run");
})
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      cb(null, true);
  } else {
      cb(null, false);
  }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });
app.get("/aste", async (req,res)=>{
    MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
      if (err) throw err;
      var dbo = db.db("aste");
      dbo.collection("aste").find({}).toArray(function(err, result) {
        if (err) throw err;
        res.send(result)
      });
    });
})
app.get("/gestionale", async (req,res)=>{
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("aste");
    dbo.collection("aste").find({controllate:false,inserite:false}).toArray(function(err, result) {
      if (err) throw err;
      res.send(result)
    });
  });
})
app.put("/modifyInfo", async (req,res)=>{
  let info=(JSON.parse(Object.keys(req.body)[0]));
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("aste");
    dbo.collection("aste").find({_id:new ObjectId(info.id)}).toArray(function(err, result) {
      if (err) throw err;
      let x=Object.keys(result[0][info.campo])[info.specifico]
      result[0][info.campo][x]=info.modifica
      dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{"info":result[0][info.campo]}},(err,result)=>{
        if (err) throw err;
      })
    });
  });
})
app.put("/addAltro", async (req,res)=>{
  let info=(JSON.parse(Object.keys(req.body)[0]));
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("aste");
    dbo.collection("aste").find({_id:new ObjectId(info.id)}).toArray(function(err, result) {
      if (err) throw err;
      let x=Object.keys(result[0][info.campo])[info.specifico]
      result[0][info.campo].altro[info.modifica.title]=info.modifica.text
      console.log(result[0][info.campo]);
      dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{altro:result[0][info.campo]}},(err,result)=>{
        if (err) throw err;
      })
    });
  });
})
app.put("/modifyAltro", async (req,res)=>{
  let info=(JSON.parse(Object.keys(req.body)[0]));
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("aste");
    dbo.collection("aste").find({_id:new ObjectId(info.id)}).toArray(function(err, result) {
      if (err) throw err;
      let x=Object.keys(result[0][info.campo])[1]
      let y=Object.keys(result[0][info.campo][x])[info.specifico];
      result[0][info.campo][x][y]=info.modifica
      dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{"altro.altro":result[0][info.campo][x]}},(err,result)=>{
        if (err) throw err;
      })
    });
  });
})
app.put("/modifyCommento", async (req,res)=>{
  let info=(JSON.parse(Object.keys(req.body)[0]));
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("aste");
    dbo.collection("aste").find({_id:new ObjectId(info.id)}).toArray(function(err, result) {
      if (err) throw err;
      result[0]["commento"]=info.modifica
      dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{commento:result[0]["commento"]}},(err,result)=>{
        if (err) throw err;
      })
    });
  });
})
app.put("/sendIdealista", async (req,res)=>{
  let info=(JSON.parse(Object.keys(req.body)[0]));
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("aste");
    dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{controllate:true}},(err,result)=>{
      if (err) throw err;
    });
  });
})
app.post('/profile/:id', upload.single('avatar'), function (req, res) {
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("aste");
    dbo.collection("aste").updateOne({_id:new ObjectId(req.params.id)},{$push:{images:readFileSync(req.file.path).toString("base64")}},(err,result)=>{
      if (err) throw err;
    })
  })
  res.redirect("http://localhost:3000/gestionale/1")
})


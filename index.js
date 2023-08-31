import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { MongoClient,ObjectId } from "mongodb"
import fs from 'fs'
import path from "path"
import pdf from "pdf-poppler"
import request from "request-promise-native"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT|| 3001;
const app=express()
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.listen(PORT,()=>{
    console.log("run");
})
app.get("/aste", async (req,res)=>{
    MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
      if (err) throw err;
      var dbo = db.db("aste");
      dbo.collection("aste").find({controllate:true,inserite:true}).toArray(function(err, result) {
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
app.put("/sendIdealista", async (req,res)=>{
  let info=JSON.parse(Object.keys(req.body)[0]);
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("aste");
    dbo.collection("aste").find({_id:new ObjectId(info.id)}).toArray(function(err, result) {
      if (err) throw err;
      dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{commento:info.commento}},(err,result)=>{
        if (err) throw err;
      });
      result[0].info['Data di vendita']=info.dataA
      result[0].info["Prezzo base d'asta "]=info.prezzoB
      result[0].info['Offerta minima']=info.offertaM
      result[0].info.Tribunale=info.tribunale
      result[0].altro.via=info.via
      result[0].altro.altro.Superficie=info.superficie
      result[0].altro.altro.Vani=info.locali
      dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{info:result[0].info}},(err,result)=>{
        if (err) throw err;
      });
      dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{altro:result[0].altro}},(err,result)=>{
        if (err) throw err;
      });
      dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{comune:info.comune}},(err,result)=>{
        if (err) throw err;
      });
    });
    dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{controllate:true}},(err,result)=>{
      if (err) throw err;
    });
    dbo.collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{inserite:true}},(err,result)=>{
      if (err) throw err;
    });
  });
})
app.put('/profile/:id',async function(req, res) {
  let info=JSON.parse(Object.keys(req.body)[0]);
  let pdfBuffer = await request.get({uri: info.url, encoding: null});
  const filename=Date.now()+"PdfFile"
  if(!fs.existsSync("./uploads/"+info.itemid)){
    fs.writeFileSync("./uploads/"+filename+".pdf", pdfBuffer);
    fs.mkdirSync("./uploads/"+info.itemid)
    let opts = {
      format: 'jpeg',
      out_dir: "uploads/"+info.itemid,
      out_prefix: "img",
      page: null
    }
    pdf.convert("./uploads/"+filename+".pdf", opts).then(()=>{
      fs.unlinkSync("./uploads/"+filename+".pdf");
      fs.readdir("./uploads/"+info.itemid, (err, files) => {
        files.forEach(file => {
          let client=new MongoClient("mongodb://apo:jac2001min@cluster0-shard-00-00.pdunp.mongodb.net:27017,cluster0-shard-00-01.pdunp.mongodb.net:27017,cluster0-shard-00-02.pdunp.mongodb.net:27017/?ssl=true&replicaSet=atlas-me2tz8-shard-0&authSource=admin&retryWrites=true&w=majority")
          client.db("aste").collection("aste").updateOne({_id:new ObjectId(info.itemid)},{$push:{images:file}})
        });
      })
    }).finally(()=>{
      res.send("ok")
    }).catch(error => {
      res.status(203).send(error)
    })
  }else{
    res.status(203).send("Hai già aggiunto queste immagini")
  }
})
//mostra foto profilo
app.get('/mostraFoto/:foldername/:filename',function (req, res) {
  res.sendFile("/uploads/"+req.params.foldername+"/"+req.params.filename,{ root: __dirname })
})


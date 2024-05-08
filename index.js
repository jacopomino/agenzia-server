import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { MongoClient,ObjectId } from "mongodb"
import fs from 'fs'
import path from "path"
import pdftoimg from "pdf-img-convert"
import { fileURLToPath } from "url"
import fileupload from "express-fileupload"
import { uploadFile } from "@uploadcare/upload-client"
import {deleteFile,UploadcareSimpleAuthSchema} from '@uploadcare/rest-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT|| 3001;
const app=express()
app.use(cors())
app.use(fileupload());
app.use(bodyParser.urlencoded({extended:true}))
app.listen(PORT,()=>{
    console.log("run");
})
const client=new MongoClient("mongodb://apo:jac2001min@cluster0-shard-00-00.pdunp.mongodb.net:27017,cluster0-shard-00-01.pdunp.mongodb.net:27017,cluster0-shard-00-02.pdunp.mongodb.net:27017/?ssl=true&replicaSet=atlas-me2tz8-shard-0&authSource=admin&retryWrites=true&w=majority")
app.get("/aste", async (req,res)=>{
  client.db("aste").collection("aste").find({controllate:true,inserite:true}).toArray().then(e=>res.send(e))
})
app.get("/gestionale", async (req,res)=>{
  client.db("aste").collection("aste").find({controllate:false,inserite:false}).toArray().then(e=>res.send(e))
})
app.get("/gestionale-attesa", async (req,res)=>{
  client.db("aste").collection("aste").find({controllate:true,inserite:false}).toArray().then(e=>res.send(e))
})
app.delete("/cancellaTutte-asteNuove", async (req,res)=>{
  client.db("aste").collection("aste").deleteMany({controllate:false,inserite:false}).then(e=>res.send(e))
})
app.put("/sendIdealista", async (req,res)=>{
  let info=req.body
  client.db("aste").collection("aste").find({_id:new ObjectId(info.id)}).toArray().then(result=>{
    if(result){
      result[0].commento=info.commento
      result[0].info['data di vendita']=info.dataA
      result[0].info["prezzo base d'asta "]=info.prezzoB
      result[0].info['offerta minima']=info.offertaM
      result[0].info.tribunale=info.tribunale
      result[0].altro.via=info.via
      result[0].altro.altro["superficie"]=info.superficie
      result[0].altro.altro["vani"]=info.locali
      result[0].controllate=true
      client.db("aste").collection("aste").replaceOne({_id:new ObjectId(info.id)},result[0]).then(e=>{
        if(e){
          res.send("ok")
        }else{
          res.status(203).send("ok")
        }
      })
    }
    /*if (err) throw err;
    client.db("aste").collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{commento:info.commento}}).then((err,result)=>{
      if (err) throw err;
    });
    result[0].info['Data di vendita']=info.dataA
    result[0].info["Prezzo base d'asta "]=info.prezzoB
    result[0].info['Offerta minima']=info.offertaM
    result[0].info.Tribunale=info.tribunale
    result[0].altro.via=info.via
    result[0].altro.altro.Superficie=info.superficie
    result[0].altro.altro.Vani=info.locali
    client.db("aste").collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{info:result[0].info}}).then((err,result)=>{
      if (err) throw err;
    });
    client.db("aste").collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{altro:result[0].altro}}).then((err,result)=>{
      if (err) throw err;
    });
    client.db("aste").collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{comune:info.comune}}).then((err,result)=>{
      if (err) throw err;
    });
  });
  client.db("aste").collection("aste").updateOne({_id:new ObjectId(info.id)},{$set:{controllate:true}}).then((err,result)=>{
    if (err) throw err;
  });
  res.send("ok")*/
  })
})
app.delete("/cancella-asta", async (req,res)=>{
  let info=req.body
  client.db("aste").collection("aste").deleteOne({_id:new ObjectId(info.itemid)}).then(e=>{
    if(e){
      res.send("ok")
    }else{
        res.status(203).send("Something went wrong, try again!")
    }
  })
})
app.put('/profile/:id',async function(req, res) {
  let info=req.body
  const filename="img-"
  await pdftoimg.convert(info.url).then(function(outputImages) {
    for(let i=0;i<outputImages.length;i++){
      const buffer=new Buffer.from(outputImages[i]);
      const result=uploadFile(buffer,{
        publicKey:'8cff886cb01a8f787891', 
        store:0,
        fileName:filename+i+"-"+info.itemid
      }).then(e=>{
        if(e){
          client.db("aste").collection("aste").updateOne({_id:new ObjectId(info.itemid)},{$push:{images:"https://ucarecdn.com/"+e.uuid+"/-/resize/1200x/-/quality/smart/-/format/auto/"+filename+i+"-"+info.itemid}})
        }else{
            res.status(203).send("Something went wrong, try again!")
        }
      })
    }
  }).then(()=>res.send("ok"))
})
//mostra foto profilo
app.get('/mostraFoto/:foldername/:filename',function (req, res) {
  res.sendFile("/uploads/"+req.params.foldername+"/"+req.params.filename,{ root: __dirname })
})
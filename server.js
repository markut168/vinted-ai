import 'dotenv/config';import express from 'express';import multer from 'multer';import OpenAI from 'openai';
const app=express();const upload=multer({storage:multer.memoryStorage(),limits:{files:10,fileSize:8*1024*1024}});const ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});app.use(express.static('.'));
app.post('/api/listing',upload.array('images',10),async(req,res)=>{try{
const {brand='',size='',condition='',price='',extra=''}=req.body;
const content=[{type:'input_text',text:`Sei Vinted AI, specializzato in annunci di seconda mano italiani. Analizza tutte le foto. Crea un annuncio convincente ma rigorosamente onesto: NON inventare marca, modello, materiale, difetti o caratteristiche non visibili/provided. Dati utente: marca=${brand}; taglia=${size}; condizioni=${condition}; prezzo desiderato=${price}; note=${extra}. Rispondi SOLO con JSON: {"title":"...","description":"...","category":"...","hashtags":["#..."],"suggested_price":0}. Il titolo deve essere breve e ricercabile. La descrizione deve sembrare scritta da una persona, con stato, caratteristiche visibili e trasparenza sui difetti. Prezzo come numero in euro.`}];
for(const f of req.files||[])content.push({type:'input_image',image_url:`data:${f.mimetype};base64,${f.buffer.toString('base64')}`});
const r=await ai.responses.create({model:'gpt-5.6-luna',input:[{role:'user',content}]});
let t=r.output_text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,'');res.json(JSON.parse(t));
}catch(e){console.error(e);res.status(500).json({error:'Generazione non riuscita. Controlla OPENAI_API_KEY e riprova.'})}});
app.listen(process.env.PORT||3000,()=>console.log('Vinted AI Pro attivo'));
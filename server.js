import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 8 * 1024 * 1024 }
});

const ai = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HF_TOKEN
});

app.use(express.static('.'));

app.post('/api/listing', upload.array('images', 10), async (req, res) => {
  try {
    const {
      brand = '',
      size = '',
      condition = '',
      price = '',
      extra = ''
    } = req.body;

    const prompt = `Sei Vinted AI, specializzato in annunci di seconda mano italiani.
Analizza tutte le foto.

Crea un annuncio convincente ma rigorosamente onesto.
NON inventare marca, modello, materiale, difetti o caratteristiche non visibili.

Dati utente:
marca=${brand}
taglia=${size}
condizioni=${condition}
prezzo desiderato=${price}
note=${extra}

Rispondi SOLO con JSON:
{
  "title": "...",
  "description": "...",
  "category": "...",
  "hashtags": ["#..."],
  "suggested_price": 0
}

Il titolo deve essere breve e ricercabile.
La descrizione deve sembrare scritta da una persona.
Il prezzo deve essere un numero in euro.`;

    const content = [
      {
        type: 'text',
        text: prompt
      }
    ];

    for (const f of req.files || []) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`
        }
      });
    }

    const r = await ai.chat.completions.create({
      model: 'Qwen/Qwen2.5-VL-3B-Instruct',
      messages: [
        {
          role: 'user',
          content
        }
      ],
      max_tokens: 1000
    });

    let t = r.choices[0].message.content.trim();

    t = t
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '');

    res.json(JSON.parse(t));

  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: 'Generazione non riuscita.'
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Vinted AI Pro attivo');
});

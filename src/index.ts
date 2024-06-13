import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { client } from '../db';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/try', async (c) => {

  try {

    const loader = new TextLoader("/home/siddhant/dev/ByadhiSlayer/test.txt");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      separators: ['.', '।', '!', '?', '॥', '\n', '\r\n', '।।', '॥॥', '॥।', '।॥'],
      chunkOverlap: 15
    })

    const embeddings = new OllamaEmbeddings({
      model: "dolphin-phi",
      baseUrl: "http://localhost:11434",
      maxRetries: 1
    });

    const output = await splitter.createDocuments([docs[0].pageContent], [docs[0].metadata])
    //     const output = await splitter.createDocuments([`Once upon a time, in the sprawling kingdom of Valoria, nestled between verdant forests and towering mountains, there existed a village known as Eirenthia. Eirenthia was a place where magic thrived, interwoven into the fabric of daily life. The villagers were skilled in ancient arts, from spell-weaving to potion-brewing, and lived in harmony with the mystical creatures that roamed the land.

    // In this village lived a young girl named Elara, known for her curiosity and an insatiable desire to explore the world beyond Eirenthia's borders. Elara's parents, both respected wizards, had instilled in her a deep love for knowledge and an appreciation for the mysteries of their magical heritage. Her father, Master Arion, was a wise and gentle man who specialized in healing magic, while her mother, Lady Seraphine, was a formidable enchantress known for her powerful protection spells.`])

    console.log(output);

    await SupabaseVectorStore.fromDocuments(
      output,
      embeddings,
      {
        client,
        tableName: "documents"
      }
    )

    return c.json({
      output: 'Hello'
    })

  } catch (error: any) {
    console.log(error);
    return c.json({ error: error.message })
  }

})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

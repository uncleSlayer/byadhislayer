import { serve } from '@hono/node-server'
import { Hono } from 'hono'
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

    const loader = new PDFLoader("/home/siddhant/dev/ByadhiSlayer/src/sapiens.pdf");
    const docs = await loader.load()

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      separators: ['.', '।', '!', '?', '॥', '\n', '\r\n', '।।', '॥॥', '॥।', '।॥'],
      chunkOverlap: 150
    })

    const embeddings = new OllamaEmbeddings({
      model: "gemma:2b",
      baseUrl: "http://localhost:11434",
    });

    const JSONifiedOutput = [JSON.stringify(docs)]
    const output = await splitter.createDocuments(JSONifiedOutput)

    console.log(output);
    
    // const documentEmbeddings = await embeddings.embedDocuments(JSONifiedOutput);

    // await SupabaseVectorStore.fromTexts(
    //   output,
    //   {},
    //   new OllamaEmbeddings(),
    //   {
    //     client: client,
    //     tableName: "documents",
    //   })

    // console.log('ahead');

    return c.json({
      output
    })

  } catch (error: any) {
    return c.json({ error: error.message })
  }

})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

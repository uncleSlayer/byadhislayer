import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { client } from '../db';

import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';

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

    // const output = await splitter.createDocuments([docs[0].pageContent], [docs[0].metadata])
    const output = await splitter.createDocuments([`Once upon a time, in the sprawling kingdom of Valoria, nestled between verdant forests and towering mountains, there existed a village known as Eirenthia. Eirenthia was a place where magic thrived, interwoven into the fabric of daily life. The villagers were skilled in ancient arts, from spell-weaving to potion-brewing, and lived in harmony with the mystical creatures that roamed the land.

In this village lived a young girl named Elara, known for her curiosity and an insatiable desire to explore the world beyond Eirenthia's borders. Elara's parents, both respected wizards, had instilled in her a deep love for knowledge and an appreciation for the mysteries of their magical heritage. Her father, Master Arion, was a wise and gentle man who specialized in healing magic, while her mother, Lady Seraphine, was a formidable enchantress known for her powerful protection spells.

One fateful day, as Elara wandered through the ancient woods on the outskirts of Eirenthia, she stumbled upon a hidden grove. At its center stood a magnificent tree, its branches reaching skyward like a colossal guardian. The tree's bark shimmered with a silvery hue, and its leaves glowed with an ethereal light. Entranced by its beauty, Elara approached the tree and discovered an intricately carved doorway at its base.

With a mixture of trepidation and excitement, Elara pushed the door open and stepped inside. She found herself in a cavernous chamber, where a luminous crystal pulsed with an otherworldly energy at the center. As she drew closer, a voice echoed in her mind, revealing the crystal's ancient name: the Heart of Valoria. It was a relic of immense power, said to be the source of the kingdom's magic.

The voice belonged to an ancient spirit, Aeloria, the guardian of the Heart. Aeloria revealed that the balance of magic in Valoria was in jeopardy. Dark forces, long thought to be vanquished, were stirring once more, threatening to plunge the kingdom into chaos. The Heart of Valoria was losing its strength, and only a true guardian could restore its power.

Elara, feeling a deep connection to the crystal, knew she had to help. Aeloria told her that to restore the Heart, she needed to find three legendary artifacts hidden across the kingdom: the Flame of Dawn, the Tears of the Moon, and the Stone of Eternity. Each artifact was protected by ancient guardians and powerful enchantments.

Determined to save her home, Elara embarked on her quest. Her first destination was the Ember Caves, where the Flame of Dawn was said to reside. The journey was perilous, with treacherous paths and fierce creatures guarding the caves. But Elara's bravery and quick thinking, combined with the magical training from her parents, helped her navigate the dangers.

Deep within the Ember Caves, Elara encountered a formidable fire dragon. The dragon, Drakonis, was the guardian of the Flame of Dawn. To earn the dragon's trust, Elara had to prove her worthiness through a trial of courage and wisdom. She succeeded, and Drakonis bestowed upon her the Flame of Dawn, a burning ember encased in a crystal orb.

With the first artifact secured, Elara set off for the Silver Lake, where the Tears of the Moon were hidden. The lake was a serene and mystical place, its waters reflecting the night sky even in daylight. The guardian of the lake was a gentle yet powerful water nymph named Selene. To gain the Tears of the Moon, Elara had to complete a series of riddles and tasks that tested her compassion and understanding of nature's balance.

Elara's kindness and respect for the natural world impressed Selene, who granted her the Tears of the Moon, a vial of shimmering liquid that glowed with the light of a thousand stars. With two artifacts in hand, Elara's final challenge lay in the Shadow Mountains, home to the Stone of Eternity.

The Shadow Mountains were a place of dark magic and ancient secrets. Elara's journey through the mountains was fraught with illusions and traps set by the mountains' guardian, a mysterious and elusive sorcerer named Thalor. To defeat Thalor, Elara had to confront her deepest fears and doubts. Through inner strength and the support of the friends she had made along her journey, Elara triumphed and claimed the Stone of Eternity, a crystal that radiated an aura of timeless power.

With all three artifacts, Elara returned to the Heart of Valoria. As she placed the artifacts around the crystal, Aeloria appeared, guiding her through the ritual to restore the Heart's power. A brilliant light enveloped the chamber, and the magic of Valoria surged back to life, stronger than ever.

Elara's bravery and determination had saved the kingdom. She was celebrated as a hero, but she knew her journey was only the beginning. With the Heart of Valoria restored, new adventures awaited, and Elara was ready to face whatever challenges lay ahead.

The kingdom of Valoria thrived once more, a beacon of magic and harmony, thanks to the courage and heart of a young girl from the village of Eirenthia. And so, Elara's name became legend, a story told for generations to inspire hope and courage in the hearts of all who heard it.`])

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

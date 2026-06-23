const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')
require('dotenv').config()

console.log('当前KEY:', process.env.DEEPSEEK_API_KEY)

const app = express()

app.use(cors())
app.use(express.json())

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
})

app.get('/', (req, res) => {
  res.send('jcAI服务器启动成功')
})

app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({
        message: '缺少prompt'
      })
    }

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是jcAI，一个高级美业品牌设计师，擅长护肤品文案、包装设计理念、朋友圈文案和直播话术。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })

    res.json({
      content: completion.choices[0].message.content
    })

  } catch (error) {

    console.log('====================')
    console.log('DeepSeek错误')
    console.log('====================')

    console.log(error)

    res.status(500).json({
      message: 'AI生成失败',
      error: error.message
    })
  }
})

app.listen(3000, () => {
  console.log('jcAI DeepSeek 后端启动成功：http://localhost:3000')
})
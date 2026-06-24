const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
})

app.get('/', (req, res) => {
  res.send('jcAI服务器运行成功')
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
      temperature: 0.8
    })

    res.json({
      content: completion.choices[0].message.content
    })
  } catch (error) {
    console.error('DeepSeek错误：', error.message)

    res.status(500).json({
      message: 'AI生成失败',
      error: error.message
    })
  }
})

app.post('/api/skin-analyze', async (req, res) => {
  try {
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({
        message: '缺少图片链接'
      })
    }

    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai-large',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `你是jcAI肌肤顾问。请根据图片进行非医疗性质的肌肤状态分析。

请输出：
1. 肌肤整体状态
2. 缺水情况
3. 油脂情况
4. 毛孔情况
5. 暗沉情况
6. 泛红/敏感倾向
7. 痘痘/闭口倾向
8. 护肤建议
9. 适合的产品方向

注意：
不要诊断疾病。
不要使用“治疗、治愈、医学诊断”等表述。
只做护肤建议。`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    res.json({
      content: content || '暂时无法分析图片，请换一张清晰正脸照片。'
    })
  } catch (error) {
    console.error('测肤分析错误：', error.message)

    res.status(500).json({
      message: '测肤分析失败',
      error: error.message
    })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`jcAI后端启动成功: ${PORT}`)
})

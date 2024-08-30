import * as core from '@actions/core'
import axios from 'axios'
import Base64 from 'js-base64'

enum MessageType {
  TEXT = 'text',
  MARKDOWN = 'markdown',
  IMAGE = 'image',
  NEWS = 'news',
  TEMPLATE_CARD = 'template_card'
}
type MessageTypeValue =
  | MessageType.TEXT
  | MessageType.IMAGE
  | MessageType.MARKDOWN
  | MessageType.NEWS
  | MessageType.TEMPLATE_CARD

const WeComBotHookBaseUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send'

// 验证bot-key是否有效，仅检查非空
function validateBotKey(botKey: string): boolean {
  return botKey.trim().length > 0
}

// 发送消息到企业微信机器人的函数，支持多种消息类型
async function sendMessageToWeComBot(
  botKey: string,
  type: MessageTypeValue,
  message: string
): Promise<void> {
  const url = `${WeComBotHookBaseUrl}?key=${encodeURIComponent(botKey)}`
  let payload

  switch (type) {
    case MessageType.TEXT:
      payload = {msgtype: 'text', text: {content: message}}
      break
    case MessageType.MARKDOWN:
      payload = {msgtype: 'markdown', markdown: {content: message}}
      core.debug(`payload: ${payload}`)
      break
    case MessageType.IMAGE:
      // message should be base64 encoded image
      payload = {
        msgtype: 'image',
        image: {base64: message, md5: Base64.decode(message)}
      } // 需要图片的base64和md5值
      break
    case MessageType.NEWS:
      payload = {msgtype: 'news', news: {articles: JSON.parse(message)}} // https://developer.work.weixin.qq.com/document/path/91770#图文类型
      break
    case MessageType.TEMPLATE_CARD:
      payload = {msgtype: 'template_card', template_card: JSON.parse(message)} // https://developer.work.weixin.qq.com/document/path/91770#图文展示模版卡片
      break
    default:
      core.error('Unsupported message type')
  }
  core.info(`${MessageType.MARKDOWN} ${type} ${payload}`)

  try {
    await axios.post(url, payload)
    core.info('Message sent to WeCom Bot successfully.')
  } catch (error: any) {
    core.error(`Failed to send message to WeCom Bot: ${error.message}`)
    core.setFailed(error)
    throw new Error('Failed to send message to WeCom Bot.')
  }
}

async function run() {
  const wxWorkBotKey = core.getInput('key', {required: true})
  if (!validateBotKey(wxWorkBotKey)) {
    core.setFailed('Invalid or missing wecom bot hook key.')
    return
  }

  // 获取消息内容和消息类型
  const msgContent = core.getInput('content', {required: true})
  const msgType = core.getInput('type', {
    required: true
  }) as MessageTypeValue

  // 验证消息类型
  if (
    ![
      MessageType.TEXT,
      MessageType.IMAGE,
      MessageType.MARKDOWN,
      MessageType.NEWS,
      MessageType.TEMPLATE_CARD
    ].includes(msgType)
  ) {
    core.setFailed(
      'Invalid message type. Allowed types are "text", "markdown", "image", and "news".'
    )
    return
  }

  // 发送消息
  await sendMessageToWeComBot(wxWorkBotKey, msgType, msgContent)
}

run()

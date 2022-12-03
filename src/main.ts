import * as core from '@actions/core'
import * as path from 'path'
import TelegramBot, {
  InputMedia,
  InputMediaType,
  ParseMode
} from 'node-telegram-bot-api'
import {imageSize} from 'image-size'

try {
  const chatId = core.getInput('chatId')
  const botToken = core.getInput('botToken')
  const content = core.getInput('content')
  const medias = core.getInput('medias')
  const type = core.getInput('type') as InputMediaType
  let format = core.getInput('format').trim() as ParseMode
  format = format?.length ? format : 'MarkdownV2'
  const disableWebPagePreview: boolean =
    core.getInput('disableWebPagePreview') === 'true' || false
  const disableNotification: boolean =
    core.getInput('disableNotification') === 'true' || false

  const bot = new TelegramBot(botToken)
  core.info(`Input: \n${content}`)
  if (medias) {
    const mediaArr = medias.split('\n')
    const data: InputMedia[] = []
    for (const media of mediaArr) {
      const dimension = imageSize(media)
      core.info(`Media: ${media}`)
      core.info(`Dimension: ${dimension.width} x ${dimension.height}`)
      data.push({
        type,
        media: path.resolve(media),
        parse_mode: format
      })
    }
    data[data.length - 1].caption = content
    let lastDate
    for (let i = 0; i < data.length; i += 10) {
      const chunk = data.slice(i, i + 10)
      while (
        lastDate &&
        lastDate.getTime() + 60 * 1e3 > new Date().getTime()
      ) {}
      await bot.sendMediaGroup(chatId, chunk, {
        disable_notification: disableNotification
      })
      lastDate = new Date()
      core.info(`[${new Date()}] Try to send ${chunk.length} photos`)
      if (i < data.length) {
        core.info(`Have to split to multiple chunks. Current: ${i}-${i + 9}`)
      }
    }
  } else if (content)
    await bot.sendMessage(chatId, content, {
      parse_mode: format,
      disable_notification: disableNotification,
      disable_web_page_preview: disableWebPagePreview
    })
} catch (error) {
  core.setFailed(error.message)
}

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
  core.info(`输入信息：\n${content}`)
  if (medias) {
    const mediaArr = medias.split('\n')
    const data: InputMedia[] = []
    for (const media of mediaArr) {
      const dimension = imageSize(media)
      core.info(`输入图片：${media}`)
      core.info(`图片尺寸：${dimension.width} x ${dimension.height}`)
      data.push({
        type,
        media: path.resolve(media),
        parse_mode: format
      })
    }
    data[0].caption = content
    await bot.sendMediaGroup(chatId, data, {
      disable_notification: disableNotification
    })
  } else if (content)
    await bot.sendMessage(chatId, content, {
      parse_mode: format,
      disable_notification: disableNotification,
      disable_web_page_preview: disableWebPagePreview
    })
} catch (error) {
  core.setFailed(error.message)
}

import * as core from '@actions/core'
import * as path from 'path'
import TelegramBot, {InputMediaPhoto, ParseMode} from 'node-telegram-bot-api'
import {imageSize} from 'image-size'

async function run(): Promise<void> {
  try {
    const chatId: string = core.getInput('chatId')
    const botToken: string = core.getInput('botToken')
    const content: string = core.getInput('content')
    const photos: string = core.getInput('photos')
    const format: ParseMode =
      (core.getInput('format') as ParseMode) || 'MarkdownV2'
    const disableWebPagePreview: boolean =
      core.getInput('disableWebPagePreview') === 'true' || false
    const disableNotification: boolean =
      core.getInput('disableNotification') === 'true' || false

    const bot = new TelegramBot(botToken)
    core.info(`输入信息：\n${content}`)
    if (photos) {
      const photoArr = photos.split('⭐')
      const data: InputMediaPhoto[] = []
      for (const photo of photoArr) {
        const dimension = imageSize(photo)
        core.info(`输入图片：${photo}`)
        core.info(`图片尺寸：${dimension.width} x ${dimension.height}`)
        data.push({
          type: 'photo',
          media: path.resolve(photo),
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
}

run()

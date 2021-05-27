import * as core from '@actions/core'
import TelegramBot, {InputMediaPhoto, ParseMode} from 'node-telegram-bot-api'

async function run(): Promise<void> {
  try {
    const chatId: string = core.getInput('chatId')
    const botToken: string = core.getInput('botToken')
    const content: string = core.getInput('content')
    const photoUrls: string = core.getInput('photoUrls')
    const format: ParseMode =
      (core.getInput('format') as ParseMode) || 'Markdown'
    const disableWebPagePreview: boolean =
      core.getInput('disableWebPagePreview') === 'true' || false
    const disableNotification: boolean =
      core.getInput('disableNotification') === 'true' || false

    const bot = new TelegramBot(botToken)
    if (photoUrls) {
      bot.sendMediaGroup(
        chatId,
        photoUrls.split('\n').map(
          (it, index) =>
            ({
              type: 'photo',
              media: it,
              caption: index === 0 ? content : undefined,
              parse_mode: format
            } as InputMediaPhoto)
        ),
        {
          disable_notification: disableNotification
        }
      )
    } else if (content)
      bot.sendMessage(chatId, content, {
        parse_mode: format,
        disable_notification: disableNotification,
        disable_web_page_preview: disableWebPagePreview
      })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

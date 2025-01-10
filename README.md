# Wecom Bot Notify

`wecom-bot-notify` is a simple tool to send notifications to Wecom Bot by web hook.

## Usage

```yaml
name: 'Notify'
on:
  push:
    branches:
      - main

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: amazing-actions/wecom-bot-notify@main
        with:
          type: markdown # text, markdown, image, news, template_card
          content: '## Test' # see https://developer.work.weixin.qq.com/document/path/91770
          key: ${{ secrets.WECOM_BOT_KEY }} # Your key of wecom bot hook
```

> [!TIP]
> If you want to send message to multiple wecom bot, you can use `,` to split the bot keys.

# monthly-memos
monthly Noteに時刻付きでメモを書き込むためのプラグインです。  
自分用に作成したので設定を変更する機能はありません。  
Monthly Noteは以下の形式で作成されている必要があります。  
```
場所：
DailyNote/YYYY/YYYY-MM.md

内容：
# YYYY-MM-DD  
# YYYY-MM-DD  
…以下繰り返し
```
![screenShot](https://github.com/nujisato/Obsidian-monthly-memos/blob/main/monthly-memos-sample.png?raw=true)

## 機能
入力：テキストを入力して「Save」を押下すると、`YYYY/YYYY-MM.md`内の`#YYYY-MM-DD`以下に時刻付きでメモを書き込みます。  
※正確には「次の日見出しの上」に挿入  
カレンダー：今日の日付の位置にジャンプ エディタの設定をデフォルト：編集ビューにしておかないと正常に動作しない  
メニュー：今月のノートの中から`#予定`タグがついている行を抜き出して表示  

# インストール
1.monthly-memosをダウンロードし、Pluginフォルダに直接入れます。  
2.Obsidianでプラグインを有効化します。  
3.DailyNote/YYYYフォルダを作成する ※これがないと何も書き込みません
  
事前にTemplaterで日付を入れたノートを用意する想定ですが、フォルダさえあれば一応
- YYYY-MM.mdファイルを作る
- 今日の日付のH1見出しを作る
の動作は自動で行われます。

## 自動化
1.コアプラグインのDailyNoteで以下の設定をする  
- 日付の書式 `YYYY/YYYY-MM`
- 新規ファイルの場所 `DailyNote`
- テンプレートファイルの場所 `同梱のmonthlyノート.md`

2.コミュニティプラグインのTemplaterを有効化  
3.Trigger Templater on new file creation をオンにする  
これで「今日のデイリーノートを開く」ボタンから自動でテンプレートのノートが作成されるようになります。  
  
DailyNoteと共存させたい場合はPeriodic Notesプラグインとか使えばいいんじゃないかな…

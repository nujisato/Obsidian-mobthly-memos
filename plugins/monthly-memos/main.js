var obsidian = require("obsidian");

class DashboardPlugin extends obsidian.Plugin {
  //プラグインをロード
  async onload() {
    console.log("Dashboard Plugin loaded!");

    // リボンアイコンを追加
    const ribbonIconEl = this.addRibbonIcon(
      'paw-print', // Obsidianのアイコンセットから選択
      'Monthly-memos',
      (evt) => {
        this.activateView(); //リボンアイコンが押されたらダッシュボードをアクティブにする
      }
    );

    this.registerView(// ダッシュボードビューを登録
      "dashboard-view",
      (leaf) => new DashboardView(leaf, this)
    );
    this.activateView();// プラグイン起動時にダッシュボードを表示
  }

  async activateView() {
    const leaves = this.app.workspace.getLeavesOfType("dashboard-view");
    if (leaves.length === 0) {
      await this.app.workspace.getRightLeaf(false).setViewState({
        type: "dashboard-view",
      });
    }
    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType("dashboard-view")[0]
    );
  }
  //ロードできなかった場合
  onunload() {
    console.log("Monthly-memos Plugin unloaded");
    this.app.workspace.detachLeavesOfType("dashboard-view");
  }
}
class DashboardView extends obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return "dashboard-view";
  }
  getDisplayText() {
    return "Monthly-memos";
  }
  // タブアイコンを設定
  getIcon() {
    return "paw-print"; 
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.classList.add("nuji-dashboard");

    // ハンバーガーメニューボタン
    const menuButton = document.createElement("button");
    menuButton.className = "nonstyle_btn";
    const menuicon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
    </svg>`
    menuButton.innerHTML = menuicon;
    //menuButton.textContent = "M"; // ハンバーガーアイコン
    menuButton.onclick = () => {
      this.toggleMenu(true);
    };
    container.appendChild(menuButton);

    // 今日の日付を取得
    const today_link = moment().format("YYYY-MM-DD");
    const year = moment().format("YYYY");
    const month = moment().format("YYYY-MM");

    // デイリーノートのパスを作成
    const filePath = `DailyNote/${year}/${month}.md`;

    // calendarボタン
    const button = document.createElement("button");
    button.className = "nonstyle_btn";
    button.title = "Jump to Today";
    // カレンダーアイコンをSVG形式でボタンに追加
    const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar">
      <path d="M8 2v4"></path>
      <path d="M16 2v4"></path>
      <rect x="3" y="4" width="18" height="18" rx="2"></rect>
      <path d="M3 10h18"></path>
    </svg>`;

    // ボタンにアイコンを追加
    button.innerHTML = calendarIcon;

    // ボタンクリック時の処理
    button.onclick = async () => {
      // ファイルが存在するか確認
      if (await app.vault.adapter.exists(filePath)) {
        // ファイルが存在する場合
        const fileContent = await app.vault.adapter.read(filePath);
        if (!fileContent.includes(`# ${today_link}`)) {
          // 今日の日付がファイルにない場合は追記
          await app.vault.adapter.write(filePath, `${fileContent}\n# ${today_link}`);
        }
        // 今日の日付の位置にジャンプ
        app.workspace.openLinkText(filePath, "/", false).then(() => {
          setTimeout(() => {
            const activeLeaf = app.workspace.activeLeaf;
            if (activeLeaf) {
              const editor = activeLeaf.view.editor;
              const lines = editor.getValue().split("\n");
              const lineNumber = lines.findIndex(line => line === `# ${today_link}`);
              if (lineNumber !== -1) {
                // カーソルを日付の位置に移動
                editor.setCursor({ line: lineNumber + 2, ch: 0 });
              
              }
            }
          }, 200);
        });
      } else {
        // ファイルが存在しない場合は作成
        const initialContent = `# ${today_link}\n\n`;
        await app.vault.create(filePath, initialContent);
        app.workspace.openLinkText(filePath, "/", false);
      }
    };

    // ボタンをページに追加
    container.appendChild(button);

    //今日の日付を表示
    const today = obsidian.moment();
    const weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
    const dateElement = document.createElement("div");
    dateElement.textContent = `${today.format("YYYY-MM-DD")} ${weekdays[today.day()]}`;
    dateElement.className = "db_today";

    container.appendChild(dateElement);

    // 投稿フォーム
    const inputSection = document.createElement("div");
    inputSection.className = "inputarea";
    const inputField = document.createElement("textarea");
    inputField.style.display = "inline-block";
    inputField.rows = 3;

    // 更新ボタン
    const updateButton = document.createElement("button");
    updateButton.className = "nonstyle_btn";
    updateButton.title = "reload";
    const updateIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 16h5v5"/>
    </svg>`;
    updateButton.innerHTML = updateIcon;
    updateButton.onclick = async () => {
      const today = obsidian.moment();
      await this.refreshTodayEntries(today);
      this.updateMenu(today);
    };

    //save
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.onclick = async () => {
      let content = inputField.value.trim();
      if (content) {
        content = content.replace(/\n/g,"\n\t"); 
        const today = obsidian.moment(); 
        await this.saveEntry(today, content);
        inputField.value = ""; 
        await this.refreshTodayEntries(today); 
        this.updateMenu(today);
      }
    };
    // Enter + Ctrl のショートカットを追加
    inputField.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        saveButton.onclick();
      }
    });
    inputSection.appendChild(inputField);
    inputSection.appendChild(updateButton);
    inputSection.appendChild(saveButton);
    container.appendChild(inputSection);

    //// 今日の投稿
    const entriesContainer = document.createElement("div");
    entriesContainer.id = "today-entries";
    container.appendChild(entriesContainer);
    await this.refreshTodayEntries(today);

    // メニューコンテナを作成（非表示）
    const menuContainer = document.createElement("div");
    menuContainer.id = "side-menu";
    menuContainer.innerHTML = `
    <button id="close-menu">×</button>
    <h2>〽️Status</h2>
    <div id="menu-content">Loading...</div>
    `;
    container.appendChild(menuContainer);
    this.menuContainer = menuContainer;
    // メニューを閉じるボタンの動作
    menuContainer.querySelector("#close-menu").onclick = () => {
    this.toggleMenu(false);
  }
    this.updateMenu(today);// メニューを更新
  }
  // メニューの開閉を切り替える
  toggleMenu(open) {
    if (open) {
      this.menuContainer.style.left = "0";
    } else {
      this.menuContainer.style.left = "-100%";
    }
  }

 // メニュー情報を更新
 async updateMenu(date) {
  const menuContent = this.menuContainer.querySelector("#menu-content");
  const entries = await this.getTodayEntries(date);
  const month = date.format("YYYY-MM");
  const year = date.format("YYYY");
  const filePath = `DailyNote/${year}/${month}.md`;

  // 1日の投稿数
  const dailyCount = entries.length;

  let fileContent;
  try {
    fileContent = await this.plugin.app.vault.adapter.read(filePath);
  } catch {
    menuContent.innerHTML = `<p>No notes found for this month.</p>`;
    return;
  }
  // タグ情報を収集
    const tagRegex = /#(\w+)/g;
    const tags = {};
    //let match;
    const lines = fileContent.split("\n");
    for (const line of lines) {
      let match;
      while ((match = tagRegex.exec(line)) !== null) {
        const tag = match[1];
        tags[tag] = (tags[tag] || 0) + 1;
      }
    }
    // #予定 タグを持つ投稿を検索し、H1見出しを取得
    const scheduledEntries = [];
    let currentHeading = null;

    for (const line of lines) {
      // H1見出しを更新
      const headingMatch = line.match(/^# (\d{4}-\d{2}-\d{2})/);
      if (headingMatch) {
        currentHeading = headingMatch[1];
      }

      // #予定 タグを含む行を検索
      if (line.includes("#予定") && currentHeading) {
        const content = line.replace("#予定", "").replace("-", "").trim(); // #予定を除去して内容を取得
        scheduledEntries.push(
          `<span class="scheduled-date">${currentHeading}</span> ${content}`
        );
      }
    }

  // メニューコンテンツを生成
  menuContent.innerHTML = `
    <div class="menu_contents">
    <div class="count">
      <span>Today<br></span>
      <p>${dailyCount}</p>
    </div>
    <h2>Schedule</h2>
      <ul>
        ${
          scheduledEntries.length > 0
            ? scheduledEntries.map((entry) => `<li>${entry}</li>`).join("")
            : `<li><span class="tag">#予定</span>はありません。</li>`
        }
      </ul>
  `;
}

  //投稿の表示を整形
  async refreshTodayEntries(date) {
    const entriesContainer = this.containerEl.querySelector("#today-entries");
    entriesContainer.empty();
    const entries = await this.getTodayEntries(date);
    if (entries.length > 0) {
      entries.forEach((entry) => {
                const [time, ...contentParts] = entry.split(" ");
        const content = contentParts.join(" ");
        // タグを囲む
        //content = content.replace(/#(\w+)/g, '<span class="tag">#$1</span>');

        const entryWrapper = document.createElement("div");
        entryWrapper.classList.add("entry-wrapper");

        const timeElement = document.createElement("div");
        timeElement.classList.add("entry-time");

        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("fill", "none");
        icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        icon.innerHTML = `
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.8284 6.75736C12.3807 6.75736 12.8284 7.20507 12.8284 7.75736V12.7245L16.3553 14.0653C16.8716 14.2615 17.131 14.8391 16.9347 15.3553C16.7385 15.8716 16.1609 16.131 15.6447 15.9347L11.4731 14.349C11.085 14.2014 10.8284 13.8294 10.8284 13.4142V7.75736C10.8284 7.20507 11.2761 6.75736 11.8284 6.75736Z" />
        `;

        const timeText = document.createElement("span");
        timeText.textContent = time;
        timeElement.appendChild(icon);
        timeElement.appendChild(timeText);

        const contentElement = document.createElement("div");
        contentElement.classList.add("entry-content");

        // ObsidianのMarkdownRendererを利用してMarkdownをHTMLに変換
          obsidian.MarkdownRenderer.renderMarkdown(
          content, // Markdown文字列
          contentElement, // レンダリング先のHTML要素
          "", // ソースファイルパス（今回は空でOK）
          this // 現在のプラグインのコンテキスト
        );
        entryWrapper.appendChild(timeElement);
        entryWrapper.appendChild(contentElement);
        entriesContainer.appendChild(entryWrapper);
      });
    } else {
      const contentElement = document.createElement("div");
      entriesContainer.textContent = "今日の投稿はありません。";
    }
  }

 // 投稿を取得
async getTodayEntries(date) {
  const year = date.format("YYYY");
  const monthFileName = date.format("YYYY-MM") + ".md";
  const dayHeader = date.format("YYYY-MM-DD");
  const filePath = `DailyNote/${year}/${monthFileName}`;

  const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
  if (!file) return [];

  const fileContent = await this.plugin.app.vault.read(file);

  // "# YYYY-MM-DD" の見出しを基準にセクションを抽出
  const dayHeaderRegex = new RegExp(`(^|\n)# ${dayHeader}(\n|$)`);

  const dayHeaderMatch = dayHeaderRegex.exec(fileContent);
  if (!dayHeaderMatch) return [];

  const start = dayHeaderMatch.index + dayHeaderMatch[0].length;
  const daySection = fileContent.slice(start).split(/\n# /)[0]; // 次の見出しまでの内容を取得

  // メモを1つのブロックとして取得
  const entries = [];
  let currentEntry = null;

  daySection.split("\n").forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("- ")) {
          const timeMatch = trimmedLine.match(/^- (\d{1,2}:\d{2}(?::\d{2})?) (.+)/);

          if (timeMatch) {
              // 現在のエントリを終了し、新しいエントリを開始
              if (currentEntry) {
                  entries.push(currentEntry.join(" <br> "));
              }
              currentEntry = [timeMatch[1] + " " + timeMatch[2]];
          }
      } else if (currentEntry && line.startsWith("\t")) {
          // 改行後のタブ付きテキストを現在のエントリに追加し、改行用の <br> を挿入
          currentEntry.push(trimmedLine);
      }
  });

  // 最後のエントリを追加
  if (currentEntry) {
      entries.push(currentEntry.join(" <br> "));
  }

  return entries.reverse(); // 新しい投稿が上になるように反転
}

  // Tweetをリスト形式で投稿
  async saveEntry(date, content) {
    const year = date.format("YYYY");
    const monthFileName = date.format("YYYY-MM") + ".md";
    const dayHeader = date.format("YYYY-MM-DD");
    const filePath = `DailyNote/${year}/${monthFileName}`;

    let file = this.plugin.app.vault.getAbstractFileByPath(filePath);
    if (!file) {
        // ファイルが存在しない場合は作成
        await this.plugin.app.vault.create(filePath, `# ${dayHeader}\n`);
        file = this.plugin.app.vault.getAbstractFileByPath(filePath);
        new obsidian.Notice(`${filePath}ノートを作成しました`);
    }

    const timeStamp = date.format("H:mm:ss");
    const entryLine = `- ${timeStamp} ${content}`;

    // ファイル内容を読み込む
    let fileContent = await this.plugin.app.vault.read(file);

    // 現在の H1 見出し (# YYYY-MM-DD) の存在を確認
    const dayHeaderRegex = new RegExp(`(^|\\n)# ${dayHeader}(\\n|$)`);
    const dayHeaderMatch = dayHeaderRegex.exec(fileContent);

    if (!dayHeaderMatch) {
        // H1 見出しが存在しない場合は挿入
        fileContent += `\n# ${dayHeader}\n`;
        new obsidian.Notice(`今日の見出しを作成しました。`);
    }

    // 現在の H1 見出しの次の H1 見出しの位置を探す
    const startPosition = dayHeaderMatch
        ? dayHeaderMatch.index + dayHeaderMatch[0].length
        : fileContent.length; // H1 見出しが追加された場合は末尾を基準にする

    const nextHeaderRegex = /\n# .+/g;
    const nextHeaderMatch = nextHeaderRegex.exec(fileContent.slice(startPosition));
    let updatedContent;
    if (nextHeaderMatch) {
        const nextHeaderPosition = startPosition + nextHeaderMatch.index;
        // 次の H1 見出しの上にエントリを追加
        updatedContent =
            fileContent.slice(0, nextHeaderPosition) +
            `\n${entryLine}` +
            fileContent.slice(nextHeaderPosition);
    } else {
        // 次の H1 見出しが存在しない場合は末尾に追加
        updatedContent = fileContent + `\n${entryLine}`;
  
    }

    // ファイルを更新
    await this.plugin.app.vault.modify(file, updatedContent);
  }

}

module.exports = DashboardPlugin;

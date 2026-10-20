// 設定是否使用遠端 GIF。 // GIF 使用模式
const USE_REMOTE_GIFS = false; // false 使用本機 GIF，true 使用遠端 GIF

// 設定六張本機 GIF 路徑。 // 本機 GIF 路徑
const GIF_PATHS = [ // 開始本機 GIF 陣列
  'assets/setup.gif', // setup 初始化主題 GIF
  'assets/draw.gif', // draw 動畫主題 GIF
  'assets/createCanvas.gif', // createCanvas 畫布主題 GIF
  'assets/background.gif', // background 背景主題 GIF
  'assets/fill.gif', // fill 填色主題 GIF
  'assets/stroke.gif' // stroke 線條主題 GIF
]; // 結束本機 GIF 陣列

// 設定六張遠端 GIF 網址。 // 遠端 GIF 網址
const REMOTE_GIF_URLS = [ // 開始遠端 GIF 陣列
  'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif', // setup 初始化主題 GIF
  'https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif', // draw 動畫主題 GIF
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // createCanvas 畫布主題 GIF
  'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif', // background 背景主題 GIF
  'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', // fill 填色主題 GIF
  'https://media.giphy.com/media/3o6Zt6D8N3P7q6G8aI/giphy.gif' // stroke 線條主題 GIF
]; // 結束遠端 GIF 陣列

// 設定六組配對資料。 // 建立題目資料
const pairs = [ // 開始配對資料
  { text: 'setup()', description: '初始化程式', color: '#ff7675' }, // 建立 setup 配對
  { text: 'draw()', description: '重複動畫', color: '#fdcb6e' }, // 建立 draw 配對
  { text: 'createCanvas()', description: '建立畫布', color: '#55efc4' }, // 建立 createCanvas 配對
  { text: 'background()', description: '設定背景', color: '#74b9ff' }, // 建立 background 配對
  { text: 'fill()', description: '設定填滿色', color: '#a29bfe' }, // 建立 fill 配對
  { text: 'stroke()', description: '設定線條色', color: '#fab1a0' } // 建立 stroke 配對
]; // 結束配對資料

// 儲存已載入的 GIF。 // 建立 GIF 陣列
let gifs = []; // 儲存 GIF 圖片物件

// 儲存 GIF 是否載入成功。 // 建立載入狀態陣列
let gifLoaded = []; // 儲存每張 GIF 狀態

// 儲存右側圖片卡片排列順序。 // 建立圖片順序陣列
let imageOrder = []; // 儲存圖片索引

// 儲存正確配對資料。 // 建立配對結果陣列
let matched = []; // 預設沒有配對

// 儲存正在拖曳的左側卡片。 // 建立拖曳索引
let dragging = -1; // -1 表示沒有拖曳

// 儲存拖曳座標。 // 建立拖曳座標
let dragX = 0; // 儲存拖曳 X 座標
let dragY = 0; // 儲存拖曳 Y 座標

// 記錄是否已經交卷。 // 建立交卷狀態
let submitted = false; // 預設尚未交卷

// 儲存彩帶資料。 // 建立彩帶陣列
let confetti = []; // 預設沒有彩帶

// 預先載入六張 GIF。 // 定義素材載入函式
function preload() { // 開始 preload 函式
  for (let i = 0; i < pairs.length; i += 1) { // 逐一處理六張 GIF
    const source = USE_REMOTE_GIFS ? REMOTE_GIF_URLS[i] : GIF_PATHS[i]; // 選擇 GIF 來源
    gifLoaded[i] = false; // 預設 GIF 尚未載入
    gifs[i] = loadImage(source, () => { // 載入 GIF 並設定成功回呼
      gifLoaded[i] = true; // 記錄 GIF 載入成功
    }, () => { // 設定 GIF 載入失敗回呼
      gifLoaded[i] = false; // 記錄 GIF 載入失敗
    }); // 結束 GIF 載入
  } // 結束 GIF 載入迴圈
} // 結束 preload 函式

// 建立畫布與初始化。 // 定義 setup 函式
function setup() { // 開始 setup 函式
  createCanvas(windowWidth, windowHeight); // 建立響應式畫布
  textAlign(CENTER, CENTER); // 設定文字置中
  textFont('Arial'); // 設定預設字型
  resetQuiz(); // 初始化測驗
} // 結束 setup 函式

// 每一幀繪圖。 // 定義 draw 函式
function draw() { // 開始 draw 函式
  background('#f4f7fb'); // 設定背景顏色
  drawTitle(); // 繪製標題
  drawCards(); // 繪製文字卡片與 GIF 卡片
  drawConnections(); // 繪製成功連線
  drawButtons(); // 繪製按鈕
  drawDraggingCard(); // 繪製拖曳中的卡片
  drawConfetti(); // 繪製彩帶
} // 結束 draw 函式

// 繪製標題。 // 定義標題函式
function drawTitle() { // 開始標題函式
  fill('#243b53'); // 設定標題顏色
  noStroke(); // 關閉邊框
  textSize(28); // 設定標題大小
  text('p5.js GIF 連連看測驗', width / 2, 32); // 顯示標題
  fill('#627d98'); // 設定說明文字顏色
  textSize(15); // 設定說明文字大小
  text('請將左側函式拖曳到右側相應的 GIF 主題卡片', width / 2, 67); // 顯示操作說明
} // 結束標題函式

// 計算左側卡片位置。 // 定義左側位置函式
function leftCard(i) { // 開始左側位置函式
  const w = min(width * 0.36, 310); // 設定左側卡片寬度
  const h = 58; // 設定左側卡片高度
  const x = width * 0.06; // 設定左側卡片 X 座標
  const y = 100 + i * 70; // 設定左側卡片 Y 座標
  return { x, y, w, h }; // 回傳左側卡片資料
} // 結束左側位置函式

// 計算右側卡片位置。 // 定義右側位置函式
function rightCard(position) { // 開始右側位置函式
  const w = min(width * 0.4, 360); // 設定右側卡片寬度
  const h = 58; // 設定右側卡片高度
  const x = width * 0.54; // 設定右側卡片 X 座標
  const y = 100 + position * 70; // 設定右側卡片 Y 座標
  return { x, y, w, h }; // 回傳右側卡片資料
} // 結束右側位置函式

// 繪製所有卡片。 // 定義卡片函式
function drawCards() { // 開始卡片函式
  for (let i = 0; i < pairs.length; i += 1) { // 逐一繪製左側卡片
    drawLeftCard(i); // 繪製左側文字卡片
  } // 結束左側卡片迴圈
  for (let position = 0; position < imageOrder.length; position += 1) { // 逐一繪製右側圖片卡片
    drawRightCard(position); // 繪製右側 GIF 卡片
  } // 結束右側卡片迴圈
} // 結束卡片函式

// 繪製左側文字卡片。 // 定義左側卡片函式
function drawLeftCard(i) { // 開始左側卡片函式
  const card = leftCard(i); // 取得左側卡片位置
  const done = matched.includes(i); // 判斷是否已經配對
  fill(done ? '#d8f3dc' : '#ffffff'); // 設定卡片背景
  stroke(done ? '#2d9d5c' : '#cbd5e1'); // 設定卡片邊框
  strokeWeight(2); // 設定邊框粗細
  rect(card.x, card.y, card.w, card.h, 10); // 繪製左側卡片
  noStroke(); // 關閉文字邊框
  fill(pairs[i].color); // 設定識別圓點顏色
  circle(card.x + 22, card.y + card.h / 2, 16); // 繪製識別圓點
  fill('#243b53'); // 設定文字顏色
  textSize(17); // 設定函式文字大小
  text(pairs[i].text, card.x + card.w / 2, card.y + 25); // 顯示函式文字
  fill('#627d98'); // 設定描述文字顏色
  textSize(13); // 設定描述文字大小
  text(pairs[i].description, card.x + card.w / 2, card.y + 44); // 顯示函式描述
} // 結束左側卡片函式

// 繪製右側 GIF 卡片。 // 定義右側卡片函式
function drawRightCard(position) { // 開始右側卡片函式
  const pairIndex = imageOrder[position]; // 取得圖片對應的配對索引
  const card = rightCard(position); // 取得右側卡片位置
  const done = matched.includes(pairIndex); // 判斷是否已經配對
  fill(done ? '#d8f3dc' : '#ffffff'); // 設定卡片背景
  stroke(done ? '#2d9d5c' : '#cbd5e1'); // 設定卡片邊框
  strokeWeight(2); // 設定邊框粗細
  rect(card.x, card.y, card.w, card.h, 10); // 繪製右側卡片
  drawGif(pairIndex, card); // 繪製真正的 GIF
  noStroke(); // 關閉文字邊框
  fill('#243b53'); // 設定文字顏色
  textSize(14); // 設定文字大小
  text(pairs[pairIndex].description, card.x + card.w * 0.74, card.y + card.h / 2); // 顯示主題描述
  if (done) { // 判斷是否需要勾選
    fill('#198754'); // 設定勾選圓形顏色
    circle(card.x + card.w - 18, card.y + 18, 22); // 繪製勾選圓形
    fill(255); // 設定勾選文字顏色
    textSize(15); // 設定勾選文字大小
    text('✓', card.x + card.w - 18, card.y + 18); // 繪製勾選符號
  } // 結束勾選判斷
} // 結束右側卡片函式

// 繪製真正的 GIF 圖片。 // 定義 GIF 繪製函式
function drawGif(pairIndex, card) { // 開始 GIF 繪製函式
  if (!gifLoaded[pairIndex]) { // 判斷 GIF 是否載入失敗
    fill('#ffe5e5'); // 設定錯誤卡片背景
    noStroke(); // 關閉錯誤卡片邊框
    rect(card.x + 8, card.y + 8, card.w * 0.45, card.h - 16, 6); // 繪製錯誤區域
    fill('#c0392b'); // 設定錯誤文字顏色
    textSize(10); // 設定錯誤文字大小
    text('GIF 載入失敗', card.x + card.w * 0.25, card.y + card.h / 2); // 顯示錯誤訊息
    return; // 結束 GIF 繪製函式
  } // 結束載入失敗判斷
  const imageW = card.w * 0.45; // 設定 GIF 寬度
  const imageH = card.h - 16; // 設定 GIF 高度
  image(gifs[pairIndex], card.x + 8, card.y + 8, imageW, imageH); // 顯示 GIF 圖片
} // 結束 GIF 繪製函式

// 繪製成功連線。 // 定義連線函式
function drawConnections() { // 開始連線函式
  for (const pairIndex of matched) { // 逐一處理成功配對
    const left = leftCard(pairIndex); // 取得左側卡片
    const position = imageOrder.indexOf(pairIndex); // 找出圖片所在位置
    const right = rightCard(position); // 取得右側卡片
    stroke(pairs[pairIndex].color); // 設定連線顏色
    strokeWeight(4); // 設定連線粗細
    line(left.x + left.w, left.y + left.h / 2, right.x, right.y + right.h / 2); // 繪製連線
  } // 結束連線迴圈
  if (dragging >= 0) { // 判斷是否正在拖曳
    const left = leftCard(dragging); // 取得拖曳中的左側卡片
    stroke('#e67e22'); // 設定暫時連線顏色
    strokeWeight(3); // 設定暫時連線粗細
    line(left.x + left.w, left.y + left.h / 2, dragX, dragY); // 繪製拖曳連線
  } // 結束拖曳連線判斷
} // 結束連線函式

// 繪製拖曳中的卡片。 // 定義拖曳卡片函式
function drawDraggingCard() { // 開始拖曳卡片函式
  if (dragging < 0) { // 判斷是否沒有拖曳
    return; // 沒有拖曳時結束
  } // 結束沒有拖曳判斷
  rectMode(CENTER); // 設定矩形中心模式
  fill('#fff3cd'); // 設定拖曳卡片背景
  stroke('#e67e22'); // 設定拖曳卡片邊框
  strokeWeight(3); // 設定拖曳邊框粗細
  rect(dragX, dragY, 170, 46, 10); // 繪製拖曳中的卡片
  rectMode(CORNER); // 還原矩形模式
  noStroke(); // 關閉文字邊框
  fill('#243b53'); // 設定文字顏色
  textSize(16); // 設定文字大小
  text(pairs[dragging].text, dragX, dragY); // 顯示拖曳中的函式
} // 結束拖曳卡片函式

// 繪製底部按鈕。 // 定義按鈕函式
function drawButtons() { // 開始按鈕函式
  const y = height - 42; // 設定按鈕 Y 座標
  noStroke(); // 關閉按鈕邊框
  fill('#64748b'); // 設定重新開始按鈕顏色
  rectMode(CENTER); // 設定矩形中心模式
  rect(width / 2 - 105, y, 150, 40, 10); // 繪製重新開始按鈕
  fill('#2563eb'); // 設定交卷按鈕顏色
  rect(width / 2 + 105, y, 150, 40, 10); // 繪製交卷按鈕
  rectMode(CORNER); // 還原矩形模式
  fill(255); // 設定文字顏色
  textSize(15); // 設定文字大小
  text('重新開始', width / 2 - 105, y); // 顯示重新開始文字
  text(submitted ? '重新測驗' : '交卷看成績', width / 2 + 105, y); // 顯示交卷或重測文字
  if (submitted) { // 判斷是否已經交卷
    fill('#243b53'); // 設定成績文字顏色
    textSize(20); // 設定成績大小
    text(`成績：${matched.length} / ${pairs.length}，${round(matched.length / pairs.length * 100)}%`, width / 2, height - 92); // 顯示成績
    textSize(15); // 設定結果文字大小
    text(matched.length / pairs.length > 0.6 ? '恭喜通過！' : '再練習一次！', width / 2, height - 120); // 顯示結果訊息
  } // 結束成績顯示
} // 結束按鈕函式

// 處理滑鼠按下。 // 定義滑鼠事件
function mousePressed() { // 開始滑鼠按下事件
  const buttonY = height - 42; // 設定按鈕 Y 座標
  if (dist(mouseX, mouseY, width / 2 - 105, buttonY) < 75) { // 判斷是否點擊重新開始
    resetQuiz(); // 執行重新開始
    return false; // 停止後續處理
  } // 結束重新開始判斷
  if (dist(mouseX, mouseY, width / 2 + 105, buttonY) < 75) { // 判斷是否點擊交卷或重測
    submitted ? resetQuiz() : submitQuiz(); // 依照狀態執行功能
    return false; // 停止後續處理
  } // 結束交卷按鈕判斷
  if (submitted) { // 判斷是否已經交卷
    return false; // 交卷後禁止繼續拖曳
  } // 結束交卷狀態判斷
  for (let i = 0; i < pairs.length; i += 1) { // 逐一檢查左側卡片
    const card = leftCard(i); // 取得左側卡片位置
    const inside = mouseX >= card.x && mouseX <= card.x + card.w && mouseY >= card.y && mouseY <= card.y + card.h; // 判斷滑鼠是否在卡片內
    if (inside && !matched.includes(i)) { // 判斷是否點擊尚未配對卡片
      dragging = i; // 記錄拖曳索引
      dragX = mouseX; // 記錄拖曳 X 座標
      dragY = mouseY; // 記錄拖曳 Y 座標
    } // 結束卡片判斷
  } // 結束卡片迴圈
  return false; // 阻止預設行為
} // 結束滑鼠按下事件

// 處理滑鼠拖曳。 // 定義拖曳事件
function mouseDragged() { // 開始滑鼠拖曳事件
  if (dragging >= 0) { // 判斷是否正在拖曳
    dragX = mouseX; // 更新拖曳 X 座標
    dragY = mouseY; // 更新拖曳 Y 座標
  } // 結束拖曳判斷
  return false; // 阻止預設行為
} // 結束滑鼠拖曳事件

// 處理滑鼠放開。 // 定義放開事件
function mouseReleased() { // 開始滑鼠放開事件
  if (dragging >= 0) { // 判斷是否正在拖曳
    for (let position = 0; position < imageOrder.length; position += 1) { // 逐一檢查右側卡片
      const pairIndex = imageOrder[position]; // 取得目前圖片配對索引
      const card = rightCard(position); // 取得右側卡片位置
      const inside = dragX >= card.x && dragX <= card.x + card.w && dragY >= card.y && dragY <= card.y + card.h; // 判斷是否放在卡片內
      if (inside && pairIndex === dragging && !matched.includes(dragging)) { // 判斷是否配對正確
        matched.push(dragging); // 記錄成功配對
      } // 結束正確配對判斷
    } // 結束右側卡片迴圈
    dragging = -1; // 清除拖曳狀態
  } // 結束拖曳判斷
  return false; // 阻止預設行為
} // 結束滑鼠放開事件

// 建立彩帶。 // 定義彩帶函式
function createConfetti() { // 開始建立彩帶
  confetti = []; // 清除舊彩帶
  for (let i = 0; i < 80; i += 1) { // 建立八十個彩帶
    confetti.push({ x: random(width), y: random(-height, 0), speed: random(2, 6), angle: random(TWO_PI), color: color(random(255), random(255), random(255)) }); // 加入彩帶物件
  } // 結束彩帶建立
} // 結束建立彩帶

// 繪製彩帶。 // 定義彩帶繪製函式
function drawConfetti() { // 開始彩帶繪製
  if (!submitted || matched.length / pairs.length <= 0.6) { // 判斷是否需要彩帶
    return; // 不符合條件時結束
  } // 結束彩帶判斷
  for (const piece of confetti) { // 逐一繪製彩帶
    push(); // 儲存繪圖狀態
    translate(piece.x, piece.y); // 移動畫布到彩帶位置
    rotate(piece.angle); // 旋轉彩帶
    noStroke(); // 關閉彩帶邊框
    fill(piece.color); // 設定彩帶顏色
    rectMode(CENTER); // 使用中心模式
    rect(0, 0, 8, 16, 2); // 繪製彩帶
    pop(); // 還原繪圖狀態
    piece.y += piece.speed; // 更新彩帶 Y 座標
    piece.angle += 0.05; // 更新彩帶角度
    if (piece.y > height + 20) { // 判斷彩帶是否超出畫布
      piece.y = random(-100, 0); // 將彩帶移回上方
      piece.x = random(width); // 重新設定彩帶位置
    } // 結束彩帶重設
  } // 結束彩帶迴圈
} // 結束彩帶繪製

// 重置測驗。 // 定義重置函式
function resetQuiz() { // 開始重置測驗
  matched = []; // 清除成功配對
  dragging = -1; // 清除拖曳狀態
  submitted = false; // 設定尚未交卷
  confetti = []; // 清除彩帶
  imageOrder = [0, 1, 2, 3, 4, 5]; // 重設圖片順序
  shuffle(imageOrder, true); // 隨機排列右側圖片
} // 結束重置測驗

// 處理視窗縮放。 // 定義視窗縮放函式
function windowResized() { // 開始視窗縮放
  resizeCanvas(windowWidth, windowHeight); // 調整畫布大小
} // 結束視窗縮放
// ------------------------------ 可修改的 GIF 設定 ------------------------------ // 設定檔案區段
const REMOTE_GIF_URLS = [ // 建立遠端 GIF URL 陣列
  "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif", // setup 初始化概念的示例 GIF
  "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif", // draw 連續動畫概念的示例 GIF
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", // createCanvas 建立畫布概念的示例 GIF
  "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif", // background 背景概念的示例 GIF
  "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif", // fill 填滿顏色概念的示例 GIF
  "https://media.giphy.com/media/3o6Zt6D8N3P7q6G8aI/giphy.gif" // stroke 線條概念的示例 GIF
]; // 結束遠端 GIF URL 陣列
const LOCAL_GIF_PATHS = [ // 建立本機 GIF 路徑陣列
  "", // 留白表示使用同位置的遠端 GIF
  "", // 留白表示使用同位置的遠端 GIF
  "", // 留白表示使用同位置的遠端 GIF
  "", // 留白表示使用同位置的遠端 GIF
  "", // 留白表示使用同位置的遠端 GIF
  "" // 留白表示使用同位置的遠端 GIF
]; // 結束本機 GIF 路徑陣列

// ------------------------------ 測驗資料 ------------------------------ // 設定測驗資料區段
const PAIRS = [ // 建立六組配對資料
  { pairId: "setup", concept: "setup()", description: "初始化畫布", color: "#ff7b72" }, // 定義 setup 配對
  { pairId: "draw", concept: "draw()", description: "連續動畫", color: "#f2cc60" }, // 定義 draw 配對
  { pairId: "createCanvas", concept: "createCanvas()", description: "建立畫布", color: "#7ee787" }, // 定義 createCanvas 配對
  { pairId: "background", concept: "background()", description: "背景顏色", color: "#79c0ff" }, // 定義 background 配對
  { pairId: "fill", concept: "fill()", description: "填滿顏色", color: "#d2a8ff" }, // 定義 fill 配對
  { pairId: "stroke", concept: "stroke()", description: "線條顏色", color: "#ffa657" } // 定義 stroke 配對
]; // 結束六組配對資料

// ------------------------------ 全域狀態 ------------------------------ // 宣告互動狀態區段
let gifImages = []; // 儲存所有載入成功或失敗的 GIF 物件
let gifStates = []; // 儲存每一張 GIF 的載入狀態
let matchedPairIds = []; // 儲存已經成功配對的 pairId
let draggingPairId = ""; // 儲存目前拖曳中的左側 pairId
let draggingX = 0; // 儲存拖曳卡片的 X 座標
let draggingY = 0; // 儲存拖曳卡片的 Y 座標
let hoverTargetId = ""; // 儲存目前被拖曳指向的右側 pairId
let quizSubmitted = false; // 記錄是否已經交卷
let correctCount = 0; // 記錄答對數量
let scorePercent = 0; // 記錄百分比成績
let feedbackText = "請將左側概念拖曳到右側相應圖片上。"; // 記錄作答提示
let feedbackColor = "#52606d"; // 記錄作答提示顏色
let feedbackUntil = 0; // 記錄提示顯示結束時間
let confetti = []; // 儲存彩帶物件
let lastConfettiSpawn = 0; // 記錄上次補充彩帶的時間
let pressedPointer = false; // 記錄目前是否有指標按下

// ------------------------------ p5.js 載入與初始化 ------------------------------ // 定義 p5.js 生命週期
function preload() { // 定義素材預載入函式
  for (let index = 0; index < PAIRS.length; index += 1) { // 逐一載入六組 GIF
    const localPath = LOCAL_GIF_PATHS[index] || ""; // 取得使用者設定的本機路徑
    const remotePath = REMOTE_GIF_URLS[index] || ""; // 取得對應的遠端路徑
    const sourcePath = localPath.trim() !== "" ? localPath : remotePath; // 優先使用本機路徑
    gifStates[index] = "loading"; // 將目前 GIF 設為載入中
    gifImages[index] = loadImage( // 使用 p5.js loadImage 載入 GIF
      sourcePath, // 傳入本機或遠端圖片來源
      () => { // 定義圖片載入成功回呼
        gifStates[index] = "loaded"; // 記錄圖片已成功載入
      }, // 結束成功回呼
      () => { // 定義圖片載入失敗回呼
        gifStates[index] = "failed"; // 記錄圖片載入失敗
      } // 結束失敗回呼
    ); // 完成單張圖片載入
  } // 結束 GIF 載入迴圈
} // 結束素材預載入函式

function setup() { // 定義 p5.js 初始化函式
  createCanvas(windowWidth, windowHeight); // 建立全螢幕響應式畫布
  pixelDensity(1); // 降低高密度螢幕的繪圖負擔
  textFont("Noto Sans TC, Arial, sans-serif"); // 設定繁體中文優先字型
  textAlign(CENTER, CENTER); // 設定文字水平與垂直置中
  rectMode(CORNER); // 設定矩形以左上角定位
  imageMode(CORNER); // 設定圖片以左上角定位
  initializeQuiz(); // 初始化測驗狀態
} // 結束 p5.js 初始化函式

function draw() { // 定義 p5.js 每幀繪圖函式
  background("#f4f7fb"); // 繪製整體背景顏色
  drawBackgroundDecorations(); // 繪製背景裝飾圖形
  drawHeader(); // 繪製上方標題與說明
  drawBoard(); // 繪製左右配對主區域
  drawConnections(); // 繪製成功配對的連線
  drawFooter(); // 繪製底部按鈕與提示
  drawDraggingCard(); // 繪製跟隨指標的拖曳卡片
  drawConfetti(); // 繪製及更新彩帶效果
} // 結束 p5.js 每幀繪圖函式

function windowResized() { // 定義視窗縮放事件函式
  resizeCanvas(windowWidth, windowHeight); // 讓畫布跟隨視窗尺寸改變
} // 結束視窗縮放事件函式

// ------------------------------ 版面計算 ------------------------------ // 定義響應式版面區段
function getLayout() { // 定義計算版面座標的函式
  const compact = width < 720; // 判斷是否使用窄螢幕版面
  const margin = constrain(width * 0.045, 18, 56); // 計算左右安全邊界
  const headerHeight = compact ? 112 : 132; // 設定標題區高度
  const footerHeight = compact ? 106 : 88; // 設定底部區高度
  const boardX = margin; // 設定主區域左側座標
  const boardY = headerHeight; // 設定主區域上側座標
  const boardW = width - margin * 2; // 設定主區域寬度
  const boardH = max(260, height - headerHeight - footerHeight); // 設定主區域高度
  const gap = compact ? 14 : 28; // 設定左右欄間距
  const columnW = (boardW - gap) / 2; // 計算左右欄寬度
  const cardGap = compact ? 8 : 12; // 設定卡片間距
  const cardH = max(48, (boardH - 68 - cardGap * 5) / 6); // 計算單張卡片高度
  return { compact, margin, headerHeight, footerHeight, boardX, boardY, boardW, boardH, gap, columnW, cardGap, cardH }; // 回傳完整版面資料
} // 結束版面計算函式

function getLeftCardRect(index) { // 計算左側文字卡片位置
  const layout = getLayout(); // 取得目前響應式版面
  const x = layout.boardX; // 設定左卡片 X 座標
  const y = layout.boardY + 54 + index * (layout.cardH + layout.cardGap); // 設定左卡片 Y 座標
  return { x, y, w: layout.columnW, h: layout.cardH }; // 回傳左卡片矩形
} // 結束左側卡片位置函式

function getRightCardRect(index) { // 計算右側圖片卡片位置
  const layout = getLayout(); // 取得目前響應式版面
  const x = layout.boardX + layout.columnW + layout.gap; // 設定右卡片 X 座標
  const y = layout.boardY + 54 + index * (layout.cardH + layout.cardGap); // 設定右卡片 Y 座標
  return { x, y, w: layout.columnW, h: layout.cardH }; // 回傳右卡片矩形
} // 結束右側卡片位置函式

// ------------------------------ 畫面繪製 ------------------------------ // 定義畫面繪製區段
function drawBackgroundDecorations() { // 定義背景裝飾繪製函式
  noStroke(); // 關閉裝飾圖形邊框
  fill(227, 239, 255, 150); // 設定左上裝飾顏色
  circle(width * 0.08, height * 0.16, min(width, height) * 0.18); // 繪製左上圓形裝飾
  fill(245, 231, 255, 120); // 設定右下裝飾顏色
  circle(width * 0.94, height * 0.86, min(width, height) * 0.24); // 繪製右下圓形裝飾
} // 結束背景裝飾繪製函式

function drawHeader() { // 定義標題區繪製函式
  const layout = getLayout(); // 取得目前版面資料
  fill("#1f2937"); // 設定標題文字顏色
  noStroke(); // 關閉標題文字邊框
  textSize(constrain(width * 0.036, 22, 38)); // 設定響應式標題大小
  text("p5.js 連連看拖曳測驗", width / 2, 30); // 繪製主標題
  fill("#52606d"); // 設定說明文字顏色
  textSize(constrain(width * 0.017, 13, 17)); // 設定說明文字大小
  text("把左側的函式名稱拖曳到右側相應的主題動態圖片上。完成後再交卷看成績。", width / 2, layout.compact ? 72 : 70); // 繪製操作說明
  fill("#829ab1"); // 設定載入提示文字顏色
  textSize(12); // 設定載入提示文字大小
  text("GIF 若無法載入，會自動顯示主題插圖替代卡片，仍可正常作答。", width / 2, layout.compact ? 94 : 96); // 繪製載入備註
} // 結束標題區繪製函式

function drawBoard() { // 定義主配對區繪製函式
  const layout = getLayout(); // 取得目前版面資料
  fill(255, 245); // 設定主區域半透明白色
  stroke("#d9e2ec"); // 設定主區域邊框顏色
  strokeWeight(1.5); // 設定主區域邊框粗細
  rect(layout.boardX, layout.boardY, layout.boardW, layout.boardH, 20); // 繪製主區域外框
  noStroke(); // 關閉欄位標題邊框
  fill("#334e68"); // 設定欄位標題顏色
  textSize(constrain(width * 0.018, 14, 20)); // 設定欄位標題大小
  text("函式／概念", layout.boardX + layout.columnW / 2, layout.boardY + 26); // 繪製左欄標題
  text("主題動態圖片／替代插圖", layout.boardX + layout.columnW + layout.gap + layout.columnW / 2, layout.boardY + 26); // 繪製右欄標題
  for (let index = 0; index < PAIRS.length; index += 1) { // 逐一繪製六組卡片
    drawLeftCard(index); // 繪製左側文字卡片
    drawRightCard(index); // 繪製右側 GIF 卡片
  } // 結束卡片繪製迴圈
} // 結束主配對區繪製函式

function drawLeftCard(index) { // 定義左側文字卡片繪製函式
  const item = PAIRS[index]; // 取得目前配對資料
  const rectData = getLeftCardRect(index); // 取得左側卡片矩形
  const matched = matchedPairIds.includes(item.pairId); // 判斷此卡片是否已配對
  const dragging = draggingPairId === item.pairId; // 判斷此卡片是否正在拖曳
  fill(matched ? "#e6ffed" : dragging ? "#fff3cd" : 255); // 設定左卡片背景顏色
  stroke(matched ? "#34a853" : dragging ? "#f0ad00" : "#cbd5e1"); // 設定左卡片邊框顏色
  strokeWeight(matched || dragging ? 3 : 1.5); // 設定左卡片邊框粗細
  rect(rectData.x, rectData.y, rectData.w, rectData.h, 14); // 繪製左側卡片
  noStroke(); // 關閉左卡片文字邊框
  fill(item.color); // 設定卡片識別圓點顏色
  circle(rectData.x + 24, rectData.y + rectData.h / 2, 15); // 繪製卡片識別圓點
  fill("#243b53"); // 設定函式名稱顏色
  textSize(constrain(width * 0.022, 16, 24)); // 設定函式名稱大小
  text(item.concept, rectData.x + rectData.w * 0.34, rectData.y + rectData.h * 0.42); // 繪製函式名稱
  fill("#627d98"); // 設定概念說明顏色
  textSize(constrain(width * 0.014, 11, 15)); // 設定概念說明大小
  text(item.description, rectData.x + rectData.w * 0.34, rectData.y + rectData.h * 0.72); // 繪製概念說明
  if (matched) { // 判斷是否需要繪製完成標記
    fill("#198754"); // 設定完成標記顏色
    textSize(16); // 設定完成標記大小
    text("✓", rectData.x + rectData.w - 24, rectData.y + rectData.h / 2); // 繪製完成標記
  } // 結束完成標記判斷
} // 結束左側文字卡片繪製函式

function drawRightCard(index) { // 定義右側圖片卡片繪製函式
  const item = PAIRS[index]; // 取得目前配對資料
  const rectData = getRightCardRect(index); // 取得右側卡片矩形
  const matched = matchedPairIds.includes(item.pairId); // 判斷此卡片是否已配對
  const highlighted = hoverTargetId === item.pairId && draggingPairId !== ""; // 判斷此卡片是否被拖曳指向
  fill(matched ? "#effff3" : highlighted ? "#fff8d8" : "#ffffff"); // 設定右卡片背景顏色
  stroke(matched ? "#34a853" : highlighted ? "#f0ad00" : "#cbd5e1"); // 設定右卡片邊框顏色
  strokeWeight(matched || highlighted ? 3 : 1.5); // 設定右卡片邊框粗細
  rect(rectData.x, rectData.y, rectData.w, rectData.h, 14); // 繪製右側卡片外框
  drawGifOrFallback(index, rectData); // 繪製 GIF 或失敗替代插圖
  fill("#243b53"); // 設定圖片下方文字顏色
  noStroke(); // 關閉圖片下方文字邊框
  textSize(constrain(width * 0.015, 12, 17)); // 設定圖片下方文字大小
  text(item.description, rectData.x + rectData.w / 2, rectData.y + rectData.h - 17); // 繪製圖片主題說明
  if (matched) { // 判斷是否需要繪製配對完成標記
    fill("#198754"); // 設定完成標記顏色
    circle(rectData.x + rectData.w - 22, rectData.y + 22, 25); // 繪製完成圓形
    fill(255); // 設定完成符號顏色
    textSize(16); // 設定完成符號大小
    text("✓", rectData.x + rectData.w - 22, rectData.y + 22); // 繪製完成符號
  } // 結束配對完成標記判斷
  if (highlighted) { // 判斷是否需要繪製拖曳高亮提示
    noFill(); // 設定高亮框不填色
    stroke(item.color); // 設定高亮框顏色
    strokeWeight(4); // 設定高亮框粗細
    rect(rectData.x + 4, rectData.y + 4, rectData.w - 8, rectData.h - 8, 11); // 繪製高亮框
  } // 結束拖曳高亮判斷
} // 結束右側圖片卡片繪製函式

function drawGifOrFallback(index, rectData) { // 定義 GIF 與替代插圖繪製函式
  const state = gifStates[index]; // 取得目前 GIF 載入狀態
  const imageObject = gifImages[index]; // 取得目前 GIF 圖片物件
  const imageX = rectData.x + 8; // 計算圖片內容 X 座標
  const imageY = rectData.y + 8; // 計算圖片內容 Y 座標
  const imageW = rectData.w - 16; // 計算圖片內容寬度
  const imageH = rectData.h - 38; // 計算圖片內容高度
  if (state === "loaded" && imageObject && imageObject.width > 0 && imageObject.height > 0) { // 判斷 GIF 是否可繪製
    const scale = min(imageW / imageObject.width, imageH / imageObject.height); // 計算圖片等比例縮放比例
    const drawW = imageObject.width * scale; // 計算圖片繪製寬度
    const drawH = imageObject.height * scale; // 計算圖片繪製高度
    image(imageObject, imageX + (imageW - drawW) / 2, imageY + (imageH - drawH) / 2, drawW, drawH); // 繪製成功載入的 GIF
    return; // 成功繪製後結束函式
  } // 結束 GIF 成功判斷
  drawFallbackIllustration(index, rectData, state); // GIF 失敗或等待時繪製替代內容
} // 結束 GIF 與替代插圖繪製函式

function drawFallbackIllustration(index, rectData, state) { // 定義主題替代插圖函式
  const item = PAIRS[index]; // 取得目前配對資料
  const centerX = rectData.x + rectData.w / 2; // 計算插圖中心 X 座標
  const centerY = rectData.y + (rectData.h - 28) / 2; // 計算插圖中心 Y 座標
  push(); // 保存目前繪圖狀態
  translate(centerX, centerY); // 將繪圖原點移到插圖中心
  noStroke(); // 關閉插圖邊框
  fill(item.color); // 設定插圖主色
  circle(0, -3, min(rectData.w, rectData.h) * 0.48); // 繪製主題圓形
  fill(255, 235); // 設定插圖內部半透明白色
  if (index === 0) { // 判斷是否繪製 setup 插圖
    rectMode(CENTER); // 使用中心模式繪製初始化方塊
    rect(0, -3, 42, 30, 5); // 繪製初始化畫面方塊
    fill(item.color); // 設定初始化符號顏色
    circle(-10, -3, 7); // 繪製初始化符號圓點
    circle(0, -3, 7); // 繪製初始化符號圓點
    circle(10, -3, 7); // 繪製初始化符號圓點
    rectMode(CORNER); // 還原矩形模式
  } else if (index === 1) { // 判斷是否繪製 draw 插圖
    stroke(item.color); // 設定動畫軌跡顏色
    strokeWeight(5); // 設定動畫軌跡粗細
    noFill(); // 設定動畫軌跡不填色
    arc(0, -2, 42, 42, -0.7, 3.8); // 繪製動畫循環軌跡
    fill(255); // 設定箭頭顏色
    noStroke(); // 關閉箭頭邊框
    triangle(17, -20, 23, -11, 12, -13); // 繪製動畫箭頭
  } else if (index === 2) { // 判斷是否繪製 createCanvas 插圖
    rectMode(CENTER); // 使用中心模式繪製畫布
    rect(0, -3, 48, 34, 4); // 繪製畫布外框
    fill(item.color); // 設定畫布內容顏色
    rect(0, -3, 38, 24, 2); // 繪製畫布內容
    stroke(255); // 設定畫布十字顏色
    strokeWeight(3); // 設定畫布十字粗細
    line(-9, -3, 9, -3); // 繪製畫布水平線
    line(0, -12, 0, 6); // 繪製畫布垂直線
    rectMode(CORNER); // 還原矩形模式
  } else if (index === 3) { // 判斷是否繪製 background 插圖
    fill(item.color); // 設定背景色塊顏色
    rectMode(CENTER); // 使用中心模式繪製背景色塊
    rect(0, -3, 50, 34, 4); // 繪製背景色塊
    fill(255); // 設定太陽顏色
    circle(11, -12, 9); // 繪製背景中的太陽
    fill(item.color); // 設定山形顏色
    triangle(-21, 13, -3, -8, 16, 13); // 繪製背景中的山形
    rectMode(CORNER); // 還原矩形模式
  } else if (index === 4) { // 判斷是否繪製 fill 插圖
    fill(item.color); // 設定填滿顏色
    rectMode(CENTER); // 使用中心模式繪製填滿方塊
    rect(0, -3, 42, 32, 5); // 繪製填滿方塊
    fill(255); // 設定油漆符號顏色
    circle(0, -3, 14); // 繪製油漆內部圓
    rectMode(CORNER); // 還原矩形模式
  } else { // 其餘情況繪製 stroke 插圖
    stroke(255); // 設定線條示意顏色
    strokeWeight(5); // 設定線條示意粗細
    line(-20, 12, 20, -12); // 繪製斜向線條
    line(-20, -12, 20, 12); // 繪製交叉線條
  } // 結束主題插圖分支
  pop(); // 還原繪圖狀態
  noStroke(); // 關閉載入狀態文字邊框
  fill("#829ab1"); // 設定載入狀態文字顏色
  textSize(10); // 設定載入狀態文字大小
  const statusText = state === "loading" ? "GIF 載入中" : "主題替代插圖"; // 產生載入狀態文字
  text(statusText, rectData.x + rectData.w / 2, rectData.y + rectData.h - 31); // 繪製載入狀態文字
} // 結束主題替代插圖函式

function drawConnections() { // 定義成功配對連線繪製函式
  for (let index = 0; index < PAIRS.length; index += 1) { // 逐一檢查所有配對
    const item = PAIRS[index]; // 取得目前配對資料
    if (!matchedPairIds.includes(item.pairId)) { // 判斷目前配對是否尚未完成
      continue; // 未完成時跳過連線
    } // 結束未完成判斷
    const leftRect = getLeftCardRect(index); // 取得左側卡片矩形
    const rightRect = getRightCardRect(index); // 取得右側卡片矩形
    const startX = leftRect.x + leftRect.w; // 計算連線起點 X 座標
    const startY = leftRect.y + leftRect.h / 2; // 計算連線起點 Y 座標
    const endX = rightRect.x; // 計算連線終點 X 座標
    const endY = rightRect.y + rightRect.h / 2; // 計算連線終點 Y 座標
    stroke(item.color); // 設定連線顏色
    strokeWeight(4); // 設定連線粗細
    noFill(); // 設定連線不填色
    bezier(startX, startY, startX + 28, startY, endX - 28, endY, endX, endY); // 繪製彎曲成功連線
    noStroke(); // 關閉連線端點邊框
    fill(item.color); // 設定連線端點顏色
    circle(startX, startY, 9); // 繪製連線起點
    circle(endX, endY, 9); // 繪製連線終點
  } // 結束配對連線迴圈
  if (draggingPairId !== "") { // 判斷是否需要繪製拖曳中的暫時連線
    const sourceIndex = PAIRS.findIndex((item) => item.pairId === draggingPairId); // 取得拖曳來源索引
    if (sourceIndex >= 0) { // 判斷拖曳來源是否有效
      const leftRect = getLeftCardRect(sourceIndex); // 取得拖曳來源卡片矩形
      stroke("#f0ad00"); // 設定暫時連線顏色
      strokeWeight(3); // 設定暫時連線粗細
      line(leftRect.x + leftRect.w, leftRect.y + leftRect.h / 2, draggingX, draggingY); // 繪製跟隨指標的暫時連線
    } // 結束拖曳來源有效判斷
  } // 結束暫時連線判斷
} // 結束成功配對連線繪製函式

function drawFooter() { // 定義底部工具列繪製函式
  const layout = getLayout(); // 取得目前版面資料
  const footerY = height - layout.footerHeight; // 計算底部工具列起點
  noStroke(); // 關閉工具列邊框
  fill("#52606d"); // 設定提示文字顏色
  textSize(constrain(width * 0.014, 11, 15)); // 設定提示文字大小
  text(feedbackText, width / 2, footerY + 18); // 繪製操作提示文字
  const buttonY = footerY + (layout.compact ? 68 : 52); // 計算按鈕中心 Y 座標
  drawButton("重新開始", width / 2 - (layout.compact ? 82 : 105), buttonY, layout.compact ? 130 : 150, 40, "reset"); // 繪製重新開始按鈕
  drawButton(quizSubmitted ? "重新作答" : "交卷看成績", width / 2 + (layout.compact ? 82 : 105), buttonY, layout.compact ? 150 : 170, 40, "submit"); // 繪製交卷或重新作答按鈕
  if (quizSubmitted) { // 判斷是否已交卷
    drawResultOverlay(); // 繪製交卷後成績面板
  } // 結束交卷結果判斷
} // 結束底部工具列繪製函式

function drawButton(label, centerX, centerY, buttonW, buttonH, buttonType) { // 定義按鈕繪製函式
  const hovered = isInsideRect(mouseX, mouseY, { x: centerX - buttonW / 2, y: centerY - buttonH / 2, w: buttonW, h: buttonH }); // 判斷滑鼠是否位於按鈕上
  fill(buttonType === "submit" ? "#2563eb" : "#64748b"); // 設定按鈕背景顏色
  if (hovered) { // 判斷是否需要繪製按鈕懸停效果
    fill(buttonType === "submit" ? "#1d4ed8" : "#475569"); // 設定懸停時的按鈕顏色
  } // 結束懸停效果判斷
  noStroke(); // 關閉按鈕邊框
  rectMode(CENTER); // 使用中心模式繪製按鈕
  rect(centerX, centerY, buttonW, buttonH, 12); // 繪製按鈕外形
  rectMode(CORNER); // 還原矩形模式
  fill(255); // 設定按鈕文字顏色
  textSize(constrain(width * 0.016, 13, 16)); // 設定按鈕文字大小
  text(label, centerX, centerY); // 繪製按鈕文字
} // 結束按鈕繪製函式

function drawResultOverlay() { // 定義成績結果面板繪製函式
  const panelW = min(width * 0.86, 560); // 計算結果面板寬度
  const panelH = min(height * 0.54, 410); // 計算結果面板高度
  const panelX = (width - panelW) / 2; // 計算結果面板 X 座標
  const panelY = max(92, (height - panelH) / 2); // 計算結果面板 Y 座標
  fill(248, 251, 255, 248); // 設定結果面板背景
  stroke("#2563eb"); // 設定結果面板邊框顏色
  strokeWeight(2); // 設定結果面板邊框粗細
  rect(panelX, panelY, panelW, panelH, 20); // 繪製結果面板
  noStroke(); // 關閉結果文字邊框
  fill("#1f2937"); // 設定結果標題顏色
  textSize(constrain(width * 0.03, 21, 32)); // 設定結果標題大小
  text("測驗結果", width / 2, panelY + 38); // 繪製結果標題
  fill(scorePercent > 60 ? "#16803c" : "#c2410c"); // 設定成績顏色
  textSize(constrain(width * 0.035, 24, 38)); // 設定成績大小
  text(`答對 ${correctCount} / ${PAIRS.length} 組　${scorePercent}%`, width / 2, panelY + 84); // 繪製答對數與百分比
  fill("#52606d"); // 設定鼓勵訊息顏色
  textSize(constrain(width * 0.016, 13, 17)); // 設定鼓勵訊息大小
  const message = scorePercent > 60 ? "太棒了！你已掌握 p5.js 基礎概念，彩帶正在為你慶祝！" : "再練習一下函式用途，你一定會越來越熟練！"; // 產生成績鼓勵訊息
  text(message, width / 2, panelY + 124); // 繪製鼓勵訊息
  const resultStartY = panelY + 165; // 設定逐組結果起始位置
  for (let index = 0; index < PAIRS.length; index += 1) { // 逐一繪製六組結果
    const item = PAIRS[index]; // 取得目前配對資料
    const resultY = resultStartY + index * 30; // 計算目前結果 Y 座標
    const isCorrect = matchedPairIds.includes(item.pairId); // 判斷目前配對是否正確
    fill(isCorrect ? "#198754" : "#dc3545"); // 設定結果符號顏色
    textSize(17); // 設定結果符號大小
    text(isCorrect ? "✓" : "✗", panelX + 42, resultY); // 繪製正誤符號
    fill("#334e68"); // 設定結果文字顏色
    textSize(constrain(width * 0.014, 12, 16)); // 設定結果文字大小
    text(`${item.concept} → ${item.description}`, width / 2, resultY); // 繪製逐組配對結果
  } // 結束逐組結果迴圈
} // 結束成績結果面板繪製函式

function drawDraggingCard() { // 定義拖曳卡片繪製函式
  if (draggingPairId === "") { // 判斷目前是否沒有拖曳卡片
    return; // 沒有拖曳時直接結束
  } // 結束無拖曳判斷
  const item = PAIRS.find((entry) => entry.pairId === draggingPairId); // 找出目前拖曳的配對資料
  if (!item) { // 判斷配對資料是否有效
    return; // 無效時直接結束
  } // 結束資料有效判斷
  push(); // 保存目前繪圖狀態
  rectMode(CENTER); // 使用中心模式繪製拖曳卡片
  fill("#fff3cd"); // 設定拖曳卡片背景顏色
  stroke(item.color); // 設定拖曳卡片邊框顏色
  strokeWeight(3); // 設定拖曳卡片邊框粗細
  rect(draggingX, draggingY, min(width * 0.34, 220), 52, 13); // 繪製拖曳中的卡片
  noStroke(); // 關閉拖曳文字邊框
  fill("#243b53"); // 設定拖曳文字顏色
  textSize(constrain(width * 0.02, 14, 20)); // 設定拖曳文字大小
  text(item.concept, draggingX, draggingY); // 繪製拖曳中的函式名稱
  pop(); // 還原繪圖狀態
} // 結束拖曳卡片繪製函式

// ------------------------------ 滑鼠與觸控互動 ------------------------------ // 定義輸入事件區段
function mousePressed() { // 定義滑鼠按下事件
  pressedPointer = true; // 記錄滑鼠已按下
  handlePointerStart(mouseX, mouseY); // 將滑鼠座標交給共用處理器
  return false; // 阻止瀏覽器預設拖曳行為
} // 結束滑鼠按下事件

function mouseDragged() { // 定義滑鼠拖曳事件
  handlePointerMove(mouseX, mouseY); // 將滑鼠座標交給共用移動處理器
  return false; // 阻止瀏覽器預設拖曳行為
} // 結束滑鼠拖曳事件

function mouseReleased() { // 定義滑鼠放開事件
  pressedPointer = false; // 記錄滑鼠已放開
  handlePointerEnd(mouseX, mouseY); // 將滑鼠座標交給共用結束處理器
  return false; // 阻止瀏覽器預設放開行為
} // 結束滑鼠放開事件

function touchStarted() { // 定義觸控開始事件
  if (touches.length > 0) { // 判斷是否存在觸控點
    pressedPointer = true; // 記錄觸控已按下
    handlePointerStart(touches[0].x, touches[0].y); // 使用第一個觸控點開始操作
  } // 結束觸控點判斷
  return false; // 阻止行動裝置預設行為
} // 結束觸控開始事件

function touchMoved() { // 定義觸控移動事件
  if (touches.length > 0) { // 判斷是否存在觸控點
    handlePointerMove(touches[0].x, touches[0].y); // 使用第一個觸控點更新位置
  } // 結束觸控點判斷
  return false; // 阻止行動裝置預設行為
} // 結束觸控移動事件

function touchEnded() { // 定義觸控結束事件
  const endX = touches.length > 0 ? touches[0].x : mouseX; // 取得觸控結束 X 座標
  const endY = touches.length > 0 ? touches[0].y : mouseY; // 取得觸控結束 Y 座標
  pressedPointer = false; // 記錄觸控已放開
  handlePointerEnd(endX, endY); // 將觸控座標交給共用結束處理器
  return false; // 阻止行動裝置預設行為
} // 結束觸控結束事件

function handlePointerStart(x, y) { // 定義共用輸入開始處理器
  if (quizSubmitted) { // 判斷是否已經交卷
    if (isResetButtonAt(x, y) || isSubmitButtonAt(x, y)) { // 判斷是否點擊任一重置按鈕
      initializeQuiz(); // 重新開始整份測驗
    } // 結束重置按鈕判斷
    return; // 交卷後不再開始拖曳
  } // 結束交卷狀態判斷
  if (isResetButtonAt(x, y)) { // 判斷是否點擊重新開始按鈕
    initializeQuiz(); // 執行測驗重置
    return; // 結束本次輸入
  } // 結束重新開始按鈕判斷
  if (isSubmitButtonAt(x, y)) { // 判斷是否點擊交卷按鈕
    submitQuiz(); // 執行交卷並計算成績
    return; // 結束本次輸入
  } // 結束交卷按鈕判斷
  if (matchedPairIds.length === PAIRS.length) { // 判斷是否已經全部配對完成
    feedbackText = "六組都已完成，請按下交卷看成績。"; // 顯示全部完成提示
    feedbackUntil = millis() + 2400; // 設定提示保留時間
    return; // 全部完成時不再啟動拖曳
  } // 結束全部完成判斷
  const sourceIndex = getLeftCardAt(x, y); // 找出被按下的左側卡片索引
  if (sourceIndex < 0) { // 判斷是否沒有按到左側卡片
    return; // 沒有按到卡片時結束
  } // 結束左側卡片判斷
  const item = PAIRS[sourceIndex]; // 取得被按下的配對資料
  if (matchedPairIds.includes(item.pairId)) { // 判斷此卡片是否已經完成配對
    return; // 已完成配對的卡片不可再次拖曳
  } // 結束已完成配對判斷
  draggingPairId = item.pairId; // 記錄目前拖曳中的 pairId
  draggingX = x; // 記錄拖曳起始 X 座標
  draggingY = y; // 記錄拖曳起始 Y 座標
  hoverTargetId = getRightCardAt(x, y) >= 0 ? PAIRS[getRightCardAt(x, y)].pairId : ""; // 設定目前高亮目標
} // 結束共用輸入開始處理器

function handlePointerMove(x, y) { // 定義共用輸入移動處理器
  if (draggingPairId === "") { // 判斷目前是否沒有拖曳
    return; // 沒有拖曳時直接結束
  } // 結束無拖曳判斷
  draggingX = x; // 更新拖曳卡片 X 座標
  draggingY = y; // 更新拖曳卡片 Y 座標
  const targetIndex = getRightCardAt(x, y); // 找出目前指標下的右側卡片
  hoverTargetId = targetIndex >= 0 ? PAIRS[targetIndex].pairId : ""; // 更新右側高亮 pairId
} // 結束共用輸入移動處理器

function handlePointerEnd(x, y) { // 定義共用輸入結束處理器
  if (draggingPairId === "") { // 判斷目前是否沒有拖曳
    return; // 沒有拖曳時直接結束
  } // 結束無拖曳判斷
  const targetIndex = getRightCardAt(x, y); // 找出放開位置的右側卡片
  const targetId = targetIndex >= 0 ? PAIRS[targetIndex].pairId : ""; // 取得放開位置的 pairId
  if (targetId === draggingPairId && !matchedPairIds.includes(targetId)) { // 判斷是否放到正確圖片
    matchedPairIds.push(draggingPairId); // 記錄成功配對的 pairId
    feedbackText = `配對成功！${draggingPairId} 對應正確。`; // 顯示成功提示
    feedbackColor = "#198754"; // 設定成功提示顏色
  } else if (targetIndex >= 0) { // 判斷是否放到錯誤圖片
    feedbackText = "再想一下這個函式的用途，配對不正確。"; // 顯示錯誤提示
    feedbackColor = "#c2410c"; // 設定錯誤提示顏色
  } else { // 判斷是否放在圖片區外
    feedbackText = "請把文字卡片放到右側相應的圖片卡片上。"; // 顯示放置提示
    feedbackColor = "#52606d"; // 設定放置提示顏色
  } // 結束放置結果判斷
  feedbackUntil = millis() + 2400; // 設定提示保留時間
  draggingPairId = ""; // 清除拖曳中的 pairId
  hoverTargetId = ""; // 清除圖片高亮狀態
} // 結束共用輸入結束處理器

// ------------------------------ 碰撞與成績 ------------------------------ // 定義判斷與成績區段
function getLeftCardAt(x, y) { // 定義左側卡片碰撞查找函式
  for (let index = 0; index < PAIRS.length; index += 1) { // 逐一檢查左側卡片
    if (isInsideRect(x, y, getLeftCardRect(index))) { // 判斷座標是否位於左側卡片
      return index; // 回傳命中的卡片索引
    } // 結束左側卡片命中判斷
  } // 結束左側卡片檢查迴圈
  return -1; // 找不到卡片時回傳 -1
} // 結束左側卡片碰撞查找函式

function getRightCardAt(x, y) { // 定義右側卡片碰撞查找函式
  for (let index = 0; index < PAIRS.length; index += 1) { // 逐一檢查右側卡片
    if (isInsideRect(x, y, getRightCardRect(index))) { // 判斷座標是否位於右側卡片
      return index; // 回傳命中的卡片索引
    } // 結束右側卡片命中判斷
  } // 結束右側卡片檢查迴圈
  return -1; // 找不到卡片時回傳 -1
} // 結束右側卡片碰撞查找函式

function isInsideRect(x, y, rectData) { // 定義矩形碰撞判斷函式
  return x >= rectData.x && x <= rectData.x + rectData.w && y >= rectData.y && y <= rectData.y + rectData.h; // 回傳座標是否在矩形內
} // 結束矩形碰撞判斷函式

function getButtonGeometry() { // 定義底部按鈕幾何資料函式
  const layout = getLayout(); // 取得目前響應式版面
  const centerY = height - layout.footerHeight + (layout.compact ? 68 : 52); // 計算按鈕中心 Y 座標
  const offset = layout.compact ? 82 : 105; // 計算按鈕中心水平距離
  const resetW = layout.compact ? 130 : 150; // 設定重置按鈕寬度
  const submitW = layout.compact ? 150 : 170; // 設定交卷按鈕寬度
  return { reset: { x: width / 2 - offset - resetW / 2, y: centerY - 20, w: resetW, h: 40 }, submit: { x: width / 2 + offset - submitW / 2, y: centerY - 20, w: submitW, h: 40 } }; // 回傳兩個按鈕矩形
} // 結束底部按鈕幾何資料函式

function isResetButtonAt(x, y) { // 定義重置按鈕碰撞函式
  return isInsideRect(x, y, getButtonGeometry().reset); // 回傳是否點擊重置按鈕
} // 結束重置按鈕碰撞函式

function isSubmitButtonAt(x, y) { // 定義交卷按鈕碰撞函式
  return isInsideRect(x, y, getButtonGeometry().submit); // 回傳是否點擊交卷按鈕
} // 結束交卷按鈕碰撞函式

function initializeQuiz() { // 定義測驗初始化函式
  matchedPairIds = []; // 清空成功配對紀錄
  draggingPairId = ""; // 清除拖曳中的配對
  hoverTargetId = ""; // 清除右側高亮狀態
  quizSubmitted = false; // 設定為尚未交卷
  correctCount = 0; // 清除答對題數
  scorePercent = 0; // 清除百分比成績
  feedbackText = "請將左側概念拖曳到右側相應的主題動態圖片上。"; // 重設操作提示
  feedbackColor = "#52606d"; // 重設提示顏色
  feedbackUntil = 0; // 清除提示時間
  confetti = []; // 清除彩帶資料
} // 結束測驗初始化函式

function submitQuiz() { // 定義交卷函式
  correctCount = matchedPairIds.length; // 以成功配對數量計算答對數
  scorePercent = round((correctCount / PAIRS.length) * 100); // 計算百分比成績
  quizSubmitted = true; // 設定測驗已交卷
  if (scorePercent > 60) { // 判斷成績是否高於百分之六十
    createConfetti(); // 建立彩帶並開始慶祝
  } // 結束彩帶判斷
} // 結束交卷函式

// ------------------------------ 彩帶效果 ------------------------------ // 定義彩帶動畫區段
function createConfetti() { // 定義建立彩帶函式
  confetti = []; // 清空既有彩帶
  for (let index = 0; index < 120; index += 1) { // 建立一百二十個彩帶物件
    confetti.push({ // 將彩帶物件加入陣列
      x: random(width), // 設定彩帶 X 座標
      y: random(-height, 0), // 設定彩帶起始 Y 座標
      size: random(5, 12), // 設定彩帶尺寸
      speed: random(1.5, 5), // 設定彩帶下落速度
      drift: random(-1.2, 1.2), // 設定彩帶水平漂移速度
      angle: random(TWO_PI), // 設定彩帶初始旋轉角度
      angleSpeed: random(-0.12, 0.12), // 設定彩帶旋轉速度
      colorValue: color(random(255), random(255), random(255)) // 設定彩帶顏色
    }); // 結束單一彩帶物件
  } // 結束彩帶建立迴圈
  lastConfettiSpawn = millis(); // 記錄彩帶建立時間
} // 結束建立彩帶函式

function drawConfetti() { // 定義彩帶繪製與更新函式
  if (!quizSubmitted || scorePercent <= 60) { // 判斷是否符合彩帶顯示條件
    return; // 未交卷或未高於六十分時不顯示彩帶
  } // 結束彩帶顯示條件判斷
  if (millis() - lastConfettiSpawn > 900) { // 判斷是否需要持續補充彩帶
    createConfetti(); // 重新建立一批彩帶
  } // 結束彩帶補充判斷
  for (const piece of confetti) { // 逐一繪製所有彩帶
    push(); // 保存目前繪圖狀態
    translate(piece.x, piece.y); // 移動到彩帶位置
    rotate(piece.angle); // 旋轉彩帶角度
    noStroke(); // 關閉彩帶邊框
    fill(piece.colorValue); // 設定彩帶顏色
    rectMode(CENTER); // 使用中心模式繪製彩帶
    rect(0, 0, piece.size, piece.size * 1.8, 2); // 繪製彩帶矩形
    pop(); // 還原繪圖狀態
    piece.y += piece.speed; // 更新彩帶垂直位置
    piece.x += piece.drift; // 更新彩帶水平漂移
    piece.angle += piece.angleSpeed; // 更新彩帶旋轉角度
    if (piece.y > height + 20) { // 判斷彩帶是否落出畫布
      piece.y = random(-100, -10); // 將彩帶重設到畫布上方
      piece.x = random(width); // 重新設定彩帶水平位置
    } // 結束彩帶重設判斷
  } // 結束彩帶繪製迴圈
} // 結束彩帶繪製與更新函式

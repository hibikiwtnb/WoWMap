# WoWMap

[English README](./README.en.md)

WoWMap 是一個以 `World of Warcraft 3.3.5` 為目標版本的地圖與導航原型。
它的重點不是重現遊戲原版世界地圖美術，而是建立一個更適合導航、查點、規劃交通路線的輕量化地圖介面。

目前專案已經能顯示：
- 世界地圖底圖
- 區域名稱
- 飛行點與飛行路線
- 船、飛艇、地鐵等公共交通
- 基礎起點 / 終點導航流程

這仍然是一個早期原型，功能可用，但仍有不少已知問題與待整理資料。

## 目前方向

- 版本範圍：`Wrath of the Lich King 3.3.5`
- 地圖範圍：東部王國、卡林多
- 目標：做成帶導航能力的魔獸世界地圖，而不是純展示型世界地圖
- 介面方向：偏 Google Maps 風格，但更輕量、更聚焦於交通與移動

## 已實作內容

- 世界地圖視圖與可縮放 / 拖曳操作
- 飛行點資料投影與飛行路線顯示
- 船、飛艇、地鐵路線顯示
- 點擊地圖後的地點資訊側欄
- 起點 / 終點選取與基礎路線求解
- 聯盟 / 部落陣營選擇
- 中英文地圖顯示切換

## 資料來源

本專案目前混合使用：
- 官方客戶端提取資料
- 客戶端衍生的中間資料
- 手工整理的交通連線資料

原始客戶端提取資料預設不納入公開倉庫：
- `data/client_seed/`

公開版本主要使用：
- `data/derived/`

本機客戶端路徑記錄：
- `C:\Games\wlk_335`

## 本機執行

```bash
cd C:\workspace\WoWMap
python -m http.server 8010
```

然後開啟：
- `http://127.0.0.1:8010`

## 主要檔案

- `C:\workspace\WoWMap\index.html`
- `C:\workspace\WoWMap\app.css`
- `C:\workspace\WoWMap\app.js`

資料與工具：
- `C:\workspace\WoWMap\data\derived`
- `C:\workspace\WoWMap\tools`
- `C:\workspace\WoWMap\docs`

## 專案狀態

目前已經有可公開展示的雛形，但還不是穩定版本。
後續仍需要持續修正：
- 路線規劃邏輯
- 陣營限制細節
- 交通資料精度
- 地圖底圖與標記表現
- 地點資訊與導航體驗

## GitHub Pages

公開頁面：
- [https://hibikiwtnb.github.io/WoWMap/](https://hibikiwtnb.github.io/WoWMap/)

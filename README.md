# 八番炸 POSKY 營運儀表板

這個專案是用 POSKY 匯出的歷史交易明細產生的互動式營運儀表板。

## 使用方式

直接開啟：

`outputs/posky-dashboard/index.html`

主要檔案：

- `outputs/posky-dashboard/index.html`：儀表板頁面
- `outputs/posky-dashboard/app.js`：分析與互動邏輯
- `outputs/posky-dashboard/styles.css`：版面樣式
- `outputs/posky-dashboard/data.json`：最新交易資料
- `outputs/posky-dashboard/data-embedded.js`：離線開啟用資料
- `work/dashboard/build_data.py`：重新匯入 POSKY Excel/CSV 的資料產生腳本

## 更新資料

1. 將新的 POSKY 匯出檔放進 Google Drive 同步資料夾：
   `八番炸 歷年交易明細/excel檔`
2. 重新執行資料產生流程，更新 `data.json` 與 `data-embedded.js`
3. 確認儀表板畫面正常後 commit / push 到 GitHub

## 注意

本專案包含實際營收、訂單、付款方式與品項銷售資料。若上傳 GitHub，建議使用 Private repository。

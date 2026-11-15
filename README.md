# MangaRead

繁體中文漫畫目錄與閱讀器，使用 Next.js App Router Server Components。作品資訊與章節由伺服器向 MangaDex API 取得，API 回應快取 30 分鐘。

## 環境設定

本機可先複製 `.env.example` 為 `.env.local`；部署時在平台設定正式網域及已核准的 AdSense ID：

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...
NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP=...
NEXT_PUBLIC_ADSENSE_SLOT_HOME_MIDDLE=...
NEXT_PUBLIC_ADSENSE_SLOT_HOME_BOTTOM=...
NEXT_PUBLIC_ADSENSE_SLOT_MANGA=...
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
```

未設定客戶 ID 或版位 ID 時不會顯示廣告。請先在 AdSense 核准網站並建立廣告版位，再於部署環境設定正式值並重新建置。有效的 `NEXT_PUBLIC_ADSENSE_CLIENT` 也會用來產生 `/ads.txt`；未設定時此路徑會回覆 404，格式錯誤則回覆伺服器錯誤。

閱讀器暫不放置廣告。啟用 AdSense 前，請確認作品及圖片有可營利的使用授權，並完成適用地區的同意管理平台（CMP）設定；目前專案尚未整合 CMP。請在隱私權政策填入實際營運者聯絡方式，並在 AdSense 後台確認網站審核狀態及 `/ads.txt` 狀態。部署後請在 Google Search Console 驗證網域並提交 `/sitemap.xml`。

## SEO、語系與閱讀

- 語系網址為 `/zh-TW`、`/zh-CN` 與 `/en`；舊的無語系網址會依偏好導向相同頁面的語系網址。
- 頁面輸出語系標記、canonical 與 hreflang；Sitemap 收錄主要頁面、分類標籤及熱門和最近更新作品。
- 作品頁輸出動態標題、描述、Open Graph、Book 與 BreadcrumbList 結構化資料；首頁輸出 WebSite/SearchAction。
- 搜尋結果與閱讀頁不列入索引；`/llms.txt` 提供網站內容與來源摘要。
- 章節列表目前顯示 API 回傳的前 96 個繁中、簡中與英文章節。
- 閱讀器支援省流量/高畫質切換、圖片延遲載入及章節前後導覽。

漫畫作品、圖片、語言、授權狀態由 MangaDex 及各作品上傳者管理。營利前請確認作品內容的使用權利、所在地規範與 AdSense 政策均符合要求。

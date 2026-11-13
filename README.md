# MangaRead

繁體中文漫畫目錄與閱讀器，使用 Next.js App Router Server Components。作品資訊與章節由伺服器向 MangaDex API 取得，API 回應快取 30 分鐘。

## 環境設定

在部署平台設定正式網域及已核准的 AdSense ID：

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...
NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP=...
NEXT_PUBLIC_ADSENSE_SLOT_HOME_MIDDLE=...
NEXT_PUBLIC_ADSENSE_SLOT_HOME_BOTTOM=...
NEXT_PUBLIC_ADSENSE_SLOT_MANGA=...
NEXT_PUBLIC_ADSENSE_SLOT_READER=...
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
```

未設定客戶 ID 或版位 ID 時不會顯示廣告。請先在 AdSense 核准網站並建立廣告版位，再填入正式值。部署後請在 Google Search Console 驗證網域並提交 `/sitemap.xml`。

## SEO 與閱讀

- 作品頁輸出動態標題、描述、Open Graph、Book 與 BreadcrumbList 結構化資料。
- 首頁輸出 WebSite/SearchAction；搜尋結果與閱讀頁不列入索引。
- Sitemap 收錄主要導覽頁，以及熱門和最近更新作品；分類頁使用 MangaDex 的實際標籤。
- 章節列表目前顯示 API 回傳的前 96 個繁中、簡中與英文章節。
- 閱讀器支援省流量/高畫質切換、圖片延遲載入及章節前後導覽。

漫畫作品、圖片、語言、授權狀態由 MangaDex 及各作品上傳者管理。營利前請確認作品內容的使用權利、所在地規範與 AdSense 政策均符合要求。

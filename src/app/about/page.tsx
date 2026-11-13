import type { Metadata } from 'next'
export const metadata: Metadata = { title: '關於本站', description: '了解 MangaRead 的漫畫目錄資料來源、閱讀功能與聯絡方式。' }
export default function AboutPage() { return <article className="prose prose-invert max-w-3xl"><h1>關於 MangaRead</h1><p>MangaRead 提供漫畫作品資訊與閱讀導覽。作品標題、封面及章節可用性由 MangaDex API 提供；實際內容與授權狀態以作品頁及權利人資訊為準。</p><p>本網站不代表 MangaDex。若您是權利人並對作品資訊或連結有疑問，請透過 MangaDex 的作品頁與其管理流程聯絡。</p><p>網站目前仍在持續改善，作品資訊可能因來源更新而變動。</p></article> }

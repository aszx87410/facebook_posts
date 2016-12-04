# 說明
這個 nodejs 寫成的小程式會去抓你自己動態上所有的貼文，詳細 API 說明可參考：[graph-api/reference/v2.8/user/feed](https://developers.facebook.com/docs/graph-api/reference/v2.8/user/feed)。

[圖形 API 測試工具](https://developers.facebook.com/tools/explorer/)可以先自己試玩看看，`/me/posts`抓來的結果大概長這樣：

```
{
  "data": [
    {
      "message": "臉書貼文精選集",
      "story": "published a note.",
      "created_time": "2016-12-03T17:27:45+0000",
      "id": "123519227_1234055568996297"
    },
  ],
  "paging": {
    "previous": "previous_url",
    "next": "next_url"
  }
}
```

所以在做這個小 project 的方向就是用 facebook js sdk 登入，然後 call `/me/posts` 抓到第一筆結果，再把第一筆結果的`paging.next`傳到後端，後端就可以去抓第二筆資料，然後從`paging.next`再去抓下一筆，抓到沒有東西可以抓為止。

在做事的檔案有 3 個：

1. `public/index.html`，用 Facebook JavaScriptSDK 去 call `/me/posts`，拿到第二頁的網址之後傳回後端。所以，第一頁的文章在現行程式架構是抓不到的（因為我懶得改），不過要加上第一頁也不難。
2. `index.js`，簡單的 express server，功能就是 render index.html 還有不斷去抓取牆上的 post。最後我會把抓到的東西都先存成`output.json`。
3. `getUrl.js`，因為還要 call [個別文章的 API](https://developers.facebook.com/docs/graph-api/reference/v2.8/post) 才能抓到貼文的詳細資料，例如說連結等等，所以這個程式會去讀`output.json`，然後輸出成`final.json`，這就是最後的結果了。

# 前置作業

1. 去自己帳號新增一個 Facebook App，然後在「應用程式審查」那邊新增`user_posts`這個權限。
2. 去安裝超好用的神器 [ngrok](https://ngrok.com/)，它可以把一個 ngrok 的 subdomain 對應到你的電腦的某個 port。

# 使用步驟

1. 把 `public/index.html` 的 appId 換成你自己的
1. `node index.js`，讓 server 跑起來
2. `./ngrok http 5566`，讓 ngrok 跑起來，跑起來之後會告訴你一個網址
3. 假設你的網址是： `example.ngrok.io`，去 Facebook App 設定設置在：應用程式網域
4. 打開 `example.ngrok.io`，應該會跳出 Facebook 登入框（可能會被瀏覽器擋住，網址列那邊會有提示）
5. 打開 chrome dev tool，你會在 console 裡面找到你的 `access_token` 跟最上面提到的，第一筆 API 資料回傳的 `paging.next`
6. 這時候看你跑 `node index.js` 的那個 terminal，應該會開始輸出訊息表示正在抓取
7. 抓完之後，打開 `getUrl.js`
8. 把第 31 行的：`'https://z-m-graph.facebook.com/v2.8/' + post.id +'?fields=message,permalink_url&access_token=...'` 換成你自己的，這邊其實就是拿第 5 步你得到的`paging.next`來改就好，改成抓單一一個 post 的網址。
9. `node getUrl.js`
10. 結束，抓取完畢

# 注意事項

常數大多數都有定義好在檔案的開頭，例如說`DELAY`跟`PORT`，可以根據自己需求做修改。`index.js`我預設是只會抓貼文大於 500 字的動態，也記得要調整這邊。


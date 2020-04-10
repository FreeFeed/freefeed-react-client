### Search syntax

Use space-separated words to search texts with all of them: `freefeed version`  
Use double-quotes to search phrase with the specific word order: `"freefeed version"`  
Use the pipe symbol (`|`) between words to search _any_ of them: `freefeed | version`  
Use the minus sign (`-`) to exclude some word from search results: `freefeed -version`

By default the search is performed in the texts of posts and comments.

### Advanced operators

**from:**_user1,user2_ — limits search to posts authored by any of specified users: `cat from:alice`

**in:**_user1,group2_ — limits search to posts from any of specified users or groups feeds: `cat in:photo`

**group:**_group1,group2_ is an alias of **in:**: `cat group:catlovers`

**in-my:**_feed1,feed2_ — limits search to posts from the current user's personal feeds ("saves", "directs", "discussions" or "friends"): `cat in-my:saves`

**commented-by:**_user1,user2_ — limits search to posts commented by any of specified users: `cat commented-by:alice`

**liked-by:**_user1,user2_ — limits search to posts liked by any of specified users: `cat liked-by:alice`

**in-body:**_word1,word2_ — search any of specific words only in the post bodies: `in-body:cat in:catlovers`

**in-comments:**_word1,word2_ — search any of specific words only in the comment bodies: `in-comments:cat in:catlovers`

**author:**_user1,user2_ — search only in posts and comments authored by any of specified users: `cat author:alice`

&nbsp;

You can use _me_ instead of your own username in the operators above: `cat from:me`

---

Learn more at: [github.com/FreeFeed/freefeed-server/wiki/FreeFeed-Search](https://github.com/FreeFeed/freefeed-server/wiki/FreeFeed-Search)

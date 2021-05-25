(function (window, document) {
  //@@  页面性能收集 --首屏到达时间  --ajax响应时间
  //@@  页面性能监控 --错误捕获 ，异常捕获。
  //@@  页面崩溃，非加载白屏记录  js加载失败，文件缺失
  // 注入ajax一些收集操作
  //  window.performance.timing  时长收集和处理。
  // 跨域监控页面error的处理
  //  1.实现ajax所有相关

  // function sendErrorMsg(type, data) {
  //   // switch catch 组织各种类型的报错。
  //   //img.src = "http://localhost:3000/img/aaa?";
  //   imgLoad();
  // }
  function sendErrorMsg(src) {
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      console.log("success");
    };
    img.src = "http://localhost:3000/img/aaa?" + src;
  }

  var keepOpen = window.XMLHttpRequest.prototype.open,
    keepSend = window.XMLHttpRequest.prototype.send;
  function openReplaceMent(method, url, async, user, password) {
    this._url = url;
    this._method = method;
    return keepOpen.apply(this, arguments);
  }
  function sendReplaceMent(data) {
    this._data = data;
    if (this.onreadystatechange) {
      this._onreadystatechange = this.onreadystatechange;
    }

    this.onreadystatechange = onReadyStateChangeReplacement;
    return keepSend.apply(this, arguments);
  }

  function onReadyStateChangeReplacement(readyState, status) {
    //this.readyState === 4 && this.status === 200
    if (this.status != 200) {
      // ajax返回出错。
      //var isblobheader = this.getResponseHeader("content-type"); file流对象的传输要单独拎出来处理。
      var errorStr =
        "type:ajaxerror" +
          "&url=" +
          encodeURIComponent(this._url) +
          "&method=" +
          this._method +
          "&data=" +
          this._data || "";
      sendErrorMsg(errorStr);
    }

    if (this.readyState === 4 && this.status === 200) {
      var succStr =
        "type:ajaxsuccess" + "&url=" + this._url + "&method=" + this._method;
      sendErrorMsg(succStr);
    }
    // console.log(this.getResponseHeader("content-type")); //  这里处理非文件流的错误。
    if (this._onreadystatechange) {
      return this._onreadystatechange.apply(this, arguments);
    }
  }
  window.XMLHttpRequest.prototype.open = openReplaceMent;
  window.XMLHttpRequest.prototype.send = sendReplaceMent;

  //全局监听异常的功能  这个在dev阶段建议开启sourcemap
  window.onerror = function (errorMessage, scriptURI, lineNo, columnNo, error) {
    // 结论：如果想通过onerror函数收集不同域的js错误，我们需要做两件事：

    // 相关的js文件上加上Access-Control-Allow-Origin:*的response header
    // 引用相关的js文件时加上crossorigin属性
    console.log(errorMessage);
    var jsError =
      "type:jsError" +
      "&errorMessage=" + // 异常信息
      errorMessage +
      "&scriptURI=" + // 异常文件路径
      encodeURIComponent(scriptURI) +
      "&lineNo=" + // 异常行号
      lineNo +
      "&columnNo=" + // 异常列号
      columnNo +
      "&error=" + // 异常堆栈信息
      encodeURIComponent(error);
    sendErrorMsg(jsError);
  };

  //捕获静态资源加载问题，当然，他也可以做window.onerror 的事。
  window.addEventListener(
    "error",
    function (e) {
      var target = e.target || e.srcElement;
      var isElementTarget = target instanceof HTMLElement;
      if (!isElementTarget) return; // js error不再处理
      // console.log(event.target);
      var source = event.target;
      if (source.nodeName == "IMG") {
        console.log(source.src + "图片加载出错");
        sendErrorMsg(
          "type:imgLoadError&errorMessage=" + source.src + "图片加载出错"
        );
      }
      if (source.nodeName == "SCRIPT") {
        console.log(source.src + "SCRIPT加载出错");
        sendErrorMsg(
          "type:scriptLoadError&errorMessage=" + source.src + "SCRIPT加载出错"
        );
      }
    },
    true
  );
  // 捕获promise reject、时候没有处理器处理的异常
  window.addEventListener("unhandledrejection", (event) => {
    console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
  });

  // 把DOMContentLoaded作为首屏时间
  document.addEventListener("DOMContentLoaded", function () {
    console.log("3 seconds passed");
  });

  // pv统计--------------------------------------------------------------------------------------
  // 浏览器tab之间的切换。
  // 是否跳出，在非首页的页面可以根据history.length判断是否经过多重页面
  var hiddenTime = 0,
    againShowTime = 0;
  var justSurfaceOnePage = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenTime = new Date().getTime();
    } else {
      againShowTime = new Date().getTime();
      if (againShowTime - hiddenTime > 60000) {
        //大于一分钟回来算一次pv
        console.log("这次算一次pv");
      }
      // 判断假设是频繁的切tab则忽视,
      // 大于n秒则算一次pv
    }
    console.debug(document.hidden);
  });

  // hash路由和history路由
  let hres = window.location.href;
  if (hres.match("/#/")) {
    window.addEventListener(
      "hashchange",
      function (e) {
        console.log(e.oldURL);
        console.log(e.newURL);
      },
      false
    );
  } else {
    //重写history.pushstate和replacestate
    var historyPush = history.pushState;
    var historyReplace = history.replaceState;
    function myhistoryPush() {
      console.log(window.location.href); //上一次url pv
      console.log("进了pushstate方法");
      historyPush.apply(this, arguments);
      console.log(window.location.href); //下一次url pv
      //sendpv
    }
    function myhistoryReplace() {
      console.log(window.location.href); // 当前url pv    replacestate的替换要特别主意一下，并不是所有的replacestate成功都应当被计为pv，有时候内存的溢出或者js代码的error导致页面一直的刷新则不应当计算为一次pv，放置一个定时器，如果超3秒则算一次pv
      console.log("进了replaceState方法");
      historyReplace.apply(this, arguments);
      if (history.length > 1) {
        justSurfaceOnePage = false;
      }
      var isloopRefresh = setTimeout(function () {
        window.clearTimeout("isloopRefresh");
        //sendpv
        alert("此时算一次pv");
      }, 3000);
    }
    history.pushState = myhistoryPush;
    history.replaceState = myhistoryReplace;
  }

  // 海芽菜，金针菇，黄喉，毛肚，鸭肠，鸭胗，牛肉，羊肉，虾滑。花生酱芝麻酱沙茶酱
  /********************************************************** */

  window.addEventListener("beforeunload", logData, false); // 移动端 addEventListener('pagehide')

  function logData() {
    if (justSurfaceOnePage) {
      // 属于跳出用户
      alert(11111);
    }
    navigator.sendBeacon("/log", analyticsData);
  }

  setTimeout(function () {
    navigator.sendBeacon("http://localhost:3000/log", { aaa: 1 });
  }, 4000);
})(window, document, {});

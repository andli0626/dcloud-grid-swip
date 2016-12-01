/**
 * @description  页面工具类  基于plus系统,集合了各种页面的处理方式,支持mui和 原生plus
 * @author dailc
 * @version 1.0
 */
{
	/**
	 * @description创建一个用来页面操作相关的容器工厂
	 */
	var PageUtil = (function() {
		var FactoryObj = {};
		/**
		 * @description 是否调试模式
		 * @type {Boolean}
		 */
		var IsDebug = false;
		/*一个全局的对话框对象*/
		var mWaitingDialog = null;
		/**
		 * 是否能用,如果兼容性检测不通过,所有的功能都用不了
		 */
		var CanUseFlag = true;
		/**
		 * 是否plusready
		 */
		var IsPlusReady = false;
		/**
		 * 是否支持Mui,如果支持mui,默认使用mui的ajax请求
		 */
		var IsMuiSupport = true;
		/**
		 * 打开页面的类型
		 * 两种: 0:Native   1:Mui  如果mui不存在会默认使用原生
		 */
		var OpenPageType = 'Mui';
		var IncludeMuiJsName = 'mui.min.js';
		/**
		 * 默认的动画
		 * slide-in-right 或者 none
		 */
		var DefaultAnimation = 'none';
		/**
		 * 默认的waiting txt
		 */
		var DefaultWaitingTips = "正在载入中，请稍后";

		/**
		 * 默认的页面风格
		 */
		var DefaultPageStyle = {
			scrollIndicator: 'none',
			scalable: false,
			popGesture: "close"
		};
		/**
		 * @description 设置是否是调试模式
		 * @param {Boolean} isDebugFlag 是否调试模式
		 */
		FactoryObj.setIsDebug = function(isDebugFlag) {
			if (isDebugFlag != null && typeof(isDebugFlag) == 'boolean') {
				IsDebug = isDebugFlag;
			}
		};
		/**
		 * 设置MUI支持-如不支持mui,所有的mui操作都会采用兼容模式
		 * @param {Boolean} IsSupport 是否支持  必须在调用请求之前设置
		 */
		FactoryObj.setMuiSupport = function(IsSupport) {
			if (IsSupport == null || typeof(IsSupport) != 'boolean') {
				return;
			}
			IsMuiSupport = IsSupport;
		};
		/**
		 * @description 打开页面的类型
		 * @param {String} openPageType  两种: 0:Native   1:Mui  如果mui不存在会默认使用原生
		 */
		FactoryObj.setOpenPageType = function(openPageType) {
			if (openPageType != null && typeof(openPageType) == 'number' && parseInt(openPageType) >= 0 && parseInt(openPageType) <= 1) {
				if (openPageType == 0) {
					OpenPageType = 'Native';
				} else if (openPageType == 1) {
					OpenPageType = 'Mui';
				}
			}

		};
		/**
		 * @description 设置引用的js的名字
		 * @param {String} muiJSname  mui库的js 名称  默认为  mui.min.js
		 * 如果参数为null,代表使用默认值
		 */
		FactoryObj.setIncludeJsNames = function(muiJSname) {
			if (muiJSname != null && typeof(muiJSname) == "string" && muiJSname != "") {
				IncludeMuiJsName = muiJSname;
			}
		};
		/**
		 * @description 设置默认的动画
		 * @param {String} animationStr  默认为  none
		 * 如果参数为null,代表使用默认值
		 */
		FactoryObj.setDefaultAnimation = function(animationStr) {
			if (animationStr != null && typeof(animationStr) == "string" && animationStr != "") {
				DefaultAnimation = animationStr;
			}
		};
		/**
		 * @description 设置默认的等待提示
		 * @param {String} waitingTips  默认为  "正在载入中，请稍后"
		 * 如果参数为null,或者不为字符串,则不显示waiting
		 */
		FactoryObj.setDefaultWaitingTips = function(waitingTips) {
			DefaultWaitingTips = waitingTips;
		};
		/**
		 * @description 设置默认的页面样式
		 * @param {Object} defaultPageStyle
		 * 如果参数为null,代表使用默认值
		 */
		FactoryObj.setDefaultPageStyle = function(defaultPageStyle) {
			if (defaultPageStyle != null && defaultPageStyle != "") {
				DefaultPageStyle = defaultPageStyle;
			}
		};
		/**
		 * @description 判断是否存在js或者css
		 * @param {String} name js或者css文件的名字
		 */
		function IsInclude(name) {
			var js = /js$/i.test(name);
			var es = document.getElementsByTagName(js ? 'script' : 'link');
			for (var i = 0; i < es.length; i++)
				if (es[i][js ? 'src' : 'href'].indexOf(name) != -1) return true;
			return false;
		};
		/**
		 * @description 自定义弹出提醒,没有回调的
		 */
		function Myalert(title, message, btnTips) {
			if (IsPlusReady == true) {
				plus.nativeUI.alert(message, null, title, btnTips);
			} else {
				window.alert(message);
			}
		};
		/**
		 * @description 兼容性检测   是否缺失必须的引用文件
		 */
		function DetectionCompatible() {
			//如果没有必须的mui
			if (!IsInclude(IncludeMuiJsName)) {
				IsMuiSupport = false;
			}
			CanUseFlag = true;
		};
		/**
		 * @description 检查是否能用
		 */
		function CheckIsCanUse() {
			if (CanUseFlag == false) {
				if(IsDebug==true){
					Myalert('不能使用', '缺少必须文件!', '我知道了');
				}			
				return false;
			}
			if (IsPlusReady == false) {
				if(IsDebug==true){
					Myalert('plus尚未准备', 'plus尚未准备PageUtil', '我知道了');
				}	
				return false;
			}
			return true;
		};
		/**
		 * @description 对象的初始化函数 可以理解为构造
		 * 这里面执行这个对象的初始化
		 */
		function init() {
			IsPlusReady = true;
			//兼容性检测
			DetectionCompatible();
		};
		/**
		 * 开始静态模块函数
		 */
		if (window.plus) {
			//如果plus已经好了
			init();
		} else {
			//添加plusready监听
			document.addEventListener("plusready", init, false);
		}
		/**
		 * @description 以下是 工具类对象的 功能函数
		 * 显示已经存在的页面,如果页面不存在,则什么都不做
		 * @return true 成功显示  false 没有显示
		 */
		FactoryObj.showExistsPage = function(url) {
			if (CheckIsCanUse() == false) {
				return;
			}
			//先得到父界面
			var thePage = plus.webview.getWebviewById(url);
			if (!thePage) {
				//console.log('界面不存在，显示无效,Page:' + url);
				return false;
			}
			thePage.show();
			return true;
		};
		/**
		 * @description 给当前界面生成子页面
		 * @param {Array} subpages  所生成的子界面数组
		 * @param {Array} subpage_style 生成的子界面style
		 * @return 所有子界面字符串的拼接字符串，以","分割
		 */
		FactoryObj.generateSubPages = function(subpages, subpage_style, extraDatas) {
			if (CheckIsCanUse() == false) {
				return;
			}
			//页面显示动画，默认为 "slide-in-right"
			var aniShow = {};
			var allPagesStr = "";
			var self = plus.webview.currentWebview();
			for (var i = 0; i < subpages.length; i++) {
				//给allPagesStr赋值
				allPagesStr += subpages[i] + ","
				var temp = {};
				//防止style的长度和subpahes长度不一致
				var subStyle = i < subpage_style.length ? subpage_style[i] : subpage_style[0];
				var extraData = (extraDatas && extraDatas[i]) ? extraDatas[i] : (extraDatas && extraDatas[0] ? extraDatas[0] : {});
				////console.log('额外参数:'+JSON.stringify(extraData));
				var sub = plus.webview.create(subpages[i], subpages[i], subStyle, extraData);
				if (i > 0) {
					sub.hide();
				} else {
					if (OpenPageType == 'Mui') {
						temp[subpages[i]] = "true";
						mui.extend(DefaultAnimation, temp);
					} else {
						sub.show(DefaultAnimation);
					}
				}
				self.append(sub);
			}
			return allPagesStr;
		};
		/**
		 * @description 切换子界面 showPage和hidePage都必须是allPageStr的子页面
		 * @param {String} showPage
		 * @param {String} hidePage
		 * @param {String} allPagesStr 当前页面包含的所有子页面字符串
		 * @param {Function} successCallback(showPage) 成功打开后的回调,参数是showPage
		 */
		FactoryObj.changePageShow = function(showPage, hidePage, allPagesStr, successCallback) {
			if (CheckIsCanUse() == false) {
				return;
			}
			if (!allPagesStr || allPagesStr.indexOf(showPage) == -1 ||
				allPagesStr.indexOf(hidePage) == -1) {
				//console.log('要显示的界面，或者是要隐藏的界面不是子页面，打开无效!');
				return;
			}
			plus.webview.hide(hidePage);
			plus.webview.show(showPage);
			if (successCallback) {
				successCallback(showPage);
			}
		};
		/**
		 * @description 在指定位置创建webView
		 * @param {String} url
		 * @param {Function} openCallback
		 * @param {Function} closeBack
		 * @param {Object} extraData
		 * @param {Object} styleJson
		 */
		FactoryObj.createWithStyle = function(url, openCallback, closeBack, extraData, styleJson) {
			if (CheckIsCanUse() == false) {
				return;
			}
			extraData = (extraData != null && extraData != "") ? extraData : {};
			
			//如果已经存在对应id的页面,直接显示
			if (FactoryObj.showExistsPage(url) == true) {
				//console.log('已经存在的页面，不重新创建,直接打开!');
				return;
			}
			styleJson = (styleJson != null && styleJson != '') ? styleJson : DefaultPageStyle;
			var mmWindow = null;
			if (OpenPageType == 'Mui') {
				var aniShow = '';
				mmWindow = mui.openWindow({
					id: url,
					url: url,
					styles: styleJson,
					show: {
						aniShow: aniShow
					},
					waiting: {
						autoShow: false
					},
					extras: extraData
				});
			} else {
				mmWindow = plus.webview.create(url, url, styleJson, extraData);
			}
			if (DefaultWaitingTips != null && typeof(DefaultWaitingTips) == 'string') {
				mWaitingDialog = plus.nativeUI.showWaiting(DefaultWaitingTips);
			}
			mmWindow.addEventListener('loaded', function() { //页面加载完成后才显示
				mmWindow.show(DefaultAnimation);
				if(mWaitingDialog!=null){
					mWaitingDialog.close();
				}
				if (openCallback && typeof(openCallback) == 'function') {
					openCallback();
				}
			}, false);
			mmWindow.addEventListener('close', function() { //页面关闭后可再次打开
				if (closeBack && typeof(closeBack) == "function") {
					closeBack();
				}
				mmWindow = null;
			}, false);
			return mmWindow;
		};
		/**
		 * @description 在指定位置创建webView
		 * @param {String} url
		 * @param {Object} extraData
		 * @param {Function} openCallback
		 * @param {Function} closeBack
		 * @param {Object} top
		 * @param {Object} bottom
		 */
		FactoryObj.createWinTopBottom = function(url, extraData,openCallback, closeBack, top, bottom) {
			var mStyle = {
				scrollIndicator: 'none',
				popGesture: 'none',
				scalable: false,
				top: top,
				bottom: bottom
			};
			FactoryObj.createWithStyle(url, openCallback, closeBack, extraData, mStyle);
		};
		/**
		 * @description 正常的创建一个全屏webView
		 * @param {String} url
		 * @param {Object} extraData
		 * @param {Function} openCallback
		 * @param {Function} closeBack
		 */
		FactoryObj.createWin = function(url,extraData, openCallback, closeBack) {
			var mStyle = {
				scrollIndicator: 'none',
				popGesture: 'none',
				scalable: false,
				top: '0px',
				bottom: '0px'
			};
			FactoryObj.createWithStyle(url, openCallback, closeBack, extraData, mStyle);
		};
		/**
		 * @description 创建浮动窗口
		 * @param {String} url
		 * @param {Object} extraData
		 * @param {Function} openCallback
		 * @param {Function} closeBack
		 */
		FactoryObj.createFloatWin = function(url,extraData, openCallback, closeBack) {
			var mStyle = {
				scrollIndicator: 'none',
				popGesture: 'none',
				scalable: false,
				width: '80%',
				height: '80%',
				margin: "auto",
				background: "rgba(0,0,0,0.8)"
			};
			FactoryObj.createWithStyle(url, openCallback, closeBack, extraData, mStyle);
		};
		/**
		 * @description 调用页面的自定义事件
		 * @param {String} pageStr子页面的ID
		 * @param {String} refreshEventName refreshEventName 子页面的刷新方法，默认为"refresh"
		 * @param {JSON} extras额外的参数,json格式,默认为空
		 */
		FactoryObj.firePageEvent = function(pageStr, refreshEventName, extras) {
			if (CheckIsCanUse() == false) {
				return;
			}
			//先得到父界面
			var thePage = plus.webview.getWebviewById(pageStr);
			if (!thePage) {
				//console.log('界面不存在，调用无效,Page:' + pageStr);
				return;
			}
			refreshEventName = (refreshEventName != null && refreshEventName != "") ? refreshEventName : "refresh";
			if (OpenPageType == 'Mui') {
				mui.fire(thePage, refreshEventName, extras != null ? extras : {});
			} else {
				Myalert('错误', 'mui不存在,无法触发事件', '我知道了')
				return;
			}
		};
		return FactoryObj;
	}());
}
/**
 * @file 列表子页面的映射模板
 * @description Dom操作目前支持原生和Zepto库下的环境
 * 下拉刷新页面目前支持mui的运行库 与自定一下拉刷新
 * 注意: 自定义下拉刷新时(目前iOS不支持)  父页面上必须要有<div>刷新容器,而且父页面中要添加自定义的刷新脚本
 * 而且如果使用自定义下拉刷新,请不要使用mui-scroll-wrapper,mui-scroll 这些css,否则会造成样式冲突导致不能滑动
 * 注:mui的 下拉刷新没有要求,但是上拉刷新要对父页面有要求
 * 注:还有一种方法自定义下拉刷新--使用Mui自带的,但是通过css重新设置样式
 * 网络请求目前支持  mui封装的ajax 和原生ajax
 * @author dailc
 * @version 1.0
 */
{
	/**
	 * @description 创建一个列表子页面工厂
	 */
	var PullRefreshPageUtil = (function() {
		var FactoryObj = {};
		/*一个全局的对话框对象*/
		var mWaitingDialog = null;
		/**
		 * @description dom类型,是原声还是zepto还是 jquery(目前目前不支持)
		 * Native  Zepto  Jquery
		 */
		var GlobalDomOptionType = "Zepto";
		/**
		 * 点击事项类型,是click还是 tap(只有这两种形式)  Zepto时有效,用来解决部分机型的适配bug
		 */
		var ZeTapClicktype = 'tap';
		/**
		 * 网络请求类别
		 * NativeType1:原生默认的(XMLHttp请求)
		 * MuiDefault:mui默认的(必须mui存在时才有用)
		 */
		var NetRequestType = 'MuiDefault';
		/**
		 * 上拉加载更多的类别
		 * NativeType1:原生默认的(为一个加载更多的按钮)
		 * MuiDefault:mui默认的(必须mui存在时才有用)
		 */
		var pullUpRefreshType = 'MuiDefault';
		/**
		 * 上拉加载更多的提示  无法改变(上拉可以加载更多这个数据)
		 */
		var pullUpRefreshTipRefresh = '正在加载...';
		var pullUpRefreshTipNomoreData = '没有更多数据了';
		/**
		 * 下拉刷新的提示
		 */
		var pullDownRefreshTipDown = '下拉可以刷新';
		var pullDownRefreshTipOver = '释放立即刷新';
		var pullDownRefreshTipRefresh = '正在刷新';
		/**
		 * 引用的js的默认名称
		 */
		var IncludeMustacheJsName = 'mustache.min.js';
		var IncludeMuiJsName = 'mui.min.js';
		var IncludeZeptoJsName = 'zepto.min.js';
		var IncludeXMLHttpJsName = 'XMLHttpUtil.js';
		/**
		 * 一些列表有关的默认参数  函数默认都是null
		 */
		var mGetLitemplate = null; //模板  字符串或者是获得的函数
		var mGetUrl = null; //地址 字符串或者是获得的函数
		var mGetDataFunc = null; //获得数据的函数
		var mChangeResponseDataFunc = null; //改变数据
		var mGetDataOffLineFunc = null; //离线获取数据的函数
		var mRequestSuccessCallbackFunc = null; //成功回调
		var mPlusReadyCallbackFunc = null;
		var mOnItemClickCallbackFunc = null;
		//默认为给li标签添加标签
		//如果包含#,则为给对应的id监听
		//如果包含. 则为给class监听
		var mTargetListItemClickStr = 'li';
		var mListdataStr = 'listdata';
		var mPullrefreshStr = 'pullrefresh';
		var mRefreshEventName = 'refresh';
		var mChangeToltalCountFunc = null;
		var mIsRequestFirst = true;
		var mDefaultInitPageNum = 1;
		/**
		 * set方法 
		 */
		{
			/**
			 * @description 设置默认的列表数据首页
			 * @param {Object} DefaultInitPageNum 首页的index
			 * 例如 0或者1, 必须是数字类型
			 */
			FactoryObj.setDefaultInitPageNum = function(DefaultInitPageNum) {
				if (DefaultInitPageNum != null && typeof(DefaultInitPageNum) == 'number') {
					mDefaultInitPageNum = DefaultInitPageNum;
				}
			};
			FactoryObj.setIsRequestFirst = function(IsRequestFirst) {
				if (IsRequestFirst != null && typeof(IsRequestFirst) == 'boolean') {
					mIsRequestFirst = IsRequestFirst;
				}
			};
			FactoryObj.setTargetListItemClickStr = function(TargetListItemClickStr) {
				if (TargetListItemClickStr != null && typeof(TargetListItemClickStr) == 'string') {
					mTargetListItemClickStr = TargetListItemClickStr;
				}
			};
			FactoryObj.setChangeToltalCountFunc = function(ChangeToltalCountFunc) {
				if (ChangeToltalCountFunc == null || typeof(ChangeToltalCountFunc) == 'function') {
					//只能设置空值和函数
					mChangeToltalCountFunc = ChangeToltalCountFunc;
				}
			};
			FactoryObj.setRefreshEventName = function(RefreshEventName) {
				if (RefreshEventName != null && typeof(RefreshEventName) == "string" && RefreshEventName != "") {
					mRefreshEventName = RefreshEventName;
				}
			};
			FactoryObj.setPullrefreshIdStr = function(PullrefreshIdStr) {
				if (PullrefreshIdStr != null && typeof(PullrefreshIdStr) == "string" && PullrefreshIdStr != "") {
					mPullrefreshStr = PullrefreshIdStr;
				}
			};
			FactoryObj.setListdataIdStr = function(ListdataIdStr) {
				if (ListdataIdStr != null && typeof(ListdataIdStr) == "string" && ListdataIdStr != "") {
					mListdataStr = ListdataIdStr;
				}
			};
			FactoryObj.setOnItemClickCallback = function(OnItemClickCallback) {
				if (OnItemClickCallback == null || typeof(OnItemClickCallback) == 'function') {
					//只能设置空值和函数
					mOnItemClickCallbackFunc = OnItemClickCallback;
				}
			};
			FactoryObj.setPlusReadyCallback = function(PlusReadyCallback) {
				if (PlusReadyCallback == null || typeof(PlusReadyCallback) == 'function') {
					//只能设置空值和函数
					mPlusReadyCallbackFunc = PlusReadyCallback;
				}
			};
			FactoryObj.setRequestSuccessCallback = function(RequestSuccessCallback) {
				if (RequestSuccessCallback == null || typeof(RequestSuccessCallback) == 'function') {
					//只能设置空值和函数
					mRequestSuccessCallbackFunc = RequestSuccessCallback;
				}
			};
			FactoryObj.setChangeResponseDataFunc = function(ChangeResponseDataFunc) {
				if (ChangeResponseDataFunc == null || typeof(ChangeResponseDataFunc) == 'function') {
					//只能设置空值和函数
					mChangeResponseDataFunc = ChangeResponseDataFunc;
				}
			};
			FactoryObj.setGetOfflineDataFunc = function(GetDataOffLineFunc) {
				if (GetDataOffLineFunc == null || typeof(GetDataOffLineFunc) == 'function') {
					//只能设置空值和函数
					mGetDataOffLineFunc = GetDataOffLineFunc;
				}
			};
			FactoryObj.setGetDataFunc = function(GetDataFunc) {
				if (GetDataFunc == null || typeof(GetDataFunc) == 'function') {
					//只能设置空值和函数
					mGetDataFunc = GetDataFunc;
				}
			};
			FactoryObj.setGetUrl = function(GetUrl) {
				//为函数或者为字符串
				if (GetUrl != null) {
					if (typeof(GetUrl) == 'function' || typeof(GetUrl) == 'string') {
						mGetUrl = GetUrl;
					}
				}
			};
			FactoryObj.setGetLitemplate = function(GetLitemplate) {
				if (GetLitemplate != null) {
					if (typeof(GetLitemplate) == 'function' || typeof(GetLitemplate) == 'string') {
						mGetLitemplate = GetLitemplate;
					}
				}
			};
			/**
			 * @description 设置下拉刷新的提示信息
			 * @param {Object} contentdown 下拉的提示
			 * @param {Object} contentover 下拉超出的提示
			 * @param {Object} contentrefresh  刷新的提示
			 */
			FactoryObj.setPullDownRefreshTips = function(contentdown, contentover, contentrefresh) {
				if (contentdown != null && typeof(contentdown) == "string") {
					pullDownRefreshTipDown = contentdown;
				}
				if (contentover != null && typeof(contentover) == "string") {
					pullDownRefreshTipOver = contentover;
				}
				if (contentrefresh != null && typeof(contentrefresh) == "string") {
					pullDownRefreshTipRefresh = contentrefresh;
				}
			};
			/**
			 * @description 设置上拉加载更多的类别
			 * @param {Object} type
			 * 为0:NativeType1(自定义类别1)
			 * 1:MuiDefault(mui自带)
			 */
			FactoryObj.setPullUpRefreshType = function(type) {
				if (type == null || typeof(type) != 'number' || (parseInt(type) < 0 && parseInt(type) > 1)) {
					return;
				}
				if (type == 0) {
					pullUpRefreshType = 'NativeType1';
				} else if (type == 1) {
					pullUpRefreshType = 'MuiDefault';
				}
			};
			/**
			 * @description 设置上拉加载更多的提示信息
			 * @param {Object} contentrefresh  刷新的提示
			 * @param {Object} contentnomore 没有更多数据的提示
			 */
			FactoryObj.setPullUpRefreshTips = function(contentrefresh, contentnomore) {
				if (contentrefresh != null && typeof(contentrefresh) == "string") {
					pullUpRefreshTipRefresh = contentrefresh;
				}
				if (contentnomore != null && typeof(contentnomore) == "string") {
					pullUpRefreshTipNomoreData = contentnomore;
				}
			};
			/**
			 * @description 设置引用的js的名字
			 * @param {Object} mustacheJSname 模板映射文件的js名称 默认为mustache.min.js
			 * @param {Object} muiJSname  mui库的js 名称  默认为  mui.min.js
			 * @param {Object} zeptoJSname  zepto库的js 名  默认为  zepto.js
			 * @param {Object} xmlHttpJsName xmlHttp库的js名  默认为 XMLHttpUtil.js
			 * 如果参数为null,代表使用默认值
			 */
			FactoryObj.setIncludeJsNames = function(mustacheJSname, muiJSname, zeptoJSname, xmlHttpJsName) {
				if (mustacheJSname != null && typeof(mustacheJSname) == "string" && mustacheJSname != "") {
					IncludeMustacheJsName = mustacheJSname;
				}
				if (muiJSname != null && typeof(muiJSname) == "string" && muiJSname != "") {
					IncludeMuiJsName = muiJSname;
				}
				if (zeptoJSname != null && typeof(zeptoJSname) == "string" && zeptoJSname != "") {
					IncludeZeptoJsName = zeptoJSname;
				}
				if (xmlHttpJsName != null && typeof(xmlHttpJsName) == "string" && xmlHttpJsName != "") {
					IncludeXMLHttpJsName = xmlHttpJsName;
				}
			};
			/**
			 * @description 设置网络请求类别
			 * @param {Object} type
			 * 为0:NativeType1(自定义类别1)
			 * 1:MuiDefault(mui自带)
			 */
			FactoryObj.setNetRequestType = function(type) {
				if (type == null || typeof(type) != 'number' || (parseInt(type) < 0 && parseInt(type) > 1)) {
					return;
				}
				if (type == 0) {
					NetRequestType = 'NativeType1';
				} else if (type == 1) {
					NetRequestType = 'MuiDefault';
				}
			};
			/**
			 * @description 设置Dom操作类型支
			 * @param {Object} type
			 * 为0:原生Dom
			 * 1:Zepto
			 * 如果选了Zeoto 但是又没有Zeoto文件,会采用原生兼容模式
			 */
			FactoryObj.setDomOptionType = function(type) {
				if (type == null || typeof(type) != 'number' || (parseInt(type) < 0 && parseInt(type) > 1)) {
					return;
				}
				if (type == 0) {
					GlobalDomOptionType = "Native";
				} else if (type == 1) {
					GlobalDomOptionType = "Zepto";
				}
			};
			/**
			 * @description 设置Zepto Dom操作的参数  必须设置操作类型为Zepto后才有效
			 * @param {Object} clickTapType click 或者tap  否则无效（zepto时默认为tap）
			 */
			FactoryObj.setDomOptionZeptoParams = function(clickTapType) {
				if (clickTapType == null || (clickTapType != "click" && clickTapType != "tap")) {
					return;
				}
				ZeTapClicktype = clickTapType;
			};
		}
		/**
		 * 一些内部调用的函数
		 */
		{
			/**
			 * @description 判断是否存在js或者css
			 * @param {Object} name js或者css的名字
			 */
			FactoryObj.IsInclude = function(name) {
				var js = /js$/i.test(name);
				var es = document.getElementsByTagName(js ? 'script' : 'link');
				for (var i = 0; i < es.length; i++)
					if (es[i][js ? 'src' : 'href'].indexOf(name) != -1) return true;
				return false;
			};
		}
		/**
		 * @description 自定义弹出提醒,没有回调的
		 */
		function Myalert(title, message, btnTips) {
			if (window.plus) {
				plus.nativeUI.alert(message, null, title, btnTips);
			} else {
				window.alert(message);
			}
		};

		/**
		 * @description 先定义全局的dom操作函数，便于移植
		 * 通过id找寻dom对象
		 */
		function $Id(idName, targetObj) {
			targetObj = (targetObj != null && targetObj instanceof HTMLElement) ? targetObj : document;
			if (GlobalDomOptionType == "Zepto") {
				//return Zepto('#' + idName,ze(targetObj));
				return document.getElementById(idName);
			} else {
				//这个是原生的dom操作版本
				return targetObj.getElementById(idName);
			}

		};
		/**
		 * @description 先定义全局的dom操作函数，便于移植
		 * 通过class找寻dom对象
		 * Zepto操作返回的并不是dom对象,所以改为原生返回
		 */
		function $Class(className, targetObj) {
			targetObj = (targetObj != null && targetObj instanceof HTMLElement) ? targetObj : document;
			if (GlobalDomOptionType == "Zepto") {
				//return Zepto('.' + className,ze(targetObj));
				return targetObj.getElementsByClassName(className);
			} else {
				return targetObj.getElementsByClassName(className);
			}
		};
		/**
		 * @description 先定义全局的dom操作函数，便于移植
		 * 通过tag找寻dom对象
		 */
		function $Tag(tagName, targetObj) {
			targetObj = (targetObj != null && targetObj instanceof HTMLElement) ? targetObj : document;
			if (GlobalDomOptionType == "Zepto") {
				//return Zepto(tagName,ze(targetObj));
				return targetObj.getElementsByTagName(tagName);
			} else {
				return targetObj.getElementsByTagName(tagName);
			}
		};
		/**
		 * @description 得到子元素的个数  目标必须是html dom对象
		 */
		function getChildElemLength(targetObj) {
			if (!(targetObj instanceof HTMLElement)) {
				return 0;
			}
			if (GlobalDomOptionType == "Zepto") {
				return Zepto(targetObj).children().length;
			} else {
				return targetObj.children.length;;
			}
		};
		/**
		 * @description给html对象添加子元素
		 * @param {Object} targetObj
		 * @param {Object} childElem
		 */
		function appendHtmlChildCustom(targetObj, childElem) {
			if (targetObj == null || childElem == null) {
				return;
			}
			if (GlobalDomOptionType == "Zepto") {
				Zepto(targetObj).append(childElem);

			} else {
				//如果元素已经是dom对象
				if (childElem instanceof HTMLElement) {
					targetObj.appendChild(childElem);
				} else {
					//否则,创建dom对象然后添加
					var tmpDomObk = pareseStringToHtml(childElem);
					if (tmpDomObk != null) {
						targetObj.appendChild(tmpDomObk);
					}
				}
			}
		};
		/**
		 * @description 将string字符串转为html对象
		 * @param {Object} strHtml
		 */
		function pareseStringToHtml(strHtml) {
			if (strHtml == null || typeof(strHtml) != "string") {
				return null;
			}
			//创一个灵活的div
			var i, a = document.createElement("div");
			var b = document.createDocumentFragment();
			a.innerHTML = strHtml;
			while (i = a.firstChild) b.appendChild(i);
			return b;
		};
		/**
		 * @description 添加点击监听
		 */
		function addEventListenerCustomClick(targetObj, handle) {
			if (targetObj == null || handle == null || typeof(handle) != "function") {
				return;
			}
			if (GlobalDomOptionType == "Zepto") {
				//console.log('zepto监听');
				//如果是Zepto类型
				//console.log('zepto:'+ZeTapClicktype);
				Zepto(targetObj).off(ZeTapClicktype);
				Zepto(targetObj).on(ZeTapClicktype, handle);
			} else {
				//原生
				//console.log('原生监听');
				if (plus.os.name == "iOS") {
					//ios上必须监听 touchend
					addEventListenerCustom('touchend', handle, targetObj);
				} else {
					addEventListenerCustom('click', handle, targetObj);
				}

			}
		};
		/**
		 * @description 添加监听
		 * @param {Object} eventName 事件名 如果不存在则监听无效
		 * @param {Object} handle  处理函数,如果为空,则不添加监听
		 * @param {Object} targetObj 目标对象,如果不存在,则默认为document
		 */
		function addEventListenerCustom(eventName, handle, targetObj) {
			//如果不符合规范
			if (
				(eventName == null || typeof(eventName) != "string") ||
				(handle == null || typeof(handle) != "function")
			) {
				return;
			}
			targetObj = (targetObj != null) ? targetObj : document;
			//先取消监听
			targetObj.removeEventListener(eventName, handle, false);
			targetObj.addEventListener(eventName, handle, false);
		};
		/**
		 * @description 判断dom对象是否有class
		 * @param {Object} dom dom对象
		 * @param {Object} className  css的class名
		 */
		function $hasClass(dom, className) {
			className = className.replace(/^\s|\s$/g, "")

			return (
				" " + ((dom || {}).className || "").replace(/\s/g, " ") + " "
			).indexOf(" " + className + " ") >= 0
		};
		/**
		 * @description 判断网络状态
		 */
		function GetNetWorkState() {
			var NetStateStr = '未知';
			if (CheckIsCanUse(true) == false) {
				return;
			}
			var types = {};
			types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
			types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
			types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
			types[plus.networkinfo.CONNECTION_WIFI] = "WiFi网络";
			types[plus.networkinfo.CONNECTION_CELL2G] = "2G蜂窝网络";
			types[plus.networkinfo.CONNECTION_CELL3G] = "3G蜂窝网络";
			types[plus.networkinfo.CONNECTION_CELL4G] = "4G蜂窝网络";
			NetStateStr = types[plus.networkinfo.getCurrentType()];

			return NetStateStr;
		};
		/**
		 * @description 判断是否有网络
		 */
		function IsNetWorkCanUse() {
			var IsCanUseNetWork = false;
			if (GetNetWorkState() == '未知' || GetNetWorkState() == '未连接网络') {
				IsCanUseNetWork = false;
			} else {
				IsCanUseNetWork = true;
			}
			return IsCanUseNetWork;
		};
		/**
		 * @description 检查是否能用
		 * @param {Object} checkPlus 是否检查plus
		 * @param {Object} checkZepto  是否检查Zepto
		 */
		function CheckIsCanUse(checkPlus, checkZepto) {
			if (checkPlus != null && checkPlus == true) {
				if (!window.plus) {
					Myalert('plus尚未准备', 'plus尚未准备ImageUtil', '我知道了');
					return false;
				}
			}
			if (checkZepto != null && checkZepto == true) {
				if (FactoryObj.IsInclude(IncludeZeptoJsName) == false) {
					Myalert('不能使用', '未引用Zepto库文件:' + IncludeZeptoJsName, '我知道了');
					return false;
				}
			}
			return true;
		};
		/**
		 * @description 创建下拉刷新界面的模板
		 * 如果有自定义的设置,请设置完所有参数后再创建刷新模板
		 * 传进来每一个list里的自定义参数,前四个参数不可省略,后面的参数可以省略,代表没有操作，采用默认值
		 * 或者通过方法设置
		 * 模板能用的参数是: JOSN数组型
		 * 要求:接口返回的JSON里必须有TotalCount这一项,否则默认最多显示100项
		 * @param {String||Function} getLitemplate界面默认的映射模板，必须要,为字符串模板或者是返回函数
		 * @param {Function||String} getUrl请求数据时的地址
		 * @param {Function} getData(CurrPage):请求数据时的参数,其中CurrPage为当前的请求页码,格式:{param1:xx,param2:xx}每一次刷新界面，就会回调这个函数
		 * @param {Function} changeResponseData(response): 回调函数，处理返回数据，返回一个模板能用的格式,能用格式JSON数组:Data[{},{}]可以为空，代表不处理
		 * @param {Function} requestSuccessCallback:ajax请求成功后的回调
		 * @param {Function} plusReadyCallback():当模板里面的plusReady函数运行后返回的一个回调，可以为空 ---只有plus系统才会回调，否则不执行
		 * @param {Function} onClickCallback($this):list列表的点击回调(给默认给"li"控件)，对应的Item对象指向，引用,可以为空(如果为空，则不添加点击事件)
		 * @param {String} listdataStr:本界面的数据容器的Id,默认为"listdata",""代表默认
		 * @param {String} pullrefreshStr:本界面的下拉刷新容器的ID，默认为"pullrefresh"，省略或者""代表默认
		 * @param {String} refreshEventName:本界面的刷新事件的名字，默认为"refresh"
		 * @param {Function} changeToltalCount(toltalcount):改变toltalcount
		 * @param {Object} IsRequestFirst  是否创建时请求数据 默认为true
		 * @param {Object} defaultInitPageNum  默认的 列表请求的首页(从0页开始或者是1页开始) 默认为1
		 */
		FactoryObj.createSubListPageTemplate = function(getLitemplate, getUrl, getData, changeResponseData, requestSuccessCallback, plusReadyCallback, onItemClickCallback, listdataStr, pullrefreshStr, refreshEventName, changeToltalCount, IsRequestFirst, defaultInitPageNum) {
			//兼容性检测
			if (getLitemplate != null) {
				mGetLitemplate = getLitemplate;
			}
			if (getUrl != null) {
				mGetUrl = getUrl;
			}
			if (getData != null) {
				mGetDataFunc = getData;
			}
			if (changeResponseData != null) {
				mChangeResponseDataFunc = changeResponseData;
			}
			if (requestSuccessCallback != null) {
				mRequestSuccessCallbackFunc = requestSuccessCallback;
			}
			if (plusReadyCallback != null) {
				mPlusReadyCallbackFunc = plusReadyCallback;
			}
			if (onItemClickCallback != null) {
				mOnItemClickCallbackFunc = onItemClickCallback;
			}
			if ((listdataStr != null && typeof(listdataStr) == "string" && listdataStr != "")) {
				mListdataStr = listdataStr;
			}
			if (pullrefreshStr != null && typeof(pullrefreshStr) == "string" && pullrefreshStr != "") {
				mPullrefreshStr = pullrefreshStr;
			}
			if (refreshEventName != null && typeof(refreshEventName) == 'string' && refreshEventName != "") {
				mRefreshEventName = refreshEventName;
			}
			if (changeToltalCount != null) {
				mChangeToltalCountFunc = changeToltalCount;
			}
			if (IsRequestFirst != null && typeof(IsRequestFirst) == 'boolean') {
				mIsRequestFirst = IsRequestFirst;
			}
			if (defaultInitPageNum != null && typeof(defaultInitPageNum) == 'number') {
				mDefaultInitPageNum = defaultInitPageNum;
			}
			if (mGetLitemplate == null || mGetUrl == null || mChangeResponseDataFunc == null || typeof(mChangeResponseDataFunc) != 'function') {
				var errorTips = '错误,必要参数错误!';
				Myalert('错误', errorTips, '我知道了');
				return;
			}
			if (!FactoryObj.IsInclude(IncludeMustacheJsName)) {
				var errorTips = '错误,没有引入模板映射文件' + IncludeMustacheJsName + '!';
				Myalert('错误', errorTips, '我知道了');
				return;
			}
			if (!FactoryObj.IsInclude(IncludeMuiJsName)) {
				var errorTips = '错误,没有引入mui库' + IncludeMuiJsName + '!';
				Myalert('错误', errorTips, '我知道了');
				return;
			}
			if (!FactoryObj.IsInclude(IncludeZeptoJsName)) {
				//如果不存在Zepto
				FactoryObj.setDomOptionType(0);
			}
			/**
			 * 如果不存在网络请求工具,不能正常运行
			 */
			if (
				NetRequestType != 'MuiDefault' && !FactoryObj.IsInclude(IncludeXMLHttpJsName)) {
				var errorTips = '错误,没有引入网络请求js\n1.引入' + IncludeXMLHttpJsName + '!\n2.引入mui.min.js,并设置mui支持!';
				Myalert('错误', errorTips, '我知道了');
				return;
			}
			/**
			 * 下拉刷新容器的dom对象
			 */
			var pullRefreshContainer = $Id(mPullrefreshStr);
			/**
			 * 显示列表数据的容器的id
			 */
			var respnoseEl = $Id(mListdataStr);
			/**
			 * 设置的下拉刷新后延迟访问时间，单位为毫秒
			 */
			var delyTime = 100;
			/**
			 * 默认的超时请求时间
			 */
			var requestTimeOut = 15000;
			/**
			 * 是否下拉刷新的标识
			 */
			var flag = true;
			/**
			 * 是否上拉加载更多
			 */
			var IsPullUpLoadmoreShow = true;
			/**
			 * 当前的请求页码
			 */
			var CurrPage = mDefaultInitPageNum - 1;
			/**
			 * 总共显示的数目，默认为0,后续可从接口获得
			 */
			var totalCount = 0;
			/**
			 * 定义下拉加载更多按钮的html语句
			 */
			var loadMoreBtnStr = '<button class="noborder loadmore" style="font-size: 17px;display: block;width: 100%;margin-bottom: 10px;padding: 15px 0;  background-color: #fff;  color: #333;border: 1px solid #ccc;">点击加载更多</button>';
			/**
			 * 定义加载动画
			 */
			var loadingAnimationStr = '<div class="loadingAnimation" style="padding: 5px 0 5px 9px; text-align: center;">' + pullUpRefreshTipRefresh + '</div>';
			/**
			 * 定义没有更多数据的显示
			 */
			var noMoreDataTipStr = '<div class="noMoreData"style="z-index: 2;padding: 5px 0 5px 9px; text-align: center;">' + pullUpRefreshTipNomoreData + '</div>';
			/**
			 * plus是否可用的标识
			 */
			var IsPlusAready = false;
			/**
			 * 是否正在加载更多,重复
			 */
			var IsLoadingMore = false;
			//如果支持mui
			//如果下拉刷新为mui自带
			/**
			 * @description mui的init方法，执行一些初始化操作
			 */
			if (pullUpRefreshType == 'MuiDefault') {
				//如果是mui默认的加载更多
				mui.init({
					pullRefresh: {
						container: pullRefreshContainer,
						down: {
							contentdown: pullDownRefreshTipDown, //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
							contentover: pullDownRefreshTipOver, //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
							contentrefresh: pullDownRefreshTipRefresh, //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
							callback: pulldownRefresh
						},
						up: {
							contentrefresh: pullUpRefreshTipRefresh, //可选，正在加载状态时，上拉加载控件上显示的标题内容
							contentnomore: pullUpRefreshTipNomoreData, //可选，请求完毕若没有更多数据时显示的提醒内容；
							callback: pullupRefresh //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
						}
					}
				});
			} else {
				//如果采用的是原生的加载更多
				mui.init({
					pullRefresh: {
						container: pullRefreshContainer,
						down: {
							contentdown: pullDownRefreshTipDown, //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
							contentover: pullDownRefreshTipOver, //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
							contentrefresh: pullDownRefreshTipRefresh, //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
							callback: pulldownRefresh
						}
					}
				});
			}
			if (window.plus) {
				//如果plus已经好了
				initData();
			} else {
				//添加plusready监听
				document.addEventListener("plusready", initData, false);
			}

			/**
			 * @description 初始化,plusready才会调用的  plusReady时IsPlus为true
			 */
			function initData() {
				IsPlusAready = true;
				if (mPlusReadyCallbackFunc && typeof(mPlusReadyCallbackFunc) == "function") {
					mPlusReadyCallbackFunc();
				}
				if (mIsRequestFirst == true) {
					if (pullUpRefreshType == 'MuiDefault') {
						//必须进行一定的延迟
						setTimeout(function() {
							if (IsLoadingMore == false) {
								CurrPage = mDefaultInitPageNum - 1;
								mui(pullRefreshContainer).pullRefresh().pullupLoading();
								IsLoadingMore = true;
							}
						}, 1000);
					} else {
						pulldownRefresh();
						resetLoadingUi(true);
					}
				}
				InitAllEventListeners();
			};
			/**
			 * @description 下拉刷新函数
			 */
			function pulldownRefresh() {
				//清空list-
				if (respnoseEl != null) {
					respnoseEl.innerHTML = '';
				} else {
					var errorTips = '列表数据容器传入错误!';
					Myalert('错误', errorTips, '我知道了');
				}
				//如果现在已经是没有更多数据,重置下拉加载更多
				if (pullUpRefreshType == 'MuiDefault' && IsPullUpLoadmoreShow == false) {
					mui(pullRefreshContainer).pullRefresh().endPulldownToRefresh();
					mui(pullRefreshContainer).pullRefresh().refresh(true);
					if (IsLoadingMore == false) {
						CurrPage = mDefaultInitPageNum - 1;
						mui(pullRefreshContainer).pullRefresh().pullupLoading();
						IsLoadingMore = true;
					}
				} else {
					flag = true;
					CurrPage = mDefaultInitPageNum;
					//延迟delyTime毫秒访问
					setTimeout(function() {
						ajaxRequest();
					}, delyTime);
				}
			};
			/**
			 * @description 上拉加载更多函数
			 */
			function pullupRefresh() {
				IsLoadingMore = true;
				CurrPage++;
				flag = false;
				setTimeout(function() {
					ajaxRequest();
				}, delyTime);
			};
			/**
			 * @description 请求超时的处理
			 */
			function errorRequestCallback() {
				if (IsPlusAready == true) {
					plus.nativeUI.toast('请求超时,请检查网络连接...')
				}
				CurrPage--;
				CurrPage = CurrPage >= 0 ? CurrPage : 0;
				resetLoadingUi(false);
			};
			/**
			 * @description ajax 异步请求数据
			 */
			function ajaxRequest() {
				if (mGetUrl == null) {
					//console.log('url或者getData为空，或getData(CurrPage)不存在,访问无效');
					resetLoadingUi(false);
					return;
				}
				var requestData = {};
				if (mGetDataFunc == null || typeof(mGetDataFunc) != "function") {
					//如果没有数据
				} else {
					requestData = mGetDataFunc(CurrPage);
				}

				var url = "";
				if (typeof(mGetUrl) == "function") {
					url = mGetUrl();
				} else {
					url = mGetUrl;
				}
				if (IsNetWorkCanUse() == true) {
					//如果网络能用
					if (NetRequestType == "MuiDefault") {
						//如果支持mui
						mui.ajax(url, {
							data: requestData,
							dataType: "json",
							timeout: requestTimeOut,
							type: "POST",
							success: successRequest,
							error: errorRequestCallback
						});
					} else {
						/*否则采用原生的XMLHttp请求
						 目前原生的XMLHttp 请求类型支持 Get和POST  数据类型支持  JSON 和String
						 * */
						XMLHttpUtil.ajax(url, requestData, successRequest, errorRequestCallback, "POST", "json", requestTimeOut);
					}
				} else {
					//如果网络不能用
					getDataOffLine(url,requestData);				
				}

			};
			/**
			 * @description 离线获取数据
			 * @param {Object} url
			 * @param {Object} data
			 */
			function getDataOffLine(url,data){			
				if(mGetDataOffLineFunc!=null&&typeof(mGetDataOffLineFunc)=='function'){
					//离线获取的数据
					var responseData = mGetDataOffLineFunc(url,data);
					successRequest(responseData);
				}else{
					plus.nativeUI.toast('没有网络!');
				}
				resetLoadingUi(false);
			};
			/**
			 * @description 请求成功后的处理
			 * 针对的接口返回数据  如果不合法返回null,不进行处理  response
			 */
			function successRequest(response) {
				if (response) {
					//如果存在TotalCount,则用对应的，否则用默认数据
					totalCount = response.TotalCount != null ? response.TotalCount : totalCount;
					//console.log('当前页:'+CurrPage+',默认页:'+mDefaultInitPageNum);
					if (CurrPage == mDefaultInitPageNum) {
						//下拉刷新时,清空html
						if (respnoseEl != null) {
							respnoseEl.innerHTML = '';
						} else {
							var errorTips = '列表数据容器传入错误!';
							Myalert('错误', errorTips, '我知道了');
						}
					}
					//改变数据格式,一般 response数据会手动进过一层过滤,所以我们只允许过滤成JSON数据的情况
					if (mChangeResponseDataFunc && typeof(mChangeResponseDataFunc) == "function") {
						response = mChangeResponseDataFunc(response);
					}
					if (mChangeToltalCountFunc && typeof(mChangeToltalCountFunc) == "function") {
						totalCount = mChangeToltalCountFunc(totalCount);
					}
					if (response && response.length > 0) {
						var outList = '';
						for (var i = 0; i < response.length; i++) {
							var value = response[i];
							//默认模版
							var litemplate = "";
							if (mGetLitemplate) {
								if (typeof(mGetLitemplate) == "string") {
									//如果模板是字符串
									litemplate = mGetLitemplate;
								} else if (typeof(mGetLitemplate) == "function") {
									//如果模板是函数
									litemplate = mGetLitemplate(value);
								}
							}
							var output = Mustache.render(litemplate, value);
							outList += output;
						}
						if (outList != "") {
							appendHtmlChildCustom(respnoseEl, outList);
						}
					}
				} else {
					if (IsPlusAready == true) {
						plus.nativeUI.toast('请求数据失败...');
					}
				}
				/*处理完数据后的逻辑*/
				resetLoadingUi(false); //重设ui
				//成功后的回调方法
				if (mRequestSuccessCallbackFunc && typeof(mRequestSuccessCallbackFunc) == "function") {
					//如果回调函数存在
					mRequestSuccessCallbackFunc(response);
				}
				//设置元素监听
				setElemListeners();
			};
			/*
			 * @description 点击更多的监听函数
			 */
			function clickMoreListener(e) {
				console.log('点击更多');
				resetLoadingUi(true);
				pullupRefresh();
			};
			/**
			 * @description 设置监听
			 */
			function setElemListeners() {
				/**
				 * @description 给点击加载更多提供loadin监听
				 * $class返回的是数组,所以给第一个监听
				 */
				addEventListenerCustomClick($Class('loadmore', respnoseEl)[0], clickMoreListener);
				if (mOnItemClickCallbackFunc && typeof(mOnItemClickCallbackFunc) == "function") {
					/**
					 * @description 给数据列表添加点击事件,只有点击回调存在才添加点击事件
					 * 默认为给 'li' 控件添加
					 * 个每一个列表监听
					 */
					var liObjList = null;
					if (mTargetListItemClickStr.indexOf('.') != -1) {
						//去除class
						mTargetListItemClickStr = mTargetListItemClickStr.replace(/\./g, '');
						liObjList = $Class(mTargetListItemClickStr, respnoseEl);
					} else {
						liObjList = $Tag(mTargetListItemClickStr, respnoseEl);
					}

					for (var i = 0; i < liObjList.length; i++) {
						//兼容原生的取消监听,取消时传入的对象必须是和监听时的同一个
						addEventListenerCustomClick(liObjList[i], mOnItemClickCallbackFunc);
					}
				}
			};
			/**
			 * @description 刷新Ui显示状态
			 */
			function resetLoadingUi(flagUI) {

				//如果是原生的加载更多类别1
				if (pullUpRefreshType == 'NativeType1') {
					//先移除加载更多按钮
					var moreBtn = $Class('loadmore', respnoseEl);
					if (moreBtn.length > 0) {
						for (var i = 0; i < moreBtn.length; i++) {
							moreBtn[i].parentNode.removeChild(moreBtn[i]);
						}
					}
					//移除没有更多数据按钮
					var noMoreDataTip = $Class('noMoreData', respnoseEl);
					if (noMoreDataTip.length > 0) {
						for (var i = 0; i < noMoreDataTip.length; i++) {
							noMoreDataTip[i].parentNode.removeChild(noMoreDataTip[i]);
						}
					}
					//移除loading
					var loadingAnimation = $Class('loadingAnimation', respnoseEl);
					if (loadingAnimation.length > 0) {
						for (var i = 0; i < loadingAnimation.length; i++) {
							loadingAnimation[i].parentNode.removeChild(loadingAnimation[i]);
						}
					}
					if (flagUI == true) {
						//添加loading
						appendHtmlChildCustom(respnoseEl, loadingAnimationStr);
					} else {
						var itemLength = getChildElemLength(respnoseEl);
						//console.log('当前数目:'+itemLength+',总共:'+totalCount);
						if (itemLength >= totalCount) {
							//没有更多数据  目前注释掉了
							//console.log('没有更多数据');
							if (pullUpRefreshTipNomoreData != '') {
								//如果没有更多数据不为空
								appendHtmlChildCustom(respnoseEl, noMoreDataTipStr);
							}

						} else {
							//加载更多
							appendHtmlChildCustom(respnoseEl, loadMoreBtnStr);
						}
					}
				} else if (pullUpRefreshType == 'MuiDefault') {

					if (flagUI == true) {

					} else if (flag == false || (IsLoadingMore == true && flag == true)) {
						//mui的加载更多类型						
						//如果正在加载更多,而且这是触发了下拉刷新,修复不正常的加载
						//console.log('修复加载更多:flag:'+flag+',IsLoadingMore:'+IsLoadingMore);
						var itemLength = getChildElemLength(respnoseEl);
						//console.log('toltalcount:' + totalCount);
						if (itemLength >= totalCount) {
							//没有更多数据 true表示没有更多数据了
							//console.log('变为没有更多数据:flag:' + flag + ',flagui:' + flagUI);
							mui(pullRefreshContainer).pullRefresh().endPullupToRefresh(true);
							//布尔变量为不显示上拉加载更多了
							IsPullUpLoadmoreShow = false;
						} else {
							IsPullUpLoadmoreShow = true;
							//console.log('变为加载更多:flag:' + flag + ',flagui:' + flagUI);
							mui(pullRefreshContainer).pullRefresh().endPullupToRefresh(false);
						}
					}
				}
				if (flag == true && flagUI == false) {
					//结束下拉刷新
					//console.log('结束下拉刷新:flag:' + flag + ',flagui:' + flagUI);
					mui(pullRefreshContainer).pullRefresh().endPulldownToRefresh();
				}
				//关闭对话框
				if (IsPlusAready == true && flagUI == false) {
					if (mWaitingDialog != null) {
						mWaitingDialog.close();
					}
				}
				IsLoadingMore = false;
			};
			//原生监听不支持匿名函数,之所以不直接用function 是因为function会默认执行一遍构造
			FactoryObj.funcRefresh = function(event) {
				if (respnoseEl != null) {
					respnoseEl.innerHTML = '';
				} else {
					var errorTips = '列表数据容器传入错误!';
					Myalert('错误', errorTips, '我知道了');
				}
				if (pullUpRefreshType == 'MuiDefault') {
					if (IsLoadingMore == false) {
						CurrPage = mDefaultInitPageNum - 1;
						mui(pullRefreshContainer).pullRefresh().pullupLoading();
						IsLoadingMore = true;
					}
				} else {
					CurrPage = mDefaultInitPageNum;
					pulldownRefresh();
					resetLoadingUi(true);
				}
			};
			/**
			 * @description 添加事件监听
			 */
			function InitAllEventListeners() {
				addEventListenerCustom(mRefreshEventName, FactoryObj.funcRefresh);
			};
		};

		return FactoryObj;
	}());
}
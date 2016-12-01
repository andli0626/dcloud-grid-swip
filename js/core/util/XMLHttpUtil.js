/**
 * @description  自己写的ajax方法工厂,支持离线缓存的读取
 * 同时兼容plus与非plus  与mui.ajax
 * 目前优先使用mui的ajax
 * @author dailc
 * @version 1.0
 */
var XMLHttpUtil = (function() {
	/**
	 * @description 是否调试模式
	 * @type {Boolean}
	 */
	var IsDebug = false;
	/**
	 * 是否支持Mui,如果支持mui,默认使用mui的ajax请求
	 */
	var IsMuiSupport = true;
	var IsZeptoSupport = true;
	var IncludeZeptoJsName = 'zepto.min.js';
	var IncludeMuiJsName = 'mui.min.js';
	var xmlHttpObj = {};
	var XMLHttpReq;
	var IsPlusReady = false;
	var DataType = 'JSON';
	var successCallback, errorCallback;
	//离线获取数据的函数
	var mGetDataOffLineFunc = null;
	var IsPriorityMuiRequest = true;
	/**
	 * @description 判断是否存在js或者css
	 * @param {Object} name js或者css文件的名字
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
		if (!IsInclude(IncludeZeptoJsName)) {
			IsZeptoSupport = false;
		}
	};
	/**
	 * @description 检查是否能用
	 * @param {Object} checkPlus 是否检查plus
	 * @param {Object} checkZepto  是否检查Zepto
	 */
	function CheckIsCanUse(checkPlus, checkMui, checkZepto) {
		if (checkPlus != null && checkPlus == true) {
			if (IsPlusReady == false) {
				if(IsDebug==true){
					Myalert('plus尚未准备', 'plus尚未准备ImageUtil', '我知道了');
				}		
				return false;
			}
		}
		if (checkZepto != null && checkZepto == true) {
			if (IsZeptoSupport == false) {
				if(IsDebug==true){
					Myalert('不能使用', '未引用Zepto库文件:' + IncludeZeptoJsName, '我知道了');
				}	
				return false;
			}
		}
		if (checkMui != null && checkMui == true) {
			if (IsMuiSupport == false) {
				if(IsDebug==true){
					Myalert('不能使用', '未引用Mui库文件:' + IncludeMuiJsName, '我知道了');
				}	
				return false;
			}
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
	 * set方法 
	 */
	{
		/**
		 * @description 设置是否是调试模式
		 * @param {Boolean} isDebugFlag 是否调试模式
		 */
		xmlHttpObj.setIsDebug = function(isDebugFlag) {
			if (isDebugFlag != null && typeof(isDebugFlag) == 'boolean') {
				IsDebug = isDebugFlag;
			}
		};
		/**
		 * @description 设置获取离线数据的函数
		 * @param {Function} GetDataOffLineFunc
		 */
		xmlHttpObj.setGetOfflineDataFunc = function(GetDataOffLineFunc) {
			if (GetDataOffLineFunc == null || typeof(GetDataOffLineFunc) == 'function') {
				//只能设置空值和函数
				mGetDataOffLineFunc = GetDataOffLineFunc;
			}
		};
		/**
		 * @description 设置引用的js的名字 如果参数为null,代表使用默认值
		 * @param {String} muiJSname  mui库的js 名称  默认为  mui.min.js
		 * @param {String} zeptoJSname  zepto库的js 名称  默认为  zepto.min.js
		 * 
		 */
		xmlHttpObj.setIncludeJsNames = function(muiJSname, zeptoJSname) {
			if (muiJSname != null && typeof(muiJSname) == "string" && muiJSname != "") {
				IncludeMuiJsName = muiJSname;
			}
			if (zeptoJSname != null && typeof(zeptoJSname) == "string" && zeptoJSname != "") {
				IncludeZeptoJsName = zeptoJSname;
			}
		};
		/**
		 * 设置优先MUI请求,如果设置,会优先用mui的ajax
		 * @param {Boolean} IsPriorityMuiRequest 是否支持  必须在调用请求之前设置
		 */
		xmlHttpObj.setPriorityMuiRequest = function(IsPriorityMui) {
			if (IsPriorityMui == null || typeof(IsPriorityMui) != 'boolean') {
				return;
			}
			IsPriorityMuiRequest = IsPriorityMui;
		};
	}

	function createXMLHttpRequest() {
		try {
			XMLHttpReq = new ActiveXObject("Msxml2.XMLHTTP")
		} catch (E) {
			try {
				XMLHttpReq = new ActiveXObject("Microsoft.XMLHTTP")
			} catch (E) {
				if (IsPlusReady == true) {
					XMLHttpReq = new plus.net.XMLHttpRequest
				} else {
					XMLHttpReq = new XMLHttpRequest()
				}
			}
		}
	};

	function processResponse() {
		if (XMLHttpReq == null) {
			return
		}
		if (XMLHttpReq.readyState == 4) {
			if (XMLHttpReq.status == 200) {
				var respText = XMLHttpReq.responseText;
				var respXml = XMLHttpReq.responseXML;
				respText = window.decodeURI(respText);
				var resultValue = null;
				if (DataType == "JSON") {
					try {
						resultValue = JSON.parse(respText)
					} catch (e) {}
				} else {
					resultValue = respText
				}
				if (successCallback && typeof(successCallback) == "function") {
					successCallback(resultValue)
				}
			} else {
				console.log('请求错误:' + XMLHttpReq.status);
				if (errorCallback && typeof(errorCallback) == "function") {
					errorCallback(XMLHttpReq.status)
				}
			}
		}
	};
	/**
	 * @description 获取离线数据 
	 */
	xmlHttpObj.getOfflineData = function(url, data) {
		if (mGetDataOffLineFunc != null && typeof(mGetDataOffLineFunc) == 'function') {
			//离线获取的数据
			var responseData = mGetDataOffLineFunc(url, data);
			if (successCallback && typeof(successCallback) == "function") {
				//console.log('离线数据:'+JSON.stringify(responseData));
				successCallback(responseData)
			}
		} else {
			if (errorCallback && typeof(errorCallback) == "function") {
				errorCallback('没有网络!');
			}
		}
	};
	xmlHttpObj.ajax = function(url, data, success, error, type, dataType, timeOut) {
		DataType = (dataType && typeof(dataType) == 'string' && (dataType.toUpperCase() == 'JSON' || dataType.toUpperCase() == 'STRING')) ? dataType.toUpperCase() : DataType;
		timeOut = (timeOut && typeof(timeOut) == "number" && parseInt(timeOut) > 0) ? timeOut : 0;
		type = (type) ? type : "POST";
		var method = type.toString().trim().toUpperCase();
		if (method != "GET" && method != "POST") {
			return
		}
		successCallback = success;
		errorCallback = error;
		if (IsNetWorkCanUse() == false) {
			//如果是没有网络
			xmlHttpObj.getOfflineData(url, data);
			return;
		} else if (IsMuiSupport == true && IsPriorityMuiRequest == true) {
			//默认为mui的ajax请求  这里面对dataType 要求必须为小写
			DataType = DataType.toLowerCase();
			mui.ajax(url, {
				data: data,
				dataType: DataType,
				timeout: timeOut,
				type: method,
				success: success,
				error: error
			});
			return;
		}
		createXMLHttpRequest();

		if (method == "POST") {} else {
			if (url.indexOf("?") >= 0) {
				url = url + "&t=" + (new Date()).valueOf()
			} else {
				url = url + "?+=" + (new Date()).valueOf()
			}
		}
		if (IsPlusReady == true) {} else {
			if (url.indexOf("http://") >= 0) {}
		}
		var tmpSendData = '';
		try {
			for (var item in data) {
				tmpSendData += "&" + item + '=' + data[item]
			}
		} catch (e) {}
		if (method == "GET") {
			url += tmpSendData
		}
		if (IsPlusReady == true) {
			XMLHttpReq.open(method, url)
		} else {
			XMLHttpReq.open(method, url, true)
		}
		XMLHttpReq.timeout = timeOut;
		XMLHttpReq.ontimeout = function() {
			try {
				xmlHttpObj.abort()
			} catch (e) {}
			if (error && typeof(error) == "function") {
				error('超时请求')
			}
		}
		XMLHttpReq.onreadystatechange = processResponse;
		if (method == "POST") {
			if (IsPlusReady == true) {
				XMLHttpReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				XMLHttpReq.send(tmpSendData)
			} else {
				XMLHttpReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				XMLHttpReq.send(tmpSendData)
			}
		} else {
			XMLHttpReq.send(null)
		}
	};
	xmlHttpObj.abort = function() {
		XMLHttpReq.abort()
	};
	return xmlHttpObj
}());
/**
 * @file Ui控件工具类  基于plus系统  支持ZEPTO操作和原生操作
 * @description 功能：
 * 1.gallery动态添加控件
 * 2.contentPad动态添加
 * @author dailc
 * @version 1.0
 */
{
	/**
	 * @description 图片工具
	 */
	var WidgetUtil = (function() {
		var FactoryObj = {};
		/**
		 * @description 是否调试模式
		 * @type {Boolean}
		 */
		var IsDebug = false;
		/**
		 * 是否能用,如果兼容性检测不通过,所有的功能都用不了
		 */
		var CanUseFlag = true;
		/**
		 * 是否plusready
		 */
		var IsPlusReady = false;
		var IsZeptoSupport = true;
		var IsMuiSupport = true;
		var IsImgeUtilSupport = true;
		var IncludeZeptoJsName = 'zepto.min.js';
		var IncludeMuiJsName = 'mui.min.js';
		var IncludeImageUtilJsName = 'DImageUtil.js';
		/**
		 * @description dom类型,是原声还是zepto还是 jquery(目前目前不支持)
		 * Native  Zepto  Jquery
		 */
		var GlobalDomOptionType = "Native";
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
		 * 一些通用工具方法
		 */
		{
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
			 * @description 兼容性检测   是否缺失必须的引用文件
			 */
			function DetectionCompatible() {
				//如果没有必须的mui
				if (!IsInclude(IncludeZeptoJsName)) {
					IsZeptoSupport = false;
				}
				if (!IsInclude(IncludeMuiJsName)) {
					IsMuiSupport = false;
				}
				if (!IsInclude(IncludeImageUtilJsName)) {
					IsImgeUtilSupport = false;
				}
				CanUseFlag = true;
			};
			/**
			 * @description 检查是否能用  默认,或者null 都为不检查
			 * @param {Object} checkPlus 是否检查plus
			 * @param {Object} checkMui 是否检查mui
			 * @param {Object} checkZepto  是否检查Zepto
			 * @param {Object} checkImageUtil 是否检查图片工具类
			 */
			function CheckIsCanUse(checkPlus, checkMui, checkZepto, checkImageUtil) {
				if (CanUseFlag == false) {
					if(IsDebug==true){
						Myalert('不能使用', '缺少必须文件!', '我知道了');
					}					
					return false;
				}
				if (checkPlus != null && checkPlus == true) {
					if (IsPlusReady == false) {
						if(IsDebug==true){
							Myalert('plus尚未准备', 'plus尚未准备WidgetUtil', '我知道了');
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
				if (checkImageUtil != null && checkImageUtil == true) {
					if (IsImgeUtilSupport == false) {
						if(IsDebug==true){
							Myalert('不能使用', '未引用图片工具类文件:' + IncludeImageUtilJsName, '我知道了');
						}	
						return false;
					}
				}
				return true;
			};
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
			 * @description 通过dom操作,对于一个字符串,寻找对应的dom对象
			 * 如果没有传入目标对象,默认在document上寻找
			 * 优先找id 若没有找到,则找class,若还是没有找到则找tag,若都没找到则返回null
			 */
			function $domByStr(strName, targetObj) {
				if (strName == null) {
					return null;
				}
				//如果已经是dom对象,直接返回
				if (strName instanceof HTMLElement) {
					return strName;
				} else if (typeof(strName) != 'string') {
					return null;
				}
				targetObj = (targetObj != null && targetObj instanceof HTMLElement) ? targetObj : document;
				if (strName.indexOf('#') != -1) {
					//第一步,替换所有的关键字   '.'(需要\进行转义)  用来兼容zepto的class dom
					strName = strName.replace(/\#/g, '');
					//第二步,先寻找id
					var idDom = $Id(strName, targetObj);
					if (idDom != null) {
						return idDom;
					}
				} else if (strName.indexOf('.') != -1) {
					strName = strName.replace(/\./g, '');
					var classDom = $Class(strName, targetObj);
					if (classDom != null && classDom.length > 0) {
						return classDom[0];
					}
				} else {
					var tagDom = $Tag(strName, targetObj);
					if (tagDom != null && tagDom.length > 0) {
						return tagDom[0];
					}
				}
				//否则,返回null
				return null;
			};
			/**
			 * @description 先定义全局的dom操作函数，便于移植
			 * 通过id找寻dom对象
			 */
			function $Id(idName, targetObj) {
				targetObj = (targetObj != null && targetObj instanceof HTMLElement) ? targetObj : document;
				if (GlobalDomOptionType == "Zepto" && IsZeptoSupport == true) {
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
				className = className.replace(/\./g, '');
				if (GlobalDomOptionType == "Zepto" && IsZeptoSupport == true) {
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
				if (GlobalDomOptionType == "Zepto" && IsZeptoSupport == true) {
					//return Zepto(tagName,ze(targetObj));
					return targetObj.getElementsByTagName(tagName);
				} else {
					return targetObj.getElementsByTagName(tagName);
				}
			};
			/**
			 * @description 添加点击监听
			 */
			function addEventListenerCustomClick(targetObj, handle) {
				if (targetObj == null || handle == null || typeof(handle) != "function") {
					return;
				}
				if (GlobalDomOptionType == "Zepto" && IsZeptoSupport == true) {
					//如果是Zepto类型
					Zepto(targetObj).off('tap');
					Zepto(targetObj).on('tap', null, null, handle);
				} else {
					//原生
					addEventListenerCustom('click', handle, targetObj);
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
				targetObj.removeEventListener(eventName, handle);
				targetObj.addEventListener(eventName, handle);
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
				if (GlobalDomOptionType == "Zepto" && IsZeptoSupport == true) {
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
		}
		/**
		 * 一些外部调用方法
		 */
		{
			/**
			 * @description 设置引用的js的名字
			 * @param {Object} muiJSname  mui库的js 名称  默认为  mui.min.js
			 * @param {Object} zeptoJSname zepto库的js 默认为 zepto.min.js
			 * @param {Object} imageUtilJsName 图片工具类的js  默认为 DImageUtil.js
			 * 如果参数为null,代表使用默认值
			 */
			FactoryObj.setIncludeJsNames = function(muiJSname, zeptoJSname, imageUtilJsName) {
				if (muiJSname != null && typeof(muiJSname) == "string" && muiJSname != "") {
					IncludeMuiJsName = muiJSname;
				}
				if (zeptoJSname != null && typeof(zeptoJSname) == "string" && zeptoJSname != "") {
					IncludeZeptoJsName = zeptoJSname;
				}
				if (imageUtilJsName != null && typeof(imageUtilJsName) == "string" && imageUtilJsName != "") {
					IncludeImageUtilJsName = imageUtilJsName;
				}
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
			 * @description 设置Dom操作类型支
			 * @param {Object} type
			 * 值为0:原生Dom
			 * 值为1:Zepto
			 * 如果选了Zepto 但是又没有Zepto文件,会采用原生兼容模式
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
			 * @description Gallery 工厂,里面的函数可以动态产生Gallery并进行调整
			 */
			FactoryObj.GalleryFactory = (function() {
				var galleryFactory = {};
				/**
				 * @description 增加图片轮播,采用普通的网络图片展示
				 * @param {Object} element  		添加元素选择器
				 * @param {Object} galleryData 	json数据
				 * @param {Object} isLoop 		是否循环切换
				 * @param {Object} isauto 		是否自动播放
				 * @param {Object} callback		点击回调函数
				 * @param {Object} autoTime     自定播放的时间,默认为3s
				 * @param {Object} imgHeight    图片的固定高度,默认为'200px',可以传入对应的字符串,如'100px'
				 */
				galleryFactory.addGalleryLandscapeNormal = function(element, galleryData, isLoop, isauto, callback, autoTime, imgHeight) {
					galleryFactory.addGalleryLandscape(element, galleryData, isLoop, isauto, callback, autoTime, imgHeight, false);
				};
				/**
				 * @description 增加图片轮播,采用本地图片缓存展示
				 * @param {Object} element  		添加元素选择器
				 * @param {Object} galleryData 	json数据
				 * @param {Object} isLoop 		是否循环切换
				 * @param {Object} isauto 		是否自动播放
				 * @param {Object} callback		点击回调函数
				 * @param {Object} autoTime     自定播放的时间,默认为3s
				 * @param {Object} imgHeight    图片的固定高度,默认为'200px',可以传入对应的字符串,如'100px'
				 */
				galleryFactory.addGalleryLandscapeWithLocalCache = function(element, galleryData, isLoop, isauto, callback, autoTime, imgHeight) {
					galleryFactory.addGalleryLandscape(element, galleryData, isLoop, isauto, callback, autoTime, imgHeight, true);
				};
				/**
				 * 作者 andli 时间 20151022
				 * @二次封装  dailc
				 * 图片轮播 控件的使用
				 * @param {Object} element  		添加元素选择器
				 * @param {Object} galleryData 	json数据
				 * @param {Object} isLoop 		是否循环切换
				 * @param {Object} isauto 		是否自动播放
				 * @param {Object} callback		点击回调函数
				 * @param {Object} autoTime     自定播放的时间,默认为3s
				 * @param {Object} imgHeight    图片的固定高度,默认为'200px',可以传入对应的字符串,如'100px'
				 * @param {Object} IsWithLocalCache 是否采用本地缓存
				 */
				galleryFactory.addGalleryLandscape = function(element, galleryData, isLoop, isauto, callback, autoTime, imgHeight, IsWithLocalCache) {
					IsWithLocalCache = (IsWithLocalCache != null && IsWithLocalCache == true) ? true : false;
					if (CheckIsCanUse(true, true, true, IsWithLocalCache) == false) {
						return;
					}
					//初始化值
					if (galleryData == null || galleryData.length < 0) {
						$alert('错误', 'JSON数据为空!', '我知道了');
						return;
						return;
					}
					//对于元素选择器,我们有两种方案,如果是字符串,那么就对其进行dom操作,否则如果是dom对象,直接使用,否则直接无效
					if (element != null) {
						if (element instanceof HTMLElement) {} else if (typeof(element) == 'string') {
							element = $domByStr(element);
							if (element == null) {
								Myalert('错误', '不存在该元素选择器!', '我知道了');
								return;
							}
						}
					} else {
						Myalert('错误', '元素选择器为空!', '我知道了');
						return;
					}
					imgHeight = (imgHeight != null && typeof(imgHeight) == 'string') ? imgHeight : '190px';

					isLoop = (isLoop != null && typeof(isLoop) == 'boolean') ? isLoop : false;
					isauto = (isauto != null && typeof(isauto) == 'boolean') ? isauto : false;
					autoTime = (autoTime != null && typeof(autoTime) == "number" && autoTime >= 0) ? autoTime : 3000;
					var length = galleryData.length;
					var html = '';
					html += '<div class="mui-slider">';
					//动态添加 图片
					if (isLoop) {
						//增加 mui-slider-loop
						html += '<div class="mui-slider-group mui-slider-loop" id="mygallery">';
					} else {
						html += '<div class="mui-slider-group" id="mygallery">';
					}
					if (isLoop) {
						html += '<div class="mui-slider-item" id="' + (length - 1) + '">'
							//html += '<a href="">';
						if (IsWithLocalCache == true) {
							html += '<img alt="' + galleryData[length - 1].url + '" style="height:' + imgHeight + ';">';
						} else {
							html += '<img src="' + galleryData[length - 1].url + '" style="height:' + imgHeight + ';">';
						}
						html += '<p class="mui-slider-title">' + galleryData[length - 1].title + '</p>';
						//html += '</a>';
						html += '</div>';
					}
					for (var i = 0; i < length; i++) {
						html += '<div class="mui-slider-item" id="' + i + '">'
							//html += '<a href="#">';
						if (IsWithLocalCache == true) {
							html += '<img alt="' + galleryData[i].url + '" style="height:' + imgHeight + ';">';
						} else {
							html += '<img src="' + galleryData[i].url + '" style="height:' + imgHeight + ';">';
						}
						html += '<p class="mui-slider-title">' + galleryData[i].title + '</p>';
						//html += '</a>';
						html += '</div>';
					}
					if (isLoop) {
						html += '<div class="mui-slider-item" id="0">'
							//html += '<a href="#">';
						if (IsWithLocalCache == true) {
							html += '<img alt="' + galleryData[0].url + '" style="height:' + imgHeight + ';">';
						} else {
							html += '<img src="' + galleryData[0].url + '" style="height:' + imgHeight + ';">';
						}
						html += '<p class="mui-slider-title">' + galleryData[0].title + '</p>';
						//html += '</a>';
						html += '</div>';
					}
					html += '</div>';
					//动态添加 indicator
					html += '<div class="mui-slider-indicator">';
					for (var i = 0; i < length; i++) {
						if (i == 0) {
							html += '<div class="mui-indicator mui-active"></div> '; //默认从0开始
						} else {
							html += '<div class = "mui-indicator"></div>';
						}
					}
					html += '</div>';
					html += '</div>';
					//console.log(html);
					//先清空
					element.innerHTML = '';
					//添加图片轮播控件html
					appendHtmlChildCustom(element, html);
					//图片轮播初始化（不可缺少，否则无法正常显示）
					//这里由于 mui-slider是mui的特定空间,所以需要mui()特定的选择器才行
					var gallery = mui('.mui-slider');
					//用zepto或者原生都不行
					//var gallery = Zepto('.mui-slider');
					//var gallery = $Class('.mui-slider');
					//轮询时间
					var tmpAutoTime = 0;
					if (isauto) {
						tmpAutoTime = autoTime;
					}
					gallery.slider({
						interval: tmpAutoTime //轮播周期，默认为0：不轮播
					});
					if (IsWithLocalCache == true) {
						//如果是采用本地缓存的方法
						var GalleryImgs = Zepto('img', Zepto('#mygallery'));
						if (GalleryImgs != null && GalleryImgs.length > 0) {
							Zepto.each(GalleryImgs, function(key, value) {
								var src = Zepto(this).attr('alt');
								//console.log('src:'+src);
								ImageUtil.ImageLoaderFactory.setImgWidthLocalCache(Zepto(this), src);
							});
						}
					}

					function myItemClick(e) {
						var id = this.getAttribute("id");
						//ios阻止事件冒泡
						e.preventDefault();
						callback(e, id);
						return false;
					};
					//批量绑定
					if (callback != null && typeof callback === "function") {
						var classDom = $Class('.mui-slider-item', $domByStr(".mui-slider"));
						if (classDom != null && classDom.length > 0) {
							for (var i = 0; i < classDom.length; i++) {
								addEventListenerCustomClick(classDom[i], myItemClick);
							}
						}

					}
				};
				return galleryFactory;
			}());
			/**
			 * @description ContentPad 工厂,里面的函数可以动态产生ContentPad并进行调整
			 * 注意: 需要配合相应的css
			 */
			FactoryObj.ContentPadFactory = (function() {
				var contentPadFactory = {};

				//每一行的数量,默认为3
				var PerLineItems = 3;
				//当数据是单行时,是否用tabview显示
				var IsTabViewItem = false;
				/**
				 * @description 设置每一行的Item数量
				 * @param {Object} mIsTabViewItem 单行时是否tabview显示
				 */
				contentPadFactory.setIsTabViewItem = function(mIsTabViewItem) {
					//最大不能超过10个
					if (mIsTabViewItem != null && typeof(mIsTabViewItem) == 'boolean') {
						IsTabViewItem = mIsTabViewItem;
						//单行显示,每一行只允许一个单位
						PerLineItems = 1;
					}
				};
				/**
				 * @description 设置每一行的Item数量
				 * @param {Object} mPerLineItems 每一行的数量,数字类型,小于10个
				 */
				contentPadFactory.setPerLineItems = function(mPerLineItems) {
					//最大不能超过10个
					if (mPerLineItems != null && typeof(mPerLineItems) == 'number' && parseInt(mPerLineItems) > 0 && parseInt(mPerLineItems) < 10) {
						PerLineItems = mPerLineItems;
					}
				};
				var GlobalElement = null;
				/**
				 * @description 在特定的dom容器对象下,创建动态contentPad
				 * @param {Object} element 添加元素选择器
				 * @param {Object} contentPaddData JSON数据
				 * @param {Object} itemClickCallback 点击回调
				 */
				contentPadFactory.createContentPad = function(element, contentPaddData, itemClickCallback) {
					if (CheckIsCanUse(false, true, true) == false) {
						return;
					}
					//对于元素选择器,我们有两种方案,如果是字符串,那么就对其进行dom操作,否则如果是dom对象,直接使用,否则直接无效
					if (element != null) {
						if (element instanceof HTMLElement) {} else if (typeof(element) == 'string') {
							element = $domByStr(element);
							if (element == null) {
								Myalert('错误', '不存在该元素选择器!', '我知道了');
								return;
							}
						}
					} else {
						Myalert('错误', '元素选择器为空!', '我知道了');
						return;
					}
					GlobalElement = element;
					//初始化值
					if (contentPaddData == null || contentPaddData.length < 0) {
						Myalert('错误', 'JSON数据为空!', '我知道了');
						return;
					}
					var html = '';
					//动态拼接html
					html += '<div class="mui-content-padded">';
					var length = contentPaddData.length;
					//添加外层
					for (var i = 0; i < length; i++) {
						var theIdStr = contentPaddData[i].id ? ('id="' + contentPaddData[i].id + '"') : '';
						//添加最外层
						html += '<div class="mui-control-content" ' + theIdStr + '>'
						html += '<ul class="mui-table-view">';
						if (contentPaddData[i].JsonData != null && contentPaddData[i].JsonData.length > 0) {
							var theLastItemIndex = contentPaddData[i].JsonData.length - 1;
							for (var ii = 0; ii < contentPaddData[i].JsonData.length; ii++) {
								//每隔PerLineItems,就有一个mui-table-view-cell
								var modelVal = ii % PerLineItems;
								//console.log('ii:' + ii + ',perLin:' + PerLineItems + ',mod:' + modelVal);
								var idStr = contentPaddData[i].JsonData[ii].id ? ('id="' + contentPaddData[i].JsonData[ii].id + '"') : '';
								var titleStr = contentPaddData[i].JsonData[ii].title ? (contentPaddData[i].JsonData[ii].title) : 'defaultTitle';
								//单行显示
								if (PerLineItems == 1 && IsTabViewItem == true) {
									html += '<li class="mui-table-view-cell" style="padding-left: 8px;"' + idStr + '>' + titleStr + '</li>';
								} else {
									if (modelVal == 0) {
										//每一个li的开头
										html += '<li class="mui-table-view-cell">';
									}
									//每一个Item的数据
									if (ii == 0) {
										var widthPercent = parseInt(100 / PerLineItems);
										var widthPercentStr = 'width:' + widthPercent + '%!important';
										//第0个激活
										if (modelVal == PerLineItems - 1 || ii == theLastItemIndex) {
											html += '<a href="#" class="mui-cell-link  br-none" ' + idStr + 'style="' + widthPercentStr + '">' + titleStr + '</a>';
										} else {
											html += '<a href="#" class="mui-cell-link " ' + idStr + 'style="' + widthPercentStr + '">' + titleStr + '</a>';
										}
									} else if (modelVal == PerLineItems - 1
										//|| ii == theLastItemIndex
									) {
										//目前为必须是完整的结尾才会封闭
										//结尾数据
										html += '<a href="#" class="mui-cell-link br-none" ' + idStr + 'style="' + widthPercentStr + '">' + titleStr + '</a>';
									} else {
										//中间数据
										html += '<a href="#" class="mui-cell-link " ' + idStr + 'style="' + widthPercentStr + '">' + titleStr + '</a>';
									}
									if (modelVal == PerLineItems - 1 || ii == theLastItemIndex) {
										//每一个li的结尾
										html += '</li>'; //补齐 mui-table-view-cell
									}
								}
							}

						} else {
							//默认显示
							html += '无数据!';
						}
						html += '</ul>'; //补齐 mui-table-view
						//补齐 mui-control-content
						html += '</div>';
					}
					html += '</div>'; //补齐 mui-content-padded
					//拼接完后,先清空容器
					element.innerHTML = '';
					//console.log('html:' + html);
					//然后在容器中添加html
					appendHtmlChildCustom(element, html);
					//默认为激活第1个,用Zepto
					contentPadFactory.changeContentPadById(contentPaddData[0].id, element); //批量绑定监听
					//console.log('html:' + element.innerHTML);

					function myItemClick(e) {
						var id = this.getAttribute("id");
						//ios阻止事件冒泡
						e.preventDefault();
						itemClickCallback(e, id);
						return false;
					};
					if (itemClickCallback != null && typeof(itemClickCallback) == "function") {
						var classDom = null;
						if (PerLineItems == 1 && IsTabViewItem == true) {
							//单行显示,只有每一行为1个单位才支持单行显示
							classDom = $Class('.mui-table-view-cell', $domByStr(".mui-content-padded", element));
						} else {
							classDom = $Class('.mui-cell-link', $domByStr(".mui-content-padded", element));
						}
						if (classDom != null && classDom.length > 0) {
							for (var i = 0; i < classDom.length; i++) {
								addEventListenerCustomClick(classDom[i], myItemClick);
							}
						}
					}
				};
				/**
				 * @description 改变ContentPad的显示,只有显示多个的时候有用
				 * @param {Object} showContentPadId 需要显示的mui-control-contentde id
				 * @param {Object} element 对应的元素选择器,如果为Null,默认为最近一次添加的元素选择器
				 */
				contentPadFactory.changeContentPadById = function(showContentPadId, element) {
					if (CheckIsCanUse(true, false, true) == false) {
						return;
					}
					if (showContentPadId == null && typeof(showContentPadId) != 'string') {
						return;
					}
					if (element == null) {
						element = GlobalElement;
					}
					if (element == null) {
						return;
					}
					//先取消所有的激活
					Zepto('.mui-control-content', Zepto(element)).removeClass('mui-active');
					Zepto('#' + showContentPadId, Zepto(element)).addClass('mui-active');
				};
				return contentPadFactory;
			}());
		}
		return FactoryObj;
	}());
}
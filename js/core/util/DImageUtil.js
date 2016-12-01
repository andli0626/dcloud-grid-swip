/**
 * @file 图片工具类  基于plus系统  默认为ZEPTO操作
 * @description 功能：
 * 1.常用的图片工具方法
 * 2.图片选择工厂(包含一些选择图片的方法)
 * 3.图片加载工厂
 * 注意: 默认的图片是放在  最外层img/common下的img_loading与img_defaultShowImg
 * @author dailc
 * @version 1.0
 */
{
	/**
	 * @description 图片工具
	 */
	var ImageUtil = (function() {
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
		var IncludeZeptoJsName = 'zepto.min.js';
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
			if (!IsInclude(IncludeZeptoJsName)) {
				IsZeptoSupport = false;
			}
			CanUseFlag = true;
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
		 * @description 检查是否能用
		 * @param {Object} checkPlus 是否检查plus
		 * @param {Object} checkZepto  是否检查Zepto
		 */
		function CheckIsCanUse(checkPlus, checkZepto) {
			if (CanUseFlag == false) {
				if(IsDebug==true){
					Myalert('不能使用', '缺少必须文件!', '我知道了');
				}			
				return false;
			}
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
			return true;
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
			if (CheckIsCanUse(true) == false) {
				return IsCanUseNetWork;
			}
			if (GetNetWorkState() == '未知' || GetNetWorkState() == '未连接网络') {
				IsCanUseNetWork = false;
			} else {
				IsCanUseNetWork = true;
			}
			return IsCanUseNetWork;
		};
		/**
		 * 设置
		 */
		{
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
			 * @description 设置引用的js的名字
			 * @param {Object} zeptoJSname  zepto库的js 名称  默认为  zepto.min.js
			 * 如果参数为null,代表使用默认值
			 */
			FactoryObj.setIncludeJsNames = function(zeptoJSname) {
				if (zeptoJSname != null && typeof(zeptoJSname) == "string" && zeptoJSname != "") {
					IncludeZeptoJsName = zeptoJSname;
				}
			};
		}
		/**
		 * 一些通用工具方法
		 */
		{
			/**
			 * 默认参数
			 */
			var defaultCompressImgWidth = '500';
			var defaultCompressImgHeight = '333';
			var defaultMaxFileSize = 150 * 1024;
			/**
			 * @description 删除指定路径的文件
			 * @param {Object} relativePath  相对路径例如:  _downloads/imgs/test.jpg
			 * @param {Object} successCallback  删除成功回调
			 * @param {Object} errorCallback  失败回调
			 */
			FactoryObj.delFile = function(relativePath, successCallback, errorCallback) {
				if (CheckIsCanUse(true) == false) {
					return;
				}
				plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
					entry.remove(function(entry) {
						//console.log("文件删除成功==" + relativePath);
						if (successCallback && typeof(successCallback) == 'function') {
							successCallback(true);
						}
					}, function(e) {
						//console.log("文件删除失败=" + relativePath);
						if (errorCallback && typeof(errorCallback) == 'function') {
							errorCallback('删除文件失败!');
						}
					});
				}, function() {
					//console.log("打开文件路径失败=" + relativePath);
					if (errorCallback && typeof(errorCallback) == 'function') {
						errorCallback('打开文件路径失败!');
					}
				});
			};
			/**
			 * @description 处理压缩图片
			 * @param {Object} p  图片所在路径
			 * @param {Object} mWidth  压缩后的宽度
			 * @param {Object} mHeight  压缩后的高度
			 * @param {Object} successCallback 成功压缩后的回调
			 * @param {Object} errorCallback 失败回调
			 */
			FactoryObj.getCompressImage = function(p, mWidth, mHeight, successCallback, errorCallback) {
				if (CheckIsCanUse(true) == false) {
					return;
				}
				mWidth = (mWidth != null && typeof(mWidth) == "string" && parseInt(mWidth) > 0) ? mWidth : defaultCompressImgWidth;
				mHeight = (mHeight != null && typeof(mHeight) == "string" && parseInt(mHeight) > 0) ? mHeight : defaultCompressImgHeight;
				var n = p.substr(p.lastIndexOf('/') + 1);
				var f = p.substring(0, p.lastIndexOf('/') + 1);
				var dist = f + 'tmp' + n;
				//对p进行压缩
				plus.zip.compressImage({
					src: p,
					dst: dist,
					width: mWidth,
					height: mHeight,
					quality: 100
				}, function() {
					if (successCallback && typeof(successCallback) == 'function') {
						successCallback(dist);
					}
				}, function() {
					if (errorCallback && typeof(errorCallback) == 'function') {
						errorCallback('压缩图片失败!', dist);
					}
				});
			};
			/**
			 * 获取(最大为特定大小)的文件
			 * @param {Object} path 文件路径
			 * @param {Object} maxFileSize  最大文件大小
			 * @param {Object} successCallback 成功回调
			 * @param {Object} mWidth 最大宽度
			 * @param {Object} mHeight 最大高度
			 * @param {Object} errorCallback 错误回调
			 */
			FactoryObj.getMaxFileSizeFile = function(path, maxFileSize, successCallback, mWidth, mHeight, errorCallback) {
				if (CheckIsCanUse(true) == false) {
					return;
				}
				maxFileSize = (maxFileSize && typeof(maxFileSize) == "number" && maxFileSize > 0) ? maxFileSize : defaultMaxFileSize;
				//先判断下文件大小
				plus.io.resolveLocalFileSystemURL(path, function(entry) {
					entry.file(function(file) {
						//console.log('获取文件的大小:' + file.size);
						var resultPath = path;
						if (file.size > maxFileSize) {
							FactoryObj.getCompressImage(path, mWidth, mHeight, function(dist) {
								resultPath = dist;
								if (successCallback && typeof(successCallback) == "function") {
									successCallback(resultPath);
								}
							}, errorCallback)

						} else {
							resultPath = path;
							if (successCallback && typeof(successCallback) == "function") {
								successCallback(resultPath);
							}
						}
					});
				}, function() {
					if (errorCallback && typeof(errorCallback) == 'function') {
						errorCallback('打开文件路径失败');
					}
				});
			};

		}
		/**
		 * @description 图片选择工厂,里面包含图片选择的方法
		 */
		FactoryObj.ImageSelectFactory = (function() {
			var ImgSelectFactory = {};
			/**
			 * @description 从照相机中获取图片
			 * @param {Object} chooseCallback 成功回调 返回路径 path
			 * @param {Object} errorCallback 失败回调
			 */
			ImgSelectFactory.SelectImgFromCamera = function(chooseCallback, errorCallback) {
				if (CheckIsCanUse(true) == false) {
					return;
				}
				plus.camera.getCamera().captureImage(function(path) {
					if (chooseCallback && typeof(chooseCallback) == "function") {
						//转为绝对路径,摄像拍出的路径为相对的,保存在  _doc/下面的
						var finalPath = plus.io.convertLocalFileSystemURL(path);
						chooseCallback(finalPath);
					}
				}, function() {
					if (errorCallback && typeof(errorCallback) == "function") {
						errorCallback('选择图片失败!');
					}
				});
			};
			/**
			 * @description 从图库中获取图片
			 * @param {Object} chooseCallback 成功回调 返回路径 path
			 * @param {Object} errorCallback 失败回调
			 */
			ImgSelectFactory.SelectImgFromGallery = function(chooseCallback, errorCallback) {
				if (CheckIsCanUse(true) == false) {
					return;
				}
				plus.gallery.pick(function(path) {
					if (chooseCallback && typeof(chooseCallback) == "function") {
						chooseCallback(path);
					}
				}, function() {
					if (errorCallback && typeof(errorCallback) == "function") {
						errorCallback('选择图片失败!');
					}
				})
			};
			/**
			 * @description 从照相机中获取图片(最大大小不超过指定大小)
			 * @param {Object} maxFileSize  图片的最大大小
			 * @param {Object} successCallback 成功回调 返回路径 path
			 * @param {Object} errorCallback 失败回调
			 * @param {Object} mWidth 图片压缩的自定义宽度,为空则用默认值
			 * @param {Object} mHeight 图片压缩的自定义高度,为空则用默认值
			 */
			ImgSelectFactory.SelectCompressImgFromCamera = function(maxFileSize, successCallback, errorCallback, mWidth, mHeight) {
				ImgSelectFactory.SelectImgFromCamera(function(path) {
					FactoryObj.getMaxFileSizeFile(path, maxFileSize, successCallback, mWidth, mHeight, errorCallback);
				}, errorCallback);
			};
			/**
			 * @description 从图库中获取图片(最大大小不超过指定大小)
			 * @param {Object} maxFileSize  图片的最大大小
			 * @param {Object} successCallback 成功回调 返回路径 path
			 * @param {Object} errorCallback 失败回调
			 * @param {Object} mWidth 图片压缩的自定义宽度,为空则用默认值
			 * @param {Object} mHeight 图片压缩的自定义高度,为空则用默认值
			 */
			ImgSelectFactory.SelectCompressImgFromGallery = function(maxFileSize, successCallback, errorCallback, mWidth, mHeight) {
				ImgSelectFactory.SelectImgFromGallery(function(path) {
					FactoryObj.getMaxFileSizeFile(path, maxFileSize, successCallback, mWidth, mHeight, errorCallback);
				}, errorCallback);
			};
			return ImgSelectFactory;
		}());

		/**
		 * @description 图片加载工厂,包含图片加载方法
		 * 例如；本地缓存显示网络图片,图片懒加载
		 * 注意相对路径在Android:/sdcard/Android/data/io.dcloud.HBuilder/.HBuilder/...
		 * iOS:/Library/Pandora/...
		 */
		FactoryObj.ImageLoaderFactory = (function() {
			var ImgLoaderFactory = {};
			/**
			 * 一些全局参数
			 */
			var imgStoragePath = "_downloads/imgs/"; //默认的图片缓存目录

			var defaultLoadingImg = '../images/common/img_loading.png'; //默认的下载图片

			var defaultImg = '../images/common/img_defaultShowImg.jpg'; //默认的显示图片
			/**
			 * @description 设置默认的图片存储路径
			 * @param {Object} mImgStoragePath 路径,默认为 _downloads/imgs/
			 */
			ImgLoaderFactory.setDefaultStoragePath = function(mImgStoragePath) {
				mImgStoragePath = (mImgStoragePath != null && typeof(mImgStoragePath) == 'string' && mImgStoragePath != '') ? mImgStoragePath : imgStoragePath;
			};
			/**
			 * @description 设置默认的图片
			 * @param {Object} mDefaultLoadingImg  默认的加载图片
			 * @param {Object} mDefaultImg 默认的显示图片
			 * @param {Object} realPathType 相对路径类别
			 */
			ImgLoaderFactory.setDefaultImgs = function(mDefaultLoadingImg, mDefaultImg, realPathType) {
				realPathType = (realPathType != null && typeof(realPathType) == 'number' && parseInt(realPathType) <= 6 && parseInt(realPathType) >= 0) ? realPathType : 2;
				defaultLoadingImg = (mDefaultLoadingImg != null && typeof(mDefaultLoadingImg) == 'string' && mDefaultLoadingImg != '') ? mDefaultLoadingImg : defaultLoadingImg;
				defaultImg = (mDefaultImg != null && typeof(mDefaultImg) == 'string' && mDefaultImg != '') ? mDefaultImg : defaultImg;
				ImgLoaderFactory.setDefaultRelPathType(realPathType);
			};
			/**
			 * @description 设置页面和图片之间的相对路径类别
			 * @param {Object} realPathType 相对路径的类别,对应页面路径相对于图片路径的类别
			 * 例如../(1)还是../../(2)  目前最高支持 6级,默认为 2
			 */
			ImgLoaderFactory.setDefaultRelPathType = function(realPathType) {
				realPathType = (realPathType != null && typeof(realPathType) == 'number' && parseInt(realPathType) <= 6 && parseInt(realPathType) >= 0) ? realPathType : 2;
				//1.获取默认的相对路径头 为 0级
				var realPathHead = '';
				for (var i = 0; i < realPathType; i++) {
					realPathHead += '../';
				}
				//2.将以前的默认图片去除  路径头，要用转衣服
				defaultLoadingImg = defaultLoadingImg.replace(/\.\.\//g, '');
				defaultImg = defaultImg.replace(/\.\.\//g, '');
				//3.将图片加上默认路径头
				defaultLoadingImg = realPathHead + defaultLoadingImg;
				defaultImg = realPathHead + defaultImg;
				defaultLoadingImg = defaultLoadingImg.trim();
				defaultImg = defaultImg.trim();
			};
			/**
			 * @description 清除图片加载工厂的所有图片缓存
			 * @param {Object} successCallback 成功回调
			 * @param {Object} errorCallback 失败回调
			 */
			ImgLoaderFactory.clearLoaderImgsCache = function(successCallback, errorCallback) {
				if (CheckIsCanUse(true) == false) {
					return;
				}
				//遍历目录文件夹下的所有文件，然后删除
				var tmpUrl = plus.io.convertLocalFileSystemURL(imgStoragePath);
				plus.io.resolveLocalFileSystemURL(tmpUrl, function(entry) {
					entry.removeRecursively(function() {
						if (successCallback && typeof(successCallback) == 'function') {
							successCallback();
						}
					}, function() {
						if (errorCallback && typeof(errorCallback) == 'function') {
							errorCallback('清除图片缓存失败!');
						}
					});
				}, function(e) {
					if (errorCallback && typeof(errorCallback) == 'function') {
						errorCallback('打开图片缓存目录失败!');
					}
				});
			};
			/**
			 * @description 从一个网络URL中,获取本地图片缓存相对路径
			 * @param {Object} loadUrl 图片的网络路径,如果为null,则返回一个null
			 */
			ImgLoaderFactory.getRelativePathFromLoadUrl = function(loadUrl) {
				if (loadUrl == null) return null;
				//这是普通的网络图片的读取方法  例如:http://123.333:8080/test.jpg  截取出来就是  test.jpg
				var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
				var reg = /[\u4E00-\u9FA5]/g;
				filename = filename.replace(reg, 'chinese');
				//console.log('fileName:'+filename);
				//如果并不是普通的静态资源图片,有可能是   ..../rowguid=jhbmmmmbjbb 这种类型
				if (
					filename.toLocaleLowerCase().indexOf(".jpg") == -1 &&
					filename.toLocaleLowerCase().indexOf(".jpeg") == -1 &&
					filename.toLocaleLowerCase().indexOf(".png") == -1 &&
					filename.toLocaleLowerCase().indexOf(".bmp") == -1 &&
					filename.toLocaleLowerCase().indexOf(".svg") == -1 &&
					filename.toLocaleLowerCase().indexOf(".gif") == -1) {
					/*如果不是网络图片，而是服务器端的格式:
					 * http://221.226.184.178:8088/EpointMobileJK/ShowHeadImg.aspx?RowGuid=dc608614-acc3-4c1c-bccf-b0e6dfecbb9c
					 * 读取RowGuid
					 */
					if (loadUrl.indexOf('RowGuid') != -1) {
						var rowGuid = loadUrl.substring(loadUrl.lastIndexOf("RowGuid=") + 8, loadUrl.length);
						if (rowGuid == "") {
							rowGuid = "default";
						}
						filename = rowGuid + ".jpg";
					} else if (loadUrl.indexOf('UserGuid') != -1) {
						var UserGuid = loadUrl.substring(loadUrl.lastIndexOf("UserGuid=") + 9, loadUrl.length);
						if (UserGuid == "") {
							UserGuid = "default";
						}
						filename = UserGuid + ".jpg";
					} else if (loadUrl.indexOf('FUJIAN') != -1) {
						var FUJIAN = loadUrl.substring(loadUrl.lastIndexOf("FUJIAN=") + 7, loadUrl.length);
						if (FUJIAN == "") {
							FUJIAN = "default";
						}
						filename = FUJIAN + ".jpg";
					} else {
						filename = 'default' + ".jpg";
					}

				}
				var relativePath = imgStoragePath + filename;

				return relativePath;
			};
			/**
			 * @description 删除某一张网络图片的缓存
			 */
			ImgLoaderFactory.delNetUrlImgCache = function(netImgUrl, successCallback, errorCallback) {
				ImgLoaderFactory.delFile(ImgLoaderFactory.getRelativePathFromLoadUrl(netImgUrl), successCallback, errorCallback);
			};
			/**
			 * @description 给指定的图片dom 设置本地图片属性
			 * @param {Object} $img 目标图片dom
			 * @param {Object} relativePath 本地图片路径
			 */
			ImgLoaderFactory.setImgFromLocalCache = function($img, relativePath) {
				if (CheckIsCanUse(true, true) == false) {
					return;
				}
				/*例如:
				 * 本地相对路径("downloads/imgs/logo.jpg")转成SD卡绝对路径
				 * 例如相对路径:downloads/imgs/logo.jpg
				 * ("/storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/downloads/imgs/logo.jpg");
				 * */
				var sd_path = plus.io.convertLocalFileSystemURL(relativePath);
				Zepto($img).attr("src", sd_path);
			};
			/**
			 * @description 从网络下载图片,并给指定的img dom赋值
			 * @param {Object} $img 目标img dom
			 * @param {Object} loadUrl 网络图片路径
			 * @param {Object} relativePath 图片下载后的本地路径,如果不指定,采用默认值 在_downloads/imgs/下
			 */
			ImgLoaderFactory.setImgFromNet = function($img, loadUrl, relativePath) {
				if (CheckIsCanUse(true, true) == false) {
					return;
				}
				relativePath = (relativePath != null && relativePath != '') ? relativePath : ImgLoaderFactory.getRelativePathFromLoadUrl(loadUrl);
				//下载参数
				var options = {
					filename: relativePath,
					timeout: 3,
					retryInterval: 3
				};
				//1.将图片 设为默认的下载图片
				Zepto($img).attr("src", defaultLoadingImg);
				//console.log('默认的loading图片:' + defaultLoadingImg);
				//2.创建下载任务
				var dtask = plus.downloader.createDownload(loadUrl,
					options,
					function(d, status) {
						if (status == 200) {
							//下载成功
							//console.log("下载成功=" + relativePath);
							//console.log('路径:'+d.filename);
							ImgLoaderFactory.setImgFromLocalCache($img, d.filename);
						} else {
							//下载失败,需删除本地临时文件,否则下次进来时会检查到图片已存在
							//console.log("下载失败=" + status + "==" + relativePath);
							//dtask.abort();//文档描述:取消下载,删除临时文件;(但经测试临时文件没有删除,故使用delFile()方法删除);
							if (relativePath != null) {
								FactoryObj.delFile(relativePath);
							}
							//console.log('使用默认的图片:' + defaultImg);
							Zepto($img).attr("src", defaultImg);
						}
					});
				//3.启动下载任务
				dtask.start();
			};
			/**
			 * @description 通过本地缓存的方法显示网络图片
			 * @param {Object} $img
			 * @param {Object} loadUrl
			 */
			ImgLoaderFactory.setImgWidthLocalCache = function($img, loadUrl) {
				if ($img == null || loadUrl == null) return;
				var relativePath = ImgLoaderFactory.getRelativePathFromLoadUrl(loadUrl);
				if (relativePath.indexOf("default.jpg") != -1) {
					//设置默认图片
					Zepto($img).attr("src", defaultImg);
				} else {
					//检查图片是否已存在
					plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
						//console.log("图片存在,直接设置=" + relativePath);
						//如果文件存在,则直接设置本地图片
						ImgLoaderFactory.setImgFromLocalCache($img, relativePath);
					}, function(e) {
						//console.log("图片不存在,联网下载=" + relativePath);
						//如果文件不存在,判断有无网络
						if (IsNetWorkCanUse() == true) {
							//如果网络状态能用,联网下载图片
							//console.log('有网络');
							ImgLoaderFactory.setImgFromNet($img, loadUrl, relativePath);
						} else {
							//采用本地默认图片
							//console.log('无网络:'+defaultImg);
							Zepto($img).attr("src", defaultImg);
						}
					});
				}
			};
			/**
			 * @description 设置页面中的所有图片(本地缓存方式),这些图片里面的alt属性里面是地址
			 */
			ImgLoaderFactory.setAllNetImgsWithLocalCache = function() {
				//获取页面中所有的图片
				var imgs = Zepto("img");
				Zepto.each(imgs, function(key, value) {
					var src = Zepto(this).attr('alt');
					if (src != null && src != '') {
						ImgLoaderFactory.setImgWidthLocalCache(this, src);
						//默认将alt置为空
						Zepto(this).attr("alt", "");
					}
				});
			};
			/**
			 * @description 图片懒加载
			 * @param {Object} obj 图片标签dom对象
			 * @param {Object} localPath 本地路径
			 */
			ImgLoaderFactory.lazyload = function(obj, localPath) {
				if (CheckIsCanUse(true) == false) {
					return;
				}
				if (Zepto(obj).attr("data-loaded") == "true") {
					return;
				}
				var sd_path = plus.io.convertLocalFileSystemURL(localPath);
				//console.log("加载的本地头像:" + localPath + "   绝对路径:" + sd_path);
				var temp_img = new Image();
				temp_img.onload = function() {
					obj.setAttribute('src', sd_path);
					obj.setAttribute('data-loaded', true);
				};
				temp_img.src = sd_path;
			};

			return ImgLoaderFactory;
		}());
		return FactoryObj;
	}());
}
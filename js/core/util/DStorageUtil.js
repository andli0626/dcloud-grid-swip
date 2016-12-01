/**
 * @description  Storage工具类  基于plus系统
 * @author dailc
 * @version 1.0
 */
{
	/**
	 * @description创建一个用来页面操作相关的容器工厂
	 */
	var StorageUtil = (function() {
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
		 * 是否plusReady 
		 */
		var IsPlusReady = false;
		/**
		 * @description 兼容性检测   是否缺失必须的引用文件
		 */
		function DetectionCompatible() {

			CanUseFlag = true;
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
		 * @description 自定义弹出提醒,没有回调的
		 */
		function $alert(title, message, btnTips) {
			if (IsPlusReady == true) {
				plus.nativeUI.alert(message, null, title, btnTips);
			} else {
				window.alert(message);
			}
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
		 * @description 检查是否能用
		 * @param {Object} IsCheckPlus 是否检查plus
		 */
		function CheckIsCanUse(IsCheckPlus) {
			if (CanUseFlag == false) {
				if(IsDebug==true){
					$alert('不能使用', '缺少必须文件!', '我知道了');
				}
				
				return false;
			}
			if (IsCheckPlus == true) {
				if (IsPlusReady == false) {
					if(IsDebug==true){
						$alert('plus尚未准备', 'plus尚未准备StorageUtil', '我知道了');
					}			
					return false;
				}
			}

			return true;
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
		 * @description setStorage
		 * @param {String} id 存入的key值
		 * @param {Object} data
		 */
		FactoryObj.setStorageItem = function(id, data) {
			if (CheckIsCanUse(true) == false) {
				return;
			}
			if (typeof(data) == 'string') {
				plus.storage.setItem(id, data);
			} else {
				plus.storage.setItem(id, JSON.stringify(data));
			}

		};
		/**
		 * @description getStorage
		 * @param {String} id key值
		 */
		FactoryObj.getStorageItem = function(id) {
			if (CheckIsCanUse(true) == false) {
				return null;
			}
			var items = plus.storage.getItem(id);
			if (items != null) {
				items = JSON.parse(items);
			}
			return items;
		};
		/**
		 * @description 移除对应的StorageItem
		 * @param {String} id key值
		 */
		FactoryObj.removeStorageItem = function(id) {
			if (CheckIsCanUse(true) == false) {
				return;
			}
			if (id != null && id != '') {
				plus.storage.removeItem(id);
			}
		};
		/**
		 * @description 清除所有的Storage的缓存
		 */
		FactoryObj.clearAllStorageCache = function() {
			if (CheckIsCanUse(true) == false) {
				return;
			}
			plus.storage.clear();
		};
		/**
		 * @description App的离线本地缓存
		 */
		FactoryObj.OffLineAppCache = (function() {
			var OffLineAppCacheObj = {};
			//本地缓存的Item 名称,这个用来控制所有的离线缓存item
			var mOffLineCacheName = 'MyOffLineAppCache';
			/**
			 * @description 清除本APP的所有本地离线缓存
			 */
			OffLineAppCacheObj.clearAllOffLineAppCache = function() {
				//找到所有的键值
				var mAllOffLineCache = FactoryObj.getStorageItem(mOffLineCacheName);
				if (mAllOffLineCache != null && Array.isArray(mAllOffLineCache)) {
					//我们定义下,该离线缓存是一个JSON数组对象,装有所有离线缓存的item的key
					for (var i = 0; i < mAllOffLineCache.length; i++) {
						FactoryObj.removeStorageItem(mAllOffLineCache[i]);
					}
				}
			};
			/**
			 * @description 添加一个离线缓存,如果本地已有改建的缓存,会覆盖以前
			 * @param {String} key 键的名称
			 * @param {Object} value 值(字符串或者json对象)
			 */
			OffLineAppCacheObj.addOffLineCache = function(key, value) {
				var mAllOffLineCache = FactoryObj.getStorageItem(mOffLineCacheName);
				if (mAllOffLineCache == null) {
					//如果以前的缓存为空,生成缓存
					mAllOffLineCache = [];
				}
				//console.log('key:'+key+',增加前的值:'+JSON.stringify(mAllOffLineCache));
				var valueStr = null;
				if (typeof(value) == 'string') {
					valueStr = value;
				} else if (value != null) {
					valueStr = JSON.stringify(value);

				}
				//将加入的key由离线缓存管理				
				mAllOffLineCache.push(key);
				//存储离线缓存管理
				FactoryObj.setStorageItem(mOffLineCacheName, mAllOffLineCache);
				//console.log('添加数据:key:'+key+',value:'+valueStr);
				//存入key和值
				FactoryObj.setStorageItem(key, valueStr);
				//console.log('key:'+key+',增加后的值:'+JSON.stringify(mAllOffLineCache));
			};
			/**
			 * @description 得到一个离线缓存,如果没有,会返回Null
			 * @param {String} key 键的名称
			 */
			OffLineAppCacheObj.getOffLineCache = function(key) {
				return FactoryObj.getStorageItem(key);;
			};
			/**
			 * @description 删除对应键的离线缓存
			 * @param {String} key
			 */
			OffLineAppCacheObj.deleteOffLineCache = function(key) {
				var mAllOffLineCache = FactoryObj.getStorageItem(mOffLineCacheName);
				if (mAllOffLineCache == null || !Array.isArray(mAllOffLineCache)) {
					//这时候肯定没有离线缓存
					return;
				}
				//先找到key对应的index
				var index = mAllOffLineCache.indexOf(key);
				//删除对应的index位置
				mAllOffLineCache.splice(index, 1);
				//删除本地中的缓存
				FactoryObj.removeStorageItem(key);
			};
			/**
			 * @description 判断本地是否已有对应的离线缓存
			 * @param {String} key
			 */
			OffLineAppCacheObj.IsHasOffLineCache = function(key) {
				var flagResult = false;
				var mAllOffLineCache = FactoryObj.getStorageItem(mOffLineCacheName);
				if (mAllOffLineCache == null || !Array.isArray(mAllOffLineCache)) {
					return flagResult;
				}
				var index = mAllOffLineCache.indexOf(key);
				if (index != -1) {
					flagResult = true;
				}
				return flagResult;
			};
			/**
			 * @description 存储一个列表数据
			 * @param {String} sessionKey 对应的列表的sessionkey
			 * @param {Object} listData 存储进去的数据,是一个json数组
			 * @param {Number} beginIndex  当前插入的列表的开始序列
			 * 
			 */
			OffLineAppCacheObj.addListDataCache = function(sessionKey, listData, beginIndex) {
				var offlineListCache = OffLineAppCacheObj.getOffLineCache(sessionKey);
				if (offlineListCache == null || !Array.isArray(offlineListCache)) {
					offlineListCache = [];
				}
				if (typeof(data) == 'string') {
					data = JSON.parse(data);
				}
				if (beginIndex != null) {
					beginIndex = parseInt(beginIndex);
				}
				if (beginIndex == null || isNaN(beginIndex) || beginIndex < 0) {
					//参数不对,存储失败
					//console.log('参数格式不对');
					return;
				};
				if (listData == null || !Array.isArray(listData)) {
					//数据格式不对,存储失败
					//console.log('存储数据格式不对');
					return;
				}
				//console.log('加入前的数据:'+JSON.stringify(offlineListCache));
				if (offlineListCache.length <= beginIndex) {
					//如果存储的数据是本来没有的,直接添加到结尾
					Array.prototype.push.apply(offlineListCache, listData);
				} else {
					//如果插入的数据是都已经存在的
					//先删除原有位置的数组,然后插入到相同位置
					//console.log('插入数组长度:'+listData.length+',beginIndex:'+beginIndex);
					var tmpArray = offlineListCache.slice(0, beginIndex);
					//这个是多出的剩余数据
					var tmpArray2 = offlineListCache.slice(beginIndex + listData.length);
					Array.prototype.push.apply(tmpArray, listData);
					if (tmpArray2 != null) {
						Array.prototype.push.apply(tmpArray, tmpArray2);
					}
					offlineListCache = tmpArray;
				}
				//存储缓存
				OffLineAppCacheObj.addOffLineCache(sessionKey, offlineListCache);
				//console.log('key'+sessionKey+',加入后的数据:'+JSON.stringify(offlineListCache));
			};
			/**
			 * @description 得到离线列表数据
			 * @param {String} sessionKey 对应列表的key
			 * @param {Number} currentpageindex 获取的页数
			 * @param {Number} pagesize 每一页的大小
			 */
			OffLineAppCacheObj.getListDataCache = function(sessionKey, currentpageindex, pagesizeCount) {
				var offlineListCache = OffLineAppCacheObj.getOffLineCache(sessionKey);
				var totalCount = 0;
				if (offlineListCache != null && Array.isArray(offlineListCache)) {
					totalCount = offlineListCache.length;
				}
				//console.log('请求参数:' + JSON.stringify(data));
				//console.log('离线数据:' + JSON.stringify(offlineListCache));
				//手动获取存储的参数
				var currpage = null;
				var pagesize = null;
				if (currentpageindex != null) {
					currpage = parseInt(currentpageindex);
				}
				if (pagesizeCount != null) {
					pagesize = parseInt(pagesizeCount);
				}
				if (currpage == null || isNaN(currpage)) {
					currpage = 0
				};
				if (pagesize == null || isNaN(pagesize)) {
					pagesize = 1;
				};
				//console.log('当前页:' + currpage + ',页面大小:' + pagesize);
				var outArray = {
					totalCount: totalCount,
					data: null
				};
				if (offlineListCache != null) {
					outArray.data = offlineListCache.slice(currpage * pagesize, (currpage + 1) * pagesize);
				}
				offlineListCache = null;
				return outArray;
			};
			return OffLineAppCacheObj;
		}());
		return FactoryObj;
	}());
}
/**
 * @file 检查更新的工具类
 * 每一次从服务器请求更新信息,如果更新成功,就在本地写入更新历史
 * 更新方案:  app版本升级与 app资源包升级
 * 需要: GlobalUrlUtil.js
 * @author dail
 * @version 1.0
 */
(function($, ze, win) {
	/**
	 * 检查升级地址 目前我的阿里云上的测试地址
	 * http://115.29.151.25:8012/updateFiles/update.json
	 */
	var UpdateUrl = 'http://218.25.201.22/aswmh/update/updateFiles/update.json?timeid='+Math.random();
	/**
	 * 本地保存升级文件的路径 为 plus.io.PRIVATE_DOC
	 * 本地更新数据文件的路径  plus.io.PRIVATE_DOC/update
	 */
	var localUpdateFileDir = "update";
	/**
	 * 本地保存升级描述目录和文件名  这个文件为当前正在更新的文件数据  如果检查完毕后就会删除掉
	 * plus.io.PRIVATE_DOC/update/update.json
	 * 更新文件历史的格式为:  updateHistory_OldResourceVersion_newVersion.json
	 */
	var localUpdateFile = "update.json";
	/**
	 * 存放更新包的路径,存放wgt
	 */
	var localUpdatePackageFileDir = "_downloads/update/";
	/**
	 * 临时存放的更新文件路径
	 */
	var tmpDirPath = null;

	var IsAbortDownload = false;

	var IsDownloadCompleted = false;
	/**
	 * 存储当前的资源包的版本号
	 */
	var CurrentResourceVersion = '';
	/**
	 * 存储资源老版本号
	 */
	var OldResourceVersion = '';
	/**
	 *存储老的app版本号
	 */
	var OldAppVersion = '';

	/*默认的提示对话框*/
	var ShowInfoTitle = "更新提示:";
	var ShowInfoDetail = "有新版本拉！";
	/*一个全局的对话框对象*/
	var mWaitingDialog = null;

	/**
	 * 由于有一些手机下载时有bug,所以添加兼容性检测,对于符合条件的手机特殊处理
	 * 这些手机都写入一个字符串  注意要是严格的机型
	 */
	var CompatibileDownloadPhones = 'TCL P588L &TCL M2M &HM 2A';

	/**
	 * @description 下载时候的兼容性检测
	 */
	win.IsCompatibleDownload = function() {
		var CurrentPhoneModel = plus.device.model;
		if (CompatibileDownloadPhones.indexOf(CurrentPhoneModel) != -1) {
			return true;
		}
		return false;
	};
	/**
	 * @description 设置服务器更新url
	 */
	win.setUpdateUrl = function(url) {
		UpdateUrl = url;
	};
	/**
	 * @description 得到当前的appid
	 */
	win.getCurrentAppid = function() {
		//alert('id:'+plus.runtime.appid);
		return plus.runtime.appid;
		//return 	"H56066BC2";
	};
	/**
	 * @description 得到当前的appVersion
	 */
	win.getCurrentAppVersion = function() {
		//alert('version:' + plus.runtime.version);
		return plus.runtime.version;
	};
	/**
	 * @description 得到当前的资源包版本号
	 */
	win.getCurrentResourceVersion = function() {
		//alert('version:'+plus.runtime.version);
		/* 一般更新资源时,用第二种
		 * 这种方式和plus.runtime.version的区别:
		 * plus.runtime.version: 获取当前应用编译后的版本号
		 * plus.runtime.getProperty... 获取当前应用的资源包里面的manifest.json里面配置的版本号
		 */
		plus.runtime.getProperty(win.getCurrentAppid(), function(wgtinfo) {
			//alert('当前资源version:' + wgtinfo.version);
			CurrentResourceVersion = wgtinfo.version;
			//CurrentResourceVersion = "1.0";
		});
	};
	/**
	 * @description 准备更新
	 */
	win.initUpdate = function(successCallback, isShowWaiting) {
		//console.log('当前手机机型:'+plus.device.model);
		//if(win.IsCompatibleDownload()==true){
		//console.log('需要兼容性下载');
		//}
		//获得当前版本
		win.getCurrentResourceVersion();
		win.getLocalDocUpdateFileDir(function(entry) {
			tmpDirPath = entry;
			win.getUpdateJsonFromServer(successCallback, isShowWaiting);
		});
	};
	/**
	 * @description 检查程序更新
	 * 手动检测是否升级  是否已过期等标记在手动下无效
	 * 有回调函数是手动检查升级
	 */
	win.checkUpdate = function(successCallback, isShowWaiting) {
		//console.log('检查更新');
		// 读取本地升级文件]
		tmpDirPath.getFile(localUpdateFile, {
			create: false
		}, function(fentry) {
			win.readJsonDataFromFentry(fentry, function(data) {
				if (data != null) {
					//console.log('更新信息:' + JSON.stringify(data));
					checkUpdateData(data, successCallback, isShowWaiting);
				}
			});
		}, function(e) {
			// 失败表示文件不存在
			$.toast('更新文件下载错误...');
		});
	};
	/**
	 * @defaultvalue 检查升级数据
	 */
	win.checkUpdateData = function(inf, successCallback, isShowWaiting) {
		//当前客户端版本号
		//console.log('检查应用包版本,当前版本:' + getCurrentAppVersion() + ",新的版本:" + inf[plus.os.name].AppVersion);
		//console.log('检查资源包版本,当前资源包版本:' + CurrentResourceVersion + ",新的资源包:" + inf[plus.os.name].ResourcePackage.resourceVersion);
		if (inf && inf[plus.os.name] && inf[plus.os.name].ResourcePackage) {
			// 判断App版本是否需要升级
			if (compareVersion(getCurrentAppVersion(), inf[plus.os.name].AppVersion) == true) {

				win.tipChooseUpdate(inf, successCallback, 1, isShowWaiting);
			} else if (compareVersion(CurrentResourceVersion, inf[plus.os.name].ResourcePackage.resourceVersion) == true
				//&& inf[plus.os.name].ResourcePackage.appid == getCurrentAppid()
			) {
				//判断资源包版本
				win.tipChooseUpdate(inf, successCallback, 0, isShowWaiting);
			} else {
				if (isShowWaiting == true) {
					$.toast('当前已经是最新版本');
				}
				//console.log('当前已经是最新版本...');
			}
		} else {
			$.toast('更新数据有误...');
		}
	};
	/**
	 * @description 提示升级
	 */
	win.tipChooseUpdate = function(inf, successCallback, typeUpdateApp, isShowWaiting) {
		//console.log('类型:' + typeUpdateApp + ',更新数据:' + JSON.stringify(inf));
		if (typeUpdateApp == 1) {
			//app更新
			ShowInfoTitle = inf[plus.os.name].InfoTitle ? inf[plus.os.name].InfoTitle : ShowInfoTitle;
			ShowInfoDetail = inf[plus.os.name].InfoDetail ? inf[plus.os.name].InfoDetail : ShowInfoDetail;
		} else {

			//资源包更新
			ShowInfoTitle = inf[plus.os.name].ResourcePackage.InfoTitle ? inf[plus.os.name].ResourcePackage.InfoTitle : ShowInfoTitle;
			ShowInfoDetail = inf[plus.os.name].ResourcePackage.InfoDetail ? inf[plus.os.name].ResourcePackage.InfoDetail : ShowInfoDetail;
			console.log('资源包升级:' + ShowInfoTitle + "," + ShowInfoDetail);
		}
		//如果是自动升级
		if (!successCallback) {
			// 提示用户是否升级
			plus.ui.confirm(ShowInfoDetail, function(e) {
				if (0 == e.index) {
					IsAbortDownload = false;
					win.downWgt(true, inf, typeUpdateApp, isShowWaiting);
				} else {
					if (inf.IsMust == "1") {
						if (plus.os.name == "Android") {
							//如果必须升级,不升级就退出
							plus.nativeUI.alert('注意!升级后才能正常使用!', function() {
								plus.runtime.quit();
							});
						} else {
							//ios的强制升级处理
							if (typeUpdateApp == "0") {
								plus.nativeUI.alert('注意!升级后才能正常使用!', function() {
									plus.runtime.quit();
								});
							}
						}
					}
				}
			}, ShowInfoTitle, ["立即更新", "下次再说"]);
		} else {
			successCallback();
		}
	};
	/**
	 * @description 比较两个版本大小
	 * 比较版本大小，如果新版本nowVersion大于旧版本OldResourceVersion则返回true，否则返回false
	 */
	win.compareVersion = function(OldVersion, nowVersion) {
		if (!OldVersion || !nowVersion || OldVersion == '' || nowVersion == '') {
			$.toast('版本号获取错误,检查更新失败...');
			return false;
		}
		//第二份参数 是 数组的最大长度
		var OldVersionA = OldVersion.split(".", 4);
		var nowVersionA = nowVersion.split(".", 4);
		for (var i = 0; i < OldVersionA.length && i < nowVersionA.length; i++) {
			var strOld = OldVersionA[i];
			var numOld = parseInt(strOld);
			var strNow = nowVersionA[i];
			var numNow = parseInt(strNow);
			//小版本到高版本
			if (numNow > numOld
				//||strNow.length>strOld.length
			) {
				return true;
			} else if (numNow < numOld) {
				return false;
			}
		}
		//如果是更新小版本  如 1.6 - 1.6.1
		if (nowVersionA.length > OldVersionA.length && 0 == nowVersion.indexOf(OldVersion)) {
			return true;
		}
	};
	/**
	 * @description error后的回调处理
	 * 提示请求超时,并重新将状态设置
	 */
	win.errorRequestCallback = function(xhr, type, errorThrown) {
		$.toast('请求超时,请重新请求!');
		if(mWaitingDialog!=null){
			mWaitingDialog.close();
		}
	};
	/**
	 * @description 从服务器获取更新的json文件
	 */
	win.getUpdateJsonFromServer = function(successCallback, isShowWaiting) {
		//存储到 doc下的update里面	
		var updateFilePath = localUpdatePackageFileDir + localUpdateFile;
		//console.log('路径:' + updateFilePath + ',服务器地址:' + UpdateUrl);
		//请求前先删除
		win.delFile(updateFilePath);
		var options = {
			filename: updateFilePath,
			timeout: 6,
			retry: 1,
			retryInterval: 1
		};
		if (isShowWaiting == true) {
			mWaitingDialog =plus.nativeUI.showWaiting('请求更新数据文件...');
		}
		var dtask = plus.downloader.createDownload(UpdateUrl, options, function(d, status) {
			if (status == 200) {
				//console.log("请求更新文件成功：" + d.filename);
				if(mWaitingDialog!=null){
					mWaitingDialog.close();
				}
				win.checkUpdate(successCallback, isShowWaiting);
			} else {
				//console.log("请求更新文件失败！");
				//$.toast("请求更新文件失败！");
				if(mWaitingDialog!=null){
					mWaitingDialog.close();
				}
			}
		});
		dtask.start();
	};
	/**
	 * @description 下载WGT
	 */
	win.downWgt = function(isShowProgressbar, inf, typeUpdateApp) {
		////console.log('开始下载');
		var upUrl = '';
		if (typeUpdateApp == 1) {
			//app升级
			upUrl = inf[plus.os.name].AppUrl;
			if (plus.os.name == "iOS") {
				//如果是ios系统				
				if (!inf[plus.os.name].AppUrl || inf[plus.os.name].AppUrl == "") {
					$.toast('请前往appStore下载最新版本的iOS应用...');
					return;
				}
				$.toast('请前往appStore下载最新版本的iOS应用...');
				//plus.runtime.openURL(inf[plus.os.name].AppUrl);
				return;
			} else {
				if (!inf[plus.os.name].AppUrl || inf[plus.os.name].AppUrl == "") {
					$.toast('新版本地址错误,请联系服务商...');
					return;
				}
			}
		} else if (typeUpdateApp == 0) {
			if (!inf[plus.os.name].ResourcePackage.resourceUrl || inf[plus.os.name].ResourcePackage.resourceUrl == "") {
				$.toast('新的资源包地址错误,请联系服务商...');
				return;
			}
			upUrl = inf[plus.os.name].ResourcePackage.resourceUrl;
		} else {
			$.toast('升级类型错误,停止下载...');
			return;
		}
		var showProgressbar;
		//截取url里面的文件名
		var filename = localUpdatePackageFileDir + upUrl.substring(upUrl.lastIndexOf("/") + 1, upUrl.length);
		var options = {
			filename: filename,
			timeout: 6,
			retry: 1,
			retryInterval: 1
		};
		if (isShowProgressbar) {
			var showWaitingOption = {
				back: "close"
			};
			showProgressbar = plus.nativeUI.showWaiting('开始下载...', showWaitingOption);
		}
		//先删除原来的
		win.delFile(filename);
		//console.log('下载更新包:' + upUrl);
		var dtask = plus.downloader.createDownload(upUrl, options, function(d, status) {
			if (status == 200) {
				//console.log("下载更新包成功：" + d.filename);
				//先存储一个老版本
				OldResourceVersion = CurrentResourceVersion;
				OldAppVersion = getCurrentAppVersion();
				if (IsAbortDownload == false) {
					// 安装更新包
					setTimeout(installWgt(d.filename, isShowProgressbar, inf, typeUpdateApp), 3000);
				}
			} else {
				//console.log("下载更新包失败！");
				if (isShowProgressbar) {
					plus.nativeUI.alert("下载更新资源失败！");
				}
			}
		});
		if (isShowProgressbar) {
			var i = 0,
				progress = 0;
			dtask.addEventListener("statechanged", function(task, status) {
				switch (task.state) {
					case 1: // 开始
						showProgressbar.setTitle("开始下载...");
						break;
					case 2: // 已连接到服务器
						showProgressbar.setTitle("正在下载...");
						break;
					case 3:
						//排除兼容性下载的机型,这些型号的机子下载时不能有进度条
						//if(win.IsCompatibleDownload()==true){
						//	break;
						//}
						if (task.totalSize != 0) {
							var progress = task.downloadedSize / task.totalSize * 100;
							progress = Math.round(progress);
							if (progress == i) {
								i += 5;
								//console.log('下载信息:' + task.totalSize + "," + task.downloadedSize);
								showProgressbar.setTitle("正在下载" + parseInt(progress) + "%");
							}
						}
						break;
					case 4: // 下载完成
						IsDownloadCompleted = true;
						showProgressbar.close();
						break;
				}
			});
			showProgressbar.onclose = function() {
				//console.log('关闭下载...IsAbortDownload:'+IsAbortDownload);
				if (IsDownloadCompleted == false) {
					IsAbortDownload = true;
				}
				//alert('关闭下载任务!');
				dtask.abort();
			};
		}
		dtask.start();
	};
	/**
	 * @defaultvalue 安装更新包
	 */
	win.installWgt = function(path, isShowProgressbar, inf, typeUpdateApp) {
		if (IsAbortDownload == true) {
			return;
		}
		if (isShowProgressbar) {
			mWaitingDialog = plus.nativeUI.showWaiting("在线升级，安装更新文件...");
		}
		plus.runtime.install(path, {
			force: true
		}, function() {
			if (isShowProgressbar) {
				if(mWaitingDialog!=null){
					mWaitingDialog.close();
				}
				//删除更新文件
				//win.delFile(path);
				var fileName = 'default.json';
				if (typeUpdateApp == 1) {
					//如果是app大版本更新 写入更新历史
					fileName = 'updateHistory_typeApp_' + OldAppVersion + '_' + inf[plus.os.name].AppVersion + '.json';
				} else {
					//如果是小版本更新
					fileName = 'updateHistory_typeResource_' + win.getCurrentAppid() + '_' + OldResourceVersion + '_' + inf[plus.os.name].ResourcePackage.resourceVersion + '.json';
				}
				if (IsAbortDownload == false) {
					win.writeDataToLocalDocUpdatefile(fileName, JSON.stringify(inf), function() {
						$.toast('写入更新历史成功');
					});
					plus.nativeUI.alert("应用资源更新完成！", function() {
						plus.runtime.restart();
					});
				}

			}
			//console.log("安装更新文件成功！");

		}, function(e) {

			//console.log("安装更新文件失败[" + e.code + "]：" + e.message);
			if (isShowProgressbar) {
				if(mWaitingDialog!=null){
					mWaitingDialog.close();
				}
				win.delFile(path);
				plus.nativeUI.alert("在线升级，安装更新文件失败");
			}
		});
	};
	/**
	 * @description 删除	指定文件
	 */
	win.delFile = function(relativePath) {
		plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
			entry.remove(function(entry) {
				//console.log("文件删除成功==" + relativePath);
			}, function(e) {
				//console.log("文件删除失败=" + relativePath);
			});
		}, function() {
			//console.log("打开文件路径失败==" + relativePath);
		});
	};
	/**
	 * @description 获取一个本地doc/update的文件夹对象
	 */
	win.getLocalDocUpdateFileDir = function(successCallback) {
		//		plus.io.resolveLocalFileSystemURL(localUpdatePackageFileDir, function(entry) {
		//			if (successCallback && typeof(successCallback) == 'function') {
		//				successCallback(entry);
		//			}
		//		}, function(e) {
		//			//console.log("准备操作，打开update目录失败：" + e.message);
		//		});
		plus.io.resolveLocalFileSystemURL(localUpdatePackageFileDir, function(entry) {
			if (successCallback && typeof(successCallback) == 'function') {
				successCallback(entry);
			}
		}, function(e) {
			plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, function(fs) {
				fs.root.getDirectory(localUpdateFileDir, {
					create: true
				}, function(entry) {
					if (successCallback && typeof(successCallback) == 'function') {
						successCallback(entry);
					}
				}, function(e) {
					$.toast('打开update目录失败...');
					//console.log("准备操作，打开update目录失败：" + e.message);
				});
			}, function(e) {
				//console.log("准备操作，打开download目录失败：" + e.message);
			});
		});

	};
	/**
	 * @description 写入数据到对应的doc目录下的文件里面
	 */
	win.writeDataToLocalDocUpdatefile = function(localFileName, strData, successCallback) {
		if (tmpDirPath == null) {
			win.getLocalDocUpdateFileDir(function(entry) {
				tmpDirPath = entry;
				win.writeDataToLocalDocUpdatefile(localFileName, strData, successCallback);
			});
		}
		//保存到本地文件
		tmpDirPath.getFile(localFileName, {
			create: true
		}, function(fentry) {
			win.saveDataToLocalfentry(fentry, strData, function() {
				if (successCallback && typeof(successCallback) == 'function') {
					successCallback();
				}
			});
		}, function(e) {
			//console.log("写入数据，打开保存文件失败：" + e.message);
		});
	};
	/**
	 * @description 保存字符串数据到本地文件
	 * 参数必须是 字符串格式的数据
	 */
	win.saveDataToLocalfentry = function(fentry, strData, successCallback) {
		if (!fentry || fentry.isFile == false) {
			//console.log('目标文件对象有误!');
			return;
		}
		fentry.createWriter(function(writer) {
			writer.onerror = function() {
				//console.log("写入数据，保存文件失败！");
			};
			////console.log("开始写入,保存文件");
			//写入数据时必须换位字符串
			writer.write(strData);
			//console.log("写入数据，保存文件成功！");
			if (successCallback && typeof(successCallback) == "function") {
				successCallback();
			}
		}, function(e) {
			//console.log("创建写文件对象失败：" + e.message);
		});
	};
	/**
	 * @description 读取一个fentry里面的数据,最终的数据转化为json
	 * 如果读取文件失败,则会删除文件  如果转换json失败,则会返回 null
	 */
	win.readJsonDataFromFentry = function(fentry, successCallback) {
		if (!fentry || fentry.isFile == false) {
			//console.log('目标文件对象有误!');
			return;
		}
		fentry.file(function(file) {
			var reader = new plus.io.FileReader();
			reader.onloadend = function(e) {
				var data = null;
				try {
					data = JSON.parse(e.target.result);
				} catch (e) {
					$.toast("读取本地升级文件，数据格式错误！");
				}
				if (successCallback && typeof(successCallback) == "function") {
					successCallback(data);
				}
			}
			reader.readAsText(file);
		}, function(e) {
			//console.log("读取本地升级文件，获取文件对象失败：" + e.message);
			fentry.remove();
		});
	};
})(mui, Zepto, window);
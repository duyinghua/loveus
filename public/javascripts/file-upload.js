//http://www.zhangxinxu.com/wordpress/?p=1923
/**
 * var fname = req.header('x-file-name');
 fname = decodeURI(fname);
 var tmpfile = __dirname + '/upload/tmp/' + fname;
 var ws = fs.createWriteStream(tmpfile);
 ws.on('error', function (err) {
        console.log("uploadFile() - req.xhr - could not open writestream.");
        callback({success: false, error: "Sorry, could not open writestream."});
    });
 ws.on('close', function (err) {
        res.send("success");
    });

 // Writing filedata into writestream
 req.on('data', function (data) {
        ws.write(data);
    });
 req.on('end', function () {
        ws.end();
    });
 * @param config
 * @constructor
 */
function FileUpload(config) {
    var defaultConfig = {
        fileInput: null,				//html type=file
        upButton: null,					//提交按钮
        url: "",
        files: [],					//过滤后的文件数组
        filter: function (files) {		//选择文件组的过滤方法
            var arrFiles = [];
            for (var i = 0, file; file = files[i]; i++) {
                arrFiles.push(file);
            }
            return arrFiles;
        },
        onSelect: function () {
        },		//文件选择后
        onDelete: function () {
        },		//文件删除后
        onProgress: function () {
        },		//文件上传进度
        onSuccess: function (file) {
            $.toast("上传完成：" + file.name)
        },		//文件上传成功时
        onFailure: function (file) {
            $.toast("上传失败：" + file.name)
        },		//文件上传失败时,
        onComplete: function () {
            $.toast("图片上传完成");
        }		//文件全部上传完毕时
    };
    defaultConfig = $.extend(defaultConfig, config);
    this.fileInput = defaultConfig.fileInput;
    this.upButton = defaultConfig.upButton;
    this.url = defaultConfig.url;
    this.files = defaultConfig.files;
    this.filter = defaultConfig.filter;
    this.onSelectBefore = defaultConfig.onSelectBefore;
    this.onSelect = defaultConfig.onSelect;
    this.onDelete = defaultConfig.onDelete;
    this.onProgress = defaultConfig.onProgress;
    this.onSuccess = defaultConfig.onSuccess;
    this.onFailure = defaultConfig.onFailure;
    this.onComplete = defaultConfig.onComplete;
    this.init();
}
//获取选择文件
FileUpload.prototype.getFiles = function (e, max) {
    // 获取文件列表对象
    var files = e.target.files || e.dataTransfer.files;

    if (files.length > max) {
        $.toast(" 一次上传不能超过" + max + "张");
        return  this;
    }
    //继续添加文件
    this.files = this.filter(files);//this.files.concat(this.filter(files));
    this.dealFiles();
    return this;
};

//选中文件的处理与回调
FileUpload.prototype.dealFiles = function () {
    for (var i = 0, file; file = this.files[i]; i++) {
        //增加唯一索引值
        file.index = i;
    }
    //执行选择回调
    this.onSelect(this.files);
    return this;
};

//删除对应的文件
FileUpload.prototype.deleteFile = function (fileDelete) {
    var arrFile = [];
    for (var i = 0, file; file = this.files[i]; i++) {
        if (file != fileDelete) {
            arrFile.push(file);
        } else {
            this.onDelete(fileDelete);
        }
    }
    this.files = arrFile;
    return this;
};
FileUpload.prototype.uploadFile = function (self, e) {
    self = self || this;
    /*
     for (var i = 0; i < self.files.length; i++) {
     var file = self.files[i];
     self.ajaxUpload(file);
     }
     */
    self.files.length && self.ajaxUpload(0, arguments.callee);
};
FileUpload.prototype.ajaxUpload = function (index, callback) {
    var self = this;
    var file = self.files[index];
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
        // 上传中
        xhr.upload.addEventListener("progress", function (e) {
            self.onProgress(file, e);
        }, false);
        // 文件上传成功或是失败
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var resdata = JSON.parse(xhr.responseText);
                    self.onSuccess && self.onSuccess(file, resdata);
                    self.deleteFile(file);
                    if (!self.files.length) {
                        //全部完毕
                        return self.onComplete && self.onComplete();
                    }
                } else {
                    self.onFailure && self.onFailure(file, xhr.responseText);
                }
                callback(self, index);
            }
        };
        // 开始上传
        xhr.open("POST", self.url, true);
        xhr.setRequestHeader("x-file-name", encodeURI(file.name));
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//        xhr.setRequestHeader("Content-Type", "image/*");
        xhr.send("imgData=" + file.dataURL);
    }
}
FileUpload.prototype.init = function () {
    var self = this;

    var fileInput = self.fileInput;
    //文件选择控件选择
    if (fileInput) {
        if (typeof(fileInput) == "string") {
            fileInput = document.getElementById(fileInput);
        }
        fileInput.addEventListener("change", function (e) {
            self.onSelectBefore(e.target.files.length);
            self.getFiles(e, this.getAttribute("max"));
        }, false);
    }

    //上传按钮提交
    if (self.upButton) {
        self.upButton.addEventListener("click", function (e) {
            self.uploadFile(self, e);
        }, false);
    }
}

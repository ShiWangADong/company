window.frameWork = (function ($) {
    // 随机图标数组
    var iconArray = ['grid', 'msg', 'list', 'star-tag', 'sim', 'camera', 'web', 'user-group', 'voice', 'user', 'theme', 'tips', 'sew', 'framework', 'process'];
    var colorArray = ['green', 'purple', 'deep-purple', 'blue', 'deep-blue', 'light-blue', 'orange', 'red', 'deep-red', 'light-red'];
    var numArray = ['#01c0c8', '#fb9678', '#9675ce', '#03a9f3', '#00bf8c', '#4b5566', '#fec107'];
    var activeClassName = 'active';//选中状态
    var unfurledActive = 'active'//展开状态
    var bodyHideMenuClass = 'body-hide-menu';
    var initMenuParams = ['first-menu', 'second-menu'];
    var visibleClass = 'visible';
    var bodyNoMenuClass = 'body-no-menu';
    var homeUrl = 'template/home.html';
    var currentMenuID;
    var initFlag = false;

    var $initEl;

    var $mainTitle;
    var $mainPath;
    var $mainAdd;
    var $menuContent;
    var $headerMenu;
    var $headerMenuContent;
    var $homeContent;
    var $body;
    var $bodyRight;
    var $bodyContent;
    var $mainSearch;
    var $homeQueryInput;
    var $menuToggle;
    var $mainToolContent;
    var $mainBody;
    var $mainBodyShadow;
    var $firstMenuToggle;
    var $firstMenu;
    var $wrapperMenuShadow;
    var $progressBarContent;
    var $progressBar;
    var $progressBarTitle;

    // 初始化layout、元素
    var initLayout = function (options) {
        if (!$mainTitle) {
            $mainTitle = $('.main-title');
            $mainPath = $('.main-path');
            $homeContent = $('.home-content');
            $menuContent = $('.menu-wrapper');
            $body = $('.body');
            $bodyContent = $('.main-content');
            $bodyRight = $('.body-right');
            $mainSearch = $('.main-search');
            $homeQueryInput = $('.home-query-input');
            $menuToggle = $('.menu-toggle');
            $mainAdd = $('.main-add');
            $mainToolContent = $('.main-tool-content');
            $mainBody = $('.main-body');
            $mainBodyShadow = $('.main-body-shadow');
            $headerMenu = $('.header-menu');
            $headerMenuContent = $('.header-menu-content');
            $firstMenu = $('.first-menu');
            $firstMenuToggle = $('.first-menu-toggle');
            $wrapperMenuShadow = $('.wrapper-menu-shadow');

            $progressBarContent = $('<div class="cus-progress-content"></div>').appendTo(document.body);
            $progressBarTitle = $('<div class="cus-progress-title"></div>');
            $progressBar =
                $('<div class="cus-progress"></div>').progressbar({
                    value: false,
                    change: function () {
                        $progressBarTitle.text($progressBar.progressbar("value") + "%");
                    },
                    complete: function () {
                        hideProgressBar();
                    }
                }).appendTo($progressBarContent);
            $progressBarTitle.appendTo($progressBar);
        }
    };

    // 绑定menu的数据
    var bindMenu = function (data, $parent, level, parentTitle) {
        var levelClass = initMenuParams[level];
        var $ul = $parent;
        $.each(data, function (index, item) {
            var itemTitle = item.title;
            var itemID = item.id;
            var itemUrl = item.url;
            var $li =
                $('<li></li>').appendTo($ul);
            var currentIcon = item.img.replace(/ /g, '') || iconArray[parseInt(Math.random() * iconArray.length)];
            var numColor = numArray[index];

            var $menuTitle =
                $('<div class="menu-title">\
                    <i class="iconfont icon-' + currentIcon + '"></i>' + itemTitle + '</div>').appendTo($li).data('menuData', {
                    id: itemID,
                    title: itemTitle
                });

            //渲染1级菜单
            if (item.data) {
                var $secondMenuUl = $('<ul></ul>').appendTo('.second-menu').data('parentID', itemID);
                bindMenu(item.data, $secondMenuUl, (level + 1), itemTitle);
                $menuTitle.click(function () {
                    if (item.data.length === 0) {
                        $body.addClass(bodyNoMenuClass);
                    } else {
                        $body.removeClass(bodyNoMenuClass);
                    }
                    if ($headerMenu.hasClass('show-all')) {
                        $firstMenu.css('transform', 'translateY(-' + $menuTitle.offset().top + 'px)');
                    }
                    resetHeaderMenu();
                    $menuContent.scrollTop(0);
                    $wrapperMenuShadow.click();
                    if (!$li.hasClass(unfurledActive)) {
                        $ul.children('li.' + unfurledActive).removeClass(unfurledActive);
                        $li.addClass(unfurledActive);
                        $menuContent.find('ul.' + activeClassName).removeClass(activeClassName);
                        $secondMenuUl.addClass(activeClassName);
                    }
                });
            }

            if (itemUrl) {
                // 渲染2级菜单
                $menuTitle.addClass('menu-url').click(function () {
                    var animateTime = 0;
                    if (itemUrl) {
                        $mainBodyShadow.removeClass(visibleClass);
                        $menuContent.find('.second-menu li.' + activeClassName).removeClass(activeClassName);
                        $li.addClass(activeClassName);
                        $li.parents('li').addClass(activeClassName).siblings().removeClass();
                        // 获取父对应一级菜单的ID
                        var parentID = $li.parent('ul').data('parentID');
                        $headerMenuContent.find('.menu-title').each(function () {
                            var $tempParent = $(this);
                            if ($tempParent.data('menuData') && $tempParent.data('menuData').id === parentID) {
                                $tempParent.click();
                                return false;
                            }
                        });
                        if (appConfig.mod === 'test') {
                            setPanelTitle({
                                mainTitle: parentTitle,
                                pathData: [
                                    {
                                        title: itemTitle, url: function () {
                                        $menuTitle.click();
                                    }
                                    },
                                    {
                                        title: '添加页面', url: function () {
                                        showAlert('您现在正处在添加页面出！')
                                    }
                                    }
                                ]
                            });
                            ajaxPostHtml(itemUrl, {});
                        } else {
                            if (initFlag) {
                                window.location.href = itemUrl;
                            } else {
                                initFlag = true;
                            }
                        }
                    } else {
                        showAlert('菜单没有配置url');
                    }
                    setTimeout(function () {
                        var offsetTopDiff = ($menuTitle.offset().top + $menuContent.scrollTop() - $menuContent.height() / 2 - $menuContent.offset().top - $menuContent.scrollTop()) || 1;
                        var slope = Math.abs(offsetTopDiff) / offsetTopDiff;
                        // 总共的距离/(动画时间/(一秒/显示器频率))
                        var scrollRate = offsetTopDiff / (200 / (1000 / 60));

                        function initScroll() {
                            var currentScrollTop = $menuContent.scrollTop();
                            if ((slope > 0 && offsetTopDiff > 0) || (slope < 0 && offsetTopDiff < 0)) {
                                $menuContent.scrollTop(currentScrollTop + scrollRate);
                                offsetTopDiff = offsetTopDiff - scrollRate;
                                requestAnimationFrame(initScroll);
                            }
                        }

                        requestAnimationFrame(initScroll);
                    }, animateTime);
                });
            }
            //根据索引值找到对应的元素
            if (itemID == currentMenuID) {
                $initEl = $menuTitle;
            }
        });
        return $ul;
    };

    var resetHeaderMenu = function () {
        $wrapperMenuShadow.removeClass(visibleClass);
        $headerMenu.removeClass('show-all');
        $headerMenuContent.css('height', '2rem');
    };

    var ajaxPostHtml = function (url, dataParams) {
        $bodyContent.children().remove();
        $bodyRight.ajaxLoading({
            title: '正在加载数据，请稍后...',
            ajaxSettings: {
                url: url,
                type: 'get',
                dataType: 'html',
                data: dataParams,
                success: function (data) {
                    try {
                        $homeContent.removeClass(activeClassName);
                        $(data).appendTo($bodyContent);
                    } catch (err) {
                        showToast(err.message);
                    } finally {

                    }
                }
            }
        });
    };

    // 初始化menu的数据
    var initMenuData = function (menuData) {
        // 显示扩展菜单按钮
        if (menuData.length <= 4) {
            $firstMenuToggle.hide();
        } else {
            $firstMenuToggle.click(function () {
                $headerMenu.addClass('show-all');
                var menuCount = menuData.length;
                $headerMenuContent.css('height', ((menuCount / 4 + (menuCount % 4 ? 1 : 0)) * 2) + 'rem');
                $wrapperMenuShadow.addClass(visibleClass);
            })
        }

        bindMenu(menuData, $firstMenu, 0, '');

        // 背景的点击事件
        $mainBodyShadow.click(function () {
            toggleSearchContent();
        });

        // 菜单背景的点击事件
        $wrapperMenuShadow.click(function () {
            resetHeaderMenu();
        });

        // 绑定主页数据
        $homeContent.html('');

        $menuToggle.click(function () {
            if ($body.hasClass(bodyHideMenuClass)) {
                $body.removeClass(bodyHideMenuClass);
            } else {
                $body.addClass(bodyHideMenuClass);
            }
        });

        // 首页的搜索框进行筛选的事件
        $homeQueryInput.keyup(function (e) {
            console.log(e);
            //如果按的是enter就触发第一个的点击事件;
            if (e.originalEvent.keyCode == 13) {
                $homeContent.children('.home-item:visible:first').click();
            } else {
                var searchValue = this.value;
                var homeItemArray = $homeContent.children('.home-item');
                if (searchValue) {
                    homeItemArray.each(function () {
                        var $homeItem = $(this);
                        var homeItemData = $homeItem.data('menuData');
                        if (homeItemData.title.indexOf(searchValue) > -1) {
                            $homeItem.show();
                        } else {
                            $homeItem.hide();
                        }
                    })
                } else {
                    homeItemArray.show();
                }
            }
        });

        if ($initEl) {
            $initEl.click();
        }
    };

    // 初始化
    var initMenu = function (options) {
        var menuData = options.menuData;
        currentMenuID = options.currentMenuID;

        if (typeof menuData == 'object') {
            initMenuData(menuData);
        } else {
            $(document.body).ajaxLoading({
                title: '正在加载菜单，请稍后...',
                ajaxSettings: {
                    url: menuData,
                    type: 'POST',
                    dataType: 'json',
                    success: function (data) {
                        initMenuData(data);
                    }
                }
            })
        }
        initToolTip('.main-search');
    };

    // 显示进度条
    var showProgressBar = function (value) {
        $progressBar.progressbar("value", value || 0);
        $progressBarContent.addClass('active');
    };

    // 隐藏进度条
    var hideProgressBar = function () {
        $progressBarContent.removeClass('active');
        //$progressBar.progressbar("value", 0);
    };

    // 设置进度条的值
    var setProgressBarValue = function (value) {
        $progressBar.progressbar("value", value || 0);
    };

    // 绑定标题头信息
    var setPanelTitle = function (panelTitle) {
        var settings = $.extend({
            pathData: []
        }, panelTitle);

        var pathData = settings.pathData;
        // 如果元素不存在，则需要重新获取
        if (!$mainPath) {
            initLayout();
        }
        $mainPath.html('');
        // 绑定path数据
        if (pathData && pathData.length) {
            $.each(settings.pathData, function (index, item) {
                var itemTitle = item.title;
                if (itemTitle) {
                    var $aItem = $('<a>' + itemTitle + '</a>').appendTo($mainPath);
                    var tempUrl = item.url;
                    if (tempUrl) {
                        $aItem.addClass(activeClassName);
                        if (typeof tempUrl == 'string') {
                            $aItem.attr('href', tempUrl);
                        } else {
                            $aItem.attr('href', '#').click(function () {
                                tempUrl();
                            })
                        }
                    } else {
                        $aItem.attr('href', '#');
                    }
                }
            })
        }
    };

    // 初始化按钮
    var setPanelControl = function (controlData) {

        var settings = $.extend({
            mainTitle: '<span><i class="iconfont icon-home1"></i>工厂维护</span>',
            searchBtnCall: false,
            button: []
        }, controlData);

        // 如果元素不存在，则需要重新获取
        if (!$mainTitle) {
            initLayout();
        }

        $mainTitle.html(settings.mainTitle);

        $mainToolContent.children('.btn,.icon-img,.apply-select').remove();
        //$mainToolContent.html('');
        // 绑定查询按钮
        if (!settings.searchBtnCall) {
            $mainSearch.hide();
        } else {
            $mainSearch.show();
            if (settings.searchBtnCall === true) {
                $mainSearch.unbind('click').click(function () {
                    toggleSearchContent();
                });
            } else {
                $mainSearch.unbind('click').click(function () {
                    settings.searchBtnCall();
                })
            }
        }

        var titleButtons = settings.button;
        // 绑定添加按钮
        if (titleButtons && titleButtons.length) {
            if (titleButtons.length <= 2) {
                $.each(titleButtons, function (index, item) {
                    panelControl(index, item, $mainToolContent);
                });
            } else {
                var $applySelectBox = $('<div class="apply-select"></div>');
                var $applySelect = $('<i class="iconfont icon-apply-select"><i>');
                var $ul = $('<ul></ul>');
                $applySelect.appendTo($applySelectBox);
                $ul.appendTo($applySelectBox);
                $applySelectBox.on('mouseover', function () {
                    $ul.stop().slideDown(200);
                }).on('mouseleave', function () {
                    $ul.stop().slideUp(200);
                })
                $.each(titleButtons, function (index, item) {
                    if (index == 0) {
                        panelControl(index, item, $mainToolContent)
                    } else {
                        var $li = $('<li></li>');
                        panelControl(index, item, $li);
                        $li.appendTo($ul);
                    }
                });
                $applySelectBox.appendTo($mainToolContent);
            }
        }
    }

    var fixtableHead = function ( $table ){
        if($.fn.DataTable){
            $table.DataTable({
                "scrollY": 'calc(100vh - 8.7rem)',
                "scrollCollapse": true,
                "scrollX": true,
                "ordering": false,
                "paging":false,
                "searching":false,
                "info":false
            });
        }
    } ;

    //渲染按钮
    function panelControl(index, item, $itemBox) {
        if (typeof item == 'function') {
            item().appendTo($itemBox);
        } else {
            var itemTitle = item.title;
            if (itemTitle) {
                var $aItem = $('<a class="btn"><i class="iconfont icon-' + item.icon + '"></i>' + itemTitle + '</a>').appendTo($itemBox);
                var tempUrl = item.url;
                if (tempUrl) {
                    if (typeof tempUrl == 'string') {
                        $aItem.attr('href', tempUrl);
                    } else {
                        $aItem.attr('href', '#').click(function () {
                            tempUrl();
                        })
                    }
                } else {
                    $aItem.attr('href', '#');
                }
            }
        }
    }

    // 初始化方法
    var init = function (options) {
        homeUrl = options.homeUrl || homeUrl;
        initLayout(options);
        initMenu(options);
        setPanelTitle(options.panelTitle);
        setPanelControl(options.panelControl);
    };

    var toggleSearchContent = function () {
        var $tempTableQuery = $('.table-query');
        if ($tempTableQuery.hasClass(visibleClass)) {
            $mainBodyShadow.removeClass(visibleClass);
            $tempTableQuery.removeClass(visibleClass);
            $mainBody.css('overflow-y', 'visible');
            $mainSearch.removeClass(activeClassName);
        } else {
            $mainBody.scrollTop(0);
            $mainBodyShadow.addClass(visibleClass);
            $tempTableQuery.addClass(visibleClass);
            $mainBody.css('overflow-y', 'hidden');
            $mainSearch.addClass(activeClassName);
        }
    }

    var initLongText = function (selector) {
        setTimeout(function () {
            $(selector).map(function () {
                if (this.offsetWidth < this.scrollWidth) {
                    $(this).addClass('overflowColor');
                    $(this).on('click', function () {
                        layer.open({
                            content: $(this).text()
                        });
                    })
                }
            })
        }, 200);
    };

    var initToolTip = function (selector, position, text) {
        var tipPosition = {
            'top': 1,
            'right': 2,
            'bottom': 3,
            'left': 4
        };
        var resultPosition = tipPosition[position || 'bottom'];
        $(selector).hover(function () {
            var that = this;
            var tempText = text || $(this).attr('tooltip');
            if (tempText) {
                layer.tips(tempText, that, {
                    tips: resultPosition
                })
            }
        }, function () {
            layer.closeAll('tips');
        })
    };

    var initCheckbox = function (className) {
        var $className = $('.' + className);
        $className.each(function () {
            var $input = $(this).find('input');
            if (!$input.attr('id')) {
                $input.next('label').click(function () {
                    if (!$input.prop('checked')) {
                        $input.prop('checked', 'checked')
                    } else {
                        $input.prop('checked', '')
                    }
                })
            }
        })
    };
    var showDetailFile = function (url) {
        $('.detail-file').html('');
        var $layerContent = $('<div class="detail-file"></div>').appendTo(document.body);
        var $img = $('<img src="' + url + '"/>').appendTo($layerContent);
        layer.open({
            type: 1,
            offset: ["10%", "10%"],
            area: ['80%', '80%'],
            title: false,
            closeBtn: true,
            btn: false,
            shadeClose:true,
            yes: function (index) {
                layer.close(index);
            },
            end: function (index) {
                layer.close(index);
            },
            content: $layerContent
        });
        var imgHeight = $img.height();
        var imgWidth = $img.width();
        var layerContentHeight = $layerContent.height();
        var layerContentWidth = $layerContent.width();
        var larerPercentum = layerContentHeight / layerContentWidth;
        var imgPercentum = imgHeight / imgWidth;
        if (imgPercentum > larerPercentum) {
            $img.css("height", "100%")
        } else {
            $img.css("width", "100%")
        }
    };

    var initInputLength = function (selector) {
        $(selector).each(function (i, e) {
            var dataLength = parseInt($(e).attr('maxlength'));
            var dataType = $(e).attr('data-type') || '0';
            //如果没有传值的话就不计算
            if (isNaN(dataLength)) {
                return;
            }
            var inputLength = (dataType == '0') ? (0.5 * dataLength + 1) : (dataLength + 1);
            if (inputLength * 20 >= parseInt($(e).parents('div').width())) {
                return;
            }
            $(e).css({
                display: 'block'
            });

            $(e).css({
                width: inputLength + 'rem'
            })
        })
    };


    return {
        init: function (options) {
            init(options);
            initFlag = true;
            
            //实现对字符码的截获，keypress中屏蔽了这些功能按键  
            document.onkeypress = banBackSpace;  
            //对功能按键的获取  
            document.onkeydown = banBackSpace;  
        },
        setPanelTitle: function (panelTitle) {
            setPanelTitle(panelTitle);
        },
        setPanelControl: function (panelControl) {
            setPanelControl(panelControl);
        },
        initLongText: function (selector) {
            return initLongText(selector);
        },
        initCheckbox: function (className) {
            return initCheckbox(className);
        },
        initToolTip: function (selector, postion, text) {
            initToolTip(selector, postion, text)
        },
        initInputLength: function (selector) {
            initInputLength(selector);
        },
        showDetailFile: function (url) {
            showDetailFile(url)
        },
        toggleSearchContent: function () {
            toggleSearchContent();
        },
        setTableMinWidth:function(selector){
            setTableMinWidth(selector);
        },
        fixtableHead:function($table){
            fixtableHead($table);
        },
        progressBar: {
            show: function (value) {
                showProgressBar(value);
            },
            hide: function () {
                hideProgressBar();
            },
            value: function (value) {
                setProgressBarValue(value);
            }
        }
    }

})(jQuery);


//屏蔽ie  360按 back space 的回退事件
function banBackSpace(e) {  
    var ev = e || window.event;  
    //各种浏览器下获取事件对象  
    var obj = ev.relatedTarget || ev.srcElement || ev.target || ev.currentTarget;  
    //按下Backspace键  
    if (ev.keyCode == 8) {  
        var tagName = obj.nodeName //标签名称  
        //如果标签不是input或者textarea则阻止Backspace  
        if (tagName != 'INPUT' && tagName != 'TEXTAREA') {  
            return stopIt(ev);  
        }  
        var tagType = obj.type.toUpperCase();//标签类型  
        //input标签除了下面几种类型，全部阻止Backspace  
        if (tagName == 'INPUT' && (tagType != 'TEXT' && tagType != 'TEXTAREA' && tagType != 'PASSWORD' && tagType != 'NUMBER' && tagType != 'SEARCH')) {  
            return stopIt(ev);  
        }  
        //input或者textarea输入框如果不可编辑则阻止Backspace  
        if ((tagName == 'INPUT' || tagName == 'TEXTAREA') && (obj.readOnly == true || obj.disabled == true)) {  
            return stopIt(ev);  
        }  
    }  
}  
function stopIt(ev) {  
    if (ev.preventDefault) {  
        //preventDefault()方法阻止元素发生默认的行为  
        ev.preventDefault();  
    }  
    if (ev.returnValue) {  
        //IE浏览器下用window.event.returnValue = false;实现阻止元素发生默认的行为  
        ev.returnValue = false;  
    }  
    return false;  
}  


/**
 * 自定义弹出框
 * @param msg 需要显示的信息
 * @param callBack 关闭后的回调
 */
var showAlert = function (msg,callBack) {
    layer.alert('<div class="layer-confirm">' + msg + '</div>', {
        shadeClose: true,
        resize: false,
        end:function () {
            if(callBack){
                callBack();
            }
        },
        closeBtn: 0
    });
};

/**
 * 自定义确认对话框
 * @param msg 对话框提示信息
 * @param okCallBack 点击确定的回调
 * @param cancelBack 点击取消的回调
 */
var showConfirm = function (msg, okCallBack, cancelBack) {
    layer.open({
        type: 0
        , offset: ["200px"]
        , title: '提示'
        , shade: 0.5
        , resize: false
        , maxmin: false
        , shadeClose: true
        , anim: 0
        , move: false
        , btn: ['确定', '取消']
        , yes: function (index, layero) {
            if (okCallBack) {
                okCallBack(layero);
            }
            layer.close(index);
        },
        end: function () {
            if (cancelBack) {
                cancelBack(layer);
            }
        }
        , content: '<div class="layer-confirm">' + msg + '</div>'
    });
};

/**
 * 弹出一个3000毫秒自动消失的提示框
 * @param msg 提示框内容
 */
var showToast = function (msg) {
    layer.msg(msg, {
        offset: 'rb',
        anim: 0,
        time: 3000
    });
};

/**
 * 全屏指定元素
 * @param selector 指定元素选择器
 */
var fullScreen = function (selector) {
    var fullClass = 'full-screen';
    var docElm = document.querySelector(selector) || $(selector)[0];
    // W3C
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
        document.addEventListener("fullscreenchange", function () {
            (document.fullscreen) ? $(docElm).addClass(fullClass) : $(docElm).removeClass(fullClass);
        }, false);
    }
    //FireFox
    else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
        document.addEventListener("mozfullscreenchange", function () {
            (document.mozFullScreen) ? $(docElm).addClass(fullClass) : $(docElm).removeClass(fullClass);
        }, false);
    }
    //Chrome等
    else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
        document.addEventListener("webkitfullscreenchange", function () {
            (document.webkitIsFullScreen) ? $(docElm).addClass(fullClass) : $(docElm).removeClass(fullClass);
        }, false);
    }
    //IE11
    else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
        window.onresize = function () {
            if (window.outerWidth === screen.width && window.outerHeight === screen.height) {
                $(docElm).addClass(fullClass)
            } else {
                $(docElm).removeClass(fullClass)
            }
        };
    }
};

/**
 * 退出全屏操作
 */
var exitScreen = function () {

    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
    else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
};

/**
 * 扩展jquery方法，用于序列化参数
 * @returns {{}}
 */
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};



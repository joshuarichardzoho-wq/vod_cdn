//$Id$

var vodDemo = {};
class VODDemoSession {
    constructor(data) {
        this.userId = data.zuid;
        this.userName = data.userName;
        this.userImage = data.userImage;
        this.uploadUrl = data.uploadUrl;
        this.contactsDomain = data.contactsUrl;
        this.contentByIdMap = {};
        this.userContentByIdMap = {};
    }
 
    getCurrentUserId()
    {
        return this.userId;
    }

    getCurrentUserName() 
    {
        return this.userName;
    }

    getUserImage(id) 
    {
        if(!id)
        {
            id = this.getCurrentUserId();
        }

        return `${this.getContactsDomain()}/file?ID=${id}&t=user&exp=6000&fs=thumb&nocache=1752226615685`;
    }

    getContactsDomain() 
    {
        return this.contactsDomain;
    }

    getUploadUrl()
    {
        return this.uploadUrl;
    }

    getContentByIdMap() 
    {
        return this.contentByIdMap;
    }

    getUserContentByIdMap ()
    {
        return this.userContentByIdMap;
    }

    getActiveContentByIdMap ()
    {
        return (vodDemo.getActiveTab() === vodDemoConstant.UIConstants.MY_VIDEOS) ? this.getUserContentByIdMap() : this.getContentByIdMap();
    }

    getVodContent(contentId)
    {
        const contentByIdMap = this.getContentByIdMap();
        const userContentByIdMap = this.getUserContentByIdMap();

        const isInMyVideos = (vodDemo.getActiveTab() === vodDemoConstant.UIConstants.MY_VIDEOS);
        const primaryMap = isInMyVideos ? userContentByIdMap : contentByIdMap;

        if(contentId in primaryMap)
        {
            return primaryMap[contentId];
        }

        const secondaryMap = isInMyVideos ? contentByIdMap : userContentByIdMap;
        
        if(contentId in secondaryMap)
        {
            return secondaryMap[contentId];
        }
        
        return {};
    }

    initContentStudio(id, successCB, errorCB)
    {
        const content = this.getVodContent(id);
        successCB = vodDemoUtils.ensureFn(successCB);
        errorCB = vodDemoUtils.ensureFn(errorCB);

        if(!content)
        {
            return errorCB();
        }

        const contentId = content.contentId;

        if(content.vodStudio instanceof ZRVODStudio)
        {
            return successCB(content.vodStudio);
        }

        const reqSuccessCB = (resp) =>
        {
            const data = resp.data || {};

            const config = 
            {
                contentId,
                pbToken : data.pbtoken, 
                userId : data.viewerid, 
                wssUrl : data.wssurl
            };
            
            const vodStudio = content.vodStudio  = new ZRVODStudio(data.vodkey, config);
            successCB(vodStudio);
            //const emitter = vodStudio.getEmitter();

            //emitter.once('handleSessionReady', (vodStudio) => successCB(vodStudio));
            //emitter.once('handleError', (error) => errorCB(error));
        }

        const reqErrorCB = (err) =>
        {
            vodDemo.pushNotification("Uh-oh! Something went wrong. Please check your internet connection and try again.", true);
        }
        
        vodDemoApi.getPlaybackDetails(content.videoPropId, reqSuccessCB, reqErrorCB);
    }

    isCurrentUser(userId)
    { 
        return this.getCurrentUserId() == userId;
    }
}

vodDemo = 
{
    _vodDemoConfig : 
    {
        vodPlayerConfig :
        {
            zindex : 10,
            AV : "video",
            time : "enable",
            volume : "enable",
            seekbar : "enable",
            tooltip : "enable",
            forwardSeek: "enable",
            clickThrough: "enable",
            keycontrols : "enable",
            pauseOrPlay : "enable",
            backwardSeek: "enable",
            playbackspeed : "enable",
            closeNeeded : "disable",
            bottomControls : "enable",
            leftHigherLimit : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.innerWidth ? window.innerWidth : 0,
            topHeigherLimit : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.innerHeight ? window.innerHeight : 0
        },
        studioConfig :
        {
            length :
            {
                title : 124,
                description : 255,
                chapters_title : 124,
                chapters_description : 255,
                comments : 255,
                max_description : 200
            }
        },
        statusConfig :
        {
            [vodDemoConstant.status.PREVIEW]: ['rtcp-demo-vod-icon-upload-preview', ''],
            [vodDemoConstant.status.UPLOADED]: ['rtcp-demo-vod-icon-processing-begin', 'Processing will begin shortly'],
            [vodDemoConstant.status.PROCESSING] : ['rtcp-demo-vod-icon-processing', 'Processing'],
            [vodDemoConstant.status.UPLOAD_FAILED] : ['rtcp-demo-vod-icon-alert-fill', 'Error while uploading video'],
            [vodDemoConstant.status.PROCESSING_FAILED] : ['rtcp-demo-vod-icon-alert-fill', 'Error while processing video']
        },
        sorterConfig : (() =>
        {
            const config =
            {
                uploadTime :
                {
                    asc_title : 'Oldest',
                    desc_title : 'Recent',
                    dataType : 'number'
                },
                title :
                {
                    asc_title : 'A-Z',
                    desc_title : 'Z-A',
                    dataType : 'string'
                }
            };

            const order = ['asc', 'desc'];
            const defaultSortingArg = ['uploadTime', 'desc'];

            return {
                has (key)
                {
                    return key in config;
                },

                get (key, sortOrder)
                {
                    if(!this.has(key) || (order.indexOf(sortOrder) === -1))
                    {
                        return;
                    }

                    const conf = config[key];

                    return {
                        sortKey : key,
                        dataType : conf.dataType,
                        desc : (sortOrder === 'desc'),
                        title : conf[sortOrder+'_title'],
                        sortFn : conf.sortFn
                    };
                },

                getConfig ()
                {
                    return config;
                },

                getAll (keys)
                {
                    const sortingOptions = [];
                    
                    keys.forEach((key) =>
                    {
                        if(!this.has(key))
                        {
                            return;
                        }

                        const conf = config[key];

                        const option = 
                        {
                            sortKey : key,
                            dataType : conf.dataType,
                            sortFn : conf.sortFn
                        };

                        order.forEach((o) =>
                        {
                            sortingOptions.push({
                                ...option,
                                desc : (o === 'desc'),
                                title : conf[o+'_title'],
                            });
                        });
                    });

                    return sortingOptions;
                },

                getDefault ()
                {
                    return this.get(...defaultSortingArg);
                },

                add (key, newConfig)
                {
                    if(!this.has(key))
                    {
                        config[key] = newConfig;
                    }
                },

                update (key, newConfig)
                {
                    if(this.has(key))
                    {
                        Object.assign(config[key], newConfig);
                    }
                }
            }
        })(),
        orderedCategories : [vodDemoConstant.status.COMPLETED, vodDemoConstant.status.PROCESSING, vodDemoConstant.status.UPLOADING],
        defaultSortingConfig : {sortKey : 'uploadTime', desc : true, dataType : 'number'},
        pageSizes : [10, 20, 30, 40, 50]
    },
    
    _vodDOMMap : {},
    _vodDemoSession : null,
    _vodCategoryIdSorter : {},
    _userVodCategoryIdSorter : {},
    _activeTab : vodDemoConstant.UIConstants.HOME,
    _page : undefined,
    _viewerState : {},

    init : function (id, session)
    {
        const mainDOM = $(".rtcp-vod-homepage");

        if(!mainDOM.length)
        {
            return;
        }

        vodDemo.addDOM(vodDemoConstant.UIConstants.ROOT, mainDOM);
        vodDemo.setTheme();
        mainDOM.html(VODTemplate.getPageLoader());
        mainDOM.attr({'rtcpvodactionbtn':"", 'purpose':'handleClickOnVodDemo'});

        window.addEventListener('popstate', this.handlePopState);
        this.bindUIHandlers();
        this.initializeWmsLite(session);
        
        if(id)
        {
            vodDemoApi.fetchVODViewer(session, id);
        }
        else
        {
            this.openHomePage();
        }
    },

    initializeWmsLite(session)
    {
        WmsLite.setWmsContext('_wms');
        WmsLite.setNoDomainChange();  
        WmsLite.register("RT", session.getCurrentUserId());

        WmsliteImpl.handleAuthFailure = (mType) =>
        {
            
        };

        WmsliteImpl.serverdown = (a, b) => 
        { 
            
        }

        WmsliteImpl.serverup = (a, b) =>
        {
            
        }

        WmsliteImpl.handleMessage = (type, msgObj) =>
        {
            if(type == 59 && msgObj.module === 'vod')
            {
                const opr = msgObj.opr;

                if(typeof vodDemoHandler.WMS[opr] === 'function')
                {
                    vodDemoHandler.WMS[opr](msgObj);
                }
            }
        };
    },

    toggleNoRecordsFound : function(sorter)
    {
        const show = (Object.keys(sorter.data) == 0);
        const mainCont = this.getDOM(vodDemoConstant.UIConstants.HOME).find('.rtcp-grid-video-container');
        let noRecordsElem = mainCont.find('.rtcp-vod-home-no-data-sec');

        mainCont.children().toggleClass('vod-hide', show);

        if(!show)
        {
            noRecordsElem.remove();
            return;
        }

        const isInHome = (this.getActiveTab() === vodDemoConstant.UIConstants.HOME);
        const msg = isInHome ? "No videos are available at this time. Please return later" : 'Looks like it’s empty here — start adding videos to get going!';

        if(noRecordsElem.length === 0)
        {
            noRecordsElem = $(VODTemplate.getVodHomePanelNoData(isInHome));
            mainCont.append(noRecordsElem);
        }

        noRecordsElem.find(".rtcp-vod-home-no-data-icon").html(msg)
        noRecordsElem.removeClass('vod-hide');
    },

    openHomePageSortingOpt : function (elem)
    {
        if(elem.hasClass('active'))
        {
            vodDemoHandler.UI.handleClickOnVodDemo();
            elem.removeClass('active')
            return;
        }

        const category = elem.closest("[category]").attr('category');
        const sortByKeys = ['uploadTime', 'title'];
        const sorterConfig = vodDemo.getDefaultConfig('sorterConfig');

        if(category == vodDemoConstant.status.UPLOADING)
        {
            sortByKeys.push('status');
        }
        
        const sorter = this.getCurrentSorter();
        const currentConfig = sorter.sortBy[category];
        const configs = sorterConfig.getAll(sortByKeys);

        configs.activeTitle = sorterConfig.get(currentConfig.sortKey, (currentConfig.desc ? 'desc' : 'asc')).title;
        configs.category = category;

        const moreOptElem = $(VODTemplate.getSorterTemplate(configs));
        this.getDOM('root').append(moreOptElem);

        const left = elem.offset().left;
        const width = elem.outerWidth();
        const elemWidth = moreOptElem.outerWidth();
        const leftProp = left - ((elemWidth - width)/2) - 2;

        moreOptElem.css({left : leftProp+'px', top : (elem.offset().top + elem.outerHeight()) + 7 + 'px'});
        elem.addClass('active');

        vodDemoUtils.clickOutside.bind(
        {
            elem : moreOptElem, 
            doNotClose : (event) => 
            {
                return $(event.target).closest(moreOptElem).length;
            },
            onClose : () => 
            {
                elem.removeClass('active');
            }
        });
    },

    reArrangeContentsInCategory : function(category, config)
    {
        const sorter = this.getCurrentSorter();

        const {keys} = sorter.sort({[category] : config});

        if(keys.includes(category))
        {
            this.arrangeContentsInCategory(this.getVodDemoSession(), category);
        }
    },

    getDefaultConfig : function(key)
    {
        return this._vodDemoConfig[key] || {};
    },

    getCDNDomain : function()
    {
        return `https://${this._cdnDomain}/rtcplatform` || '';
    },

    setDefaultConfig : function(key, value)
    {
        this._vodDemoConfig[key] = value;
    },

    getCurrentSorter : function()
    {
        return (this.getActiveTab() === vodDemoConstant.UIConstants.MY_VIDEOS) ? this.getUserVodCategoryIdSorter() : this.getVodCategoryIdSorter();
    },

    switchPage : function(category, pageNo)
    {
        let sorter = this.getCurrentSorter();

        if(!sorter.isValidCategory(category))
        {
            return;
        }

        const totalPages = sorter.getTotalPages(category);

        pageNo = Math.min(Math.max(pageNo, 1), totalPages);

        sorter.setPageInfo(category, pageNo);
        this.arrangeContentsInCategory(this.getVodDemoSession(), category);
    },

    setViewerState : function(key, value)
    {
        this._viewerState[key] = value;
    },

    setUploadAllowed : function(value)
    {
        this._isUploadAllowed = value;
    },

    isUploadAllowed : function()
    {
        return this._isUploadAllowed;
    },

    getViewerState : function(key)
    {
        if(typeof key !== 'undefined')
        {
            return this._viewerState[key];
        }
        
        return this._viewerState;
    },

    getPlayerSpinner : function()
    {
        return $(RTCMediaPlayerTemplates.getMediaPlayerSpinner()).css('display', 'block');
    },

    changePageSize : function(category, pageSize)
    {
        const sorter = this.getCurrentSorter();

        sorter.setPageConfig(category, pageSize);
        this.arrangeContentsInCategory(this.getVodDemoSession(), category);
    },

    setCategoryPanelHeight : function(category)
    {
        const home = this.getDOM(vodDemoConstant.UIConstants.HOME);
        const categoryPanel = home.find('[category="'+category+'"]');
        const sorter = this.getCurrentSorter();

        if(!sorter.isValidCategory(category) || !categoryPanel.length)
        {
            return;
        }

        const setHeight = () =>
        {
            const totalItems = sorter.getCategoryLength(category);
            const configSize = sorter.getPageConfig(category, 'size');
            const size = Math.min(configSize, totalItems);

            const videosListCont = categoryPanel.find('.rtcp-grid-video-list');
            const gridVideoBoxes = categoryPanel.find('.rtcp-grid-video-box');
            const gap = parseInt(categoryPanel.find('.rtcp-grid-video-list').css('gap'));
            const totalItemsInRow = Math.floor((videosListCont.outerWidth() + gap) / (gridVideoBoxes.outerWidth() + gap));
            const totalRow = Math.ceil(size / totalItemsInRow);
            const height = (totalRow * gridVideoBoxes.outerHeight()) + ((totalRow - 1) * gap) + 10;
            const padding = parseInt(videosListCont.css('padding-top')) + parseInt(videosListCont.css('padding-bottom'));
            
            videosListCont.css('height', height+padding+'px');
        };

        if(categoryPanel.find(".rtcp-grid-video-items-body").is(':visible'))
        {
            setHeight();
        }
        else
        {
            const purpose = "slideCategoryPanel";
            vodDemoHandler.UI.slideCategoryPanel(categoryPanel.find(`[purpose=${purpose}]`), null, setHeight);
        }
    },

    arrangeContentsInCategory : function(session, category, completionCallback, updateInfo = {}) // this will handle already existed panel or no panel at all ( when page loads)
    {
        requestAnimationFrame(() => {
            const homePanel = this.getDOM(vodDemoConstant.UIConstants.HOME);
            const isReset = (typeof category === 'undefined');
            const viewerDOM = vodDemo.getDOM(vodDemoConstant.UIConstants.VIEWER);
            const isInViewerPage = (viewerDOM.length > 0);
            const sorter = this.getCurrentSorter();

            this.toggleNoRecordsFound(sorter);

            const vodContentItems = sorter.data;
            const categoryOrder = isReset ? this.getOrderedCategories() : sorter.getValidCategories(category);
            const allGridBoxFragment = $(document.createDocumentFragment());
            const gridVideoBoxesIdMap = new Map();

            const findAllVideoBoxes = (allGridBoxes) =>
            {
                allGridBoxes.each(function (_, elem)
                {
                    elem = $(this);
                    gridVideoBoxesIdMap.set(+elem.attr('id'), elem);
                    allGridBoxFragment.append(elem);
                });
            }

            if(isInViewerPage)
            {
               findAllVideoBoxes(viewerDOM.find('.rtcp-grid-video-box'));
            }

            const addGridVideoBox = (arr, id, index, elem, data) =>
            {   
                if(isInViewerPage)
                {
                    elem.removeAttr('purpose sec rtcpvodactionbtn').removeClass('playing');
                    elem.find('.rtcp-vod-video-box-wave-icon').remove();
                    
                    if(data)
                    {
                        this.updateGridVideoContainerOpts(elem, session, data[id]);
                    }
                }

                arr[index] = elem.removeClass('dN');
                delete gridVideoBoxesIdMap.delete(id);
            }

            if(typeof updateInfo.oldCategory !== 'undefined')
            {
                const oldCategory = updateInfo.oldCategory;
                const gridVideoBox = homePanel.find('#rtcp-vod-'+oldCategory+' #'+updateInfo.contentId);

                if(gridVideoBox.length)
                {
                    homePanel.find('#rtcp-vod-'+updateInfo.currentCategory).append(gridVideoBox);
                    this.updateGridVideoContainerOpts(gridVideoBox, session, session.getVodContent(updateInfo.contentId));
                }
            };

            for(const currentCategory of categoryOrder)
            {
                const ids = sorter.getItemsInView(currentCategory).slice(0);
                const totalItems = sorter.getCategoryLength(currentCategory);
                const placeHolder = document.createComment('placeholder');
                const data = sorter.data;
                
                let categoryPanel = homePanel.find('#rtcp-vod-'+currentCategory);
                categoryPanel.toggleClass('dN', (totalItems === 0));
                
                if(!totalItems || (ids && !ids.length))
                {
                    findAllVideoBoxes(categoryPanel.find('.rtcp-grid-video-box'));
                    continue;
                }

                if(!categoryPanel.length)
                {
                    homePanel.find('.rtcp-grid-video-container').append(placeHolder);
                    categoryPanel = $(VODTemplate.getVideoCategoryPanel(currentCategory, vodDemoConstant.getCategoryTitle(currentCategory), totalItems));
                }
                else
                {
                    categoryPanel.replaceWith(placeHolder);
                    findAllVideoBoxes(categoryPanel.find('.rtcp-grid-video-box'));
                    categoryPanel.find('.rtcp-grid-video-items-title-count-value').text(totalItems);
                }

                const indexedGridVideoBoxes = Array(ids.length);

                ids.forEach((id, index) =>
                {
                    if(typeof id === 'undefined')
                    {
                        return;
                    }
                    
                    let gridVideoCont = gridVideoBoxesIdMap.get(id);

                    if(gridVideoCont)
                    {
                        addGridVideoBox(indexedGridVideoBoxes, id, index, gridVideoCont, data);
                        return;
                    }
                    
                    for(let [contId, elem] of gridVideoBoxesIdMap)
                    {
                        contId = Number(contId);

                        let elemIndex = ids.indexOf(Number(contId));
                        let exit = false;

                        if(elemIndex === -1)
                        {
                            const content = vodContentItems[contId] || session.getVodContent(contId); // Other user public content which is not in current sorter data but in session content map

                            if(typeof content === 'undefined' || Object.keys(content).length === 0)
                            {
                                continue;
                            }

                            vodDemo.updateGridVideoContainer(elem, id, content, vodContentItems[id]);
                            gridVideoCont = elem;
                            elemIndex = index;
                            exit = true;
                        }
                        else
                        {
                            ids[elemIndex] = undefined;
                        }

                        addGridVideoBox(indexedGridVideoBoxes, contId, elemIndex, elem, (!exit && data)); // To avoid second updateGridVideoContainerOpts call for the same content 

                        if(exit)
                        {
                            break;
                        }
                    }

                    if(!gridVideoCont || !gridVideoCont.length)
                    {
                        const info = vodContentItems[id];
                        
                        gridVideoCont = $(VODTemplate.getVideoGridContainer(session, id, info));
                        vodDemo.changeGridVideoStatus(gridVideoCont, info.status);
                        addGridVideoBox(indexedGridVideoBoxes, id, index, gridVideoCont);
                    }
                });
                
                categoryPanel.find('.rtcp-grid-video-list').append(...indexedGridVideoBoxes);
                this.arrangePagesInCategoryPanel(currentCategory, categoryPanel, sorter);
                placeHolder.replaceWith(categoryPanel[0]);
            };

            vodDemoUtils.ensureFn(completionCallback)();

            for(const cat of categoryOrder)
            {
                vodDemo.setCategoryPanelHeight(cat);
            }
        });
    },

    arrangePagesInCategoryPanel : function(category, categoryPanel, sorter)
    {
        const pagesArr = sorter.getPages(category);
        const pagesLength = pagesArr.length;
        let pagesParentCont = categoryPanel.find('.rtcp-grid-video-items-body .rtcp-vod-pagination');

        if(!pagesLength)
        {
            pagesParentCont.remove();
            return;
        }

        const currentPage = sorter.getCurrentPageNo(category);
        const parentHasLength = (pagesParentCont.length > 0);

        if(!parentHasLength)
        {
            pagesParentCont = $(VODTemplate.getPaginationTemplate());
            categoryPanel.find('.rtcp-grid-video-items-body').append(pagesParentCont);
        }

        const fragment = document.createDocumentFragment(); 
        const pagesCont = pagesParentCont.find(".rtcp-vod-pages");
        const pageElemMap = {};
        
        pagesCont.children().get().forEach((elem) =>
        {
            elem = $(elem);
            const pageNum = elem.text();
            pageElemMap[pageNum] = elem;
        });
        
        pagesArr.forEach((pageNum) =>
        {
            let elem = pageElemMap[pageNum];

            if(!elem)
            {
                elem = $('<div class="center"></div>');
                const isDot = (pageNum === '...');

                if(!isDot)
                {
                    elem.attr('rtcpvodactionbtn', '').attr('purpose', 'switchPage');
                }

                elem.toggleClass('rtcp-vod-page-ellipsis', isDot).toggleClass('rtcp-vod-page', !isDot).text(pageNum);
            }
            
            elem.toggleClass('active', (pageNum == currentPage));
            
            fragment.append(elem[0]);
            delete pageElemMap[pageNum];
        });

        pagesCont.empty();
        pagesCont.append(fragment);

        const skipToPageInput = pagesParentCont.find('.rtcp-vod-skip-to-page-input input');
        const oldVal = skipToPageInput.val();

        if(currentPage != oldVal)
        {
            const totalPages = sorter.getTotalPages(category);
            const overflowDigitCount = Math.max(0, totalPages.toString().length - 2);
            const width = 35 + (overflowDigitCount * 10);

            skipToPageInput.css('width', width+'px');
            skipToPageInput.val(sorter.getCurrentPageNo(category));
        }
        
        this.updatePageNavigator(category, categoryPanel);
    },

    updatePageNavigator : function(category, categoryPanel)
    {
        const sorter = this.getCurrentSorter();
        const currentPage = sorter.getCurrentPageNo(category);
        const totalPage = sorter.getTotalPages(category);

        categoryPanel = categoryPanel || this.getDOM(vodDemoConstant.UIConstants.HOME).find('#rtcp-vod-'+category);

        const navigatorCont = categoryPanel.find('.rtcp-vod-page-navigation-cont');

        navigatorCont.find('[value="next"]').toggleClass('disabled', (currentPage >= totalPage));
        navigatorCont.find('[value="prev"]').toggleClass('disabled', (currentPage <= 1));
    },
    
    bindUploadEvents : function(data)
    {
        const root = this.getDOM(vodDemoConstant.UIConstants.ROOT);
        const fileInput = $("#file-input");

        const toggleDragActive = (event) =>
        {
            let isDragLeave = true;
            
            if(event)
            {
                event.preventDefault();
                isDragLeave = (event.type === 'dragleave') && (event.relatedTarget == null);
            }
            
            root.toggleClass('drag-drop-active', !isDragLeave);
        }

        const handleFile = function(event)
        {
            event.preventDefault();
            event.stopPropagation();
            event = event.originalEvent;

            const session = vodDemo.getVodDemoSession();
            const file = ((event.dataTransfer instanceof DataTransfer) ? event.dataTransfer : event.target).files[0];
            const name = file.name.trim();
            const dotIndex = name.lastIndexOf('.');
            const tempTitle = (dotIndex > 0) ? name.slice(0, dotIndex) : name;
            const url = URL.createObjectURL(file);
            const uploadTime = Date.now();
            const {date, time} = vodDemo.getDateTime(uploadTime);
            //const tempTitle = `RTCP_VOD_Sample_${date}_${time}`.slice(0, vodDemo.getContentConfig('length', 'title'));
            const videoInfo = 
            {
                ...data,
                file, url, name, uploadTime, date, time, tempTitle,
                title : tempTitle,
                status : vodDemoConstant.status.PREVIEW,
                owner : session.getCurrentUserId(),
                ownerDisplayName : session.getCurrentUserName()
            };
            
            const id = data.videoPropId;
            
            root.off('dragover dragend dragleave', toggleDragActive);
            toggleDragActive();

            vodDemo.removeModal();
            vodDemo.updateVODContent(id, videoInfo);
            //vodDemo.openVODStudioModal('uploadMeta', id, videoInfo);

            requestAnimationFrame(() =>  // inside updateVODContent , arrangeContentsInCategory is called which used requestAnimationFrame, without openVODStudioModal rAF gridVideoBox will not be available
            {
                vodDemo.openVODStudioModal('uploadMeta', id, videoInfo);     
            });
        }
        
        fileInput.on('change drop', handleFile);
        root.on('dragover dragend dragleave', toggleDragActive);
    },

    bindUIHandlers : function()
    {
        const doc = $(document);

        doc.off();

        const UICallback = function (event)
        {
            event.stopPropagation();

            const elem = $(this);
            const purpose = elem.attr("purpose");
            const fn = vodDemoHandler.UI[purpose];

            if(typeof fn === 'function')
            {
                fn(elem, event);
            }
        }

        doc.on('click', '[rtcpvodactionbtn]', UICallback);
        doc.on('mousedown', '[rtcpvodactionbtn_md]', UICallback);
    },

    getMoreOptions : function(session, content)
    {
        if(vodDemo.isInHomePage())
        {
            const opts = [];

            if(session.isCurrentUser(content.owner))
            {
                opts.push('edit');
                opts.push((content.status === vodDemoConstant.status.UPLOADING) ? 'cancel' : 'delete');
            }

            if((content.status === vodDemoConstant.status.COMPLETED))
            {
               opts.push('view');
            }

            return opts;
        }
    },

    getContentConfig : function(config, elemName)
    {
        const contentConfig = this._vodDemoConfig.studioConfig;

        if(config in contentConfig)
        {
            const info = contentConfig[config];

            if(elemName in info)
            {
                return info[elemName];
            }
            else
            {
                return info;
            }
        }

        return contentConfig;
    },

    getDateTime : function (timestamp)
    {
        const dateStrArr = new Date(timestamp).toString().split(' ');
        const time = dateStrArr[4];

        return {
            date : `${dateStrArr[1]} ${dateStrArr[2]}, ${dateStrArr[3]}`, 
            time : time.substring(0, time.lastIndexOf(':'))
        };
    },

    getVodPlayerConfig : function()
    {
        return this._vodDemoConfig.vodPlayerConfig;
    },

    getVodCategoryIdSorter : function()
    {
        return this._vodCategoryIdSorter;
    },

    getCategoryIdMap()
    {
        return this.getVodCategoryIdSorter().get();
    },

    getUserVodCategoryIdSorter()
    {
        return this._userVodCategoryIdSorter;
    },

    getUserVodCategoryIdMap()
    {
        return this.getUserVodCategoryIdSorter().get();
    },

    getCategoryIds(category)
    {
        return this.getCategoryIdMap()[category] || [];
    },

    getCategoryItems(category)
    {
        const ids = this.getCategoryIds(category);
        const vodContentItems = this.getVodDemoSession().getContentByIdMap();
        var videos = {};

        for(const id of ids)
        {
            const content = vodContentItems[id];
            
            if(content)
            {
                videos[id] = content;
            }
        }

        return videos;
    },
    
    getActiveTab : function()
    {
        return this._activeTab;
    },

    getOrderedCategories : function()
    {
        return this._vodDemoConfig.orderedCategories;
    },

    setActiveTab : function(tab)
    {
        this._activeTab = tab;
    },

    isInHomePage : function()
    {
        return this._page === vodDemoConstant.UIConstants.HOME;
    },

    isInViewerPage : function()
    {
        return this._page === vodDemoConstant.UIConstants.VIEWER;
    },

    setPage : function(page)
    {
        if(this._page !== page)
        {
            this._page = page;
        }
    },

    updateVODContent : function(contentId, newInfo, sorterInstance, gridVIdeoBox)
    {
        if(typeof contentId === 'undefined' || typeof newInfo !== 'object')
        {
            return;
        }

        contentId = Number(contentId);
        
        const sorter = this.getCurrentSorter() || sorterInstance;
        const vodContentItems = sorter.data;
        let info = vodContentItems[contentId];
        const isExisting = (typeof info !== 'undefined');
        const oldInfo = Object.assign({}, info);
        
        let reCategorize, reSorting, currentCategory, oldCategory, isItemInView;
        let updateInfo = {};

        if(isExisting)
        {
            currentCategory = vodDemoConstant.getCategoryGroup(info.status);

            for(const k in newInfo)
            {
                const value = newInfo[k];
                
                if(info[k] === value)
                {
                   continue;
                }

                if(k === 'status')
                {
                    const newCategory = vodDemoConstant.getCategoryGroup(value);
                    
                    if(currentCategory !== newCategory)
                    {
                        oldCategory = currentCategory;
                        currentCategory = newCategory;
                        reCategorize = true;
                    }
                }

                info[k] = value;
                updateInfo[k] = value;
            };

            if(!reCategorize)
            {
                const sortKey = sorter.sortBy[currentCategory].sortKey;

                if(sortKey in updateInfo)
                {
                    reSorting = true;
                }
            }
        }
        else
        {
            const keys = Object.keys(newInfo);
            currentCategory = vodDemoConstant.getCategoryGroup(newInfo.status);

            if(!keys.length || typeof currentCategory === 'undefined')
            {
                return;
            }

            info = updateInfo = vodContentItems[contentId] = newInfo;
            Object.assign(info, newInfo);
            reCategorize = true;
        };

        if(reCategorize || reSorting)
        {
            const sortedConfig = sorter.sortBy[currentCategory];

            if(typeof sortedConfig === 'undefined')
            {   
                const arr = [contentId];
                const newSortList = {[currentCategory] : arr};

                if(isExisting)
                {
                    sorter.delete(contentId, oldCategory);
                }
                
                sorter.addList(newSortList, {[currentCategory] : vodDemo.getDefaultConfig('sorterConfig').getDefault()});
                
                isItemInView = true;
            }
            else
            {
                if(isExisting)
                {
                    isItemInView = sorter.update(contentId, oldCategory, currentCategory);
                }
                else
                {
                    isItemInView = sorter.add(contentId, currentCategory);
                }
            }
            
            let order;

            if(typeof oldCategory !== 'undefined')
            {
                order = [oldCategory, currentCategory];
                order = this.getOrderedCategories().filter(cat => order.includes(cat));
            }
            else
            {
                order = [currentCategory];
            }

            this.arrangeContentsInCategory(this.getVodDemoSession(), order, null, { oldCategory, currentCategory, contentId });
        }

        if('uploadTime' in updateInfo && (!('date' in updateInfo) || !('time' in updateInfo)))
        {
            const dateTimeObj = vodDemo.getDateTime(updateInfo.uploadTime);
            Object.assign(updateInfo, dateTimeObj);
            Object.assign(info, dateTimeObj);
        };

        if(Object.keys(updateInfo).length)
        {
            this.updateGridVideoContainer(gridVIdeoBox, contentId, oldInfo, updateInfo);
            this.updateStudioModalContent(contentId, updateInfo);
        }
    },
  
    updateGridVideoContainer : function(gridVideoBox, id, oldInfo = {}, newInfo = {})
    {
        if(vodDemo.isInViewerPage())
        {
            return;
        }

        const root = this.getDOM(vodDemoConstant.UIConstants.ROOT);
        const session = this.getVodDemoSession();

        if(!gridVideoBox)
        {
            gridVideoBox = root.find('#' + id + '.rtcp-grid-video-box');
        }

        if(gridVideoBox.length === 0)
        {
            return;
        }

        const haskey = (k) => (k in newInfo);
        const hasOldInfo = (typeof oldInfo === 'object');

        const canUpdate = (k) => 
        {
            let isValid = haskey(k);
            
            if(isValid && hasOldInfo)
            {
                isValid = (oldInfo[k] !== newInfo[k])
            }

            return isValid;
        };

        const UIkeys = ['title', 'date', 'time', 'ownername', 'viewcount', 'duration'];

        for(const key of UIkeys)
        {
            if(!haskey(key) || !canUpdate(key))
            {
                continue;
            }

            let value = newInfo[key];

            if(typeof value === 'string' && (key === 'title' || key === 'ownername'))
            {
                newInfo[key] = value;
            }

            if(key === 'viewcount')
            {
                value = value+`<span>${value > 1 ? 'views' : 'view'}</span>`
            }

            gridVideoBox.find('.rtcp-grid-video-'+key).text(value);
        }

        gridVideoBox.attr('id', id);

        const imgCont = gridVideoBox.find('.rtcp-grid-video-img-container');
        var updateMoreOpt = false;

        if(canUpdate('status'))
        {
            vodDemo.changeGridVideoStatus(gridVideoBox, newInfo.status);
            updateMoreOpt = true;
        }

        const info = session.getVodContent(id);

        if(canUpdate('owner'))
        {
            imgCont.find('.rtcp-grid-video-owner-profile img').attr('src', session.getUserImage(newInfo.owner));
            imgCont.find('.rtcp-grid-video-ownername').text(newInfo.ownerDisplayName);

            if(!updateMoreOpt)
            {
                newInfo.status = info.status;
                updateMoreOpt = true;
            }
        }

        if(!updateMoreOpt)
        {
            return;
        }

        if($('#rtcp-vod-studio-more-opt').parent().attr('id') == id)
        {
            vodDemoUtils.clickOutside.close();
        }

        if(typeof newInfo.owner === 'undefined')
        {
            newInfo.owner = info.owner;
        }

        this.updateGridVideoContainerOpts(gridVideoBox, session, newInfo);
    },

    updateGridVideoContainerOpts : function(gridVideoBox, session, newInfo)
    {
        const moreOpts = this.getMoreOptions(session, newInfo);
        const hasViewOpt = moreOpts.includes('view');
        const mainOpts = gridVideoBox.find('.rtcp-grid-vod-main-options');
        const mainOptKey = hasViewOpt ? 'view' : 'edit';

        if(hasViewOpt && mainOpts.find('[more_opt]').attr('[more_opt]') !== mainOptKey)
        {
            mainOpts.html(VODTemplate.getVideoGridContainerOpt(mainOptKey));
        }

        gridVideoBox.find('.rtcp-grid-video-details-header .rtcp-grid-video-edit').toggleClass('dN', !moreOpts.includes('edit'));
    },

    updateStudioModalContent : function(contentId, newInfo = {})
    {
        const modal = this.getDOM('root').find(`.rtcp-demo-vod-studio-modal[contentid="${contentId}"]`);

        if(modal.length === 0)
        {
            return;
        }

        const status = newInfo.status;

        if(typeof status !== 'undefined') // This will only update status related changes in modal
        {
            vodDemo.changeGridVideoStatus(modal, status);

            if(status === vodDemoConstant.status.COMPLETED)
            {
                vodDemo.openVODStudioModal('meta', contentId, undefined, true);
            }
            else if(status !== vodDemoConstant.status.UPLOADING)
            {
                const config = VODTemplate.getTemplatesConfigs().footerPurpose['updateMeta'];
                const footerSec = modal.find('.rtcp-demo-video-cont-upload-footer');

                footerSec.find('.rtcp-demo-vod-video-cont-detail-back').remove(); // doing this will remove click events too -> html(VODTemplate.getStudioModalFooter('uploadMeta', status));
                footerSec.find('.rtcp-demo-vod-video-cont-detail-next').attr('purpose', config[1]).text(config[0]);
            }
        }
    },

    cancelUpload : function(contentId)
    {
        if(!contentId)
        {
            return;
        }

        const session = this.getVodDemoSession();
        const sorter = this.getUserVodCategoryIdSorter(); 
        const vodContentItems = sorter.data;
        const content = vodContentItems[contentId];

        if(!session.isCurrentUser(content.owner) || !content)
        {
            return;
        }

        const category = vodDemoConstant.getCategoryGroup(content.status);

        const errorCB = (err) =>
        {
            vodDemo.pushNotification("Error while cancelling content. Please try again.", true);
        };

        const successCB = (resp) =>
        {
            // sorter.delete(+contentId, category);
            // delete vodContentItems[contentId];

            //this.arrangeContentsInCategory(session, category);

            //vodDemo.pushNotification('Upload cancelled successfully.');
        }

        if(content.status === vodDemoConstant.status.UPLOADING)
        {
            vodDemoApi.cancelUpload(contentId, successCB, errorCB);
        
            if(typeof content._uploadReq !== 'undefined')
            {
                content._uploadReq.abort();
                delete content._uploadReq;
            }
        }
        else
        {
            vodDemo.removeModal(contentId);
        }
    },

    deleteVodContent (contentId)
    {
        if(!contentId || this.isInViewerPage())
        {
            return;
        }

        const session = this.getVodDemoSession();
        const sorter = this.getUserVodCategoryIdSorter(); 
        const vodContentItems = sorter.data;
        const content = vodContentItems[contentId];

        if(!session.isCurrentUser(content.owner) || !content)
        {
            return;
        }

        // const category = vodDemoConstant.getCategoryGroup(content.status);
        
        // sorter.delete(+contentId, category);
        // delete vodContentItems[contentId];

        // this.arrangeContentsInCategory(session, category);

        const errorCB = (err) =>
        {
            // vodContentItems[contentId] = content;
            // sorter.add(+contentId, category);
            // this.arrangeContentsInCategory(session, category);

            vodDemo.pushNotification("Error while deleting content. Please try again.", true);
        };

        const successCB = (resp) =>
        {
            if(resp !== null)
            {
                resp = JSON.parse(resp);
            
                if(!resp.status)
                {
                    errorCB();
                    return;
                }
            }

            vodDemo.pushNotification('Content deleted successfully.');

            const category = vodDemoConstant.getCategoryGroup(content.status);
        
            sorter.delete(+contentId, category);
            delete vodContentItems[contentId];

            this.arrangeContentsInCategory(session, category);
        }

        if(content.status === vodDemoConstant.status.UPLOADING || 
            content.status === vodDemoConstant.status.PREVIEW || content.status === vodDemoConstant.status.UPLOAD_FAILED)
        {
            successCB(null);
            return;
        }

        vodDemoApi.deleteContent(content.contentId, successCB, errorCB);
    },

    handleBgImgLoad : function(imgElem, asFileFormat)
    {
        this.toggleGridVideoBg($(imgElem).closest('.rtcp-grid-video-box').attr('id'), asFileFormat);
    },

    toggleGridVideoBg : function (id, asFileFormat)
    {
        const gridVideo = $((id ? '#' + id : '')+'.rtcp-grid-video-box');
        const formatClass = 'rtcp-grid-video-fileformat-box';
        
        if(typeof asFileFormat === 'boolean')
        {
            gridVideo.toggleClass(formatClass, asFileFormat);
            return;
        }

        gridVideo.toggleClass(formatClass);
    },

    getRandomBg : function()
    {
        return Math.max(1, Math.floor(Math.random() * 20));
    },

    enableEditing : function (elem)
    {
        const editable = elem.find('.rtcp-viewer-commenter-box-input-sec');
            
        editable.attr({'contenteditable':'true', 'aria-label':''}).focus();
        
        vodDemoUtils.bindTextListeners(
        {
            elem : editable, 
            limit : 12,
            limitExceedError : { errContClass : "rtcp-vod-viewers-comment" },
            onTextChange : (value, length, limit) => 
            {
                elem.toggleClass('btn-inactive', !(length > 0));
            }
        });

        editable.on('blur', (event) => 
        {
            editable.find('br').remove();
        });

        const actionHtml = $(VODTemplate.getAddCommentActions());
        elem.find('.rtcp-vod-viewers-info-sec').append(actionHtml);
    },

    setVodDemoSession : function(session)
    {
        this._vodDemoSession = session;
    },

    getVodDemoSession : function()
    {
        return this._vodDemoSession;
    },

    getDOM : function(key)
    {
        if (key in this._vodDOMMap) 
        {
            return this._vodDOMMap[key];
        }

        return $();
    },

    addDOM : function(key, dom)
    {
        this._vodDOMMap[key] = dom;
    },

    removeDOM : function(key)
    {
        delete this._vodDOMMap[key];
    },

    changeGridVideoStatus : function(videoContOrId, status, statusText)
    {
        let contentCont = videoContOrId;

        if(typeof videoContOrId === 'string')
        {
            contentCont = this.getDOM(vodDemoConstant.UIConstants.HOME).find('#' + videoContOrId)
        }   

        if(contentCont.length === 0)
        {
            return;
        }

        const isUploading = (status === vodDemoConstant.status.UPLOADING);
        var statusCont = contentCont.find('.rtcp-grid-video-status-container');
        var isExisting = (statusCont.length > 0);

        if(!isUploading && !(status in this._vodDemoConfig.statusConfig))
        {
            if(isExisting)
            {
                statusCont.remove();
            }

            contentCont.find('.rtcp-grid-vod-main-options').removeClass('dN');
            
            return;
        }

        contentCont.find('.rtcp-grid-vod-main-options').addClass('dN');

        if(!isExisting)
        {
            statusCont = $('<div class="rtcp-grid-video-status-container center" status="'+status+'"></div>');
            contentCont.find('.rtcp-vod-status-container').append(statusCont);
        }
        else if(statusCont.attr('status') === status)
        {
            return statusCont;
        }

        statusCont.attr('status', status);

        if(isUploading)
        {
            statusCont.html(VODTemplate.getUploadProgressBar());
            return statusCont;
        }

        let iconAndMsgCont = statusCont.find('.rtcp-grid-video-status');
        const hasIconAndMsg = (iconAndMsgCont.length > 0);

        if(!hasIconAndMsg)
        {
            iconAndMsgCont = $(VODTemplate.getVideoGridContainerStatus());
            statusCont.html(iconAndMsgCont);
        }

        const iconCont = iconAndMsgCont.find('.rtcp-demo-vod-upload-state-video-icon');
        const msgCont = iconAndMsgCont.find('.rtcp-grid-video-status-text');

        if(hasIconAndMsg)
        {
            vodDemoUtils.removeClass(iconCont, 'rtcp-demo-vod-icon-');
        }

        const iconAndMsg = this._vodDemoConfig.statusConfig[status];

        iconCont.addClass(iconAndMsg[0]);
        msgCont.text(statusText || iconAndMsg[1]);

        return statusCont;
    },

    parseOrFormatTime : function (time, short)
    {   
        if(typeof time === 'string')
        {
            if(time.includes(':'))
            {
                const [hours, minutes, seconds] = time.split(':').map(Number);
                return hours * 3600 + minutes * 60 + seconds;
            }
        }
        else if(typeof time !== 'number' || isNaN(time))
        {
            return;
        }

        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        const timeArr = [minutes, seconds];

        if(hours > 0 || !short)
        {
            timeArr.unshift(hours);
        }

        return timeArr.map(unit => String(unit).padStart(2, '0')).join(':');
    },

    parseCommentTime : function (cTime)
    {
        if(typeof cTime === 'string')
        {
            cTime = Number(cTime)
        }

        if(Number.isNaN(cTime))
        {
            return;
        }
        
        var lastParsedTime = (Date.now() - cTime);
        var lastParsedUnit = 'Just now';

        if(lastParsedTime < 1000)
        {
            return lastParsedUnit;
        }
    
        const units = 
        {
            second : 1000,
            minute : 60,
            hour : 60,
            day : 24,
            week : 7,
            month : 4.345,
            year : 12
        };

        for(const unit in units)
        {
            const convTime = Math.floor(lastParsedTime / units[unit]);

            if(convTime < 1)
            {
                return lastParsedTime+" "+lastParsedUnit+((lastParsedTime > 1) ? 's' : '')+' ago';
            }

            lastParsedTime = convTime;
            lastParsedUnit = unit;
        }
    },

    openPreviewModal : function (data)
    {
        if(data.content.status !== vodDemoConstant.status.PREVIEW)
        {
            this.changeGridVideoStatus(data.studioModal, data.content.status);
            return;
        }

        if(typeof data.content.url === 'undefined')
        {
            return;
        }

        const previewPlayer = data.content.vodPlayer = new RTCMediaPlayerObj(data.studioPlayerId);
        
        previewPlayer.bindCustomEvents = () =>
        {
            const videoElem = previewPlayer._videoInstance;

            const loadedMetadatahandler = () =>
            {
                const duration = data.content.duration = vodDemo.parseOrFormatTime(videoElem.duration, true);

                data.root.find('#'+data.id+'.rtcp-grid-video-box .rtcp-grid-video-duration').text(duration);
                videoElem.removeEventListener('loadedmetadata', loadedMetadatahandler);
            }

            videoElem.addEventListener('loadedmetadata', loadedMetadatahandler);
        }

        previewPlayer.setPlayerConfig(vodDemo.getVodPlayerConfig());
        previewPlayer.loadUrl(data.content.url);
    },

    openMetaModal : function (data)
    {
        const titleCont = data.studioModalRHS.find('.rtcp-demo-vod-studio-modal-body-rhs-title-cont');
        const descriptionCont = data.studioModalRHS.find('.rtcp-demo-vod-studio-modal-body-rhs-description-cont');
        const gridVideoBoxTitle = vodDemo.getDOM(vodDemoConstant.UIConstants.HOME).find('#' + data.id + '.rtcp-grid-video-box .rtcp-grid-video-title');
        const studioModalHeader = data.studioModal.find('.rtcp-demo-vod-studio-modal-header-text');
        const titleInput = titleCont.find('textarea');
        const descriptionInput = descriptionCont.find('textarea');
        const titleCount = titleCont.find('span');
        const descriptionCount = descriptionCont.find('span');
        const configs = VODTemplate.getTemplatesConfigs().footerPurpose;
        const primaryBtn = data.studioPrimaryBtn;
        const content = data.content;

        const updatePrimaryBtn = (value, textLength, limit, key, isTitle, countCont) =>
        {
            const hasLength = (textLength > 0);
            const status = content.status;
            let conf = [];

            if((value !== (content[key] || '')) 
                && (!isTitle || (value.length > 0)) ) // description can be undefined sometimes which makes value !== content[key] true even if both are empty
            {
                conf.push(...configs.updateMeta);

                if(status === vodDemoConstant.status.PROCESSING_FAILED || status === vodDemoConstant.status.UPLOAD_FAILED)
                {
                    conf.push(true);
                }
            }
            else
            {
                const isInPreview = (status === vodDemoConstant.status.PREVIEW);
                const isCompleted = (status === vodDemoConstant.status.COMPLETED);

                if(isInPreview)
                {
                    conf.push(...configs.uploadMeta);
                }
                else if(isCompleted)
                {
                    conf.push(...configs.meta);
                }
                else
                {
                    conf.push(...configs.updateMeta);
                }

                if(!isInPreview && !isCompleted)
                {
                    conf.push(true);
                }
            }
            
            const isDisabled = Boolean(conf[2]) || primaryBtn.hasClass('restricted');

            primaryBtn.toggleClass('disabled', isDisabled);

            if(isDisabled)
            {
                primaryBtn.removeAttr('rtcpdemovodbutton');
            }
            else
            {
                primaryBtn.attr({'rtcpdemovodbutton':'true', 'purpose': conf[1]});
            }

            primaryBtn.text(conf[0]);

            if(isTitle)
            {
                gridVideoBoxTitle.text(value);
                studioModalHeader.text(value);
            }

            countCont.toggleClass('dN', !hasLength).text(textLength+'/'+limit);
        }

        const onTitleChange = (value, textLength, limit) => 
        {

            updatePrimaryBtn(value, textLength, limit, 'title', true, titleCount);

            // const hasLength = (textLength > 0);
            // const status = content.status;

            // let conf;

            // if((value !== content.title) && (value.trim().length > 0))
            // {
            //     conf = configs.updateMeta;
            // }
            // else
            // {
            //     const isUploading = (status === vodDemoConstant.status.UPLOADING);

            //     if(isUploading || status === vodDemoConstant.status.PREVIEW)
            //     {
            //         conf = configs.uploadMeta;

            //         if(isUploading)
            //         {
            //             conf.push(true);
            //         }
            //     }
            //     else if(status === vodDemoConstant.status.COMPLETED)
            //     {
            //         conf = configs.meta;
            //     }
            // }
            
            // const isDisabled = Boolean(conf[2]);

            // primaryBtn.toggleClass('disabled', isDisabled);

            // if(isDisabled)
            // {
            //     primaryBtn.removeAttr('rtcpdemovodbutton');
            // }
            // else
            // {
            //     primaryBtn.attr({'rtcpdemovodbutton':'true', 'purpose': conf[1]});
            // }

            // primaryBtn.text(conf[0]);

            // if(content.title !== value)
            // {
            //     gridVideoBoxTitle.text(value);
            //     studioModalHeader.text(value);
            // }

            // titleCount.toggleClass('dN', !hasLength).text(textLength+'/'+limit);
        }
        
        titleInput.on('blur', () => // before initiateUpload blur event called, so there will be no empty title when initiateUpload called
        {
            if(titleInput.val().length === 0)
            {
                titleInput.val(content.title).trigger('input');
            }
        });

        const onDescriptionChange = (value, length, limit) => 
        {
            updatePrimaryBtn(value, length, limit, 'description', false, descriptionCount);
            // if(content.description !== value)
            // {
            //     const conf = configs.updateMeta;

            //     primaryBtn.toggleClass('disabled', Boolean(conf[2]));
            //     primaryBtn.attr({'rtcpdemovodbutton':'true', 'purpose': conf[1]});
            //     primaryBtn.text(conf[0]);
            // }

            // descriptionCount.toggleClass('dN', length == 0).text(length+'/'+limit);
        }
                    
        vodDemoUtils.bindTextListeners(
        {
            elem : titleInput, 
            limit : vodDemo.getContentConfig('length','title'),
            limitExceedError : {errContClass : "rtcp-demo-vod-studio-modal-body-rhs-title-cont"},
            onTextChange : onTitleChange
        });

        vodDemoUtils.bindTextListeners(
        {
            elem : descriptionInput, 
            limit : vodDemo.getContentConfig('length','description'),
            limitExceedError : {errContClass : "rtcp-demo-vod-studio-modal-body-rhs-description-cont"},
            onTextChange : onDescriptionChange
        });

        const title = data.content.title || data.content.tempTitle;
            
        titleInput.val(title).trigger('input');
        descriptionInput.val(data.content.description || '').trigger('input');
        studioModalHeader.text(title);
    },

    openEnhancementModal : function(data)
    {
        const addChapterBtn = data.studioModalRHS.find('.rtcp-demp-vod-add-chapter-btn');
        var vodStudio;

        const successCB = (studio) =>
        {
            const chapterSuccessCB = (chapters = {}) =>
            {
                for(const chapterId in chapters)
                {
                    const chapter = chapters[chapterId];
                    const time = vodDemo.parseOrFormatTime(chapter.offset, true)
                    const chapterElem = $(VODTemplate.getChapterInfo(chapterId, chapter.title, chapter.description, time)); 
                    
                    data.studioModalRHS.find('.rtcp-demp-vod-add-chapter-elem-sec').append(chapterElem);
                }
            }
            
            addChapterBtn.removeClass('disabled');
            addChapterBtn.attr('rtcpvodactionbtn', '');
            
            data.studioPrimaryBtn.removeClass('disabled');
            studio.loadChapters(chapterSuccessCB);
            vodStudio = studio;
        }

        const errorCB = (error) =>
        {
            addChapterBtn.addClass('disabled');
            addChapterBtn.removeAttr('rtcpvodactionbtn');
        }
        
        if(data.hasVodStudio)
        {
            successCB(data.content.vodStudio);
        }
        else
        {
            data.initVODStudio(successCB, errorCB);
        }
        
        const addChapterModal = $(VODTemplate.getAddChapterModal());
        data.studioModalRHS.append(addChapterModal);

        const titleInput = addChapterModal.find('.vod-chapter-title textarea');
        const descriptionInput = addChapterModal.find('.vod-chapter-description textarea');
        const timerSecInput = addChapterModal.find('.rtcp-demo-vod-add-chapters-modal-body-footer-sec-timer input');
        
        const titleCount = titleInput.next('span');
        const descriptionCount = descriptionInput.next('span');
        const saveBtn = addChapterModal.find('.rtcp-demo-vod-add-chapters-modal-body-footer-sec-actions-cont-save');
        const cancelBtn = saveBtn.siblings();
        const maxTimeLen = 2;
        
        saveBtn.on('click', (event) =>
        {
            event.stopPropagation();
            event.preventDefault();
            
            const title = titleInput.val();
            const description = descriptionInput.val();
            const time = timerSecInput.get().map(elem => elem.value).join(':');
            const formattedTime = vodDemo.parseOrFormatTime(time);

            const chapter = { title, description, offset: formattedTime };
            const isEdit = addChapterModal.attr('chapterId') !== undefined;
            const chaperId = isEdit ? addChapterModal.attr('chapterId') : formattedTime+'_'+Date.now();
            
            vodStudio.addChapter({[chaperId]: chapter});
            
            cancelBtn.trigger('click');

            if(isEdit)
            {
                const chapterElem = data.studioModalRHS.find('.rtcp-demp-vod-add-chapter-elem-sec').find('#' + chaperId);
                chapterElem.replaceWith($(VODTemplate.getChapterInfo(chaperId, title, description, time.startsWith('00:') ? time.slice(3) : time)));
                addChapterModal.removeAttr('chapterId');
            }
            else
            {
                const chapterElem = $(VODTemplate.getChapterInfo(chaperId, title, description, time.startsWith('00:') ? time.slice(3) : time));
                data.studioModalRHS.find('.rtcp-demp-vod-add-chapter-elem-sec').append(chapterElem);
            }
            
            data.studioPrimaryBtn.attr('purpose', 'updateChapters');
            data.studioPrimaryBtn.text('Update');
        });

        const onTitleChange = (value, textLength, limit) =>
        {
            const hasActionAttr = saveBtn.attr('rtcpvodactionbtn') !== undefined;
            const hasLength = (textLength > 0);
            
            let showSaveBtn = hasLength;

            const chapterId = addChapterModal.attr('chapterId');

            if(typeof chapterId !== 'undefined')
            {
                const chapter = vodStudio.getChapter(chapterId);
                
                if(showSaveBtn)
                {
                    showSaveBtn = !(chapter.title === value);
                }
            }

            saveBtn.toggleClass('disabled', !showSaveBtn);

            if(showSaveBtn)
            {
                !hasActionAttr && saveBtn.attr('rtcpvodactionbtn', '');
            }
            else
            {
                hasActionAttr && saveBtn.removeAttr('rtcpvodactionbtn');
            }

            titleCount.toggleClass('dN', !hasLength).text(textLength+'/'+limit);
        }

        const onDescriptionChange = (value, textLength, limit) => 
        {
            const chapterId = addChapterModal.attr('chapterId');
            const hasActionAttr = saveBtn.attr('rtcpvodactionbtn') !== undefined;
            const hasLength = (textLength > 0);

            let showSaveBtn = hasLength;

            if(typeof chapterId !== 'undefined')
            {
                const chapter = vodStudio.getChapter(chapterId);
                
                if(showSaveBtn)
                {
                    showSaveBtn = !(chapter.description === value);
                }

                saveBtn.toggleClass('disabled', !showSaveBtn);

                if(showSaveBtn)
                {
                    !hasActionAttr && saveBtn.attr('rtcpvodactionbtn', '');
                }
                else
                {
                    hasActionAttr && saveBtn.removeAttr('rtcpvodactionbtn');
                }
            }

            descriptionCount.toggleClass('dN', !hasLength).text(textLength+'/'+limit);
        }

        const onChange = (event) =>
        {
            const chapterId = addChapterModal.attr('chapterId');
            const hasActionAttr = saveBtn.attr('rtcpvodactionbtn') !== undefined;
            
            if(typeof chapterId !== 'undefined')
            {
                const chapter = vodStudio.getChapter(chapterId);
                const currentTimeInSec = vodDemo.parseOrFormatTime(timerSecInput.get().map(elem => elem.value).join(':'));
                const showSaveBtn = !(Number(chapter.offset) === currentTimeInSec);

                saveBtn.toggleClass('disabled', !showSaveBtn);

                if(showSaveBtn)
                {
                    !hasActionAttr && saveBtn.attr('rtcpvodactionbtn', '');
                }
                else
                {
                    hasActionAttr && saveBtn.removeAttr('rtcpvodactionbtn');
                }
            }
        }
        
        const isValidNumber = (value) => 
        {
            const strValue = String(value).trim();
            
            if (!strValue)
            {
                return false;
            }
            
            return /^[0-9]$/.test(strValue);
        };

        const onInput = (event, jqueryElem, elem) =>
        {
            let cursorPos = elem.selectionStart;
            let newValue = jqueryElem.val().slice(0, maxTimeLen);

            if(newValue.includes('.'))
            {
                newValue = newValue.replace(/\D/g, '0');
                jqueryElem.trigger(vodDemoConstant.status.ERROR);
            }

            jqueryElem.val(newValue);

            requestAnimationFrame(() => 
            {
                if(cursorPos == maxTimeLen)
                {
                    const nextInput = jqueryElem.nextAll('input');

                    if(nextInput.length)
                    {
                        elem = nextInput.eq(0).focus().get(0);
                        cursorPos = 0;
                    }
                }

                elem.setSelectionRange(cursorPos, cursorPos);
            });
        }

        const onPaste = (event, jqueryElem, elem) =>
        {
            event.preventDefault();

            let newStr = event.originalEvent.clipboardData.getData('text/plain');

            if(!newStr.length)
            {
                return;
            }

            let cursorStartPos = elem.selectionStart;
            let nextAllInputs = jqueryElem.nextAll('input').addBack(jqueryElem);
            let reqStrLen = (nextAllInputs.length * maxTimeLen - cursorStartPos);
            
            newStr = newStr.slice(0, reqStrLen).split('');

            if(newStr.some(char => !isValidNumber(char)))
            {
                jqueryElem.trigger(vodDemoConstant.status.ERROR);
                return;
            }

            const currentValArr = [...nextAllInputs].flatMap(input => input.value.split(''));
            currentValArr.splice(cursorStartPos, newStr.length, ...newStr);

            nextAllInputs.each(function(index) {
                const start = index * maxTimeLen;
                $(this).val(currentValArr.slice(start, start + maxTimeLen).join(''));
            })
        }

        const onBlur = (event, jqueryElem, elem) =>
        {
            const value = jqueryElem.val();

            if(value.length < maxTimeLen)
            {
                jqueryElem.val(value[elem.selectionStart == 1 ? 'padEnd' : 'padStart'](maxTimeLen, '0'));				
            }

            jqueryElem.trigger('change');
        }
        
        const onKeydown = (event, jqueryElem, elem) =>
        {
            const key = event.key;
            const isNumber = isValidNumber(key);
            const isArrowLeft = (event.code == 'ArrowLeft');
            const isArrowKeys = isArrowLeft || (event.code == 'ArrowRight');
            let cursorPos;

            if(!isNumber && !isArrowKeys)
            {
                return;
            }

            event.stopImmediatePropagation();

            if((elem.selectionStart == maxTimeLen) && (elem.selectionEnd == maxTimeLen) && !isArrowLeft)
            {
                event.preventDefault();

                const nextInput = jqueryElem.nextAll('input')[0];

                if(!nextInput)
                {
                    return;
                }

                if(isNumber)
                {
                    nextInput.value = key + nextInput.value.slice(1);
                    cursorPos = 1;
                }

                requestAnimationFrame(() => {
                    cursorPos = cursorPos || 0;
                    nextInput.setSelectionRange(cursorPos, cursorPos);
                    nextInput.focus();
                });
            }

            if(elem.selectionStart == 0 && elem.selectionEnd == 0 && isArrowLeft)
            {
                const prevInput = jqueryElem.prevAll('input')[0];

                if(!prevInput)
                {
                    event.preventDefault();
                    return;
                }
                
                requestAnimationFrame(() => {
                    cursorPos = 0;
                    prevInput.focus();
                    prevInput.setSelectionRange(cursorPos, cursorPos);
                });
            }
        }

        timerSecInput.each(function() {
            const jQelem = $(this);
            const elem = jQelem[0];

            jQelem.on({
                'keydown' : (event) => onKeydown(event, jQelem, elem),
                'input' : (event) => onInput(event, jQelem, elem),
                'blur' : (event) => onBlur(event, jQelem, elem),
                'paste' : (event) => onPaste(event, jQelem, elem),
                'change' : (event) => onChange(event, jQelem, elem)
            })
        });

        const configs = 
        [
            {
                elem : titleInput, 
                limit : vodDemo.getContentConfig('length','chapters_title'), 
                onTextChange : onTitleChange, 
                limitExceedError : {errContClass : "vod-chapter-title"}
            },
            {
                elem : descriptionInput, 
                limit : vodDemo.getContentConfig('length','chapters_description'),
                onTextChange : onDescriptionChange, 
                limitExceedError : {errContClass : 'vod-chapter-description'}
            },
            { 
                elem : timerSecInput,
                limit : maxTimeLen,
                events : ['keydown'],
                isKeyAllowed : isValidNumber,
                limitExceedError : {errContClass : 'rtcp-demo-vod-add-chapters-modal-body-footer-sec-timer'}
            }
        ]

        for(const config of configs)
        {
            vodDemoUtils.bindTextListeners(config);
        }

        requestAnimationFrame(() => {
            const length = titleInput.val().length;
            titleInput.focus();
            titleInput[0].setSelectionRange(length, length);
        });
    },

    openVODStudioModal : function (modal, id, content, overRide)
    {
        if(this.isInViewerPage())
        {
            return;
        }

        const root = this.getDOM(vodDemoConstant.UIConstants.ROOT);
        var studioModal = root.find('.rtcp-demo-vod-studio-modal');
        const isModalExists = (studioModal.length > 0);
        const currentModal = studioModal.attr('modal');
        const session = vodDemo.getVodDemoSession();
        const isSameContent = isModalExists && (studioModal.attr('contentId') == id);
        var vodStudio;

        content = content || session.getVodContent(id); 

        if(!content)
        {
            return;
        }

        if(root.find('.rtcp-vod-container-hidden').length == 0)
        {
            root.append('<div class="rtcp-vod-container-hidden"></div>');
        }

        const studioPlayerId = 'rtcp-demo-vod-studio-modal-player';

        if(!isModalExists)
        {
            studioModal = $(VODTemplate.getVodStudioModal(modal, id, content));
            root.append(studioModal);
        }

        const studioModalRHS = studioModal.find('.rtcp-demo-vod-studio-modal-body-rhs');
        //const isPreviewModal = (modal === vodDemoConstant.status.PREVIEW);
        const isUploadMeta = (modal === 'uploadMeta');
        const isEnhancementModal = (modal === 'inVideo');
        const isMetaModal = (modal === 'meta');
        const sameRHSModals = ['meta', 'uploadMeta'];

        if(isModalExists)
        {          
            if(!sameRHSModals.includes(currentModal) || !sameRHSModals.includes(modal))
            {
                studioModalRHS.html($(VODTemplate.getStudioModalRHS(modal, content)));
            }

            studioModal.attr('modal', modal);
            studioModal.attr('contentId', id);
            //studioModal.find('.rtcp-demo-vod-icon-minimise').toggleClass('dN', isPreviewModal);
            studioModal.find('.rtcp-demo-video-cont-upload-footer').html(VODTemplate.getStudioModalFooter(modal, content.status));
        }

        const slider = studioModal.find('.rtcp-demo-vod-studio-modal-vid-rhs-slider');
        const hasSlider = slider.length > 0;

        if(isEnhancementModal)
        {
            if(!hasSlider)
            {
                studioModal.find('.rtcp-demo-vod-studio-modal-body-lhs').append(VODTemplate.getModalSlider());
            }
        }
        else if(hasSlider)
        {
            slider.remove();
        }

        if( /*isPreviewModal || */ isUploadMeta)
        {
            this.openPreviewModal({
                 id, content, studioPlayerId, root, studioModal
            });

            // if(isPreviewModal)
            // {
            //     return;
            // }
        }

        const studioPrimaryBtn = studioModal.find('.rtcp-demo-vod-video-cont-detail-next');
        const hasVodStudio = (content.vodStudio instanceof ZRVODStudio);
        var vodPlayer = studioModal.find('#'+studioPlayerId);

        if(!vodPlayer.length)
        {
            vodPlayer = $(`<div id="${studioPlayerId}"></div>`)
            studioModal.find('.rtcp-demo-vod-video-cont').html(vodPlayer);
        }

        // if(!isUploadMeta)
        // {
        //     vodPlayer.addClass('rtcpmediaplayerdiv');
        //     vodPlayer.empty();
        //     vodPlayer.append(this.getPlayerSpinner());
        // }

        const playerCB = (studio) =>
        {
            if(studio && !isSameContent || overRide)
            {
                const mediaPlayer = content.vodStudio.getMediaPlayer();

                if(mediaPlayer instanceof RTCMediaPlayerObj)
                {
                    mediaPlayer.closeMediaPlayer();
                }                 

                vodPlayer.empty();
                studio.initVodPlayer(studioPlayerId);
            }
        }

        const initVODStudio = (successCB, errorCB) =>
        {
            const sessionSuccessCB = (studio) =>
            {
                playerCB(studio);

                if(typeof successCB === 'function')
                {
                    successCB(studio);
                }

                vodStudio = studio;
            }

            session.initContentStudio(id, sessionSuccessCB, errorCB);
        }
        
        if(isMetaModal || isUploadMeta)
        {
            this.openMetaModal({
                content,
                isModalExists,
                id,
                studioModalRHS,
                studioModal,
                studioPrimaryBtn,
                hasVodStudio,
            });

            if(isMetaModal)
            {
                initVODStudio();
            }
        }

        if(isEnhancementModal)
        {
            this.openEnhancementModal({
                content,
                studio : vodStudio,
                isModalExists,
                id,
                studioModalRHS,
                studioModal,
                studioPrimaryBtn,
                hasVodStudio,
                initVODStudio
            });
        }
    },

    initiateUpload : function (id, modal)
    {
        const session = this.getVodDemoSession();
        const content = session.getVodContent(id);
        const contentType = content.file.type.split("/")[1];
        const userId = session.getCurrentUserId();

        const uploadType = "mediaprocessing";
        const uploadId = content.videoPropId;
        const root = this.getDOM(vodDemoConstant.UIConstants.ROOT);
        const gridVideoBox = root.find('#' + id + '.rtcp-grid-video-box');

        const title = modal.find('.rtcp-demo-vod-studio-modal-body-rhs-title-cont textarea').val() || content.tempTitle;
        const description = modal.find('.rtcp-demo-vod-studio-modal-body-rhs-description-cont textarea').val() || '';

        content.title = title;
        content.description = description;

        if(content.vodPlayer instanceof RTCMediaPlayerObj)
        {
            content.vodPlayer.closeMediaPlayer();
        }

        vodDemo.updateVODContent(id, {status : vodDemoConstant.status.UPLOADING}, null, gridVideoBox);

        const setDownloadPercentage = (percentage) =>
        {
            gridVideoBox[0].style.setProperty('--upload_percentage', percentage+'%');
            
            const studio_modal = root.find('[contentid="'+id+'"]');

            if(studio_modal.length)
            {
                studio_modal[0].style.setProperty('--upload_percentage', percentage+'%')
            }
        }
        
        const callBacks = 
        {
            success : function ()
            {
                delete content.vodPlayer; 
                delete content.url; 
                delete content.file; 
                delete content.name; 
                delete content.tempTitle;

                vodDemo.pushNotification('Content uploaded successfully.');
                vodDemo.updateVODContent(id, {status : vodDemoConstant.status.UPLOADED}, null, gridVideoBox); // ws msgObj also handle this
                setDownloadPercentage(0);
            },

            error : function () 
            {
                vodDemo.updateVODContent(id, {status : vodDemoConstant.status.UPLOAD_FAILED}, null, gridVideoBox)
                vodDemo.pushNotification('Error while uploading video. Please try again.', true);
            },

            progress : function (event)
            {
                const percentComplete = (event.loaded / event.total) * 100;
                setDownloadPercentage(percentComplete);
            }
        }

        var xAttrHeaders = 
        {
            "upload-type" : "mediaprocessing",
            "file-name" : encodeURIComponent(content.name),
            "Content-type" : encodeURIComponent(contentType),
            "x-rtcp-attid" :  Date.now(),
            "title" : encodeURIComponent(content.title),
            "description" : encodeURIComponent(content.description),
            "output-format" : 'hlsvod',
            "zuid" : userId
        };

        ZRTFileUploader.init(session.getUploadUrl(), "rtcplatform");
        content._uploadReq = ZRTFileUploader.uploadFile(uploadType, uploadId, content.file, callBacks, xAttrHeaders);
    },

    updateMetaInfo : function (id, elem, modal)
    {
        const titleCont = modal.find('.rtcp-demo-vod-studio-modal-body-rhs-title-cont textarea');
        const descriptionCont = modal.find('.rtcp-demo-vod-studio-modal-body-rhs-description-cont textarea');
        
        const title = titleCont.val();
        const description = descriptionCont.val();

        const successCallBack = (resp) =>
        {
            vodDemo.pushNotification('Content meta info updated successfully.');
            elem.removeClass('restricted');

            const content = this.getVodDemoSession().getVodContent(id);
            const newMeta = resp.data || {};
            content.title = newMeta.title;
            content.description = newMeta.description;

            titleCont.trigger('input');
            descriptionCont.trigger('input');
        }

        const errorCallBack = (err) =>
        {
            vodDemo.pushNotification('Error while updating video meta. Please try again.', true);
            elem.removeClass('restricted');

            titleCont.trigger('input');
            descriptionCont.trigger('input');
        }

        vodDemoApi.updateMetaInfo(id, { title, description }, successCallBack, errorCallBack);
    },

    removeModal : function(contentId)
    {
        const root = this.getDOM(vodDemoConstant.UIConstants.ROOT);
        const modal = root.find('[modal]');

        if(typeof contentId !== 'undefined')
        {
            if(modal.attr('contentId') != contentId)
            {
                return;
            }

            const session = this.getVodDemoSession();
            const content = session.getVodContent(contentId);

            if(content && content.vodStudio instanceof ZRVODStudio)
            {
                content.vodStudio.closePlayer();
            }
        }

        root.find('.rtcp-vod-container-hidden').remove();
        modal.remove();
    },

    openHomePage : async function()
    {
        const session = this.getVodDemoSession();
        const root = this.getDOM(vodDemoConstant.UIConstants.ROOT);
        const viewer = this.getDOM(vodDemoConstant.UIConstants.VIEWER);
        const wasInViewerPage = (viewer.length > 0);
        const prevActiveTab = this.getActiveTab();
        const rootHolder = $(document.createComment('root-holder'));

        root.replaceWith(rootHolder);
        
        if(wasInViewerPage)
        {
            const viewerContentId = viewer.attr('contentId');
            const viewerContent = session.getVodContent(viewerContentId);
            
            if(viewerContent && viewerContent.vodStudio)
            {
                viewerContent.vodStudio.closePlayer();
            }

            this.viewerState = {};
            $(window).off('.vod_viewer');
        }

        if(!this.getDOM(vodDemoConstant.UIConstants.HEADER).length)
        {
            const header = $(VODTemplate.getHeader_v2(session.getUserImage()));
            root.html(header);
            this.addDOM(vodDemoConstant.UIConstants.HEADER, header);
        }

        let homePanel = this.getDOM(vodDemoConstant.UIConstants.HOME);
        
        if(!homePanel.length)
        {
            homePanel = $(VODTemplate.getVodHomePanel());
            root.append(homePanel);
            this.addDOM(vodDemoConstant.UIConstants.HOME, homePanel);
        }

        const curtActivetab = prevActiveTab || vodDemoConstant.UIConstants.HOME;
        
        this.setActiveTab(curtActivetab);
        this.setPage(vodDemoConstant.UIConstants.HOME);

        const isHomeTab = (this.getActiveTab() === vodDemoConstant.UIConstants.HOME);

        homePanel.toggleClass('rtcp-vod-zc', isHomeTab);

        let homePageSorter = this.getCurrentSorter();
        
        if(!(homePageSorter instanceof VodSorter))
        {
            const skeleton = $(VODTemplate.getcategoryPanelSkeleton());
            const mainCont = homePanel.find('.rtcp-grid-video-container')
            
            mainCont.children().addClass('dN');
            mainCont.append(skeleton);
            rootHolder.replaceWith(root);
            
            await vodDemoApi.fetchVODHome(session, isHomeTab);
            
            homePageSorter = this.getCurrentSorter();
            root.replaceWith(rootHolder);
            skeleton.remove();
        }

        const isUploadAllowed = vodDemo.isUploadAllowed();

        homePanel.toggleClass('upload-disabled', !isUploadAllowed);
        homePanel.find('[tab="myVideos"]').toggleClass('dN', !isUploadAllowed);

        const completionCallback = () =>
        {
            if(wasInViewerPage)
            {
                viewer.remove();
                this.getDOM(vodDemoConstant.UIConstants.COMMENT_SEC).remove();
                this.getDOM(vodDemoConstant.UIConstants.QUEUE).remove();
                this.getDOM(vodDemoConstant.UIConstants.VIEWER_RHS).remove();

                this.removeDOM(vodDemoConstant.UIConstants.VIEWER);
                this.removeDOM(vodDemoConstant.UIConstants.COMMENT_SEC);
                this.removeDOM(vodDemoConstant.UIConstants.QUEUE);
                this.removeDOM(vodDemoConstant.UIConstants.VIEWER_RHS);
            }

            homePanel.find('.rtcp-vod-upload-btn').toggleClass('dN', (curtActivetab === vodDemoConstant.UIConstants.HOME));

            rootHolder.replaceWith(root);
            this.switchTabs(homePanel.find('.rtcp-vod-tab[tab="'+curtActivetab+'"]'));
        };

        this.arrangeContentsInCategory(session, undefined, completionCallback);
    },

    openViewerPage : function(contentId, videoSec)
    {
        const session = this.getVodDemoSession();
        var content = session.getVodContent(contentId);

        vodDemoHandler.UI.handleClickOnVodDemo();
        
        if(!content)
        {
            return;
        }

        const root = this.getDOM(vodDemoConstant.UIConstants.ROOT);
        const rootHolder = $(document.createComment('root-holder'));
        const isFromQueue = (videoSec === 'queue');
        let viewerRHS = this.getDOM(vodDemoConstant.UIConstants.VIEWER_RHS);

        let queueSec, scrollTop;

        if(isFromQueue)
        {
            queueSec = viewerRHS.find('.rtcp-vod-viewerpage-nextvideos-sec');
            scrollTop = queueSec.scrollTop();
        }
        
        root.replaceWith(rootHolder);

        const playerId = "rtcpvodplayer_"+contentId;
        const homePage = this.getDOM(vodDemoConstant.UIConstants.HOME);
        const wasInHomePage = (homePage.length > 0);
        
        this.setPage(vodDemoConstant.UIConstants.VIEWER);

        if(wasInHomePage)
        {
            const studioModal = root.find('.rtcp-demo-vod-studio-modal');
            
            if(studioModal.length)
            {
                const modalContentId = studioModal.attr('contentId');
                const studioModalContent = (contentId === modalContentId) ? content : session.getVodContent(modalContentId);
                
                studioModalContent && studioModalContent.vodStudio && studioModalContent.vodStudio.closePlayer();

                this.removeModal();
            }
        }

        let vodStudio = content.vodStudio;
        let viewerPage = this.getDOM(vodDemoConstant.UIConstants.VIEWER);
        let commentSec = viewerPage.find('.rtcp-vod-comment-sec');
        let commentBox = viewerPage.find('.rtcp-self-comment-sec');
        
        if(this.getDOM(vodDemoConstant.UIConstants.HEADER).length === 0)
        {
            const header = $(VODTemplate.getHeader_v2(session.getUserImage()));
            root.html(header);
            this.addDOM(vodDemoConstant.UIConstants.HEADER, header);
        }

        let descCont = this.getDOM(vodDemoConstant.UIConstants.DESC_SEC);

        if(!viewerPage.length)
        {
            viewerPage = $(VODTemplate.getViewerPage(playerId, session, content)).attr('contentId',contentId);
            commentSec = viewerPage.find('.rtcp-vod-comment-sec');
            commentBox = $(VODTemplate.getCommentBox(session.getUserImage()));
            viewerRHS = viewerPage.find('.rtcp-vod-viewerpage-rhs');
            descCont = viewerPage.find('.rtcp-vod-video-desc-container');

            root.append(viewerPage);
            viewerPage.find('.rtcp-vod-comment-sec-header').after(commentBox);
            
            this.addDOM(vodDemoConstant.UIConstants.VIEWER, viewerPage);
            this.addDOM(vodDemoConstant.UIConstants.VIEWER_RHS, viewerRHS);
            this.addDOM(vodDemoConstant.UIConstants.COMMENT_SEC, commentSec);
            this.addDOM(vodDemoConstant.UIConstants.DESC_SEC, descCont);

            vodDemoUtils.bindTextListeners(
            {
                elem : commentBox.find('.rtcp-self-commenter-box-input-sec'), 
                limit : 120,
                limitExceedError : { errContClass : "rtcp-self-commenter-box" },
                onTextChange : (value, length, limit) => 
                {
                    commentSec.toggleClass('btn-inactive', !(length > 0));
                }
            });

            const actionHtml = $(VODTemplate.getAddCommentActions(true)).addClass('dN').attr('id', 'rtcp-vod-self-comment-actions');
            commentSec.find('.rtcp-self-comment-sec').after(actionHtml);
        }
        else
        {
            const oldContentId = viewerPage.attr('contentid');
            const oldContent = session.getVodContent(oldContentId);
            
            if(oldContent.vodStudio)
            {
                oldContent.vodStudio.closePlayer();
            }

            descCont.find('.rtcp-vod-video-title').text(content.title);
            descCont.find('.rtcp-vod-video-posted-date').text(content.date);
            descCont.find('.rtcp-vod-video-posted-time').text(content.time);

            descCont.find(".rtcp-vod-video-owner-profile img")[0].src = session.getUserImage(content.owner);
            descCont.find('.rtcp-vod-video-ownername').text(content.ownerDisplayName);

            const likeBtn = descCont.find('.rtcp-vod-like-btn');
            (likeBtn.attr('status') === 'liked') && vodDemoHandler.UI.toggleLikeStatus(likeBtn);

            viewerPage.find('.rtcp-vod-video-container').attr('id', playerId);
            viewerPage.attr('contentid', contentId);
        }
        
        const wrapper = descCont.find('.rtcp-vod-video-desc-wrapper');
        const maxDescLen = vodDemo.getContentConfig('length', 'max_description');
        const descriptionCont = wrapper.find('.rtcp-vod-video-desc');
        const descriptionReadMore = descriptionCont.find('.rtcp-vod-video-desc-read-more');
        const hasReadMore = (descriptionReadMore.length > 0);
        const description = (content.description || '').slice(0, maxDescLen);

        descriptionCont.text(description);

        if(description.length > maxDescLen)
        {
            if(!hasReadMore)
            {
                descriptionCont.append('<span class="rtcp-vod-video-desc-read-more">...more</span>');
            }
            
            wrapper.attr({
                rtcpvodactionbtn : '',
                purpose : 'toggleViewerDescription'
            });

            descriptionCont.attr('expanded', 'false');
        }
        else
        {
            descriptionReadMore.remove();
            wrapper.removeAttr('rtcpvodactionbtn', 'purpose');
            descriptionCont.removeAttr('expanded');
        }

        descCont.find('.rtcp-vod-video-desc-area').toggleClass('dN', description.length == 0);

        if(isFromQueue)
        {
            this.updateQueuePlayingContent(contentId, viewerRHS);
        }
        else
        {
            vodDemo.organizeViewerQueue(
            {
                session, 
                content, 
                contentId,
                wasInHomePage,
                root,
                viewerPage,
                videoSec
            });

            this.updateQueuePlayingContent(contentId, viewerRHS);
        }

        if(wasInHomePage)
        {
            homePage.remove();
            this.removeDOM(vodDemoConstant.UIConstants.HOME);
        }

        rootHolder.replaceWith(root);
        
        if(isFromQueue)
        {
            queueSec.scrollTop(scrollTop);
        }

        const vodPlayer = viewerPage.find('#'+playerId).addClass('rtcpmediaplayerdiv');
        vodPlayer.empty();

        const spinner = this.getPlayerSpinner().addClass('vod-player-spinner-center');
        vodPlayer.append(spinner);

        const viewerLHS = viewerPage.find('.rtcp-vod-viewerpage-lhs');
        $(window).off('.vod_viewer');
       
        const playerSuccessCB = (studio) =>
        {
            const customEvents = 
            {
                bindCustomEvents ()
                {   
                    vodStudio.displayChapters();

                    const videoElem = this._videoInstance;

                    const removeLSSpinner = () => {
                        vodPlayer.find('.vod-player-spinner-center').remove();
                        videoElem.removeEventListener('onloadeddata', removeLSSpinner);
                    };
                    
                    videoElem.addEventListener('onloadeddata', removeLSSpinner);

                    const loadedMetadatahandler = () =>
                    {
                        const videoHeight = videoElem.videoHeight;
                        const videoWidth = videoElem.videoWidth;
                        const aspectRatio = videoWidth / videoHeight;
                        const multiplier = [];

                        if(aspectRatio < 1.25)
                        {
                            multiplier.push(1, 1);
                        }
                        else if(aspectRatio >= 1.25 && aspectRatio <= 1.30)
                        {
                            multiplier.push(5, 4);
                        }
                        else if(aspectRatio >= 1.31 && aspectRatio <= 1.45)
                        {
                            multiplier.push(4, 3);
                        }
                        else if(aspectRatio >= 1.45 && aspectRatio <= 1.55)
                        {
                            multiplier.push(3, 2);
                        }
                        else
                        {
                            multiplier.push(16, 9);
                        }

                        $(window).on('resize.vod_viewer', () => vodDemo.resizeViewerPlayer(viewerLHS, vodPlayer, multiplier)).trigger('resize');

                        videoElem.removeEventListener('loadedmetadata', loadedMetadatahandler);
                    }

                    videoElem.addEventListener('loadedmetadata', loadedMetadatahandler);
                }
            }

            //vodPlayer.removeClass('rtcpmediaplayerdiv').children().remove();
            console.log('open viewer page Initializing VOD Player');
            vodStudio.initVodPlayer(playerId, undefined, customEvents);
        }

        const viewerCommentsList = commentSec.find(".rtcp-vod-viewers-comment-sec").html('');
        viewerCommentsList.replaceWith(rootHolder);

        const commentCB = () =>
        {
            const successCB = (comments) =>
            {
                for(const id in comments)
                {
                    const commentHTML = $(VODTemplate.getViewerCommentBox(session, id, comments[id]));

                    if(viewerCommentsList.children().length)
                    {
                        commentHTML.append('<div class="rtcp-viewer-comment-separator"></div>');
                    }
                    
                    viewerCommentsList.prepend(commentHTML);
                }

                commentSec.find('.rtcp-vod-total-comments-count').text(Object.keys(comments).length);

                rootHolder.replaceWith(viewerCommentsList);
            }

            vodStudio.loadComments(successCB);
        }

        if(!vodStudio)
        {
            const successCB = (studio) =>
            {
                vodStudio = studio;
                playerSuccessCB(studio);
                
                studio.loadChapters();
                commentCB();
            }

            session.initContentStudio(contentId, successCB);
        }
        else
        {
            playerSuccessCB(vodStudio);
            vodStudio.displayChapters();
            commentCB();
        }
    },

    resizeViewerPlayer : function (viewerLhs, videoContainer, multiplier)
    {
        requestAnimationFrame(() =>
        {
            const height_1 = Math.round(window.innerHeight - 245);
            const width_1 = Math.round((multiplier[0] * height_1) / multiplier[1]);
            const width_2 = window.innerWidth - 345 - 70;
            const height_2 = Math.round((multiplier[1] * width_2) / multiplier[0]);
            const offset = ((width_1 * height_1) < (width_2 * height_2)) ? {width : width_1, height : height_1} : {width : width_2, height : height_2};

            viewerLhs.css({width : offset.width+'px'});
            videoContainer.css({height : offset.height+'px', width : offset.width+'px'});
        });
    },

    organizeViewerQueue : async function (data)
    {
        const viewerRHS = this.getDOM(vodDemoConstant.UIConstants.VIEWER_RHS);
        const session = data.session;
        const pageLimit = 10;
        const category = vodDemoConstant.status.COMPLETED;

        let viewerState = this.getViewerState();
        // let isPublicContent = (((data.videoSec === 'related') ? viewerState.relatedVideosConf : viewerState.queueConf) || {}).scope;
        
        // if(typeof isPublicContent === 'undefined')
        // {
        //     isPublicContent = (this.getActiveTab() === vodDemoConstant.UIConstants.HOME);
        // }

        const isPublicContent = window.history.state.isPublic;

        const sorters =
        {
            0 : this.getUserVodCategoryIdSorter,
            1 : this.getVodCategoryIdSorter
        };

        const gridVideoBoxesIdMap = {};
        const allGridBoxFragment = $(document.createDocumentFragment());

        data.root.find('.rtcp-grid-video-box').each(function (_, elem)
        {
            elem = $(this);

            allGridBoxFragment.append(elem);
            gridVideoBoxesIdMap[+(elem.attr('id'))] = elem;
        });

        let playlistSec = this.getDOM(vodDemoConstant.UIConstants.QUEUE);

        if(!playlistSec.length)
        {
            playlistSec = $(VODTemplate.getVideoQueuePanel());
            viewerRHS.prepend(playlistSec);
            this.addDOM(vodDemoConstant.UIConstants.QUEUE, playlistSec);
        };

        const playlistMainCont = playlistSec.find('.rtcp-vod-viewerpage-nextvideos-list');
        const relatedVideosCont = viewerRHS.find('.rtcp-vod-video-recommendations-list');
        let existingIds = [];

        const queueConf = 
        {
            isQue : true,
            container : playlistMainCont
        };

        const relVideosConf = 
        {
            container : relatedVideosCont
        };

        const loadVideos = (conf) =>
        {
            const {isQue, scope, sorter} = conf;
            const allIds = sorter.get()[category] || [];
            const totalLength = allIds.length;
            const placeHolder = $(document.createComment('placeholder'));
            const mainCont = conf.container;
            let start, end, ids;
            
            mainCont.replaceWith(placeHolder);
            
            if(!totalLength)
            {
                start = end = 0;
                ids = allIds;
            }
            else if(isQue)
            {
                start = allIds.indexOf(Number(data.contentId));
                end = Math.min(start + pageLimit - 1, totalLength - 1);

                const length = (end - start + 1);

                if(length < pageLimit)
                {
                    start = Math.max(0,  start - (pageLimit - length));
                }

                ids = allIds.slice(start, end + 1);
            }
            else
            {
                ids = [];
                start = end = 0;

                while((ids.length < pageLimit) && (end < totalLength))
                {
                    const id = allIds[end];

                    end+=1;

                    if(existingIds.includes(id))
                    {
                        continue;
                    }

                    ids.push(id);

                    if(end >= totalLength)
                    {
                        end = totalLength - 1;
                        break;
                    }
                }
            }

            const arr = Array(ids.length);
            const idVsContent = sorter.data;

            existingIds.push(...ids);

            for(let i = 0; i < ids.length; i++)
            {
                const id = ids[i];

                let gridVideoBox = gridVideoBoxesIdMap[id];
                
                if(!gridVideoBox)
                {
                    gridVideoBox = $(VODTemplate.getVideoGridContainer(session, id, idVsContent[id], 'openViewerPage'))
                }

                gridVideoBox.attr({
                    'purpose': 'playFromViewerPage',
                    'sec' : (isQue ? 'queue' : 'related'),
                    'rtcpvodactionbtn': ''
                }).removeClass('dN');
                
                arr[i] = gridVideoBox;
            }

            mainCont.empty();
            mainCont.append(...arr).removeClass('loading');
            placeHolder.replaceWith(mainCont);

            requestAnimationFrame(() => 
            {
                if(!isQue)
                {
                    if(arr.length !== 0)
                    {
                        const height = (arr[0].innerHeight() * arr.length) + (arr.length * 8) + 40;
                        mainCont.css({ height : height+'px' });
                    }
                }
            });

            viewerState[isQue ? 'queueConf' : 'relatedVideosConf'] = 
            {
                sorter,
                scope,
                start,
                end
            }

            return Promise.resolve();
        }

        const videoBoxSkeletons = $(VODTemplate.getVideoBoxSkeleton().repeat(5));
        const promises = [];

        const executePromises = async () =>
        {
            for(let p = 0; p < promises.length; p++)
            {
                const cb = promises[p];

                if(cb === true)
                {
                    continue;  
                }

                if(cb === null)
                {
                    return;
                }

                await cb();

                promises[p] = true;
            }
        }

        for(const conf of [queueConf, relVideosConf])
        {
            const isQue = conf.isQue;
            const scope = Number(isQue ? isPublicContent : !isPublicContent);
            const sorter = sorters[scope].call(this);

            if(sorter instanceof VodSorter)
            {
                loadVideos({...conf, scope, sorter});
            }
            else
            {
                const index = promises.length;
                promises[index] = null;
                
                conf.container.html(videoBoxSkeletons);
                conf.container.addClass('loading');

                vodDemoApi.fetchVODHome(
                    session, 
                    scope, 
                    function(sorter) 
                    {
                        promises[index] = () => 
                        {
                            loadVideos({...conf, scope, sorter});

                            if(isQue)
                            {
                                vodDemo.updateQueuePlayingContent(data.contentId, viewerRHS);
                            }
                        };

                        executePromises();
                    });
            }
        }
    },

    updateQueuePlayingContent : function(newContentId, viewerRHS)
    {
        viewerRHS = viewerRHS || this.getDOM(vodDemoConstant.UIConstants.VIEWER_RHS);
        
        const previousPlayedElem = viewerRHS.find('.rtcp-grid-video-box.playing');
        previousPlayedElem.removeClass('playing').find('.rtcp-vod-video-box-wave-icon').remove();
        
        const currentPlayingElem = viewerRHS.find('#'+newContentId);
        let playIcon = currentPlayingElem.find('.rtcp-vod-video-box-wave-icon');

        if(!playIcon.length)
        {
            playIcon = $(VODTemplate.getVideoBoxWaveIcon());
            currentPlayingElem.find('.rtcp-grid-video-box-wrapper').append(playIcon);
        }

        currentPlayingElem.addClass('playing');
    },

    handlePopState : function(event)
    {
        const state = event.state;
        const propId = state ? state.propId : undefined;

        if(propId)
        {
            vodDemo.openViewerPage(propId);
        }
        else
        {
            vodDemo.openHomePage();
            vodDemo.pushHistoryState({}, 'VOD', '');
        }
    },

    pushHistoryState : function(stateObj, title, addUrlPath)
    {
        const url = window.location.origin+'/demo/playhub'+addUrlPath;
        const historyAPI = window.history;

        if(historyAPI)
        {
            if('propId' in stateObj && typeof stateObj.isPublic === 'undefined' && vodDemo.isInHomePage())
            {
                stateObj.isPublic = (vodDemo.getActiveTab() === vodDemoConstant.UIConstants.HOME);
            }

            historyAPI.pushState(stateObj, title, url);
        }
    },

    pushNotification : function(message, isError, duration = 2000, timeoutClearCB)
    {
        const root = this.getDOM(vodDemoConstant.UIConstants.ROOT);
        const notification = $(VODTemplate.getVodBanner(message, isError));
        const notificationTop = 56;
        
        const allbanners = () => root.find('.rtcp-demo-vod-banner:not(.timer-cleared)');
        const notifyContLen = allbanners().length;
        
        let top = notificationTop;
        let height;

        root.append(notification);
        height = notification.outerHeight();

        if(notifyContLen > 0)
        {
            top += notifyContLen * (height + 10);
        }

        requestAnimationFrame(() => {
            notification.css({ top : top+'px' });
        });

        const notificationTimeout = setTimeout(() => 
        {
            requestAnimationFrame (() => 
            {
                clearTimeout(notificationTimeout);

                if(typeof timeoutClearCB === 'function')
                {
                    timeoutClearCB();
                }

                notification.addClass('timer-cleared');
                notification.css({ top : `-${height}px`});

                let newTop;

                allbanners().each(function(index)  
                {                                                          
                    const elem = $(this);

                    if(elem.is(notification))
                    {
                        return;
                    }

                    newTop = newTop ? newTop + (elem.outerHeight() + 10) : notificationTop;

                    elem.css({ top : newTop+'px' });
                });

                notification.on('transitionend', () => 
                {
                    notification.remove();
                });
            
            })
        }, duration);
    },

    setTheme : function(isToggled)
    {
        const cookie = (RTCPCookie.get('vod_demo_theme') === 'true') ? true : false;
        const root = vodDemo.getDOM(vodDemoConstant.UIConstants.ROOT);
        const darkThemeClass = 'night-mode';

        isDark = (typeof isToggled === 'boolean') ? !root.hasClass(darkThemeClass) : (cookie || false);

        root.toggleClass(darkThemeClass, isDark);

        if(cookie !== isDark)
        {
            RTCPCookie.set('vod_demo_theme', isDark);
        }
    },

    switchTabs : async function(elem, isClicked)
    {
        if(elem.hasClass('active'))
        {
            return;
        }

        if(isClicked)
        {
            const activeTab = this.getActiveTab();
            const selectedTab = elem.attr('tab');
        
            if(activeTab === selectedTab)
            {
                return;
            }

            this.setActiveTab(selectedTab);
            this.openHomePage();
            
        }

        const activeTab = $(".rtcp-vod-tab.active");
        const tabActiveBar = $(".rtcp-vod-tab-active-bar");
        const elemOuterWidth = elem.outerWidth();
        const elemLeft = elem.position().left;
        
        tabActiveBar.animate({'width': '20px'}, 10, () => {
            tabActiveBar.animate({left : elemLeft + 'px',width : elemOuterWidth + 'px'}, 100);
            activeTab.removeClass('active');
            elem.addClass('active');
        });
    }
};
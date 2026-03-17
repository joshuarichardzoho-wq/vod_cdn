//$Id$

var vodDemoHandler = {};
var vodDemoApi = {};
var vodDemoUtils = {};

var vodDemoConstant = (function () 
{
    const status =
    {
        PREVIEW : 'preview',
        UPLOADING : 'uploading',
        UPLOADED : 'uploaded',
        UPLOAD_FAILED : 'upload_failed',
        PROCESSING : 'processing',
        PROCESSING_FAILED : 'processing_failed',
        COMPLETED : 'completed',
        ERROR : 'error'
    };

    const UIConstants =  
    {
        HOME : 'home',
        MY_VIDEOS : 'myVideos',
        VIEWER : 'viewer',
        ROOT : 'root',
        HEADER : 'header',
        COMMENT_SEC : 'comment_sec',
        DESC_SEC : 'desc_sec',
        QUEUE : 'queue',
        VIEWER_RHS : 'viewer_rhs'
    }

    const statusVsCategory =
    { 
        'COMPLETED' : status.COMPLETED,
        'NOT_YET_STARTED' : status.PROCESSING
    };

    const categoryConstants =
    {
        1 : status.UPLOADING,
        2 : status.UPLOADED,
        3 : status.UPLOAD_FAILED,
        4 : status.PROCESSING,
        5 : status.PROCESSING_FAILED,
        6 : status.COMPLETED
    };

    const categoryVsTitle =
    {
        [status.COMPLETED] : 'Published',
        [status.PROCESSING] : 'In Progress',
        [status.UPLOADING] : 'Upload Queue'
    };

    const categoryMapping =
    {
        [status.PREVIEW] : status.UPLOADING,
        [status.UPLOAD_FAILED] : status.UPLOADING,
        [status.UPLOADED] : status.PROCESSING,
        [status.PROCESSING_FAILED] : status.PROCESSING
    }

    const getCategoryGroup = (category) => categoryMapping[category] || category;

    const getCategoryTitle = (category) =>
    {
        const categoryGroup = getCategoryGroup(category);
        return categoryVsTitle[categoryGroup];
    }

    return {
        status,
        statusVsCategory,
        categoryConstants,
        UIConstants,
        getCategoryGroup,
        getCategoryTitle
    }
})();

var vodDemoHandler =
{
    UI :
    {
        goToUploadModal : function(elem, event)
        {
            if(!vodDemo.isUploadAllowed())
            {
                return;
            }

            elem.addClass('disabled');
            
            const root = vodDemo.getDOM(vodDemoConstant.UIConstants.ROOT);
            
            root.find('.rtcp-demo-vod-upload-dialog').remove();

            const errorCB = () =>
            {
                elem.removeClass('disabled');
                vodDemo.pushNotification('Error while initiating upload. Please try again.', true);
            }

            const successCB = (resp) =>
            {
                if(!resp || (typeof resp.data === undefined) || (typeof resp.data.videoPropId == undefined))
                {
                    errorCB();
                    return;
                }

                elem.removeClass('disabled');
                
                root.append("<div class='rtcp-vod-container-hidden'></div>");
                root.append(VODTemplate.getVideoUploadModal());
                vodDemo.bindUploadEvents(resp.data);
            };

            vodDemoApi.getUploadId(successCB, errorCB);
        },

        openMetaInfoModal : function(elem, event)
        {
            const id = elem.closest('.rtcp-demo-vod-studio-modal').attr('contentId');
            vodDemo.openVODStudioModal('meta', id);
        },

        openEnhancementModal : function(elem, event)
        {
            const id = elem.closest('.rtcp-demo-vod-studio-modal').attr('contentId');
            vodDemo.openVODStudioModal('inVideo', id);
        },

        openGridVideo : function(elem, event)
        {
            const id = elem.closest('.rtcp-grid-video-box').attr('id') || elem.closest('#rtcp-vod-studio-more-opt').attr('contentId');
            const session = vodDemo.getVodDemoSession();
            const content = session.getVodContent(id);
            const contentStatus = content.status;

            const modal = (contentStatus == "completed") ? 'meta' : 'uploadMeta'; //'inVideo' : 'uploadMeta';

            vodDemo.openVODStudioModal(modal, id);
            vodDemoHandler.UI.handleClickOnVodDemo();
        },

        openStudioMoreOpt : function(elem, event)
        {
            const root = vodDemo.getDOM('root');
            const gridVideo = elem.closest('.rtcp-grid-video-box');
            const contentId = gridVideo.attr('id');
            
            var moreOptElem = root.find('#rtcp-vod-studio-more-opt');
            const hasLength = moreOptElem.length > 0;

            if(hasLength && moreOptElem.attr('contentId') === contentId)
            {
                vodDemoHandler.UI.handleClickOnVodDemo();
                return;
            }

            const session = vodDemo.getVodDemoSession();
            const content = session.getVodContent(contentId);
            const moreOpts = vodDemo.getMoreOptions(session, content);

            if(!moreOpts.length)
            {
                vodDemoHandler.UI.handleClickOnVodDemo();
                return;
            }

            const configs = VODTemplate.getTemplatesConfigs().gridVideoContOpts;
            var optsHTML = '';

            for(const opt of moreOpts)
            {
                const config = configs[opt];
                
                optsHTML += `<div class="rtcp-vod-opt-cont" more_opt="${opt}" rtcpvodactionbtn purpose="${config[1]}">
                                <div class="rtcp-vod-opt rtcp-demo-vod-icon-${opt}">${config[2]}</div>
                            </div>`;
            }

            if(!hasLength)
            {
                moreOptElem = $(`<div id="rtcp-vod-studio-more-opt" contentId="${contentId}" class="rtcp-vod-more-opt-cont"></div>`);
            }
            
            moreOptElem.html(optsHTML);
            root.append(moreOptElem);

            const clientBoundingRect = elem[0].getBoundingClientRect();
            const elemLeft = clientBoundingRect.left;
            const top = clientBoundingRect.top;
            let left = elemLeft + clientBoundingRect.width + 15;
            const moreOptElemWidth = moreOptElem.outerWidth();

            const categoryPanel = gridVideo.closest('.rtcp-grid-video-items');
            const categoryPanelBoundry = categoryPanel.innerWidth() +  categoryPanel.offset().left;

            if(categoryPanelBoundry < (left + moreOptElemWidth))
            {
                left = elemLeft - moreOptElemWidth - 7;
            }

            moreOptElem.css({ top : top + 'px', left : left + 'px' });

            if(event.clientX + moreOptElem.width() > vodDemo.getDOM(vodDemoConstant.UIConstants.HOME).innerWidth())
            {
                moreOptElem.css('right','40px');
            }

            gridVideo.addClass('more-opt-active');

            if(hasLength)
            {   
                const oldContentId = moreOptElem.attr('contentId');

                moreOptElem.attr('contentId', contentId).addClass('more-opt-active');
                $('#'+oldContentId).removeClass('more-opt-active');
                return;
            }

            vodDemoUtils.clickOutside.bind(
            {
                elem : moreOptElem, 
                doNotClose : (event) => 
                {
                    return $(event.target).closest(moreOptElem).length;
                }, 
                onClose : () => 
                {
                    gridVideo.removeClass('more-opt-active').find('[more_opt]').off('mouseover mouseleave');
                }
            });
        },

        openAddChapterModal : function(elem, event)
        {
            const studioModal = elem.closest('.rtcp-demo-vod-studio-modal');
            const chapterModal = studioModal.find('.rtcp-demo-vod-add-chapters-modal');
            const chapterCont = elem.closest('.rtcp-demp-vod-add-chapter-elem');
            
            const session = vodDemo.getVodDemoSession();
            const contentId = studioModal.attr('contentId');
            const content = session.getVodContent(contentId);
            const contentStudio = content.vodStudio;

            const setAddChapterTime = (time) =>
            {
                const formattedTime = vodDemo.parseOrFormatTime(time).split(':');
                const timerSecs = chapterModal.find('.rtcp-demo-vod-add-chapters-modal-body-footer-sec-timer input').get();

                timerSecs.map((input, index) => {
                    input.value = formattedTime[index];
                });
            }

            if(chapterCont.length)
            {
                const chapterId = chapterCont.attr('id');
                const chapter = content.vodStudio.getChapter(chapterId);

                chapterModal.find('.vod-chapter-title textarea').val(chapter.title || '');
                chapterModal.find('.vod-chapter-description textarea').val(chapter.description || '');
                chapterModal.attr('chapterId', chapterId);

                setAddChapterTime(chapter.offset);
            }
            else if(contentStudio)
            {
                const currentTime = contentStudio.getPlayerCurrentSeedTime();
                
                if(typeof currentTime === 'number' && currentTime > 0)
                {
                    setAddChapterTime(currentTime);
                }
            }

            chapterModal.removeClass('dN')
            
            chapterModal.find('textarea').trigger('input');
        },

        deleteChapter : function(elem, event)
        {
            const studioModal = elem.closest('.rtcp-demo-vod-studio-modal');
            const chapterElem = elem.closest('.rtcp-demp-vod-add-chapter-elem');
            const chaperId = chapterElem.attr('id');
            const cancelUpdate = chapterElem.siblings().length == 0;

            const session = vodDemo.getVodDemoSession();
            const content = session.getVodContent(studioModal.attr('contentId'));

            content.vodStudio.removeChapter(chaperId);

            if(cancelUpdate)
            {
                studioModal.find('.rtcp-demo-vod-video-cont-detail-next').attr('purpose', 'goViewerPageFromStudio').text(VODProcessXss.decodeHTMLEntities("Let&#39;s Go"));
            }

            chapterElem.remove();
        },

        toggleTheme : function(elem, event)
        {
            vodDemo.setTheme(true);
        },

        closeAddChapterModal : function(elem, event)
        {
            const studioModal = elem.closest('.rtcp-demo-vod-studio-modal');
            const chapterModal = studioModal.find('.rtcp-demo-vod-add-chapters-modal');

            chapterModal.find('textarea').val('');
            chapterModal.find('input').val('00');
            chapterModal.addClass('dN');
        },

        updateChapters : function (elem, event)
        {
            const studioModal = elem.closest('.rtcp-demo-vod-studio-modal');
            const contentId = studioModal.attr('contentId');
            const content = vodDemo.getVodDemoSession().getVodContent(contentId);
            const studio = content && content.vodStudio;
            const primaryBtn = studioModal.find('.rtcp-demo-vod-video-cont-detail-next');

            if(studio)
            {
                primaryBtn.addClass('disabled');

                const successCB = (resp) =>
                {
                    primaryBtn.removeClass('disabled');
                    primaryBtn.text(VODProcessXss.decodeHTMLEntities("Let&#39;s Go"));
                    primaryBtn.attr('purpose', 'goViewerPageFromStudio');
                    vodDemo.pushNotification('Chapters updated successfully.');
                }

                const errorCB = (err) =>
                {
                    primaryBtn.removeClass('disabled');
                    vodDemo.pushNotification("Error while updating chapters. Please try again.", true);
                }

                studio.uploadChapters(successCB, errorCB);
            }

            vodDemoHandler.UI.closeAddChapterModal(elem);
        },

        toggleChapterDescription : function (elem, event)
        {
            const parentCont = elem.closest('.rtcp-demp-vod-add-chapter-elem');
            const isDescOpen = parentCont.hasClass('desc-active');

            parentCont.toggleClass('desc-active', !isDescOpen);
            elem.attr('rtcp_demo_tooltip', isDescOpen ? 'open' : 'close');
        },

        toggleViewerDescription : function(elem, event)
        {
            const contentId = vodDemo.getDOM('viewer').attr('contentId');
            const content = vodDemo.getVodDemoSession().getVodContent(contentId);
            const descCont = vodDemo.getDOM(vodDemoConstant.UIConstants.DESC_SEC);
            const descriptionCont = descCont.find('.rtcp-vod-video-desc');
            const description = $RTCPWC.$CUtil.processXSS(content.description || '');
            const isExpandedAlready = (descriptionCont.attr('expanded') === 'true');
            const readMoreElem = descriptionCont.find('.rtcp-vod-video-desc-read-more').detach().text(isExpandedAlready ? 'show less' : '...more');

            const maxDescLen = vodDemo.getContentConfig('length', 'max_description');
            const newText = isExpandedAlready ? description.slice(0, maxDescLen) : description;
            
            descriptionCont.html(newText);
            readMoreElem.text(isExpandedAlready ? '...more' : 'show less');
            descriptionCont.append(readMoreElem);
            descriptionCont.attr('expanded', !isExpandedAlready);
        },

        goViewerPageFromStudio : function (elem, event)
        {
            const studioModal = elem.closest('.rtcp-demo-vod-studio-modal');
            const contentId = studioModal.attr('contentId');
            const session = vodDemo.getVodDemoSession();
            const content = session.getVodContent(contentId);
            const propId = content.videoPropId;
            const viewUrlPath = `/${propId}/view`;

            vodDemo.removeModal(contentId);
            vodDemo.pushHistoryState({propId}, 'Playhub', viewUrlPath);
            vodDemo.openViewerPage(contentId);
        },

        openViewerPage : function(elem, event)
        {
            const moreOptElem = elem.closest('#rtcp-vod-studio-more-opt');
            const isFromContOpts = (moreOptElem.length > 0);
            const id = isFromContOpts ? moreOptElem.attr('contentId') : elem.closest('.rtcp-grid-video-box').attr('id');
            const session = vodDemo.getVodDemoSession();
            const propId = session.getVodContent(id).videoPropId;

            if(!propId)
            {
                return;
            }

            const viewUrlPath = `/${propId}/view`;

            if(isFromContOpts)
            {
                $(`<a href="${window.location.origin}/demo/playhub${viewUrlPath}" target="_blank" style="display:none;"></a>`)[0].click();
                vodDemoHandler.UI.handleClickOnVodDemo();
                return;
            }

            vodDemo.pushHistoryState({propId}, 'Playhub', viewUrlPath);
            vodDemo.openViewerPage(id);
        },

        playFromViewerPage : function(elem, event)
        {
            const id = elem.closest('.rtcp-grid-video-box').attr('id');
            const session = vodDemo.getVodDemoSession();
            const propId = session.getVodContent(id).videoPropId;
            const videoSec = elem.attr('sec');
            const key = videoSec === 'related' ? 'relatedVideosConf' : 'queueConf';
            const isPublic = Boolean((vodDemo.getViewerState() || {})[key].scope);

            vodDemo.pushHistoryState({propId, isPublic}, 'Playhub', `/${propId}/view`);
            vodDemo.openViewerPage(id, videoSec);
        },

        openHomePage : function(elem, event)
        {
            const homePathName = '/demo/playhub';

            if(window.location.pathname === homePathName)
            {
                return;
            }

            vodDemo.pushHistoryState({}, 'RTCP VOD', '');
            vodDemo.openHomePage();
        },

        openHomePageSortingOpt : function (elem, event)
        {
            vodDemo.openHomePageSortingOpt(elem);
        },

        sortByOption : function (elem, event)
        {
            const closeCB = () => vodDemoHandler.UI.handleClickOnVodDemo();

            if(elem.hasClass('active'))
            {
                closeCB();
                return;
            }

            const category = elem.closest('[category]').attr('category');
            const sortKey = elem.attr('value');
            const order = elem.attr('desc') === "true" ? 'desc' : 'asc';
            const config = vodDemo.getDefaultConfig('sorterConfig').get(sortKey, order);

            vodDemo.reArrangeContentsInCategory(category, config);
            closeCB();
        },

        handleClickOnVodDemo : function(elem, event)
        {
            vodDemoUtils.clickOutside.close.call(vodDemoUtils.clickOutside, event);
        },

        switchTabs : function(elem, event)
        {
            vodDemo.switchTabs(elem, true);
            vodDemoHandler.UI.handleClickOnVodDemo();
        },

        slideCategoryPanel : function(elem, event, onComplete)
        {
            const parentCont = elem.closest('.rtcp-grid-video-items');
            const listCont = parentCont.find('.rtcp-grid-video-items-body');

            const args = listCont.is(':visible') ? ['slideUp', 180] : ['slideDown', 0];

            listCont[args[0]]({complete : onComplete});
            elem.css('transform', 'rotate('+args[1]+'deg)');
        },

        openUploadModal : function(elem, event)
        {
            const id = elem.closest('.rtcp-demo-vod-studio-modal').attr('contentId');
            
            requestAnimationFrame(() => {
                vodDemo.openVODStudioModal('uploadMeta', id);
            });
        },

        initiateUpload : function(elem, event)
        {
            const modal = elem.closest('.rtcp-demo-vod-studio-modal');
            const id = modal.attr('contentId');

            elem.addClass('disabled');
            vodDemo.initiateUpload(id, modal);
        },

        updateMetaInfo : function(elem, event)
        {
            const modal = elem.closest('.rtcp-demo-vod-studio-modal');
            const id = modal.attr('contentId');

            elem.addClass('disabled restricted');
            vodDemo.updateMetaInfo(id, elem, modal);
        },

        closeStudioModal : function(elem, event)
        {
            const id = elem.closest('.rtcp-demo-vod-studio-modal').attr('contentId');
            vodDemo.removeModal(id);
        },

        toggleEnchanceModalRhs : function(elem, event)
        {
            const parent = elem.closest('[modal]');
            const isMinimised = parent.hasClass('rhs-inactive');

            parent.toggleClass('rhs-inactive', !isMinimised);
        },

        switchPage : function(elem, event)
        {
            const page = elem.text();
            const category = elem.parents('.rtcp-grid-video-items').attr('category');
            
            vodDemo.switchPage(category, page);
        },

        navigatePage : function(elem, event)
        {
            const sorter = vodDemo.getCurrentSorter();
            const category = elem.parents('.rtcp-grid-video-items').attr('category');
            const isNext = (elem.attr('value') === 'next');
            const pageNo = sorter.getCurrentPageNo(category) + (isNext ? 1 : -1);

            vodDemo.switchPage(category, pageNo);
        },

        goToPage : function(elem, event)
        {   
            vodDemo.switchPage(elem.parents('.rtcp-grid-video-items').attr('category'), elem.siblings().find('input').val());
        },

        togglePageSizeDropdown : function(elem, event)
        {
            const root = vodDemo.getDOM(vodDemoConstant.UIConstants.ROOT);
            var dropDownOpts = root.find('.rtcp-vod-page-size-selector-dropdown');
            const isActive = (dropDownOpts.length > 0);
            const category = elem.parents('.rtcp-grid-video-items').attr('category');

            vodDemoHandler.UI.handleClickOnVodDemo();

            if(isActive && dropDownOpts.find('[category]').attr('category') === category)
            {
                return;
            }
            
            dropDownOpts = $(VODTemplate.getPageSizeDropdownOpts(category));

            elem.addClass('active');
            root.append(dropDownOpts);

            const clientRect = elem[0].getBoundingClientRect();
            
            const top = clientRect.top + clientRect.height + 7;
            const right = root.outerWidth() - clientRect.right;

            dropDownOpts.css('top', top+'px');
            dropDownOpts.css('right', right+'px');

            vodDemoUtils.clickOutside.bind(
            {
                elem : dropDownOpts,
                doNotClose : (event) => 
                {
                    return ($(event.target).closest(elem).length > 0);
                },
                onClose : () => 
                {
                    elem.removeClass('active');
                }
            });
        },

        selectPageSize : function(elem, event)
        {
            const pageSize = parseInt(elem.attr('value'));
            const category = elem.parent().attr('category');

            vodDemo.changePageSize(category, {pageSize});
            vodDemo.setCategoryPanelHeight(category);

            vodDemo.getDOM('home').find('.rtcp-grid-video-items[category="'+category+'"] .rtcp-vod-page-size').text(pageSize);
            vodDemo.setDefaultConfig("defaultPageSize", pageSize);
            
            vodDemoUtils.clickOutside.close.call(vodDemoUtils.clickOutside);
        },

        toggleLikeStatus : function(elem, event)
        {
            const isLiked = elem.attr('status') === 'liked';
            const parent = elem.parent();
            
            elem.attr('status', isLiked ? '' : 'liked');
            parent.attr('tooltip-title', isLiked ? 'Like' : 'Unlike').find('.rtcp-vod-like-count').text(isLiked ? 0 : 1);
        },

        startCommentEdit : function(elem, event)
        {
            const editable = elem.find('.rtcp-self-commenter-box-input-sec');
            const text = editable.text();

            if(elem.hasClass('active'))
            {
                return;
            }

            editable.attr('contenteditable', true);

            vodDemoUtils.resetCursorPosition(editable.get(0), undefined, true);

            const parent = elem.closest('.rtcp-vod-comment-sec');
            const actions = parent.find('#rtcp-vod-self-comment-actions').removeClass('dN');
            
            parent.toggleClass('btn-inactive', !(text.length > 0));
            elem.addClass('active');

            vodDemoUtils.clickOutside.bind(
            {
                elem : actions, 
                hideClass : 'dN',
                doNotClose : (event) => 
                {
                    return event.target.isEqualNode(actions.find('.rtcp-self-comment-btn').get(0));
                }, 
                onClose : () =>
                {
                    elem.removeClass('active').off('mousedown')
                    editable.blur().removeAttr('contenteditable');
                }
            });
        },

        cancelUpload : function(elem, event)
        {
            const contentId = elem.closest('[contentId]').attr('contentId');
            
            vodDemoHandler.UI.handleClickOnVodDemo();
            
            if(typeof contentId !== 'undefined')
            {
                vodDemo.cancelUpload(contentId);
                return;
            }
            
            vodDemo.removeModal();
        },

        deleteContent : function(elem, event)
        {
            const contentId = elem.parent().attr('contentId');
            
            vodDemo.deleteVodContent(contentId);
            vodDemoHandler.UI.handleClickOnVodDemo();
        },

        postComment : function(elem, event)
        {
            const contentId = vodDemo.getDOM(vodDemoConstant.UIConstants.VIEWER).attr('contentId');
            const commentSec = vodDemo.getDOM(vodDemoConstant.UIConstants.COMMENT_SEC);
            const msgBox = commentSec.find('.rtcp-self-commenter-box-input-sec');
            const msg = msgBox.text();
            
            const session = vodDemo.getVodDemoSession();
            const content = session.getVodContent(contentId);
            const vodStudio = content && content.vodStudio;
            
            if(msg.length === 0 || !vodStudio)
            {
                return;
            }

            const successCB = (id, commentObj) =>
            {
                const viewerCommentsList = commentSec.find('.rtcp-vod-viewers-comment-sec');

                if(viewerCommentsList.length === 0)
                {
                    return;
                }

                const commentHTML = $(VODTemplate.getViewerCommentBox(vodDemo.getVodDemoSession(), id, commentObj));

                if(viewerCommentsList.children().length)
                {
                    commentHTML.append('<div class="rtcp-viewer-comment-separator"></div>');
                }
                
                viewerCommentsList.prepend(commentHTML);

                commentSec.find('.rtcp-vod-total-comments-count').text(vodStudio.getCommentsCount())

                const cont = msgBox.parent();
                
                cont.removeClass('active').off('mousedown');
                msgBox.blur().removeAttr('contenteditable');
            }

            const errorCB = (err) =>
            {
                vodDemo.pushNotification("Error while posting comment. Please try again.", true);
            }

            vodStudio.addComment({msg, dname : session.getCurrentUserName()}, successCB, errorCB); 
            
            msgBox.text('');
            vodDemoHandler.UI.handleClickOnVodDemo();
        },

        cancelComment : function(elem, event)
        {
            const actionBtnCont = elem.parent();
            const parent = actionBtnCont.closest('.rtcp-vod-comment-sec');
            
            parent.find('.rtcp-self-commenter-box-input-sec').text('').blur().removeAttr('contenteditable');
            parent.find('.rtcp-self-commenter-box').removeClass('active').off('mousedown');
            actionBtnCont.remove();
        },

        replyComment : function(elem, event)
        {
            const parent = elem.parents('.rtcp-vod-viewers-comments-outer').last();
            const hasList = parent.find('.rtcp-vod-viewers-replies-list').length > 0;
            
            if(!hasList)
            {
                var list = $('<div class="rtcp-vod-viewers-replies-list"></div>');
                parent.append(list);
            }
            else
            {
                var commentCont = elem.closest('.rtcp-vod-reply-comment');
                
                if(!commentCont.length || commentCont.next('.rtcp-vod-active-reply-comment.active').length)
                {
                    return;
                }
            }

            const replyBox = $(VODTemplate.getViewerCommentBox(vodDemo.getVodDemoSession())).addClass('rtcp-vod-reply-comment active btn-inactive');
            
            hasList ? commentCont.after(replyBox) : list.append(replyBox);
            
            vodDemo.enableEditing(replyBox);
        },

        postReplyComment : function(elem, event)
        {
            const commentCont = elem.closest('.rtcp-vod-reply-comment').removeClass('active');
            const commentActionHTML = $(VODTemplate.getCommentActions());
            
            elem.parents('.rtcp-vod-viewers-replies-list').append(commentCont);

            commentCont.find('.rtcp-vod-self-reply').append(commentActionHTML);
            commentCont.find('.rtcp-viewer-commenter-box-input-sec').removeAttr('contenteditable aria-label');
            commentCont.find('.rtcp-self-comment-actions').remove();
        },

        openSelfCommentActions : function(elem, event)
        {
            const popup = $(VODTemplate.getSelfCommentActionsPopup());
            
            elem.append(popup);
            vodDemoUtils.clickOutside.bind(elem, (event) => event.target.isEqualNode(popup[0]));
        },

        editComment : function(elem, event)
        {
            const commentBox = elem.closest('.rtcp-vod-viewers-comment-box');
            vodDemo.enableEditing(commentBox);
        },

        deleteComment : function(elem, event)
        {

        }
    },

    WMS :
    {
        handleVODStatus : function(msgObj)
        {
            const session = vodDemo.getVodDemoSession();
            const info = session.getVodContent(msgObj.uploadId);
            const category = vodDemoConstant.getCategoryGroup(vodDemoConstant.categoryConstants[msgObj.status]);
            const sorter = vodDemo.getUserVodCategoryIdSorter();
            
            if(!info || Object.keys(info).length === 0 || !category || !(sorter instanceof VodSorter) || info.status === vodDemoConstant.status.COMPLETED)
            {
                return;
            }

            const status = vodDemoConstant.categoryConstants[msgObj.status];
            const videoPropId = msgObj.uploadId;
            vodDemo.updateVODContent(videoPropId, {videoPropId, contentId : msgObj.contentId, status}, sorter);
        }
    }
};

var vodDemoApi =
{
    getPlaybackDetails : function(contentId, successCB, errorCB)
    {

        $.ajax({
            url : "/_wmsrtc/demo/playhub/"+contentId+"/play",
            type : 'GET',
            success : vodDemoUtils.ensureFn(successCB),
            error : vodDemoUtils.ensureFn(errorCB)
        });
    },

    getInfo : function(contentId, successCB, errorCB)
    {
        const url = contentId ? `/${contentId}/view` : '';
        
        $.ajax({
            url : "/_wmsrtc/demo/playhub"+url,
            type : 'GET',
            success : vodDemoUtils.ensureFn(successCB),
            error : vodDemoUtils.ensureFn(errorCB),
        });
    },

    fetchVODHome : function(session, isPublic, successCallBack)
    {
        const vodContentsIdMap = session[isPublic ? 'contentByIdMap' : 'userContentByIdMap'];
        const vodCategoryIDMap = {};

        const errorCB = (err) =>
        {
            vodDemo.pushNotification("Uh-oh! Something went wrong. Please check your internet connection and try again.", true);
        }

        const successCB = (resp) =>
        {
            const data = resp.data;

            if(!data)
            {
                errorCB();
                return;
            }

            for(const videoInfo of data)
            {   
                const status = vodDemoConstant.categoryConstants[videoInfo.status];
                const category = vodDemoConstant.getCategoryGroup(status);

                if(!category || 
                    (isPublic &&  (category !== vodDemoConstant.status.COMPLETED)))
                {
                    continue;
                }

                const vodCategory = vodCategoryIDMap[category] = vodCategoryIDMap[category] || [];
                const contentId = videoInfo.videoPropId;

                if(contentId in vodContentsIdMap)
                {
                    vodCategory.push(contentId);
                    continue;
                }
                
                videoInfo.status = status;
                videoInfo.duration = vodDemo.parseOrFormatTime(videoInfo.duration / 1000, true);

                Object.assign(videoInfo, vodDemo.getDateTime(videoInfo.uploadTime));
                vodContentsIdMap[contentId] = videoInfo;
                
                vodCategory.push(contentId);
            }

            const defaultSortConf = vodDemo.getDefaultConfig('sorterConfig').getDefault();
            const categoryIdMapKeys = Object.keys(vodCategoryIDMap);
            
            const sortBy = categoryIdMapKeys.reduce((obj, key) =>
            {
                obj[key] = defaultSortConf;
                return obj;
            },{});

            const sorterInstanceObj = { data : vodContentsIdMap, sortBy};
            const sorter = new VodSorter({ list : vodCategoryIDMap, ...sorterInstanceObj});

            vodDemo[isPublic ? '_vodCategoryIdSorter' : '_userVodCategoryIdSorter'] = sorter;

            vodDemoUtils.ensureFn(successCallBack)(sorter);
            vodDemo.setUploadAllowed(resp.isUploadAllowed);
        };

        return $.ajax({
            url : "/_wmsrtc/demo/playhub/contents?scope="+(isPublic ? 1 : 0),
            type : 'GET',
            success : successCB,
            error : errorCB,
        });
    },

    fetchVODViewer : function(session, propId)
    {
        const errorCB = (err) =>
        {
            vodDemo.pushNotification("Uh-oh! Something went wrong. Please check your internet connection and try again.", true);
        }

        const successCB = (resp) =>
        {
            const content = resp.data;

            if(typeof content !== 'object')
            {
                errorCB();
                return;
            }

            const isPublic = content.visibility;
            const vodContentsIdMap = session[isPublic ? 'contentByIdMap' : 'userContentByIdMap'];
            const status = vodDemoConstant.categoryConstants[content.status];
            const category = vodDemoConstant.getCategoryGroup(status);

            Object.assign(content, vodDemo.getDateTime(content.uploadTime));

            if(!category || 
                (isPublic &&  (category !== vodDemoConstant.status.COMPLETED)))
            {
                vodDemo.pushNotification("Uh-oh! Something went wrong. Please try again.", true);;
                return;
            }

            content.status = status;
            content.duration = vodDemo.parseOrFormatTime(content.duration / 1000, true);
            content.vodStudio = new ZRVODViewer(content.vodkey, {pbToken : content.pbtoken, wssUrl : content.wssurl, userId: content.viewerid, contentId : content.contentId} )
            const emitter = content.vodStudio.getEmitter();
            
            const handleSessionReady = () =>
            {
                vodDemo.setActiveTab(isPublic ? vodDemoConstant.UIConstants.HOME : vodDemoConstant.UIConstants.MY_VIDEOS);
                vodDemo.openViewerPage(propId);
            };

            const handleInvalidSession = () =>
            {
                vodDemo.pushNotification("Uh-oh! Something went wrong. Please try again.", true);;
            };

            //emitter.on("handleSessionReady", handleSessionReady);
            //emitter.on("handleInvalidSession", handleInvalidSession); 

            vodContentsIdMap[propId] = content;
            vodDemo.pushHistoryState({ // To Handle popstate, Need to maintain video state
                propId : propId, 
                isPublic : Boolean(isPublic)
            }, 'Playhub', `/${propId}/view`);
            handleSessionReady();
        };

        return $.ajax({
            url : "/_wmsrtc/demo/playhub/"+propId+"/play",
            type : 'GET',
            success : successCB,
            error : errorCB,
        });
    },

    getUploadId : function(successCB, errorCB)
    {
        $RTCAjx.ajax({
            url : "/_wmsrtc/demo/playhub/upload",
            type : "GET",
            success : vodDemoUtils.ensureFn(successCB),
            error : vodDemoUtils.ensureFn(errorCB),
        });
    },

    updateMetaInfo : function(contentId, data, successCB, errorCB)
    {
        $.ajax({
            url : `/_wmsrtc/demo/playhub/${contentId}/update`,
            contentType: 'application/json',
            type : "PUT",
            data : JSON.stringify(data),
            success : vodDemoUtils.ensureFn(successCB),
            error : vodDemoUtils.ensureFn(errorCB),
        });
    },

    deleteContent : function(contentId, successCB, errorCB)
    {
        var data = 
        {
            opr : 'deletecontent',
            contentid : contentId
        };

        $RTCAjx.ajax({
            url : "/rtcpdemoaction.do",
            type : "GET",
            data : data,
            success : vodDemoUtils.ensureFn(successCB),
            error : vodDemoUtils.ensureFn(errorCB),
        });
    },

    cancelUpload : function(contentId, successCB, errorCB)
    {
        $.ajax({
            url : "/_wmsrtc/demo/playhub/"+contentId+"/cancel",
            type : "DELETE",
            success : vodDemoUtils.ensureFn(successCB),
            error : vodDemoUtils.ensureFn(errorCB),
        });
    },
};

var vodDemoUtils =
{
    clickOutside : (function ()
    {
        var popUpElem = null;

        return {
            bind : function (configs)
            {
                this.close();

                this.doNotClose = vodDemoUtils.ensureFn(configs.doNotClose);
                this.onClose = vodDemoUtils.ensureFn(configs.onClose);
                this.hideClass = configs.hideClass || null;
                
                popUpElem = configs.elem;
            },

            close : function (event) 
            {
                if(popUpElem !== null)
                {
                    const doNotClose = this.doNotClose;
                    const onClose = this.onClose;

                    if(event && typeof doNotClose === 'function' && doNotClose(event))
                    {
                        return;
                    }
                    
                    if(popUpElem.length > 0)
                    {
                        if(this.hideClass !== null)
                        {
                            popUpElem.addClass(this.hideClass);
                        }
                        else
                        {
                            popUpElem.remove();
                        }
                        
                        popUpElem = null;

                        if(typeof onClose === 'function')
                        {
                            onClose();
                        }
                    }
                    
                    this.onClose = null;
                    this.doNotClose = null;
                }
            }
        }
    })(),

    ensureFn : function (fn)
    {
        return typeof fn === 'function' ? fn : function(){}
    },

    removeClass : function (elem, prefix)
    {
        if(elem.length === 0) 
        {
            return;
        }
        
        elem.removeClass(function(index, currentClass)
        {
            return currentClass.match(new RegExp('\\b' + prefix + '\\S+', 'g')) || [];
        });
    },

    resetCursorPosition : function (node, pos, isDIV)
    {
        if(isDIV)
        {
            const selection = window.getSelection();
            const range = document.createRange();
            
            range.selectNodeContents(node);
            selection.removeAllRanges();
            selection.addRange(range);
            range.collapse(false);
        }
        else
        {
            node.setSelectionRange(pos, pos);
        }
    },

    bindTextListeners : function (bindingConfig = {})
    {
        var { elem, limitExceedError } = bindingConfig;

        elem.off('.vodTextListeners');
        limitExceedError = (limitExceedError === true || typeof limitExceedError !== 'object') ? {} : limitExceedError;

        const {limit, events, onTextChange, onLimitExceed, isKeyAllowed} = bindingConfig;
        const isDIV = elem.is('div');
        const get = () => isDIV ? elem.text() : elem.val();
        const set = (value) => isDIV ? elem.text(value) : elem.val(value);
        const node = elem[0];

        const allowedEventCode = 
        [
            'Backspace', 'Delete', 'Tab', 'Shift', 'Pause',
            'Control', 'Alt', 'Meta',
            'End', 'Home', 'Page', 'Arrow',
            'Insert', 'ContextMenu', 'CapsLock', 'NumLock', 'ScrollLock'
        ];

        const limitEnforcer = (event) =>
        {
            let length = get().length + 1;

            if(event.code === 'Escape') 
            {
                elem.blur(); 
                event.preventDefault();
                return;
            }
            
            if(length > limit)
            {
                if(event.metaKey || event.ctrlKey || allowedEventCode.some((code) => event.code.startsWith(code)))
                {
                    return; // Allow these keys
                }

                const selection = window.getSelection();

                if(selection.toString().length > 0)
                {
                    if(isDIV) // for conteneteditable div
                    {
                        const range = selection.getRangeAt(0);
                            
                        if(node.contains(range.commonAncestorContainer) && checkAndExecute(isKeyAllowed,[event.key]))
                        {
                            return; // Allow the key
                        }
                    }
                    else
                    {
                        const selectLength = node.selectionEnd - node.selectionStart;

                        if(selectLength > 0 && checkAndExecute(isKeyAllowed,[event.key]))
                        {
                            return;
                        }
                    }
                }

                event.preventDefault();
                elem.trigger(vodDemoConstant.status.ERROR);
                checkAndExecute(onLimitExceed);
            }
        }

        const changeListener = (event) =>
        {
            let value = get();
            let length = value.length;

            if(length > limit) // for paste event
            {
                value = value.slice(0, limit);
                set(value);
                length = limit;

                elem.trigger(vodDemoConstant.status.ERROR);
                vodDemoUtils.resetCursorPosition(node, limit, isDIV); // Reset cursor position to the end -> assigning value will reset the cursor position
                checkAndExecute(onLimitExceed);
            }

            checkAndExecute(onTextChange, [value, length, limit]);
        }

        const checkAndExecute = (fn, arg = []) =>
        {
            if (typeof fn === 'function') 
            {
                return fn(...arg, elem);
            }

            return true; // if fn is not a function, return true
        }
        
        if(!events || events.includes('keydown'))
        {
            elem.on('keydown.vodTextListeners', limitEnforcer);
        }

        if(!events || events.includes('input'))
        {
            elem.on('input.vodTextListeners', changeListener);
        }

        if(limitExceedError)
        {	
            let errElem;

            if(typeof limitExceedError.errContClass === 'string')
            {
                const closesElem = elem.closest('.' + limitExceedError.errContClass);
                
                if(closesElem.length)
                {
                    errElem = closesElem;
                }
            }
            else
            {
                errElem = elem;
            }

            let errTimeout = null;

            const showInputError = () =>
            {	
                if(errTimeout !== null)
                {
                    clearTimeout(errTimeout);
                }

                errElem.attr('input_error_status', true);

                errTimeout = setTimeout(() => {
                    errElem.removeAttr('input_error_status');
                    errTimeout = null;
                }, 200);
            };

            elem.on('error.vodTextListeners', showInputError);
        }
    }
};
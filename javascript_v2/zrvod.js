//$Id$

var ZRVOD = 
{
    initVODViewer (contentKey, userTokenDetails, elementId, playerConfig, playerEvents)
    {
        var session = new ZRVODViewer(contentKey, userTokenDetails);

        session.initVodPlayer(elementId, playerConfig, playerEvents);
        
        if(userTokenDetails.contentId)
        {
            session._contentId = undefined;
            return session;
        }

        session.getInfo();
        return session;
    },

    initVODStudio (contentKey, userTokenDetails, elementId, playerConfig, playerEvents)
    {
        var session = new ZRVODStudio(contentKey, userTokenDetails);

        session.initVodPlayer(elementId, playerConfig, playerEvents);

        if(userTokenDetails.contentId)
        {
            session._contentId = undefined;
            return session;
        }

        session.getInfo();
        return session;
    }
}

class ZRVODViewer
{
    constructor(contentKey, userTokenDetails)
    {
        this._contentKey = contentKey;
        this._pbToken = userTokenDetails.pbToken;
        this._userId = userTokenDetails.userId;
        this._wssUrl = userTokenDetails.wssUrl;
        
        this._mediaPlayerObj =
        {
            configs : {},
            mediaPlayer : undefined,
            bindEvents : {}
        }

        this._contentId = userTokenDetails.contentId;
        this._acl = undefined;
        this._chaptersList = {};
        this._pendingChapters = {}; // Chapters which are not yet uploaded to server.
        this._comments = {};

        this._reqTypes =
        {
            POST: 'POST',
            GET: 'GET',
            PUT : 'PUT',
            DELETE : 'DELETE'
        };
        
        this._actionReqTypes =
        {
            CHAPTER : "chapter",
            COMMENT : "comment"
        }

        this._eventEmitter = new ZREventEmitter();

        //this.getInfo();

        if(!this._contentId)
        {
            this.getInfo();
        }
    }

    getWSSUrl ()
    {
        return this._wssUrl;
    }

    getEmitter ()
    {
        return this._eventEmitter;
    }

    getUserId ()
    {
        return this._userId;
    }

    getMediaPlayer ()
    {
        return this._mediaPlayerObj.mediaPlayer;
    }

    getPlayerCurrentSeedTime () 
    {
        return this.getMediaPlayer()._videoInstance.currentTime;
    }

    getChapter(id)
    {
        var chapter = this.getChapters()[id];

        if(!chapter)
        {
            chapter = this.getPendingChapters()[id];
        }

        return chapter;
    }

    getPendingChapters()
    {
        return this._pendingChapters;
    }

    getChapters()
    {
        return {...this._chaptersList, ...this._pendingChapters}; // Merge chapters and pending chapters
    }

    getComments()
    {
        return this._comments;
    }

    getCommentsCount()
    {
        return Object.keys(this._comments).length;
    }
    
    ZRVODApi (urlPath, type, data = {}, successCB, errorCB)
    {
        const headers = Object.assign({"x-pbtoken" : this._pbToken}, data.headers);
        
        if(Array.isArray(urlPath))
        {
            urlPath = urlPath.join("/");
        }
        else
        {
            urlPath = this._contentId + "/" + urlPath;
        }

        $.ajax({
            url : "/_wmsrtc/v2/vod/" + urlPath, // No I18N
            type : type,
            data : data.payLoad,
            contentType : "", // NO I18N
            headers : headers,
            success : function(resp)
            {
                if(typeof successCB === "function") // No I18N
                {
                    successCB(resp);
                }
            },
            error : function(errorResp)
            {
                if(typeof errorCB === "function") // No I18N
                {
                    errorCB(errorResp);
                }
            }
        });
    }

    displayChapters ()
    {
        const mediaPlayer = this.getMediaPlayer();
        const chaptersList = {...this.getChapters(), ...this.getPendingChapters()}; // Merge chapters and pending chapters
        var data = [];

        for(var id in chaptersList)
        {
            const chapter = chaptersList[id];

            data.push({
                "module": "Chapter",
                "eventid": id,
                "offset_in_sec": chapter.offset,
                "data": chapter
            });
        }

        if(mediaPlayer instanceof RTCMediaPlayerObj)
        {
            mediaPlayer.getCustomEventsData = () =>
            {
                return {
                    "videokey": this._contentKey,
                    "data": data,
                    "successcallback": ()=>{},
                    "failurecallback":()=>{}
                }
            }
        
            mediaPlayer.loadEvents();
        }
    }

    loadChapters (successCB, failureCB)
    {
        let successCallback = (resp) =>
        {
            if(typeof resp !== "string")
            {
                if(typeof successCB === 'function') // since request is successful, successCB should be called
                {
                    successCB();
                }

                return;
            }

            let msgObj;
            let chapters = {};

            resp.split("\n").forEach(msg => 
            {
                if(msg.trim())
                {
                    msgObj = JSON.parse(msg);
                    msgObj = JSON.parse(msgObj.msg.msg);

                    let id = Math.random().toString(12).substring(2);
                    chapters[id] = JSON.parse(msgObj.data);
                }
            });

            this._chaptersList = chapters;  
            this.displayChapters(); 

            if(typeof successCB === 'function')
            {
                successCB(this.getChapters());
            }
        }
        
        this.ZRVODApi(this._actionReqTypes.CHAPTER, this._reqTypes.GET, undefined, successCallback, failureCB);
    }
    
    getInfo ()
    {
        var urlPath = [this._userId, "getinfo"];
        var data = { payLoad : { pbtoken : this._pbToken }};

        const successCallback = (resp) =>
        {
            this._contentId = resp.contentid;
            this._acl = resp.vieweracl;

            this._eventEmitter.emit("handleSessionReady", this);
        }

        const errorCB = (errorResp) =>
        {
            this._eventEmitter.emit("handleInvalidSession", this, errorResp);
        }

        this.ZRVODApi(urlPath, this._reqTypes.GET, data, successCallback, errorCB);
    }

    initVodPlayer (playerDivId, playerConfig = {}, customPlayerEvents = {})
    {
        if(typeof playerDivId !== 'string' || !playerDivId.trim()) // " " not valid 
        {
            return;
        }

        const mediaPlayer = new RTCMediaPlayerObj(playerDivId);
        const session = this;

        const config = 
        {
            title : "enable",                       //No I18N
            keycontrols : "enable",                 //No I18N
            seekbar : "enable",                     //No I18N
            tooltip : "enable",                     //No I18N
            time : "enable",                        //No I18N
            pauseOrPlay : "enable",                 //No I18N
            volume : "enable",                      //No I18N
            playbackspeed : "enable",               //No I18N
            minimisePlayer : "enable",              //No I18N
            maximisePlayer : "enable",              //No I18N
            bottomControls : "enable",              //No I18N
            pictureInPicture : "enable",            //No I18N
            seperatePlaybackSpeed : "enable",       //No I18N
            settings : "enable",                    //No I18N
            qualityInSettings : "enable",           //No I18N
            hls : "enable",                         //No I18N
            popEnabled : "enable",                  //No I18N
            closeNeeded : "disable",                 //No I18N
            events : "enable",                      //No I18N
            customEvents : "enable"                 //No I18N
        };

        if(Object.keys(playerConfig).length)
        {
            this._mediaPlayerObj.configs = playerConfig;
        }

        var playerCallback = () =>
        {
            Object.assign(config, this._mediaPlayerObj.configs);
            mediaPlayer.setPlayerConfig(config);
            mediaPlayer.playContent(this._contentKey, this._pbToken, this._wssUrl, this._userId);
        }

        const customEventCB = function (funcName, args = [])
        {
            let eventFunc = this._mediaPlayerObj.bindEvents[funcName];
            if(eventFunc)
            {
                eventFunc(...args);
            }
        }

        const vodPlayerEvents = 
        {
            getTooltipContent (eventtime, eventid, eventmodule, eventdata)
            {
                if(!eventid)
                {
                    return "";
                }

                let customEvent = session._mediaPlayerObj.bindEvents.getTooltipContent;

                if(customEvent)
                {
                    return customEvent(eventtime, eventid, eventmodule, eventdata);
                }

                return '<div class="rtcp-mp-tooltip-bg" style="width: 158px;height: 90px;background-position : center;background-repeat : no-repeat;background-color: transparent;background-size: cover;"></div>'+
                        '<div class="rtcp-mp-tooltip-text-wrapper" style="color: #eee;margin-top: 4px;">'+    
                        '<div class="rtcp-mp-tooltip-title"><span>'+eventdata.title+'</span></div>'+
                        '<span class="rtcp-mp-tooltip-text" style="height: 19px;">'+eventtime+'</span></div>';
            },

            onPlay ()
            {
                customEventCB.call(session, "onPlay");
            }
        };

        for(let event in vodPlayerEvents)
        {
            mediaPlayer[event] = vodPlayerEvents[event];
        }

        if(Object.keys(customPlayerEvents).length)
        {
            this._mediaPlayerObj.bindEvents = {};
        }
        else
        {
            customPlayerEvents = this._mediaPlayerObj.bindEvents;
        }

        for(let event in customPlayerEvents)
        {
            let bindEvent = customPlayerEvents[event];

            if(typeof bindEvent === 'function')
            {
                if(!this._mediaPlayerObj.bindEvents[event])
                {
                    this._mediaPlayerObj.bindEvents[event] = bindEvent;
                }

                if(typeof vodPlayerEvents[event] !== 'function')
                {
                    mediaPlayer[event] = bindEvent;
                }
            }
        }

        this._mediaPlayerObj.mediaPlayer = mediaPlayer;
        playerCallback();
    }

    swapVodPlayerContainer (playerDivId)
    {
        const mediaPlayer = this.getMediaPlayer();
        const newPlayerDOM = $("#" + playerDivId);

        if(!(mediaPlayer instanceof RTCMediaPlayerObj) || !newPlayerDOM.length)
        {
            return;
        }

        var oldPlayerId = mediaPlayer.getMediaPlayerDivID();
        var oldPlayerDOM = $("#" + oldPlayerId);

        if(oldPlayerDOM.length && mediaPlayer.isEventsLoaded)
        {   
            let eventCont = oldPlayerDOM.children('#event_cont_'+ oldPlayerId);
            eventCont.attr("id", "event_cont_" + playerDivId);
            newPlayerDOM.append(oldPlayerDOM.children(`[mediaplayerid="${oldPlayerId}"]`)).append(eventCont);
            
            if(RTCMediaPlayerObjList[mediaPlayer.mediaPlayerDiv])
            {
                RTCMediaPlayerObjList[playerDivId] = mediaPlayer;
                delete RTCMediaPlayerObjList[mediaPlayer.mediaPlayerDiv];
            }
            
            newPlayerDOM.find('[mediaplayerid]').attr("mediaplayerid", playerDivId);
        }
        else
        {
            mediaPlayer.isCustomDiv = true;
            
            if(RTCMediaPlayerObjList[mediaPlayer.mediaPlayerDiv])
            {
                RTCMediaPlayerObjList[mediaPlayer.mediaPlayerDiv].closeMediaPlayer(false);
            }
        }

        mediaPlayer.mediaPlayerDiv = playerDivId;
    }

    play ()
    {
        const mediaPlayer = this.getMediaPlayer();

        if(mediaPlayer instanceof RTCMediaPlayerObj)
        {
            mediaPlayer.play();
        }
    }

    pause ()
    {
        const mediaPlayer = this.getMediaPlayer();

        if(mediaPlayer instanceof RTCMediaPlayerObj)
        {
            mediaPlayer.pause();
        }
    }

    closePlayer (clearBindEvents, clearConfigs)
    {
        let mediaPlayer = this.getMediaPlayer();

        if(mediaPlayer instanceof RTCMediaPlayerObj)
        {
            mediaPlayer.closeMediaPlayer(false);
            this._mediaPlayerObj.mediaPlayer = undefined;
            
            if(clearBindEvents)
            {
                this._mediaPlayerObj.bindEvents = {};
            }

            if(clearConfigs)
            {
                this._mediaPlayerObj.configs = {};
            }
        }
    }

    addComment (commentObj, successCb, errorCb)
    {
        let msg = commentObj.msg;
        let data = { payLoad : JSON.stringify({comment : msg}) };

        const errorCallback = (error) =>
        {
            if(typeof errorCb === "function")
            {
                errorCb(error);
            }
        }

        const successCallback = (resp) =>
        {
            let msgId = resp.msgid;

            if(typeof msgId === 'undefined')
            {   
                errorCallback();
                return;
            }

            const id = Date.now();

            const commentInfo = 
            {
                dname : commentObj.dname, 
                userid : this.getUserId(),
                comment : msg, 
                time : id
            };

            this._comments[id] = commentInfo;
            
            if(typeof successCb === "function")
            {
                successCb(id, commentInfo);
            }
        }

        this.ZRVODApi(this._actionReqTypes.COMMENT, this._reqTypes.POST, data, successCallback, errorCallback);
    }

    loadComments (successCb, failureCB)
    {   
        let successCallback = (resp) =>
        {
            if(typeof resp !== "object" || !Array.isArray(resp.data))
            {
                if(typeof successCb == "function")
                {
                    successCb(this._comments);
                }

                return;
            }

            const data = resp.data;

            for(const comment of data)
            {
                const id = comment.time;
                
                this._comments[id] =
                {
                    dname : comment.dname, 
                    userid : comment.sender,
                    comment : comment.msg, 
                    time: comment.time
                };
            }

            if(typeof successCb == "function")
            {
                successCb(this._comments);
            }
        }

        this.ZRVODApi(this._actionReqTypes.COMMENT, this._reqTypes.GET, undefined, successCallback, failureCB);
    }

    editComment (msgObj)
    {
        var data = {payload : msgObj};
        this.ZRVODApi(this._actionReqTypes.COMMENT, this._reqTypes.PUT, data);
    }

    deleteComment (msgObj)
    {
        var data = {payload : msgObj};
        this.ZRVODApi(this._actionReqTypes.COMMENT, this._reqTypes.DELETE, data);
    }

    terminate ()
    {
        const mediaPlayer = this.getMediaPlayer();

        if(mediaPlayer instanceof RTCMediaPlayerObj)
        {
            mediaPlayer.closeMediaPlayer(false);
        }
        
        for(let prop in this)
        {
            if(this.hasOwnProperty(prop))
            {
                delete this[prop];
            }
        }
    }
}

class ZRVODStudio extends ZRVODViewer
{
    constructor(contentKey, userTokenDetails)
    {
        super(contentKey, userTokenDetails);
    }

    addChapter (chapterObj)
    {
        if(typeof chapterObj === "object")
        {
            Object.assign(this._pendingChapters, chapterObj);
        }

        this.displayChapters();
    }

    removeChapter (id)
    {
        delete this.getPendingChapters()[id];
        this.displayChapters();
    }
    
    uploadChapters (successCB, failureCB)
    {
        const chaptersList = this.getPendingChapters();
        const chapters = [];

        for(let id in chaptersList)
        {
            chapters.push(chaptersList[id]);
        }
        
        const successCallback = (resp) =>
        {
            Object.assign(this._chaptersList, chaptersList) 
            this._pendingChapters = {}; // Clear pending chapters after successful upload.

            if(typeof successCB === 'function')
            {
                successCB(resp);
            }
        }

        var data = { payLoad : JSON.stringify({chapters}) };
        
        this.ZRVODApi(this._actionReqTypes.CHAPTER, this._reqTypes.POST, data, successCallback, failureCB);
    }
};
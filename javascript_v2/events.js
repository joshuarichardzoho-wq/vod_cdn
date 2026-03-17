//$Id$
var RTCMediaEvent = {};
var RTCPEventObject = {};
var eventModuleObject={};
var eventObject = {};

var eventObject = function(module, eventid, eventTime, offsetTime, data, type)
{
    this.module = module;
    this.eventid = eventid;
    this.eventtime =  eventTime;
    this.offsetTime = offsetTime;
    this.data = data;
    this.type = type;
}
eventObject.prototype =
    {
        getModule: function () 
        {
            return this.module;
        },

        getEventID : function() 
        {
            return this.eventid;
        },

        getEventTime : function () 
        {
            return this.eventtime;
        },

        getEventData : function() 
        {
            return this.data;
        },

        getOffsetTime : function () 
        {
            return this.offsetTime;
        }, 
        getType : function () 
        {
            return this.type;
        },
        recordEvent : function (transcriptwriteflag, dispatchflag, successCallback, failureCallBack) 
        {
        	var rtcpConfSession = RTCP.getConferenceSession();

        	if(!rtcpConfSession)
        	{
        		return;
        	}

            var reqobj ={
                conferencekey : rtcpConfSession._conferencekey,
                module : this.module,
                data : JSON.stringify(this.data),
                transcriptwriteflag : transcriptwriteflag,
                dispatchflag : dispatchflag,
                type : this.getType()
            }
            if(this.eventid)
            {
                reqobj.eventid = this.eventid;
            }
            if(this.eventtime)
            {
                reqobj.eventtime = this.eventtime;
            }
            if(this.offsetTime)
            {
                reqobj.offsettime = this.offsetTime;
            }
            /*else
            {
                reqobj.offsettime = Math.ceil((new Date().getTime() - RTCP.getRTCPConferenceObj().getStartTime()) / 1000);
            }*/
            $RTCAjx.ajax({
                url: "/_wmsrtc/v2/playbackevent",
                type : "POST",
                data: reqobj,
                contentType : "application/json",
                success: function(result)
                {
                    //console.log(result)
                	if(successCallback && typeof successCallback =='function')
                    {
                		successCallback(result);
                    }
                },
                failure: function(result)
                {
                    //console.log(result)
                	if(failureCallBack && typeof failureCallBack =='function')
                    {
                		failureCallBack(error);
                    }
                }});
        }
    }


var eventModuleObject = function (module)
{
    this.module = module;
    this.moduleData = [];
    this.currentEventId = undefined;

    this.keyindexNeeded = true;
    this.timeIndexNeeded = true;
    this.valueLookUpNeeded = true;
    this.timeVsUserNeeded = false;

    this.keyIndex = {}; //{eventid : eventTime}

    this.timeIndexList = []; //[eventTime]
    this.timeIndexMap = {}; //{eventTime : eventid}
    this.offSetIndexList = []; //[offSetTime]
    this.offSetVsTimeMap = {}; // {offset : eventTime}
    this.offSetVsDataMap = {};

    this.valueLookUp= {}; //{eventid : eventObj}

    this.timeVsUser={}; //{eventtime : [useridList]}
}

eventModuleObject.prototype =
    {
        setKeyIndexNeeded : function (keyindexneeded) // not used
        {
            this.keyindexNeeded = keyindexneeded;
        },

        setTimeIndexNeeded : function (timeIndexNeeded) // not used
        {
            this.timeIndexNeeded = timeIndexNeeded;
        },

        setValueLookUpNeeded : function (valueLookUpNeeded) // not used
        {
            this.valueLookUpNeeded = valueLookUpNeeded;
        },
        setTimeVsUserNeeded : function (timeVsUserNeeded) // not used
        {
            this.timeVsUserNeeded = timeVsUserNeeded;
        },
        getOffSetTimeVsDataMap : function () 
        {
            return this.offSetVsDataMap;
        },
        addEventObject : function (eventObject) 
        {
            this.moduleData.push(eventObject);

            if(this.keyindexNeeded)
            {
                this.keyIndex[eventObject.getEventID()] = eventObject.getEventTime();
            }
            if(this.timeIndexNeeded)
            {
                this.timeIndexList.push(eventObject.getEventTime());
                this.timeIndexMap[eventObject.getEventTime()] = eventObject.getEventID();
                this.offSetVsTimeMap[eventObject.getOffsetTime()] = eventObject.getEventTime();
                this.offSetIndexList.push(eventObject.getOffsetTime());
                if(!this.offSetVsDataMap[eventObject.getOffsetTime()])
                {
                    this.offSetVsDataMap[eventObject.getOffsetTime()] = []
                }
                this.offSetVsDataMap[eventObject.getOffsetTime()].push(eventObject);
            }
            if(this.valueLookUpNeeded)
            {
                this.valueLookUp[eventObject.getEventID()] = eventObject;
            }
            if(this.timeVsUserNeeded)
            {
                if(eventObject.getEventData().userid)
                {
                    if(!this.timeVsUser[eventObject.getEventTime()])
                    {
                        this.timeVsUser[eventObject.getEventTime()] = [];
                    }
                    this.timeVsUser[eventObject.getEventTime()].push(eventObject.getEventData().userid);
                }
            }

        },

        sortTimeIndexArray : function (rtcMediaPlayerObj) 
        {
            this.timeIndexList.sort(function (a,b){return a-b});
            this.offSetIndexList.sort(function (a,b){return a-b});

            if(this.currentEventId == undefined && rtcMediaPlayerObj.getCurrentSeedTime()!=undefined)
            {
                this.currentEventId = this.getNextEventFromOffset(rtcMediaPlayerObj.getCurrentSeedTime());
            }
        },

        getNextTime : function (eventTime) 
        {
        	eventTime = parseFloat(eventTime);
            return this.timeIndexList.find(e => e >= eventTime);
        },

        getNextOffSetTime : function (offSetTime) 
        {
        	offSetTime = parseFloat(offSetTime);
            return this.offSetIndexList.find(e => e >= offSetTime);
        },

        getTimeFromId : function (eventid) // not used
        {
            return this.keyIndex(eventid);
        },

        getEventIDFromEventTime : function (eventTime) 
        {
            return this.timeIndexMap[this.getNextTime(eventTime)];
        },

        getEventObjectFromEventId : function (eventid) 
        {
            return this.valueLookUp[eventid];
        },

        getNextEventFromOffset : function(offSetTime) 
        {
            return this.getEventIDFromEventTime(this.offSetVsTimeMap[this.getNextOffSetTime(offSetTime)]);
        },

        playEvent : function (offSetTime,obj,mediaplayerObj) 
        {
            //console.log("inside play event",offSetTime,this.currentEventId,this);
            /*if(!this.currentEventId)
            {
                return;
            }*/
            if(this.currentEventId != undefined && this.getEventObjectFromEventId(this.currentEventId).getOffsetTime() < offSetTime)
            {
                var eventID = this.getNextEventFromOffset(offSetTime)
                if(!eventID)
                {
                    //console.log(this.getEventObjectFromEventId(this.currentEventId),this.getOffSetTimeVsDataMap()[this.getEventObjectFromEventId(this.currentEventId).getOffsetTime()])
                    //obj.stopTimer();
                    for(var i=0; i<this.getOffSetTimeVsDataMap()[this.getEventObjectFromEventId(this.currentEventId).getOffsetTime()].length;i++)
                    {
                        var eventObj = this.getOffSetTimeVsDataMap()[this.getEventObjectFromEventId(this.currentEventId).getOffsetTime()][i]
                        //console.log("1",eventObj,offSetTime,this.getOffSetTimeVsDataMap()[this.getEventObjectFromEventId(this.currentEventId).getOffsetTime()])
                        mediaplayerObj.handleDefaultEvents(eventObj.getModule(),eventObj.getEventData());
//                        if(typeof RTCP != "undefined")
//                        {
//                        	RTCP.getEventMsgObj({data : eventObj.getEventData(),module : eventObj.getModule(),mode : "recording"})
//                        }
                        mediaplayerObj.handleEvents(eventObj.getModule(), eventObj.getEventData());
                        RTCMediaEvent.addPopupBox(obj,offSetTime,eventObj.getEventData())
                    }
                    this.currentEventId = eventID;
                    return;
                }
                //var eventObj = this.getEventObjectFromEventId(this.currentEventId);
                //console.log(eventObj,this.getOffSetTimeVsDataMap()[this.getEventObjectFromEventId(this.currentEventId).getOffsetTime()])
                for(var i=0; i<this.getOffSetTimeVsDataMap()[this.getEventObjectFromEventId(this.currentEventId).getOffsetTime()].length;i++)
                {
                    var eventObj = this.getOffSetTimeVsDataMap()[this.getEventObjectFromEventId(this.currentEventId).getOffsetTime()][i]
                    //console.log("2",eventObj,offSetTime,this.getOffSetTimeVsDataMap()[this.getEventObjectFromEventId(this.currentEventId).getOffsetTime()])
                    mediaplayerObj.handleDefaultEvents(eventObj.getModule(),eventObj.getEventData());
//                    if(typeof RTCP != "undefined")
//                    {
//                    	RTCP.getEventMsgObj({data : eventObj.getEventData(),module : eventObj.getModule(), mode : "recording"})
//                    }
                    mediaplayerObj.handleEvents(eventObj.getModule(), eventObj.getEventData());
                    RTCMediaEvent.addPopupBox(obj,offSetTime,eventObj.getEventData())
                }
                this.currentEventId = eventID;
            }
         // else if(this.getEventObjectFromEventId(this.getNextEventFromOffset(offSetTime)).getOffsetTime() < offSetTime)
            else
            {
            	var nextEventObjID = this.getNextEventFromOffset(offSetTime);
            	var nextEventObj = this.getEventObjectFromEventId(nextEventObjID);
            	var currentEventObj = this.getEventObjectFromEventId(this.currentEventId)
                
                if(nextEventObj)
            	{
                	if(currentEventObj)
                	{
                        if(currentEventObj.getOffsetTime() >= nextEventObj.getOffsetTime())
                		{
                    		this.currentEventId = nextEventObjID;
                		}
                    }
                    else
                    {
                    	if(offSetTime >= nextEventObj.getOffsetTime())
                		{
                    		this.currentEventId = nextEventObjID;
						}
						else 
						{
							this.currentEventId = this.timeIndexMap[this.offSetIndexList.find((t) => t <= nextEventObj.getOffsetTime())];
						}
                    }
            	}
                else
                {
                	this.currentEventId = undefined;
                }
            }
        },
        setNextCurrentEventIdFortime : function (offSetTime) 
        {
        	offSetTime = parseFloat(offSetTime);
            var eventID = this.getNextEventFromOffset(offSetTime)
            this.currentEventId = eventID;
            /*if(eventID)
            {
                this.currentEventId = eventID
            }*/
        }
    }

var RTCEventObj = function(confKey)
{
    this._confKey = confKey;
    this._moduleObjectsMap = {};
    this._timerID = null;
    this._currentSeedTime = null;
    this.playbackModule = "ALL";
    this.filterPlaybackModule = "ALL"
}
RTCEventObj.prototype =
    {
        setPlaybackModule : function (moduleName) 
        {
            this.playbackModule = moduleName;
        },
        getPlaybackModule : function() 
        {
            return this.playbackModule;
        },
        setFilterPlaybackModule : function (moduleName) 
        {
            if(moduleName)
            {
                this.filterPlaybackModule = moduleName;
            }
        },
        getFilterPlaybackModule : function () 
        {
            return this.filterPlaybackModule;
        },
        getFilterPlaybackIndex : function () 
        {
            var filerModuleName = this.getFilterPlaybackModule();
            if(filerModuleName != "ALL" && filerModuleName !="NONE" )
            {
                return this.getModuleObjectsAsMap()[filerModuleName].getOffSetTimeVsDataMap();
            }
        },
        getConfKey : function() // not used
        {
            return this._confKey;
        },
        getModuleObjectsAsMap : function() 
        {
            return this._moduleObjectsMap;
        },
        setTimerID : function (timerID) // not used
        {
            this._timerID = timerID;
        },
        getTimerID : function () // not used
        {
            return this._timerID;
        },
        setCurrentSeedTime : function (time) 
        {
            this._currentSeedTime = time;
        },
        getCurrentSeedTime : function ()
        {
            return this._currentSeedTime;
        },
        sortTimeIndexList : function (rtcMediaPlayerObj) 
        {
            for(var moduleName in this.getModuleObjectsAsMap())
            {
                this.getModuleObjectsAsMap()[moduleName].sortTimeIndexArray(rtcMediaPlayerObj);
            }
        },
        startTimer : function (time,mediaPlayerObj,moduleName) // not used
        {
            if(!time || time == 0)
            {
                time = 0;
                for(var moduleName in this.getModuleObjectsAsMap())
                {
                    this.getModuleObjectsAsMap()[moduleName].currentEventId = this.getModuleObjectsAsMap()[moduleName].getEventIDFromEventTime(0);
                    //console.log(this.getModuleObjectsAsMap()[moduleName].getEventObjectFromEventId(this.getModuleObjectsAsMap()[moduleName].currentEventId))
                }
            }
             if(moduleName)
             {
                 this.setPlaybackModule(moduleName);
                 this.getModuleObjectsAsMap()[moduleName].currentEventId = this.getModuleObjectsAsMap()[moduleName].getEventIDFromEventTime(0);
                 //console.log(this.getModuleObjectsAsMap()[moduleName].getEventObjectFromEventId(this.getModuleObjectsAsMap()[moduleName].currentEventId))
             }
            this.stopTimer();
            this._timerID = setInterval(function (rtcEventObj,mediaPlayerObj,module){
                time++;
                mediaPlayerObj.setCurrentSeedTime(time);
                RTCMediaEvent.playEvents(time,rtcEventObj,module);
            },1000,this,mediaPlayerObj,this.getPlaybackModule());
        },
        stopTimer : function () 
        {
            clearInterval(this._timerID);
        },

		getEventByTime : function(moduleName, time)
		{
			var module = this.getModuleObjectsAsMap()[moduleName];
	
			if(!module)
			{
				return;
			}
	
			for(var index = 0; index < module.offSetIndexList.length; index++)
			{
				var currEventOffsetTime = module.offSetIndexList[index];
				var nextEventOffsetTime = module.offSetIndexList[index + 1] || Infinity;
	
				if(time >= currEventOffsetTime && time < nextEventOffsetTime)
				{
					return module.getEventObjectFromEventId(module.timeIndexMap[module.offSetVsTimeMap[currEventOffsetTime]]).getEventData();
				}
			}
		},

        getEventsForCurrentTime : function (time,mediaPlayerObj,moduleName) 
        {
            //console.log("inside getEventsForCurrentTime",time,mediaPlayerObj,moduleName)
            if(!time || time == 0)
            {
                time = 0;
                for(var moduleName in this.getModuleObjectsAsMap())
                {
                    this.getModuleObjectsAsMap()[moduleName].currentEventId = this.getModuleObjectsAsMap()[moduleName].getEventIDFromEventTime(0);
                    //console.log(this.getModuleObjectsAsMap()[moduleName].getEventObjectFromEventId(this.getModuleObjectsAsMap()[moduleName].currentEventId))
                }
            }
            //RTCMediaEvent.playEvents(time,this,this.getPlaybackModule());
            RTCMediaEvent.playEvents(time,this,this.getPlaybackModule(),mediaPlayerObj);
        },
        setNextCurrentEventIdFortime :function (offSetTime) 
        {
            for(var moduleName in this.getModuleObjectsAsMap())
            {
                this.getModuleObjectsAsMap()[moduleName].setNextCurrentEventIdFortime(offSetTime)
            }
        }
    }

var RTCMediaEvent ={

    recordEvent : function (module,eventID,eventTime,offsetTime,eventData, type,transcriptwriteflag, dispatchflag, successCallback, failureCallBack) 
    {
        if(!module || !eventData)
        {
            return;
        }
        new eventObject(module,eventID,eventTime,offsetTime,eventData, type).recordEvent(transcriptwriteflag,dispatchflag, successCallback, failureCallBack);
    },

    playEvents : function (offSetTime,rtcEventObj,filterModuleName,mediaplayerObj) 
    { 
        if(filterModuleName == "NONE")
        {
            return;
        }
        rtcEventObj.setCurrentSeedTime(offSetTime);
        if(filterModuleName == "ALL")
        {
            for(var moduleName in rtcEventObj.getModuleObjectsAsMap())
            {
                if(rtcEventObj.getModuleObjectsAsMap()[moduleName].moduleData.length > 0)
                {
                    rtcEventObj.getModuleObjectsAsMap()[moduleName].playEvent(offSetTime,rtcEventObj,mediaplayerObj);
                }
            }
        }
        else
        {
            if(rtcEventObj.getModuleObjectsAsMap()[filterModuleName])
            {
                if(rtcEventObj.getModuleObjectsAsMap()[filterModuleName].moduleData.length > 0)
                {
                    rtcEventObj.getModuleObjectsAsMap()[filterModuleName].playEvent(offSetTime,rtcEventObj,mediaplayerObj);
                }
            }
        }
    },
    handleplayBackEvents : function (msgObj) 
    {
    	//console.log("handleplayBackEvents",msgObj);
    	var recievedConfkey = JSON.parse(msgObj.msg.addinfo).confkey;
        var rtcpConfSession = RTCP.getConferenceSession();

        if(!recievedConfkey)
        {
        	return;
        }
        if((rtcpConfSession && msgObj.wmsid != rtcpConfSession._userId && rtcpConfSession.getConferenceKey() == recievedConfkey) || RTCP.getLiveStreamViewerSession() && msgObj.wmsid !=RTCP.getLiveStreamViewerSession()._viewerid && RTCP.getLiveStreamViewerSession()._conferencekey == recievedConfkey)
        {
            var module = JSON.parse(msgObj.msg.msg).module;
            var data = JSON.parse(JSON.parse(msgObj.msg.msg).data);
            var offSettime = JSON.parse(msgObj.msg.msg).offsettime;
            var eventTime=JSON.parse(msgObj.msg.msg).eventtime;
            var eventid = JSON.parse(msgObj.msg.msg).eventid;
            var mtype= msgObj.mtype;
            if(RTCP.liveStreamViewerSession && RTCP.liveStreamViewerSession._mediaPlayer)
            {
                RTCMediaEvent.addEventsObjectsInStreamig(RTCP.liveStreamViewerSession._mediaPlayer,module,eventid,eventTime,offSettime,eventTime,data,mtype);
                return;
            }
            else if(ZRSmartConferenceImpl.getCurrentSession() && ZRSmartConferenceImpl.getCurrentSession()._isViewOnlyConference && RTCP.getConferenceSession() && RTCP.getConferenceSession()._mediaPlayer)
        	{
            	RTCMediaEvent.addEventsObjectsInStreamig(RTCP.getConferenceSession()._mediaPlayer,module,eventid,eventTime,offSettime,eventTime,data,mtype);
            	return;
        	}
            RTCP.getEventMsgObj({module : module, data : data, mode : "live"});
        }
    },
    getPlayBackEvent : function(confKey,token,vodkey,viewerId,rtcMediaPlayerObj,successCallback,failureCallBack) 
    {
        var url = document.location.origin + "/_wmsrtc/v2/playbackevent?conferencekey="+encodeURIComponent(confKey);
        if(rtcMediaPlayerObj.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING)
        {
            url += "&mode="+RTCMediaPlayerConstants.mode.LIVESTREAMING+"&token="+encodeURIComponent(token)+"&viewerid="+encodeURIComponent(viewerId);
        }
        else if(rtcMediaPlayerObj.mode == RTCMediaPlayerConstants.mode.RECORDING)
        {
            url += "&mode="+RTCMediaPlayerConstants.mode.RECORDING+"&token="+encodeURIComponent(token)+"&vodkey="+encodeURIComponent(vodkey);
        }
        else if(rtcMediaPlayerObj.mode == RTCMediaPlayerConstants.BOOKMARK.mode)
        {
            url += "&mode="+RTCMediaPlayerConstants.BOOKMARK.mode;
        }
        else
        {
            if(typeof failureCallBack == "function")
            {
                failureCallBack();
            }
        }
        $.ajax({
            url: url,
            type : "GET",
            success: function(result)
            {
                if(result)
                {
                    var rtcEventObj = new RTCEventObj(confKey);
                    var recordingId = rtcMediaPlayerObj.getRecordingId();
                    var data ;
                    try
                    {
                        data = result.split("\n");
                    }
                    catch (e)
                    {
                        data = [];
                        data.push(JSON.stringify(result))
                    }
                    for (var i=0;i<data.length ; i++)
                    {
                        var eventData;
                        var type;
                        try
                        {
                            eventData = JSON.parse(JSON.parse(data[i]).msg.msg);

                            if(eventData.module === RTCMediaPlayerConstants.category.TRANSCRIPTION && eventData.id !== recordingId)
                            {
                            	continue;
                            }
                            
                            type = JSON.parse(JSON.parse(data[i]).mtype);
                            eventData.offsettime = parseFloat(eventData.offsettime) + rtcMediaPlayerObj.getDeltaValue()
                            eventData.eventtime = parseFloat(eventData.eventtime);
                        }
                        catch (e)
                        {
                            continue;
                        }
                        if(!rtcEventObj.getModuleObjectsAsMap()[eventData.module])
                        {
                            var moduleObject = new eventModuleObject(eventData.module);
                            moduleObject.addEventObject(new eventObject(eventData.module, eventData.eventid, eventData.eventtime,eventData.offsettime ? eventData.offsettime : null, JSON.parse(eventData.data), type))
                            rtcEventObj.getModuleObjectsAsMap()[eventData.module] = moduleObject;
                        }
                        else
                        {
                            rtcEventObj.getModuleObjectsAsMap()[eventData.module].addEventObject(new eventObject(eventData.module, eventData.eventid, eventData.eventtime, eventData.offsettime ? eventData.offsettime : null, JSON.parse(eventData.data), type));
                        }
                    }
                    //rtcEventObj.sortTimeIndexList(rtcMediaPlayerObj);
                    rtcMediaPlayerObj.setEventsObj(rtcEventObj);
                    var moduleNameList = Object.keys(rtcEventObj.getModuleObjectsAsMap());
                    if(rtcMediaPlayerObj.getDefaultPlaybackModule() && rtcEventObj.getModuleObjectsAsMap()[rtcMediaPlayerObj.getDefaultPlaybackModule()])
                	{
                    	rtcMediaPlayerObj.setPlaybackIndex(rtcMediaPlayerObj.getDefaultPlaybackModule());
                        if(successCallback && typeof successCallback == "function")
                        {
                            successCallback();
                        }
                	}
                    else
                	{
                    	var moduleNameList = Object.keys(rtcEventObj.getModuleObjectsAsMap());
                    	var skippedEventList = rtcMediaPlayerObj.getSkippedEvents();
                    	skippedEventList.forEach (function(skipppedEvent) {
                    		if(moduleNameList.includes(skipppedEvent))
                            {
                                var annotationIndex = moduleNameList.indexOf(skipppedEvent)
                                moduleNameList.splice(annotationIndex,1)
                            }
                		})
                    	if(moduleNameList.length > 0)
                        {
                    		 if(rtcEventObj.getModuleObjectsAsMap()[RTCMediaPlayerConstants.category.ACTIVESPEAKER])
                             {
                    			 rtcMediaPlayerObj.setPlaybackIndex(RTCMediaPlayerConstants.category.ACTIVESPEAKER);
                             }
                    		 else
                			 {
                    			 rtcMediaPlayerObj.setPlaybackIndex(moduleNameList[0]);
                			 }
                    		
                            if(successCallback && typeof successCallback == "function")
                            {
                                successCallback();
                            }
                        }
                        else
                        {
                            if(failureCallBack && typeof failureCallBack == "function")
                            {
                                failureCallBack();
                            }
                        }
                	}
                    /*if(rtcEventObj.getModuleObjectsAsMap()[RTCMediaPlayerConstants.category.ACTIVESPEAKER])
                    {
                        //rtcMediaPlayerObj.loadEventContainer("activespeaker");
                        rtcMediaPlayerObj.setPlaybackIndex(RTCMediaPlayerConstants.category.ACTIVESPEAKER);
                        if(successCallback && typeof successCallback == "function")
                        {
                            successCallback();
                        }
                    }
                    else if(rtcEventObj.getModuleObjectsAsMap()[RTCMediaPlayerConstants.skipEvents.ANNOTATIONS] || rtcEventObj.getModuleObjectsAsMap()[RTCMediaPlayerConstants.skipEvents.BOOKMARKS])
                    {
                        var moduleNameList = Object.keys(rtcEventObj.getModuleObjectsAsMap());
                        if(moduleNameList.includes(RTCMediaPlayerConstants.skipEvents.ANNOTATIONS))
                        {
                            var annotationIndex = moduleNameList.indexOf(RTCMediaPlayerConstants.skipEvents.ANNOTATIONS)
                            moduleNameList.splice(annotationIndex,1)
                        }
                        if(moduleNameList.includes(RTCMediaPlayerConstants.skipEvents.BOOKMARKS))
                        {
                            var bookmarkIndex = moduleNameList.indexOf(RTCMediaPlayerConstants.skipEvents.BOOKMARKS)
                            moduleNameList.splice(bookmarkIndex,1)
                        }
                        if(moduleNameList.length > 0)
                        {
                            rtcMediaPlayerObj.setPlaybackIndex(moduleNameList[0]);
                            if(successCallback && typeof successCallback == "function")
                            {
                                successCallback();
                            }
                        }
                        else
                        {
                            if(failureCallBack && typeof failureCallBack == "function")
                            {
                                failureCallBack();
                            }
                        }
                    }
                    else if(Object.keys(rtcEventObj.getModuleObjectsAsMap()).length > 0)
                    {
                        if(moduleNameList.length > 0)
                        {
                            rtcMediaPlayerObj.setPlaybackIndex(moduleNameList[0]);
                            if(successCallback && typeof successCallback == "function")
                            {
                                successCallback();
                            }
                        }
                    }
                    /*else if(!rtcEventObj.getModuleObjectsAsMap()[RTCMediaPlayerConstants.skipEvents.ANNOTATIONS] || !rtcEventObj.getModuleObjectsAsMap()[RTCMediaPlayerConstants.skipEvents.BOOKMARKS])
                    {
                        //rtcMediaPlayerObj.loadEventContainer(Object.keys(rtcEventObj.getModuleObjectsAsMap())[0])
                        rtcMediaPlayerObj.setPlaybackIndex(Object.keys(rtcEventObj.getModuleObjectsAsMap())[0]);
                        if(successCallback && typeof successCallback == "function")
                        {
                            successCallback();
                        }
                    }
                    else
                    {
                        if(failureCallBack && typeof failureCallBack == "function")
                        {
                            failureCallBack();
                        }
                    }*/
                    //rtcMediaPlayerObj.appendEventsSelectPicker();
                    RTCMediaEvent.currentEventObj = rtcEventObj;
                    if(rtcMediaPlayerObj.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING)
                    {
                        rtcMediaPlayerObj.setPlaybackIndex("ALL")
                    }

                }
                else
                {
                    if(failureCallBack && typeof failureCallBack == "function")
                    {
                        failureCallBack();
                    }
                }
                //rtcMediaPlayerObj.initialiseMediaPlayer();
            },
            error : function(result)
            {
                //rtcMediaPlayerObj.initialiseMediaPlayer();
                if(failureCallBack && typeof failureCallBack == "function")
                {
                    failureCallBack();
                }
            }});
        //return RTCMediaEvent.currentEventObj;
    },
    addEventsObjectsInStreamig : function (rtcMediaPlayerObj,module,eventid,eventTime,offSettime,eventTime,data,type) 
    {
        var eventData;
        var type;
        var rtcEventObj;
        try
        {
            rtcEventObj = rtcMediaPlayerObj.getEventsObj();
            if(!rtcEventObj)
            {
                rtcEventObj = new RTCEventObj(rtcMediaPlayerObj.confKey);
                rtcMediaPlayerObj.setEventsObj(rtcEventObj);
            }
            eventData = {
                module : module,
                eventid : eventid,
                eventtime : parseFloat(eventTime),
                offsettime : parseFloat(offSettime),
                data : data,
            };
            type = type;
        }
        catch (e)
        {
            return;
        }
        if(!rtcEventObj.getModuleObjectsAsMap()[eventData.module])
        {
            var moduleObject = new eventModuleObject(eventData.module);
            moduleObject.addEventObject(new eventObject(eventData.module, eventData.eventid, eventData.eventtime,eventData.offsettime ? eventData.offsettime : null, eventData.data, type))
            rtcEventObj.getModuleObjectsAsMap()[eventData.module] = moduleObject;
        }
        else
        {
            rtcEventObj.getModuleObjectsAsMap()[eventData.module].addEventObject(new eventObject(eventData.module, eventData.eventid, eventData.eventtime, eventData.offsettime ? eventData.offsettime : null, (eventData.data), type));
        }
        rtcEventObj.sortTimeIndexList(rtcMediaPlayerObj);
        rtcMediaPlayerObj.setPlaybackIndex("ALL")
        if(!rtcEventObj.getModuleObjectsAsMap()[eventData.module].currentEventId)
        {
            rtcEventObj.getModuleObjectsAsMap()[eventData.module].currentEventId = rtcEventObj.getModuleObjectsAsMap()[eventData.module].getNextEventFromOffset(rtcMediaPlayerObj.getCurrentSeedTime());
        }
    },
    addPopupBox : function (mediaplayerObj,time,data) 
    {
        if(data && data.msg)
        {
            var id ="popup"+new Date().getTime();
            var html = '<div class="popupevents" id='+id+'><div class="popuptime">'+RTCMediaEvent.getFormatedTime(time)+'</div><div class="popupseparator"> : </div><div class="popuptext">'+data.msg+'</div></div>'
            $('.rtcp-mp-video-cont').append(html);
            setTimeout(function (id){
                //$('#'+id).remove();po
                $("#"+id).fadeOut(500, function() { $(this).remove(); });
            },5000,id);
        }
    },
    getFormatedTime : function (time) 
    {
        var hour = 0;
        var min = 0;
        var sec = 0;
        var strTime = "";
        if(time>0)
        {
            if(time > ((60 * 60) -1))
            {
                hour = Math.floor( time / (60*60));
                min = Math.floor( (time % (60 * 60)) / 60);
                sec = Math.floor( time % 60 );
            }
            else
            {
                if(time > 59)
                {
                    min = Math.floor(time / 60);
                    sec = Math.floor( time % 60);
                }
                else
                {
                    sec = Math.floor(time);
                }
            }
            if(hour > 0)
            {
                if(hour<10)
                {
                    hour = "0" + hour;
                }
                strTime = hour
            }
            if(min<10)
            {
                min = "0" + min;
            }
            if(strTime)
            {
                strTime+= ":";
            }
            strTime+= min;
            if(sec<10)
            {
                sec = "0" + sec;
            }
            strTime+=":"+ sec;
            return strTime;
        }
    }
}

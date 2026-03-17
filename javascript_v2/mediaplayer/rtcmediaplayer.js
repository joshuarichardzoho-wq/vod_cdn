//$Id$
var RTCMediaPlayerConstants = {};
var RTCMediaplayerUIHandler = {};
var RTCMediaPlayerObjList = {};

RTCMediaPlayerConstants = {
		UI: {
			scrubberWidth : 20
		},
		FULLSCREEN : 1,
		MINIPLAYER : -1,
		DEFAULTVIEW : 0,
		playbackSpeed : [0.25,0.50,0.75,1,1.25,1.50,1.75,2],
		mode : {
			RECORDING : "recording",
			EXTERNAL : "external",
			LIVESTREAMING : "livestream",
			LIVE : "live"
		},
		BOOKMARK : {
			mode : "bookmarklive"
		},
		type :{
			ACTIVESPEAKER : 900,
			GENERAL : 901,
			PERSONAL : 902,
			ALL : 903
		},
		quality : {
			auto : "Auto"
		},
		category : {
			ACTIVESPEAKER : "Activespeaker",
			ANNOTATIONS : "Annotation",
			BOOKMARKS : "Bookmark",
			REACTION : "Reaction",
			TRANSCRIPTION : "Transcription"
		},
		/*skipEvents : {
			ANNOTATIONS : "Annotation",
			BOOKMARKS : "Bookmark"
		},*/
		skipEvents : ["Annotation","Bookmark","Reaction"],
        maxAjaxTimeOutRetry : 3,
		config : {
			AV : "video",
			autoPictureInPicture  : "disable",
			autoplay: "enable",
			bottomControls : "enable", // TODO Mukesh remove this config
			backwardSeek : "disable" ,
			closeNeeded : "disable",
			cookieNeeded : "disable",
			clickThrough : "enable",
			drag : "disable",
			download : "disable",
			downloadInSettings : "disable",
			events : "disable",
			forwardSeek : "disable" ,
			hls : "disable",
			keycontrols : "disable",
			leaveButton : "disable",
			left : undefined,
			leftLowerLimit : 0,
			leftHigherLimit : undefined,
			liveButton:"enable",
			loop : "disable",
			maximisePlayer : "disable",
			minimisePlayer : "disable",
//			miniPlayerTop : undefined,
//			miniPlayerLeft : undefined,
			pauseOrPlay : "disable",
			pictureInPicture : "disable",
			playbackspeed : "disable",
			playbackspeedIconText : "enable",
			popEnabled : "disable",
			posterUrl : undefined,
			qualityInSettings : "disable",
			resize : "disable",
			reportAbuseInSettings : "disable",
			time : "disable",
			title : "disable",
			tooltip : "disable",
			top : undefined,
			topLowerLimit : 0,
			topHeigherLimit : undefined,
			seekbar : "disable",
			seperatePlaybackSpeed : "disable",
			separateReportAbuse : "disable",
			settings : "disable",
			snapshot : "disable",
			startPosition : -1,
			volume : "disable",
			zindex : 10,
			MAX_BUFFER_LENGTH : 45,
			BACK_BUFFER_LENGTH : 30,
			MAX_BUFFER_SIZE : 60 * 1000 * 1000,
	        FRAG_LOADING_MAX_RETRY  : 10,
	        MANIFEST_LOADING_MAX_RETRY : 3,
            LEVEL_LOADING_MAX_RETRY : 5,
            customEvents:"disable",
            openEventContainerByDefault : "",
            chaptersHeading:"enable",
            transcript:"disable",
            transcriptInSettings : "disable",
            subtitleInSettings : "disable",
            audioTrackInSettings : "disable",
            startLoadLevel : "Auto",
            loadLevel : -1,
            gradientOnHover : "enable",
            hideControlsOnPause : "disable",
            customClassNames : {},
			customIcons : [],
			preventScrollOnFocus : "disable",
			autoStartLoad : "enable",
			preventMediaControls : "disable",
			resumePlayerOnGoLive : "disable"
		},
		abrController : class abrController extends Hls.DefaultConfig.abrController
		{
			constructor(hls)
			{
				super(hls);
				this.hls = hls;
				this.abrLevel = 0;
				this.abrNextLevel = 0;
				this.abrThresholdDuration = 5000;
				this.abrNextLevelUpdatedAt = Date.now();
				this.abrBandwidthFactor = 0.9;
			}
	
			get nextAutoLevel()
			{
				var bestLevel = 0;
				let currentTime = Date.now();
				var levels = this.hls.levels;
				var bwe = this.hls.bandwidthEstimate * this.abrBandwidthFactor;
	
				for(var index = levels.length - 1; index > 0; index--)
				{
					var bitrate = levels[index].bitrate;
	
					if(bwe > bitrate)
					{
						bestLevel = index;
						break;
					}
				}
	
				if(bestLevel !== this.abrNextLevel)
				{
					this.abrNextLevel = bestLevel;
					this.abrNextLevelUpdatedAt = currentTime;
				}
	
				if(this.abrLevel !== this.abrNextLevel && (currentTime - this.abrNextLevelUpdatedAt >= this.abrThresholdDuration))
				{
					this.abrLevel = this.abrNextLevel;
				}
	
				return this.abrLevel;
			}
	
			set nextAutoLevel(level)
			{
				// To prevent force switch by the hls
				var levelInfo = this.hls.levels[this.abrLevel];

				if(!levelInfo)
				{
					return;
				}

				this.hls.config.minAutoBitrate = levelInfo.bitrate;
			}
		},
		pLoader : class pLoader extends Hls.DefaultConfig.loader {
			constructor(config) {
				super(config);
				var mediaPlayerObj = config.mediaPlayerObj;
				var load = this.load.bind(this);
                
				this.load = function (context, config, callbacks) {
					if(mediaPlayerObj.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING && mediaPlayerObj.isPopEnabled())
					{
						context.url = context.url.replace("&ver=1","")
						if(!context.url.includes("&ver=2"))
						{
							context.url += "&ver=2";
						}
					}
					
					
					if (context.type == 'manifest') 
					{
						var url = new URL(context.url);
						var params = url.searchParams;
						var sid = params.get('sid');
						mediaPlayerObj.setManifestOrigin(url.origin);

						if(sid)
						{
							mediaPlayerObj.setSid(sid);
						}
                        
						var onSuccess = callbacks.onSuccess;
						callbacks.onSuccess = function (response, stats, context,networkDetails) {
							if(mediaPlayerObj.isVodFlow())
							{
								var sid = networkDetails.getResponseHeader("x-sid");
								var contentId = networkDetails.getResponseHeader("x-contentid");
								mediaPlayerObj.setSid(sid);
								mediaPlayerObj.setVodContentId(contentId);
							}
							onSuccess(response, stats, context, networkDetails);
							mediaPlayerObj.actionStatSuccessData(networkDetails,stats, context);
						};
						
						var onTimeout = callbacks.onTimeout;
						callbacks.onTimeout = function (stats, context, networkDetails) {
                            onTimeout(stats, context, networkDetails);
						};
						
						var onError = callbacks.onError;
						callbacks.onError = function (error, context,networkDetails) 
						{
							onError(error, context, networkDetails);
							mediaPlayerObj.actionStatErrorData(networkDetails,error,context);
						};
						
					}
					else if (context.type == 'level') 
					{
						var url = new URL(context.url);
						var params = url.searchParams;
						var sid = params.get('sid');

						if(sid)
						{
							mediaPlayerObj.setSid(encodeURIComponent(sid));
						}

						var onSuccess = callbacks.onSuccess;
						callbacks.onSuccess = function (response, stats, context,networkDetails) {
							onSuccess(response, stats, context, networkDetails);
							mediaPlayerObj.actionStatSuccessData(networkDetails,stats, context);
						};
						
						var onError = callbacks.onError;
						callbacks.onError = function (error, context,networkDetails) 
						{
							onError(error, context, networkDetails);
							mediaPlayerObj.actionStatErrorData(networkDetails,error,context);
						};

						var onTimeout = callbacks.onTimeout;
						callbacks.onTimeout = function(stats, context, networkDetails)
						{
							mediaPlayerObj.changeWSSDomain();
							onTimeout(stats, context, networkDetails);
						};

						var levelUrl = new URL(context.url);
						
						if(mediaPlayerObj.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING)
						{
                            mediaPlayerObj.getDataFromManifest();
                            
                            if(mediaPlayerObj.hasManifestSwitchUrl())
                            {
                                levelUrl.hostname = new URL(mediaPlayerObj.getManifestSwitchUrl()).hostname;
                            }
                            else if(mediaPlayerObj.hasWssDomains() && mediaPlayerObj.getWSSDomain() !== levelUrl.hostname)
                            {
                                levelUrl.hostname = mediaPlayerObj.getWSSDomain();
                            }
					    }

                        context.url = levelUrl.href;
                    }

					load(context, config, callbacks);
				};
			}
		},
		fLoader : class fLoader extends Hls.DefaultConfig.loader {
			constructor(config) {
				super(config);
				var load = this.load.bind(this);
				var mediaPlayerObj = config.mediaPlayerObj;
				this.load = function (context, config, callbacks) {
					var chunkUrl = new URL(context.url);
					mediaPlayerObj.increaseFLoaderCount();

                    if(mediaPlayerObj.mode === RTCMediaPlayerConstants.mode.LIVESTREAMING)
                    {
                        mediaPlayerObj.getDataFromManifest();
                    }

					if(mediaPlayerObj.isPopEnabled() && mediaPlayerObj.mode == RTCMediaPlayerConstants.mode.RECORDING)
					{
						if(mediaPlayerObj.getFloaderCount() == 1)
						{
							mediaPlayerObj.startFetchPopRefreshTokenVod();
						}
						if(mediaPlayerObj.getFloaderCount()>5)
						{
							if(mediaPlayerObj.isPOPTokenRefreshNeeded())
							{
								mediaPlayerObj.getPopTokenForVod();
							}
							if(mediaPlayerObj.popDomain && mediaPlayerObj.popToken && mediaPlayerObj.cc )
							{
								var fileName = context.url.substring(context.url.indexOf("&f=")+3);
								chunkUrl.href = "https://"+mediaPlayerObj.popDomain+"/vodpop/live?token="+mediaPlayerObj.popToken+"&cc="+mediaPlayerObj.cc+"&f="+fileName;                                                	
							}
						}
					}
					else if(mediaPlayerObj.isPopEnabled() && mediaPlayerObj.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING && mediaPlayerObj.hasManifestPopUrl())
					{
						chunkUrl.hostname =  new URL(mediaPlayerObj.getManifestPopUrl()).hostname;
					}
                    else if(mediaPlayerObj.hasWssDomains() && mediaPlayerObj.getWSSDomain() !== chunkUrl.hostname)
                    {
                        chunkUrl.hostname = mediaPlayerObj.getWSSDomain();
                    }

					var onSuccess = callbacks.onSuccess;
					callbacks.onSuccess = function (response, stats, context,networkDetails) {
						onSuccess(response, stats, context, networkDetails);
						if(mediaPlayerObj.fragmentRetryMap.size > 0 && ++mediaPlayerObj.fragmentsLoadedAfterError >= RTCMediaPlayerConstants.fragmentErrorRecoveryCount)
						{
							mediaPlayerObj._playerInstance.levels.forEach(function(level)
							{
								level.fragmentError = 0;
								level.loadError = 0;
							});
							mediaPlayerObj.fragmentsLoadedAfterError = 0;
							mediaPlayerObj.fragmentRetryMap.clear();
						}
						mediaPlayerObj.actionStatSuccessData(networkDetails,stats, context);
					}
					
					var onError = callbacks.onError;
					callbacks.onError = function (error, context,networkDetails) 
					{
						if(mediaPlayerObj.isPopEnabled() && mediaPlayerObj.mode == RTCMediaPlayerConstants.mode.RECORDING && mediaPlayerObj.getFloaderCount()>5)
						{
							mediaPlayerObj.popDomain = undefined;
							mediaPlayerObj.popToken = undefined;
							mediaPlayerObj.cc = undefined;
							if(mediaPlayerObj.popRequestIntervalID)
							{
								clearInterval(mediaPlayerObj.popRequestIntervalID)
							}
						}
						
						onError(error, context, networkDetails);
						mediaPlayerObj.actionStatErrorData(networkDetails,error,context);
					};

					var onTimeout = callbacks.onTimeout;
					callbacks.onTimeout = function (stats, context, networkDetails) {       
						mediaPlayerObj.popDomain = undefined;
						mediaPlayerObj.popToken = undefined;
						mediaPlayerObj.cc = undefined;
						mediaPlayerObj.changeWSSDomain();
						if(mediaPlayerObj.popRequestIntervalID)
						{
							clearInterval(mediaPlayerObj.popRequestIntervalID)	//need to add stat
						}
						onTimeout(stats, context, networkDetails);
					};
					
                    context.url = chunkUrl.href;

					load(context, config, callbacks);
				};
			}
		},
		setColors : function(colors_obj)
		{
			if ( colors_obj ) 
			{
				if ( colors_obj.primary_color ) 
				{
					document.documentElement.style.setProperty( "--rtcp-mp-primary-color", colors_obj.primary_color); //No I18N
				}
				if ( colors_obj.video_bg ) 
				{
					document.documentElement.style.setProperty( "--rtcp-mp-vido-bg-color", colors_obj.video_bg); //No I18N

				}
				if ( colors_obj.seek_color ) 
				{
					document.documentElement.style.setProperty( "--rtcp-mp-seek-bg-color", colors_obj.seek_color); //No I18N
				}
				if ( colors_obj.seek_buffer_color ) 
				{
					document.documentElement.style.setProperty( "--rtcp-mp-seek-buffer-bg-color", colors_obj.seek_buffer_color); //No I18N

				}
				if ( colors_obj.seek_buffer_hover_color ) 
				{
					document.documentElement.style.setProperty( "--rtcp-mp-seek-hover-bg-color", colors_obj.seek_buffer_hover_color); //No I18N
				}
				if ( colors_obj.bg_color ) 
				{
					document.documentElement.style.setProperty( "--rtcp-mp-bg-color", colors_obj.bg_color); //No I18N
				}
			}

		},
		bindWindowEvents :  function()
		{
			$(window).blur(function(event) {
				if(RTCMediaPlayerObjList && Object.keys(RTCMediaPlayerObjList).length == 1)
				{
					var mediaPlayerInstance = RTCMediaPlayerObjList[Object.keys(RTCMediaPlayerObjList)[0]];
					if(mediaPlayerInstance._config.pictureInPicture == "enable" && mediaPlayerInstance._config.autoPictureInPicture == "enable")
					{
						if(document.pictureInPictureElement && document.pictureInPictureElement.className == "rtcmediaplayervideo")
						{
							return;
						}
						mediaPlayerInstance.gotoPIP();	
					}
				}
			});
			$(document).ready(function()
			{
					$("body").click(function(event)
					{
						var length = $(event.target).parents("[rtcpmediaplayer]").length;
						if(length ==0)
						{
							for(var i=0;i<Object.keys(RTCMediaPlayerObjList).length;i++)
							{
								var mediaPlayerInstance = RTCMediaPlayerObjList[Object.keys(RTCMediaPlayerObjList)[i]];
								mediaPlayerInstance.closePlayerSetting();
								mediaPlayerInstance.closeSeparatePlayerSetting();
								var target = event.target;
								while (target && target !== document.body) 
								{
					        		if (target.hasAttribute('rtcp-mp-event-cont')) 
							        {
							            return; 
							        }
							        target = target.parentNode; 
								}
//								if(!event.target.closest('[rtcp-mp-event-cont]'))
//								{
									mediaPlayerInstance.closeEventContainer();
//								}
							}
						}
					});					
					
			});
			
		},
		
		processXSS : function(value, ignoredecode )
		{
			if ( !value ) {
				return value;
			}
			if(value && (value instanceof String || typeof value == 'string'))
			{
				if ( !ignoredecode ) {
					value = RTCMediaPlayerConstants.decodeHTMLEntities( value );
				}
				return value.replace( /&/g, "&amp;" ).replace( /\"/g, "&quot;" ).replace( /\'/g, "&#39;" ).replace( /</g, "&lt;" ).replace( />/g, "&gt;" );
			}
			return value;
		},
		
		decodeHTMLEntities : function(value)
		{
			return value
			.replace(/&#x2F;/g, "/")
			.replace(/&#39;|&#x27;/g, "'")
			.replace(/&quot;/g, '"')
			.replace(/&gt;/g, ">")
			.replace(/&lt;/g, "<")
			.replace(/&amp;/g, "&");
		},
		
		getDirectTextFromHtmlString : function(htmlString)
		{
			if($RTCPWC && $RTCPWC.$CUtil && $RTCPWC.$CUtil.getDirectTextFromHtmlString)
			{
				return $RTCPWC.$CUtil.getDirectTextFromHtmlString(htmlString); 
			}
			
			return htmlString;
		},

		resources : {
			"rtcpmediaplayer.tooltip.close":"Close",
			"rtcpmediaplayer.tooltip.exitpictureinpicture":"Exit Picture-in-Picture",
			"rtcpmediaplayer.tooltip.expand":"Expand",
			"rtcpmediaplayer.tooltip.fullscreen":"Full Screen",
			"rtcpmediaplayer.tooltip.loop":"Loop",
			"rtcpmediaplayer.tooltip.maximize":"Maximize",
			"rtcpmediaplayer.tooltip.minimise":"Minimise",
			"rtcpmediaplayer.tooltip.miniplayer":"Miniplayer",
			"rtcpmediaplayer.tooltip.mute":"Mute",
			"rtcpmediaplayer.tooltip.pause":"Pause",
			"rtcpmediaplayer.tooltip.pictureinpicture":"Picture-in-Picture",
			"rtcpmediaplayer.tooltip.play":"Play",
			"rtcpmediaplayer.tooltip.stop":"Stop",
			"rtcpmediaplayer.tooltip.replay":"Replay",
			"rtcpmediaplayer.tooltip.settings":"Settings",
			"rtcpmediaplayer.tooltip.snapshot":"Snapshot",
			"rtcpmediaplayer.tooltip.unmute":"Unmute",
			"rtcpmediaplayer.livestream.golive":"Go Live",
			"rtcpmediaplayer.livestream.leave":"Leave",
			"rtcpmediaplayer.livestream.live":"Live",
			"rtcpmediaplayer.settings.annotations":"Annotations",
			"rtcpmediaplayer.settings.audiotrack":"Audio Track",
			"rtcpmediaplayer.settings.bookmarks":"Bookmarks",
			"rtcpmediaplayer.settings.download":"Download",
			"rtcpmediaplayer.settings.playbackspeed":"Playback Speed",
			"rtcpmediaplayer.settings.quality":"Quality",
			"rtcpmediaplayer.settings.reportabuse":"Report Abuse",
			"rtcpmediaplayer.settings.subtitlecc":"Subtitles/Closed Captions",
			"rtcpmediaplayer.settings.transcript":"Transcript",
			"rtcpmediaplayer.events.activespeaker":"Active Speaker",
			"rtcpmediaplayer.events.search":"Search",
			"rtcpmediaplayer.events.synctime":"Sync to Video Time",
			"rtcpmediaplayer.settings.quality.auto":"Auto",
			"rtcpmediaplayer.settings.playbackspeed.normal":"Normal",
			"rtcpmediaplayer.settings.subtitle.off":"Off",
			"rtcpmediaplayer.tooltip.pipoverlay" : "Playing in Picture-in-Picture"
		},

		isValidUrl : function(url)
		{
			try
			{
				var isValid = new URL(url);
				return true;
			}
			catch(err)
			{
				return false;
			}
		},

		fragmentErrorRecoveryCount : 3
};

var RTCMediaPlayerObj= function(mediaPlayerDiv)
{
	this.confKey = undefined;
	this.mediaPlayerDiv = mediaPlayerDiv;
	this.miniPlayerDiv = undefined;
	this.currentSeedTime = undefined;
	this.url = undefined;
	this.rtcEventsObject = undefined;
	this._playerInstance = undefined;
	this. _playingFragmentNumber = 0;
	this._playingFragmentTimeInSecs = 0;
	this._playingFragmentStartTime = 0;
	this._startTimeFromFrag = undefined
	this._videoInstance = undefined;
	this.containerTimeList = undefined;
	this.isInitialised = false;
	this.vodKey = undefined;
	this.pbtoken = undefined;
	this.wssurl = undefined;
	this.mode= RTCMediaPlayerConstants.mode.EXTERNAL;
	this.lstoken = undefined;
	this.viewerid = undefined;
	this.Duration = undefined;
	this.isEventsLoaded = false;
	this.view = RTCMediaPlayerConstants.DEFAULTVIEW;
	this.previousXPosition = undefined;
	this.previousYPosition = undefined;
	this.currentXPosition = undefined;
	this.currentYPosition = undefined;
	this.deltaValue = 0;
	this.isVolumeSliderClicked = false;
	this.isScrubberMoving = false;
	this.title = '';
	this.hoverTimerId=undefined;
	this.sid = undefined;
	this.sessionCount = undefined;
	this.viewerCount = undefined;

	this._config = Object.assign({},RTCMediaPlayerConstants.config);
	this._skippedEvents = RTCMediaPlayerConstants.skipEvents;

	this.pLoader = RTCMediaPlayerConstants.pLoader;
	this.fLoader = RTCMediaPlayerConstants.fLoader;
	// this.abrController = RTCMediaPlayerConstants.abrController;
	this.fLoaderCount = 0;
	this.pLoaderCount = 0;
	this.x_stateless_auth = undefined

	this.popUrl = undefined;
	this.cc = undefined;
	this.popToken = undefined;
	this.popDomain = undefined;
	this.tokenExpiryTime = undefined;
	this.tokenTime = undefined;
	this.UI = {
			top : undefined,
			left : undefined,
			initialTop : undefined,
			initialLeft : undefined,
			initialWidth : undefined,
			initialHeight : undefined,
			width : undefined,
			height : undefined
//			audioTop : undefined,
//			audioLeft : undefined,
	};
	this.eventContainerDivID = undefined;

	this.defaultPlaybackModule = undefined;
	this.isCustomDiv = mediaPlayerDiv ? true : false;
	this.isCustomEventContainer = false;
	
	if(RTCMediaPlayerObjList[this.mediaPlayerDiv])
	{
		RTCMediaPlayerObjList[this.mediaPlayerDiv].closeMediaPlayer(false);
	}
	
	/*this.downloadTimeMap = {};
	this.bufferTimeMap = {};
	this.parsingTimeMap = {};*/
	this.maxPlayerWidthForSlots = 1400; //keeping up with
	this.actionHeaders = {"xhr":"xhr"};
	
	this.stat = {};
	this.statTimeInterval = 10000;
	this.statintervalID = undefined;

	this.wssStat = {};
	this.wssStatTimeInterval = 5000;
	this.wssStatintervalID = undefined;
	
	this.metaData = undefined;
	this.customEventData;
	this.customEventKey;
	this.customData = undefined;
	this._autoplayFailed = false;
	this.downloadTimeThreshold = 500; 
	this.wssDomainIndex = 0;
	this.wssDomains = [];
    this.wssUrls = [];
	this.chunksDownloadTime = [];
	this.chunksAverageCount = 10;
	this.manifestOrigin = undefined;	
	// this.wssStatEnabled = false;
	this.rtcpFlow = false;
	this.conferenceStartTime = undefined;
	this.manifestPopUrl = undefined;
	this.manifestSwitchUrl = undefined;
	this.vodVersion = "1";
	this.vodFlow = false;
	this.vodContentId = undefined;
	this.fragmentRetryMap = new Map();
	this.fragmentsLoadedAfterError = 0;
}

RTCMediaPlayerObj.isHlsSupported=function()
{
	if(typeof Hls == "undefined")
	{
		return false;
	}
	return Hls.isSupported();
}
RTCMediaPlayerObj.prototype.reset = function ()
{
	this.currentSeedTime = undefined;
	this.rtcEventsObject = undefined;
	this._playerInstance = undefined;
	this. _playingFragmentNumber = 0;
	this._playingFragmentTimeInSecs = 0;
	this._playingFragmentStartTime = 0;
	this._startTimeFromFrag = undefined
	this._videoInstance = undefined;
	this.containerTimeList = undefined;
	this.isInitialised = false;
	this.duration = undefined;
	this.isEventsLoaded = false;
	this.view = RTCMediaPlayerConstants.DEFAULTVIEW;
	this.previousXPosition = undefined;
	this.previousYPosition = undefined;
	this.currentXPosition = undefined;
	this.currentYPosition = undefined;
	this.deltaValue = 0;
	this.isVolumeSliderClicked = false;
	this.isScrubberMoving = false;
	this.hoverTimerId=undefined;
	this.sid = undefined;
	this.sessionCount = undefined;
	this.viewerCount = undefined;

	this._skippedEvents = RTCMediaPlayerConstants.skipEvents;

	this.pLoader = RTCMediaPlayerConstants.pLoader;
	this.fLoader = RTCMediaPlayerConstants.fLoader;
	this.fLoaderCount = 0;
	this.pLoaderCount = 0;
	this.x_stateless_auth = undefined

	this.popUrl = undefined;
	this.cc = undefined;
	this.popToken = undefined;
	this.popDomain = undefined;

	/*this.downloadTimeMap = {};
	this.bufferTimeMap = {};
	this.parsingTimeMap = {};*/
	
	this.removeBindedEvent();
	
	this.stat = {};
	this.wssStatintervalID = undefined;

	this.wssStat = {};
	this.statintervalID = undefined;

}

RTCMediaPlayerObj.prototype.loadUrl = function (url) 
{
	if(!url && this.url)
	{
		url = this.url;
	}
	
	if (url) 
	{
		this.url = url;
		var domain = new URL(url);

		if(domain.hostname.includes("wss"))
		{
			this.wssurl = domain.origin;
		}
		this.loadHls(this._config.hls == "enable");
	}
}
RTCMediaPlayerObj.prototype.load = function (confkey, vodkey, pbtoken, wssurls) 
{
	if(!confkey || !vodkey || !pbtoken || !wssurls || (Array.isArray(wssurls) && !wssurls.length))
	{
		return;
	}

    this.confKey = confkey;
    this.vodKey = vodkey;
	this.pbtoken = pbtoken;
    this.rtcpFlow = true;
    this.setWSSUrls(wssurls);
    this.wssurl = 'https://' + this.getWSSDomain();
    this.setMode(RTCMediaPlayerConstants.mode.RECORDING);
    this.getUrlFromVodkeyAndConfKey();

}

RTCMediaPlayerObj.prototype.playContent = function(vodKey, pbToken, wssUrl, viewerId)
{
	if(!vodKey || !pbToken || !wssUrl || !viewerId)
	{
		return;
	}

	this.vodFlow = true;
	this.vodKey = vodKey;
	this.pbtoken = pbToken;
	this.viewerid = viewerId;
	this.wssurl = `${!wssUrl.startsWith("https://") ? "https://" : ""}${wssUrl}/rtcmaster`;

	this.setMode(RTCMediaPlayerConstants.mode.RECORDING);

	var url = new URL(this.wssurl);
	url.searchParams.set("contentkey", this.vodKey);
	url.searchParams.set("pbtoken", this.pbtoken);
	url.searchParams.set("version", this.vodVersion);
	url.searchParams.set("viewerid", this.viewerid);
	url.searchParams.set("pop", this.isPopEnabled() ? "1" : "0");

	this.url = url.href;
	this.loadHls(this._config.hls == "enable");
}

RTCMediaPlayerObj.prototype.stream = function (confkey, lstoken, viewerId, wssurls)
{
	if (!confkey || !lstoken || !viewerId || !wssurls || (Array.isArray(wssurls) && !wssurls.length))
	{
        return;
	}

    this.confKey = confkey;
    this.lstoken = lstoken;
	this.viewerid = viewerId;
    this.rtcpFlow = true;
    this.setWSSUrls(wssurls);
    this.wssurl = 'https://' + this.getWSSDomain();
    this.setMode(RTCMediaPlayerConstants.mode.LIVESTREAMING);
    this.getWSSSidForStreaming();

}
RTCMediaPlayerObj.prototype.setPlayerConfig  = function (configMap)
{
	if(configMap)
	{
		Object.assign(this._config,configMap);
	}

	this.handleMediaSessionAction();
}

RTCMediaPlayerObj.prototype.handleMediaSessionAction = function(resetHandler)
{
	if(!("mediaSession" in navigator))
	{
		return;
	}

	var handler = this._config.preventMediaControls === "enable" && !resetHandler ? function(){} : null;

	navigator.mediaSession.setActionHandler("play", handler);
	navigator.mediaSession.setActionHandler("pause", handler);
	navigator.mediaSession.setActionHandler("stop", handler);
	navigator.mediaSession.setActionHandler("seekbackward", handler);
	navigator.mediaSession.setActionHandler("seekforward", handler);
	navigator.mediaSession.setActionHandler("seekto", handler);
	navigator.mediaSession.setActionHandler("previoustrack", handler);
	navigator.mediaSession.setActionHandler("nexttrack", handler);
}

RTCMediaPlayerObj.prototype.setCustomData = function(customData)
{
	this.customData = customData;
}

RTCMediaPlayerObj.prototype.getCustomData = function()
{
	return this.customData;
}
RTCMediaPlayerObj.prototype.loadHls = function (isHls)
{
	//if (Hls.isSupported()) {
		if(this._config.AV == "audio")
		{
			var configMap ={
					events : "disable",
					settings : "disable",
					playbackspeed : "disable",
					maximisePlayer : "disable",
					leaveButton : "disable",
					pictureInPicture : "disable",
					autoPictureInPicture  : "disable"
			}
			this.setPlayerConfig(configMap);
		}
		if(this.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING)
		{
			this._config.AV == "video";
		}
		if (!this.mediaPlayerDiv) 
		{
			this.mediaPlayerDiv = "rtcmediaplayercontainer_" + new Date().getTime();
			if(this._config.AV == "video")
			{
				$('body').append('<div class="rtcp-mp-default-player" rtcpmediaplayer id="' + this.mediaPlayerDiv + '" style="z-index:'+this._config.zindex+';top:'+((this._config.top!=undefined)?(this._config.top):'10%')+';width:80%;height: 80%;display: inline-flex;position: absolute;left:'+((this._config.left!=undefined)?(this._config.left):'10%')+';border-radius:8px;"></div>');
			}
			else if (this._config.AV == "audio")
			{
					$('body').append('<div class="rtcp-mp-default-player" rtcpmediaplayer id="' + this.mediaPlayerDiv + '" style="z-index:'+this._config.zindex+';top:'+((this._config.top!=undefined)?(this._config.top):'calc(100% - 156px)')+';width:382px;height: 136px;display: block;position: absolute;left:'+((this._config.left!=undefined)?(this._config.left):'calc(100% - 402px)')+';background-color: rgb(255 255 255 / 0%);"></div>');
			}
			$('#' + this.mediaPlayerDiv).append(RTCMediaPlayerTemplates.getMediaPlayerDiv(this.mediaPlayerDiv,this.mode, this.getPlayerTitle(),this._config,this.eventContainerDivID));
		}
		else
		{
			$('#' + this.mediaPlayerDiv).append(RTCMediaPlayerTemplates.getMediaPlayerDiv(this.mediaPlayerDiv,this.mode, this.getPlayerTitle(), this._config,this.eventContainerDivID));
			$('#' + this.mediaPlayerDiv).addClass('rtcp-mp-default-player');
			$('#' + this.mediaPlayerDiv).attr('rtcpmediaplayer','');
		}
		this.setDuration(this.getDuration());
		if(!this.eventContainerDivID)
		{
			this.eventContainerDivID = "event_cont_"+this.mediaPlayerDiv
		}
		else
		{
			$('#'+this.getEventContainerID()).empty().append(RTCMediaPlayerTemplates.getEventEventContainerHtml(this.mediaPlayerDiv));
		}
		
		$('#' + this.mediaPlayerDiv).attr('mode',this._config.AV);
		var offset = $('#'+this.mediaPlayerDiv).offset();
		this.currentXPosition = offset.left;
		this.currentYPosition = offset.top;
		this.previousXPosition = offset.left;
		this.previousYPosition = offset.top;
		RTCMediaPlayerObjList[this.mediaPlayerDiv] = this;
		this.UI.initialTop = $('#'+this.mediaPlayerDiv).css("top");
		this.UI.initialLeft = $('#'+this.mediaPlayerDiv).css("left");
		this.UI.initialWidth = $('#'+this.mediaPlayerDiv).width();
		this.UI.initialHeight = $('#'+this.mediaPlayerDiv).height();
		
		this._videoInstance = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayervideo')[0];
		this.loadEvents();
		if(!isHls)
		{
			this._videoInstance.src = this.url;
			if(this._config.autoplay == "enable")
			{
//				$('#' + this.mediaPlayerDiv +' .rtcp-mp-spinner').show();
				this.setSpinner();
				this._autoplayFailed = true;
				this._videoInstance.play().then(
						(success) => {
							this._autoplayFailed = false;
//							$('#' + this.mediaPlayerDiv +' .rtcp-mp-spinner').hide();
							this.setSpinner();
							$('#' + this.mediaPlayerDiv + ' .rtcmediaplayervideo').css("object-fit","contain");
							this.bindVideoTagEvents();
							this.onPlay();
						},
						(failure) => {
							$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').removeClass('dN');
							if(this._config.AV == "audio"){
								$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="pause"]').attr("purpose","autoplaystart");
								$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","autoplaystart");
								var elem = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayecontrolsbottomleftcontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
								elem.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.play")+" (k)");
								elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-pause").addClass("rtcmp-icon-mp-play");
							}
							this.UIonPause();
							$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","autoplaystart");
						});
			}
			else
			{
				$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').removeClass('dN');
				this.setSpinner();
				if(this._config.AV == "audio")
				{
					$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="pause"]').attr("purpose","autoplaystart");
					$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","autoplaystart");
					var elem = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayecontrolsbottomleftcontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
					elem.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.play")+" (k)");
					elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-pause").addClass("rtcmp-icon-mp-play");
				}
				this.UIonPause();
				$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","autoplaystart");
			}
			if(this._videoInstance.paused)
			{
				$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').removeClass('dN');
			}
		}
		else
		{
			if (!Hls.isSupported())
			{
				/*if(this.isCustomDiv)
				{
					$('#' + this.mediaPlayerDiv).empty().append(RTCMediaPlayerTemplates.getNotSupportedHtml());
				}
				else
				{
					$('#' + this.mediaPlayerDiv).empty().append(RTCMediaPlayerTemplates.getNotSupportedHtml());
				}*/
				$('#' + this.mediaPlayerDiv).empty().append(RTCMediaPlayerTemplates.getNotSupportedHtml());
				this.handleFormatNotSupported();
				return;
			}
			this._playerInstance = new Hls(this.getPlayerConfiguration());
			// bind them together

			var attachMediaCallBack = function () 
			{
				if(this._config.autoStartLoad === "disable")
				{
					this._videoInstance.addEventListener("play", function() {
						$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container').removeClass("dN");
						this._playerInstance.startLoad(this._config.startPosition);
					}.bind(this), { once: true });
				}

				//console.log('video and hls.js are now bound together !',this.url);
				if(this._config.startPosition != -1)
				{
					this._playerInstance.config.startPosition = this._config.startPosition;
				}
				this._playerInstance.loadSource(this.url);
				

				if(this._config.autoplay == "enable")
				{
//					$('#' + this.mediaPlayerDiv +' .rtcp-mp-spinner').show();
					this.setSpinner();
					this._autoplayFailed = true;
					this._videoInstance.play().then(
							(success) => {
								this._autoplayFailed = false;
//								$('#' + this.mediaPlayerDiv +' .rtcp-mp-spinner').hide();
								this.setSpinner();
								$('#' + this.mediaPlayerDiv + ' .rtcmediaplayervideo').css("object-fit","contain");
								this.bindVideoTagEvents();
								if(this._config.subtitleInSettings == "enable")
								{
									this.getSubtitleLanguages();
								}
								if(this._config.audioTrackInSettings == "enable")
								{
									this.getAudioTracks();
								}
								this.onPlay();
								$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').addClass('dN');
							},
							(failure) => {
								$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').removeClass('dN');
//								$('#' + this.mediaPlayerDiv +' .rtcp-mp-spinner').hide();
								this.setSpinner();
								this.bindVideoTagEvents();
								if(this._config.AV == "audio"){
									$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="pause"]').attr("purpose","autoplaystart");
									$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","autoplaystart");
									var elem = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayecontrolsbottomleftcontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
									elem.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.play")+" (k)");
									elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-pause").addClass("rtcmp-icon-mp-play");
								}
								this.UIonPause();
								$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","autoplaystart");
							});
				}
				else
				{
					$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').removeClass('dN');
//					$('#' + this.mediaPlayerDiv +' .rtcp-mp-spinner').show();
					this.setSpinner();
					if(this._config.AV == "audio")
					{
						$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="pause"]').attr("purpose","autoplaystart");
						$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","autoplaystart");
						var elem = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayecontrolsbottomleftcontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
						elem.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.play")+" (k)");
						elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-pause").addClass("rtcmp-icon-mp-play");
					}
					this.UIonPause();
					$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","autoplaystart");
				}
				if(this._videoInstance.paused)
				{
					$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').removeClass('dN');
				}
			}.bind(this);
			
			var manifestParsedCallBack = function () {
				this.getQualityLevels();

				if(this._config.startLoadLevel && this._config.startLoadLevel != "Auto")
				{
					var selectedQuality = this.qualityLevels.find(function(level)
					{
						return level.key === this._config.startLoadLevel;
					}.bind(this));

					if(selectedQuality)
					{
						this._playerInstance.startLevel = selectedQuality.value;
					}
				}
			}.bind(this);

			var mediaplayerObj = this;
			var hlsErrorCallback = function(event, data)
			{
				var errorType = data.type;
				var errorDetails = data.details;

				var isFatalError = data.fatal;
				if(isFatalError)
				{
					switch (errorType)
					{
				      case Hls.ErrorTypes.NETWORK_ERROR:
				        // try to recover network error
				        mediaplayerObj._playerInstance.startLoad();
				        this.handleMediaPlayerError(true,errorType,data.response);
				        break;
				      case Hls.ErrorTypes.MEDIA_ERROR:
				        mediaplayerObj._playerInstance.recoverMediaError();
				        break;
				      default:
				        // cannot recover
				    	  mediaplayerObj.handleMediaPlayerError(true,errorType);
				        break;
				    }
					//this.closeMediaPlayer();
				}
				else if(errorType === Hls.ErrorTypes.NETWORK_ERROR)
				{
					if(typeof data.response !== "undefined")
					{
//						var errorCode = data.response.code;
//						if(errorCode === 404)
//						{
							this.handleMediaPlayerError(false,errorType,data.response);
							//this.closeMediaPlayer();
//						}
					}
				}
			}.bind(this);
			

			this._playerInstance.on(Hls.Events.ERROR, hlsErrorCallback);
			this._playerInstance.on(Hls.Events.MEDIA_ATTACHED, attachMediaCallBack);
			this._playerInstance.on(Hls.Events.MANIFEST_PARSED, manifestParsedCallBack);
			this._playerInstance.attachMedia(this._videoInstance);
		}
		//this.startTimerToGetCurrentTime();
		
		this.bindVideoControls();
		/*this.bindEventsControl();*/
		this.bindEvents();
		this.bindVideoTagDurationEvent();
		//$('#' + this.mediaPlayerDiv + ' .rtcpmediaplayerdiv').focus();
		this.focusPlayer();
		this.bindCustomEvents();
//		if(this._config.posterUrl!=undefined)
//		{
//			$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').removeClass('dN');
//			$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state .rtcp-mp-video-ap-pause-text').addClass('dN');
//		}
		//}
}
RTCMediaPlayerObj.prototype.getUrlFromVodkeyAndConfKey = function () 
{
	//this.getPBToken();
	if (!this.confKey || !this.vodKey || !this.pbtoken || !this.wssurl) 
	{
		return;
	}
	this.getWSSSidForRec(this.pbtoken, this.wssurl);

}
RTCMediaPlayerObj.prototype.getWSSSidForRec = function (pbtoken, wssurl) 
{
	if (!pbtoken || !wssurl)
	{
		return;
	}
	var successCallBack = function (wsssid, x_stateless_auth, recordingId) {
		//this.url = this.wssurl + '/rtcmaster?sid=' + wsssid + '&filename=wmsvod_hlsts_master.m3u8';
		this.url = this.wssurl + '/rtcmaster?sid=' + wsssid;
		this.setSid(wsssid);
		this.setRecordingId(recordingId);
		if(x_stateless_auth)
		{
			this.x_stateless_auth = x_stateless_auth;
		}
		this.loadHls(this._config.hls == "enable");
	}.bind(this)
	RTCPRecording.getWSSSidForRec(this.confKey, this.vodKey, pbtoken, wssurl, this.isPopEnabled(), successCallBack, undefined, this.handleAjaxTimeout())
}
RTCMediaPlayerObj.prototype.getWSSSidForStreaming = function () 
{
	var successCallBack = function (wsssid,x_stateless_auth) {
		if(x_stateless_auth)
		{
			this.x_stateless_auth = x_stateless_auth;
		}
		this.url = this.wssurl + '/wsrtcp/master?sid=' + wsssid;
		this.setSid(wsssid);
		this.loadHls(this._config.hls == "enable");
	}.bind(this)

    RTCPRecording.getWSSSidForStreaming(this.confKey, this.lstoken, this.viewerid, this.wssurl, successCallBack, undefined, this.handleAjaxTimeout());
}

RTCMediaPlayerObj.prototype.handleAjaxTimeout = function()
{
	var retryCount = 0;
	var mediaPlayerInstance = this;

	return function(params)
	{
		if(++retryCount > RTCMediaPlayerConstants.maxAjaxTimeOutRetry)
		{
			return;
		}

		if(mediaPlayerInstance.hasWssDomains())
		{
			mediaPlayerInstance.changeWSSDomain();
			var wssDomain = mediaPlayerInstance.getWSSDomain();
			var url = new URL(params.url);

			if(url.hostname !== wssDomain)
			{
				url.hostname = wssDomain;
				params.url = url.href;
			}
		}

		$.ajax(params);
	}
}

RTCMediaPlayerObj.prototype.setUrl = function (url)
{
	if(url)
	{
		this.url = url;
	}
}

RTCMediaPlayerObj.prototype.getUrl = function ()
{
	return this.url;
}
RTCMediaPlayerObj.prototype.setSid = function(sid)
{
	if(sid && (!this.sid || this.sid !== sid))
	{
		this.sid = sid;
	}
}
/*RTCMediaPlayerObj.prototype.isWSSStatsEnabled = function()
{
	return this.wssStatEnabled;
}*/
RTCMediaPlayerObj.prototype.getSid= function ()
{
	return this.sid;
}
RTCMediaPlayerObj.prototype.getDownloadTimeThreshold = function()
{
	return this.downloadTimeThreshold;
}
RTCMediaPlayerObj.prototype.setManifestOrigin = function(manifestOrigin)
{
	if(manifestOrigin && this.manifestOrigin == undefined)
	{
		this.manifestOrigin = manifestOrigin;
	}
}
RTCMediaPlayerObj.prototype.getManifestOrigin = function()
{
	return this.manifestOrigin;
}
RTCMediaPlayerObj.prototype.isPopEnabled  = function ()
{
	return this._config.popEnabled == "enable"
}
RTCMediaPlayerObj.prototype.setPosterUrl =  function(posterUrl){
	this._config.posterUrl = posterUrl;
}
RTCMediaPlayerObj.prototype.getPosterUrl =  function(){
	return this._config.posterUrl;
}
RTCMediaPlayerObj.prototype.setMode  = function (mode)
{
	if(mode == RTCMediaPlayerConstants.mode.LIVESTREAMING || mode == RTCMediaPlayerConstants.mode.RECORDING)
	{
		this.mode = mode;
	}
}
RTCMediaPlayerObj.prototype.getMode  = function ()
{
	return this.mode;
}
RTCMediaPlayerObj.prototype.setViewerCount  = function (count)
{
	if(count != this.getViewersCount())
	{
		this.viewerCount = count;
		this.handleViewerCountUpdate(this.viewerCount);
	}
}
RTCMediaPlayerObj.prototype.getViewersCount  = function ()
{
	return this.viewerCount;
}
RTCMediaPlayerObj.prototype.setSessionCount  = function (count)
{
	if(count != this.getSessionCount())
	{
		this.sessionCount = count;
		this.handleSessionCountUpdate(this.sessionCount);
	}
}
RTCMediaPlayerObj.prototype.getSessionCount  = function ()
{
	return this.sessionCount;
}
RTCMediaPlayerObj.prototype.getConferenceKey = function () 
{
	return this.confKey;
}
RTCMediaPlayerObj.prototype.getVODKey = function () 
{
	return this.vodKey;
},
RTCMediaPlayerObj.prototype.getPBToken = function () 
{
	return this.pbtoken;
}
RTCMediaPlayerObj.prototype.getWSSUrl = function () 
{
	return this.wssurl;
}
RTCMediaPlayerObj.prototype.getCurrentSeedTime = function () 
{
	return this.currentSeedTime;
}
RTCMediaPlayerObj.prototype.getVolume = function () 
{
	if (this._videoInstance) 
	{
		return this._videoInstance.volume;
	}
}
RTCMediaPlayerObj.prototype.isPaused = function () 
{
	if (this._videoInstance) 
	{
		return this._videoInstance.paused;
	}
}
RTCMediaPlayerObj.prototype.setVolume = function (volume,isBezelNeeded)
{
	this.handleVolumeChange(volume,isBezelNeeded);
}
RTCMediaPlayerObj.prototype.increaseFLoaderCount  = function ()
{
	this.fLoaderCount++;
}
RTCMediaPlayerObj.prototype.getFloaderCount  = function ()
{
	return this.fLoaderCount;
}
RTCMediaPlayerObj.prototype.loadEvents = function (confKey) 
{
	if (confKey)
	{
		this.confKey = confKey;
	}
	if (this._config.events == "enable") 
	{
		var successCallback = function () 
		{
			this.isEventsLoaded = true;
			if (this.getMode() == RTCMediaPlayerConstants.mode.LIVESTREAMING)
			{
				return;
			}
			this.loadEventContainer(this.getEventsObj().getFilterPlaybackModule());
			//this.appendEventsSelectPicker();
			this.appendEventHeaderHtml();
			if(this._config.openEventContainerByDefault == "enable")
			{
				this.openCustomEventContainer();
			}
		}.bind(this)
		var failureCallBack = function () {
			this.isEventsLoaded = true;
		}.bind(this)
		if (this.getMode() == RTCMediaPlayerConstants.mode.RECORDING || this.getMode() == RTCMediaPlayerConstants.mode.EXTERNAL)
		{
			if(this._config.customEvents == "disable")
			{
				RTCMediaEvent.getPlayBackEvent(this.confKey, this.pbtoken, this.vodKey, null, this, successCallback, failureCallBack)
			}
			else
			{
				var info = this.getCustomEventsData();
				var successCallback = function () 
				{
					this.isEventsLoaded = true;
					if (this.getMode() == RTCMediaPlayerConstants.mode.LIVESTREAMING)
					{
						return;
					}
					this.loadEventContainer(this.getEventsObj().getFilterPlaybackModule());
					this.appendContainerHtml();
					this.appendEventHeaderHtml();
					if(this._config.openEventContainerByDefault == "enable")
					{
						this.openCustomEventContainer();
					}
					if(info && info.successcallback && typeof info.successcallback == "function")
					{
						info.successcallback();
					}
				}.bind(this)
				var failureCallBack = function () {
					this.isEventsLoaded = true;
					if(info && info.failurecallback && typeof info.failurecallback == "function")
					{
						info.failurecallback();
					}
				}.bind(this)
				if(info && info.videokey)
				{
					this.customEvents(info.videokey,info.data).then(()=> successCallback(),()=> failureCallBack());
				}
				else
				{
					failureCallBack();
				}
			}
		}
		else if (this.getMode() == RTCMediaPlayerConstants.mode.LIVESTREAMING)
		{
			RTCMediaEvent.getPlayBackEvent(this.confKey, this.lstoken, null, this.viewerid, this, successCallback, failureCallBack)
		}
	}
	else
	{
		this.isEventsLoaded = true;
	}
	/*else
                {
                        this.initialiseMediaPlayer();
                }*/
	//this.setEventsObj(RTCMediaEvent.getPlayBackEvent(this.confKey,this));
}
RTCMediaPlayerObj.prototype.bindEvents = function () 
{
	//var doc = $('#' + this.mediaPlayerDiv);
	var doc = $('[mediaplayerid="' + this.mediaPlayerDiv +'"]');

	doc.on('click', this, function (event) {
		var mediaPlayerInstance = event.data;
		if ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-events-search-input').is(':focus'))
		{
			return;
		}
        mediaPlayerInstance.focusPlayer();
	});
	doc.on('click', "[rtcpmpbutton]", this, function (event) {
		//RTCPClickoutside.handleClick(event);
		event.stopPropagation();
		var elem = $(this);
		var purpose = elem.attr("purpose");
		var mediaPlayerInstance = event.data;

		if(($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button selected')))
		{
			mediaPlayerInstance.closeSeparatePlayerSetting();
		}
		//$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcpmediaplayerdiv').focus();
		mediaPlayerInstance.focusPlayer();
		//RTCMediaplayerUIHandler[purpose](event,elem,event.data);
		if(!elem.hasClass("rtcmediaplayervideo"))
		{
			RTCMediaplayerUIHandler[purpose](event,elem,event.data);
			return;
		}
		var that = this;
		setTimeout(function(mediaPlayerInstance) {
			var dblclick = parseInt($(that).data('double'), 10);
			if (dblclick > 0) 
			{
				$(that).data('double', dblclick-1);
			}
			else
			{
				RTCMediaplayerUIHandler[purpose](event,elem,mediaPlayerInstance);
			}
		}, 200,mediaPlayerInstance);

	});
	doc.on('dblclick', "[rtcpmpbutton]", this, function (event) {
		//RTCPClickoutside.handleClick(event);
		event.stopPropagation();
		var elem = $(this);
		$(this).data('double', 2);
		var mediaPlayerInstance = event.data;
		//$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcpmediaplayerdiv').focus();
        mediaPlayerInstance.focusPlayer();
		if(elem.hasClass("rtcmediaplayervideo"))
		{
			if (mediaPlayerInstance.view == RTCMediaPlayerConstants.MINIPLAYER) 
			{
				return;
			}
			mediaPlayerInstance.closePlayerSettingAndEventContainer();
			mediaPlayerInstance.handleFullScreen();
		}
	});
	doc.on('dblclick', "[rtcpmpbutton]", this, function (event) {
		//RTCPClickoutside.handleClick(event);
		event.stopPropagation();
	});
	doc.on('dblclick click', ".rtcpmediaplayerseekbar", this, function (event) {
		//RTCPClickoutside.handleClick(event);
		event.stopPropagation();
		var mediaPlayerInstance = event.data;
		if ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-setting-button selected')) 
		{
			mediaPlayerInstance.closePlayerSetting();
		}
		if(($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button selected')))
		{
			mediaPlayerInstance.closeSeparatePlayerSetting();
		}
	});

}
RTCMediaPlayerObj.prototype.setPlaybackModule = function (moduleName)
{
	if (moduleName && this.getEventsObj()) 
	{
		this.getEventsObj().setPlaybackModule(moduleName);
	}
}
RTCMediaPlayerObj.prototype.setPlaybackIndex = function (module) 
{
	if (module && this.getEventsObj()) 
	{
		this.getEventsObj().setFilterPlaybackModule(module);
	}
}
RTCMediaPlayerObj.prototype.getPlayBackindex = function () 
{
	if (this.getEventsObj()) 
	{
		return this.getEventsObj().getFilterPlaybackIndex();
	}
}
RTCMediaPlayerObj.prototype.getPlayBackindexName = function () 
{
	if (this.getEventsObj()) 
	{
		return this.getEventsObj().getFilterPlaybackModule();
	}
}
RTCMediaPlayerObj.prototype.setEventsObj = function (RTCEventsObj) 
{
	if (RTCEventsObj) 
	{
		this.rtcEventsObject = RTCEventsObj;
	}
}
RTCMediaPlayerObj.prototype.setContainerTimeList = function (timerList) 
{
	if (timerList) 
	{
		this.containerTimeList = timerList;
	}
}
RTCMediaPlayerObj.prototype.getContainerTimeList = function () 
{
	return this.containerTimeList;
}
RTCMediaPlayerObj.prototype.loadEventContainer = function (moduleName, searchString) 
{
	if (!moduleName)
	{
		return;
	}
	//this.setPlaybackModule(moduleName);
	var currentTime = this._videoInstance.currentTime
	this.setPlaybackIndex(moduleName);
	moduleNameRealValue = RTCPMediaPlayerResource.getRealValue(moduleName,this);
	var placeHolder = RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.events.search")+' ' +moduleNameRealValue;
	var playbackIndex = this.getPlayBackindex();
	var offsetList = [];
	var html = "";
	var sno = 0;
	var mediaPlayerId = this.getMediaPlayerDivID();

	if (playbackIndex) {
		offsetList = Object.keys(playbackIndex);
		offsetList = offsetList.sort(function (a, b) {
			return a - b
		});
		if (this.getDuration())
		{
			offsetList = offsetList.filter(function (a) {
				return a < this.getDuration();
			}.bind(this));
		}
	}
	for (var i = 0; i < offsetList.length; i++) 
	{
		var offsetTime = offsetList[i];
		for (var j = 0; j < playbackIndex[offsetTime].length; j++) 
		{
			sno++;
			var startTime = offsetTime;
			var eventObject = playbackIndex[offsetTime][j];
			var eventId = eventObject.getEventID();
			var eventData = eventObject.getEventData();
			var descHTML = '';
			var endTime = offsetList[i + 1] ? offsetList[i + 1] : this._videoInstance.duration;
			var icon;
			var track;
			if (currentTime >= startTime && currentTime <= endTime) 
			{
				icon = 'rtcmp-icon-newplay';
				track = 'current';
			} 
			else if (currentTime > endTime) 
			{
				icon = 'rtcmp-icon-tick';
				track = 'past';
			} 
			else if (currentTime <= startTime) 
			{
				icon = 'rtcmp-icon-rarrow'
					track = 'forward';
			}
			if (moduleName == RTCMediaPlayerConstants.category.ACTIVESPEAKER) 
			{
				if (searchString)
				{
					if (!eventData.username.toLowerCase().includes(searchString.toLowerCase())) 
					{
						continue;
					}
				}
				var userId = eventData.userid.split("_")[2];
				var imgurl = this.getUserImgForPlayBack(userId, eventData.username);
				descHTML = RTCMediaPlayerTemplates.getEventChapterDescription(imgurl, eventData.username + ' is speaking.');
				descHTML = '';
				html += RTCMediaPlayerTemplates.getEventContainerRow(eventData.username, '', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.events.activespeaker"), this.getFormatedTime(offsetTime), this.getFormatedTime(endTime), offsetTime, endTime, icon, track, descHTML, imgurl, "", mediaPlayerId, userId)
			}
			else if (moduleName == RTCMediaPlayerConstants.category.TRANSCRIPTION) 
			{
				if (searchString)
				{
					if (!eventData.text.toLowerCase().includes(searchString.toLowerCase())) 
					{
						continue;
					}
				}

				var userId = eventData.userid.split("_")[2];
				var imgurl = this.getUserImgForPlayBack(userId, eventData.username);
				descHTML = '';
				var title = eventData.text ? eventData.text.substring(0, 50)+"..." : "";
				html += RTCMediaPlayerTemplates.getEventContainerRow(title, eventData.username || "", RTCMediaPlayerConstants.category.TRANSCRIPTION, this.getFormatedTime(offsetTime), this.getFormatedTime(endTime), offsetTime, endTime, icon, track, descHTML, imgurl, eventData.text, mediaPlayerId, userId);
			}
			else 
			{
				var info = this.getInfoCardToEnterCard(eventId, moduleName, eventData)
				if (searchString) 
				{
					var userSearch = RTCMediaPlayerConstants.processXSS(this.getEventsSearchString(eventId, moduleName, eventData));
					if (!userSearch) 
					{
						userSearch = RTCMediaPlayerConstants.processXSS(info.title);
					}
					if (!userSearch || (userSearch && !userSearch.toLowerCase().includes(searchString.toLowerCase()))) 
					{
						continue;
					}
				}
				var imgurl = '';
				if (info && info.imgurl) 
				{
					imgurl = info.imgurl;
				}
				if (info && info.title && info.username) 
				{
					html += RTCMediaPlayerTemplates.getEventContainerRow(RTCMediaPlayerConstants.processXSS(info.title), RTCMediaPlayerConstants.processXSS(info.username), moduleName, this.getFormatedTime(offsetTime), this.getFormatedTime(endTime), offsetTime, endTime, icon, track, '', imgurl,RTCMediaPlayerConstants.processXSS(info.desc))
				} 
				else
				{
					var desc = '';
					if(info && info.desc)
					{
						desc = RTCMediaPlayerConstants.processXSS(info.desc)
					}
					html += RTCMediaPlayerTemplates.getEventContainerRow("", "", moduleName, this.getFormatedTime(offsetTime), this.getFormatedTime(endTime), offsetTime, endTime, icon, track, '', imgurl,desc)
				}
			}
		}
	}
	if (html != "") 
	{
		var moduleList = Object.keys(this.getEventsObj().getModuleObjectsAsMap());
		var optHtml = "";
		for (var i = 0; i < moduleList.length; i++) 
		{
			optHtml += '<option value=' + moduleList[i] + '>' + moduleList[i] + "</option>";
		}
		this.setContainerTimeList(offsetList);
		//$('#' + this.mediaPlayerDiv + ' .rtcp-mp-events-content').empty().append(html);
		$('#' + this.getEventContainerID()+ ' .rtcp-mp-events-content').empty().append(html);
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-container').css("display", "inline-block");
		this.setCurrentChapter(currentTime);
		document.querySelector('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-container .rtcp-mp-events-search-input').placeholder = placeHolder;
	}
	else
	{
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-container').css("display", "inline-block");
		$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-content').empty().append(RTCMediaPlayerTemplates.getNoResultFoundHtml());
	}
}
RTCMediaPlayerObj.prototype.appendContainerHtml = function () 
{
	var duration = this.getDuration();

	if(!duration)
	{
		return;
	}

	var html = "";
	var totalWidth;
	var widthList = []
	var containerTimeList = this.getContainerTimeList();
	if(containerTimeList && containerTimeList.length > 0)
	{
		containerTimeList = containerTimeList.filter(function(a)
		{
			return a < duration;
		})
		this.setContainerTimeList(containerTimeList);
	}	
	if (this.getContainerTimeList() && this.getContainerTimeList().length > 0) 
	{
		var st;
		var et;
		var width;
		var mrh = 2;
		var totalMrh = mrh;
		totalWidth = 100

		st = 0;
		et = this.getContainerTimeList()[0];
		if(et!=0)
		{
			width = ((et - st) * totalWidth) / duration;
			html += RTCMediaPlayerTemplates.getMediaPlayerChapter(0, et, width, mrh, mrh)
			widthList.push(width);
		}

		for (var i = 0; i < this.getContainerTimeList().length; i++) 
		{
			st = this.getContainerTimeList()[i];
			if (this.getContainerTimeList()[i + 1]) 
			{
				et = this.getContainerTimeList()[i + 1];
				width = (((et - st) * totalWidth) / duration);
				widthList.push(width);
				totalMrh += mrh;
				html += RTCMediaPlayerTemplates.getMediaPlayerChapter(st, et, width, mrh, mrh);
			} 
			else 
			{
				et = duration;
				mrh = 0;
				width = (totalWidth - widthList.reduce((a, b) => a + b));
				widthList.push(width);
				html += RTCMediaPlayerTemplates.getMediaPlayerChapter(st, et, width, mrh, mrh);
			}
		}
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-container').css("display", "inline-block");
	} 
	else 
	{

		html += RTCMediaPlayerTemplates.getMediaPlayerChapter(0, duration, 100, 0, 0);
		$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-video-cont').css("width", "calc(100%)")
		$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-chapter-container').css("display", "none");
	}
	$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-chapter-title-content').html(this.getPlayerTitle());
	if(this._config.seekbar != "disable")
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-progress-bar-container').empty().append(html);
	}
	this.setLoadedSeekBarPosition(this._videoInstance.currentTime);
	for (var i = 0; i < this._videoInstance.buffered.length; i++) 
	{
		var videoTime = this.getCurrentSeedTime();
		if(this._videoInstance.buffered.start(i) < videoTime)
		{
			this.setBufferedPosition(this._videoInstance.buffered.end(i));
		}
	}

	this.bindSeekBar();
}
RTCMediaPlayerObj.prototype.appendEventsSelectPicker = function () 
{
	if (!this.getEventsObj()) 
	{
		return;
	}
	var moduleList = Object.keys(this.getEventsObj().getModuleObjectsAsMap());
	var optHtml = "";
	for (var i = 0; i < moduleList.length; i++) 
	{
		optHtml += '<option value=' + moduleList[i] + '>' + moduleList[i] + "</option>";
	}
	var eventsSelectPickerHtml = '<div>' +
	'<select class="selectpicker form-control bs-select-hidden" id="rtcp-mp-event-Container-SelectPicker" data-dropup-auto="false">' +
	optHtml +
	'</select>' +
	'</div>';
	$('#' + this.mediaPlayerDiv + ' .rtcp-events-selectpicker').append(eventsSelectPickerHtml);
	$('#' + this.mediaPlayerDiv + ' #rtcp-mp-event-Container-SelectPicker').selectpicker('refresh');
	$('#' + this.mediaPlayerDiv + ' #rtcp-mp-event-Container-SelectPicker').val(this.getPlayBackindex());
	this.bindEventSelectPicker();
}
RTCMediaPlayerObj.prototype.appendEventHeaderHtml = function () 
{
	if (!this.getEventsObj())
	{
		return;
	}
	var moduleList = Object.keys(this.getEventsObj().getModuleObjectsAsMap());
	var skippedEventList = this.getSkippedEvents();
	skippedEventList.forEach(function(skipppedEvent) {
			if (moduleList.includes(skipppedEvent)) 
			{
				var index = moduleList.indexOf(skipppedEvent)
				moduleList.splice(index, 1)
			}
		})
	/*for(var i=0;i<this.getSkippedEvents().size;i++)
	{
		var skipEvent = this.getSkippedEvents()[i];
		if (moduleList.includes(skipEvent)) {
			var index = moduleList.indexOf(skipEvent)
			moduleList.splice(index, 1)
		}
	}*/
	/*if (moduleList.includes(RTCMediaPlayerConstants.skipEvents.ANNOTATIONS)) {
		var index = moduleList.indexOf(RTCMediaPlayerConstants.skipEvents.ANNOTATIONS)
		moduleList.splice(index, 1)
	}
	if (moduleList.includes(RTCMediaPlayerConstants.skipEvents.BOOKMARKS)) {
		var index = moduleList.indexOf(RTCMediaPlayerConstants.skipEvents.BOOKMARKS)
		moduleList.splice(index, 1)
	}*/
	var html = "";
	var activeSpeakerIcon = 'rtcmp-icon-mp-activespeaker';
	var transcriptIcon = 'rtcmp-icon-mp-transcription';
	var defaultIcon = 'rtcp-mp-events-module-default';
	for (var i = 0; i < moduleList.length; i++) 
	{
		var icon;
		if (moduleList[i] == RTCMediaPlayerConstants.category.ACTIVESPEAKER) 
		{
			icon = activeSpeakerIcon;
		}
		else if (moduleList[i] == RTCMediaPlayerConstants.category.TRANSCRIPTION) 
		{
			icon = transcriptIcon;
		}
		else 
		{
			icon = RTCMediaPlayerConstants.processXSS(this.getIconForEventsModule(moduleList[i])) ? RTCMediaPlayerConstants.processXSS(this.getIconForEventsModule(moduleList[i])) : defaultIcon;
		}
		html += RTCMediaPlayerTemplates.getEventHeaderColumn(icon,  RTCPMediaPlayerResource.getRealValue(moduleList[i],this), this.getPlayBackindexName() == moduleList[i] ? true : false)
		if (moduleList[i + 1])
		{
//			html += '<div style="display: inline-flex;height: 15px;width: 1px;background: white;margin-left:10px;margin-right: 10px;" class="flexM"></div>';
		}
	}
	html += '<div style="width:100%;height:100%;"><div style="width:100vw;"></div></div>'
	$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-header .rtcp-events-header-module').append(html);
	if(moduleList.length == 1)
	{
		moduleNameRealValue = RTCPMediaPlayerResource.getRealValue(moduleList[0],this);
		$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-header-topbar-content-heading').text(moduleNameRealValue);
		$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-header').addClass('dN');
		$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-container').addClass('rtcp-mp-events-hide-events-header');
	}
	this.bindEventHeader();
}
RTCMediaPlayerObj.prototype.addTraverseDomIfNeeded = function ()
{
	var headerDOM  = document.querySelector('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-header .rtcp-events-header-module');
	var scrollWidth = headerDOM.scrollWidth;
	var clientWidth = headerDOM.clientWidth;
	if(scrollWidth > clientWidth)
	{
		document.querySelector('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-header').classList.add('rtcp-mp-events-header-traverse');
	}
	else
	{
		document.querySelector('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-header').classList.remove('rtcp-mp-events-header-traverse');
	}
}
RTCMediaPlayerObj.prototype.traverseHeaderDOM = async function (direction)
{
	var headerDom  = document.querySelector('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-header .rtcp-events-header-module');
	var moduleDoms = headerDom.querySelectorAll('.rtcp-events-header-bar');
	
	var length = moduleDoms.length;
	var setTraverseState = function(){
		setTimeout(function(mediaplayerObj){mediaplayerObj.setTraverseState()},500,this);
	}.bind(this)
	for(var i=0; i< length;i++)
	{
		var moduleDom = (moduleDoms[i]);
		switch(direction)
		{
			case "forward" :
			{
				var left = ($(moduleDom).position().left);
				if(left > -1 && left < 1)
				{
					left = 0;
				}
				if(left == 0 && i<length-1)
				{
					this.scrollHeaderEvent(headerDom,moduleDoms[i+1].offsetLeft);
					setTraverseState();
					//headerDom.scrollTo({left : moduleDoms[i+1].offsetLeft,top: 0,behavior: "smooth"});
					//moduleDoms[i+1].scrollIntoView({ behavior: "smooth",inline :"start"});
					//setTimeout(function(mediaplayerObj){mediaplayerObj.setTraverseState()},500,this);
					//setTraverseState();
					//this.setTraverseState();
					return
				}
//				if(i!= length-1)
//				{
//					if(this.isVisible(moduleDom,headerDom) && !this.isVisible(moduleDoms[i+1],headerDom))
//					{
//						moduleDoms[i+1].scrollIntoView({ behavior: "smooth"});
//						console.log("right")
//						return;
//					}
//				}
			}
			break;
			case "reverse" :
			{
				var left = ($(moduleDom).position().left);
				if(left > -1 && left < 1)
				{
					left = 0;
				}
				if(left == 0 && i>0)
				{
					this.scrollHeaderEvent(headerDom,moduleDoms[i-1].offsetLeft);
					setTraverseState();
					//headerDom.scrollTo({left : moduleDoms[i-1].offsetLeft,top: 0,behavior: "smooth"});
					//moduleDoms[i-1].scrollIntoView({ behavior: "smooth",inline :"start"});
					//setTimeout(function(mediaplayerObj){mediaplayerObj.setTraverseState()},500,this);
					//setTraverseState();
					//this.setTraverseState();
					return
				}
//				if(i != 0 )
//				{
//					if(this.isVisible(moduleDom,headerDom) && !this.isVisible(moduleDoms[i-1],headerDom))
//					{
//						moduleDoms[i-1].scrollIntoView({ behavior: "smooth"});
//						console.log("left")
//						return;
//					}
//				}
			}
			break;
		}
	}
	this.setTraverseState();
}

RTCMediaPlayerObj.prototype.scrollHeaderEvent = function(elem, left)
{
	return new Promise((resolve, reject) => {
		elem.scrollTo({left : left,top: 0,behavior: "smooth"});
		resolve();
		});
}

RTCMediaPlayerObj.prototype.setTraverseState = function () 
{
	var traverseLeftDom = $('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-traverse-left');
	var traverseRightDom = $('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-traverse-right');
	
	var headerDom = $('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-events-header-module')[0];
	var scrollWidth = headerDom.scrollWidth;
	var clientWidth = headerDom.clientWidth;
	if(scrollWidth <= clientWidth)
	{
		traverseRightDom.addClass('dN');
		traverseLeftDom.addClass('dN');
		return;
	}
	
	traverseRightDom.removeClass('dN');
	traverseLeftDom.removeClass('dN');
	
	var chapterDom = $('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-events-header-bar')
	var firstChapterDom = chapterDom[0];
	var firstChapterDomPosition = $(firstChapterDom).position();
	if(firstChapterDomPosition.left > -1 && firstChapterDomPosition.left < 1)
	{
		firstChapterDomPosition.left = 0;
	}
	
	var lastChapterDom = chapterDom[chapterDom.length - 1];
	var lastChapterDomPosition = $(lastChapterDom).position();
	if(lastChapterDomPosition.left > -1 && lastChapterDomPosition.left < 1)
	{
		lastChapterDomPosition.left = 0;
	}
	
	if((firstChapterDomPosition.left) == 0)
	{
		$(traverseLeftDom).addClass('rtcp-mp-traverse-disabled');
	}
	else
	{
		$(traverseLeftDom).removeClass('rtcp-mp-traverse-disabled');
	}
	if((lastChapterDomPosition.left) == 0)
	{
		$(traverseRightDom).addClass('rtcp-mp-traverse-disabled');
	}
	else
	{
		$(traverseRightDom).removeClass('rtcp-mp-traverse-disabled');
	}
}

RTCMediaPlayerObj.prototype.isVisible = function (ele, container) {
	const eleLeft = ele.offsetLeft;
    const eleRight = eleLeft + ele.clientWidth;

    const containerLeft = container.scrollLeft;
    const containerRight = containerLeft + container.clientWidth;

    // The element is fully visible in the container
    return (
        (eleLeft >= containerLeft && eleRight <= containerRight) //||
        // Some part of the element is visible in the container
        //(eleLeft < containerLeft && containerLeft < eleRight) ||
        //(eleLeft < containerRight && containerRight < eleRight)
    );
};
RTCMediaPlayerObj.prototype.traverseHeaderForward = function (event, elem) {
	this.traverseHeaderDOM("forward");
}
RTCMediaPlayerObj.prototype.traverseHeaderReverse = function (event, elem) {
	this.traverseHeaderDOM("reverse");
}
RTCMediaPlayerObj.prototype.getEventsObj = function ()
{
	return this.rtcEventsObject;
}
RTCMediaPlayerObj.prototype.getInfoCardToEnterCard = function () 
{

}
RTCMediaPlayerObj.prototype.getEventsSearchString = function () 
{

}
RTCMediaPlayerObj.prototype.getUserImgForPlayBack = function (userId, userName)
{

}
RTCMediaPlayerObj.prototype.getFallBackUserImgForPlayBack = function (userId,userName)
{

}
RTCMediaPlayerObj.prototype.mediaPlayerOnClose = function ()
{

}
RTCMediaPlayerObj.prototype.onDownload = function ()
{
	
}
RTCMediaPlayerObj.prototype.getTooltipContent = function (eventtime ,eventid ,eventmodule , eventdata) 
{

}
RTCMediaPlayerObj.prototype.getIconForEventsModule = function ()
{

}
RTCMediaPlayerObj.prototype.handleViewerCountUpdate  = function(viewerCount)
{

}
RTCMediaPlayerObj.prototype.handleSessionCountUpdate = function(sessionCount)
{
}
RTCMediaPlayerObj.prototype.handleOnTimeUpdate  = function(time)
{

}
RTCMediaPlayerObj.prototype.start = function ()
{
}
RTCMediaPlayerObj.prototype.stop = function ()
{
}
RTCMediaPlayerObj.prototype.resume = function () 
{
}

RTCMediaPlayerObj.prototype.onPlay = function () 
{
}

RTCMediaPlayerObj.prototype.onPause = function () 
{
	
}
RTCMediaPlayerObj.prototype.onFullScreen = function () 
{

}
RTCMediaPlayerObj.prototype.onExitFullScreen = function ()
{

}
RTCMediaPlayerObj.prototype.onPipMode = function () 
{

}
RTCMediaPlayerObj.prototype.onPipModeExit = function()
{

}
RTCMediaPlayerObj.prototype.onMiniplayer = function () 
{

}
RTCMediaPlayerObj.prototype.onDefaultView = function ()
{

}
RTCMediaPlayerObj.prototype.handleLeaveLiveStream = function()
{
	}
RTCMediaPlayerObj.prototype.handleMediaPlayerError = function(isFatal,type,response)
{
	
}
RTCMediaPlayerObj.prototype.handleFormatNotSupported = function()
{
	
}

RTCMediaPlayerObj.prototype.onVolumeChange =  function(isMuted,volume)
{
	
}
RTCMediaPlayerObj.prototype.onKeyPress = function(event)
{
	
}

RTCMediaPlayerObj.prototype.handleEvents = function(module, eventData)
{
	
}

RTCMediaPlayerObj.prototype.handleOnEnd= function()
{
	
}

RTCMediaPlayerObj.prototype.handleOnEndForPlayList = function()
{
	
}

RTCMediaPlayerObj.prototype.handleGoLive = function()
{
	
}

RTCMediaPlayerObj.prototype.handleLive = function()
{
	
}

RTCMediaPlayerObj.prototype.setDefaultPlaybackModule = function (moduleName) 
{
	if(moduleName)
	{
		this.defaultPlaybackModule = moduleName
	}
}

RTCMediaPlayerObj.prototype.updatePlayBackModule = function(moduleName)
{
	this.loadEventContainer(moduleName);
	this.appendContainerHtml();
}

RTCMediaPlayerObj.prototype.getDefaultPlaybackModule = function () 
{
	return this.defaultPlaybackModule;
}

RTCMediaPlayerObj.prototype.autoplaystart  = function ()
{
	this._autoplayFailed = false;
	if(this.view == RTCMediaPlayerConstants.MINIPLAYER)
	{
		$('#' + this.miniPlayerDiv + ' .rtcp-mp-video-pause-state').addClass('dN');
	}
	else
	{
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-pause-state').addClass('dN');
	}
	if(this._config.AV == "audio")
	{
		if(this.view == RTCMediaPlayerConstants.MINIPLAYER)
		{
			var elem = $('#' + this.mediaPlayerDiv + ' .pauseAndplay');
			elem.attr('purpose', 'pause')
			elem.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.pause")+" (k)");
		}
		else
		{
			var elem = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayecontrolsbottomleftcontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
			elem.attr('purpose', 'pause')
			elem.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.pause")+" (k)");
			elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-play").addClass("rtcmp-icon-mp-pause");
		}
	}
	this._videoInstance.play();
	$('#' + this.mediaPlayerDiv + ' .rtcmediaplayervideo').css("object-fit","contain");
	this.bindVideoTagEvents();
}
RTCMediaPlayerObj.prototype.play = function () 
{
	if(this._config.pauseOrPlay == "disable")
	{
		return;
	}

	/*if(!(this.view == RTCMediaPlayerConstants.MINIPLAYER && $('#'+this.mediaPlayerDiv+' .rtcp-mp-video-cont').hasClass('rtcp-mp-videoHover')))
	{
		this.updateCenterBezel("play");	
	}*/

	this._videoInstance.play();
	//$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-up-layer').attr('purpose', 'play');
	/*$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="play"]').attr("purpose","pause");
	var elem = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayecontrolsbottomleftcontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
	elem.attr('purpose', 'pause')
	elem.attr('tooltip-title', 'Pause (k)');
	elem.find('button').removeClass("rtcmp-icon-mp-play").addClass("rtcmp-icon-mp-pause");*/
}
RTCMediaPlayerObj.prototype.pause = function () 
{
	if(this._config.pauseOrPlay == "disable")
	{
		return;
	}

	/*if(!(this.view == RTCMediaPlayerConstants.MINIPLAYER && $('#'+this.mediaPlayerDiv+' .rtcp-mp-video-cont').hasClass('rtcp-mp-videoHover')))
	{
		this.updateCenterBezel("pause");
	}*/
		this._videoInstance.pause();
	//$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-up-layer').attr('purpose', 'pause');
	/*$('#'+this.mediaPlayerDiv+' [rtcpmpbutton][purpose="pause"]').attr("purpose","play");
	var elem = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayecontrolsbottomleftcontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
	elem.attr('tooltip-title', 'Play (k)');
	elem.find('button').removeClass("rtcmp-icon-mp-pause").addClass("rtcmp-icon-mp-play");*/
}
RTCMediaPlayerObj.prototype.mute = function (isBezelNeeded) 
{
	if(this._config.volume == "disable")
	{
		return;
	}
	if(isBezelNeeded)
	{
		this.updateCenterBezel("mute");	
	}
	this._videoInstance.muted = true;
		var elem = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-area');
		elem.find('[rtcpmpbutton]').attr('purpose', 'unMute');
		elem.find('[rtcpmpbutton]').removeClass('rtcmp-icon-unmute-sound').addClass('rtcmp-icon-mute-sound');
		elem.find('.tooltip-up').attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.unmute")+" (m)");
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').css("left", "0px");
}
RTCMediaPlayerObj.prototype.unMute = function (isBezelNeeded) 
{
	if(this._config.volume == "disable")
	{
		return;
	}
	if(isBezelNeeded)
	{
		this.updateCenterBezel("unmute");	
	}
	this._videoInstance.muted = false;
		var elem = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-area');
		elem.find('[rtcpmpbutton]').attr('purpose', 'mute');
		elem.find('[rtcpmpbutton]').removeClass('rtcmp-icon-mute-sound').addClass('rtcmp-icon-unmute-sound');
		elem.find('.tooltip-up').attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.mute")+" (m)");
	if (this._videoInstance.volume == 0) 
	{
		this._videoInstance.volume = 0.2;
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-area [rtcpmpbutton],#'+this.mediaPlayerDiv+' .rtcp-mp-bezel-player-state .rtcp-mp-bezel').attr('volume',this._videoInstance.volume);
	}
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * ($('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider').width() - $('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').width()));
}
RTCMediaPlayerObj.prototype.gotoTime = function (seedTime) 
{
	if(this.getDuration() && typeof seedTime == "number" && this.getDuration()>=seedTime)
	{
//		if(this._videoInstance.ended)
//		{
//			this._videoInstance.play();
//		}
		this._videoInstance.currentTime = seedTime;
		this.setScrubber(seedTime);
		this.setLoadedSeekBarPosition(seedTime);
	}
}
RTCMediaPlayerObj.prototype.setCurrentSeedTime = function (seedTime) 
{
	if (seedTime != null && seedTime !=undefined )
	{
		if(this.currentSeedTime != seedTime)
		{
			this.handleOnTimeUpdate(seedTime);
		}
		this.currentSeedTime = seedTime;
	}
}
RTCMediaPlayerObj.prototype.setSkippedEvent  = function (skippedEventList)
{
	if(skippedEventList)
	{
		this._skippedEvents = new Set(this._skippedEvents.concat(skippedEventList));
	}
}
RTCMediaPlayerObj.prototype.getSkippedEvents  = function ()
{
	return this._skippedEvents;
}
RTCMediaPlayerObj.prototype.getPlayerConfiguration =  function () 
{
	return {
		xhrSetup: function (xhr, url) {
			//To send the cookies in player request

			if(this.mode != RTCMediaPlayerConstants.mode.EXTERNAL)
			{
				if(this.isVodFlow())
				{
					if(this.mode == RTCMediaPlayerConstants.mode.RECORDING && (url.includes("rtcmanifest") || url.includes("rtclive") || url.includes("getencryptionkey")))
					{
						var requestUrl = new URL(url);
						url = requestUrl.origin + requestUrl.pathname;
						xhr.open('GET', url, true);
						xhr.setRequestHeader("x-sid", this.getSid());
						xhr.setRequestHeader("x-contentkey", this.getVODKey());
						xhr.setRequestHeader("x-pbtoken", this.getPBToken());
						xhr.setRequestHeader("x-version", this.getVodVersion());
						xhr.setRequestHeader("x-viewerid", this.getViewerId());
						xhr.setRequestHeader("x-filename", requestUrl.searchParams.get("filename"));
						xhr.setRequestHeader("x-pop", this.isPopEnabled() ? "1" : "0");
					}
				}
				else
				{
					var fileName = undefined;

					if(this.mode == RTCMediaPlayerConstants.mode.RECORDING && url.includes("rtclive?") && url.includes("&f="))
					{
						var urlArr = url.split("&f=", 2);

						if(urlArr[1])
						{
							fileName = urlArr[1];
							url = urlArr[0];
						}
					}

					xhr.open('GET', url, true);

					if(this.x_stateless_auth)
					{
						if(!url.includes("?token="))
						{
							xhr.setRequestHeader("stateless_auth", this.x_stateless_auth);
						}
						if(this.mode == RTCMediaPlayerConstants.mode.RECORDING && (url.includes("rtclive?") || url.includes("getencryptionkey")))
						{
							if(fileName)
							{
								xhr.setRequestHeader("x-filename", fileName);
							}
							if(this.mode == RTCMediaPlayerConstants.mode.RECORDING && this.confKey && this.vodKey && this.pbtoken)
							{
								xhr.setRequestHeader("x-confkey", this.confKey);
								xhr.setRequestHeader("x-vodkey", this.vodKey);
								xhr.setRequestHeader("x-pbtoken", this.pbtoken);
							}
						}
					}
				}
			}

			if(this._config.cookieNeeded == "enable")
			{
				xhr.withCredentials = true;
			}

		}.bind(this),
		mediaPlayerObj : this,
		pLoader : this.pLoader,
		fLoader : this.fLoader,
		// abrController : this.abrController,
		liveSyncDurationCount : 4,
		//liveMaxLatencyDurationCount : this.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING ? 10 : Infinity,
        maxBufferLength : this.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING ?  5 : this._config.MAX_BUFFER_LENGTH,
		backBufferLength : this.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING ? Infinity : this._config.BACK_BUFFER_LENGTH,
		maxBufferSize : this.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING ? Infinity : this._config.MAX_BUFFER_SIZE,
		fragLoadingMaxRetry : this._config.FRAG_LOADING_MAX_RETRY,
		manifestLoadPolicy : {
			default : {
				maxTimeToFirstByteMs : Infinity,
				maxLoadTimeMs : 20000,
				timeoutRetry : {
					maxNumRetry : this._config.MANIFEST_LOADING_MAX_RETRY,
					retryDelayMs : 0,
					maxRetryDelayMs : 0
				},
				errorRetry : {
					maxNumRetry : this._config.MANIFEST_LOADING_MAX_RETRY,
					retryDelayMs : 1000,
					maxRetryDelayMs : 3000,
					shouldRetry : function(retryConfig, retryCount, isTimeout, response, retry)
					{
						return retryCount < retryConfig.maxNumRetry;
					}
				}
			}
		},
		playlistLoadPolicy : {
			default : {
				maxTimeToFirstByteMs : 10000,
				maxLoadTimeMs : 20000,
				timeoutRetry : {
					maxNumRetry : this._config.LEVEL_LOADING_MAX_RETRY,
					retryDelayMs : 0,
					maxRetryDelayMs : 0
				},
				errorRetry : {
					maxNumRetry : this._config.LEVEL_LOADING_MAX_RETRY,
					retryDelayMs : 1000,
					maxRetryDelayMs : 3000,
					shouldRetry : function(retryConfig, retryCount, isTimeout, response, retry)
					{
						return retryCount < retryConfig.maxNumRetry;
					}
				}
			}
		},
		fragLoadPolicy : {
			default : {
				maxTimeToFirstByteMs : 10000,
				maxLoadTimeMs : 20000,
				timeoutRetry : {
					maxNumRetry : this._config.FRAG_LOADING_MAX_RETRY,
					retryDelayMs : 0,
					maxRetryDelayMs : 0
				},
				errorRetry : {
					maxNumRetry : this._config.FRAG_LOADING_MAX_RETRY,
					retryDelayMs : 1000,
					maxRetryDelayMs : 3000,
					shouldRetry : function(retryConfig, retryCount, isTimeout, response, retry)
					{
						if(!response || typeof response !== "object")
						{
							return false;
						}

						this.fragmentsLoadedAfterError = 0;
						this.fragmentRetryMap.set(response.url, (this.fragmentRetryMap.get(response.url) || 0) + 1);
						return this.fragmentRetryMap.get(response.url) <= retryConfig.maxNumRetry;
					}.bind(this)
				}
			}
		},
		autoStartLoad : this._config.autoStartLoad === "enable",
		abrBandWidthUpFactor : 1,
		abrBandWidthFactor : 1
		//initialLiveManifestSize : 5
	}
}
RTCMediaPlayerObj.prototype.initialiseMediaPlayer = function ()
{
	this.appendContainerHtml();
}
RTCMediaPlayerObj.prototype.bindVideoControls = function () 
{
	var doc = $('[mediaplayerid="' + this.mediaPlayerDiv +'"]');
	if (this._videoInstance) 
	{
		//this.bindVideoTagEvents();
		this.bindKeyControls();
		this.bindBottomPlayerControls();
		this.bindVideoElemDrag();
		this.bindVideoOnHover();
		this.bindResize();
		//this.bindWindowEvents();
	}
}
RTCMediaPlayerObj.prototype.bindVideoOnHover = function () {
	//MKDEBUG
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"]');
	elem.on('mouseenter mousemove', this, function (event) {
		var mediaPlayerInstance = event.data;
		if (mediaPlayerInstance.hoverTimerId) {
			clearTimeout(mediaPlayerInstance.hoverTimerId)
		}
		mediaPlayerInstance.showPlayerControls();
		mediaPlayerInstance.hoverTimerId = setTimeout(function (mediaPlayerInstance) {
			mediaPlayerInstance.hidePlayerControls();
		}, 4000, mediaPlayerInstance)
	})

	elem.on('mouseleave', this, function (event) {
		var mediaPlayerInstance = event.data;
		var elem = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-video-cont');

		if (mediaPlayerInstance._autoplayFailed || mediaPlayerInstance.isPaused() || $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-playbackspee-options').hasClass('selected') || $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-setting-view').hasClass('selected'))
		{
			return;
		}

		mediaPlayerInstance.isSeekbarhovered = false;

		if(!elem.hasClass("rtcp-mp-videoHover"))
		{
			return;
		}

		elem.removeClass("rtcp-mp-videoHover")
	})
}
RTCMediaPlayerObj.prototype.bindVideoElemDrag = function () 
{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayervideo').on('mousedown', this, function (event) {
			if(event.button !=0 )//handle only left click
			{
				return;
			}
			var mediaPlayerInstance = event.data;
			/*if(mediaPlayerInstance._config.drag == "disable")
		{
			mediaPlayerInstance.handlePlayPause();
			return;
		}*/
			/*if (mediaPlayerInstance.view == RTCMediaPlayerConstants.MINIPLAYER) {
			return;
		}*/
			
			if(event.target.className!="rtcmediaplayervideo")
			{
				return;
			}
			//mediaPlayerInstance.previousXPosition = mediaPlayerInstance.currentXPosition;
			//mediaPlayerInstance.previousYPosition = mediaPlayerInstance.currentYPosition;
			var that = this;
			var callback = function (e, isMoved) {
				//mediaPlayerInstance.currentYPosition = $("#" + mediaPlayerInstance.mediaPlayerDiv).position().top
				//mediaPlayerInstance.currentXPosition = $("#" + mediaPlayerInstance.mediaPlayerDiv).position().left
				/*if(!isMoved)
			{
				mediaPlayerInstance.handlePlayPause();
			}*/
				setTimeout(function(mediaPlayerInstance) {
					var dblclick = parseInt($(that).data('double'), 10);
					if (dblclick > 0) 
					{
						$(that).data('double', dblclick-1);
					} 
					else 
					{
						
						if(!isMoved && mediaPlayerInstance._config.clickThrough == "enable")
						{
							mediaPlayerInstance.handlePlayPause();
						}
					}
				}, 200,mediaPlayerInstance);
			}
			if(mediaPlayerInstance._config.drag == "disable")
			{
				callback(null,false);
				//mediaPlayerInstance.handlePlayPause();
				return;
			}
			var dragElem = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"]').parents('[rtcpmediaplayer]');
			if(dragElem.length  == 0 || (mediaPlayerInstance._config.AV === "video" && mediaPlayerInstance.view !== RTCMediaPlayerConstants.MINIPLAYER) || (mediaPlayerInstance._config.AV === "audio" && mediaPlayerInstance.view === RTCMediaPlayerConstants.FULLSCREEN))
			{
				return;
			}
			mediaPlayerInstance.dragMediaContainter(event,dragElem[0] , {
				xNeeded: true,
				yNeeded: true,
				xLimit: {
					lowerLimit: mediaPlayerInstance._config.leftLowerLimit,
					upperLimit: mediaPlayerInstance._config.leftHigherLimit != undefined ? mediaPlayerInstance._config.leftHigherLimit : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.innerWidth ? window.innerWidth : window.screen.width
				},
				yLimit :{
					lowerLimit: mediaPlayerInstance._config.topLowerLimit,
					upperLimit: mediaPlayerInstance._config.topHeigherLimit != undefined ? mediaPlayerInstance._config.topHeigherLimit : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.innerHeight ? window.innerHeight : window.screen.height
				}
			}, callback);
			
		});
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayervideo').on('dblclick', this, function (event) {
			var elem = $(this);
			$(this).data('double', 2);
			var mediaPlayerInstance = event.data;
			if(mediaPlayerInstance.view != RTCMediaPlayerConstants.MINIPLAYER)
			{
				mediaPlayerInstance.handleFullScreen();
			}
		});
		
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcpdrag').on('mousedown', this, function (event) {
			if(event.button !=0 )//handle only left click
			{
				return;
			}
			var mediaPlayerInstance = event.data;
			
			if(mediaPlayerInstance._config.drag == "disable")
			{
				return;
			}
			if(!event.target.className.includes("rtcpdrag"))
			{
				return;
			}
			var that = this;
			var dragElem = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"]').parents('[rtcpmediaplayer]');
			if(dragElem.length  == 0 || (mediaPlayerInstance._config.AV === "video" && mediaPlayerInstance.view !== RTCMediaPlayerConstants.MINIPLAYER))
			{
				return;
			}
			mediaPlayerInstance.dragMediaContainter(event,dragElem[0] , {
				xNeeded: true,
				yNeeded: true,
				xLimit: {
					lowerLimit: mediaPlayerInstance._config.leftLowerLimit,
					upperLimit: mediaPlayerInstance._config.leftHigherLimit != undefined ? mediaPlayerInstance._config.leftHigherLimit : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.innerWidth ? window.innerWidth : window.screen.width
				},
				yLimit :{
					lowerLimit: mediaPlayerInstance._config.topLowerLimit,
					upperLimit: mediaPlayerInstance._config.topHeigherLimit != undefined ? mediaPlayerInstance._config.topHeigherLimit : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.innerHeight ? window.innerHeight : window.screen.height
				}
			});
			
		});
}
RTCMediaPlayerObj.prototype.bindResize = function()
{	
	$('#' + this.mediaPlayerDiv +' .rtcp-mp-resize-top, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-right, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-bottom, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-left, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-topRight, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-bottomRight, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-bottomLeft, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-topLeft').on('mousedown', this, function (event) {
		if(event.button !=0 )//handle only left click
		{
			return;
		}
		var mediaPlayerInstance = event.data;
		document.getSelection().removeAllRanges(); // to remove selected text during resize 
		if(mediaPlayerInstance._config.resize == "disable")
		{
			$('#' + mediaPlayerInstance.mediaPlayerDiv+' .rtcp-mp-resize-component').addClass("rtcp-mp-dN");
			return;
		}
		if( mediaPlayerInstance.view == RTCMediaPlayerConstants.MINIPLAYER)
		{
				return
		}

		var className =event.target.className;
		var classNameList=["rtcp-mp-resize-top","rtcp-mp-resize-topRight","rtcp-mp-resize-right","rtcp-mp-resize-bottomRight","rtcp-mp-resize-bottom","rtcp-mp-resize-bottomLeft","rtcp-mp-resize-left","rtcp-mp-resize-topLeft"]
		if(!classNameList.includes(className))
		{
			return;
		}
		//mediaPlayerInstance.closePlayerSettingAndEventContainer();
		mediaPlayerInstance.closePlayerSetting()
		/*		if(RTCMediaPlayerConstants.MINIPLAYER == mediaPlayerInstance.view)
		{
			//mediaPlayerInstance.UI.top = top;
			//mediaPlayerInstance.UI.left = left;
			//mediaPlayerInstance.view = RTCMediaPlayerConstants.DEFAULTVIEW; 
			//$('#' + mediaPlayerInstance.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").addClass("rtcp-mp-default-player");
			//$('#' + mediaPlayerInstance.mediaPlayerDiv).css("height","300px");
			//$('#' + mediaPlayerInstance.mediaPlayerDiv).css("width","400px");
		}*/

		var callback = function (e,top,left,width,height) {
			if(RTCMediaPlayerConstants.MINIPLAYER == mediaPlayerInstance.view)
			{
				mediaPlayerInstance.UI.top = top;
				mediaPlayerInstance.UI.left = left;
			}
			if (mediaPlayerInstance.view == RTCMediaPlayerConstants.DEFAULTVIEW) {
				mediaPlayerInstance.UI.width = $('#'+this.mediaPlayerDiv).width();
				mediaPlayerInstance.UI.height = $('#'+this.mediaPlayerDiv).height();
			}
			mediaPlayerInstance.setLoadedSeekBarPosition(mediaPlayerInstance.getCurrentSeedTime());
			mediaPlayerInstance.setScrubber(mediaPlayerInstance.getCurrentSeedTime());
		}
		var continousCallback = function (e,top,left,width,height) {
			mediaPlayerInstance.UI.top = top;
			mediaPlayerInstance.UI.left = left;
			
//			if(mediaPlayerInstance._config.AV != "audio"){
//				if(width > 530)
//				{
//					mediaPlayerInstance.view = RTCMediaPlayerConstants.DEFAULTVIEW; 
//					$('#' + mediaPlayerInstance.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").addClass("rtcp-mp-default-player");
//				}
////				else
////				{
////						mediaPlayerInstance.view = RTCMediaPlayerConstants.MINIPLAYER; 
////						$('#' + mediaPlayerInstance.mediaPlayerDiv).removeClass("rtcp-mp-default-player").addClass("rtcp-mp-mini-player");
////						//$('#' + mediaPlayerInstance.mediaPlayerDiv).css("height","300px");
////						//$('#' + mediaPlayerInstance.mediaPlayerDiv).css("width","400px");
////				}
//			}
			mediaPlayerInstance.setLoadedSeekBarPosition(mediaPlayerInstance.getCurrentSeedTime());
			mediaPlayerInstance.setScrubber(mediaPlayerInstance.getCurrentSeedTime());
		}

		var side = undefined;
		switch (className)
		{
		case "rtcp-mp-resize-top":
		{
			side = "top";
		}
		break;
		case "rtcp-mp-resize-topRight":
		{
			side = "topRight";
		}
		break;
		case "rtcp-mp-resize-right":
		{
			side="right";
		}
		break;
		case "rtcp-mp-resize-bottomRight":
		{
			side = "bottomRight";
		}
		break;
		case "rtcp-mp-resize-bottom":
		{
			side = "bottom";
		}
		break;
		case "rtcp-mp-resize-bottomLeft":
		{
			side = "bottomLeft";
		}
		break;
		case "rtcp-mp-resize-left":
		{
			side = "left";
		}
		break;
		case "rtcp-mp-resize-topLeft":
		{
			side = "topLeft";
		}
		break;
		}
		var resizeElem = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"]').parents('[rtcpmediaplayer]');
		if(resizeElem.length  == 0)
		{
			return;
		}
		var config = {
				widthLimit : 
				{
					lowerLimit : (mediaPlayerInstance._config.AV == "audio") ? 382 : 700,
					upperLimit : (mediaPlayerInstance._config.AV == "audio") ? 720 : undefined
				},
				heightLimit : 
				{
					lowerLimit : (mediaPlayerInstance._config.AV == "audio") ? 136 : 400,
					upperLimit : (mediaPlayerInstance._config.AV == "audio") ? 162 : undefined
				},
				left : 
				{
					higherLimit : mediaPlayerInstance._config.leftHigherLimit != undefined ? mediaPlayerInstance._config.leftHigherLimit : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.innerWidth ? window.innerWidth : window.screen.width
				},
				top :
				{
					higherLimit : mediaPlayerInstance._config.topHeigherLimit != undefined ? mediaPlayerInstance._config.topHeigherLimit : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.innerHeight ? window.innerHeight : window.screen.height
				},
				side : side
			}
		mediaPlayerInstance.resizeMediaContainer(event,resizeElem[0] ,config,callback,continousCallback);

		/*mediaPlayerInstance.previousXPosition = mediaPlayerInstance.currentXPosition;
		mediaPlayerInstance.previousYPosition = mediaPlayerInstance.currentYPosition;

		var callback = function (e, isMoved) {
			mediaPlayerInstance.currentYPosition = $("#" + mediaPlayerInstance.mediaPlayerDiv).position().top
			mediaPlayerInstance.currentXPosition = $("#" + mediaPlayerInstance.mediaPlayerDiv).position().left
		}
		mediaPlayerInstance.dragMediaContainter(event, document.getElementById(mediaPlayerInstance.mediaPlayerDiv), {
			xNeeded: true,
			yNeeded: true
		}, callback);*/
	});
}
/*RTCMediaPlayerObj.prototype.bindWindowEvents = function()
{
	$(window).blur(function(event) {
		if(RTCMediaPlayerObjList && Object.keys(RTCMediaPlayerObjList).length != 1)
		{
			return;
		}
		var mediaPlayerInstance = RTCMediaPlayerObjList[Object.keys(RTCMediaPlayerObjList)[0]];
		if(mediaPlayerInstance._config.pictureInPicture == "enable" && mediaPlayerInstance._config.autoPictureInPicture == "enable")
		{
			if(document.pictureInPictureElement && document.pictureInPictureElement.className == "rtcmediaplayervideo")
			{
				return;
			}
			mediaPlayerInstance.gotoPIP();	
		}
	});
}*/
RTCMediaPlayerObj.prototype.bindVideoTagDurationEvent = function ()
{
	
	this._videoInstance.ondurationchange = function (event) {
		if (this.mode != RTCMediaPlayerConstants.mode.LIVESTREAMING)
		{
			$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-time-duration').html(this.getFormatedTime(this._videoInstance.duration));
		}
		this.bindDurationAndEvents();
	}.bind(this)
	
	//The browser can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content.
	this._videoInstance.oncanplay = function (event) {
		this.setSpinner();
	}.bind(this)
	
	//The browser estimates it can play the media up to its end without stopping for content buffering.
	this._videoInstance.oncanplaythrough = function (event) {
		this.setSpinner();
	}.bind(this)
	
	//The first frame of the media has finished loading.
	this._videoInstance.onloadeddata = function (event) {
		this.setSpinner();
	}.bind(this)
	
	///The metadata has been loaded.
	this._videoInstance.onloadedmetadata = function (event) {
		this.setSpinner();
	}.bind(this)
	
	//Fired periodically as the browser loads a resource.
	this._videoInstance.onprogress = function (event) {
		this.setSpinner();
	}.bind(this)
	
	//Playback has stopped because of a temporary lack of data.
	this._videoInstance.onwaiting = function (event) {
		this.setSpinner();
	}.bind(this)
}
RTCMediaPlayerObj.prototype.bindVideoTagEvents = function () 
{
	if(!this._videoInstance)
	{
		return;
	}

	if(!this.loaderIntervalID)
	{
		this.loaderIntervalID = setInterval(function (mediaPlayerInstance) {
//			if (mediaPlayerInstance._videoInstance && (mediaPlayerInstance._videoInstance.ended || mediaPlayerInstance._videoInstance.readyState == 4 || mediaPlayerInstance._videoInstance.readyState == 3)) 
//			{
//				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-spinner').hide();
//			}
//			else 
//			{
//				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-spinner').show();
//			}
			mediaPlayerInstance.setSpinner();
			mediaPlayerInstance.setStatusTextForLiveStreaming();
			mediaPlayerInstance.getCurrentTimefromFragment();
			for (var i = 0; mediaPlayerInstance._videoInstance && i < mediaPlayerInstance._videoInstance.buffered.length; i++)
			{
				var videoTime = mediaPlayerInstance.getCurrentSeedTime();
				if(mediaPlayerInstance._videoInstance.buffered.start(i) < videoTime)
				{
					mediaPlayerInstance.setBufferedPosition(mediaPlayerInstance._videoInstance.buffered.end(i));	
				}
			}
		}, 1000, this)
	}
	
	if (this.mode != RTCMediaPlayerConstants.mode.EXTERNAL && (typeof RTCP != "undefined"))
	{
			if(!this.statintervalID)
			{
				this.statintervalID = setInterval(function (mediaPlayerInstance) {
					if(Object.keys(mediaPlayerInstance.stat).length > 0)
					{
							RTCP.sendStats(mediaPlayerInstance,Object.assign({},mediaPlayerInstance.stat));
					}
					mediaPlayerInstance.stat = {};
				}, this.statTimeInterval,this);
			}
		
		if(!this.wssStatintervalID)
		{
			this.wssStatintervalID = setInterval(function(mediaPlayerInstance) {
				mediaPlayerInstance.sendStatsToWSS();
			}, this.wssStatTimeInterval, this);
		}	
	}
	
	this._videoInstance.ontimeupdate = function () {
		this.bindDurationAndEvents();
		if (this.mode != RTCMediaPlayerConstants.mode.LIVESTREAMING)
		{
			$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-time-current').html(this.getFormatedTime(this._videoInstance.currentTime))
			this.setCurrentSeedTime(this._videoInstance.currentTime);
		}
		this.setLoadedSeekBarPosition(this.getCurrentSeedTime());
		this.setScrubber(this.getCurrentSeedTime());
		if (this.getEventsObj()) 
		{
			if(this.getCurrentSeedTime()!=undefined)
			{
				this.getEventsObj().getEventsForCurrentTime(this.getCurrentSeedTime(), this);				
			}
			var chapContainer = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerchapter');
			var currentTime = this.getCurrentSeedTime();
			var st = 0;
			for (var i = 0; i < chapContainer.length; i++)
			{
				var chap = $(chapContainer[i]);
				if (parseFloat($(chap).attr("st")) <= currentTime && parseFloat($(chap).attr("et")) >= currentTime) {
					st = parseFloat($(chap).attr("st"));
					break;
				}
			}

			if (this.getEventsObj() && this.getPlayBackindex() && this.getPlayBackindex()[Math.floor(st)]) 
			{

				var currentChapter = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-chapter[track="current"]')[0]
				var chapSTime = $(currentChapter).attr('mp-start-time');
				var chapETime = $(currentChapter).attr('mp-end-time');
				if (currentChapter && currentTime >= chapSTime && currentTime < chapETime) 
				{
					var percentageCompleted = ((currentTime - chapSTime) / (chapETime - chapSTime)) * 100;
					$(currentChapter).find('.rtcp-mp-events-chapter-seek-status').css('width',percentageCompleted+'%');
					//currentChapter.style.background = 'linear-gradient(90deg, transparent ' + percentageCompleted + '%, #141414 ' + percentageCompleted + '%)';
				} 
				else
				{
					this.setCurrentChapter(currentTime);
				}
				if (this.getEventsObj().filterPlaybackModule == RTCMediaPlayerConstants.category.ACTIVESPEAKER)
				{
					$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-chapter-title-content').html(this.getPlayBackindex()[Math.floor(st)][0].getEventData().username + " is speaking");
				} 
				else 
				{
					var info = this.getInfoCardToEnterCard(this.getPlayBackindex()[Math.floor(st)][0].getEventID(), this.getEventsObj().filterPlaybackModule, this.getPlayBackindex()[Math.floor(st)][0].getEventData())
					if (info && info.title) 
					{
						$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-chapter-title-content').html(RTCMediaPlayerConstants.processXSS(info.title));
					} 
					else
					{
						$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-chapter-title-content').html("");
					}
				}
			} 
			else
			{
				$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-chapter-title-content').html(this.getPlayerTitle());
			}
		}
	}.bind(this)

	/*this._videoInstance.onprogress = function () {
		for (var i = 0; i < this._videoInstance.buffered.length; i++) {
			var videoTime = this.getCurrentSeedTime();
			if(this._videoInstance.buffered.start(i) < videoTime)
			{
				this.setBufferedPosition(this._videoInstance.buffered.end(i));	
			}
		}
	}.bind(this)*/

	this._videoInstance.onpause = function()
	{
		this.UIonPause();
		
	}.bind(this)

	this._videoInstance.onplay = function()
	{
		this.UIonPlay();
		
	}.bind(this)

	this._videoInstance.onvolumechange = function()
	{
		this.onVolumeChange(this._videoInstance.muted,this.getVolume());
		
	}.bind(this)

	this._videoInstance.onended =function()
	{
//		console.log("onended",this._videoInstance.paused,this._videoInstance.ended);
//		this._videoInstance.onpause();
		this.handleOnEndForPlayList(this);
	}.bind(this)

	this._videoInstance.onseeked = function() {
		this.onSeeked();
	}.bind(this);
}
RTCMediaPlayerObj.prototype.startFetchPopRefreshTokenVod  = function()
{
	if(this.isPopEnabled() && this.getWSSUrl() && this.mode == RTCMediaPlayerConstants.mode.RECORDING)
	{
		this.getPopTokenForVod();
		if(this.popRequestIntervalID)
		{
			this.popRequestIntervalID = setInterval(function (mediaPlayerInstance){
				mediaPlayerInstance.getPopTokenForVod();
			},20000,this)
		}
	}
}
RTCMediaPlayerObj.prototype.isPOPTokenRefreshNeeded = function()
{
	if((this.tokenTime + this.tokenExpiryTime ) < new Date().getTime())
	{
		return true;
	}
	return false;
}

RTCMediaPlayerObj.prototype.getPopTokenForVod  = function()
{
	this.popToken = undefined;
	this.popDomain = undefined;
	this.switchUrl = undefined;
	var successCallback = function (response) {
		response = JSON.parse(response);
		if(response.popdomain)
		{
			this.popDomain = response.popdomain;
		}
		if(response.poptoken)
		{
			this.popToken = response.poptoken
		}
		if(response.switchurl)
		{
			this.switchUrl = response.switchurl
		}
		if (response.cc)
		{
			this.cc = response.cc;
		}
		this.tokenTime = new Date().getTime();
		
		if(response.tokenexpiry)
		{
			this.tokenExpiryTime = response.tokenexpiry;
		}
		else
		{
			this.tokenExpiryTime = 10000;
		}
	}.bind(this)
	var failureCallBack = function (status) {
		this.popToken = undefined;
		this.popDomain = undefined;
		this.switchUrl = undefined;
		clearInterval(this.popRequestIntervalID);
	}.bind(this)

	RTCPRecording.getPopTokenForVod(this.getWSSUrl(), this.rtcpFlow, this.sid, this.x_stateless_auth, successCallback, failureCallBack, this.handleAjaxTimeout());
}
RTCMediaPlayerObj.prototype.bindDurationAndEvents = function () 
{
	if (this.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING)
	{
		if (!this.getDuration() && !this.isInitialised && this._videoInstance.volume && this.isEventsLoaded)
		{
			this.getCurrentTimefromFragment();
			if(this.getEventsObj())
			{
				this.getEventsObj().sortTimeIndexList(this);
			}
			this.isInitialised = true
			this.showPlayerControls();
			$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * (70 - 12));
			this.hidePlayerControls();
		}
		return;
	}
	if (this.mode == RTCMediaPlayerConstants.mode.EXTERNAL)
	{
		if (!this.getDuration()) 
		{
			this.setDuration(this._videoInstance.duration);
			this.showPlayerControls();
			$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * (70 - 12));
			//$('#' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-container, #' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-button').css("display", "none");
			$('#' + this.mediaPlayerDiv + ' .rtcmediaplayerchapter').attr("et", this._videoInstance.duration);
			this.setCurrentSeedTime(this._videoInstance.currentTime);
			if(this.getEventsObj())
			{
				this.getEventsObj().sortTimeIndexList(this);
			}
			this.appendContainerHtml();
			this.hidePlayerControls();
			return;
		}
		if (this.getDuration() != this._videoInstance.duration) 
		{
			this.setDuration(this._videoInstance.duration);
			this.showPlayerControls();
			$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * (70 - 12));
			//$('#' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-container, #' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-button').css("display", "none");
			$('#' + this.mediaPlayerDiv + ' .rtcmediaplayerchapter').attr("et", this._videoInstance.duration);
			this.appendContainerHtml();
			this.hidePlayerControls();
			return;
		}
		return;
	}
	if (!this.getDuration() && this.isEventsLoaded) 
	{
		this.showPlayerControls();
		//$('#' +this.mediaPlayerDiv +' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * ($('#' +this.mediaPlayerDiv +' .rtcp-mp-volume-slider').width() - $('#' +this.mediaPlayerDiv +' .rtcp-mp-volume-slider-handle').width()));
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * (70 - 12));
		//$('#' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-container, #' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-button').css("display", "none");
		$('#' + this.mediaPlayerDiv + ' .rtcmediaplayerchapter').attr("et", this._videoInstance.duration);
		this.setDuration(this._videoInstance.duration);
		this.setCurrentSeedTime(this._videoInstance.currentTime);
		if(this.getEventsObj())
		{
			this.getEventsObj().sortTimeIndexList(this);
		}
		this.appendContainerHtml();

		if (this.getEventsObj()) {
			var moduleList = Object.keys(this.getEventsObj().getModuleObjectsAsMap());
			if (moduleList.includes(RTCMediaPlayerConstants.category.ANNOTATIONS))
			{
				$('#' + this.mediaPlayerDiv + ' .rtc-mp-annotation-setting').css('display', 'inline-flex');
			}
			if (moduleList.includes(RTCMediaPlayerConstants.category.BOOKMARKS)) 
			{
				$('#' + this.mediaPlayerDiv + ' .rtc-mp-bookmark-setting').css('display', 'inline-flex');

				$('#' + this.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-bookmark-setting').addClass('rtcp-mp-bookmark-active');
				this.showAnnotation(RTCMediaPlayerConstants.category.BOOKMARKS, true);
			}
		}
		this.hidePlayerControls();
		return;
	}

	if (this.isEventsLoaded && (this.getDuration() != this._videoInstance.duration)) 
	{
		this.showPlayerControls();
		//$('#' +this.mediaPlayerDiv +' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * ($('#' +this.mediaPlayerDiv +' .rtcp-mp-volume-slider').width() - $('#' +this.mediaPlayerDiv +' .rtcp-mp-volume-slider-handle').width()));
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * (70 - 12));
		//$('#' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-container, #' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-button').css("display", "none");
		$('#' + this.mediaPlayerDiv + ' .rtcmediaplayerchapter').attr("et", this._videoInstance.duration);
		this.setDuration(this._videoInstance.duration);
		this.appendContainerHtml();
		if ($('#' + this.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-bookmark-setting').hasClass('rtcp-mp-bookmark-active')) {
			$('#' + this.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-bookmark-setting').addClass('rtcp-mp-bookmark-active');
			this.showAnnotation(RTCMediaPlayerConstants.category.BOOKMARKS, true);
		}
		this.hidePlayerControls();
	}
}
RTCMediaPlayerObj.prototype.bindBottomPlayerControls = function ()
{
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayecontrols').on('click', this, function (event) {
		if(event.target.className == "rtcmediaplayecontrols")
		{
			event.data.closePlayerSettingAndEventContainer();
		}
	});
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container').on('mousedown', this, function (event) {
		event.stopPropagation();
		if(event.button !=0 )//handle only left click
		{
			return;
		}
		var mediaPlayerInstance = event.data;
		mediaPlayerInstance.isScrubberMoving = true;
		var muteState = mediaPlayerInstance._videoInstance.muted;
		var callback = function (e) {
			if(!muteState)
			{
				mediaPlayerInstance._videoInstance.muted = false;
			}
			var scrubberLeft = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container')[0].offsetLeft;
			//var seekTime = (this._videoInstance.duration / ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').width() - (RTCMediaPlayerConstants.UI.scrubberWidth/2))) * scrubberLeft;
			var seekTime = (this._videoInstance.duration / ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').width()))*(scrubberLeft +(RTCMediaPlayerConstants.UI.scrubberWidth/2));
			if(this._videoInstance.ended)
			{
				this._videoInstance.play();
			}
			this._videoInstance.currentTime = seekTime;
			this.isScrubberMoving = false;
		}.bind(mediaPlayerInstance);
		var continousCallback = function (e, left, top) {
			
			if(!muteState)
			{
				mediaPlayerInstance._videoInstance.muted = true;
			}
			var scrubberLeft = left;
			//var seekTime = (this._videoInstance.duration / ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').width() - (RTCMediaPlayerConstants.UI.scrubberWidth/2))) * scrubberLeft;
			var seekTime = (this._videoInstance.duration / ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').width()))*(scrubberLeft +(RTCMediaPlayerConstants.UI.scrubberWidth/2));
			if(this._videoInstance.ended)
			{
				this._videoInstance.play();
			}
			this._videoInstance.currentTime = seekTime;
			mediaPlayerInstance.setLoadedSeekBarPosition(seekTime);
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-time-current').html(this.getFormatedTime(this._videoInstance.currentTime))
		}.bind(mediaPlayerInstance)
		mediaPlayerInstance.dragMediaContainter(event, $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container')[0], {
			xNeeded: true,
			xLimit: {
				lowerLimit: -10,
				upperLimit: ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').width()+(RTCMediaPlayerConstants.UI.scrubberWidth/2))
			}
		}, callback, continousCallback);
	});

	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container').on('mouseenter mousemove', this, function (event) {
		var mediaPlayerInstance = event.data;
		if(mediaPlayerInstance._config.tooltip == "disable")
		{
			return;
		}
		var elmt = $(this)[0];
		var st;
		var et;
		var mouseTime = (elmt.offsetLeft + (RTCMediaPlayerConstants.UI.scrubberWidth/2)) * (mediaPlayerInstance._videoInstance.duration / $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayerbackground').width())
		var chapContainer = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayerchapter')
		
		for (var i = 0; i < chapContainer.length; i++) 
		{
			if (mouseTime > parseFloat(chapContainer[i].getAttribute("st")) && mouseTime < parseFloat(chapContainer[i].getAttribute("et")))
			{
				st = parseFloat(chapContainer[i].getAttribute("st"));
				et = parseFloat(chapContainer[i].getAttribute("et"));
			}
		}
		var left = 0;
		if(mediaPlayerInstance._config.AV == "video")
		{
			left = event.pageX - ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').width() / 2) - mediaPlayerInstance._videoInstance.getBoundingClientRect().left;
			left = left < 0 ? 0 : left > $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-video-cont').width() - 162 - 12 ? $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-video-cont').width() - 162 - 12 : left;
			
		}
		else if(mediaPlayerInstance._config.AV == "audio")
		{
			left = event.pageX - ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').width() / 2) - document.querySelector('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').getBoundingClientRect().left;
		}
		//$('#' +mediaPlayerInstance.mediaPlayerDiv +' .rtcp-mp-tooltip-text').html(mediaPlayerInstance.getFormatedTime(mouseTime))
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').css("left", left);
		//$('#' +mediaPlayerInstance.mediaPlayerDiv +' .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').css("top",$('#'+mediaPlayerInstance.mediaPlayerDiv+' .rtcpmediaplayerseekbar').position().top - 20 - $('#' +mediaPlayerInstance.mediaPlayerDiv +' .rtcp-mp-tooltip-bg').height() - $('#' +mediaPlayerInstance.mediaPlayerDiv +' .rtcp-mp-tooltip-title').height() - $('#' +mediaPlayerInstance.mediaPlayerDiv +' .rtcp-mp-tooltip-text').height());
		//$('#' +mediaPlayerInstance.mediaPlayerDiv +' .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').css("top",$('#'+mediaPlayerInstance.mediaPlayerDiv+' .rtcpmediaplayerseekbar').position().top - 20 - $('.rtcp-mp-tooltip').height());
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').css("bottom", $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').height() + 20);
		
			if (mediaPlayerInstance._config.events == "enable" && mediaPlayerInstance.getEventsObj() && mediaPlayerInstance.getPlayBackindex() && mediaPlayerInstance.getPlayBackindex()[Math.floor(st)]) 
			{
				var eventData = mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventData();

				if (mediaPlayerInstance.getEventsObj().filterPlaybackModule == RTCMediaPlayerConstants.category.ACTIVESPEAKER)
				{
					var userId = eventData.userid.split("_")[2];
					var userImgUrl = mediaPlayerInstance.getUserImgForPlayBack(userId, eventData.username);
					var tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent(eventData.username, mediaPlayerInstance.getFormatedTime(mouseTime),(userImgUrl)? true:false)
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip-bg').show();
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip-bg').css('background-image', 'url(' + userImgUrl + '), url(' + mediaPlayerInstance.getFallBackUserImgForPlayBack(userId, eventData.username) + ')');
	
				} 
				else if (mediaPlayerInstance.getEventsObj().filterPlaybackModule == RTCMediaPlayerConstants.category.TRANSCRIPTION)
				{
					var userId = eventData.userid.split("_")[2];
					var userImgUrl = mediaPlayerInstance.getUserImgForPlayBack(userId, eventData.username);
					var tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent(eventData.username || "", mediaPlayerInstance.getFormatedTime(mouseTime),(isImgProvide)? true:false)
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip-bg').show();
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip-bg').css('background-image', 'url(' + userImgUrl + '), url(' + mediaPlayerInstance.getFallBackUserImgForPlayBack(userId, eventData.username) + ')');
				}
				else 
				{
					var tooltipContentHtml = "";
					tooltipContentHtml = mediaPlayerInstance.getTooltipContent(mediaPlayerInstance.getFormatedTime(mouseTime), mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventID(), mediaPlayerInstance.getEventsObj().filterPlaybackModule, eventData);
					if (!tooltipContentHtml)
					{
						var info = mediaPlayerInstance.getInfoCardToEnterCard(mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventID(), mediaPlayerInstance.getEventsObj().filterPlaybackModule, eventData)
						if (info && info.title && info.username) 
						{
							//$('#' +mediaPlayerInstance.mediaPlayerDiv +' .rtcp-mp-tooltip-title').html(info.title);
							tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent(RTCMediaPlayerConstants.processXSS(info.title), mediaPlayerInstance.getFormatedTime(mouseTime), false)
						} 
						else
						{
							tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent("", mediaPlayerInstance.getFormatedTime(mouseTime), false)
						}
					}
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
				}
			} 
			else 
			{
				var tooltipContentHtml = "";
				tooltipContentHtml = mediaPlayerInstance.getTooltipContent(mediaPlayerInstance.getFormatedTime(mouseTime),null,null,null);
				if (!tooltipContentHtml) 
				{
					if(mediaPlayerInstance._config.AV == "video")
					{
						$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(RTCMediaPlayerTemplates.getMediaPlayerTooltipContent(mediaPlayerInstance.title, mediaPlayerInstance.getFormatedTime(mouseTime), false))
					}
					else if(mediaPlayerInstance._config.AV == "audio")
					{
						$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').text(mediaPlayerInstance.getFormatedTime(mouseTime));				
					}
				}
				else
				{
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
				}
			}
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').removeClass('dN');
	});
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container').on('mouseleave', this, function (event) {
		var mediaPlayerInstance = event.data;
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').removeClass('dN').addClass('dN');
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayerbackground .rtcmediaplayerchapter .rtcmediaplayerhoverprogress').css('background', '')
	});

	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-volume-area').on('mouseenter', this, function (event) {
		var mediaPlayerInstance = event.data;
		if (mediaPlayerInstance.isVolumeSliderClicked) 
		{
			return;
		}
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-area').addClass("rtcp-mp-volume-hover");
		if(mediaPlayerInstance._videoInstance.muted)
		{
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').css("left", "0px");
		}
		else
		{
			mediaPlayerInstance.handleVolumeChange(mediaPlayerInstance._videoInstance.volume,false);
		}
		if(mediaPlayerInstance._config.AV=="audio")
		{
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayecontrolsmini .playbackspeed-value').css("display","none");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayecontrolsmini .rtcmp-icon-replay').css("display","none");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmp-icon-replay-button').css("display","none");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-download-button').css("display","none");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-reportabuse').css("display","none");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-transcript').css("display","none");
		}
	})
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .playbackspeed-value').on('mouseenter', this, function (event) {
		var mediaPlayerInstance = event.data;
//		if (mediaPlayerInstance.isVolumeSliderClicked) {
//			return;
//		}
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .playbackspeed-selected-close').addClass("rtcp-mp-playbackspeed-close-selected");
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmp-icon-dropbtn.rtcmp-icon-opendropbtn.tooltip-up').css("display","none");
	})
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .playbackspeed-close').on('mouseleave', this, function (event) {
		var mediaPlayerInstance = event.data;
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .playbackspeed-selected-close').removeClass("rtcp-mp-playbackspeed-close-selected");
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmp-icon-dropbtn.rtcmp-icon-opendropbtn.tooltip-up').css("display","flex");
	})
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .audio_playbackspeed-selected').on('mouseenter', this, function (event) {
		var mediaPlayerInstance = event.data;
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayecontrolsbottomleftcontrols').addClass("playback-hover");
	})
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .audio_playbackspeed-selected').on('mouseleave', this, function (event) {
		var mediaPlayerInstance = event.data;
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayecontrolsbottomleftcontrols').removeClass("playback-hover");
	})
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-volume-area').on('mouseleave', this, function (event) {
		var mediaPlayerInstance = event.data;
		if (mediaPlayerInstance.isVolumeSliderClicked)
		{
			return;
		}
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-area').removeClass("rtcp-mp-volume-hover")
		if(mediaPlayerInstance._config.AV=="audio")
		{
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayecontrolsmini .playbackspeed-value').css("display","flex");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayecontrolsmini .rtcmp-icon-replay').css("display","flex");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmp-icon-replay-button').css("display","flex");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-download-button').css("display","flex");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-reportabuse').css("display","flex");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-transcript').css("display","flex");
		}
	})

	$('#'+this.mediaPlayerDiv).on('fullscreenchange webkitfullscreenchange', this, function (event) {
		var mediaPlayerInstance = event.data;
		mediaPlayerInstance.setLoadedSeekBarPosition(mediaPlayerInstance.getCurrentSeedTime());
		mediaPlayerInstance.setScrubber(mediaPlayerInstance.getCurrentSeedTime());
		var elem = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-setting-button');
		if (elem.hasClass("selected")) 
		{
			mediaPlayerInstance.closePlayerSetting();
		}
		if(($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').hasClass("selected")))
		{
			mediaPlayerInstance.closeSeparatePlayerSetting();
		}
		//if (($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-events-container').css('display') != 'none')) 
		//{
			//mediaPlayerInstance.closeEventContainer()
		//}
		if (!document.fullscreenElement && !document.webkitCurrentFullScreenElement) 
		{
			mediaPlayerInstance.view = RTCMediaPlayerConstants.DEFAULTVIEW;
			$('#' + mediaPlayerInstance.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").removeClass("rtcp-mp-fullscn-player").addClass("rtcp-mp-default-player");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-miniplayer-button').css("display", "inline-flex");
			var fullScreenButton =  $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-fullscreen-button .rtcp-mp-button');
			fullScreenButton.removeClass('rtcmp-icon-mp-minimise').addClass('rtcmp-icon-mp-maximise');
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-fullscreen-button').attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.fullscreen")+" (f)");
			mediaPlayerInstance.onExitFullScreen();
		}
		else
		{
			mediaPlayerInstance.view = RTCMediaPlayerConstants.FULLSCREEN;
			$('#' + mediaPlayerInstance.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").removeClass("rtcp-mp-default-player").addClass("rtcp-mp-fullscn-player");
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-miniplayer-button').hide();
			var fullScreenButton =  $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-fullscreen-button .rtcp-mp-button');
			fullScreenButton.removeClass('rtcmp-icon-mp-maximise').addClass('rtcmp-icon-mp-minimise');
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-fullscreen-button').attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.minimise")+" (f)");
			mediaPlayerInstance.onFullScreen();
		}
	})
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] video.rtcmediaplayervideo').on('enterpictureinpicture', this, function (event) {
		var mediaPlayerInstance = event.data;
		mediaPlayerInstance.setLoadedSeekBarPosition(mediaPlayerInstance.getCurrentSeedTime());
		mediaPlayerInstance.setScrubber(mediaPlayerInstance.getCurrentSeedTime());
		var elem = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-setting-button');
		if (elem.hasClass("selected")) 
		{
			mediaPlayerInstance.closePlayerSetting();
		}
		if(($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').hasClass("selected")))
		{
			mediaPlayerInstance.closeSeparatePlayerSetting();
		}
//		if ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-events-container').css('display') != 'none') {
			//mediaPlayerInstance.closeEventContainer()
//		}

		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-pip-background').removeClass("rtcp-mp-dN");
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] video.rtcmediaplayervideo').css("visibility","hidden");
		var pipElement = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-pip-mode-screen');
		pipElement.attr('purpose', 'exitPIP');
		
		var pipButton = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-pip-button');
		pipButton.attr('purpose', 'exitPIP');
		pipButton.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.exitpictureinpicture"));
		mediaPlayerInstance.onPipMode();
		/*if (!document.fullscreenElement) {
			$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-miniplayer-button').css("display", "inline-flex");
			var fullScreenButton = $('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button button');
			fullScreenButton.removeClass('rtcmp-icon-mp-minimise').addClass('rtcmp-icon-mp-maximise');
			$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button').attr('tooltip-title', 'Full Screen (f)');
		}*/
	})

	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] video.rtcmediaplayervideo').on('leavepictureinpicture', this, function (event) {
		var mediaPlayerInstance = event.data;
		mediaPlayerInstance.setLoadedSeekBarPosition(mediaPlayerInstance.getCurrentSeedTime());
		mediaPlayerInstance.setScrubber(mediaPlayerInstance.getCurrentSeedTime());
		var elem = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-setting-button');
		if (elem.hasClass("selected")) 
		{
			mediaPlayerInstance.closePlayerSetting();
		}
		if(($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').hasClass("selected")))
		{
			mediaPlayerInstance.closeSeparatePlayerSetting();
		}
//		if ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-events-container').css('display') != 'none')
//		{
			//mediaPlayerInstance.closeEventContainer()
//		}
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-pip-background').addClass("rtcp-mp-dN");
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] video.rtcmediaplayervideo').css("visibility","");
		var pipElement = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-pip-mode-screen');
		pipElement.attr('purpose', 'gotoPIP');
		
		var pipButton = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-pip-button');
		pipButton.attr('purpose', 'gotoPIP');
		pipButton.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.pictureinpicture"));
		mediaPlayerInstance.onPipModeExit();
		/*if (!document.fullscreenElement) {
			$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-miniplayer-button').css("display", "inline-flex");
			var fullScreenButton = $('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button button');
			fullScreenButton.removeClass('rtcmp-icon-mp-minimise').addClass('rtcmp-icon-mp-maximise');
			$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button').attr('tooltip-title', 'Full Screen (f)');
		}*/
	})
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-view [mp-setting-button][type="checkbox"]').on('change', this, function (event) {
		event.stopPropagation();
		var mediaPlayerInstance = event.data;
		var elem = $(this);
		var purpose = elem.attr("purpose");
		mediaPlayerInstance.handleSettingsToogleEvent[purpose](event, elem, mediaPlayerInstance);
	});
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').on('mousedown', this, function (event) {
		event.stopPropagation();
		if(event.button !=0 )//handle only left click
		{
			return;
		}
		var mediaPlayerInstance = event.data;
		mediaPlayerInstance.isVolumeSliderClicked = true;
		var elem = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-setting-button');
		if (elem.hasClass("selected")) 
		{
			mediaPlayerInstance.closePlayerSetting();
		}
		if(($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').hasClass("selected")))
		{
			mediaPlayerInstance.closeSeparatePlayerSetting();
		}
//		if ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-events-container').css('display') != 'none') {
			//mediaPlayerInstance.closeEventContainer()
//		}
		var callback = function (event) {
			var left = (event.pageX - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').offset().left) * (($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width() - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').width()) / $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width());
			var volume = left / ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width() - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').width());

			volume = volume < 0 ? 0 : volume > 1 ? 1 : volume
					if(volume == 0)
					{
						mediaPlayerInstance.mute(false);
					}
					else
					{
						mediaPlayerInstance._videoInstance.volume = volume	
						$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-volume-area [rtcpmpbutton], #'+mediaPlayerInstance.mediaPlayerDiv+' .rtcp-mp-bezel-player-state .rtcp-mp-bezel').attr('volume',volume);
						mediaPlayerInstance.unMute(false);
					}
			mediaPlayerInstance._videoInstance.volume = volume;
			$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-volume-area [rtcpmpbutton], #'+mediaPlayerInstance.mediaPlayerDiv+' .rtcp-mp-bezel-player-state .rtcp-mp-bezel').attr('volume',volume);
			mediaPlayerInstance.isVolumeSliderClicked = false;
			var dragElem = $(event.target).parents('.rtcp-mp-volume-area');
			if(dragElem.length  == 0)
			{
				setTimeout(function(mediaPlayerInstance){
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-area').removeClass("rtcp-mp-volume-hover");	
					if(mediaPlayerInstance._config.AV=="audio")
					{
						$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayecontrolsmini .playbackspeed-value').css("display","flex");
						$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayecontrolsmini .rtcmp-icon-replay').css("display","flex");
						$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmp-icon-replay-button').css("display","flex");
						$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-download-button').css("display","flex");
						$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-reportabuse').css("display","flex");
						$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-transcript').css("display","flex");
					}
				},3000,mediaPlayerInstance)
			}
		}.bind(mediaPlayerInstance);
		
		var continousCallback = function (event) {
			var left = (event.pageX - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').offset().left) * (($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width() - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').width()) / $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width());
			var volume = left / ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width() - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').width());

			volume = volume < 0 ? 0 : volume > 1 ? 1 : volume
					if(volume == 0)
					{
						mediaPlayerInstance.mute(false);
					}
					else
					{
						mediaPlayerInstance._videoInstance.volume = volume	
						$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-volume-area [rtcpmpbutton], #'+mediaPlayerInstance.mediaPlayerDiv+' .rtcp-mp-bezel-player-state .rtcp-mp-bezel').attr('volume',volume);
						mediaPlayerInstance.unMute(false);
					}
			this._videoInstance.volume = volume;
			$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-area [rtcpmpbutton], #'+this.mediaPlayerDiv+' .rtcp-mp-bezel-player-state .rtcp-mp-bezel').attr('volume',volume);
//			mediaPlayerInstance.isVolumeSliderClicked = false;
		}.bind(mediaPlayerInstance);

		mediaPlayerInstance.dragMediaContainter(event, $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle')[0], {
			xNeeded: true,
			xLimit: {lowerLimit: 0, upperLimit: 58}
		}, callback,continousCallback);
		
	});
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').on('mouseup', this, function (event) {
		//event.stopPropagation();
		var mediaPlayerInstance = event.data;
		var left = (event.pageX - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').offset().left) * (($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width() - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').width()) / $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width());
		var volume = left / ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').width() - $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').width());
		volume = volume < 0 ? 0 : volume > 1 ? 1 : volume
				if(volume == 0)
				{
					mediaPlayerInstance.mute(false);
				}
				else
				{
					mediaPlayerInstance._videoInstance.volume = volume	
					$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-area [rtcpmpbutton], #'+this.mediaPlayerDiv+' .rtcp-mp-bezel-player-state .rtcp-mp-bezel').attr('volume',volume);
					mediaPlayerInstance.unMute(false);
				}
	});
	


//	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').on("mouseenter", this, function (event) {
//		var mediaPlayerInstance = event.data;
//		if($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button .rtcp-mp-playbackspee-options').css("display") == "none")
//			{
//			mediaPlayerInstance.closePlayerSettingAndEventContainer();
//			}
////		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayerbackground').hide();
//	})
//	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').on("mouseup", this, function (event){
//		var mediaPlayerInstance = event.data;
//		$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-playbackspee-options').css("display","flex");
//	})
//	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').on("mousedown", this, function (event){
//		var mediaPlayerInstance = event.data;
//		$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-playbackspee-options').css("display","none");
//	})
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').on('mouseleave', this, function (event) {
		var mediaPlayerInstance = event.data;
//		mediaPlayerInstance.openNewPlaybackSpeedSetting();
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayerbackground').show();
	})
}
RTCMediaPlayerObj.prototype.seekForward = function(){
	if (this.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING) 
	{
		return;
	}

	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').attr('purpose', 'forward');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-seek').attr('purpose', 'forward');
	if(this.view == RTCMediaPlayerConstants.MINIPLAYER)
	{
		var timerId = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').attr("timerid"); 
		if(timerId)
		{
			var el = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-seek');
			if(el && el[0])
			{
				el[0].style.animation = 'none';
				el[0].offsetHeight; /* trigger reflow */
				el[0].style.animation = null; 
			}
			clearInterval(timerId);
		}
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').show();
		timerId = setTimeout(function(mediaPlayerInstance){
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').hide();	
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').attr("timerid","");
		},500,this)
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').attr("timerid",timerId);
	}
	else
	{
		var timerId = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').attr("timerid"); 
		if(timerId)
		{
			clearInterval(timerId);
		}
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').show();
		timerId = setTimeout(function(mediaPlayerInstance){
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').hide();	
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').attr("timerid","");
		},500,this)
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').attr("timerid",timerId);
	}
	var seekTime = 0;
	if(this._videoInstance.ended)
	{
		this._videoInstance.play();
		seekTime = this._videoInstance.currentTime;
	}
	else
	{
		if(this.getDuration())
		{
			seekTime = this._videoInstance.currentTime + 5;
		}
	}

	this._videoInstance.currentTime = seekTime;
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-time-current').html(this.getFormatedTime(this._videoInstance.currentTime))
	this.setLoadedSeekBarPosition(seekTime);
	this.setScrubber(seekTime);
//	if (this._videoInstance.paused) {
//		this.play();
//	} else {
//		this.pause();
//	}
	
}
RTCMediaPlayerObj.prototype.seekBackward  = function(){
	if (this.mode == RTCMediaPlayerConstants.mode.LIVESTREAMING) 
	{
		return;
	}
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').attr('purpose', 'back');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-seek').attr('purpose', 'back');
	if(this.view == RTCMediaPlayerConstants.MINIPLAYER)
	{
		var timerId = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').attr("timerid"); 
		if(timerId)
		{
			var el = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-seek');
			if(el && el[0])
			{
				el[0].style.animation = 'none';
				el[0].offsetHeight; /* trigger reflow */
				el[0].style.animation = null; 
			}
			clearInterval(timerId);
		}
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').show();
		timerId = setTimeout(function(mediaPlayerInstance){
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').hide();	
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').attr("timerid","");
		},500,this)
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-bezel-player-seek-action').attr("timerid",timerId);
	}
	else
	{
		var timerId = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').attr("timerid"); 
		if(timerId)
		{
			clearInterval(timerId);
		}
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').show();
		timerId = setTimeout(function(mediaPlayerInstance){
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').hide();	
			$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').attr("timerid","");
		},500,this)
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-doubletap-ui-legacy').attr("timerid",timerId);
	}
	var seekTime;

	if(this._videoInstance.ended)
	{
		seekTime = this._videoInstance.currentTime - 5;
		this._videoInstance.play();
	}
	else
	{
		seekTime = this._videoInstance.currentTime - 5;
	}
	this._videoInstance.currentTime = seekTime;
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-time-current').html(this.getFormatedTime(this._videoInstance.currentTime))
	this.setLoadedSeekBarPosition(seekTime);
	this.setScrubber(seekTime);
//	if (this._videoInstance.paused) {
//		this.play();
//	} 
//	else {
//		this.pause();
//	}
	if(this._videoInstance.ended)
	{
		this._videoInstance.play();
	}
	
}
RTCMediaPlayerObj.prototype.bindKeyControls = function ()
{
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]').on('keydown', this, function (event) {
		var mediaPlayerInstance = event.data;
		mediaPlayerInstance.onKeyPress(event);
		if(mediaPlayerInstance._config.keycontrols == "disable")
		{
			return;
		}
		if ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-events-search-input').is(':focus')) {
			return;
		}
		switch (event.keyCode) 
		{
			case 39: // right arrow
			{
				mediaPlayerInstance.seekForward();
			}
			break;
			case 37: // left arrow
			{
				mediaPlayerInstance.seekBackward();
			}
			break;
			case 32: //pause
			{
				mediaPlayerInstance.handlePlayPause();
			}
			break;
			case 75: //k key
			{
				mediaPlayerInstance.handlePlayPause();
			}
			break;
			case 73: //i key for mini-player
			{
					if (mediaPlayerInstance.view == RTCMediaPlayerConstants.MINIPLAYER) 
					{
						mediaPlayerInstance.goToDefaultView();
					}
					else if(mediaPlayerInstance.view == RTCMediaPlayerConstants.DEFAULTVIEW)
					{
						mediaPlayerInstance.gotoMiniPlayerView();
					}
			}
			break;
			case 70: //f key
			{
				if (mediaPlayerInstance.view != RTCMediaPlayerConstants.MINIPLAYER) 
				{
					mediaPlayerInstance.handleFullScreen();
				}
			}
			break;
			case 77: //m key
			{
				mediaPlayerInstance.handleMute(true);
			}
			break;
			case 38: //up arrow
			{
				mediaPlayerInstance.handleVolumeChange(mediaPlayerInstance._videoInstance.volume + .2,true);
			}
			break;
			case 40: // down arrow
			{
				var volume = (Math.floor(mediaPlayerInstance._videoInstance.volume * 10)/10) - .2
				mediaPlayerInstance.handleVolumeChange(volume,true);
			}
			break
	
		}
	})
}
RTCMediaPlayerObj.prototype.bindEventSelectPicker = function () 
{
	$('#' + this.mediaPlayerDiv + ' #rtcp-mp-event-Container-SelectPicker').on('changed.bs.select', this, function (e, clickedIndex, isSelected, previousValue) {
		var mediaPlayerInstance = e.data;
		mediaPlayerInstance.loadEventContainer($(this).val());
		$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-events-search-input').val('')
		mediaPlayerInstance.appendContainerHtml();
	});
	$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-search-input').on('keyup', this, function (event) {
		event.preventDefault();
		var mediaPlayerInstance = event.data;
		var searchString = $('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-events-search-input').val().trim();
		mediaPlayerInstance.loadEventContainer(mediaPlayerInstance.getEventsObj().getFilterPlaybackModule(), searchString);
	});
}
RTCMediaPlayerObj.prototype.bindEventHeader = function () {
	$('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-events-search-input').on('keyup', this, function (event) {
		var mediaPlayerInstance = event.data;
		var elem = $('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-setting-button');
		if (elem.hasClass("selected"))
		{
			mediaPlayerInstance.closePlayerSetting();
		}
		if(($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').hasClass("selected")))
		{
			mediaPlayerInstance.closeSeparatePlayerSetting();
		}
		var inputField = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv + '"] .rtcp-mp-events-search-input');
		if(event.keyCode === 27)
		{
			inputField.val("");
		}
		var searchString = inputField.val().trim();
		mediaPlayerInstance.loadEventContainer(mediaPlayerInstance.getEventsObj().getFilterPlaybackModule(), searchString);
	});
}
RTCMediaPlayerObj.prototype.removeBindedEvent= function()
{
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"]');
	elem.off('click');
	elem.off('dblclick');
	elem.off('mouseenter mousemove');
	elem.off('mouseleave');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayervideo').off('mousedown');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayervideo').off('dblclick');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcpdrag').off('mousedown');
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-bookmark-container').off('mouseenter');
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-bookmark-container').off('mouseleave');
	
	$('#' + this.mediaPlayerDiv +' .rtcp-mp-resize-top, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-right, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-bottom, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-left, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-topRight, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-bottomRight, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-bottomLeft, #' + this.mediaPlayerDiv +' .rtcp-mp-resize-topLeft').off('mousedown');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayecontrols').off('click');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container').off('mousedown');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container').off('mouseenter mousemove');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container').off('mouseleave');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-volume-area').off('mouseenter');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .playbackspeed-value').off('mouseenter');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .playbackspeed-close').off('mouseleave');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .audio_playbackspeed-selected').off('mouseenter');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .audio_playbackspeed-selected').off('mouseleave');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-volume-area').off('mouseleave');
	
	$('#'+this.mediaPlayerDiv).off('fullscreenchange webkitfullscreenchange');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] video.rtcmediaplayervideo').off('enterpictureinpicture');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] video.rtcmediaplayervideo').off('leavepictureinpicture');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-view [mp-setting-button][type="checkbox"]').off('change');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-volume-slider-handle').off('mousedown');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-volume-slider').off('mouseup');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').off('mouseleave');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]').off('keydown');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerchapter').off('mouseenter mousemove');
	
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerchapter').on('mouseleave');
}
RTCMediaPlayerObj.prototype.closeMediaPlayer = function (removedefaultdiv = true) 
{
	if(this._playerInstance)
	{
		this._playerInstance.stopLoad();
		this._playerInstance.destroy();
	}
	if (this.loaderIntervalID) 
	{
		clearInterval(this.loaderIntervalID)
		this.loaderIntervalID = undefined;
	}
	if (this.popRequestIntervalID) 
	{
		clearInterval(this.popRequestIntervalID)
		this.popRequestIntervalID = undefined;
	}
	if (this.statintervalID)
	{
		clearInterval(this.statintervalID);
		if(Object.keys(this.stat).length > 0)
		{
			RTCP.sendStats(this,this.stat);
		}
		this.stat = {};
		this.statinterval = undefined;
	}
	if(this.wssStatintervalID)
	{
		clearInterval(this.wssStatintervalID);
		// this.sendStatsToWSS();
		this.wssStatintervalID = undefined;
	}
	if(this._videoInstance)
	{
		this._videoInstance.ontimeupdate = function name(params) {
			
		}
		this._videoInstance.onpause = function()
		{
			
		}
		this._videoInstance.onplay = function(){}
		this._videoInstance.onended = function(){}
		this._videoInstance.onvolumechange = function(){}
		this._videoInstance.onseeked = function() {}
	}
	
	this.onBeforeMediaPlayerClose();
	this.exitPIP();
	this.handleMediaSessionAction(true);
	$("#" + this.mediaPlayerDiv + ' [mediaplayerid="'+this.mediaPlayerDiv+'"]').remove();
	if(removedefaultdiv)
	{
		$("#" + this.mediaPlayerDiv).remove();
	}
	if(!this.isCustomEventDiv())
	{
		$("#" + this.getEventContainerID()).remove();
		this.eventContainerDivID =  undefined;
	}
	$("#" + this.miniPlayerDiv).remove();
	switch (this.mode) 
	{
		case RTCMediaPlayerConstants.mode.LIVESTREAMING:		{
			RTCPRecording.leave(this.sid, this.wssurl, this.x_stateless_auth, this.rtcpFlow ? "/wsrtcp" : "");
		}
		break;
		case RTCMediaPlayerConstants.mode.RECORDING: {
			// RTCPRecording.leave(this.sid, this.wssurl, this.x_stateless_auth, "vod");
		}
		break;

	}
    this.reset();
	delete RTCMediaPlayerObjList[this.mediaPlayerDiv];
	this.mediaPlayerOnClose();
}
RTCMediaPlayerObj.prototype.goLive = function (event, elem, isDefault) 
{
	if (this.mode != RTCMediaPlayerConstants.mode.LIVESTREAMING) 
	{
		return;
	}
	this.closePlayerSettingAndEventContainer();
	if((elem && elem.find('.rtcp-mp-golive-text[rtcp-live-status="golive"]')) || !isDefault)
	{
		this._videoInstance.currentTime = this._videoInstance.duration - 10;
	}
	if(this.isPaused() && this._config.resumePlayerOnGoLive === "enable")
	{
		this.handlePlayPause();
	}
}
RTCMediaPlayerObj.prototype.gotoSeekBarTime = function (event, elem)
{
	//var this = event.data;
	var st = parseFloat(elem.attr("st"));
	var et = parseFloat(elem.attr("et"));
	var mouseTime = st + ((event.pageX - elem.offset().left) * (et - st) / (elem.width()))
	if (this.getEventsObj()) 
	{
		this.getEventsObj().setNextCurrentEventIdFortime(mouseTime)
	}
	if(this._videoInstance.ended)
	{
		this._videoInstance.play();
	}
	this._videoInstance.currentTime = mouseTime; 
	this.setScrubber(mouseTime);
	for (var i = 0; i < this._videoInstance.buffered.length; i++)
	{
		var videoTime = this.getCurrentSeedTime();
		if(this._videoInstance.buffered.start(i) < videoTime)
		{
			this.setBufferedPosition(this._videoInstance.buffered.end(i));
		}
	}
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-time-current').html(this.getFormatedTime(this._videoInstance.currentTime))
	this.setLoadedSeekBarPosition(this._videoInstance.currentTime);
	this.setScrubber(this._videoInstance.currentTime);
//	if (this._videoInstance.paused) {
//		this.play();
//	} else {
//		this.pause();
//	}
}
RTCMediaPlayerObj.prototype.gotoEventTime = function (time) 
{
	this.closePlayerSetting();
	
	if(this._videoInstance.ended)
	{
		this._videoInstance.play();
	}
	
	if (this.getEventsObj()) 
	{
		this.getEventsObj().setNextCurrentEventIdFortime(time)
	}
	this._videoInstance.currentTime = time;
	this.setScrubber(time);
	/*for (var i = 0; i < this._videoInstance.buffered.length; i++) {
		var videoTime = this.getCurrentSeedTime();
		if(this._videoInstance.buffered.start(i) < videoTime)
		{
			this.setBufferedPosition(this._videoInstance.buffered.end(i));
		}
	}*/
	this.setLoadedSeekBarPosition(time);
}
RTCMediaPlayerObj.prototype.openDesc = function (elem)
{
	var parentChapterDOM = elem.closest('.rtcp-mp-events-chapter');
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-events-chapter').removeClass("opendescription");
	$(parentChapterDOM).addClass("opendescription");

	var dom = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-chapter .rtcp-mp-events-chapter-heading-expand div');
	dom.removeClass('rtcmp-icon-mp-newuparrow');
	dom.addClass('rtcmp-icon-mp-newDownArrow');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-chapter .rtcp-mp-events-chapter-heading-expand').attr('purpose','openDesc');
	$(elem).attr('purpose', 'closeDesc');

	var arrowDOM = elem[0].querySelector('.rtcp-mp-events-chapter-heading-expand div');
	arrowDOM.classList.remove('rtcmp-icon-mp-newDownArrow');
	arrowDOM.classList.add('rtcmp-icon-mp-newuparrow');
}
RTCMediaPlayerObj.prototype.closeDesc = function (elem) 
{
	var parentChapterDOM = elem.closest('.rtcp-mp-events-chapter');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-chapter').removeClass("opendescription");
	$(elem).attr('purpose', 'openDesc');
	var arrowDOM = elem[0].querySelector('.rtcp-mp-events-chapter-heading-expand div');
	arrowDOM.classList.add('rtcmp-icon-mp-newDownArrow');
	arrowDOM.classList.remove('rtcmp-icon-mp-newuparrow');
}
RTCMediaPlayerObj.prototype.clearEventsSearchBar = function ()
{
	this.closePlayerSetting();
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-events-search-input').val('');
	this.loadEventContainer(this.getEventsObj().getFilterPlaybackModule());
}
RTCMediaPlayerObj.prototype.gotoEventModule = function (elem) 
{
	this.closePlayerSetting();
	$('#' + this.mediaPlayerDiv + ' .rtcp-events-header-bar[modulename="' + this.getPlayBackindexName() + '"]').removeClass('currentmodule');
	elem.addClass('currentmodule');
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-events-search-input').val('')
	this.loadEventContainer(elem.attr("modulename"));
	this.appendContainerHtml();
}
RTCMediaPlayerObj.prototype.gotoBookmarkTime  = function (event, elem)
{
	var time = elem.attr("mp-time");
	if (this.getEventsObj())
	{
		this.getEventsObj().setNextCurrentEventIdFortime(time)
	}
	this._videoInstance.currentTime = time;
}
RTCMediaPlayerObj.prototype.handlePlayPause = function (elem)
{
	if(this._config.pauseOrPlay == "disable")
	{
		return;
	}
	//$('#' + this.mediaPlayerDiv + ' .rtcpmediaplayerdiv').focus();
	this.focusPlayer();
	/*if (elem && !$(elem).hasClass('rtcmediaplayervideo')) {
		this.previousXPosition = this.currentXPosition;
		this.previousYPosition = this.currentYPosition;
	}*/

	//if ((this.currentXPosition == this.previousXPosition) && (this.currentYPosition == this.previousYPosition)) {

	this.closePlayerSettingAndEventContainer();
	if (this._videoInstance.paused)
	{
		this.play();
	} 
	else
	{
		this.pause();
	}
	//}
}
RTCMediaPlayerObj.prototype.handleMute = function (isBezelNeeded) 
{
	if (this._videoInstance.muted) 
	{
		this.unMute(isBezelNeeded);
	} 
	else 
	{
		this.mute(isBezelNeeded);
	}
}
RTCMediaPlayerObj.prototype.handleVolumeChange = function (volume,isBezelNeeded) 
{
	volume = volume < 0 ? 0 : volume > 1 ? 1 : volume;
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-area [rtcpmpbutton], #'+this.mediaPlayerDiv+' .rtcp-mp-bezel-player-state .rtcp-mp-bezel').attr('volume',volume);
	this._videoInstance.volume = volume;
	if (volume == 0) 
	{
		this.mute(isBezelNeeded);
	} 
	else
	{
		this.unMute(isBezelNeeded);
	}
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-volume-slider-handle').css("left", this._videoInstance.volume * (70 - 12));

}
RTCMediaPlayerObj.prototype.goToDefaultView = function () 
{

	if(this._config.AV == "audio")
	{
//		if((this._config.miniPlayerTop!=undefined && this.view == RTCMediaPlayerConstants.MINIPLAYER) || (this._config.miniPlayerTop == undefined))
//		{
//			this._config.miniPlayerTop = $('#'+this.mediaPlayerDiv).css("top");
//		}
//		if((this._config.miniPlayerLeft!=undefined && this.view == RTCMediaPlayerConstants.MINIPLAYER) || (this._config.miniPlayerLeft==undefined))
//		{
//			 this._config.miniPlayerLeft = $('#'+this.mediaPlayerDiv).css("left"); 
//		}
		
		$('#' + this.mediaPlayerDiv +' .closedContent').css("display","none");
		$('#' + this.mediaPlayerDiv +' .audioOpenContent').css("display","flex");
//		$('#' + this.mediaPlayerDiv +' .rtcp-mp-resize-component').css("display","block");
//		$('#' + this.mediaPlayerDiv +' .rtcmediaplayecontrolsbottomleftcontrols').find('.rtcp_mp_audiovolume').after($('#' + this.mediaPlayerDiv +' .rtcmediaplayecontrolsmini').find('.rtcp-mp-volume-area').detach());
		$('#' + this.mediaPlayerDiv +' .rtcmediaplayecontrolsmini').find('.rtcp-mp-volume-area').detach().appendTo('#' + this.mediaPlayerDiv +' .rtcmediaplayecontrolsbottomleftcontrols .rtcp_mp_audiovolume');
		this.view = RTCMediaPlayerConstants.DEFAULTVIEW;
		$('#' + this.mediaPlayerDiv +'.rtcp-mp-mini-player').css("background-color","none","important");
		$('#' +  this.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").addClass("rtcp-mp-default-player");
		$('#' + this.mediaPlayerDiv +'.rtcp-mp-default-player').css("height",(this.UI.height));
		$('#' + this.mediaPlayerDiv +'.rtcp-mp-default-player').css("width",(this.UI.width));
//		$('#' + this.mediaPlayerDiv +'.rtcp-mp-default-player').css("top",this.UI.audioTop);
//		$('#' + this.mediaPlayerDiv +'.rtcp-mp-default-player').css("left",this.UI.audioLeft);
		this.setLoadedSeekBarPosition(this.getCurrentSeedTime());
		this.setScrubber(this.getCurrentSeedTime());
		return;
	}
	if(this.miniPlayerDiv)
	{
		if(!$('#'+this.mediaPlayerDiv)[0])
		{
			$('body').append('<div class="rtcp-mp-default-player" rtcpmediaplayer id="' + this.mediaPlayerDiv + '" style="z-index:'+this._config.zindex+';top:10%;width:80%;height: 80%;display: block;position: absolute;background-color: black;left:10%;border-radius:8px;"></div>');
		}
		$('#' + this.miniPlayerDiv+' .rtcpmediaplayerdiv').detach().prependTo('#'+this.mediaPlayerDiv);
		$('#' + this.miniPlayerDiv).hide();
		if(!this.isCustomDiv)
		{
			$('#' + this.mediaPlayerDiv).show();
		}
	}

	$('#' + this.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").addClass("rtcp-mp-default-player");
	this.view = RTCMediaPlayerConstants.DEFAULTVIEW;
	/*if(this.UI.initialTop && this.UI.initialLeft && this.UI.initialWidth && this.UI.initialHeight)
	{
		$('#' + this.mediaPlayerDiv).css("top",this.UI.initialTop);
		$('#' + this.mediaPlayerDiv).css("left",this.UI.initialLeft);
		$('#' + this.mediaPlayerDiv).css("width",this.UI.initialWidth);
		$('#' + this.mediaPlayerDiv).css("height",this.UI.initialHeight);
	}*/

	this.setLoadedSeekBarPosition(this.getCurrentSeedTime());
	this.setScrubber(this.getCurrentSeedTime());
//	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]').focus();
	this.focusPlayer();
	this.onDefaultView();
	$('#' + this.mediaPlayerDiv+'.rtcp-mp-default-player .rtcp-mp-resize-component').removeClass("rtcp-mp-dN");
}
RTCMediaPlayerObj.prototype.gotoMiniPlayerView = function ()
{
	if(this._config.minimisePlayer == "disable")
	{
		return;
	}
	if(this._config.AV == "audio")
	{
		this.UI.width = $('#'+this.mediaPlayerDiv).width();
		this.UI.height = $('#'+this.mediaPlayerDiv).height();
//		this.UI.audioTop = $('#'+this.mediaPlayerDiv).css("top");
//		this.UI.audioLeft = $('#'+this.mediaPlayerDiv).css("left"); 

		$('#' + this.mediaPlayerDiv +'.rtcp-mp-default-player').css("height","");
		$('#' + this.mediaPlayerDiv +'.rtcp-mp-default-player').css("width","");
		$('#' + this.mediaPlayerDiv +' .audioOpenContent').css("display","none");
		$('#' + this.mediaPlayerDiv +' .closedContent').css("display","flex");
//		$('#' + this.mediaPlayerDiv +' .rtcp-mp-resize-component').css("display","none");
		$('#' + this.mediaPlayerDiv +' .rtcmediaplayecontrolsbottomleftcontrols').find('.rtcp-mp-volume-area').detach().appendTo('#' + this.mediaPlayerDiv +' .rtcmediaplayecontrolsmini .rtcp_mp_audiovolume')
		this.view = RTCMediaPlayerConstants.MINIPLAYER;
		$('#' +  this.mediaPlayerDiv).removeClass("rtcp-mp-default-player").addClass("rtcp-mp-mini-player");
			
//		$('#' + this.mediaPlayerDiv +'.rtcp-mp-mini-player').css("top",(this._config.miniPlayerTop != undefined) ? this._config.miniPlayerTop : this.UI.audioTop);
//		$('#' + this.mediaPlayerDiv +'.rtcp-mp-mini-player').css("left",( this._config.miniPlayerLeft != undefined) ? this._config.miniPlayerLeft : this.UI.audioLeft);
		
		this.setLoadedSeekBarPosition(this.getCurrentSeedTime());
		this.setScrubber(this.getCurrentSeedTime());
		if(this._config.seperateplaybackspeed != "enable"){
			$('#' + this.mediaPlayerDiv +' .closedContent').css("justify-content","space-between");
		}
		return;
	}
	else
	{
		$('#' + this.mediaPlayerDiv+' .rtcp-mp-resize-component').addClass("rtcp-mp-dN");
	}

	if(!this.miniPlayerDiv )
	{
		this.miniPlayerDiv = this.mediaPlayerDiv + '_'+new Date().getTime();
//		$('body').append('<div id="' +this.miniPlayerDiv+'" class="rtcp-mp-mini-player" rtcpmediaplayer mode="'+this._config.AV+'" style="position:absolute;left:'+((this._config.miniPlayerLeft!=undefined) ? this._config.miniPlayerLeft :'calc(100% - 425px)')+';top:'+((this._config.miniPlayerTop != undefined) ? this._config.miniPlayerTop :'calc(100% - 300px)')+';width: calc(400px);height: calc(300px);display:none;"></div>');
		$('body').append('<div id="' +this.miniPlayerDiv+'" class="rtcp-mp-mini-player" rtcpmediaplayer mode="'+this._config.AV+'" style="position:absolute;left: calc(100% - 425px);top: calc(100% - 300px);width: calc(400px);height: calc(300px);display:none;"></div>');
		$('#' + this.mediaPlayerDiv+' :not([rtcp-mp-event-cont]).rtcpmediaplayerdiv').detach().appendTo('#'+this.miniPlayerDiv);
	}
	else
	{
		$('#'+this.miniPlayerDiv).empty();
		$('#' + this.mediaPlayerDiv+' :not([rtcp-mp-event-cont]).rtcpmediaplayerdiv').detach().appendTo('#'+this.miniPlayerDiv);
	}
	if(this._videoInstance.ended && this._config.pauseOrPlay != "disable")
	{
		$('#' + this.miniPlayerDiv+' .rtcmp-icon-mini-player-hover-state').addClass("rtcmp-icon-mp-replay");
	}
	if(!this.isCustomDiv)
	{
		$('#' + this.mediaPlayerDiv).hide();
	}
	$('#'+this.miniPlayerDiv).show();
	this.closePlayerSettingAndEventContainer();
	//this.UI.top = $('#'+this.mediaPlayerDiv).css("top");
	//this.UI.left = $('#'+this.mediaPlayerDiv).css("left");
//	if(this._config.AV=="audio"){
//		$('#'+this.miniPlayerDiv).css("left","calc(100% - 382px)");
//		$('#'+this.miniPlayerDiv).css("top","calc(100% - 136px)");
//		$('#'+this.miniPlayerDiv).css("width","calc(382px)");
//		$('#'+this.miniPlayerDiv).css("height","calc(136px)");
//	}
//	else{
//		$('#'+this.miniPlayerDiv).css("left","calc(100% - 400px)");
//		$('#'+this.miniPlayerDiv).css("top","calc(100% - 300px)");
//		$('#'+this.miniPlayerDiv).css("width","calc(400px)");
//		$('#'+this.miniPlayerDiv).css("height","calc(300px)");
//	}
	$('#'+this.miniPlayerDiv).show();
	//$('#' + this.mediaPlayerDiv).removeClass("rtcp-mp-default-player").addClass("rtcp-mp-mini-player");
	this.view = RTCMediaPlayerConstants.MINIPLAYER;
	this.setLoadedSeekBarPosition(this.getCurrentSeedTime());
	this.setScrubber(this.getCurrentSeedTime());
//	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]').focus();
	this.focusPlayer();
	this.onMiniplayer();
}
RTCMediaPlayerObj.prototype.gotoFullScreen = function()
{
	if (!document.fullscreenElement && !document.webkitCurrentFullScreenElement)
	{
		this.closePlayerSettingAndEventContainer();
		var videoContainer = $('#' + this.mediaPlayerDiv)[0];
		/*var fullScreenButton = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button button');
		var videoContainer = $('#' + this.mediaPlayerDiv)[0];
		fullScreenButton.removeClass('rtcmp-icon-mp-maximise').addClass('rtcmp-icon-mp-minimise');
		fullScreenButton.attr('purpose', 'expandMediaplayer');
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button').attr('tooltip-title', 'Minimise (f)')
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-miniplayer-button').hide();

		this.view = RTCMediaPlayerConstants.FULLSCREEN;
		$('#' + this.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").removeClass("rtcp-mp-default-player").addClass("rtcp-mp-fullscn-player");*/
		if (videoContainer.requestFullscreen)
		{
			videoContainer.requestFullscreen();
		} 
		else if (videoContainer.mozRequestFullScreen) /* Firefox */
		{
			videoContainer.mozRequestFullScreen();
		}
		else if (videoContainer.webkitRequestFullscreen)  /* Chrome, Safari and Opera */
		{
			videoContainer.webkitRequestFullscreen();
		}
		else if (videoContainer.msRequestFullscreen)  /* IE/Edge */
		{
			videoContainer.msRequestFullscreen();
		}
	}
}
RTCMediaPlayerObj.prototype.exitFullscreen = function()
{
	if(document.fullscreenElement || document.webkitCurrentFullScreenElement)
	{
		this.closePlayerSettingAndEventContainer();
		var videoContainer = $('#' + this.mediaPlayerDiv)[0];
		/*var fullScreenButton = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button button');
		var videoContainer = $('#' + this.mediaPlayerDiv)[0];
		fullScreenButton.removeClass('rtcmp-icon-mp-minimise').addClass('rtcmp-icon-mp-maximise');
		fullScreenButton.attr('purpose', 'gotoFullScreen');
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button').attr('tooltip-title', 'Full Screen (f)')
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-miniplayer-button').css("display", "inline-flex");

		this.view = RTCMediaPlayerConstants.DEFAULTVIEW;
		$('#' + this.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").removeClass("rtcp-mp-fullscn-player").addClass("rtcp-mp-default-player");*/
		if (document.exitFullscreen) 
		{
			document.exitFullscreen();
		} 
		else if (document.mozCancelFullScreen) 
		{
			document.mozCancelFullScreen();
		} 
		else if (document.webkitExitFullscreen)  
		{
			document.webkitExitFullscreen();
		} 
		else if (document.msExitFullscreen)  
		{
			document.msExitFullscreen();
		}
	}
}
RTCMediaPlayerObj.prototype.handleFullScreen = function () 
{

	if(this._config.maximisePlayer == "disable")
	{
		return;
	}
	if (!document.fullscreenElement && !document.webkitCurrentFullScreenElement)
	{
		this.gotoFullScreen();
	}
	else
	{
		this.exitFullscreen();
	}





	/*if (fullScreenButton.hasClass('rtcmp-icon-mp-maximise')) {
		fullScreenButton.removeClass('rtcmp-icon-mp-maximise').addClass('rtcmp-icon-mp-minimise');
		fullScreenButton.attr('purpose', 'expandMediaplayer');
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button').attr('tooltip-title', 'Minimise (f)')
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-miniplayer-button').hide();

		/*this.view = RTCMediaPlayerConstants.FULLSCREEN;
		$('#' + this.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").removeClass("rtcp-mp-default-player").addClass("rtcp-mp-fullscn-player");
		if (videoContainer.requestFullscreen) {
			videoContainer.requestFullscreen();
		} else if (videoContainer.mozRequestFullScreen) 
		{
			videoContainer.mozRequestFullScreen();
		} else if (videoContainer.webkitRequestFullscreen) 
		{
			videoContainer.webkitRequestFullscreen();
		} else if (videoContainer.msRequestFullscreen) 
		{
			videoContainer.msRequestFullscreen();
		}
	} else {

		fullScreenButton.removeClass('rtcmp-icon-mp-minimise').addClass('rtcmp-icon-mp-maximise');
		fullScreenButton.attr('purpose', 'gotoFullScreen');
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-fullscreen-button').attr('tooltip-title', 'Full Screen (f)')
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-miniplayer-button').css("display", "inline-flex");
		/*this.view = RTCMediaPlayerConstants.DEFAULTVIEW;
		$('#' + this.mediaPlayerDiv).removeClass("rtcp-mp-mini-player").removeClass("rtcp-mp-fullscn-player").addClass("rtcp-mp-default-player");
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) 
		{
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen)  
		{
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen)  
		{
			document.msExitFullscreen();
		}
	}*/
	this.setLoadedSeekBarPosition(this.getCurrentSeedTime());
	this.setScrubber(this.getCurrentSeedTime());
	//$('#' + this.mediaPlayerDiv + ' .rtcpmediaplayerdiv').focus();
//	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]').focus();
	this.focusPlayer();

}
RTCMediaPlayerObj.prototype.handlePictureInPicture = function()
{
	if(this._config.pictureInPicture == "disable")
	{
		return;
	}
	this.closePlayerSettingAndEventContainer();

	var pipButton = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-pip-button');
	if (pipButton.attr('purpose') == "gotoPIP") 
	{
		this.gotoPIP();
	} 
	else 
	{
		this.exitPIP();
	}
	this.setLoadedSeekBarPosition(this.getCurrentSeedTime());
	this.setScrubber(this.getCurrentSeedTime());
	//$('#' + this.mediaPlayerDiv + ' .rtcpmediaplayerdiv').focus();
//	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]').focus();
	this.focusPlayer();
}
RTCMediaPlayerObj.prototype.gotoPIP = function()
{
	//var pipButton = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-pip-button');
	if(this._config.AV == "audio")
	{
		var videoElement = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] audio.rtcmediaplayervideo')[0];
	}
	else
	{
		var videoElement = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] video.rtcmediaplayervideo')[0];
	}
	if(document.pictureInPictureEnabled && videoElement && !videoElement.disablePictureInPicture) 
	{
		try {

			if (document.pictureInPictureElement && $(document.pictureInPictureElement).closest('[mediaplayerid="' + this.mediaPlayerDiv +'"]').length==0) 
			{
				document.exitPictureInPicture();
			}
			videoElement.requestPictureInPicture().then((pictureInPictureWindow) => {
			}).catch((error) => {
			});;
			//pipButton.attr('purpose', 'exitPIP');
			//pipButton.attr('tooltip-title', 'Exit PiP Mode')
		} catch(err) {
			//console.error(err);
		}
	}
}
RTCMediaPlayerObj.prototype.exitPIP = function()
{
	//var pipButton = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-pip-button');
	var videoElement;
	if(this._config.AV == "audio")
	{
		videoElement = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] audio.rtcmediaplayervideo')[0];
	}
	else
	{
		var videoElement = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] video.rtcmediaplayervideo')[0];
	}
	if(document.pictureInPictureEnabled && videoElement && !videoElement.disablePictureInPicture) 
	{
		try {
			if (document.pictureInPictureElement && $(document.pictureInPictureElement).closest('[mediaplayerid="' + this.mediaPlayerDiv +'"]').length!=0) 
			{
				document.exitPictureInPicture().then((pictureInPictureWindow) => {
					//console.log("pictureInPictureWindow",pictureInPictureWindow);
				}).catch((error) => {
					//console.log("error")
				});
				//pipButton.attr('purpose', 'gotoPIP');
				//pipButton.attr('tooltip-title', 'PiP Mode')
			}
		} catch(err) {
			//console.error(err);
		}
	}
}
RTCMediaPlayerObj.prototype.setScrubber = function (time) 
{
	if (this.isScrubberMoving) 
	{
		return;
	}
	var translateX = time * ($('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').width() / this._videoInstance.duration);
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-scrubber-container').css("left", "calc(" + translateX + "px - "+(RTCMediaPlayerConstants.UI.scrubberWidth/2)+"px)")
}
RTCMediaPlayerObj.prototype.setLoadedSeekBarPosition = function (time)
{
	if(this.getDuration())
	{
		if(this._config.AV == "audio" && this.view == RTCMediaPlayerConstants.MINIPLAYER)
		{
			var root = document.querySelector(':root');
			var rootStyle = getComputedStyle(root);
			$('#' + this.mediaPlayerDiv +' .audio-progressbar-close').css("background-image","conic-gradient("+rootStyle.getPropertyValue('--rtcp-mp-primary-color')+" "+ this._videoInstance.currentTime*(360/this._videoInstance.duration) +"deg,transparent 0)");
			return;
		}
		var chapterDiv = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerbackground').find('.rtcmediaplayerchapter');
		time = parseFloat(time);
		for (var i = 0; i < chapterDiv.length; i++)
		{
			var chap = $(chapterDiv[i]);
				if (time >= parseFloat(chap.attr("st")) && time <= parseFloat(chap.attr("et"))) 
				{
					$(chap.find('.rtcmediaplayerloadedprogress')[0]).css("transform", "scaleX(" + (time - chap.attr("st")) / (chap.attr("et") - chap.attr("st")) + ")")
				}
				else if (time >= parseFloat(chap.attr("et"))) 
				{
					$(chap.find('.rtcmediaplayerloadedprogress')[0]).css("transform", "scaleX(1)")
				}
				else 
				{
					$(chap.find('.rtcmediaplayerloadedprogress')[0]).css("transform", "scaleX(0)")
				}
		}
	}
}
RTCMediaPlayerObj.prototype.setBufferedPosition = function (time) 
{
	time = parseFloat(time);
	if(this._config.AV == "audio" && this.view == RTCMediaPlayerConstants.MINIPLAYER)
	{
				if (time >= this._videoInstance.currentTime) 
				{
					if(this.getDuration())
					{
						var calc = time*(360/this.getDuration());
						var root = document.querySelector(':root');
						var rootStyle = getComputedStyle(root);
						$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .audio-buffer-close').css("background-image","conic-gradient("+rootStyle.getPropertyValue('--rtcp-mp-seek-buffer-bg-color')+" "+calc+"deg,transparent 0)")
					} 
				}
				return;
	}
	var chapterDiv = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerbackground').find('.rtcmediaplayerchapter');
	time = parseFloat(time);
	for (var i = 0; i < chapterDiv.length; i++) 
	{
		var chap = $(chapterDiv[i]);
			if (time >= parseFloat(chap.attr("st")) && time <= parseFloat(chap.attr("et"))) 
			{
				$(chap.find('.rtcmediaplayerbufferprogress')[0]).css("transform", "scaleX(" + (time - chap.attr("st")) / (chap.attr("et") - chap.attr("st")) + ")")
			}
			else if (time >= parseFloat(chap.attr("et"))) 
			{
				$(chap.find('.rtcmediaplayerbufferprogress')[0]).css("transform", "scaleX(1)")
			}
			else 
			{
				$(chap.find('.rtcmediaplayerbufferprogress')[0]).css("transform", "scaleX(0)")
			}
	}
}
RTCMediaPlayerObj.prototype.setSeekBarHoverPosition = function (time) 
{
	var chapterDiv = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerbackground').find('.rtcmediaplayerchapter');
//	this.setScrubber(this.getCurrentSeedTime());
	for (var i = 0; i < chapterDiv.length; i++) 
	{
		var chap = $(chapterDiv[i]);
		if (time >= chap.attr("st") && time <= chap.attr("et")) 
		{
			var hoverLength = (time - chap.attr("st")) / (chap.attr("et") - chap.attr("st"));
			$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("transform", "scaleX(" + hoverLength + ")")
			var bufferLength = parseFloat(chap.find('.rtcmediaplayerbufferprogress')[0].style.transform.slice(7, -1));
			if (hoverLength <= bufferLength) 
			{
//				$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("background", "#d1d1d1")
				$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("background", "var(--rtcp-mp-seek-hover-bg-color)")
			} 
			else 
			{
				bufferLength = bufferLength * (100 / (hoverLength * 100))
				//$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("background", "linear-gradient(90deg, #d1d1d1 " + (bufferLength * 100) + "%, #767676 " + (bufferLength * 100) + "%)")
				$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("background", "var(--rtcp-mp-seek-hover-bg-color)")
			}

		} 
		else if (time >= chap.attr("et")) 
		{
			var hoverLength = 1;
			var bufferLength = parseFloat(chap.find('.rtcmediaplayerbufferprogress')[0].style.transform.slice(7, -1));
			$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("transform", "scaleX(" + hoverLength + ")")

			if (hoverLength <= bufferLength) 
			{
				//$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("background", "#d1d1d1")
				$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("background", "var(--rtcp-mp-seek-hover-bg-color)");
			} 
			else
			{
				bufferLength = bufferLength * (100 / (hoverLength * 100))
				//$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("background", "linear-gradient(90deg, #d1d1d1 " + (bufferLength * 100) + "%, #767676 " + (bufferLength * 100) + "%)")
				$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("background", "var(--rtcp-mp-seek-hover-bg-color)")
			}
		} 
		else 
		{
			$(chap.find('.rtcmediaplayerhoverprogress')[0]).css("transform", "scaleX(0)")
		}

	}
}
RTCMediaPlayerObj.prototype.bindSeekBar = function () 
{

	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerchapter').on('mouseenter mousemove', this, function (event) {
		var mediaPlayerInstance = event.data;
		if(mediaPlayerInstance._config.tooltip == "disable")
		{
			return;
		}
		var elmt = $(this);
		var st = parseFloat(elmt.attr("st"));
		var et = parseFloat(elmt.attr("et"));
		var mouseTime = st + ((event.pageX - elmt.offset().left) * (et - st) / (elmt.width()))
		mediaPlayerInstance.setSeekBarHoverPosition(mouseTime);
		var left = 0
		var bottom =0
		bottom = $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').height() + 20;
		if(mediaPlayerInstance._config.AV == "video")
		{
			left = event.pageX - ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').width() / 2) - mediaPlayerInstance._videoInstance.getBoundingClientRect().left;
			left = left < 0 ? 0 : left > $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-video-cont').width() - 162 - 12 ? $('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-video-cont').width() - 162 - 12 : left;
		}
		else if(mediaPlayerInstance._config.AV == "audio")
		{
			left = event.pageX - ($('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').width() / 2) - document.querySelector('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar').getBoundingClientRect().left;
			bottom = bottom - 15;
		}
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').css("left", left);
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').css("bottom", bottom);
		
		if (mediaPlayerInstance._config.events== "enable" && mediaPlayerInstance.getEventsObj() && mediaPlayerInstance.getPlayBackindex() && mediaPlayerInstance.getPlayBackindex()[Math.floor(st)])
		{
			if (mediaPlayerInstance.getEventsObj().filterPlaybackModule == RTCMediaPlayerConstants.category.ACTIVESPEAKER) 
			{
				var eventData = mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventData();
				var userId = eventData.userid.split("_")[2];
				var userImgUrl = mediaPlayerInstance.getUserImgForPlayBack(userId, eventData.username);
				var tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent(eventData.username, mediaPlayerInstance.getFormatedTime(mouseTime),(userImgUrl)?true:false)
				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip-bg').show();
				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip-bg').css('background-image', 'url(' + userImgUrl + '), url(' + mediaPlayerInstance.getFallBackUserImgForPlayBack(userId, eventData.username) + ')');
			} 
			else if (mediaPlayerInstance.getEventsObj().filterPlaybackModule == RTCMediaPlayerConstants.category.TRANSCRIPTION) 
			{
                var eventData = mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventData();
				var userId = eventData.userid.split("_")[2];
				var userImgUrl = mediaPlayerInstance.getUserImgForPlayBack(userId, eventData.username);
				var tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent(eventData.username || "", mediaPlayerInstance.getFormatedTime(mouseTime),(userImgUrl)?true:false)
				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip-bg').show();
				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip-bg').css('background-image', 'url(' + userImgUrl + '), url(' + mediaPlayerInstance.getFallBackUserImgForPlayBack(userId, eventData.username) + ')');
			} 
			else 
			{
				var tooltipContentHtml = "";
				tooltipContentHtml = mediaPlayerInstance.getTooltipContent(mediaPlayerInstance.getFormatedTime(mouseTime), mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventID(), mediaPlayerInstance.getEventsObj().filterPlaybackModule, mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventData());
				
				if (!tooltipContentHtml) 
				{
					var info = mediaPlayerInstance.getInfoCardToEnterCard(mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventID(), mediaPlayerInstance.getEventsObj().filterPlaybackModule, mediaPlayerInstance.getPlayBackindex()[Math.floor(st)][0].getEventData())
					if (info && info.title && info.username)
					{
						//$('#' +mediaPlayerInstance.mediaPlayerDiv +' .rtcp-mp-tooltip-title').html(info.title);
						tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent(RTCMediaPlayerConstants.processXSS(info.title), mediaPlayerInstance.getFormatedTime(mouseTime), false)
					} 
					else
					{
						tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent("", mediaPlayerInstance.getFormatedTime(mouseTime), false)
					}

				}
				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
			}
		} 
		else 
		{
			var tooltipContentHtml = "";
			tooltipContentHtml = mediaPlayerInstance.getTooltipContent(mediaPlayerInstance.getFormatedTime(mouseTime),null,null,null);
			if (!tooltipContentHtml) 
			{
				if(mediaPlayerInstance._config.AV == "video")
				{
					tooltipContentHtml = RTCMediaPlayerTemplates.getMediaPlayerTooltipContent(mediaPlayerInstance.title, mediaPlayerInstance.getFormatedTime(mouseTime), false)
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
				}
				else if(mediaPlayerInstance._config.AV == "audio")
				{
					$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').text(mediaPlayerInstance.getFormatedTime(mouseTime));
				}
			}
			else
			{
				$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').empty().append(tooltipContentHtml);
			}
		}
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').removeClass('dN');
	});
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerchapter').on('mouseleave', this, function (event) {
		var mediaPlayerInstance = event.data;
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcp-mp-tooltip.rtcp-mp-bottom.rtcp-mp-preview').removeClass('dN').addClass('dN');
		$('[mediaplayerid="' + mediaPlayerInstance.mediaPlayerDiv +'"] .rtcmediaplayerbackground .rtcmediaplayerchapter .rtcmediaplayerhoverprogress').css('background', '')
	});
}
RTCMediaPlayerObj.prototype.closePlayerSettingAndEventContainer = function ()
{
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"]');
	if (elem.find(' .rtcp-mp-setting-button').hasClass("selected")) 
	{
		this.closePlayerSetting();
	}
	if(($('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').hasClass("selected")))
	{
		this.closeSeparatePlayerSetting();
	}
//	if (elem.find('.rtcp-mp-events-container').css('display') != 'none') 
//	{
		//this.closeEventContainer()
//	}
	this.closeNewPlaybackSpeedSetting();
//	this.closeSeparatePlayerSetting();
}
RTCMediaPlayerObj.prototype.getFormatedTime = function (time) 
{
	var hour = 0;
	var min = 0;
	var sec = 0;
	var strTime = "";
	if (time > 0 && time !== Infinity)
	{
		if (time > ((60 * 60) - 1)) 
		{
			hour = Math.floor(time / (60 * 60));
			min = Math.floor((time % (60 * 60)) / 60);
			sec = Math.floor(time % 60);
		} 
		else
		{
			if (time > 59)
			{
				min = Math.floor(time / 60);
				sec = Math.floor(time % 60);
			} 
			else 
			{
				sec = Math.floor(time);
			}
		}
		if (hour > 0) 
		{
			if (hour < 10) 
			{
				hour = "0" + hour;
			}
			strTime = hour
		}
		if (min < 10) 
		{
			min = "0" + min;
		}
		if (strTime) 
		{
			strTime += ":";
		}
		strTime += min;
		if (sec < 10)
		{
			sec = "0" + sec;
		}
		strTime += ":" + sec;
		return strTime;
	}
	return "00:00";
}
RTCMediaPlayerObj.prototype.dragMediaContainter = function (event, elmnt, criteria, callback, continousCallback) 
{
	var startPositionX = 0, startPositionY = 0, endPostionX = 0, endPositionY = 0;
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	event = event || window.event;
	event.preventDefault();
	// get the mouse cursor position at startup:
	pos3 = event.clientX;
	pos4 = event.clientY;
	startPositionX = pos3;
	startPositionY = pos4;
	endPostionX = startPositionX;
	endPositionY = startPositionY
	//$(document).on("mousemove",elementDrag)
	document.onmouseup = closeDragElement;
	// call a function whenever the cursor moves:
	document.onmousemove = elementDrag;

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		var left = (elmnt.offsetLeft - pos1);
		var top = (elmnt.offsetTop - pos2);
		// set the element's new position:
		if (criteria) 
		{
			if (criteria.xNeeded) 
			{
				if (criteria.xLimit) 
				{
					if (criteria.xLimit.lowerLimit > left)
					{
						left = criteria.xLimit.lowerLimit
					}
					else if (criteria.xLimit.upperLimit < (left+elmnt.offsetWidth)) 
					{
						left = criteria.xLimit.upperLimit - elmnt.offsetWidth
					}
				}
				if (criteria.translateX) 
				{
					elmnt.style.transform = "translateX(" + left + "px)"
				} 
				else 
				{
					elmnt.style.left = left + "px";
				}
				endPostionX = left;
			}
			if (criteria.yNeeded) 
			{
				if (criteria.yLimit) 
				{
					if (criteria.yLimit.lowerLimit > top) 
					{
						top = criteria.yLimit.lowerLimit
					} 
					else if (criteria.yLimit.upperLimit < (top + elmnt.offsetHeight)) 
					{
						top = criteria.yLimit.upperLimit - elmnt.offsetHeight
					}
				}
				if (criteria.translateY)
				{
					elmnt.style.transform = "translateY(" + top + "px)"
				} 
				else 
				{
					elmnt.style.top = top + "px";
				}
				endPositionY = top;
			}
			if (continousCallback && (typeof continousCallback == "function")) 
			{
				continousCallback(e, left, top);
			}
		}
	}

	function closeDragElement(e) {
		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
		if (callback) 
		{
			if ((startPositionX != endPostionX) && (startPositionY != endPositionY)) 
			{
				callback(e, true);
			} 
			else 
			{
				callback(e, false);
			}
		}
	}
}
RTCMediaPlayerObj.prototype.resizeMediaContainer = function(event, elmnt, criteria, callback, continousCallback)
{
	// Query the element
	//const ele = document.getElementById('resizeMe');

	// The current position of mouse
	let x = event.clientX;;
	let y = event.clientY;

	// The dimension of the element
	let w = 0;
	let h = 0;

	const styles = window.getComputedStyle(elmnt);
	w = parseInt(styles.width, 10);
	h = parseInt(styles.height, 10);

	/*// Handle the mousedown event
	// that's triggered when user drags the resizer
	const mouseDownHandler = function (e) {
	    // Get the current mouse position
	    x = e.clientX;
	    y = e.clientY;

	    // Calculate the dimension of element
	    const styles = window.getComputedStyle(ele);
	    w = parseInt(styles.width, 10);
	    h = parseInt(styles.height, 10);

	    // Attach the listeners to `document`
	    document.addEventListener('mousemove', mouseMoveHandler);
	    document.addEventListener('mouseup', mouseUpHandler);
	};*/

	var elmntCoordinates = elmnt.getBoundingClientRect();

	const mouseMoveHandler = function (e) {
		// How far the mouse has been moved
		const dx = e.clientX - x;
		const dy = e.clientY - y;

		var newWidth = undefined;
		var newHeight = undefined;
		var left = undefined;
		var top = undefined;
		var width = undefined;
		var height = undefined;

		var isChanged = false;

		var topLowerLimit = 0;
		var topHigerLimit = 0;
		//var rightLowerLimit = criteria?.right?.lowerLimit ? criteria?.right?.lowerLimit : 0;
		//var rightHigerLimit = criteria?.right?.higherLimit ? criteria?.right?.higherLimit : 0;
		//var bottomLowerLimit = criteria?.bottom?.lowerLimit ? criteria?.bottom?.lowerLimit : 0;
		//var bottomHigherLimit = criteria?.bottom?.higherLimit ? criteria?.bottom?.higherLimit : 0;
		var leftLowerLimit = 0;
		var leftHigerLimit = 0;
		if(criteria)
		{
			if(criteria.top)
			{
				if(criteria.top.lowerLimit)
				{
					topLowerLimit = criteria.top.lowerLimit;
				}
				if(criteria.top.higherLimit)
				{
					topHigerLimit = criteria.top.higherLimit;
				}
			}
			if(criteria.left)
			{
				if(criteria.left.lowerLimit)
				{
					leftLowerLimit = criteria.left.lowerLimit;
				}
				if(criteria.left.higherLimit)
				{
					leftHigerLimit = criteria.left.higherLimit;
				}
			}
		}
		var left = undefined;
		var top = undefined;
		var width = undefined;
		var height = undefined;
		//var mediaPlayerInstance = e.data;

		switch(criteria.side)
		{
		case "top":
		{
			newWidth = w - dy;
			newHeight = h - dy;
			if(e.clientY > topLowerLimit && leftHigerLimit > (elmntCoordinates.left + newWidth))
			{
				//elmnt.style.top = `${e.clientY}px`;
				top = e.clientY;
				//elmnt.style.width = `${newWidth}px`;
				//elmnt.style.height = `${newHeight}px`;
				isChanged = true;
			}
		}
		break;

		case "topRight":
		{
			newWidth = w + dx;
			newHeight = h - dy;
			//elmnt.style.top = `${e.clientY}px`;
			top = e.clientY;
			//elmnt.style.width = `${newWidth}px`;
			//elmnt.style.height = `${newHeight}px`;
			if(e.clientY > topLowerLimit && leftHigerLimit > (elmntCoordinates.left + newWidth))
			{
				isChanged = true;
			}
		}
		break;

		case "right": 
		{
			newWidth = w + dx;
			newHeight = h + dx;
			if(e.clientX < leftHigerLimit && topHigerLimit > (elmntCoordinates.top + newHeight))
			{
				//elmnt.style.width = `${newWidth}px`;
				//elmnt.style.height = `${newHeight}px`;
				isChanged = true;
			}
		}
		break;

		case "bottomRight":
		{
			newWidth = w + dx;
			newHeight = h + dy;
			//elmnt.style.width = `${newWidth}px`;
			//elmnt.style.height = `${newHeight}px`;
			if(e.clientX < leftHigerLimit && topHigerLimit > (elmntCoordinates.top + newHeight))
			{
				isChanged = true;
			}
		}
		break;

		case "bottom" :
		{
			newWidth = w + dy;
			newHeight = h + dy;
			if(e.clientY < topHigerLimit && leftHigerLimit > (elmntCoordinates.left + newWidth))
			{
				//elmnt.style.width = `${newWidth}px`;
				//elmnt.style.height = `${newHeight}px`;
				isChanged = true;
			}
		}
		break;

		case "bottomLeft":
		{
			newWidth = w - dx;
			newHeight = h + dy;
			//elmnt.style.width = `${newWidth}px`;
			//elmnt.style.height = `${newHeight}px`;
			//elmnt.style.left = `${e.clientX}px`;
			left = e.clientX;
			if(e.clientX > leftLowerLimit && topHigerLimit > (elmntCoordinates.top + newHeight))
			{
				isChanged = true;
			}
		}
		break;

		case "left" :
		{
			newWidth = w - dx;
			newHeight = h - dx;
			if(e.clientX > leftLowerLimit && topHigerLimit > (elmntCoordinates.top + newHeight))
			{
				//elmnt.style.left = `${e.clientX}px`;
				left = e.clientX;
				//elmnt.style.width = `${newWidth}px`;
				//elmnt.style.height = `${newHeight}px`;
				isChanged = true;
			}
		}
		break;

		case "topLeft": 
		{
			newWidth = w - dx;
			newHeight = h - dy;
			//elmnt.style.top = `${e.clientY}px`;
			//elmnt.style.left = `${e.clientX}px`;
			top = e.clientY;
			left = e.clientX;
			//elmnt.style.width = `${newWidth}px`;
			//elmnt.style.height = `${newHeight}px`;
			if(e.clientY > topLowerLimit && leftLowerLimit < e.clientX)
			{
				isChanged = true;
			}
		}
		break;
		}
		// Adjust the dimension of element
		if(isChanged)
		{
			if(newWidth)
			{
				if(!(criteria && criteria.widthLimit && ((criteria.widthLimit.lowerLimit && criteria.widthLimit.lowerLimit > newWidth) || (criteria && criteria.heightLimit && (criteria.widthLimit.upperLimit && criteria.widthLimit.upperLimit < newWidth)))))
				{
					if(left)
					{
						elmnt.style.left = `${left}px`;
					}
					elmnt.style.width = `${newWidth}px`; 
					width = `${newWidth}`;
				}
			}
			if(newHeight)
			{
				if(!(criteria && criteria.heightLimit && ((criteria.heightLimit.lowerLimit && criteria.heightLimit.lowerLimit > newHeight) || (criteria && criteria.heightLimit && criteria.heightLimit.upperLimit && criteria.heightLimit.upperLimit < newHeight))))
				{
					if(top)
					{
						elmnt.style.top = `${top}px`;
					}
					elmnt.style.height = `${newHeight}px`;	
					height = `${newHeight}`;
				}
			}	
			if (continousCallback && (typeof continousCallback == "function"))
			{
				continousCallback(e,top,left,width,height);
			}
		}
	};

	const mouseUpHandler = function (e) {
		// Remove the handlers of `mousemove` and `mouseup`
		document.removeEventListener('mousemove', mouseMoveHandler);
		document.removeEventListener('mouseup', mouseUpHandler);
		if (callback && (typeof callback == "function")) 
		{
			var attr = window.getComputedStyle(elmnt);
			var width = parseInt(attr.width, 10);
			var height = parseInt(attr.height, 10);
			callback(e,e.clientY,e.clientX,width,height);
		}
	};
	document.addEventListener('mousemove', mouseMoveHandler);
	document.addEventListener('mouseup', mouseUpHandler);

}
RTCMediaPlayerObj.prototype.setCustomEventContainerID = function (eventContainerDivID)
{
	this.isCustomEventContainer = true;
	this.setEventContainerID(eventContainerDivID);
}

RTCMediaPlayerObj.prototype.setEventContainerID = function (eventContainerDivID)
{
	if(eventContainerDivID)
	{
		this.eventContainerDivID=eventContainerDivID
	}
}
RTCMediaPlayerObj.prototype.getEventContainerID = function (eventContainerDivID)
{
	return this.eventContainerDivID
}

RTCMediaPlayerObj.prototype.isCustomEventDiv = function ()
{
	return this.isCustomEventContainer;
}

RTCMediaPlayerObj.prototype.openEventContainer = function (event,elem,isCustomDOM = false) 
{
	if(this.isCustomEventDiv() && !isCustomDOM)
	{
		this.handleCustomEventContainerOpen()
		return;
	}
	//eventContainerDivID
	//$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-container').css('left', $('#' + this.mediaPlayerDiv + ' .rtcp-mp-chapter-container').position().left)
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-chapter').removeClass("opendescription");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-events-header-bar[modulename="' + this.getPlayBackindexName() + '"]').addClass('currentmodule')
	if (this.getEventsObj()) 
	{
		this.loadEventContainer(this.getEventsObj().getFilterPlaybackModule());
		moduleNameRealValue = RTCPMediaPlayerResource.getRealValue(this.getEventsObj().getFilterPlaybackModule(),this);
		var placeHolder = RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.events.search")+' ' +moduleNameRealValue;
		document.querySelector('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-container .rtcp-mp-events-search-input').placeholder = placeHolder;
	}
	//$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-chapter-button button').removeClass("rtcmp-icon-allchats").addClass("rtcmp-icon-unreadchats");
	if ($('#'+ this.getEventContainerID() +' [mediaplayerid="' + this.mediaPlayerDiv +'"]').css("display") == "none") 
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-chapter-container[rtcpmpbutton]').attr('purpose', 'closeEventsContainer');
		//$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-container').show();
		//$('#' + this.eventContainerDivID).show();
		this.setScrollForEventsContainer();
		$('#'+ this.getEventContainerID() +' [mediaplayerid="' + this.mediaPlayerDiv +'"]').show();
		this.addTraverseDomIfNeeded();
		$('#'+ this.getEventContainerID() +' [mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-search-input').focus();
		var elem = ($('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-chapter[track="current"] .rtcp-mp-events-chapter-heading-expand[purpose="openDesc"]'));
		
		if(elem && elem[0])
		{
			this.openDesc(elem);
		}
	}
	this.setTraverseState();
}
RTCMediaPlayerObj.prototype.closeEventContainer = function (event,elem,isCustomDOM = false) 
{
	if(this.isCustomEventDiv() && !isCustomDOM)
	{
		this.handleCustomEventContainerClose()
		return;
	}
	
	if ($('#'+ this.getEventContainerID() +' [mediaplayerid="' + this.mediaPlayerDiv +'"]').css('display') != 'none') 
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-chapter-container[rtcpmpbutton]').attr('purpose', 'openEventsContainer');
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-chapter').removeClass("opendescription");
		//$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-chapter-button button').removeClass("rtcmp-icon-unreadchats").addClass("rtcmp-icon-allchats");
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-search-input').val('')
		//$('#' + this.eventContainerDivID).hide();
		$('#'+ this.getEventContainerID() +' [mediaplayerid="' + this.mediaPlayerDiv +'"]').hide();
	}
	this.closeNewPlaybackSpeedSetting();
	this.closeSeparatePlayerSetting();
}
RTCMediaPlayerObj.prototype.openCustomEventContainer = function()
{
	this.openEventContainer(null,null,true);
}
RTCMediaPlayerObj.prototype.closeCustomEventContainer = function ()
{
	this.closeEventContainer(null,null,true);
}
RTCMediaPlayerObj.prototype.setDuration = function (duration) 
{
	if(!duration)
	{
		return;
	}

	this.duration = duration;

	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-time-duration');

	if(!elem.length)
	{
		return;
	}

	elem.html(this.getFormatedTime(duration));
}
RTCMediaPlayerObj.prototype.getDuration = function () 
{
	return this.duration;
}
RTCMediaPlayerObj.prototype.setPlayBackRate = function (elem, rate) 
{
	if (rate) 
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-subview.selected .rtcp-mp-setting-viewrow').removeClass('currentsetting')
		elem.addClass('currentsetting');
		this._videoInstance.playbackRate = rate;
		this.closePlayerSettingAndEventContainer()
		this.onPlayBackSpeedChange(rate);
	}
}
RTCMediaPlayerObj.prototype.getPlaybackrate = function () 
{
	return this._videoInstance.playbackRate;
}
RTCMediaPlayerObj.prototype.closePlayerSetting = function () 
{
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-button');
	elem.attr('purpose', 'openSetting');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-button, [mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-view, [mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-mainview, [mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-subview').removeClass("selected")
	this.closeNewPlaybackSpeedSetting();
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar .rtcp-mp-snapshot').css("display","inline-flex");
}
RTCMediaPlayerObj.prototype.openplayerSetting = function () 
{
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-button');
	elem.attr('purpose', 'closeSetting');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').removeClass("selected");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-pb-rate-text').text(this._videoInstance.playbackRate == 1 ? RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed.normal") : this._videoInstance.playbackRate + 'x');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-button, #' + this.mediaPlayerDiv + ' .rtcp-mp-setting-view, #' + this.mediaPlayerDiv + ' .rtcp-mp-setting-mainview').addClass("selected")
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcpmediaplayerseekbar .rtcp-mp-snapshot').css("display","none");
	var selectedQuality = this.getSelectedQuality();
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-qualityrate-text').text(this._playerInstance.autoLevelEnabled ? RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.quality.auto") : selectedQuality.key);
	
	var languageNames = new Intl.DisplayNames(["en"], { type: "language" });
	if(this._config.subtitleInSettings == "enable" && this.subtitles && this.subtitles.length>0)
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subtitle-text').text(this._playerInstance.subtitleTrack == -1 ? RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitle.off") :languageNames.of(this.subtitles[this._playerInstance.subtitleTrack+1]))
		subtitleText = (RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitlecc")+"("+this.subtitles.length+")");
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtc-mp-subtitle-setting .rtcp-mp-setting-view-lhs').text(subtitleText);
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtc-mp-subtitle-setting .rtcp-mp-setting-view-rhs').css("display","flex");
	}
	else
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtc-mp-subtitle-setting .rtcp-mp-setting-view-rhs').css("display","none");
		subtitleText = (RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitlecc")+"(0)");
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtc-mp-subtitle-setting .rtcp-mp-setting-view-lhs').text(subtitleText);
	}
	if(this._config.audioTrackInSettings == "enable" && this.audioTracks && this.audioTracks.length > 0)
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-audiotrack-text').text(languageNames.of(this.audioTracks[this._playerInstance.audioTrack]));
		audioTrackText = (RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.audiotrack")+" ("+this.audioTracks.length+")");
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtc-mp-audiotrack-setting .rtcp-mp-setting-view-lhs').text(audioTrackText);
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtc-mp-audiotrack-setting .rtcp-mp-setting-view-rhs').css("display","flex");
	}
	else
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtc-mp-audiotrack-setting .rtcp-mp-setting-view-rhs').css("display","none");
		audioTrackText = (RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.audiotrack")+" (0)");
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtc-mp-audiotrack-setting .rtcp-mp-setting-view-lhs').text(audioTrackText);
	}
}

RTCMediaPlayerObj.prototype.openSeparatePlayerSetting = function () 
{
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-player-speed-button');
	elem.attr('purpose', 'closePlayBackSetting');
	elem.addClass("selected");
	elem.attr("tooltip-title","");
	if ($('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-button').hasClass("selected"))
	{
		this.closePlayerSetting();
	}
//	this.openNewPlaybackSpeedSetting();
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button .rtcp-mp-playbackspee-options').css("display","flex");
}
RTCMediaPlayerObj.prototype.closeSeparatePlayerSetting = function () 
{
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button');
	elem.attr('purpose', 'openPlayBackSetting');
//	this.closeNewPlaybackSpeedSetting();
	elem.removeClass("selected");
	elem.attr("tooltip-title",RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed"));
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button .rtcp-mp-playbackspee-options').css("display","none");
}
RTCMediaPlayerObj.prototype.download = function (event ,elem)
{
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"]');
	if (elem.find(' .rtcp-mp-setting-button').hasClass("selected")) 
	{
		this.closePlayerSetting();
	}
	if(($('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-player-speed-button').hasClass("selected")))
	{
		this.closeSeparatePlayerSetting();
	}
//	if (elem.find('.rtcp-mp-events-container').css('display') != 'none') 
//	{
		//this.closeEventContainer()
//	}
	this.onDownload(event , elem);
}
RTCMediaPlayerObj.prototype.openPlaybackSetting = function () 
{
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-mainview').removeClass("selected");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').addClass("selected");
	var html = "";
	html += RTCMediaPlayerTemplates.getMediaPlayerSettingsBackDiv();
	html += '<div class="rtcp-mp-pb-view scrollbar">'
		for (var i = 0; i < RTCMediaPlayerConstants.playbackSpeed.length; i++)
		{
			html += RTCMediaPlayerTemplates.getMediaPlayerPlackbackSettings(RTCMediaPlayerConstants.playbackSpeed[i], this._videoInstance.playbackRate);
		}
	html += '</div>';
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').empty().append(html);
}
RTCMediaPlayerObj.prototype.closePlaybackSetting = function () 
{
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-subview').removeClass("selected");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-mainview').addClass("selected");
}
RTCMediaPlayerObj.prototype.setDeltaValue = function (deltaValue) 
{
	if (deltaValue) 
	{
		this.deltaValue = deltaValue
	}
}
RTCMediaPlayerObj.prototype.getDeltaValue = function () 
{
	return this.deltaValue;
}
RTCMediaPlayerObj.prototype.setCurrentChapter = function (time) 
{
	var chapters = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-events-chapter')
	for (var i = 0; i < chapters.length; i++) 
	{
		var stime = chapters[i].getAttribute('mp-start-time');
		var etime = chapters[i].getAttribute('mp-end-time');
		if (time >= stime && time < etime) 
		{
			var percentageCompleted = ((time - stime) / (etime - stime)) * 100;
			chapters[i].setAttribute('track', 'current');
			//chapters[i].style.background = 'linear-gradient(90deg, transparent ' + percentageCompleted + '%, #141414 ' + percentageCompleted + '%)';
			$(chapters[i]).find('.rtcp-mp-events-chapter-seek-status').css('width',percentageCompleted+'%');
		} 
		else if (time < stime) 
		{
			chapters[i].setAttribute('track', 'forward');
			//chapters[i].style.background = '';
			$(chapters[i]).find('.rtcp-mp-events-chapter-seek-status').css('width','0px');
		} 
		else if (time > etime) 
		{
			chapters[i].setAttribute('track', 'past');
			//chapters[i].style.background = '';
			$(chapters[i]).find('.rtcp-mp-events-chapter-seek-status').css('width','0px');
		}
	}
}
RTCMediaPlayerObj.prototype.showAnnotation =  function (category, show) 
{
	if (!show) 
	{
		if (category == RTCMediaPlayerConstants.category.ANNOTATIONS) 
		{
			$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerbackground .rtcp-mp-annotation-container').remove();
		} 
		else if (category == RTCMediaPlayerConstants.category.BOOKMARKS) 
		{

			$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcmediaplayerbackground .rtcp-mp-bookmark-container').remove();
		}
		return;
	}
	if (this.getEventsObj() && this.getEventsObj().getModuleObjectsAsMap()[category]) 
	{
		var moduleObject = this.getEventsObj().getModuleObjectsAsMap()[category];
		var html = '';
		for (var i = 0; i < moduleObject.moduleData.length; i++) 
		{
			var eventObject = moduleObject.moduleData[i];
			var offsetTime = eventObject.getOffsetTime();

			var translateX = offsetTime * (100 / this._videoInstance.duration);
			if (category == RTCMediaPlayerConstants.category.ANNOTATIONS) 
			{
				html += RTCMediaPlayerTemplates.getMediaplayerAnnotationConatainer('calc(' + translateX + '% - 6.5px)', offsetTime);
			} 
			else if (category == RTCMediaPlayerConstants.category.BOOKMARKS) 
			{
				html += RTCMediaPlayerTemplates.getMediaplayerBookmarkConatainer('calc(' + translateX + '% - 6.5px)', offsetTime)
			}
		}
		if (html) 
		{
			if (category == RTCMediaPlayerConstants.category.ANNOTATIONS) 
			{
				$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerbackground .rtcp-mp-annotation-container').remove();
			}
			else if (category == RTCMediaPlayerConstants.category.BOOKMARKS) 
			{

				$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayerbackground .rtcp-mp-bookmark-container').remove();
			}
			if(this._config.seekbar != "disable")
			{
				$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcmediaplayerbackground').append(html);
				this.bindAnnotationAndBookmark()
			}
		}
	}
}
RTCMediaPlayerObj.prototype.handleSettingsToogleEvent = {
		toogleAnnotation : function (event, elem, mediaplayerObj) {
			if ($('#' + mediaplayerObj.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-annotation-setting').hasClass('rtcp-mp-annotation-active')) 
			{
				$('#' + mediaplayerObj.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-annotation-setting').removeClass('rtcp-mp-annotation-active');
				mediaplayerObj.showAnnotation(RTCMediaPlayerConstants.category.ANNOTATIONS, false);
			}
			else 
			{
				$('#' + mediaplayerObj.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-annotation-setting').addClass('rtcp-mp-annotation-active');
				mediaplayerObj.showAnnotation(RTCMediaPlayerConstants.category.ANNOTATIONS, true);
			}
		},
		toogleBookmark : function (event, elem, mediaplayerObj) {
			if ($('#' + mediaplayerObj.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-bookmark-setting').hasClass('rtcp-mp-bookmark-active')) 
			{
				$('#' + mediaplayerObj.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-bookmark-setting').removeClass('rtcp-mp-bookmark-active');
				mediaplayerObj.showAnnotation(RTCMediaPlayerConstants.category.BOOKMARKS, false);
			} 
			else 
			{
				$('#' + mediaplayerObj.mediaPlayerDiv + ' .rtcp-mp-setting-mainview .rtc-mp-bookmark-setting').addClass('rtcp-mp-bookmark-active');
				mediaplayerObj.showAnnotation(RTCMediaPlayerConstants.category.BOOKMARKS, true);
			}
		}

}
RTCMediaPlayerObj.prototype.bindAnnotationAndBookmark = function () 
{
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-bookmark-container').on('mouseenter', this, function (event) {
		event.stopPropagation();
		var mediaPlayerInstance = event.data;
		var elem = $(this);
		var time = elem.attr('mp-time');
		var eventObject = mediaPlayerInstance.getEventsObj().getModuleObjectsAsMap()[RTCMediaPlayerConstants.category.BOOKMARKS].offSetVsDataMap[time][0];
		var text = eventObject.getEventData().msg ? eventObject.getEventData().msg : null;
		if (text) 
		{
			$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-annotation-text-preview').text(text)
			var left = elem.position().left;
			var width = $('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-annotation-text-preview').width() / 2;
			left = left - width;
			left = left < 0 ? 0 : left > $($('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-progress-bar-container')[0]).width() - width ? $($('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-progress-bar-container')[0]).width() - (width) : left
					$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-annotation-text-preview').css('left', left);
			$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-annotation-text-preview').removeClass('dN');
		}
	});
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-bookmark-container').on('mouseleave', this, function (event) {
		event.stopPropagation();
		var mediaPlayerInstance = event.data;
		var elem = $(this);
		$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-annotation-text-preview').addClass('dN');
	});
}
RTCMediaPlayerObj.prototype.handleAnnotationAndBookmark = function ()
{
	if ($('#' + this.mediaPlayerDiv + ' .rtc-mp-annotation-setting').hasClass('rtcp-mp-annotation-active')) 
	{
		this.showAnnotation(RTCMediaPlayerConstants.category.ANNOTATIONS, true);
	}
	if ($('#' + this.mediaPlayerDiv + ' .rtc-mp-bookmark-setting').hasClass('rtcp-mp-bookmark-active'))
	{
		this.showAnnotation(RTCMediaPlayerConstants.category.BOOKMARKS, true);
	}
}
RTCMediaPlayerObj.prototype.setPlayerTitle = function (title) 
{
	if (typeof title !== "string") 
	{
		return;
	}
	title = RTCMediaPlayerConstants.processXSS(title);
	this.title = title;
	if (this._config.title == "disable") 
	{
		return;
	}
	if(this.mediaPlayerDiv && $('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-title').length != 0)
	{
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-title .rtcp-mp-video-title-text').empty().text(title);
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-video-title .rtcp-mp-video-title-text').attr('tooltip-header-title', title);
	}
	
}

RTCMediaPlayerObj.prototype.getPlayerTitle = function()
{
	return this.title;
}

RTCMediaPlayerObj.prototype.setActualDuration= function(duration)
{
	this.actualDuration = duration;
}

RTCMediaPlayerObj.prototype.getActualDuration= function()
{
	return this.actualDuration;
}
RTCMediaPlayerObj.prototype.setScrollForEventsContainer = function () 
{
	this.closePlayerSetting();
	var time = this.getCurrentSeedTime();
	var index = [];
	for (var offset in this.getPlayBackindex())
	{
		for (var k = 0; k < this.getPlayBackindex()[offset].length; k++) 
		{
			index.push(parseFloat(offset));
		}
	}
	index = index.sort(function (a, b) {
		return a - b
	});
	var length = index.length;
	var offset = null;
	for (var i = 0; i < length; i++) 
	{
		if (index[i + 1] && (index[i] <= time && index[i + 1] >= time)) 
		{
			offset = index[i];
			break;
		} 
		else if (!index[i + 1] && index[0] < time)
		{
			offset = index[i];
			break;
		}
	}
	if (!offset) 
	{
		if (index[0]) 
		{
			offset = index[0];
		}
	}
	if (offset) 
	{
		var chapterIndex = index.indexOf(offset);
		var containerHeight = $($('#' + this.mediaPlayerDiv + ' .rtcp-mp-events-content')[0]).prop('scrollHeight')

		var scrollHeight = (containerHeight / length) * chapterIndex;
		//$($('#'+this.mediaPlayerDiv+' .rtcp-mp-events-content')[0]).scrollTop(scrollHeight)

		$($('#' + this.mediaPlayerDiv + ' .rtcp-mp-events-content')[0]).animate({
			scrollTop: scrollHeight
		}, {duration: 1000, easing: 'swing'});
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-sync-container').css('display', 'none')
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-events-content').off('scroll');
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-events-content').one('scroll', this, function (e) {
			var mediaPlayerInstance = e.data;
			$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-sync-container').css('display', 'flex')
		});
	}
}
RTCMediaPlayerObj.prototype.setStatusTextForLiveStreaming = function () 
{
	if (this.mode != RTCMediaPlayerConstants.mode.LIVESTREAMING) 
	{
		return;
	}
	if (((this._videoInstance.duration) - (this._videoInstance.currentTime)) > 20) 
	{
		this.handleGoLive();
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-golive-button .rtcp-mp-golive-text').attr('rtcp-live-text', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.livestream.golive"))
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-golive-button .rtcp-mp-golive-text').attr('rtcp-live-status', "golive");
	} 
	else 
	{
		this.handleLive();
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-golive-button .rtcp-mp-golive-text').attr('rtcp-live-text', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.livestream.live"))
		$('#' + this.mediaPlayerDiv + ' .rtcp-mp-golive-button .rtcp-mp-golive-text').attr('rtcp-live-status', "live");
	}
}
RTCMediaPlayerObj.prototype.getSessionCurrentTimeForStreaming = function () 
{
	if (this._playerInstance) 
	{
		var playingFragMent = this._playerInstance.streamController.fragPlaying;
		if (typeof playingFragMent === "undefined" || !playingFragMent || !playingFragMent.sn) 
		{
			return;
		}
		var playingFragMentNumber = playingFragMent.sn;
		if (playingFragMentNumber !== this._playingFragmentNumber) 
		{
			this._playingFragmentTimeInSecs = 0;
			this._playingFragmentStartTime = 0;
			this._playingFragmentNumber = playingFragMentNumber;
		}

		var currentTime = new Date().getTime();
		if (this._playingFragmentStartTime === 0 || (currentTime - this._playingFragmentStartTime) >= 1000)
		{
			this._playingFragmentStartTime = currentTime;
			this._playingFragmentTimeInSecs++;
		}
		var programDateTime = playingFragMent.tagList[1][1];
		//2020-01-20T17:53:43.000+0530
		var timeZoneSeparator = programDateTime.indexOf("+") !== -1 ? "+" : "-";
		//+
		var timeZoneIndex = programDateTime.lastIndexOf(timeZoneSeparator);
		//2020-01-20T17:53:43.000+05 + ":" + 30
		var modifiedProgramDateTime = programDateTime.slice(0, timeZoneIndex + 3) + ":" + programDateTime.slice(timeZoneIndex + 3);
		var modifiedProgramDateTimeInMillis = new Date(modifiedProgramDateTime).getTime();

		return modifiedProgramDateTimeInMillis + (this._playingFragmentTimeInSecs * 1000);
	}
}

RTCMediaPlayerObj.prototype.getDataFromManifest = function()
{
	if(this.mode !== RTCMediaPlayerConstants.mode.LIVESTREAMING || !this._playerInstance)
	{
		return;
	}

	var playerInstance = this._playerInstance;
	var currentLevel = playerInstance.loadLevel;

	if(!playerInstance.levels || !playerInstance.levels[currentLevel] || !playerInstance.levels[currentLevel].details ||
		!playerInstance.levels[currentLevel].details.fragments || !playerInstance.levels[currentLevel].details.fragments[0] ||
		!playerInstance.levels[currentLevel].details.fragments[0].tagList)
	{
		return;
	}

	var tagList = playerInstance.levels[currentLevel].details.fragments[0].tagList;

	for(var index = 0; index < tagList.length; index++)
	{
		var key = tagList[index][0];
		var value = tagList[index][1];

		if(key !== "EXT-X-DATERANGE")
		{
			continue;
		}

		var valueArr = value.split(",");

		for(var valueIndex = 0; valueIndex < valueArr.length; valueIndex++)
		{
			var headerArr = valueArr[valueIndex].split("=");
			var headerKey = headerArr[0];
			var headerValue = headerArr[1].replaceAll('"', '');

			if(headerKey === 'X-VIEWER-COUNT' && headerValue !== '$viewer_count$')
			{
				this.setViewerCount(headerValue);
			}

			if(headerKey === "X-SESSION-COUNT" && headerValue !== '$session_count$')
			{
				this.setSessionCount(headerValue);
			}

			if(headerKey === "X-WSS-SWITCH-URL")
			{
				var switchUrl;

				if(headerValue !== "$wss_switch_url$")
				{
					switchUrl = headerValue.startsWith("https://") ? headerValue : "https://" + headerValue;
				}

				this.setManifestSwitchUrl(switchUrl);
			}

			if(headerKey === "X-CONFERENCE-STARTTIME" && headerValue)
			{
				this.setConferenceStartTime(headerValue);
			}

			if(headerKey === "X-WSS-POP-URL")
			{
				var popUrl;

				if(headerValue !== "$wss_pop_url$")
				{
					popUrl = headerValue.startsWith("https://") ? headerValue : "https://" + headerValue;
				}

				this.setManifestPopUrl(popUrl);
			}
		}

		break;
	}
}

RTCMediaPlayerObj.prototype.getConferenceStartTime = function()
{
	return this.conferenceStartTime;
}

RTCMediaPlayerObj.prototype.setConferenceStartTime = function(startTime) {
	if(!startTime || typeof startTime !== "string" || startTime === this.conferenceStartTime)
	{
		return;
	}

	this.conferenceStartTime = startTime;
}

RTCMediaPlayerObj.prototype.setManifestSwitchUrl = function(url)
{
	if(this.manifestSwitchUrl === url)
	{
		return;
	}

	this.manifestSwitchUrl = url;
}

RTCMediaPlayerObj.prototype.getManifestSwitchUrl = function()
{
	return this.manifestSwitchUrl;
}

RTCMediaPlayerObj.prototype.hasManifestSwitchUrl = function()
{
	return typeof this.manifestSwitchUrl !== "undefined";
}

RTCMediaPlayerObj.prototype.getManifestPopUrl = function()
{
	return this.manifestPopUrl;
}

RTCMediaPlayerObj.prototype.hasManifestPopUrl = function()
{
	return typeof this.manifestPopUrl === "string";
}

RTCMediaPlayerObj.prototype.setManifestPopUrl = function(url)
{
	if(url === this.manifestPopUrl)
	{
		return;
	}

	this.manifestPopUrl = url;
}

RTCMediaPlayerObj.prototype.getCurrentTimefromFragment = function () 
{
	if (this.mode != RTCMediaPlayerConstants.mode.LIVESTREAMING) 
	{
		return;
	}
	if (this._videoInstance.paused || this._videoInstance.readyState == 0 || this._videoInstance.readyState == 1 || this._videoInstance.readyState == 2) 
	{
		return;
	}

	var playerInstance = this._playerInstance;
	var playingFragMent = playerInstance.streamController.fragPlaying;
	var hlsStartDateTime = this.getConferenceStartTime();  //2020-01-20T17:53:43.000+0530

	if (typeof playingFragMent === "undefined" || !playingFragMent || !playingFragMent.sn || !hlsStartDateTime) 
	{
		return;
	}
	var playingFragMentNumber = playingFragMent.sn;

	if (playingFragMentNumber !== this._playingFragmentNumber) 
	{
		this._playingFragmentTimeInSecs = 0;
		this._playingFragmentStartTime = 0;
		this._playingFragmentNumber = playingFragMentNumber;
	}

	var currentTime = new Date().getTime();
	if (this._playingFragmentStartTime === 0 || (currentTime - this._playingFragmentStartTime) >= 1000) 
	{
		this._playingFragmentStartTime = currentTime;
		this._playingFragmentTimeInSecs++;
	}

	var playingFragDateTime = playingFragMent.tagList[1][1];	//2020-01-20T17:53:43.000+0530
	var timeZoneSeparator = playingFragDateTime.indexOf("+") !== -1 ? "+" : "-";		//+
	var timeZoneIndex = playingFragDateTime.lastIndexOf(timeZoneSeparator);
	//2020-01-20T17:53:43.000+05 + ":" + 30
	var modifiedPlayingFragDateTime = playingFragDateTime.slice(0, timeZoneIndex + 3) + ":" + playingFragDateTime.slice(timeZoneIndex + 3);
	timeZoneSeparator = hlsStartDateTime.indexOf("+") !== -1 ? "+" : "-";		//+
	timeZoneIndex = hlsStartDateTime.lastIndexOf(timeZoneSeparator);
	//2020-01-20T17:53:43.000+05 + ":" + 30
	var modifiedhlsStartDateTime = hlsStartDateTime.slice(0, timeZoneIndex + 3) + ":" + hlsStartDateTime.slice(timeZoneIndex + 3);

	var playingTimer = ((new Date(modifiedPlayingFragDateTime) - new Date(modifiedhlsStartDateTime) + (this._playingFragmentTimeInSecs * 1000)) / 1000);
	//console.log(this.getFormatedTime(playingTimer));
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-time-current').html(this.getFormatedTime(playingTimer));
	this.setCurrentSeedTime(playingTimer);
	return playingTimer;
}

RTCMediaPlayerObj.prototype.updateCenterBezel= function (purpose) 
{
	if(!purpose)
	{
		return;
	}
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-bezel-player-state .rtcp-mp-bezel-player-purpose').attr('purpose', purpose);
	var timerId = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-bezel-player-state').attr("timerid"); 
	if(timerId)
	{
		var el = $('#' + this.mediaPlayerDiv +' .rtcp-mp-bezel.rtcp-mp-bezel-player-purpose');
		if(el && el[0])
		{
			el[0].style.animation = 'none';
			el[0].offsetHeight; /* trigger reflow */
			el[0].style.animation = null; 
		}
		clearInterval(timerId);
	}
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-bezel-player-state').css("display","flex");
	
	timerId = setTimeout(function(mediaPlayerInstance){
		$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-bezel-player-state').css("display","none");	
		$('#' + mediaPlayerInstance.mediaPlayerDiv + ' .rtcp-mp-bezel-player-state').attr("timerid","");
	},500,this)
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-bezel-player-state').attr("timerid",timerId);
}
RTCMediaPlayerObj.prototype.openNewPlaybackSpeedSetting = function()
{
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-player-speed-button').attr("purpose","closePlayBackSetting");/*"closeNewPlaybackSpeedSetting");*/
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-playbackspee-options').addClass("selected");
}
RTCMediaPlayerObj.prototype.closeNewPlaybackSpeedSetting = function()
{
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-player-speed-button').attr("purpose","openPlayBackSetting");/*"openNewPlaybackSpeedSetting");*/
	$('#' + this.mediaPlayerDiv + ' .rtcp-mp-playbackspee-options').removeClass("selected");
}

RTCMediaPlayerObj.prototype.setNewPlaybackSpeed = function(event,elem)
{
	var playbackspeed = elem.attr("playbackspeed");
	this._videoInstance.playbackRate = playbackspeed;
	$('#' + this.mediaPlayerDiv +' .rtcp-mp-playback-item-container').removeClass('rtcp-mp-playback-item-container-active');
	$('#' + this.mediaPlayerDiv +' .rtcp-mp-playback-item-container[playbackspeed="'+playbackspeed+'"]').addClass('rtcp-mp-playback-item-container-active');
	$('#' + this.mediaPlayerDiv +' .playbackspeed-value').text(playbackspeed+'x');
	$('#' + this.mediaPlayerDiv +' .rtcp-mp-speed-icon-text').text(playbackspeed+'x');
	this.closeNewPlaybackSpeedSetting();
	this.closeSeparatePlayerSetting();
	this.onPlayBackSpeedChange(playbackspeed);
}

RTCMediaPlayerObj.prototype.loop = function(event,elem,mediaPlayerInstance)
{
	if(this._videoInstance.loop)
	{
		this._videoInstance.loop = false ;
		$('#' + this.mediaPlayerDiv +' .rtcmp-icon-replay').removeClass('active');
	}
	else
	{
		this._videoInstance.loop = true;
		$('#' + this.mediaPlayerDiv +' .rtcmp-icon-replay').addClass('active');
	}
}

RTCMediaPlayerObj.prototype.focusPlayer = function()
{
	var preventScroll = this._config.preventScrollOnFocus === "enable";

	$('[mediaplayerid="' + this.mediaPlayerDiv + '"]').each(function(index, elem) {
		elem.focus({
			preventScroll : preventScroll
		});
	});
}

RTCMediaPlayerObj.prototype.setStatelessAuthHeader = function(stateless_auth)
{
	if(stateless_auth)
	{
		this.x_stateless_auth = stateless_auth;
	}
}

RTCMediaPlayerObj.prototype.getMediaPlayerDivID = function()
{
	return this.mediaPlayerDiv;
}

/*RTCMediaPlayerObj.prototype.addDownloadTime = function(fileName, downloadTime)
{
	this.downloadTimeMap[fileName]= downloadTime;
}
RTCMediaPlayerObj.prototype.clearDownloadTimeMap = function()
{
	this.downloadTimeMap={};
}

RTCMediaPlayerObj.prototype.addBufferTime = function(fileName, bufferTime)
{
	this.bufferTimeMap[fileName]= bufferTime;
}

RTCMediaPlayerObj.prototype.clearBufferTimeMap = function()
{
	this.bufferTimeMap={};
}

RTCMediaPlayerObj.prototype.addParsingTime = function(fileName, parsingTime)
{
	this.parsingTimeMap[fileName]= parsingTime;
}

RTCMediaPlayerObj.prototype.clearParsingTimeMap = function()
{
	this.parsingTimeMap={};
}*/

RTCMediaPlayerObj.prototype.handleReactions = function(msgObj)
{
	var reactions = msgObj;
	if(this.view == RTCMediaPlayerConstants.MINIPLAYER)
	{
		var containerwidth = $('#'+this.miniPlayerDiv).width();
	}
	else
	{
		var containerwidth = $('#'+this.mediaPlayerDiv).width();
	}
	
	var maxReactionSlotsForUI = containerwidth >= this.maxPlayerWidthForSlots ? 8 : containerwidth >= Math.floor((this.maxPlayerWidthForSlots * 3)/4) ? 4: 2; // 2 is for >=700 our minimum width is 700. 1400=> default player width=1476.8 , 1150 = 700 + (1400 - 700)/2

	var maxReactionSlots = maxReactionSlotsForUI * 2;
	
	var totalReactionsCount = 0;
	for(var reaction in reactions)
	{
		var reactionsCount = parseInt(reactions[reaction]);
		totalReactionsCount += reactionsCount;
	}
	
	if(totalReactionsCount <= 0)
	{
		return;
	}
	
	var scaledReactions = {};
	for(var reaction in reactions)
	{
		if(totalReactionsCount > maxReactionSlots)
		{
			scaledReactions[reaction] = Math.max(Math.floor((parseInt(reactions[reaction])/totalReactionsCount) * maxReactionSlots), 1);
		}
		else
		{
			scaledReactions[reaction] = parseInt(reactions[reaction]);
		}
	}
	
	var scaledReactionsArray = [];
	for(var reaction in scaledReactions)
	{
		scaledReactionsArray = scaledReactionsArray.concat(new Array(scaledReactions[reaction]).fill(reaction));
	}
	
	var coefficient = 1;
	var currentIndex = 0;
	function showReactions(mediaPlayerInstance)
	{
		var loopMaxLimit = maxReactionSlotsForUI * coefficient;
		while(currentIndex <= scaledReactionsArray.length && currentIndex < loopMaxLimit)
		{
			mediaPlayerInstance.showReaction({
				customData : { smileyCode : scaledReactionsArray[currentIndex] }
			}, coefficient);
			currentIndex ++;
		}
		coefficient ++;
	}
	
	setTimeout(showReactions, 0,this);
	if(scaledReactionsArray.length > maxReactionSlotsForUI * coefficient)
	{
		setTimeout(showReactions, 500,this);
	}
}
RTCMediaPlayerObj.prototype.showReaction = function(data, rowOrder)
{
	var smileyCode = data.customData.smileyCode;
	var isCustomSticker = false;
	if(typeof(RTCPSmiley) == "undefined")
	{
		return;
	}
	if(!RTCPSmiley.regexp.test(smileyCode))
	{
		//isCustomSticker = CustomSmiley.CUSTOM_STICKER_REGEX.test(smileyCode);
		isCustomSticker = false;
		if(!isCustomSticker){
			return;
		}
	}
	if(this.view == RTCMediaPlayerConstants.MINIPLAYER)
	{
		var reactionViewContainer = $('#'+this.miniPlayerDiv+' .rtcp-mp-reactionview-cnt');
	}
	else
	{
		var reactionViewContainer = $('#'+this.mediaPlayerDiv+' .rtcp-mp-reactionview-cnt');
	}

	var containerwidth = reactionViewContainer.width();
	var maxReactionSlotsForUI = containerwidth >= this.maxPlayerWidthForSlots ? 8 : containerwidth >= Math.floor((this.maxPlayerWidthForSlots * 3)/4) ? 4: 2;

	var currentOrder = reactionViewContainer.attr("currentOrder");
	if(typeof currentOrder === "undefined")
	{
		currentOrder = 0;
	}
	else
	{
		currentOrder = parseInt(currentOrder);
		currentOrder ++;
		currentOrder = currentOrder % maxReactionSlotsForUI;
	}
	
	var reactionElem = RTCPJQuery(RTCMediaPlayerTemplates.getReactionItemHtml(currentOrder, smileyCode, false));
	reactionViewContainer.append(reactionElem);
	
	var reactionPosition = this.getReactionPosition(reactionViewContainer, reactionElem, currentOrder, rowOrder,maxReactionSlotsForUI);
	reactionElem.css({left : reactionPosition.left});
	reactionElem.handleAnimationEndZR();
	
	if(reactionPosition.isAtRightEdge)
	{
		//restarts order
		currentOrder = -1;
	}
	
	reactionViewContainer.attr("currentOrder", currentOrder);
}

RTCMediaPlayerObj.prototype.getReactionPosition = function(reactionViewContainer, reactionElem, order, rowOrder,maxReactionSlotsForUI)
{			
	var optionSetwidth = 0;
	var optionSetPosition = {left : reactionViewContainer.outerWidth()/2 + reactionViewContainer.offset().left}
	
	
	var reactionElemWidth = reactionElem.outerWidth();
	
	var isLeft = order % 2 === 0;
	
	var coefficient = Math.floor(order / 2) + 1;
	var diff = coefficient * (reactionViewContainer.outerWidth()/maxReactionSlotsForUI) ;
	
	if(typeof rowOrder !== "undefined" && rowOrder % 2 === 0)
	{
		//alternate diffs
		diff = diff - 45;
	}
	var isAtLeftEdge = false;
	var isAtRightEdge = false;
	
	var left = 20;
	
	if(isLeft)
	{
		left = (reactionViewContainer.outerWidth()/2) - diff;
		if(left <20){
			isAtLeftEdge = true;
			left = 20;
		}
	}
	else
	{
		var reactionViewContainerWidth = reactionViewContainer.outerWidth();
		left = ( (reactionViewContainer.outerWidth()/2) + diff)- reactionElemWidth;
		
		var rightEdge = reactionViewContainerWidth  - 20;
		if(left > rightEdge)
		{
			isAtRightEdge = true;
			left = rightEdge;
		}
	}
	
	return {
		left :left,
		isAtLeftEdge : isAtLeftEdge,
		isAtRightEdge : isAtRightEdge
	}
}

RTCMediaPlayerObj.prototype.handleDefaultEvents = function(moduleName , data)
{
	switch(moduleName)
	{
		case RTCMediaPlayerConstants.category.REACTION:
			this.handleReactions(data);
			break;
		case RTCMediaPlayerConstants.category.ACTIVESPEAKER:
			break;
		default:
			break;
	}
}

RTCMediaPlayerObj.prototype.setStartTime = function(time)
{
	this._config.startPosition = time;
}

RTCMediaPlayerObj.prototype.reportAbuse = function ()
{
	
}

RTCMediaPlayerObj.prototype.handleActionStats = function(data)
{

}

RTCMediaPlayerObj.prototype.handleCustomEventContainerOpen = function()
{
}

RTCMediaPlayerObj.prototype.handleCustomEventContainerClose = function()
{
}

RTCMediaPlayerObj.prototype.getCustomEventsData = function()
{
	
}

RTCMediaPlayerObj.prototype.transcript = function(event, elem, mediaPlayerInstance)
{
	
}

RTCMediaPlayerObj.prototype.snapshot = function(event, elem, mediaPlayerInstance)
{
		var videoElem = $(".rtcmediaplayervideo")[0];
		var canvasImgSrc = null;
		
		var canvasElem = document.createElement("canvas");
		canvasElem.width = videoElem.videoWidth;
		canvasElem.height = videoElem.videoHeight;
		canvasElem.getContext('2d').drawImage(videoElem, 0, 0, canvasElem.width, canvasElem.height);
		canvasImgSrc = canvasElem.toDataURL();
		
		var link = document.createElement('a');
		link.download = 'rtc_player_img.png';
		link.href = canvasImgSrc;
	  
		link.click();
		$(".rtcp-video-player-snap").fadeIn(250).fadeOut(250);
}

RTCMediaPlayerObj.prototype.actionStatSuccessData = function(networkDetails,stats, context)
{
	var actionstats = {};
	actionstats.Status = "Success";
	actionstats.StatusCode = networkDetails.status;
	actionstats.URL = context.url;
	actionstats.dtime = stats.loading;
	actionstats.btime = stats.buffering;
	actionstats.ptime = stats.parsing;
	if(this._playerInstance)
	{
		actionstats.bitrate = this._playerInstance.bandwidthEstimate;
	}
	
	this.handleActionStats(actionstats);
	this.addStats(Date.now(),this.actionHeaders.xhr,actionstats);
	this.monitorChunkDownloadTime(stats.loading);
}

RTCMediaPlayerObj.prototype.actionStatErrorData = function(networkDetails,error,context)
{
	var actionstats = {};
	actionstats.Status = "Failure";
	actionstats.StatusCode = networkDetails.status;
	actionstats.URL = context.url;
	actionstats.ErrorCode = error.code;
	if(this._playerInstance)
	{
		actionstats.bitrate = this._playerInstance.bandwidthEstimate;
	}
	
	this.handleActionStats(actionstats);
	this.addStats(Date.now(),this.actionHeaders.xhr,actionstats);
}

RTCMediaPlayerObj.prototype.addStats = function(starttime,action,data)
{
	
	//rtcpserver stats
	if(this.stat[starttime] == undefined)
	{
		this.stat[starttime] = {};
	}
	if(this.stat[starttime][action] == undefined)
	{
		this.stat[starttime][action] = [];
	}
	this.stat[starttime][action].push(data);
	
	//wss stats
	if(this.wssStat[starttime] == undefined)
	{
		this.wssStat[starttime] = {};
	}
	if(this.wssStat[starttime][action] == undefined)
	{
		this.wssStat[starttime][action] = [];
	}
	this.wssStat[starttime][action].push(data);
}

RTCMediaPlayerObj.prototype.setMetaData = function(data)
{
	this.metaData = data;
}

RTCMediaPlayerObj.prototype.getMetaData = function()
{
	return this.metaData;
}
		
RTCMediaPlayerObj.prototype.customEvents = function(videoKey,data)
{
	var eventIdList = [];
	if(data)
    {
		videoKey = RTCMediaPlayerConstants.processXSS(videoKey);
        var rtcEventObj = new RTCEventObj(videoKey);
        var data ;
        
        for (var i=0;i<Object.keys(data).length ; i++)
        {
        	if(!(data[i].offset_in_sec) && data[i].offset_in_sec!=0)
        	{
        		return new Promise((resolve, reject) => {
            		reject();
            		});
        	}
        	var moduleName = RTCMediaPlayerConstants.processXSS(data[i].module);
        	var eventID = RTCMediaPlayerConstants.processXSS(data[i].eventid);
        	var offsetInSec = (parseFloat(data[i].offset_in_sec));
        	var eventData = (data[i].data);
        	
            if(!rtcEventObj.getModuleObjectsAsMap()[moduleName])
            {
                var moduleObject = new eventModuleObject(moduleName);
                moduleObject.addEventObject(new eventObject(moduleName, eventID, offsetInSec ,offsetInSec, eventData, null)) // null is type
                rtcEventObj.getModuleObjectsAsMap()[moduleName] = moduleObject;
            }
            else
            {
            	if((rtcEventObj.getModuleObjectsAsMap()[moduleName].offSetIndexList).indexOf(offsetInSec)>=0)
        		{
            		return new Promise((resolve, reject) => {
                		reject();
                		});
        		}
                rtcEventObj.getModuleObjectsAsMap()[moduleName].addEventObject(new eventObject(moduleName, eventID, offsetInSec, offsetInSec,(eventData), null));
            }
            if(eventIdList.indexOf(eventID)>=0)
        	{
            	return new Promise((resolve, reject) => {
            		reject();
            		});
        	}
            eventIdList.push(eventID);
        }
        this.setEventsObj(rtcEventObj);
        var moduleNameList = Object.keys(rtcEventObj.getModuleObjectsAsMap());
        if(this.getDefaultPlaybackModule() && rtcEventObj.getModuleObjectsAsMap()[this.getDefaultPlaybackModule()])
    	{
        	this.setPlaybackIndex(this.getDefaultPlaybackModule());
            	return new Promise((resolve, reject) => {
            		resolve();
            		});
    	}
        else
    	{
        	var moduleNameList = Object.keys(rtcEventObj.getModuleObjectsAsMap());
        	var skippedEventList = this.getSkippedEvents();
        	skippedEventList.forEach(function(skipppedEvent) {
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
        			 this.setPlaybackIndex(RTCMediaPlayerConstants.category.ACTIVESPEAKER);
                 }
        		 else
    			 {
        			 this.setPlaybackIndex(moduleNameList[0]);
    			 }
        		
            	return new Promise((resolve, reject) => {
            		resolve();
            		});
            }
            else
            {
                	return new Promise((resolve, reject) => {
                		reject();
                		});
            }
    	}
       
    }
	else
	{
			return new Promise((resolve, reject) => {
        		reject();
        		});
	}
	
}

RTCMediaPlayerObj.prototype.getSelectedQuality = function()
{
	var qualityLevels = this.getQualityLevels();

	if(this._playerInstance.autoLevelEnabled)
	{
		return qualityLevels[qualityLevels.length - 1];
	}

	return this.qualityLevels.find(function(level) {
		return level.value === this._playerInstance.loadLevel;
	}.bind(this));
}

RTCMediaPlayerObj.prototype.openQualityContainer = function()
{
	if(!this.qualityLevels | this.qualityLevels.length<=0)
	{
		return;
	}
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-mainview').removeClass("selected");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').addClass("selected");
	var html = "";
	html += RTCMediaPlayerTemplates.getMediaPlayerQualityDiv();
	html += '<div class="rtcp-mp-quality-view  scrollbar">'
		for (var i = 0; i < this.qualityLevels.length; i++)
		{
			html += RTCMediaPlayerTemplates.getMediaPlayerQualityLevels(this.qualityLevels[i].key, "");
		}
	html += '</div>';
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').empty().append(html);
	var selectedQuality = this.getSelectedQuality();
	var qualityrate = this._playerInstance.autoLevelEnabled ? RTCMediaPlayerConstants.quality.auto : selectedQuality.key;
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[qualityrate="'+qualityrate+'"] .rtcp-mp-setting-pb-tick').css("visibility","visible");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[qualityrate="'+qualityrate+'"]').addClass('currentquality');
}

RTCMediaPlayerObj.prototype.setQuality = function(qualityrate)
{
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow.currentquality').removeClass('currentquality');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow .rtcp-mp-setting-pb-tick').css("visibility","hidden");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[qualityrate="'+qualityrate+'"] .rtcp-mp-setting-pb-tick').css("visibility","visible");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[qualityrate="'+qualityrate+'"]').addClass('currentquality');
	var selectedQuality = this.qualityLevels.find(function(level) {
		return level.key === qualityrate;
	});

	if(selectedQuality)
	{
		if(this.mode === RTCMediaPlayerConstants.mode.LIVESTREAMING)
		{
			this._playerInstance.nextLevel = selectedQuality.value;
		}
		else
		{
			this._playerInstance.currentLevel = selectedQuality.value;
		}
	}
}

RTCMediaPlayerObj.prototype.opensubtitleContainer = function()
{
	if(!this.subtitles || this.subtitles.length<=0)
	{
		return;
	}
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-mainview').removeClass("selected");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').addClass("selected");
	var html = "";
	html += RTCMediaPlayerTemplates.getMediaPlayerSubtitleDiv();
	html += '<div class="rtcp-mp-subtitle-view  scrollbar">'
		for (var i = 0; i < this.subtitles.length; i++)
		{
			html += RTCMediaPlayerTemplates.getMediaPlayerSubtileLanguages(this.subtitles[i]);
		}
	html += '</div>';
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').empty().append(html);
	subtitle = this.subtitles[this._playerInstance.subtitleTrack+1]
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[subtitle="'+(subtitle == 0 ? RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitle.off"):subtitle)+'"] .rtcp-mp-setting-pb-tick').css("visibility","visible");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[subtitle="'+(subtitle == 0 ? RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitle.off"):subtitle)+'"]').addClass("currentsubtitle");
}

RTCMediaPlayerObj.prototype.getQualityLevels = function()
{
	if(Array.isArray(this.qualityLevels) && this.qualityLevels.length)
	{
		return this.qualityLevels;
	}

	this.qualityLevels = [];
	this.qualityLevels.push({
		key : RTCMediaPlayerConstants.quality.auto,
		value : -1,
		width : -1,
		height : -1
	});
	var qualities = this._playerInstance.levels;
    
	for(var index = 0; index < qualities.length; index++)
	{
		this.qualityLevels.push({
			key : qualities[index].height + "p",
			value : index,
			height : qualities[index].height,
			width : qualities[index].width
		});
	}

	this.qualityLevels.sort(function(a, b) {
		return b.height - a.height;
	});

	return this.qualityLevels;
}

RTCMediaPlayerObj.prototype.getSubtitleLanguages = function()
{
	this.subtitles = [];
	var subtitles = this._playerInstance.subtitleTracks;
	if(subtitles.length > 0)
	{
		this.subtitles.push(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitle.off"));
	}
	for(var i=0;i<subtitles.length;i++)
	{
		language = subtitles[i].lang;
		this.subtitles.push(language);
	}
}

RTCMediaPlayerObj.prototype.setSubtitle = function(elem,lang)
{
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow.currentsubtitle').removeClass('currentsubtitle');
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow .rtcp-mp-setting-pb-tick').css("visibility","hidden");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[subtitle="'+lang+'"] .rtcp-mp-setting-pb-tick').css("visibility","visible");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[subtitle="'+lang+'"]').addClass("currentsubtitle");
	this._playerInstance.subtitleTrack = this.subtitles.indexOf(lang)==0?-1:this.subtitles.indexOf(lang)-1;  //check according to index
//	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subtitle-text').text(this._playerInstance.subtitleTrack == 0 ? "Off" :RTCMediaPlayerConstants.subtitles[this._playerInstance.subtitleTrack])
}

RTCMediaPlayerObj.prototype.openAudioTrack = function()
{
	if(!this.audioTracks || this.audioTracks.length<=0)
	{
		return;
	}
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-mainview').removeClass("selected");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').addClass("selected");
	var html = "";
	html += RTCMediaPlayerTemplates.getMediaPlayerAudioTrackDiv();
	html += '<div class="rtcp-mp-audiotrack-view scrollbar">'
		for (var i = 0; i < this.audioTracks.length; i++)
		{
			html += RTCMediaPlayerTemplates.getMediaPlayerAudioTracksLanguages(this.audioTracks[i]);
		}
	html += '</div>';
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-subview').empty().append(html);
	audiotrack = this.audioTracks[this._playerInstance.audioTrack]
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[audiotrack="'+audiotrack+'"] .rtcp-mp-setting-pb-tick').css("visibility","visible");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[audiotrack="'+audiotrack+'"]').addClass("currentaudiotrack");
}

RTCMediaPlayerObj.prototype.setAudioTrack = function(elem,audiotrack)
{
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow.currentaudiotrack').removeClass("currentaudiotrack");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow .rtcp-mp-setting-pb-tick').css("visibility","hidden");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[audiotrack="'+audiotrack+'"] .rtcp-mp-setting-pb-tick').css("visibility","visible");
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"]  .rtcp-mp-setting-viewrow[audiotrack="'+audiotrack+'"]').addClass("currentaudiotrack");
	this._playerInstance.audioTrack = this.audioTracks.indexOf(audiotrack);  //check according to index
}

RTCMediaPlayerObj.prototype.getAudioTracks = function()
{
	this.audioTracks = [];
	var track = this._playerInstance.audioTracks;
	for(var i=0;i<track.length;i++)
	{
		language = track[i].lang;
		this.audioTracks.push(language);
	}
}

RTCMediaPlayerObj.prototype.setSpinner = function()
{
	var loader = $('[mediaplayerid="' + this.mediaPlayerDiv + '"] .rtcp-mp-spinner');
	var isHidden = loader.is(":hidden");

	if(this._videoInstance && (this._videoInstance.ended || this._videoInstance.paused || this._videoInstance.readyState == 4 || this._videoInstance.readyState == 3))
	{
		if(!isHidden)
		{
			loader.hide();
			this.onPlayerLoadingStop();
		}
	}
	else
	{
		if(isHidden)
		{
			loader.show();
			this.onPlayerLoadingStart();
		}
	}
}

RTCMediaPlayerObj.prototype.UIonPause= function()
{
	if(this._videoInstance && this._videoInstance.ended)
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayecontrols .rtcp-mp-playpause-button[rtcpmpbutton]').find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-pause").addClass("rtcmp-icon-mp-replay");
		if(this.view == RTCMediaPlayerConstants.MINIPLAYER && this._config.pauseOrPlay != "disable")
		{
			$('[id="' + this.miniPlayerDiv +'"] .rtcmp-icon-mini-player-hover-state').addClass("rtcmp-icon-mp-replay");
		}
		$('#' + this.mediaPlayerDiv + ' .pauseAndplay').addClass("rtcmp-icon-mp-replay");
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayecontrols .rtcp-mp-playpause-button.rtcp-mp-button.tooltip-up').attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.replay")+" (k)");
		return;
	}
	else{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayecontrols .rtcp-mp-playpause-button[rtcpmpbutton]').find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-replay").addClass("rtcmp-icon-mp-pause");
		if(this.view == RTCMediaPlayerConstants.MINIPLAYER)
		{
			$('[id="' + this.miniPlayerDiv +'"] .rtcmp-icon-mini-player-hover-state').removeClass("rtcmp-icon-mp-replay");
		}
		$('#' + this.mediaPlayerDiv + ' .pauseAndplay').removeClass("rtcmp-icon-mp-replay");
	}
	this.onPause();
	if(!(this.view == RTCMediaPlayerConstants.MINIPLAYER && $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-video-cont').hasClass('rtcp-mp-videoHover')))
	{
		this.updateCenterBezel("pause");
	}
//	var a = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-time-current').text();
//	var b = $('#' + this.mediaPlayerDiv + ' .rtcp-mp-time-duration').text();
//	if(a == b){
//		var elem = $('#' + this.mediaPlayerDiv + ' .rtcmediaplayecontrolsbottomleftcontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
//		elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-pause").addClass("rtcmp-icon-mp-replay");
//		elem.attr('tooltip-title', 'Replay (k)');
//		$('#' + this.mediaPlayerDiv + ' .pauseAndplay').addClass("rtcmp-icon-mp-replay");
//	}
//	else{
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] [rtcpmpbutton][purpose="pause"]').attr("purpose","play");
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayecontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
	elem.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.play")+" (k)");
	elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-pause").addClass("rtcmp-icon-mp-play");
}
RTCMediaPlayerObj.prototype.UIonPlay= function(){
	if(!this._videoInstance.ended)
	{
		$('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayecontrols .rtcp-mp-playpause-button[rtcpmpbutton]').find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-replay").addClass("rtcmp-icon-mp-pause");
		$('#' + this.mediaPlayerDiv + ' .pauseAndplay').removeClass("rtcmp-icon-mp-replay");
		if(this.view == RTCMediaPlayerConstants.MINIPLAYER)
		{
			$('[id="' + this.miniPlayerDiv +'"] .rtcmp-icon-mini-player-hover-state').removeClass("rtcmp-icon-mp-replay");
		}
	}
	this.onPlay();
	if(!(this.view == RTCMediaPlayerConstants.MINIPLAYER && $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-video-cont').hasClass('rtcp-mp-videoHover')))
	{
		this.updateCenterBezel("play");	
	}
	$('[mediaplayerid="' + this.mediaPlayerDiv +'"] [rtcpmpbutton][purpose="play"]').attr("purpose","pause");
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcmediaplayecontrols .rtcp-mp-playpause-button[rtcpmpbutton]');
	elem.attr('purpose', 'pause')
	elem.attr('tooltip-title', RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.pause") + ' (k)');
//	if(elem.find('.rtcmp-icon-mp-play').length)
//	{
		elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-play").addClass("rtcmp-icon-mp-pause");
//	}
//	else{
//		elem.find('.rtcp-mp-button').removeClass("rtcmp-icon-mp-replay").addClass("rtcmp-icon-mp-pause");
//		$('#' + this.mediaPlayerDiv + ' .pauseAndplay').removeClass("rtcmp-icon-mp-replay");
//	}
}

RTCMediaPlayerObj.prototype.getRealValue = function(input)
{
	
}

RTCMediaPlayerObj.prototype.hasWssDomains = function()
{
	return this.wssDomains.length > 1;
}

RTCMediaPlayerObj.prototype.getWSSDomain = function()
{
	return this.wssDomains[this.wssDomainIndex];
}

RTCMediaPlayerObj.prototype.setWSSUrls = function(urls)
{
	if(typeof urls === "string")
	{
		urls = [urls];
	}

	if(!Array.isArray(urls) || !urls.length)
	{
		return;
	}

    this.wssUrls = urls;

	this.wssDomains = urls.map(function(url){
		if(!url.startsWith("https://"))
		{
			url = "https://" + url;
		}

		return new URL(url).hostname;
	});
}

RTCMediaPlayerObj.prototype.changeWSSDomain = function()
{
	if(!this.hasWssDomains())
	{
		return;
	}

	this.wssDomainIndex = (this.wssDomainIndex + 1) % this.wssDomains.length;
	this.wssurl = "https://" + this.getWSSDomain();
}

RTCMediaPlayerObj.prototype.monitorChunkDownloadTime = function(loadingStats)
{
	if(!this.hasWssDomains())
	{
		return;
	}
    
	var downloadTime = loadingStats.end - loadingStats.first;

	this.chunksDownloadTime.push(downloadTime);

	if(this.chunksDownloadTime.length < this.chunksAverageCount)
	{
		return;
	}

	var totalDownloadTime = 0;

	for(var time of this.chunksDownloadTime)
	{
		totalDownloadTime += time;
	}

	this.chunksDownloadTime = [];

	var averageDownloadTime = totalDownloadTime / this.chunksAverageCount;

	if(averageDownloadTime <= this.getDownloadTimeThreshold())
	{
		return;
	}

	this.changeWSSDomain();
}

RTCMediaPlayerObj.prototype.setRecordingId = function(id)
{
	this._recordingId = id;
}

RTCMediaPlayerObj.prototype.getRecordingId = function()
{
	return this._recordingId;
}

RTCMediaPlayerObj.prototype.showPlayerControls = function()
{
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-video-cont');

	if(elem.hasClass("rtcp-mp-videoHover"))
	{
		return;
	}

	elem.addClass("rtcp-mp-videoHover");
}

RTCMediaPlayerObj.prototype.hidePlayerControls = function()
{
	var hideControlsOnPause = this._config.hideControlsOnPause === "enable";
	var elem = $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-video-cont');

	if ((!hideControlsOnPause && this.isPaused()) || $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-playbackspee-options').hasClass('selected') || $('[mediaplayerid="' + this.mediaPlayerDiv +'"] .rtcp-mp-setting-view').hasClass('selected')) 
	{
		return;
	}

	// Safari: autoplay failure reports paused=false even though video never played.
	// Use explicit flag to keep controls visible until user starts playback.
	if(this._autoplayFailed)
	{
		return;
	}

	if(!elem.hasClass("rtcp-mp-videoHover"))
	{
		return;
	}

	elem.removeClass("rtcp-mp-videoHover");
}

RTCMediaPlayerObj.prototype.sendStatsToWSS = function()
{
	var sid = this.getSid();
	var mode = this.getMode();
	var stats = this.wssStat;

	if($.isEmptyObject(stats) || !sid || mode == RTCMediaPlayerConstants.mode.EXTERNAL)
	{
		return;
	}

	this.wssStat = {};

	var origin = this.getManifestOrigin();

	$.ajax({
		url : origin + "/clientstats",
		type : "POST",
		contentType : "application/json", //NO I18N
		data : {
			data : JSON.stringify(stats),
			sid : sid,
			mode : mode
		}
	});
}

RTCMediaPlayerObj.prototype.onToggleCustomIcon = function(event, elem, title, mediaPlayerInstance)
{

}

RTCMediaPlayerObj.prototype.onBeforeMediaPlayerClose = function()
{

}

RTCMediaPlayerObj.prototype.onPlayBackSpeedChange = function(playBackSpeed)
{

}

RTCMediaPlayerObj.prototype.onPlayerLoadingStart = function()
{

}

RTCMediaPlayerObj.prototype.onPlayerLoadingStop = function()
{

}

RTCMediaPlayerObj.prototype.isVodFlow = function()
{
	return this.vodFlow;
}

RTCMediaPlayerObj.prototype.getVodVersion = function()
{
	return this.vodVersion;
}

RTCMediaPlayerObj.prototype.setVodContentId = function(contentId)
{
	if(!contentId || this.vodContentId === contentId)
	{
		return;
	}

	this.vodContentId = contentId;
}

RTCMediaPlayerObj.prototype.getVodContentId = function()
{
	return this.vodContentId;
}

RTCMediaPlayerObj.prototype.getViewerId = function()
{
	return this.viewerid;
}

RTCMediaPlayerObj.prototype.bindCustomEvents = function()
{
}

RTCMediaPlayerObj.prototype.onSeeked = function()
{
}

RTCMediaPlayerObj.prototype.getEventForCurrentTime = function(moduleName)
{
	var events = this.getEventsObj();

	if(!events)
	{
		return;
	}

	var currentTime = this._videoInstance.currentTime || 0;

	return events.getEventByTime(moduleName, currentTime);
}

RTCMediaplayerUIHandler = {

		pause : function (event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.handlePlayPause(elem);
		},
		play : function (event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.handlePlayPause(elem);
		},
		mute : function (event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.handleMute(true);
		},
		unMute : function (event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.handleMute(true);
		},
		closeMediaPlayer : function (event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.closeMediaPlayer(true);
		},
		leaveMediaPlayerLS : function(event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.closeMediaPlayer(true);
			mediaPlayerInstance.handleLeaveLiveStream();
		},
		expandMediaplayer : function (event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.goToDefaultView();
		},
		goLive : function (event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.goLive(event,elem, true);
		},
		openSetting : function (event,elem,mediaPlayerInstance)
		{
			//mediaPlayerInstance.closeEventContainer()
			mediaPlayerInstance.openplayerSetting();
		},
		closeSetting : function (event,elem,mediaPlayerInstance)
		{
			//mediaPlayerInstance.closeEventContainer()
			mediaPlayerInstance.closePlayerSetting();
		},
		openPlayerSpeedSetting : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.openPlaybackSetting();
		},
		closePlayerSpeedSetting : function (event, elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.closePlaybackSetting();
		},
		gotoFullScreen : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.handleFullScreen();
		},
		gotoMiniPlayer : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.gotoMiniPlayerView()
		},
		setPlaybackRate : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.setPlayBackRate(elem,elem.attr("playbackspeed"))
		},
		gotoSeekBarTime : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.gotoSeekBarTime(event, elem)
		},
		openEventsContainer : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.openEventContainer(event, elem);
		},
		closeEventsContainer : function (event, elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.closeEventContainer(event, elem);
		},
		syncEvents : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.setScrollForEventsContainer();
		},
		gotoEventTime : function (event, elem, mediaPlayerInstance)
		{
			var time = elem.attr("mp-start-time");
			mediaPlayerInstance.gotoEventTime(time);
		},
		openDesc : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.openDesc(elem);
		},
		closeDesc : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.closeDesc(elem);
		},
		clearEventsSearchBar : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.clearEventsSearchBar();
		},
		gotoEventModule : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.gotoEventModule(elem);
		},
		gotoBookmarkTime : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.gotoBookmarkTime(event, elem)
		},
		autoplaystart : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.autoplaystart(event, elem)
		},
		/*eventSearchBar : function(event, elem, mediaPlayerInstance)
		{
		},*/
		gotoPIP : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.handlePictureInPicture();
		},
		exitPIP : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.handlePictureInPicture();
		},
		openNewPlaybackSpeedSetting : function (event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.openNewPlaybackSpeedSetting();
		},
		closeNewPlaybackSpeedSetting : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.closeNewPlaybackSpeedSetting();
		},
		setNewPlaybackSpeed : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.setNewPlaybackSpeed(event, elem);
		},
		download : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.download(event, elem);
		},
		loop : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.loop();
		},
		openPlayBackSetting : function (event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.openSeparatePlayerSetting()
		},
		closePlayBackSetting : function (event,elem,mediaPlayerInstance)
		{
			//mediaPlayerInstance.closeEventContainer()
			mediaPlayerInstance.closeSeparatePlayerSetting()
		},
		forwardseek : function(event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.seekForward();
		},
		backwardseek : function(event,elem,mediaPlayerInstance)
		{
			mediaPlayerInstance.seekBackward();
		},
		reportabuse : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.reportAbuse();
		},
		snapshot : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.snapshot(event, elem, mediaPlayerInstance);
		},
		traverseHeaderForward : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.traverseHeaderForward();
		},
		traverseHeaderReverse : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.traverseHeaderReverse();
		},	
		transcript : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.transcript(event, elem, mediaPlayerInstance);
		},
		openQualities : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.openQualityContainer();
		},
		setQuality : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.setQuality(elem.attr("qualityrate"));
		},
		enableSubtitle : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.opensubtitleContainer();
		},
		setSubtitle : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.setSubtitle(elem,elem.attr("subtitle"));
		},
		openAudioTrack : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.openAudioTrack();
		},
		setAudioTrack : function(event, elem, mediaPlayerInstance)
		{
			mediaPlayerInstance.setAudioTrack(elem,elem.attr("audiotrack"));
		},

		customControl : function(event, elem, mediaPlayerInstance)
		{
			var title = elem.attr("tooltip-title");
			mediaPlayerInstance.onToggleCustomIcon(event, elem, title, mediaPlayerInstance);
		},

		handleImageError : function(element)
		{
			var mediaPlayerInstance = RTCMediaPlayerObjList[element.getAttribute("playerId")];
	
			if(!mediaPlayerInstance)
			{
				return;
			}

			var fallbackImgUrl = mediaPlayerInstance.getFallBackUserImgForPlayBack(element.getAttribute("userId"), element.getAttribute("userName"));

			if(!RTCMediaPlayerConstants.isValidUrl(fallbackImgUrl))
			{
				return;
			}

			element.src = fallbackImgUrl;
		}
		
}
RTCMediaPlayerConstants.bindWindowEvents();
RTCPMediaPlayerResource = 
{
		getRealValue : function(input,mediaplayerObj)
		{
			if(mediaplayerObj!=undefined && mediaplayerObj.getRealValue(input))
			{
				return RTCMediaPlayerConstants.processXSS(mediaplayerObj.getRealValue(input));
			}
			
			var key = input.replace(/\s/g, '').toLowerCase();
			if(typeof RTCPMediaPlayerResourceMessageObject != "undefined")
			{
				var value = RTCPMediaPlayerResourceMessageObject[key];
				if(typeof value !== "undefined")
				{
	//				if(typeof RTCPSmiley !== "undefined" && value.indexOf(":") !== -1) {
	//					return RTCPSmiley.replace(value);
	//				}
			    	return value;
				}
			}
			if(RTCMediaPlayerConstants.resources[key] != undefined)
			{
				return RTCMediaPlayerConstants.resources[key];
			}
			return input.replace("mediaplayer.", '');
		}
}

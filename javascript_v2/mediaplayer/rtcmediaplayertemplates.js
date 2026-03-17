//$Id$
var RTCMediaPlayerTemplates = {};

RTCMediaPlayerTemplates = (function (){
    var _templates =
        {
            rtcmediaPlayerDiv :
                '<div class="rtcpmediaplayerdiv {{mode}}" tabindex="-1" style="z-index:{{zindex}};height: 100%;flex-grow: 1;position: relative;" mediaplayerid="{{id}}" type="{{type}}">'+
                '{{mediaplayerui}}'+
                '</div>'+
                '{{eventcontainerdiv}}',
                

            mediaPlayerUI :
                '<div class="rtcp-mp-video-cont" style="display: inline-block;width: calc(100%);height: 100%;cursor:{{cursor}};">' +
	                '<div class="rtcp-mp-pip-background rtcp-mp-dN" style="background-image:url(\'{{posterUrl}} \')"><div class="rtcp-mp-pip-mode-screen"><div class="rtcp-mp-pip-screen rtcmp-icon-mp-pipstroke" purpose="gotoPIP" rtcpmpbutton=""></div><div class="rtcp-mp-pip-text">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.pipoverlay")+'</div></div><div class="rtcp-mp-pip-header rtcp-mp-dN"><div class="rtcp-mp-header-name">{{mptitle}}</div><div class="rtcp-mp-closebutton {{closeCustomClass}} tooltip-right0" rtcpmpbutton="" purpose="closeMediaPlayer" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.close")+'"><div class="rtcmp-icon-closeB"></div></div></div></div>'+
	                '{{snapshotFlash}}'+
	                '<video class="rtcmediaplayervideo" style="width: 100%;height: 100%;top:0;position:absolute;" poster={{posterUrl}}></video>'+
                /*'<div class="rtcp-mp-video-up-layer" rtcpmpbutton purpose="pause">'+*/
                	'{{mediaplayerseekbar}}'+
                	/*'{{hovertimediv}}'+*/
                	'{{mptooltippreview}}'+
                	'{{annotationpreview}}'+
                	'{{livestreambottombar}}'+
                	'{{setting}}'+
                	'{{spinner}}'+
                	/*'<div class="rtcp-mp-header">' +
                		'<div class="rtcp-mp-header-left-view">' +
                			'{{popoutbutton}}'+
                			'{{mptitle}}'+
            			'</div>'+
            			'<div class="rtcp-mp-header-right-view">' +
            				'{{mpclosebutton}}'+
        				'</div>'+
    				'</div>'+*/
    				/*'<div class="rtcp-mp-bg-layer"></div>'+*/
//    				'<div class="rtcp-mp-events-container" style="display: none;">'+
//    					'<div class="rtcp-mp-events-header-topbar">'+
//    						'<div class="rtcp-mp-events-header-topbar-content">'+
//    							'<div class="rtcmp-icon-left-arrow rtcp-mp-events-header-topbar-content-back"></div>'+
//    							'<div class="rtcp-mp-events-header-topbar-content-heading">Chapters</div>'+
//							'</div>'+
//    					'</div>'+
//    					'<div class="rtcp-mp-events-header">'+
//    						'<div class="flexM rtcp-events-header-module"></div>'+
//    						'<div class="flexm rtcp-events-selectpicker" style="width: 10vw;display: none;"></div>'+
//						'</div>'+
//						'{{searchbar}}'+
//						'<div class="rtcp-mp-events-content scrollbar scrollbar-lightgrey"></div>'+
//						'<div class="rtcp-mp-sync-container" style="display: none;"><div rtcpmpbutton purpose="syncEvents" class="rtcp-mp-sync-button">Sync to Video time</div></div>'+
//					'</div>'+
					/*'{{eventplayerdiv}}'+ //NO I18N*/
                    "{{autoPlayPoster}}"+
					'<div style="display: none;" class="rtcp-mp-bezel-player-state">'+
						'<div class="rtcp-mp-bezel rtcp-mp-bezel-player-purpose" purpose="pause">'+
							'<div class="rtcmp-icon-mp-bezel-state rtcp-mp-bezel-icon"></div>'+
						'</div>'+
					'</div>'+
					'<div style="display: none;" class="rtcp-mp-bezel-player-seek-action">'+
						'<div class="rtcp-mp-bezel-seek" purpose="back">'+
							'<div class="rtcp-mp-bezel-icon rtcmp-icon-mp-bezel-seek"></div>'+
							/*'<div class="rtcp-mp-bezel-seek-text">5 seconds<div></div></div>'+*/
						'</div>'+
					'</div>'+
					'<div class="rtcp-mp-doubletap-ui-legacy" style="display: none;" purpose="back">'+
						'<div class="rtcp-mp-doubletap-fast-forward-ve"></div>'+
						'<div class="rtcp-mp-doubletap-rewind-ve"></div>'+
						'<div class="rtcp-mp-doubletap-static-circle">'+
							'<div class="rtcp-mp-doubletap-ripple"></div>'+
						'</div>'+
						'<div class="rtcp-mp-doubletap-overlay-a11y" style="display:none;"></div>'+
						'<div class="rtcp-mp-doubletap-seek-info-container">'+
							'<div class="rtcp-mp-doubletap-arrows-container">'+
								'<span class="rtcp-mp-doubletap-base-arrow"></span>'+
								'<span class="rtcp-mp-doubletap-base-arrow"></span>'+
								'<span class="rtcp-mp-doubletap-base-arrow"></span>'+
							'</div>'+
							'<div class="rtcp-mp-doubletap-tooltip">'+
								'<div class="rtcp-mp-chapter-seek-text-legacy"></div>'+
								'<div class="rtcp-mp-doubletap-tooltip-label">5 seconds</div>'+
							'</div>'+
						'</div>'+
					'</div>'+
					/*'</div>'+*/
					'{{gradientEffect}}'+
					'{{miniPauseOrPlay}}'+
					'{{newPlaybackSpeedDiv}}'+
					'<div class="rtcp-mp-header">' +
	            		'<div class="rtcp-mp-header-left-view">' +
	            			'{{popoutbutton}}'+
	            			'{{mptitle}}'+
	        			'</div>'+
	        			'<div class="rtcp-mp-header-right-view">' +
	        				'{{mpclosebutton}}'+
	    				'</div>'+
    				'</div>'+
    				'<div class="smartconf-reaction-wrap animEmoji rtcp-mp-reactionview-cnt" style="pointer-events:none;"></div>'+
                '</div>',
            mediaPlayerSeekBar :
                '<div class="rtcpmediaplayerseekbar">'+
                	'<div class="rtcp-mp-golive-button" rtcpmpbutton purpose="goLive">{{liveButton}}</div>'+
                	'<div class="rtcmediaplayerbackground" style="{{cursorneeded}}">' +
                		'<div class="rtcp-mp-progress-bar-container" style="display: flex;">'+
                			'{{mediaplayerchapter}}'+
            			'</div>'+
        				'{{scrubercontainer}}'+
    				'</div>'+
    				'{{mediaplayercontrolsDiv}}'+
    				'{{leaveButton}}'+
    				'{{audiotooltip}}'+
                '</div>',
            mediapPlayerChapter :
                '<div class="rtcmediaplayerchapter" rtcpmpbutton purpose="gotoSeekBarTime" st={{st}} et={{et}} style="width:calc({{width}}% - {{totalmrh}}px);margin-right : {{mrh}}px">'+
                '<div class="rtcp-mp-chapter-padding"></div>'+
                '<div class="rtcmediaplayerchapterbg" style="transform :scaleX(1)" ></div>' +
                '<div class="rtcmediaplayerbufferprogress" style="transform :scaleX(0)" ></div>' +
                '<div class="rtcmediaplayerhoverprogress" style="transform :scaleX(0)" ></div>' +
                '<div class="rtcmediaplayerloadedprogress" style="transform :scaleX(0)"></div>' +
                '</div>',
            hoverTimeDiv :
                '<div class="rtcmediaplayerhovertime dN">' +
                '<span style="color: #eee;opacity: 1;text-shadow: 0 0 4px rgb(0 0 0 / 75%);background: none;"></span>' +
                '</div>',
            mediaPlayerTooltipPreview :
                '<div class="rtcp-mp-tooltip rtcp-mp-bottom rtcp-mp-preview dN" style="max-width: 300px;width: 162px!important;max-height: 125px!important;background: transparent;">' +
                /*'<div class="rtcp-mp-tooltip-text-wrapper" style="color: #eee;">' +
                    '<div class="rtcp-mp-tooltip-title">' +
                        '<span>this is title</span>'+
                    '</div>'+
                    '<span class="rtcp-mp-tooltip-text" style="height: 19px;">12:03</span>'+
                '</div>'+
                '<div class="rtcp-mp-tooltip-bg" style="width: 158px;height: 90px;background-position : center;background-repeat : no-repeat;"></div>'+*/
                '</div>',
            mediaPlayerTooltipContent :
                '{{bgdiv}}'+
                '<div class="rtcp-mp-tooltip-text-wrapper" style="color: #eee;margin-top: 4px;">' +
                	'<div class="rtcp-mp-tooltip-title">' +
                		'<span>{{title}}</span>'+
            		'</div>'+
            		'<span class="rtcp-mp-tooltip-text" style="height: 19px;">{{time}}</span>'+
                '</div>',
            mediaPlayerCloseButton :
                '<div class="rtcp-mp-closebutton {{customClass}} tooltip-right0" rtcpmpbutton purpose="closeMediaPlayer" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.close")+'" >' +
                '<div class="rtcmp-icon-closeB"></div>'+
                '</div>',
            mediaPlayerPopoutButton :
                '<div class="rtcp-mp-popout-button {{customClass}} tooltip-left0" rtcpmpbutton purpose="expandMediaplayer" tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.expand")+" (i)")+'"><div class="rtcmp-icon-popout" style="background: transparent;border: none;"></div></div>',
            eventsContainerTable :
                '<div class="rtcp-mp-events-content scrollbar scrollbar-lightgrey" style="height: calc(100% - 35px);">' +
                '{{eventcontainerbody}}'+
                '</div>',
            mediaplayertitle :
                '<div class="flexM rtcp-mp-video-title" style="">' +
                '<div class="rtcp-mp-video-title-text rtcp-mp-ellips {{rtcpdrag}}" tooltip-header-title="{{title}}">{{title}}</div>'+
                '</div>',
            /*'<div class="scrollbar scrollbar-lightgrey" style="height: 100%;">'+
               /!* '<div class="rtcp-events-selectpicker">' +
                    '<select class="selectpicker form-control bs-select-hidden" id="rtcp-mp-event-Container-SelectPicker">' +
                        '{{opthtml}}'+
                    '</select>'+
                '</div>'+*!/
                '<table class="mB0 MT10 table table-bordered">' +
                    '<tbody>' +
                        '{{eventcontainerbody}}'+
                    '</tbody>'+
                '</table>'+
            '</div>',*/
            eventsContainerRow :
                '<div class="rtcp-mp-events-chapter" mp-events-modulename="{{modulename}}" mp-start-time="{{stime}}" mp-end-time="{{etime}}" rtcpmpbutton purpose="{{chapter_purpose}}" track="{{track}}">' +
                	'<div class="rtcp-mp-events-chapter-heading">'+
                		'<div style="" class="rtcp-mp-events-chapter-heading-content">'+
	                		'<div style="" class="rtcp-mp-events-chapter-heading-title">'+
	                			'<div class="rtcp-mp-events-chapter-user-detail">'+
	                				'<img style="width: 40px; height: 40px; border-radius: 40px; background-color:#084E84" src="{{imgurl}}" {{onerror_img}}>'+
	                				'<div style="" class="ellips rtcp-mp-events-chapter-heading-username">{{username}}</div>'+
                				'</div>'+
	                			'<div style="" class="rtcp-mp-events-chapter-heading-time">'+
	                				'<div style="color: #0A84FF; font-size: 14px; font-family: Lato; font-style: italic; font-weight: 400; line-height: 20px; word-wrap: break-word">{{starttime}}</div>'+
	            				'</div>'+
	        				'</div>'+
	        				'<div class="rtcp-mp-events-header-desc-toggle">'+
	        					'<div style="" class="rtcp-mp-events-chapter-heading-title-content">{{title}}</div>'+
	        					'<div style="" class="rtcp-mp-events-chapter-heading-expand" mp-events-modulename="{{modulename}}" mp-start-time="{{stime}}" mp-end-time="{{etime}}" rtcpmpbutton purpose="{{desc_purpose}}">'+
	        						'<div style="" class="rtcmp-icon-mp-newDownArrow"></div>'+
	    						'</div>'+
							'</div>'+
						'</div>'+
					'</div>'+
                '<div class="rtcp-mp-events-chapter-title" style="display:none;">'+
	                	'<div class="font14 ellips flexM rtcp-mp-events-chapter-status">' +
	                		'<div style="width: 32px;height: 32px;border-radius: 25px;background: url({{imgurl}});background-repeat: no-repeat;background-size: contain;background-position: center"></div>'+
	            		'</div>'+
	            		'<div style="width: calc(100% - 42px);justify-content: start;" class="flexM">' +
	            			'<div style="width: 70%;justify-content: center;align-items: center;">'+
	            				'<div class="flexM rtcp-mp-events-authorname">' +
	            					'<div class="ellips">{{title}}</div>'+
	            					'<div class="rtcmp-icon-rtcp-mp-events-desc-status" style="margin-left: 10px;font-size: 10px; display:none;"></div>'+
	        					'</div>'+
	        					'<div class="font14 ellips flexM events-title">{{username}}</div>'+
        					'</div>'+
        					'<div class="font10" style="width:30%;padding-right:15px;text-align:center;font-family: Lato;font-style: normal;font-weight: normal;font-size: 13px;line-height: 12px;text-align: right;color: #888888;">{{userandtimeinfo}}</div>'+
    					'</div>'+
					'</div>'+
            		'<div class="rtcp-mp-events-chapter-desc" mp-start-time="{{stime}}" mp-end-time="{{etime}}" rtcpmpbutton purpose="{{desc_purpose}}">{{desc}}</div>'+
            		'<div class="rtcp-mp-events-chapter-seek-status"></div>'+
                '</div>',

            /*  '<tr mp-time="{{time}}">' +
                  '<td>' +
                      '<div class="font16 ellips" style="width: 300px;">{{title}}</div>'+
                      '<div class="font12" style="text-align: right;color: grey;">{{userandtimeinfo}}</div>'+
                  '</td>'+
              '</tr>',*/
            mediaPlayerEventsChapterDescription :
            /*'<div style="width: 90px;font-weight: bold;height: 60px;position: relative;padding: 0px 5px 0px 5px;text-align: center;background-image: url({{imgurl}});"></div>'+*/
                '<div style="width: calc(100% - 105px);margin: 0;height: 59px;justify-content: flex-start;margin-left: 57px;" class="flexM">' +
                	'<div class="font12" style="text-align: left;color: #c5c5c5;overflow: hidden;text-overflow: ellipsis;">{{desc}}</div>' +
                '</div>',
            mediaPlayerControlsDiv :
                '<div class="rtcmediaplayecontrols {{rtcpdrag}}">' +
                '<div class="rtcmediaplayecontrolsbottomleftcontrols">'+
                '{{seekbackward}}'+
                '{{playorpause}}'+
                '{{seekforwrd}}'+
                '{{volumebotton}}'+
                '{{timedisplay}}'+
                '{{chaptercontainer}}'+
                '{{loopbutton}}'+
                '{{download}}'+
                //'{{audioreportabuse}}'+
                '{{audiotranscript}}'+
                '</div>'+
                '<div class="rtcmediaplayecontrolsbottommiddlecontrols">' +
                '</div>'+
                '<div class="rtcmediaplayecontrolsbottomrightcontrols">'+
                '{{customIcons}}'+
                '{{transcript}}'+
                '{{reportabuse}}'+
                '{{downloadDiv}}'+
                '{{pipDiv}}'+
                '{{loop}}'+
                '{{settingDiv}}'+
                '{{playbackSpeedDiv}}'+
                '{{audiospeed}}'+
                '<div class="rtcp-mp-chapter-button tooltip-up" rtcpmpbutton purpose="openEventsContainer" tooltip-title="Chapters" style="display: none;"><div class="rtcmp-icon-allchats rtcp-mp-button"  style="display: none;"></div></div>'+
                '{{miniplayerDiv}}'+
                '{{fullscreenDiv}}'+
                '</div>'+
                '</div>'+
                '{{snapshot}}',
            playAndPauseButton :
                '<div class="rtcp-mp-playpause-button rtcp-mp-button tooltip-up" rtcpmpbutton purpose="pause" tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.pause")+" (k)")+'"><div class="rtcmp-icon-mp-pause rtcp-mp-button"></div></div>',
            volumeButton :
                '<div class="rtcp-mp-volume-area">' +
                '<div class="tooltip-up" tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.mute")+" (m)")+'" style="position: relative;"><div rtcpmpbutton purpose="mute" class="rtcmp-icon-unmute-sound rtcp-mp-button" style="vertical-align: top;"></div></div>'+
                '<div class="rtcp-mp-volume-panel">' +
                '<div class="rtcp-mp-volume-slider">' +
                '<div class="rtcp-mp-volume-slider-handle">' +
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>',
            loopButton : 
            	'<div class="rtcmp-icon-replay-button rtcp-mp-button tooltip-up" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.loop")+'" rtcpmpbutton purpose="loop"><div class="rtcmp-icon-replay"></div></div>',
            timeDisplayDiv :
                '<div class="flexM rtcp-mp-time-display">'+
                '<span class="flexM rtcp-mp-time-current">00:00</span>'+
                '<span class="rtcp-mp-time-separator">&nbsp;/&nbsp;</span>'+
                '<span class="rtcp-mp-time-duration">00:00</span>'+
                '</div>',
            eventContainerControlDiv :
                '<div class="rtcp-mp-chapter-container" rtcpmpbutton purpose="openEventsContainer" style="display:none;">' +
                '<div class="rtcp-mp-chapter-title">' +
                '<span class="rtcp-mp-chapter-title-prefix">&bull;</span>'+
                '<div class="rtcp-mp-chapter-title-content"></div>'+
                '<div class="flexM rtcp-mp-chapter-title-eventcont">' +
                '<div class="rtcmp-icon-right-arrow rtcp-mp-button" style="padding-top: 2px;"></div>'+
                '</div>'+
                '</div>'+
                '</div>',
            settingsDiv :
                '<div class="rtcp-mp-setting-button rtcp-mp-button tooltip-up tooltip-right0" rtcpmpbutton purpose="openSetting" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.settings")+'" ><div class="rtcmp-icon-mp-setting rtcp-mp-button" style="background: transparent;border: none;color: inherit;"></div></div>',
            miniPlayerDiv :
                '<div class="rtcp-mp-view-button rtcp-mp-miniplayer-button rtcp-mp-button tooltip-up tooltip-right0" rtcpmpbutton purpose="gotoMiniPlayer" tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.miniplayer")+" (i)")+'"><div class="rtcmp-icon-mp-miniplayer rtcp-mp-button"  style="background: transparent;border: none;color: inherit;"></div></div>',
            fullScreenDiv :
                '<div class="rtcp-mp-view-button rtcp-mp-fullscreen-button rtcp-mp-button tooltip-right0 tooltip-up" rtcpmpbutton purpose="gotoFullScreen" tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.fullscreen")+" (f)")+'"><div class="rtcmp-icon-mp-maximise rtcp-mp-button"  style="background: transparent;border: none;color: inherit;"></div></div>',
            pipDiv : 
            	'<div class="rtcp-mp-pip-button rtcp-mp-button tooltip-up tooltip-right0" purpose="gotoPIP" rtcpmpbutton="" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.pictureinpicture")+'"><div class="rtcmp-icon-mp-pip" style="background: transparent;border: none;color: inherit;"></div></div>',
        	downloadDiv :
        		'<div class="rtcp-mp-download-button rtcp-mp-button tooltip-up tooltip-right0" purpose="download" rtcpmpbutton tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.download")+'"><div class="rtcmp-icon-mp-download" style="background: transparent;border: none;color: inherit;"></div></div>',
        	playbackSpeedDiv : 
        		'<div class="rtcp-mp-player-speed-button rtcp-mp-button tooltip-up" rtcpmpbutton purpose="openPlayBackSetting" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed")+'">'+
        			'<div class="rtcmp-icon-mp-playback" style="background: transparent;border: none;color: inherit;font-size:24px;"></div>'+
    				'{{playbackspeed_icon_text}}'+
    				'{{options}}'+
				'</div>',
    		newPlaybackSpeedDiv : 
    			'<div class="rtcp-mp-playbackspee-options">'+
    				'<div class="rtcp-mp-playback-title">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed")+'</div>'+
    				'<div class="rtcp-mp-playback-itemslist">'+
    					'<div class="rtcp-mp-playback-item-container" playbackspeed="0.5" rtcpmpbutton purpose="setNewPlaybackSpeed">'+
    						'<div class="rtcp-mp-playback-item">'+
    							'<div class="rtcp-mp-playback-item-indicator">'+
    								'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
    								'<div class="rtcp-mp-playback-item-indicator-circle" playbackspeed="0.5"></div>'+
    								'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
    							'</div>'+
    							'<div class="rtcp-mp-playback-item-text">0.5x</div>'+
							'</div>'+
						'</div>'+
						'<div class="rtcp-mp-playback-item-container" playbackspeed="0.75" rtcpmpbutton purpose="setNewPlaybackSpeed">'+
							'<div class="rtcp-mp-playback-item">'+
								'<div class="rtcp-mp-playback-item-indicator">'+
									'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
									'<div class="rtcp-mp-playback-item-indicator-circle" playbackspeed="0.75"></div>'+
									'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
								'</div>'+
								'<div class="rtcp-mp-playback-item-text">0.75x</div>'+
							'</div>'+
						'</div>'+
						'<div class="rtcp-mp-playback-item-container rtcp-mp-playback-item-container-active" playbackspeed="1" rtcpmpbutton purpose="setNewPlaybackSpeed">'+
							'<div class="rtcp-mp-playback-item">'+
								'<div class="rtcp-mp-playback-item-indicator">'+
									'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
									'<div class="rtcp-mp-playback-item-indicator-circle" playbackspeed="1"></div>'+
									'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
								'</div>'+
								'<div class="rtcp-mp-playback-item-text" style="">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed.normal")+'</div>'+
							'</div>'+
						'</div>'+
						'<div class="rtcp-mp-playback-item-container" playbackspeed="1.25" rtcpmpbutton purpose="setNewPlaybackSpeed">'+
							'<div class="rtcp-mp-playback-item">'+
								'<div class="rtcp-mp-playback-item-indicator">'+
									'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
									'<div class="rtcp-mp-playback-item-indicator-circle" playbackspeed="1.25"></div>'+
									'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
								'</div>'+
								'<div class="rtcp-mp-playback-item-text">1.25x</div>'+
							'</div>'+
						'</div>'+
						'<div class="rtcp-mp-playback-item-container" playbackspeed="1.5" rtcpmpbutton purpose="setNewPlaybackSpeed">'+
							'<div class="rtcp-mp-playback-item">'+
								'<div class="rtcp-mp-playback-item-indicator" style="">'+
									'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
									'<div class="rtcp-mp-playback-item-indicator-circle" playbackspeed="1.5"></div>'+
									'<div class="rtcp-mp-playback-item-indicator-line"></div>'+
								'</div>'+
								'<div class="rtcp-mp-playback-item-text">1.5x</div>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>',
        	scrubberContainerDiv :
                '<div class="rtcp-mp-scrubber-container {{custom_class}}">' +
                '<div class="rtcp-mp-scrubber-button"></div>'+
                '</div>',
            mediaPlayerSettingView :
                '<div class="rtcp-mp-setting-view">' +
                '<div class="rtcp-mp-setting-mainview scrollbar">' +
                '<div class="rtcp-mp-setting-viewrow rtc-mp-annotation-setting " style="padding:0px;display: none;">' +
                '<div class="flexM rtcmp-icon-mp-annotation rtcp-mp-setting-view-icon"></div>'+
                '<div class="rtcp-mp-setting-view-lhs">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.annotations")+'</div>' +
                '<div class="rtcp-mp-setting-view-rhs" style="margin: 0;justify-content: flex-end">' +
                '<div class="rtcp-mp-setting-annotation-toogle">' +
                '<label class="zcl-switch zcl-switch-sm no-icon" style="margin: 0px;">'+
                '<input type="checkbox" mp-setting-button purpose="toogleAnnotation" >'+
                '<span class="rtcp-mp-slider">'+
                '<em class="switch"></em>'+
                '<div class="zcl-dot--loader">'+
                '<span></span>'+
                '<span></span>'+
                '<span></span>'+
                '</div>'+
                '</span>'+
                '</label>'+
                '</div>'+
                '</div>' +
                '</div>' +
                '<div class="rtcp-mp-setting-viewrow rtc-mp-bookmark-setting" style="padding:0px;display: none;">' +
                '<div class="flexM rtcmp-icon-star rtcp-mp-setting-view-icon"></div>'+
                '<div class="rtcp-mp-setting-view-lhs">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.bookmarks")+'</div>' +
                '<div class="rtcp-mp-setting-view-rhs" style="margin: 0;justify-content: flex-end">' +
                '<div class="rtcp-mp-setting-bookmark-toogle">' +
                '<label class="zcl-switch zcl-switch-sm no-icon" style="margin: 0px;">'+
                '<input type="checkbox" mp-setting-button purpose="toogleBookmark">'+
                '<span class="rtcp-mp-slider">'+
                '<em class="switch"></em>'+
                '<div class="zcl-dot--loader">'+
                '<span></span>'+
                '<span></span>'+
                '<span></span>'+
                '</div>'+
                '</span>'+
                '</label>'+
                '</div>'+
                '</div>' +
                '</div>' +
                
                '{{transcriptInSettings}}'+
                
                '{{downloadInSettings}}'+
                
                '{{reportAbuseInSettings}}'+
                
                '{{subtitleInSettings}}'+
                
                '{{qualityInSettings}}'+
                
                '{{audioTrackInSettings}}'+
                
                '<div class="rtcp-mp-setting-viewrow rtc-mp-pb-setting" rtcpmpbutton purpose="openPlayerSpeedSetting" style="padding:0px;">' +
                '<div class="flexM rtcmp-icon-mp-playback rtcp-mp-setting-view-icon "></div>'+
                '<div class="rtcp-mp-setting-view-lhs">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed")+'</div>' +
                '<div class="rtcp-mp-setting-view-rhs">' +
                '<div class="rtcp-mp-setting-pb-rate-text">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed.normal")+'</div>'+
                '<div class="rtcmp-icon-right-arrow flexM" style="display: flex;justify-content: flex-start;align-items: center;width: 24px;height:24px;font-size: 16px;padding:4px;margin: 0px 12px 0px 4px;"></div>'+
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="rtcp-mp-setting-subview"></div>'+
                '{{snapshot}}'+
                '</div>',
            mediaPlayerPlaybackSettings :
                '<div class="rtcp-mp-setting-viewrow {{currentsetting}}" rtcpmpbutton purpose="setPlaybackRate" playbackspeed="{{playbackspeed}}">' +
                '<div style="width: 35px; display: none;">'+
                '<div class="rtcmp-icon-right-arrow rtcp-mp-button" style="padding-right: 10px;padding-left: 10px;justify-content: center;align-items: center;text-align: center;display: flex;margin: 0px 12px 0px 4px;"></div>' +
                '</div>'+
                '<div class="rtcp-mp-setting-view-rhs" playbackspeed="{{playbackspeed}}" style="width: calc(100%);">{{playbackspeedtitle}}</div>' +
                '<div class="rtcp-mp-setting-pb-tick" style="width: 24px;height:24px;margin-right: 10px;/* display: none; */">' +
                '<div class="rtcmp-icon-tick" style="padding-right: 10px;padding-left: 10px;justify-content: center;align-items: center;text-align: center;display: flex;height: 100%;font-size: 15px;color: rgba(46, 204, 113, 1);"></div>' +
                '</div>'+
                '</div>',
            mediaPlayerSettingsBackDiv :
                '<div class="rtcp-mp-setting-mainmenu" rtcpmpbutton purpose="openSetting" style="height: 44px;border-bottom: 1px solid #40464C;">' +
                '<div style="display: flex;">' +
                '<div class="rtcmp-icon-left-arrow rtcp-mp-button" style="padding-right: 10px;justify-content: center;align-items: center;text-align: center;display: flex;font-size: 20px;cursor:pointer;"></div>' +
                '</div>' +
                '<div class="flexM" style="width: calc(100% - 35px);cursor:pointer;justify-content: flex-start;font-family:Lato;font-style: normal;font-weight: normal;font-size: 16px;line-height: 19px;color: #ffffff">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed")+'</div>' +
                '</div>',
            eventSearchBar :
                '<div class="rtcp-mp-events-searchbar">' +
                '<div class="rtcp-mp-events-searchbar-content">' +
                '<div class="flexM rtcp-mp-events-searchicon">' +
                '<span class="flexM rtcmp-icon-search2" style="width: auto;border: 0px;margin: auto;border-radius: inherit;display: flex;"></span>' +
                '</div>' +
                '<input class="rtcp-mp-events-search-input" type="text">' +
                '<div class="flexM rtcp-mp-events-search-closeicon dN" rtcpmpbutton purpose="clearEventsSearchBar">' +
                '<span class="flexM rtcmp-icon-closeB rtcp-mp-button" style="width: auto;border: 0px;margin: auto;border-radius: inherit;display: flex;color: rgba(255, 255, 255, 0.8);"></span>' +
                '</div>'+
                '</div>' +
                '</div>',

            liveStreamBar :
                '<div class="PT-vdo-bts flexM">'+
                '<div class="PT-action-icons" style="position : relative;">'+
                '<div class="PT-main-icons" style="display: flex; align-items: center; opacity: 1;">'+
                '<div class="PT-btn-neg" primetimebuttons="" purpose="leave" style="opacity: 1;">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.livestream.leave")+'</div>'+
                '</div>'+
                '</div>'+
                '<div class="PT-toggle-btns" style="display: flex; align-items: center;">'+
                /*
                '<div class="PT-box PT-hover rtcmp-icon-mini-player" title="Minimize" primetimebuttons="" purpose="minimizeWindow" style="opacity: 1;">'+
                '</div>'+
                '<div class="PT-box PT-hover rtcmp-icon-fullscrn" title="Open full screen" targetelemselector="body" primetimebuttons="" purpose="openInFullScreen" style="opacity: 1;">'+
                '</div>'+
                */
                '<div class="PT-box PT-hover font17 rtcmp-icon-chat" title="RTCPChat" openchatrhsbutton="" primetimebuttons="" purpose="openChatInRHS" style="opacity: 1;">'+
                '<span class="msgnotify" primetimeunreadmsgcount=""></span>'+
                '</div>'+
                '</div>'+
                '</div>',
            eventHeaderColumn :
                '<div style="" class="flexM rtcp-events-header-bar {{currentmodule}}" rtcpmpbutton purpose="gotoEventModule" modulename="{{modulename}}">' +
                	'<div class="flexM rtcp-events-header-icon {{moduleicon}}"></div>' +
                	'<div class="rtcp-events-header-title">{{modulename}}</div>' +
                	'<div class="rtcp-events-header-module-active"></div>'+
                '</div>',
            mediaplayerAnnotationConatainer :
                '<div class="rtcp-mp-annotation-container" rtcpmpbutton purpose="gotoAnnotationTime" mp-time={{time}} style="left: {{left}}">' +
                '<div class="rtcp-mp-annotation-button flexM rtcmp-icon-mp-annotation"></div>' +
                '</div>',
            mediaplayerBookmarkConatainer :
                '<div class="rtcp-mp-bookmark-container" rtcpmpbutton purpose="gotoBookmarkTime" mp-time={{time}} style="left: {{left}}">' +
                '<div class="rtcmp-icon-star rtcp-mp-bookmark-button flexM"></div>' +
                '</div>',
            toggleButton :
                '<label class="zcl-switch zcl-switch-sm no-icon mL20">'+
                '<input type="checkbox" {{input_attr}} purpose="{{purpose}}" {{checked}}>'+
                '<span class="slider">'+
                '<em class="switch"></em>'+
                '<div class="zcl-dot--loader">'+
                '<span></span>'+
                '<span></span>'+
                '<span></span>'+
                '</div>'+
                '</span>'+
                '</label>',
            spinner :
                '<div class="rtcp-mp-spinner" style=" display: none; ">' +
                '<div class="rtcp-mp-spinner-container">' +
                '<div class="rtcp-mp-spinner-rotator">' +
                '<div class="rtcp-mp-spinner-left">' +
                '<div class="rtcp-mp-spinner-circle"></div>' +
                '</div>' +
                '<div class="rtcp-mp-spinner-right">' +
                '<div class="rtcp-mp-spinner-circle"></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>',
            notSupportedHtml :
            	`<div class="rtcp-mp-notsupported">
            		<div class="rtcp-mp-supported-inner">
	            		<h1>Oops! Your browser version isn't supported</h1>
	            		<h2>Quickest solution? Kindly update to the latest version </h2>
	            		<div class="sad-img-outer">
	            			<img src="/images/sad.svg">
	            		</div>
            		<div>
            	</div>`,
            	mediaPlayerAudioUI :
                	'<div class="rtcp-mp-video-cont" style="display: inline-block;width: calc(100%);height: 100%;">'+
                    '<audio class="rtcmediaplayervideo" rtcpmpbutton purpose="pause" style="width: 100%;height: 100%;" poster=""></audio>'+
        	        	'<div class="closedContent {{rtcpdrag}}">'+
        	        		'<div class="closedContent-topheader-left {{rtcpdrag}}">'+
        	        			'{{progressbar}}'+
        	        			'<div class="audio-mini-controls" style="display:flex;position:relative;">{{miniAudioControls}}</div>'+
        	        		'</div>'+
        	        		'{{playlist}}'+
        	        		'<div class="closedContent-topheader-right {{rtcpdrag}}" style="right: 0px;">'+
        	        		'<div class="rtcmp-icon-dropbtn rtcmp-icon-opendropbtn tooltip-up" rtcpmpbutton purpose="expandMediaplayer" tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.expand")+" (i)")+'" style="margin-right: 8px;"></div>'+
        	        			'{{closedtopheader}}'+
    	        			'</div>'+	
    	        		'</div>'+
        	        	
        	        	
        	        	'<div class="audioOpenContent {{rtcpdrag}}">'+
        	        		'<div class="openAudioContent-topheader {{rtcpdrag}}">'+
        	        			'<div class="rtcp-mp-header-left-view {{rtcpdrag}}">'+
        	        				'<div class="rtcmp-icon-music" style="padding: 9px;"></div>'+
        	        				'{{mptitle}}'+
        	        			'</div>'+
        	        			'<div class="rtcp-mp-header-right-view">'+
        	        				'{{audiominiplayer}}'+
        	        				'{{mpclosebutton}}'+
        	        			'</div>'+
        	        		'</div>'+
        	        		
        	        		'<div class="audioPlayersec-open">'+
        	        			'<div class="rtcp-mp-time-display {{rtcpdrag}}">{{durationstart}}</div>'+
        	        			'{{mediaplayerseekbar}}'+
        	        			'<div class="rtcp-mp-time-display {{rtcpdrag}}">{{durationend}}</div>'+
        	        		'</div>'+
        	        		'{{mediaplayercontrolsDiv}}'+
        	            '</div>'+
        	            '{{expander}}'+
        	        '</div>',
                AVPlayBackSpeed:
                    	'<div class="audio_playbackspeed-selected tooltip-up" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed")+'">'+
                    		'<span class="rtcp-mp-speed-icon-text" style="font-size: 14px;cursor: pointer;opacity: 0.7;color: #fff;background:none;position: relative;display: flex;align-items: center;justify-content: center;padding: 0px;width: 20px;top: 0;transform: unset;font-weight: 400;">1x</span>'+
                    		'<div class="audio_playbackspeed">'+
                    			'<div class="rtcp-mp-playback-item-container" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="0.5">0.5x</div>'+
                    			'<div class="rtcp-mp-playback-item-container" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="0.75">0.75x</div>'+
                    			'<div class="rtcp-mp-playback-item-container rtcp-mp-playback-item-container-active" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="1">1x</div>'+
                    			'<div class="rtcp-mp-playback-item-container" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="1.5">1.5x</div>'+
                    			'<div class="rtcp-mp-playback-item-container" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="2">2x</div>'+
                    		'</div>'+
                    	'</div>',
                
                closedProgressBar :
                	'<div class="audio-progress-bar">'+
//                			'<div class="audio-seekbar-close"></div>'+
//                			'<div class="audio-progressbar-close" style="transition: transform 2000ms linear 0s; transform: rotate(0deg);background-image: conic-gradient(rgba(138, 180, 248, 1) 0deg,transparent 0);"></div>'+
//                			'<div class="audio-buffer-close"></div>'+
                			'{{miniAVSeekBar}}'+
                			'{{audiominiPlayPause}}'+
                			'</div>',
               
               closedAudioControl:
            	   '<div class="rtcp-mp-volume-area" style="margin-top: 9px;">'+
                	  '<div tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.mute")+" (m)")+'" style="position: relative;"><div rtcpmpbutton purpose="mute" class="rtcmp-icon-unmute-sound rtcp-mp-button" style="vertical-align: top;"></div></div>'+
                      '<div class="rtcp-mp-volume-panel">' +
                      	'<div class="rtcp-mp-volume-slider">' +
                      		'<div class="rtcp-mp-volume-slider-handle">' +
                      		'</div>'+
                      	'</div>'+
                      '</div>'+
                   '</div>',
          	  miniloop:
                	  '<div class="rtcmp-icon-replay tooltip-up" rtcpmpbutton purpose="loop" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.loop")+'"></div>',
              miniplayback:       
                	  '<div class="playbackspeed-selected-close" >'+
                	  	'<div class="playbackspeed-close tooltip-up" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed")+'">'+
                	  		'<div class="rtcp-mp-playback-item-container" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="0.5">0.5x</div>'+
                	  		'<div class="rtcp-mp-playback-item-container" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="0.75">0.75x</div>'+
                	  		'<div class="rtcp-mp-playback-item-container rtcp-mp-playback-item-container-active" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="1">1x</div>'+
                	  		'<div class="rtcp-mp-playback-item-container" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="1.5">1.5x</div>'+
                	  		'<div class="rtcp-mp-playback-item-container" rtcpmpbutton purpose="setNewPlaybackSpeed" playbackspeed="2">2x</div>'+
                	  	'</div>'+
                     '</div>',
              audioClosedHeader:
                	  '<div class="rtcmp-icon-closebtn {{customClass}} tooltip-up" rtcpmpbutton="" purpose="closeMediaPlayer" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.close")+'" style="margin-right: 8px;"></div>',
              audioVolumeButton :
            	  '<div class="rtcp_mp_audiovolume">'+
                          '<div class="rtcp-mp-volume-area">' +
                          '<div class="tooltip-up" tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.mute")+" (m)")+'" style="position: relative;"><div rtcpmpbutton purpose="mute" class="rtcmp-icon-unmute-sound rtcp-mp-button" style="vertical-align: top;"></div></div>'+
                          '<div class="rtcp-mp-volume-panel">' +
                          '<div class="rtcp-mp-volume-slider">' +
                          '<div class="rtcp-mp-volume-slider-handle">' +
                          '</div>'+
                          '</div>'+
                          '</div>'+
                          '</div>'+
                          '</div>',
              timeduration:
            	  '<div class="rtcp-mp-mini-duration {{rtcpdrag}}">'+
            	  '<span class="rtcp-mp-time-current audio-duration-start {{rtcpdrag}}" style="display:contents;">00:00</span><span class="{{rtcpdrag}}" style="font-size:13px;">/</span><span class="rtcp-mp-time-duration audio-duration-end {{rtcpdrag}}"style="display:contents;">00:00</span></div>',
              audioMiniSeekBar:
            	  	'<div class="audio-seekbar-close"></div>'+
      				'<div class="audio-progressbar-close" style="transition: transform 2000ms linear 0s; transform: rotate(0deg);background-image: conic-gradient(rgba(138, 180, 248, 1) 0deg,transparent 0);"></div>'+
      				'<div class="audio-buffer-close"></div>'+
      				'{{extra}}',
      		audioMiniPlayPause:
      			'<div class="pauseAndplay" rtcpmpbutton purpose="pause">'+
				'<span class="rtcmp-icon-mp-playpause-mini"></span>'+
				'</div>',
			miniVideoPlayPause:
				'<div class="rtcp-mp-mini-player-hover">'+
				'<div class="rtcp-mp-mini-player-state rtcmp-icon-mini-player-hover-state" purpose="pause" rtcpmpbutton rtcp-mp-bottom></div>'+
			'</div>',
              miniAudioControls:
                    	  '<div class="rtcmediaplayecontrolsmini" style="display:flex;justify-content:space-between;align-items: center;cursor:auto;">'+
                    	  '{{timedisplay}}'+
                    	  '{{volumebutton}}'+
                          '{{loopbutton}}'+
                          '<span class="playbackspeed-value" >1x</span>'+
                          '</div>',
          reactionItem :
			'<div class="smartconf-reaction-item smartconf-reaction-item-{{order}}">'+
				'{{reaction}}'+
			'</div>',
		  rebortAbuse:
				'<div class="rtcp-mp-reportabuse rtcp-mp-button tooltip-up tooltip-right0" rtcpmpbutton purpose="reportabuse" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.reportabuse")+'"><div class="rtcmp-icon-mp-rebortabuse-icon"></div></div>',
		  snapshot:
			  '<div class="rtcp-mp-snapshot rtcp-mp-button" rtcpmpbutton purpose="snapshot" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.snapshot")+'"><div class="rtcmp-icon-mp-camera-icon"></div></div>',
		reportAbuseInSettings:
				  '<div class="rtcp-mp-setting-viewrow rtc-mp-reportabuse-setting" rtcpmpbutton purpose="reportabuse" style="padding:0px;">'+
	                '<div class="flexM rtcmp-icon-mp-rebortabuse-icon  rtcp-mp-setting-view-icon"></div>'+
	                '<div class="rtcp-mp-setting-full-view">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.reportabuse")+'</div>'+
	                '</div>',
        downloadInSettings:
        	'<div class="rtcp-mp-setting-viewrow rtc-mp-download-setting" rtcpmpbutton purpose="download" style="padding:0px;">'+
            '<div class="flexM rtcmp-icon-mp-download  rtcp-mp-setting-view-icon"></div>'+
            '<div class="rtcp-mp-setting-full-view">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.download")+'</div>'+
            '</div>',
        defaultEventContainer :
    	'<div id="{{eventcontainerid}}">'+
	        '{{eventContainerhtml}}'+
		'</div>',
		eventContainerHtml :
		'<div mediaplayerid={{mediaplayerdivid}} rtcp-mp-event-cont class="rtcpmediaplayerdiv" style="width:420px;display:none;height:100%">'+	
	    	'<div class="rtcp-mp-events-container">'+
				'<div class="rtcp-mp-events-header-topbar" rtcpmpbutton purpose="closeEventsContainer">'+
					'<div class="rtcp-mp-events-header-topbar-content">'+
						'<div class="rtcmp-icon-left-arrow rtcp-mp-events-header-topbar-content-back"></div>'+
						'<div class="rtcp-mp-events-header-topbar-content-heading">Chapters</div>'+
					'</div>'+
				'</div>'+
				'<div class="rtcp-mp-events-header rtcp-mp-events-header-traverse">'+
					'<div class="rtcp-mp-events-traverse-left" rtcpmpbutton purpose="traverseHeaderReverse">'+
						'<div class="rtcmp-icon-left-arrow rtcp-mp-events-traverse-icon"></div>'+
					'</div>'+
					'<div class="rtcp-events-header-module"></div>'+
					'<div class="rtcp-mp-events-traverse-right" rtcpmpbutton purpose="traverseHeaderForward">'+
						'<div class="rtcmp-icon-right-arrow rtcp-mp-events-traverse-icon"></div>'+
					'</div>'+
					'<div class="flexm rtcp-events-selectpicker" style="width: 10vw;display: none;"></div>'+
				'</div>'+
				'{{searchbar}}'+
				'<div class="rtcp-mp-events-content scrollbar"></div>'+
				'<div class="rtcp-mp-sync-container" style="display: none;"><div rtcpmpbutton purpose="syncEvents" class="rtcp-mp-sync-button">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.events.synctime")+'</div></div>'+
			'</div>'+
		'</div>',
	      transcriptInSettings:
			  '<div class="rtcp-mp-setting-viewrow rtc-mp-transcript-setting" rtcpmpbutton purpose="transcript" style="padding:0px;">'+
                '<div class="flexM rtcmp-icon-mp-transcript  rtcp-mp-setting-view-icon"></div>'+
                '<div class="rtcp-mp-setting-full-view">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.transcript")+'</div>'+
               '</div>',
	      transcriptDiv:
	    	  '<div class="rtcp-mp-transcript rtcp-mp-button tooltip-up tooltip-right0" rtcpmpbutton purpose="transcript" tooltip-title="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.transcript")+'"><div class="rtcmp-icon-mp-transcript"></div></div>',

	    	  customControlIcon :
	    		  '<div class="rtcp-mp-custom-control rtcp-mp-button tooltip-up" rtcpmpbutton purpose="customControl" tooltip-title="{{title}}"><div class="{{className}}"></div></div>',

	      subtitleInSettings:
	    	  '<div class="rtcp-mp-setting-viewrow rtc-mp-subtitle-setting" rtcpmpbutton purpose="enableSubtitle" style="padding:0px;">' +
              '<div class="flexM rtcmp-icon-mp-subtitle rtcp-mp-setting-view-icon "></div>'+
              '<div class="rtcp-mp-setting-view-lhs">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitlecc")+'</div>' +
              '<div class="rtcp-mp-setting-view-rhs">' +
              '<div class="rtcp-mp-setting-subtitle-text">Off</div>'+
              '<div class="rtcmp-icon-right-arrow flexM" style="display: flex;justify-content: flex-start;align-items: center;width: 24px;height:24px;font-size: 16px;padding:4px;margin: 0px 12px 0px 4px;"></div>'+
              '</div>' +
              '</div>' ,
          qualityInSettings:
	    	  '<div class="rtcp-mp-setting-viewrow rtc-mp-quality-setting" rtcpmpbutton purpose="openQualities" style="padding:0px;">' +
              '<div class="flexM rtcmp-icon-mp-quality rtcp-mp-setting-view-icon "></div>'+
              '<div class="rtcp-mp-setting-view-lhs">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.quality")+'</div>' +
              '<div class="rtcp-mp-setting-view-rhs">' +
              '<div class="rtcp-mp-setting-qualityrate-text">1080p</div>'+
              '<div class="rtcmp-icon-right-arrow flexM" style="display: flex;justify-content: flex-start;align-items: center;width: 24px;height:24px;font-size: 16px;padding:4px;margin: 0px 12px 0px 4px;"></div>'+
              '</div>' +
              '</div>' ,
          qualityContainer:
        	  '<div class="rtcp-mp-setting-mainmenu" rtcpmpbutton="" purpose="openSetting" style="height: 44px;border-bottom: 1px solid #40464C;">'+
	        	  '<div style="display: flex;">'+
	        	  	'<div class="rtcmp-icon-left-arrow rtcp-mp-button" style="padding-right: 10px;justify-content: center;align-items: center;text-align: center;display: flex;font-size: 20px;cursor:pointer;"></div>'+
	        	  '</div>'+
	        	  '<div class="flexM" style="width: calc(100% - 35px);cursor:pointer;justify-content: flex-start;font-family:Lato;font-style: normal;font-weight: normal;font-size: 16px;line-height: 19px;color: #ffffff">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.quality")+'</div>'+
        	  '</div>',
	      qualityLevels:
                '<div class="rtcp-mp-setting-viewrow" rtcpmpbutton purpose="setQuality" qualityrate="{{qualityrate}}">' +
	                '<div class="rtcp-mp-setting-view-rhs" qualityrate="{{qualityrate}}" style="width: calc(100%);"><span>{{qualityratetitle}}<sup class="ytp-swatch-color-white">{{subscript}}</sup></span></div>' +
	                '<div class="rtcp-mp-setting-pb-tick" style="width: 24px;height:24px;margin-right: 10px;/* display: none; */">' +
	                	'<div class="rtcmp-icon-tick" style="padding-right: 10px;padding-left: 10px;justify-content: center;align-items: center;text-align: center;display: flex;height: 100%;font-size: 15px;color: rgba(46, 204, 113, 1);"></div>' +
	                '</div>'+
                '</div>',
          subtitleContainer :
        	   '<div class="rtcp-mp-setting-mainmenu" rtcpmpbutton="" purpose="openSetting" style="height: 44px;border-bottom: 1px solid #40464C;">'+
	        	  '<div style="display: flex;">'+
	        	  	'<div class="rtcmp-icon-left-arrow rtcp-mp-button" style="padding-right: 10px;justify-content: center;align-items: center;text-align: center;display: flex;font-size: 20px;cursor:pointer;"></div>'+
	        	  '</div>'+
	        	  '<div class="flexM" style="width: calc(100% - 35px);cursor:pointer;justify-content: flex-start;font-family:Lato;font-style: normal;font-weight: normal;font-size: 16px;line-height: 19px;color: #ffffff">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitlecc")+'</div>'+
	        	'</div>',
	      subtitlesInnerDiv :
	        	'<div class="rtcp-mp-setting-viewrow" rtcpmpbutton purpose="setSubtitle" subtitle="{{subtitle}}">' +
	                '<div class="rtcp-mp-setting-view-rhs" subtitle="{{subtitle}}" style="width: calc(100%);">{{subtitleHeading}}</div>' +
	                '<div class="rtcp-mp-setting-pb-tick" style="width: 24px;height:24px;margin-right: 10px;/* display: none; */">' +
	                	'<div class="rtcmp-icon-tick" style="padding-right: 10px;padding-left: 10px;justify-content: center;align-items: center;text-align: center;display: flex;height: 100%;font-size: 15px;color: rgba(46, 204, 113, 1);"></div>' +
	                '</div>'+
                '</div>',
          audioTrackInSettings:
        	  '<div class="rtcp-mp-setting-viewrow rtc-mp-audiotrack-setting" rtcpmpbutton purpose="openAudioTrack" style="padding:0px;">' +
              '<div class="flexM rtcmp-icon-mp-audiotrack rtcp-mp-setting-view-icon "></div>'+
              '<div class="rtcp-mp-setting-view-lhs">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.audiotrack")+'</div>' +
              '<div class="rtcp-mp-setting-view-rhs">' +
              '<div class="rtcp-mp-setting-audiotrack-text">English</div>'+
              '<div class="rtcmp-icon-right-arrow flexM" style="display: flex;justify-content: flex-start;align-items: center;width: 24px;height:24px;font-size: 16px;padding:4px;margin: 0px 12px 0px 4px;"></div>'+
              '</div>' +
              '</div>',
          audioTrackContainer:
        	  '<div class="rtcp-mp-setting-mainmenu" rtcpmpbutton="" purpose="openSetting" style="height: 44px;border-bottom: 1px solid #40464C;">'+
	        	  '<div style="display: flex;">'+
	        	  	'<div class="rtcmp-icon-left-arrow rtcp-mp-button" style="padding-right: 10px;justify-content: center;align-items: center;text-align: center;display: flex;font-size: 20px;cursor:pointer;"></div>'+
	        	  '</div>'+
	        	  '<div class="flexM" style="width: calc(100% - 35px);cursor:pointer;justify-content: flex-start;font-family:Lato;font-style: normal;font-weight: normal;font-size: 16px;line-height: 19px;color: #ffffff">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.audiotrack")+'</div>'+
	        	'</div>',
    	  audioTracksLanguages :
    		  '<div class="rtcp-mp-setting-viewrow" rtcpmpbutton purpose="setAudioTrack" audiotrack="{{audiotrack}}">' +
	              '<div class="rtcp-mp-setting-view-rhs" audiotrack="{{audiotrack}}" style="width: calc(100%);">{{audiotracktitle}}</div>' +
	              '<div class="rtcp-mp-setting-pb-tick" style="width: 24px;height:24px;margin-right: 10px;/* display: none; */">' +
	              	'<div class="rtcmp-icon-tick" style="padding-right: 10px;padding-left: 10px;justify-content: center;align-items: center;text-align: center;display: flex;height: 100%;font-size: 15px;color: rgba(46, 204, 113, 1);"></div>' +
	              '</div>'+
	          '</div>',

	          gradientEffect : 
	        	  '<div class="rtcp-mp-top-gradient"></div>'+
	        	  '<div class="rtcp-mp-bottom-gradient"></div>',
            
            noSearchResultHtml :
                    '<div class="rtcp-mp-no-result">'+
                        '<div class="rtcp-mp-no-result-emoji"><span>&#x1F915;</span></div>'+
                        '<div class="rtcp-mp-no-result-header"><b>"No Results Found"</b></div>'+
                        "<div class='rtcp-mp-no-result-info'>Sorry, we couldn't find what you were looking for. <br/> Would you like to try searching for something else?</div>"+
                    '</div>',
            
            autoPlayPoster : 
                    '<div class="rtcp-mp-video-pause-state dN {{rtcpdrag}}">'+
                        '<div class="rtcp-mp-video-ap-pause {{rtcpdrag}} " style="background-image:url(\'{{posterUrl}} \')">'+
                            '<div class="rtcp-mp-video-ap-pause-text" style="display:none;">Start playing video</div>'+
                        '</div>'+
						'<div class="rtcmp-icon-mp-pausestate-play rtcp-mp-button" purpose="autoplaystart" rtcpmpbutton ></div>'+
					'</div>'
                
        }

	var _getAutoPlayPoster = function(posterUrl, rtcpDrag)
	{
		return $RTCPTemplate.replace(_templates.autoPlayPoster, {
			posterUrl : posterUrl,
			rtcpDrag : rtcpDrag
		}, "InSecureHTML");
	}

    var _getMediaPlayerDiv = function (id,mode,title, configMap,eventContainerDivID)
    {
        return $RTCPTemplate.replace(_templates.rtcmediaPlayerDiv, {
            mediaplayerui : _getMediaPlayerUi(mode,title, configMap),
            mode : mode,
            id : id,
            zindex : configMap.zindex,
            eventcontainerdiv : eventContainerDivID ? '' : _getEventDefaultEventContainer(id,"event_cont_"+id),
			type : configMap.AV
        }, "InSecureHTML");
    }

    var _getMediaPlayerUi = function (mode,title,configMap)
    {
    	if(configMap.AV == "video"){
	        return $RTCPTemplate.replace(_templates.mediaPlayerUI, {
	            //mediaplayerchapter : mode == "stream" ? '' : _getMediaPlayerChapter(0,0,100,0,0),
	            //hovertimediv : _getHoverTimeDiv()
	            //mediaplayercontrolsDiv :  mode == "stream" ? '' : _getMediaPlayerControlsDiv(),
	            mediaplayerseekbar : _getMediaPlayerSeekBar(mode,configMap),
	            mptooltippreview :  mode == "livestream" ? '' : configMap.tooltip == "disable" ? '' : _getMediaPlayerTooltipPreview(),
	            mpclosebutton : configMap.closeNeeded == "disable" ? '' : _getMediaPlayerCloseButton(configMap),
	            popoutbutton : _getMediaPlayerPopouButton(configMap),
	            setting : _getMediaPlayerSettingView(mode,configMap),
	            searchbar : _getMediaPlayerEventSearchBar(),
	            mptitle : configMap.title == "disable" ? '' : _getMediaplaterTitle(title,configMap),
	            annotationpreview : configMap.tooltip == "disable" ? '' : '<div class="ellips rtcp-mp-annotation-text-preview dN"></div>',
	            livestreambottombar : '', //mode == "livestream" ? _templates.liveStreamBar : '',
	            spinner : _getMediaPlayerSpinner(),
	            cursor : configMap.drag == "enable" ? "move" : "default",
	    		expander : configMap.resize == "disable" ? '' : '<div class="rtcp-mp-resize-component"><div class="rtcp-mp-resize-top"></div><div class="rtcp-mp-resize-topRight"></div><div class="rtcp-mp-resize-right"></div><div class="rtcp-mp-resize-bottomRight"></div><div class="rtcp-mp-resize-bottom"></div><div class="rtcp-mp-resize-bottomLeft"></div><div class="rtcp-mp-resize-left"></div><div class="rtcp-mp-resize-topLeft"></div></div>',
	    		newPlaybackSpeedDiv : _templates.newPlaybackSpeedDiv,
	    		miniPauseOrPlay :configMap.pauseOrPlay == "disable" ? "" : _templates.miniVideoPlayPause,
	    		posterUrl:(configMap.posterUrl != undefined) ? configMap.posterUrl : "",
	    		autoplay : configMap.autoplay == "disable" ? "" : "autoplay",
	    		rtcpdrag :  configMap.drag == "enable" ? "rtcpdrag" : "",
	    		snapshotFlash : configMap.snapshot == "enable" && configMap.AV != "audio" ? '<div class="rtcp-video-player-snap" style="display: none;"></div>':"" ,
                gradientEffect : configMap.gradientOnHover === "enable" ? _templates.gradientEffect : "",
				closeCustomClass: configMap.customClassNames.close || "",
				autoPlayPoster : typeof configMap.posterUrl === "string" ? _getAutoPlayPoster(configMap.posterUrl, configMap.drag == "enable" ? "rtcpdrag" : "") : ""
	        }, "InSecureHTML");
    	}
    	else{
    		return $RTCPTemplate.replace(_templates.mediaPlayerAudioUI, {
    			//audioheader : configMap.title == "disable" ? '' : _getMediaplaterTitle(title) ,
    			mptitle : configMap.title == "disable" ? '' : _getMediaplaterTitle(title,configMap),
    			mpclosebutton : configMap.closeNeeded == "disable" ? '' : _getMediaPlayerCloseButton(configMap),
    			progressbar : (configMap.pauseOrPlay == "disable" && configMap.seekbar == "disable")?"":_getProgressBarClosedContent(mode , configMap),
    			miniAudioControls:_getAudioControls(mode, configMap),
    			mediaplayerseekbar : _getMediaPlayerSeekBar(mode,configMap),
    			mediaplayercontrolsDiv : configMap.bottomControls == "disable" ? '<div class="rtcmediaplayecontrols"></div>' : _getMediaPlayerControlsDiv(mode, configMap),
    			mptooltippreview :  mode == "livestream" ? '' : configMap.tooltip == "disable" ? '' : _getMediaPlayerTooltipPreview(),
    			closedtopheader : configMap.closeNeeded == "disable" ? '' : _getAudioClosedTopHeader(configMap),
    			cursor : configMap.drag == "enable" ? "move" : "default",
				rtcpdrag :  configMap.drag == "enable" ? "rtcpdrag" : "",
    			expander : configMap.resize == "disable" ? '' : '<div class="rtcp-mp-resize-component"><div class="rtcp-mp-resize-top"></div><div class="rtcp-mp-resize-topRight"></div><div class="rtcp-mp-resize-right"></div><div class="rtcp-mp-resize-bottomRight"></div><div class="rtcp-mp-resize-bottom"></div><div class="rtcp-mp-resize-bottomLeft"></div><div class="rtcp-mp-resize-left"></div><div class="rtcp-mp-resize-topLeft"></div></div>',
    			durationstart : mode == "livestream" ? '' : configMap.AV == "video" ? '' : configMap.time == "disable" ? "" : '<div class="rtcp-mp-time-current'+((configMap.drag == "enable")?' rtcpdrag':"")+'">00:00</div>',
    			durationend : mode == "livestream" ? '' : configMap.AV == "video" ? '' : configMap.time == "disable" ? "" : '<div class="rtcp-mp-time-duration'+((configMap.drag == "enable")?' rtcpdrag':"")+'">00:00</div>',
    			audiominiplayer:configMap.minimisePlayer == "disable" ? "" : _getMiniPlayerChange(),
    			playlist:configMap.seperatePlaybackSpeed == "disable" ? '' :  _templates.miniplayback,
    			autoplay : configMap.autoplay == "disable" ? "" : "autoplay"
    		}, "InSecureHTML");
    	}

    }

	var _getScruberContainerHtml = function(configMap)
	{
		return $RTCPTemplate.replace(_templates.scrubberContainerDiv, {
			custom_class : configMap.autoStartLoad === "enable" ? "" : "dN"
		}, "InSecureHTML");
	}

    var _getMediaPlayerSeekBar = function (mode, configMap)
    {
        return $RTCPTemplate.replace(_templates.mediaPlayerSeekBar, {
        	cursorneeded : mode == "livestream" ? '' : configMap.seekbar == "disable" ? '' :  'cursor:pointer;',
        	scrubercontainer : mode == "livestream" ? '' : configMap.seekbar == "disable" ? '' : _getScruberContainerHtml(configMap),
        	liveButton : mode == "livestream" ? (configMap.liveButton == "disable" ? '': '<div class="rtcp-mp-golive-text" rtcp-live-text="'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.livestream.live")+'"></div>'):'',
            mediaplayerchapter : mode == "livestream" ? '' : configMap.seekbar == "disable" ? '' :  _getMediaPlayerChapter(0,0,100,0,0),
            mediaplayercontrolsDiv : configMap.AV == "audio" ? '' : (configMap.bottomControls == "disable" ? '<div class="rtcmediaplayecontrols"></div>' : _getMediaPlayerControlsDiv(mode, configMap)),
            audiotooltip : mode == "livestream" ? '' : configMap.AV == "audio" ? configMap.tooltip == "enable" ? '<div class="rtcp-mp-bottom rtcp-mp-preview rtcp-mp-tooltip dN">00:00</div>' : '' :'',
            leaveButton : configMap.AV == "audio" ? '' : configMap.leaveButton == "disable" ? "" : '<div class="rtc-mp-ls-leave-button" rtcpmpbutton purpose="leaveMediaPlayerLS" rtcp-mp-control-button purpose="close">'+RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.livestream.leave")+'</div>'            		
        }, "InSecureHTML");

    }
    var _getMediaPlayerChapter = function (st,et,width,mrh,totalMrh)
    {
        return $RTCPTemplate.replace(_templates.mediapPlayerChapter, {
            st : st,
            et : et,
            width :width,
            mrh : mrh,
            totalmrh : totalMrh
        }, "InSecureHTML");
    }

    var _getHoverTimeDiv = function ()
    {
        return _templates.hoverTimeDiv;
    }

    var _getMediaPlayerTooltipPreview = function ()
    {
        return _templates.mediaPlayerTooltipPreview;
    }

    var _getMediaPlayerTooltipContent = function (title, time,bgImageNedded)
    {
        return $RTCPTemplate.replace(_templates.mediaPlayerTooltipContent, {
            title : RTCMediaPlayerConstants.processXSS(title) ,
            time : time,
            bgdiv : bgImageNedded ? '<div class="rtcp-mp-tooltip-bg" style="width: 158px;height: 90px;background-position : center;background-repeat : no-repeat;background-color: #084E84;background-size: cover;"></div>' : ''
        }, "InSecureHTML");
    }

    var _getMediaPlayerCloseButton = function (config)
    {
		return $RTCPTemplate.replace(_templates.mediaPlayerCloseButton, {
			customClass: config.customClassNames.close || "",
		}, "InSecureHTML");
    }

    var _getMediaPlayerPopouButton = function (config)
    {
		return $RTCPTemplate.replace(_templates.mediaPlayerPopoutButton, {
			customClass: config.customClassNames.expand || "",
		}, "InSecureHTML");
    }

    var _getMediaplaterTitle = function (title,configMap)
    {
        return $RTCPTemplate.replace(_templates.mediaplayertitle, {
            title : RTCMediaPlayerConstants.processXSS(title),
            rtcpdrag :  configMap.drag == "enable" ? "rtcpdrag" : ""
        }, "InSecureHTML");
    }

    var _getEventsContainerTable = function (tableBody, selectPickerHtml)
    {
        return $RTCPTemplate.replace(_templates.eventsContainerTable, {
            eventcontainerbody : tableBody
            //opthtml : selectPickerHtml
        }, "InSecureHTML");
    }
    var _getEventContainerRow = function (title, userName,moduleName,formatedTime,endTime,startRawTime,endRawTime,icon,track,descHTML,imgurl,desc, mediaPlayerId, userId)
    {
        userName = RTCMediaPlayerConstants.processXSS(userName);
        return $RTCPTemplate.replace(_templates.eventsContainerRow, {
            title : RTCMediaPlayerConstants.processXSS(title),
            username : userName,
            userandtimeinfo : formatedTime + ' - ' + endTime,
            stime : startRawTime,
            etime : endRawTime,
            icon : icon,
            deschtml : descHTML ? descHTML : '',
            desc_purpose : desc ? 'openDesc' : 'gotoEventTime',
            chapter_purpose : 'gotoEventTime',
            track : track,
            modulename : moduleName,
            imgurl : imgurl,
            starttime : formatedTime,
            endtime : endTime,
            desc : desc ? desc : '',
			onerror_img : (mediaPlayerId && userId) ? `playerId="${mediaPlayerId}" userName="${userName}" userId="${userId}" onerror="RTCMediaplayerUIHandler.handleImageError(this)"` : ""
        }, "InSecureHTML");
    }
    var _getEventChapterDescription = function (imgurl, desc)
    {
        return $RTCPTemplate.replace(_templates.mediaPlayerEventsChapterDescription, {
            imgurl : imgurl,
            desc : desc
        }, "InSecureHTML");
    }
    var _getMediaPlayerControlsDiv = function (mode, configMap)
    {
        return $RTCPTemplate.replace(_templates.mediaPlayerControlsDiv, {
        	rtcpdrag :  configMap.AV == "audio" ? configMap.drag == "enable" ? "rtcpdrag" : "":"",
            playorpause : configMap.pauseOrPlay == "disable" ? "" : _templates.playAndPauseButton,
            volumebotton : configMap.volume == "disable" ? "" :configMap.AV == "audio" ? _templates.audioVolumeButton : _templates.volumeButton,
            timedisplay : configMap.AV == "audio" ? '' : configMap.time == "disable" ? "" : _templates.timeDisplayDiv,
            chaptercontainer : configMap.events == "disable"? "" :(configMap.chaptersHeading == "disable"?"": _templates.eventContainerControlDiv),        	
            pipDiv : configMap.AV == "audio" ? '' : document.pictureInPictureEnabled ? configMap.pictureInPicture == "disable" ? "" : _templates.pipDiv : '',
            settingDiv : configMap.AV == "audio" ? '' : configMap.settings == "disable" ? "" : _templates.settingsDiv,
            miniplayerDiv : configMap.minimisePlayer == "disable" ? "" :(configMap.AV == "audio" ? "":_templates.miniPlayerDiv),
            fullscreenDiv : configMap.AV == "audio" ? '' : configMap.maximisePlayer == "disable" ? "" : _templates.fullScreenDiv,
    		downloadDiv : configMap.AV == "audio" ? '' :(configMap.download == "disable" ? "" : _templates.downloadDiv),
    		//leaveButton : configMap.AV == "audio" ? '' : configMap.leaveButton == "disable" ? "" : '<div class="rtc-mp-ls-leave-button" rtcpmpbutton purpose="leaveMediaPlayerLS" rtcp-mp-control-button purpose="close">Leave</div>',
			playbackSpeedDiv : configMap.AV == "audio" ? '' : configMap.seperatePlaybackSpeed == "disable" ? '' : _getPlaybackSpeedDiv(configMap),
			loopbutton : configMap.AV == "video" ? '' : configMap.loop == "disable" ? '' : _templates.loopButton,
			audiospeed : configMap.AV == "video" ? '' : configMap.seperatePlaybackSpeed == "disable" ? '' : _templates.AVPlayBackSpeed,
			download : configMap.AV != "audio" ? '' :configMap.download == "disable" ? '' : _templates.downloadDiv,
			loop : (configMap.loop != "disable" && configMap.AV!="audio") ? _templates.loopButton : "",
			seekforwrd : (configMap.forwardSeek != "disable" ? '<div class="rtcp-mp-bezel-icon rtcmp-icon-mp-bezel-seek rtcmp-forwardseek" rtcpmpbutton purpose="forwardseek"></div>':""),
			seekbackward:(configMap.backwardSeek != "disable" ? '<div class="rtcp-mp-bezel-icon rtcmp-icon-mp-bezel-seek rtcmp-backwardseek" rtcpmpbutton purpose="backwardseek"></div>':""),
			reportabuse:configMap.AV == "video"?((configMap.separateReportAbuse!="disable")? _templates.rebortAbuse:""):'',
			snapshot : configMap.snapshot != "disable" && configMap.AV != "audio"  ? _templates.snapshot:'',
			transcript : configMap.AV == "video"?(configMap.transcript != "disable" ?_templates.transcriptDiv:''):'',
			//audioreportabuse:configMap.AV == "audio"?((configMap.separateReportAbuse!="disable")? _templates.rebortAbuse:""):'',
			audiotranscript: configMap.AV == "audio"?(configMap.transcript != "disable" ?_templates.transcriptDiv:''):'',
            customIcons : _getCustomIconsHtml(configMap.customIcons)
        }, "InSecureHTML");
    }

    var _getCustomIconsHtml = function(customIcons)
    {
    	if(!Array.isArray(customIcons) || !customIcons.length)
    	{
    		return "";
    	}

    	var html = "";

    	for(var customIcon of customIcons)
    	{
    		html += $RTCPTemplate.replace(_templates.customControlIcon, {
    			title : RTCMediaPlayerConstants.processXSS(customIcon.title),
    			className : customIcon.className
    		}, "InSecureHTML");
    	}

    	return html;
    }

    var _getMediaPlayerSettingView = function (mode,configMap)
    {
        return $RTCPTemplate.replace(_templates.mediaPlayerSettingView, {
        	snapshot : configMap.snapshot != "disable" ? _templates.snapshot:'',
        	reportAbuseInSettings : configMap.reportAbuseInSettings != "disable" ? _templates.reportAbuseInSettings:'',
        	downloadInSettings:configMap.downloadInSettings != "disable" ? _templates.downloadInSettings : '',
        	transcriptInSettings:configMap.transcriptInSettings == "enable"?_templates.transcriptInSettings:'',
        	subtitleInSettings:configMap.subtitleInSettings == "enable"?_templates.subtitleInSettings:'',
        	qualityInSettings:configMap.qualityInSettings == "enable"?_templates.qualityInSettings:'',
        	audioTrackInSettings:configMap.audioTrackInSettings == "enable"?_templates.audioTrackInSettings:''
        }, "InSecureHTML");
    }
    var _getVolumeDetail = function (){
    	return _templates.volumeButton;
    }
    
    var _getMediaPlayerPlackbackSettings = function (playbackSpeed,currenSetting)
    {
        return $RTCPTemplate.replace(_templates.mediaPlayerPlaybackSettings, {
            playbackspeed : playbackSpeed,
            currentsetting : currenSetting == playbackSpeed ? 'currentsetting' : '',
            playbackspeedtitle : playbackSpeed == 1 ? RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.playbackspeed.normal") : playbackSpeed+'x'
        }, "InSecureHTML");
    }
    
    var _getMediaPlayerQualityLevels = function(qualitylevel,subscript)
    {
    	return $RTCPTemplate.replace(_templates.qualityLevels,{
    		qualityrate : qualitylevel,
    		qualityratetitle : qualitylevel == -1 ? RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.quality.auto") : qualitylevel,
    		subscript : subscript
    	}, "InSecureHTML");
    }
    
    var _getMediaPlayerSubtileLanguages = function(subtitle)
    {
    	var languageNames = new Intl.DisplayNames(["en"], { type: "language" });
    	return $RTCPTemplate.replace(_templates.subtitlesInnerDiv,{
    		subtitle : subtitle == -1 ? RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitle.off") : subtitle,
    		subtitleHeading:subtitle == RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.settings.subtitle.off") ? subtitle :languageNames.of(subtitle)
    	}, "InSecureHTML");
    }
    
    var _getMediaPlayerAudioTracksLanguages = function(audiotrack)
    {
    	var languageNames = new Intl.DisplayNames(["en"], { type: "language" });
    	return $RTCPTemplate.replace(_templates.audioTracksLanguages,{
    		audiotrack : audiotrack,
    		audiotracktitle : languageNames.of(audiotrack)
    	}, "InSecureHTML");
    }
    
    var _getMediaPlayerEventSearchBar = function ()
    {
        return _templates.eventSearchBar;
    }
    var _getEventHeaderColumn = function (moduleicon,modulename,currentModule)
    {
        return $RTCPTemplate.replace(_templates.eventHeaderColumn, {
            moduleicon : moduleicon,
            modulename : RTCMediaPlayerConstants.processXSS(modulename),
            currentmodule : currentModule ? 'currentmodule' : ''
        }, "InSecureHTML");
    }
    var _getMediaPlayerSettingsBackDiv = function ()
    {
        return _templates.mediaPlayerSettingsBackDiv;
    }
    
    var _getMediaPlayerQualityDiv = function()
    {
    	return _templates.qualityContainer;
    }
    
    var _getMediaPlayerAudioTrackDiv = function()
    {
    	return _templates.audioTrackContainer;
    }
    
    var _getMediaPlayerSubtitleDiv = function()
    {
    	return _templates.subtitleContainer;
    }

    var _getMediaplayerAnnotationConatainer = function (left,time)
    {
        return $RTCPTemplate.replace(_templates.mediaplayerAnnotationConatainer, {
            left : left,
            time : time
        }, "InSecureHTML");
    }

    var _getMediaplayerBookmarkConatainer = function (left,time)
    {
        return $RTCPTemplate.replace(_templates.mediaplayerBookmarkConatainer, {
            left : left,
            time : time
        }, "InSecureHTML");
    }

    var _getToggleButton = function(inputAttr, purpose, isSelected)
    {
        return $RTCPTemplate.replace(_templates.toggleButton, {
            input_attr : inputAttr,
            purpose : purpose,
            checked : isSelected ? "checked" : ""	//NO I18N
        });
    }

    var _getMediaPlayerSpinner = function ()
    {
        return _templates.spinner;
    }
    
    var _getPlaybackSpeedDiv = function(configMap)
    {
    	return $RTCPTemplate.replace(_templates.playbackSpeedDiv, {
    		playbackspeed_icon_text : configMap.playbackspeedIconText == "enable"?'<div class="rtcp-mp-speed-icon-text">1x</div>':'',
    		options : _templates.newPlaybackSpeedDiv
        }, "InSecureHTML");
    	return _templates.playbackSpeedDiv;
    }
    
    var _getNotSupportedHtml = function()
    {
    	return _templates.notSupportedHtml;
    }
    var  _getProgressBarClosedContent = function(mode, configMap){
    	return $RTCPTemplate.replace(_templates.closedProgressBar, {
    		miniAVSeekBar :  configMap.seekbar == "enable" ?_getAudioMiniSeekbar(mode,configMap) : "",
    		audiominiPlayPause:configMap.pauseOrPlay == "disable" ? "" :_templates.audioMiniPlayPause
        }, "InSecureHTML");
    }
    
    var _getAudioMiniSeekbar = function(mode,configMap){
    	return $RTCPTemplate.replace(_templates.audioMiniSeekBar, {
    		extra : configMap.pauseOrPlay == "disable" ? '<div style="position: absolute;height: 36px;width: 36px;text-align: center;border-radius: 50%;background-color: rgba(0, 0, 0);z-index: 3;justify-content: center;display: flex;align-items: center;left: 3px;top: 3px;cursor:auto;"></div>':""
    	 }, "InSecureHTML");
    	}
    var _getAudioClosedTopHeader = function(config){
		return $RTCPTemplate.replace(_templates.audioClosedHeader, {
			customClass: config.customClassNames.close || "",
		}, "InSecureHTML");
    }
    var _getTimeDuration = function(mode, configMap){
    	return $RTCPTemplate.replace(_templates.timeduration, {
    		rtcpdrag :  configMap.drag == "enable" ? "rtcpdrag" : ""
        }, "InSecureHTML");
    }
  var _getAudioControls = function(mode, configMap){
    	return $RTCPTemplate.replace(_templates.miniAudioControls,{
    	timedisplay :configMap.time == "disable" ? "" : _getTimeDuration(mode, configMap),
    	volumebutton : configMap.volume == "disable" ? "" : '<div class="rtcp_mp_audiovolume"></div>',
       	loopbutton :configMap.loop == "disable" ? '' : _templates.miniloop
    	}, "InSecureHTML");
    	return _templates.miniAudioControls;
  }
  var _getMiniPlayerChange = function(){
	  return '<div class="rtcmp-icon-dropbtnAudio" " id="rtcmp-icon-dropbtn" rtcpmpbutton purpose="gotoMiniPlayer" tooltip-title="'+(RTCPMediaPlayerResource.getRealValue("rtcpmediaplayer.tooltip.miniplayer")+" (i)")+'"></div>';
		
  }
  var _getAudioVolume = function(){
	  return $RTCPTemplate.replace(_templates.miniAudioControls,{
		  
	  },"InSecureHTML");
  }
  var _getReactionItemHtml = function(order, smileyCode,isSticker)
	{
		var reaction = RTCPSmiley.replace(smileyCode);
		return $RTCPTemplate.replace(_templates.reactionItem, {
			order : order,
			reaction : reaction 
		}, "InSecureHTML");	
	}
  
  //var eventContainerDivID
  var _getEventDefaultEventContainer = function(mediaplayerDivID,eventContainerID)
  {
	  return $RTCPTemplate.replace(_templates.defaultEventContainer, {
		  eventcontainerid : eventContainerID,
		  eventContainerhtml : _getEventEventContainerHtml(mediaplayerDivID),
		  mediaplayerdivid : mediaplayerDivID
		}, "InSecureHTML");	
  }
  
  var _getEventEventContainerHtml = function(mediaplayerDivID)
  {
	  return $RTCPTemplate.replace(_templates.eventContainerHtml, {
			searchbar : _getMediaPlayerEventSearchBar(),
			mediaplayerdivid : mediaplayerDivID
		}, "InSecureHTML");	
  }

	var _getNoResultFoundHtml = function()
	{
		return _templates.noSearchResultHtml;
	}

  return  {
        getMediaPlayerDiv : _getMediaPlayerDiv,
        getMediaPlayerUi : _getMediaPlayerUi,
        getMediaPlayerChapter : _getMediaPlayerChapter,
        getHoverTimeDiv : _getHoverTimeDiv,
        getMediaPlayerTooltipPreview : _getMediaPlayerTooltipPreview,
        getEventContainerRow : _getEventContainerRow,
        getEventsContainerTable : _getEventsContainerTable,
        getMediaPlayerControlsDiv : _getMediaPlayerControlsDiv,
        getMediaPlayerCloseButton : _getMediaPlayerCloseButton,
        getMediaPlayerSeekBar : _getMediaPlayerSeekBar,
        getMediaPlayerTooltipContent : _getMediaPlayerTooltipContent,
        getMediaPlayerPopouButton : _getMediaPlayerPopouButton,
        getEventChapterDescription : _getEventChapterDescription,
        getMediaPlayerSettingView : _getMediaPlayerSettingView,
        getMediaPlayerPlackbackSettings : _getMediaPlayerPlackbackSettings,
        getMediaPlayerEventSearchBar : _getMediaPlayerEventSearchBar,
        getEventHeaderColumn : _getEventHeaderColumn,
        getMediaPlayerSettingsBackDiv : _getMediaPlayerSettingsBackDiv,
        getMediaplayerAnnotationConatainer : _getMediaplayerAnnotationConatainer,
        getMediaplayerBookmarkConatainer : _getMediaplayerBookmarkConatainer,
        getMediaplaterTitle : _getMediaplaterTitle,
        getMediaPlayerSpinner : _getMediaPlayerSpinner,
        getPlaybackSpeedDiv : _getPlaybackSpeedDiv,
        getNotSupportedHtml : _getNotSupportedHtml,
        getVolumeDetail:_getVolumeDetail,
        getReactionItemHtml:_getReactionItemHtml,
        getEventDefaultEventContainer : _getEventDefaultEventContainer,
        getEventEventContainerHtml : _getEventEventContainerHtml,
        getMediaPlayerQualityDiv : _getMediaPlayerQualityDiv,
        getMediaPlayerQualityLevels:_getMediaPlayerQualityLevels,
        getMediaPlayerSubtitleDiv : _getMediaPlayerSubtitleDiv,
        getMediaPlayerSubtileLanguages:_getMediaPlayerSubtileLanguages,
        getMediaPlayerAudioTrackDiv:_getMediaPlayerAudioTrackDiv,
        getMediaPlayerAudioTracksLanguages : _getMediaPlayerAudioTracksLanguages,
		getNoResultFoundHtml : _getNoResultFoundHtml
    };
}())

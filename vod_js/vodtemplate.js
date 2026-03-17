//$Id$

var VODTemplate = {};

VODTemplate = (function (){
	const _templates_v2 = 
	{
		vodDemoPage :
			`<div class="rtcp-vod-homepage">
      			{{header}}
          	</div>`,

		homePanel :
			`<div class="rtcp-vod-container">
				<div class="rtcp-vod-tab-container">
					<div class="rtcp-vod-tabheader center">
						<div class="rtcp-vod-tab center" tab="home" rtcpvodactionbtn purpose="switchTabs">{{home_title}}</div>
						<div class="rtcp-vod-tab center" tab="myVideos" rtcpvodactionbtn purpose="switchTabs">{{my_video_title}}</div>
						<div class="rtcp-vod-tab-active-bar"></div>
					</div>
					<div class="rtcp-vod-upload-btn web-vod-rtcp-vod-upload-btn" rtcpvodactionbtn purpose="goToUploadModal">{{upload_title}}</div>
				</div>
				<div class="rtcp-grid-video-container"></div>
            </div>`,

		videoCategory :
			`<div id="rtcp-vod-{{category}}" category={{category}} class="rtcp-grid-video-items">
				<div class="rtcp-grid-video-items-header-gap"></div>
				<div class="rtcp-grid-video-items-header">
					<div class="header-stack">
						<div class="layer layer-3"></div>
						<div class="layer layer-2"></div>
						<div class="layer layer-1"></div>
					</div>
					<div class="rtcp-grid-video-items-title center">
						<div class="rtcp-grid-video-items-title-heading">{{title}}</div>
						<div class="rtcp-grid-video-items-title-count">
							<span>(</span><span class="rtcp-grid-video-items-title-count-value">{{count}}</span><span>)</span>
						</div>
						<div class="rtcp-demo-vod-icon-dropdown-icon rtcp-vod-category-slider center" rtcpvodactionbtn purpose="slideCategoryPanel"></div>
					</div>
					<div class="rtcp-vod-sort rtcp-demo-vod-icon-comments-sort center" rtcpvodactionbtn purpose="openHomePageSortingOpt">
						<span>Sort by</span>
					</div>
					{{page_size_dropdown}}
				</div>
				<div class="rtcp-grid-video-items-body">
					<div class="rtcp-grid-video-list"></div>
				</div>
			</div>`,

		vodHeader :
			`<div class="rtcp-vod-topheader center">
				<div class="rtcp-vod-topheader-titlesec center">
					<div class="rtcp-vod-topheader-logo center curP" href="{{home_href}}" rtcpvodactionbtn purpose="openHomePage">
						<img src="{{logo_img_src}}" alt="{{alt_text}}">
						<span>{{video_ondemand_title}}</span>
					</div>
				</div>
				<div class="rtcp-demopage-topheader-rhs center">
					{{theme_switcher}}
					<div class="user-profile">
						<img src="{{user_img_src}}" alt="" class="zgh-userAvatar">
					</div>
				</div>
      		</div>`,

		vodTheme_v1 :
			`<div class="rtcp-vod-theme-switcher active center" rtcpvodactionbtn purpose="toggleTheme"></div>`,
		
		// vodTheme_v1 :
		// 	`<div class="rtcp-vod-theme-switcher active center" rtcpvodactionbtn purpose="toggleTheme"></div>`,

		vodTheme_v2 :
			`<div class="theme-toggle-wrapper">
                <div class="rtcp-demo-vod-icon-sun"></div>
                <label class="toggle-switch">
                    <input type="checkbox" id="theme-toggle">
                    <span class="slider"></span>
                </label>
                <div class="rtcp-demo-vod-icon-moon"></div>
            </div>`,
		
		videoUploadModal :
			`<div class="rtcp-demo-vod-upload-dialog container-center" modal="upload">
                <div class="rtcp-demo-vod-studio-modal-header">
                    <div class="rtcp-demo-vod-studio-modal-header-title">
                        <span>Upload Videos</span>
                    </div>
                    <div class="rtcp-demo-vod-studio-modal-header-close center">
						<div class="rtcp-demo-vod-icon-close center" rtcpvodactionbtn purpose="closeStudioModal"></div>
                    </div>
                </div>
                <div class="rtcp-demo-vod-upload-body">
                    <div class="rtcp-demo-vod-upload-dialog-body-content">
						<input type="file" id="file-input" accept="video/*" title=''/>
                        <div class="rtcp-demo-vod-upload-dialog-upload" style="">
                            <img src="../images/landingpage/upload.svg">
                        </div>
                        <div class="rtcp-demo-vod-body-uplod-content" style="">
                            <div class="rtcp-demo-vod-body-content-header">Click to Browse</div>
                            <div class="rtcp-demo-vod-body-content-body">or Drag and drop to add a video file</div>
                        </div>
                        <div class="rtcp-demo-vod-body-uplod-drop">
                            <span>Drop your video file here to upload</span>
                        </div>
                    </div>
                </div>
            </div>`,

		vodStudioModal :
			`<div class="rtcp-demo-vod-studio-modal" contentId={{content_id}} modal="{{modal}}">
                <div class="rtcp-demo-vod-studio-modal-content">
                    <div class="rtcp-demo-vod-studio-modal-header">
                        <div class="rtcp-demo-vod-studio-modal-header-text">{{title}}</div>
                        <div class="rtcp-demo-vod-studio-modal-header-close center">
                            <div class="rtcp-demo-vod-icon-close center" rtcpvodactionbtn purpose="{{close_purpose}}"></div>
                        </div>
                    </div>

                    <div class="rtcp-demo-vod-studio-modal-body">
						<div class="rtcp-demo-vod-studio-modal-body-lhs">
							<div class="rtcp-demo-vod-video-cont rtcp-vod-status-container">
								<div id="rtcp-demo-vod-studio-modal-player"></div>
							</div>
                        </div>
						<div class="rtcp-demo-vod-studio-modal-body-rhs">
							{{meta_info_rhs}}
						</div>
                	</div>
					
                    <div class="rtcp-demo-video-cont-upload-footer">
                        {{footer_action_btns}}
                    </div>
                </div>
        	</div>`,

		videoMetaModalRHS :
			`<div class="rtcp-demo-vod-studio-modal-body-rhs-title">
				<div style="display: flex; gap: 1px;">
					<span>Title</span>
					<span class="note">(Required)</span>
				</div>
				<div class="rtcp-demo-vod-studio-modal-body-rhs-title-cont">
					<textarea style="" placeholder="Give viewers a brief overview of your video" class="rtcp-demo-vod-studio-modal-title-text scroll"></textarea>
					<span class="rtcp-demo-vod-studio-modal-text-count dN"></span>
				</div>
			</div>

			<div class="rtcp-demo-vod-studio-modal-body-rhs-description">
				<div class="rtcp-demo-vod-studio-modal-body-rhs-description-title">
					<span>Description</span>
				</div>
				<div class="rtcp-demo-vod-studio-modal-body-rhs-description-cont" >
					<textarea style="" placeholder="Give viewers a brief overview of your video" class="rtcp-demo-vod-studio-modal-description-text scroll"></textarea>
					<span class="rtcp-demo-vod-studio-modal-text-count dN"></span>
				</div>
			</div>

			<div class="rtcp-demo-vod-studio-modal-body-rhs-thumbnail dN">
				
				<div style="display: flex; align-items: center; gap: 6px;">
					<div style="display: flex; gap: 1px; color: #2A2A4B;font-size: 14px; font-style: normal; font-weight: 500; line-height: 20px;">
						<span>Thumbnail</span>
					</div>
					<div style="" class="rtcp-demo-vod-upload-thumbnail-info-cont">
						<span class="rtcp-demo-vod-icon-info" style="font-size: 16px; padding: 4px; opacity: 0.75; cursor: pointer; color: #545A6A;"></span>
						<div class="rtcp-demo-thumbnailhover-cont">
							<div>Recommendations:</div> 
							<div style="line-height: 24px;white-space: nowrap;display: flex;flex-direction: column;">
								<span style="display: flex;align-items: center;align-content: center;gap: 10px;">
									<span style="width: 3px;height: 3px;display: inline-flex;background: white;align-items: center;justify-content: center;border-radius: 100%;"></span>
									Make your thumbnail 1280*720 pixels (16:9 ratio)
								</span>
								<span style="display: flex;align-items: center;align-content: center;gap: 10px;">
									<span style="width: 3px;height: 3px;display: inline-flex;background: white;align-items: center;justify-content: center;border-radius: 100%;"></span>
									Ensure that your thumbnail is less than 2MB
								</span>
								<span style="display: flex;align-items: center;align-content: center;gap: 10px;">
									<span style="width: 3px;height: 3px;display: inline-flex;background: white;align-items: center;justify-content: center;border-radius: 100%;"></span>
									Use a JPG or PNG file format
								</span>
							</div>
						</div>
					</div>
				</div>

				<div style="overflow: hidden; color: #545A6A; text-overflow: ellipsis;font-size: 14px; font-style: normal; font-weight: 400; line-height: 20px; margin-bottom: 4px;">
					<span>Choose a clear and eye-catching thumbnail that represents your video.</span>
				</div>

				<div style="" class="rtcp-demo-vod-upload-thumbnail-sec">
					
					<div class="rtcp-demp-vod-upload-thumbnail-add-sec" style="">
						<div style="display: flex;align-items: center;justify-content: center;">
							<img src="../images/landingpage/upload_thumbnail.svg" style="width: 42px; height: 42px;">
						</div>
						<span style="color: #545A6A;text-align: center;font-size: 10px;font-style: normal;font-weight: 500;line-height: 12px;white-space: nowrap;width: 85px;">Upload thumbnail</span>
					</div>
					
					<div class="rtcp-demp-vod-upload-thumbnail-uploading-sec" style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.80) 0%, rgba(0, 0, 0, 0.80) 100%), url('img/thumbnail.png') lightgray 50% / cover no-repeat;">
						<div style="display: flex;align-items: center;justify-content: center;font-size: 20px;color: #fff;">
							<div class="rtcp-demo-vod-icon-upload"></div>    
						</div>
						<span style="color: #FFF;text-align: center; font-size: 12px;font-style: normal;font-weight: 400;line-height: 14px; /* 116.667% */">Uploading...</span>
						<div style="position: absolute;width: 100%;height: 5px;bottom: 0px;background: linear-gradient(to right, #2ECC71 50%, #ffffff80 50%);"></div>
					</div>

					<div class="rtcp-demo-vod-thumbnail-loading-sec">
						<span style="color: #545A6A;text-align: center;font-size: 12px;font-style: normal;font-weight: 500;line-height: 16px;opacity: 0.5;width: 58px;">Loading...</span>
					</div>
				</div>
			</div>

			<div class="rtcp-demo-vod-studio-modal-body-rhs-videolink dN">
				<div style="display: flex;gap: 6px;align-items: center;">
					<span style="color: #2A2A4B;font-size: 14px; font-style: normal; font-weight: 500; line-height: 20px;">Video link</span>
					<span class="rtcp-demo-vod-icon-copy rtcp-demo-vod-upload-link-copy-icon" rtcp_demo_tooltip="copy link"></span>
				</div>
				<div class="ellips rtcp-demo-vod-upload-link-copy-text" style="">
					https://VODrtcplatform.in/mPcLhaSidsdsdasfdsfdsfrfrfrggrgregregergterter
					<div style="height: 1px; margin-top: 2px;"></div>
				</div>
			</div>`,

		modalSlider :
			`<div class="rtcp-demo-vod-studio-modal-vid-rhs-slider" rtcpvodactionbtn purpose="toggleEnchanceModalRhs">
				<div class="rtcp-demo-vod-icon-video-cont-upload-modal-vid-rhs-slider-button"></div>
			</div>`,

		enhancementModalRHS  :
			`<div class="rtcp-demo-vod-video-cont-chapter-cont">
				<div class="rtcp-demp-vod-add-chapter-sec">
					<div class="rtcp-demp-vod-add-chapter-btn center disabled" purpose="openAddChapterModal">
						<div class="rtcp-demo-vod-icon-add rtcp-demp-vod-video-cont-add-button-cont center"></div>
						<div class="rtcp-demp-vod-video-cont-add-text-cont">Add</div>
					</div>
					<div class="rtcp-demp-vod-video-cont-add-title-cont">Chapters</div>
				</div>

				<div class="rtcp-demp-vod-add-chapter-elem-sec"></div>
				<div class="rtcp-demo-vod-rhs-module-sep dN"></div>
			</div>`,

		chapterInfo :
			`<div id="{{id}}" class="rtcp-demp-vod-add-chapter-elem" status="">
				<div class="rtcp-demp-vod-add-chapter-elem-header">
					<div class="rtcp-demp-vod-add-chapter-elem-lhs">
						<div class="rtcp-demp-vod-add-chapter-elem-time">{{duration}}</div>
						<div class="rtcp-demp-vod-add-chapter-elem-sep"></div>
						<div class="rtcp-demp-vod-add-chapter-elem-title">{{title}}</div>
					</div>
					<div class="rtcp-demp-vod-add-chapter-elem-rhs">
						<div class="rtcp-demo-vod-toggle-description" rtcp_demo_tooltip="Open" rtcpvodactionbtn purpose="toggleChapterDescription">
							<div class="rtcp-demo-vod-icon-toggle-description"></div>
						</div>
						<div class="rtcp-demo-vod-video-cont-vertical-sep"></div>
						<div class="rtcp-demo-vod-icon-edit" rtcp_demo_tooltip="Edit" rtcpvodactionbtn purpose="openAddChapterModal"></div>
						<div class="rtcp-demo-vod-icon-delete" rtcp_demo_tooltip="Delete" rtcpvodactionbtn purpose="deleteChapter"></div>
					</div>
				</div>
				<div class="rtcp-demp-vod-add-chapter-elem-body">
					<div class="rtcp-demp-vod-add-chapter-elem-description">{{description}}</div>
				</div>
			</div>`,

		addChapterModal :
			`<div class="rtcp-demo-vod-add-chapters-modal dN">
				<div class="rtcp-demo-vod-add-chapters-modal-body">
					<div class="rtcp-demo-vod-add-chapters-modal-body-title-sec">
						<div class="rtcp-demo-vod-add-chapters-modal-body-title-text">
							<span>Title</span>
							<span class="chapter-title-required">(Required)</span>
						</div>
						<div class="rtcp-demo-vod-add-chapters-modal-body-title-textarea vod-chapter-title">
							<textarea placeholder="Give your chapter a clear and concise title"></textarea>
							<span class="rtcp-demo-vod-add-chapters-modal-body-textarea-counter"></span>
						</div>
					</div>
					<div class="rtcp-demo-vod-add-chapters-modal-body-description-sec">
						<div class="rtcp-demo-vod-add-chapters-modal-body-title-text">Description</div>
						<div class="rtcp-demo-vod-add-chapters-modal-body-title-textarea vod-chapter-description">
							<textarea placeholder="Give viewers a brief overview of your video" style="height: 110px;"></textarea>
							<span class="rtcp-demo-vod-add-chapters-modal-body-textarea-counter"></span>
						</div>
					</div>
					<div class="rtcp-demo-vod-add-chapters-modal-body-footer-sec">
						<div class="rtcp-demo-vod-add-chapters-modal-body-footer-sec-timer">
							<input type="text" value="00" >
							<span>:</span>
							<input type="text" value="00" >
							<span>:</span>
							<input type="text" value="00" >
						</div>
						
						<div class="rtcp-demo-vod-add-chapters-modal-body-footer-sec-actions-cont">
							<div class="rtcp-demo-vod-add-chapters-modal-body-footer-sec-actions-cont-cancel" rtcpvodactionbtn purpose="closeAddChapterModal">Cancel</div>
							<div class="rtcp-demo-vod-add-chapters-modal-body-footer-sec-actions-cont-save" rtcpvodactionbtn>Save</div>
						</div>
					</div>
				</div>
			</div>`,

		viewerPage :
			`<div class="rtcp-vod-viewerpage-outercontainer">
				<div class="rtcp-vod-viewerpage-container center">
					<div class="rtcp-vod-viewerpage-lhs">
						{{video_content_section}}
						{{comments_section}}
					</div>
					<div class="rtcp-vod-viewerpage-rhs">
						<div class="rtcp-vod-video-recommendations-sec">
							<div class="rtcp-vod-video-recommendations-title"></div>
							<div class="rtcp-vod-video-recommendations-list"></div>
						</div>
					</div>
				</div>
			</div>`,

		slider :
			`<label class="rtcp-vod-slider">
				<input type="checkbox" class="rtcp-vod-checkbox-input">
				<span class="slider round"></span>
			</label>`,

		playerLoader :
			`<div class="rtcp-mp-spinner" style="">
				<div class="rtcp-mp-spinner-container">
					<div class="rtcp-mp-spinner-rotator">
						<div class="rtcp-mp-spinner-left">
							<div class="rtcp-mp-spinner-circle"></div>
						</div>
						<div class="rtcp-mp-spinner-right">
							<div class="rtcp-mp-spinner-circle"></div>
						</div>
					</div>
				</div>
			</div>`,

		categoryPanelLoader :
			`<div class="rtcp-vod-category-panel-loader">
				<span></span><span></span><span></span><span></span>
			</div>`,
		
		videoContentSection :
			`<div class="rtcp-vod-video-sec">
				<div id="{{player_id}}" class="rtcp-vod-video-container"></div>
				{{content_panel}}
			</div>`,

		contentPanel :
			`<div class="rtcp-vod-video-desc-container">
            	<div class="rtcp-vod-video-details-sec">
                	<div class="rtcp-vod-video-title">{{title}}</div>
                	{{owner_panel}}
                	{{post_stats}}
              	</div>
				<div class="rtcp-vod-video-desc-area">
					<div class="rtcp-vod-video-desc-wrapper">
						<div class="rtcp-vod-video-desc"></div>
					</div>
				</div>
            </div>`,

		ownerPanel :
			`<div class="rtcp-vod-video-owner-sec center">
                <div class="rtcp-vod-video-owner-details center">
                	<div class="rtcp-vod-video-owner-profile center"><img src="{{user_img}}"></div>
                    <div class="rtcp-vod-video-followers-sec center">
                      <div class="rtcp-vod-video-ownername">{{user_name}}</div>
                      <div class="rtcp-vod-video-followers dN">
                        <span class="rtcp-vod-video-followers-count dN">{{followers_count}}</span><span>{{followers_title}}</span>
                      </div>
                    </div>
                </div>
                <div class="rtcp-vod-follow-btn center dN">{{follow_title}}</div>
				<div class="rtcp-vod-like-cont dN" tooltip-title="{{tp_like}}">
					<div class="rtcp-vod-like-btn center" rtcpvodactionbtn purpose="toggleLikeStatus"></div>
					<div class="like-btn-space"></div>
					<div class="rtcp-vod-like-count">{{likes_count}}</div>
				</div>
                <div class="rtcp-vod-share-btn rtcp-demo-vod-icon-share dN" tooltip-title="{{tp_share}}"></div>
            </div>`,

		SharePopup :
			`<div class="rtcp-share-popup-overlay rtcp-share-popup-hidden"></div>
			<div class="rtcp-share-popup rtcp-share-popup-hidden">
                <div class="rtcp-share-popup-title-sec center">
                    <span class="rtcp-share-popup-title center">Share</span>
                    <span class="rtcp-close-share-popup center"></span>
                </div>
                <div class="rtcp-share-popup-content-sec">
                    <div class="rtcp-share-popup-videolink-sec">
                        <div class="rtcp-share-popup-videolink-title">Video link</div>
                        <div class="center rtcp-share-popup-videolink"><input class="rtcp-share-popup-videolink-input" readonly="" value="https://youtu.be/BS8x2TicxQ8?si=zxpWdLHGKsByMGBz"></div>
                    </div>
                    <div class="rtcp-share-popup-videolink-bottom-sec center">
                        <div class="rtcp-share-popup-videolink-starttime-sec center">
                          <span><input type="checkbox" checked="" class="rtcp-share-popup-videolink-starttime-tickicon center"></span>
                          <span>Starts at <span class="rtcp-share-popup-videolink-starttime">10:04</span></span>
                        </div>
                        <div class="rtcp-share-popup-videolink-copysec center">
                          <div class="rtcp-share-popup-videolink-embed-btn center">Embed</div>
                          <div class="rtcp-share-popup-videolink-copy-btn center"">Copy</div>
                        </div>
                    </div>
                </div>
            </div>`,

		sorting :
			`<div class="rtcp-vod-sort-content" category="{{category}}">{{sorting_options}}</div>`,

		postStatsSection :
			`<div class="rtcp-vod-video-posted-details-sec center">
                <div class="rtcp-vod-video-posted-views-sec center dN">
                    <div class="rtcp-vod-video-posted-views-title">{{total_views_title}}</div>
                    <div class="rtcp-vod-video-posted-views">{{total_view_count}}</div>
                </div>
                <div class="rtcp-vod-video-posted-details-separator dN"></div>
                <div class="rtcp-vod-video-posted-date-sec center">
                    <div class="rtcp-vod-video-posted-date-title">{{posted_on_title}}</div>
                    <div class="rtcp-vod-video-posted-date">{{date}}</div>
                    <div class="rtcp-vod-video-posted-time">{{time}}</div>
                </div>
            </div>`,

		commentsSection :
			`<div class="rtcp-vod-comment-sec">
            	{{header}}
            	<div class="rtcp-vod-viewers-comment-sec">{{comments_list}}</div>
          	</div>`,

		commentsHeader :
			`<div class="rtcp-vod-comment-sec-header">
            	<div class="rtcp-vod-total-comments-count-sec rtcp-demo-vod-icon-comment center">
                	<span class="rtcp-vod-total-comments-count">{{comments_count}}</span><span>{{comments_title}}</span>
              	</div>
            </div>`,

		commentBox :
			`<div class="rtcp-self-comment-sec">
              	<div class="rtcp-self-commenter-profile"><img src="{{user_img}}"></div>
              	<div class="rtcp-self-commenter-box-sec">
                	<div class="rtcp-self-commenter-box" rtcpvodactionbtn purpose="startCommentEdit">
                  		<div class="rtcp-self-commenter-box-input-sec" aria-label="{{drop_comment_desc}}"></div>
                	</div>
					<div class="rtcp-self-commenter-box-emojis rtcp-demo-vod-icon-emojis dN" tooltip-title="{{tp_reactions}}"></div>
              	</div>
            </div>`,

		addCommentActions :
			`<div class="rtcp-self-comment-actions">
              	<div class="rtcp-self-comment-cancel-btn" rtcpvodactionbtn purpose="{{cancel_action}}">Cancel</div>
             	<div class="rtcp-self-comment-btn" rtcpvodactionbtn_md purpose="{{proceed_action}}">{{action_title}}</div>
            </div>`,

		viewerComment :
			`<div id="{{id}}" class="rtcp-vod-viewers-comment-box">
				<div class="rtcp-comment-wrapper">
					<div class="rtcp-vod-viewers-comment-profile">
						<img src="{{user_img}}">
					</div>
					<div class="rtcp-vod-viewers-info-sec">
						<div class="rtcp-vod-viewers-info">
							<div class="rtcp-vod-viewers-name">{{user_name}}</div>
							<div class="rtcp-vod-viewers-commented-time">{{time}}</div>
							{{comment_self_actions}}
						</div>
						<div class="rtcp-vod-viewers-comments-outer rtcp-vod-self-reply">
							<div class="rtcp-vod-viewers-comment">
								<div class="rtcp-viewer-commenter-box-input-sec">{{comment}}</div>
								<div class="rtcp-self-commenter-box-emojis" tooltip-title="Reactions"></div>
							</div>
							{{comment_actions}}
						</div>
					</div>
				</div>
			</div>`,

		commentActions :
			`<div class="rtcp-self-comment-actions-outer dN">
				<div class="rtcp-comment-actions">
					<div class="rtcp-demo-vod-icon-comment-like">Like</div>
					<div class="rtcp-demo-vod-icon-comment-dislike">Dislike</div>
					<div class="rtcp-demo-vod-icon-comment-reply" rtcpvodactionbtn purpose="replyComment">Reply</div>
				</div>
			</div>`,

		// commentSelfActions :
		// 	`<div class="rtcp-vod-more-opt-cont">
		// 		<div class="rtcp-vod-self-comment-edit-dropdwncontent">
		// 		<div class="rtcp-vod-self-comment-delete rtcp-demo-vod-icon-delete" rtcpvodactionbtn purpose="deleteComment">Delete comment</div>
		// 		</div>
		// 		<div class="rtcp-vod-self-comment-edit-dropdwncontent">
		// 		<div class="rtcp-vod-self-comment-edit rtcp-demo-vod-icon-comment-edit" rtcpvodactionbtn purpose="editComment">Edit comment</div>
		// 		</div>
		// 	</div>`,

		videoQueuePanel :
			`<div class="rtcp-vod-viewerpage-playlist-sec">
				{{queue_header}}
				<div class="rtcp-vod-viewerpage-nextvideos-sec">
					<div class="rtcp-vod-viewerpage-nextvideos-list center"></div>
				</div>
			</div>`,

		queueHeader :
			`<div class="rtcp-vod-viewerpage-rhs-header center">
				<div class="rtcp-vod-morevideos">{{more_videos_title}}</div>
				<div class="rtcp-vod-autoplay center">
					<div class="rtcp-vod-autoplay-title">{{autoplay_title}}</div>
					<div class="">
						{{slider}}
					</div>
				</div>
          	</div>`,

		videoGridContainer :
			`<div id="{{id}}" class="rtcp-grid-video-box rtcp-grid-video-fileformat-box" {{purpose}}>
				<div class="rtcp-grid-video-box-wrapper">
					<div class="rtcp-grid-video-img-container rtcp-vod-status-container">
						<div class="rtcp-grid-video-box-img">
							<img src="{{img_src}}" onload="{{bg_img_onload}}" onerror="{{bg_img_onerror}}">
						</div>
						<div class="rtcp-grid-video-box-owner-tag center">
							<div class="rtcp-grid-video-owner-profile center"><img src="{{user_img}}"></div>
							<div class="rtcp-grid-video-ownername">{{user_name}}</div>
						</div>
						<div class="rtcp-grid-video-duration">{{duration}}</div>
						{{overlay_options}}
					</div>
					<div class="rtcp-grid-video-details">
						<div class="rtcp-grid-video-details-header">
							<div class="rtcp-grid-video-title">{{title}}</div>
							{{edit_option}}
						</div>
						<div class="rtcp-grid-video-time-and-views center">
						{{views_count}}
						<span class="rtcp-grid-video-date ellipsis">{{date}}</span>
						<span class="dot-separator"></span>
						<span class="rtcp-grid-video-time">{{time}}</span>
						</div>
					</div>
					<div class="rtcp-grid-video-fileformat-img videoimg "></div>
				</div>
            </div>`,

		videoBoxWaveIcon :
			`<div class="rtcp-vod-video-box-wave-icon">
				<div class="wave-bars">
					<div class="wave-bar"></div>
					<div class="wave-bar"></div>
					<div class="wave-bar"></div>
					<div class="wave-bar"></div>
				</div>
			</div>`,

		videoGridOverlayOpt :
			`<div class="rtcp-grid-vod-main-options">{{main_opt}}</div>
			<div class="rtcp-grid-video-overlay-options">
				<div class="rtcp-grid-video-overlay-bg"></div>
				<div class="rtcp-grid-video-more-options rtcp-demo-vod-icon-comment-actions center curP" rtcpvodactionbtn purpose="openStudioMoreOpt"></div>
			</div>`,

		videoGridOpt :
			'<div class="rtcp-grid-video-{{key}} {{hide_class}} center rtcp-demo-vod-icon-{{key}} curP" more_opt="{{key}}" rtcpvodactionbtn="" purpose="{{purpose}}"></div>',

		videoGridContainerStatus :
			`<div class="rtcp-grid-video-status center">
				<div class="rtcp-demo-vod-upload-state-video-icon center"></div>
				<div class="rtcp-grid-video-status-text"></div>
			</div>`,

		uploadProgressBar :
			`<div class="rtcp-grid-video-upload-progress center">
				<div class="rtcp-demo-vod-icon-upload center"></div>
			</div>`,

		uploadProgressBar_v2 :
			`<div class="rtcp-grid-video-upload-progress center">
				<div class="progress-percentage">0%</div>
				<div class="rtcp-demo-vod-icon-upload center"></div>
			</div>`,

		loader :
			`<div class="rtcp-demo-vod-modal-loader" style="/* display: none; */">
				<div class="rtcp-demo-vod-modal-loader-sec">
					<div class="rtcp-demo-vod-modal-loader-cont-dot"></div>
					<div class="rtcp-demo-vod-modal-loader-cont-dot"></div>
					<div class="rtcp-demo-vod-modal-loader-cont-dot"></div>
					<div class="rtcp-demo-vod-modal-loader-cont-dot"></div>
				</div>
			</div>`,

		videoLinkPopup :
			`<div class="rtcp-share-popup">
				<div class="rtcp-share-popup-title-sec center">
					<span class="rtcp-share-popup-title center">{{share_title}}</span>
					<span class="rtcp-close-share-popup center"></span>
				</div>
				<div class="rtcp-share-popup-content-sec">
					<div class="rtcp-share-popup-videolink-sec">
						<div class="rtcp-share-popup-videolink-title">{{video_link_title}}</div>
						<div class="center rtcp-share-popup-videolink">
							<input class="rtcp-share-popup-videolink-input" readonly="" value="{{video_link}}"/>
						</div>
					</div>
					<div class="rtcp-share-popup-videolink-bottom-sec center">
						<div class="rtcp-share-popup-videolink-starttime-sec center dN">
							<span><input type="checkbox" checked="" class="rtcp-share-popup-videolink-starttime-tickicon center" /></span>
							<span>{{starts_title}}<span class="rtcp-share-popup-videolink-starttime">{{time}}</span></span>
						</div>
						<div class="rtcp-share-popup-videolink-copysec center">
							<div class="rtcp-share-popup-videolink-embed-btn center dN">{{embed_title}}</div>
							<div class="rtcp-share-popup-videolink-copy-btn center">{{copy_title}}</div>
						</div>
					</div>
				</div>
			</div>`,

		banner :
			`<div class="rtcp-demo-vod-banner" status="{{status}}">
				<div class="rtcp-demo-vod-icon-banner"></div>
				<div class="rtcp-demo-vod-banner-text">{{msg}}</div>
			</div>`,

		pages :
			`<div class="rtcp-vod-pagination center">
				<div class="rtcp-vod-page-navigation-cont">
					<div class="rtcp-vod-page-navigator center rtcp-demo-vod-icon-left" value="prev" rtcpvodactionbtn purpose="navigatePage"></div>
					<div class="rtcp-vod-pages center"></div>
					<div class="rtcp-vod-page-navigator center rtcp-demo-vod-icon-right" value="next" rtcpvodactionbtn purpose="navigatePage"></div>
				</div>
				<div style="" class="rtcp-vod-skip-to-page center">
					<div class="rtcp-vod-skip-to-page-input"><input type="text" style=""></div>
					<div style="" class="rtcp-vod-skip-to-page-go center" rtcpvodactionbtn purpose="goToPage">Go</div>
				</div>	
			</div>`,

		pageSizeDropdown :
			`<div class="rtcp-vod-page-size-selector-dropdown-cont center">
				<div class="rtcp-vod-page-size-selector center" rtcpvodactionbtn="" purpose="togglePageSizeDropdown">
					<div class="rtcp-vod-page-size-selector-dropdown-title">Show</div>
					<div class="rtcp-vod-page-size">20</div>
					<div class="rtcp-demo-vod-icon-dropdown-icon2 center rtcp-vod-page-size-dropdown-icon"></div>
				</div>
			</div>`, //<div class="rtcp-vod-size-opt">10</div>
		
		pageSizeDropdownOpt:
			`<div class="rtcp-vod-page-size-selector-dropdown">
				<div class="rtcp-vod-page-size-opts center" category="{{category}}">{{options}}</div>
			</div>`,

		homePanelNoData :
			`<div class="rtcp-vod-home-no-data-sec center">
				<div class="rtcp-vod-home-no-data-icon center"></div>
			</div>`,

		categoryPanelSkeleton :
			`<div class="rtcp-vod-category-skeleton">
				<div class="rtcp-vod-category-skeleton-header">
					<div class="rtcp-vod-category-skeleton-title skeleton"></div>
				</div>
				<div class="rtcp-vod-category-skeleton-contents">{{contents}}</div>
			</div>`,

		videoBoxSkeleton :
			`<div class="rtcp-vod-category-skeleton-video-box">
				<div class="rtcp-vod-category-skeleton-wrapper skeleton">
					<div class="rtcp-vod-category-skeleton-img skeleton"></div>
					<div class="rtcp-vod-category-skeleton-footer">
						<div class="rtcp-vod-category-skeleton-footer-title skeleton"></div>
						<div class="rtcp-vod-category-skeleton-footer-info skeleton"></div>
					</div>
				</div>
			</div>`,

		zohoCelebrationBanner :
			`<div class="rtcp-vod-zoho-celebrations" style="">
				<div class="geometric-shape diamond-1"></div>
				<div class="geometric-shape diamond-2"></div>
				<div class="geometric-shape circle-1"></div>
				<div class="geometric-shape circle-2"></div>
				<div class="float-dot dot-1"></div>
				<div class="float-dot dot-2"></div>
				<div class="float-dot dot-3"></div>
				<div class="float-dot dot-4"></div>
				<div class="glass-container">
					<div class="celebration-text">
						<div class="zoho">ZOHO</div>
						<div class="celebration">CELEBRATIONS</div>
					</div>
				</div>
			</div>`
	}

	const _templatesConfigs = (() => 
	{
		const footerPurpose =
		{
			preview : ['Next', 'openUploadModal', true],
			meta : ['Next', 'openEnhancementModal'],
			inVideo : ['Let&#39;s Go', 'goViewerPageFromStudio'],
			uploadMeta : ['Upload', 'initiateUpload'],
			updateMeta : ['Update', 'updateMetaInfo'],
			upload_failed : ['Retry', 'retryUpload'],
			cancel : ['Cancel', 'cancelUpload'],
			back : ['Back', 'openMetaInfoModal']
		};

		const gridVideoContOpts =
		{
			edit : ['edit', 'openGridVideo', 'Edit'], 
			delete : ['delete', 'deleteContent', 'Delete'],
			view : ['view', 'openViewerPage', 'Watch on Playhub'],
			cancel : ['cancel', 'cancelUpload', 'Cancel']
		}

		return {
			footerPurpose : footerPurpose,
			gridVideoContOpts : gridVideoContOpts
		};
	})()

	const _getHeader_v2 = function(userImgUrl)
	{
		const originalUrl = window.location.origin;

		return $RTCPTemplate.replace(_templates_v2.vodHeader, {
			home_href : '',//originalUrl + "/demo/playhub",
			logo_img_src : originalUrl+"/images/landingpage/vod.svg",
			alt_text : 'Zoho RTCPLATFORM - Video On Demand',
			video_ondemand_title : 'Video-On-Demand',
			user_img_src : userImgUrl,
			theme_switcher : _getThemeSwitcher()
		}, "InSecureHTML");
	}

	const _getThemeSwitcher = function()
	{
		return _templates_v2.vodTheme_v1;
	}

	const _getVodHomePanel = function()
	{
		return $RTCPTemplate.replace(_templates_v2.homePanel, {
			home_title : "Home",
			my_video_title : "My Videos",
			upload_title : "Upload"
		}, "InSecureHTML");
	}

	const _getVideoCategoryPanel = function(category, title, count)
	{
		return $RTCPTemplate.replace(_templates_v2.videoCategory, {
			category : category,
			title : title,
			count : count,
			page_size_dropdown : _getPageSizeDropdown(category)
		}, "InSecureHTML");
	}

	var _getVideoUploadModal = function()
	{
		return _templates_v2.videoUploadModal;
	};

	const _getVodStudioModal = function(modal, id, content) // preview, uploadMeta, meta
	{
		return $RTCPTemplate.replace(_templates_v2.vodStudioModal, {
			title : VODProcessXss.processXSS(content.title || content.tempTitle) || '',
			modal : modal,
			content_id : id,
			// custom_mini_class : isPreview ? 'dN' : '', // <div class="rtcp-demo-vod-icon-minimise center {{custom_mini_class}}" rtcpvodactionbtn purpose="toggleMiniMaxModal"></div>
			close_purpose : 'closeStudioModal', //(isPreview || modal == 'uploadMeta') ? 'cancelUpload' : 'closeStudioModal',
			meta_info_rhs : _getStudioModalRHS(modal, content),
			footer_action_btns : _getStudioModalFooter(modal, content.status)
		}, "InSecureHTML");
	};

	const _getStudioModalRHS = function(modal, content)
	{
		if(modal == 'preview')
		{
			return '';
		}

		if(modal == 'meta' || modal == 'uploadMeta') // meta info
		{
			return _getvideoMetaModalRHS(content);
		}

		if(modal == 'inVideo') // in video info
		{
			return _getEnhancementModalRHS(content);
		}
	}

	const _getModalSlider = function()
	{
		return _templates_v2.modalSlider;
	}

	// const _getvideoMetaModalRHS_v1 = function (content)
	// {
	// 	const title = content.title || content.tempTitle;
		
	// 	return $RTCPTemplate.replace(_templates_v2.videoMetaModalRHS,{
	// 		title : VODProcessXss.processXSS(title) || '',
	// 		description : content.description ? VODProcessXss.processXSS(content.description) : ''
	// 	});
	// }

	const _getvideoMetaModalRHS = function (content)
	{
		return _templates_v2.videoMetaModalRHS;
	}

	const _getEnhancementModalRHS = function()
	{
		return _templates_v2.enhancementModalRHS;
	}

	const _getStudioModalFooter = function(modal, status)
	{
		const getBtn = (config, isSecondary, isDisabled) =>
		{
			return $RTCPTemplate.replace('<div class="rtcp-demo-vod-video-cont-detail-{{btn_class}} {{disabled}}" rtcpvodactionbtn purpose="{{purpose}}"><div>{{title}}</div></div>', 
			{
				btn_class : isSecondary ? 'back' : 'next',
				title : config[0],
				purpose : config[1],
				disabled: isDisabled ? 'disabled' : ''
			}, "InSecureHTML");
		}

		let secondaryAction;
		let disabled = false;

		if(modal === 'uploadMeta')
		{
			const isUploading = (status === vodDemoConstant.status.UPLOADING);

			if(status === vodDemoConstant.status.PREVIEW || isUploading)
			{
				secondaryAction = 'cancel';
			}
			else
			{
				modal = 'updateMeta';
			}

			if(status !== vodDemoConstant.status.PREVIEW)
			{
				disabled = true;
			}
		}
		else if(modal === 'inVideo')
		{
			secondaryAction = 'back';
		}

		const configs = _templatesConfigs.footerPurpose;
		const config = configs[modal];

		if(!config)
		{
			return '';
		}

		return (secondaryAction ? getBtn(configs[secondaryAction], true) : '') + getBtn(config, false, disabled);
	}

	var _getChapterInfo = function(id, title, description, duration)
	{
		return $RTCPTemplate.replace(_templates_v2.chapterInfo, {
			id : id,
			duration: duration,
			title: VODProcessXss.processXSS(title),
			description: VODProcessXss.processXSS(description)
		}, "InSecureHTML");
	}

	var _getAddChapterModal = function()
	{
		return $RTCPTemplate.replace(_templates_v2.addChapterModal, {
		}, "InSecureHTML");
	}

	const _getSorterTemplate = function(configs)
	{
		html = '';

		for(const confObj of configs)
		{
			html += $RTCPTemplate.replace('<div class="rtcp-vod-sort-dropdwncontent {{custom_class}}" value="{{value}}" desc="{{desc}}" rtcpvodactionbtn purpose="sortByOption">{{title}}</div>', {
				value : confObj.sortKey,
				desc : String(confObj.desc),
				custom_class : (configs.activeTitle === confObj.title) ? 'active' : '',
				title : confObj.title
			}, "InSecureHTML");
		}

		return $RTCPTemplate.replace(_templates_v2.sorting, {
			sorting_options : html,
			category : configs.category
		}, "InSecureHTML");
	}

	const _getPlayerLoader = function()
	{
		return _templates_v2.playerLoader;
	}
	
	const _getViewerPage = function(id, session, data)
	{
		return $RTCPTemplate.replace(_templates_v2.viewerPage, {
			video_content_section: _getVideoContentSection(id, session, data),
			comments_section: _getCommentsSection(session, 0)
			//loader : _getPlayerLoader()
		}, "InSecureHTML");
	}

	const _getVideoContentSection = function(id, session, data)
	{
		return $RTCPTemplate.replace(_templates_v2.videoContentSection, {
			player_id : id,
			content_panel: _getContentPanel(data, session)
		}, "InSecureHTML");
	}

	const _getContentPanel = function(data, session)
	{
		//const description = data.description || '';

		//const description = VODProcessXss.processXSS('Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.').trim();

		return $RTCPTemplate.replace(_templates_v2.contentPanel, {
			title: VODProcessXss.processXSS(data.title),
			//description: VODProcessXss.processXSS(description),
			owner_panel: _getOwnerPanel(data, session),
			post_stats: _getPostStatsSection(data)
		}, "InSecureHTML");
	}

	const _getOwnerPanel = function(data, session)
	{
		return $RTCPTemplate.replace(_templates_v2.ownerPanel, {
			user_name: VODProcessXss.processXSS(data.ownerDisplayName),
			user_img : session.getUserImage(data.owner),
			followers_count : '0',
			followers_title : "Followers",
			follow_title : "Follow",
			likes_count : 0,//data.videolikecount,
			tp_like : "Like",
			tp_share : "Share"
		}, "InSecureHTML");
	}

	const _getPostStatsSection = function(data)
	{
		return $RTCPTemplate.replace(_templates_v2.postStatsSection, {
			total_views_title: "Total Views :",
			total_view_count: 0,//data.viewcount,
			posted_on_title: "Posted on",
			date: data.date,
			time: data.time,
			view_analytics_title: "View analytics"
		}, "InSecureHTML");
	}

	const _getCommentsSection = function(session, commentsCount)
	{
		return $RTCPTemplate.replace(_templates_v2.commentsSection, {
			header : _getCommentsHeader(commentsCount),
			//comment_box : _getCommentBox(session.getUserImage()),
			comments_list: ""
		}, "InSecureHTML");
	}

	const _getCommentsHeader = function(commentsCount)
	{
		return $RTCPTemplate.replace(_templates_v2.commentsHeader, {
			comments_count: commentsCount,
			comments_title: "Comments",
			sort_by_title: "Sort by"
		}, "InSecureHTML");
	}

	const _getCommentBox = function(userImg)
	{
		return $RTCPTemplate.replace(_templates_v2.commentBox, {
			user_img : userImg,
			cancel_title: "Cancel",
			comment_title: "Comment",
			tp_reactions: "Reactions",
			drop_comment_desc: "Drop your comments here"
		}, "InSecureHTML");
	}

	const _getAddCommentActions = function(isSelfComment)
	{
		return $RTCPTemplate.replace(_templates_v2.addCommentActions, {
			action_title : isSelfComment ? "Comment" : "Reply",
			proceed_action: isSelfComment ? "postComment" : "postReplyComment",
			cancel_action: "cancelComment"
		}, "InSecureHTML");
	}

	const _getViewerCommentBox = function(session, id, commentInfo)
	{
		var userId = commentInfo.userid;

		if(userId.startsWith('RT'))
		{
			userId = userId.split('_')[2];
		}

		return $RTCPTemplate.replace(_templates_v2.viewerComment, {
			id : id,
			user_img : session.getUserImage(userId),
			user_name : session.isCurrentUser(userId) ? 'You' : VODProcessXss.processXSS(commentInfo.dname),
			time : vodDemo.parseCommentTime(commentInfo.time),
			comment : VODProcessXss.processXSS(commentInfo.comment) || "",
			comment_self_actions: true ? '<div class="rtcp-vod-viewers-comment-actions rtcp-demo-vod-icon-comment-actions dN" rtcpvodactionbtn purpose="openSelfCommentActions"></div>' : "", // isCurrentUser
			comment_actions : _getCommentActions()
		}, "InSecureHTML");
	}

	// const _getSelfCommentActionsPopup = function()
	// {
	// 	return $RTCPTemplate.replace(_templates_v2.commentSelfActions, {}, "InSecureHTML");
	// }

	const _getCommentActions = function()
	{
		return $RTCPTemplate.replace(_templates_v2.commentActions, {}, "InSecureHTML");
	}

	const _getVideoQueuePanel = function()
	{
		return $RTCPTemplate.replace(_templates_v2.videoQueuePanel, {
			queue_header: _getQueueHeader()
		}, "InSecureHTML");
	}

	const _getQueueHeader = function()
	{
		return $RTCPTemplate.replace(_templates_v2.queueHeader, {
			more_videos_title: "More Videos",
			autoplay_title: "Autoplay",
			slider: _getCheckboxSlider()
		}, "InSecureHTML");
	}

	const _getVideoGridViewerHtml = function(count)
	{
		return $RTCPTemplate.replace(`<div class="rtcp-grid-video-viewcount center">{{view_count}}<span>{{views_title}}</span></div><span class="dot-separator"></span>`, {
			view_count : count,
			views_title: (count > 1) ? "views" : 'view'
		}, "InSecureHTML");
	}

	const _getVideoGridContainer = function(session, id, info, purpose)
	{
		const viewCountHtml = (typeof info.viewcount !== 'undefined') ? _getVideoGridViewerHtml(info.viewcount) : '';
		const opts = vodDemo.getMoreOptions(session, info, 'home') || [];

		return $RTCPTemplate.replace(_templates_v2.videoGridContainer, {
			id : id,
			purpose : purpose ? `rtcpvodactionbtn purpose="${purpose}"` : '',
			img_src : info.img || vodDemo.getCDNDomain()+`/images/landingpage/vod/video_card_bg_${vodDemo.getRandomBg()}.svg`,     //|| `https://img.freepik.com/free-photo/_${vodDemo.getRandomBg()}.jpg`,
			bg_img_onload : `vodDemo.handleBgImgLoad(this, false)`,  //NO I18N
			bg_img_onerror : `vodDemo.handleBgImgLoad(this, true)`,  //NO I18N
			user_name : VODProcessXss.processXSS(info.ownerDisplayName),
            user_img : session.getUserImage(info.owner),
			duration : info.duration || '00:00',
			title : VODProcessXss.processXSS(info.title || info.tempTitle || ''),
			views_count : viewCountHtml,
			date : info.date,
			time : info.time,
			overlay_options : _getVideoGridOverlayOpt(opts),
			edit_option : _getVideoGridContainerOpt('edit', !opts.includes('edit'))
		}, "InSecureHTML");
	}

	const _getVideoGridContainerOpt = function(optKey, hide)
	{	
		const [key, purpose] = _templatesConfigs.gridVideoContOpts[optKey];

		return $RTCPTemplate.replace(_templates_v2.videoGridOpt,{
			key : key,
			purpose : purpose,
			hide_class : hide ? 'dN' : ''
		}, "InSecureHTML");
	}

	const _getVideoGridOverlayOpt = (opts) =>
	{
		return $RTCPTemplate.replace(_templates_v2.videoGridOverlayOpt,{
			main_opt : _getVideoGridContainerOpt(opts.includes('view') ? 'view' : 'edit')
			//main_opt_hide_class : '',
			//overlay_hide_class : (opts.length) ? '' : 'dN'
		}, "InSecureHTML");
	}

	const _getVideoBoxWaveIcon = function()
	{
		return _templates_v2.videoBoxWaveIcon;
	}

	// const _getVideoGridOverlayOpt = (moreOpts = {}) =>
	// {	
	// 	const overlayOpts = ['edit', 'view'];
	// 	var html = '';

	// 	for(const opt of overlayOpts)
	// 	{
	// 		const config = moreOpts[opt];

	// 		if(!config)
	// 		{
	// 			continue;
	// 		}

	// 		html += `<div class="rtcp-grid-video-${opt} center rtcp-demo-vod-icon-${opt} curP" more_opt="${opt}" rtcpvodactionbtn purpose="${config[0]}"></div>`
	// 	}

	// 	if(!html)
	// 	{
	// 		return html;
	// 	}

	// 	return $RTCPTemplate.replace(_templates_v2.videoGridOverlayOpt,{
	// 		overlay_options : html
	// 	}, "InSecureHTML");
	// }

	const _getVideoGridContainerStatus = function(status)
	{
		return _templates_v2.videoGridContainerStatus;
	}

	const _getUploadProgressBar = function()
	{
		//<span class="progress-icon rtcp-demo-vod-icon-upload"></span>
		return _templates_v2.uploadProgressBar;
	}

	const _getPageLoader = function()
	{
		return _templates_v2.loader;
	}

	const _getCheckboxSlider = function()
	{
		return _templates_v2.slider;
	}

	const _getVideoLinkPopup = function(videoLink, time)
	{
		return $RTCPTemplate.replace(_templates_v2.videoLinkPopup, {
			share_title : "Share",
			video_link_title : "Video link",
			video_link : videoLink,
			starts_title : "Starts at ",
			time : time,
			embed_title : "Embed",
			copy_title : "Copy"
		}, "InSecureHTML");
	}

	const _getVodBanner = function(msg, isErr)
	{
		return $RTCPTemplate.replace(_templates_v2.banner, {
			msg : msg,
			status : isErr ? 'error' : 'success' // success, error
		}, "InSecureHTML");
	}

	const _getPaginationTemplate = function()
	{
		return _templates_v2.pages;
	}

	const _getPageSizeDropdown = function(category)
	{
		const sorter = vodDemo.getCurrentSorter();
		const selected = sorter.getPageConfig(category, 'size');

		return $RTCPTemplate.replace(_templates_v2.pageSizeDropdown, {
			selected_option : selected
		}, "InSecureHTML");
	}

	const _getPageSizeDropdownOpts = function(category)
	{
		const sorter = vodDemo.getCurrentSorter();
		const options = vodDemo.getDefaultConfig('pageSizes');
		const selected = sorter.getPageConfig(category, 'size');
		let optionsHtml = '';
		
		
		for(const size of options)
		{
			if(size == selected)
			{
				continue;
			}

			optionsHtml += $RTCPTemplate.replace('<div class="rtcp-vod-size-opt" value="{{value}}" rtcpvodactionbtn purpose="selectPageSize">{{title}}</div>', {
				value : size,
				title : size
			}, "InSecureHTML");
		}

		return $RTCPTemplate.replace(_templates_v2.pageSizeDropdownOpt, {
			options : optionsHtml,
			category : category
		}, "InSecureHTML");
	}

	const _getcategoryPanelSkeleton = function()
	{
		const contentsHtml = _templates_v2.videoBoxSkeleton.repeat(5);

		return $RTCPTemplate.replace(_templates_v2.categoryPanelSkeleton, {
			contents : contentsHtml
		}, "InSecureHTML");
	}

	const _getVideoBoxSkeleton = function()
	{
		return _templates_v2.videoBoxSkeleton;
	}

	const _getVodHomePanelNoData = function(isInHome)
	{	
		return _templates_v2.homePanelNoData;
	}

	const _getTemplatesConfigs = () =>
	{
		return _templatesConfigs;
	}

	const _getZohoCelebrationBanner = () =>
	{
		return _templates_v2.zohoCelebrationBanner;
	}
    
    return  {
		getHeader_v2 : _getHeader_v2,
		getVodHomePanel : _getVodHomePanel,
		getVideoCategoryPanel : _getVideoCategoryPanel,
		getVideoUploadModal : _getVideoUploadModal,
		getvideoMetaModalRHS : _getvideoMetaModalRHS,
		getVodStudioModal : _getVodStudioModal,
		getStudioModalRHS : _getStudioModalRHS,
		getModalSlider : _getModalSlider,
		getvideoMetaModalRHS : _getvideoMetaModalRHS,
		getEnhancementModalRHS : _getEnhancementModalRHS,
		getStudioModalFooter : _getStudioModalFooter,
		getSlider : _getCheckboxSlider,
		// getUploadDraftModal : _getUploadDraftModal,
		getAddChapterModal : _getAddChapterModal,
		getChapterInfo : _getChapterInfo,
		getSorterTemplate : _getSorterTemplate,
		getViewerPage : _getViewerPage,
		getVideoGridContainer : _getVideoGridContainer,
		getVideoGridOverlayOpt : _getVideoGridOverlayOpt,
		getVideoGridContainerOpt : _getVideoGridContainerOpt,
		getVideoGridContainerStatus : _getVideoGridContainerStatus,
		getUploadProgressBar : _getUploadProgressBar,
		getVideoQueuePanel : _getVideoQueuePanel,
		getCommentBox : _getCommentBox,
		getAddCommentActions : _getAddCommentActions,
		getViewerCommentBox : _getViewerCommentBox,
		// getSelfCommentActionsPopup : _getSelfCommentActionsPopup,
		getCommentActions : _getCommentActions,
		getPageLoader : _getPageLoader,
		getVideoLinkPopup : _getVideoLinkPopup,
		getVodBanner : _getVodBanner,
		getPaginationTemplate : _getPaginationTemplate,
		getPageSizeDropdownOpts : _getPageSizeDropdownOpts,
		getcategoryPanelSkeleton : _getcategoryPanelSkeleton,
		getVideoBoxSkeleton : _getVideoBoxSkeleton,
		getVodHomePanelNoData : _getVodHomePanelNoData,
		getTemplatesConfigs : _getTemplatesConfigs,
		getVideoBoxWaveIcon : _getVideoBoxWaveIcon,
		getZohoCelebrationBanner : _getZohoCelebrationBanner
    };
}());


var VODProcessXss = {
	
	processXSS : function(value, ignoredecode )
		{
			if ( !value ) {
				return value;
			}
			if(value && (value instanceof String || typeof value == 'string'))
			{
				if ( !ignoredecode ) {
					value = VODProcessXss.decodeHTMLEntities( value );
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
		}
};

// {
//     "opr": "handleVODStatus",
//     "messageTime": 1759749448480,
//     "uploadId": "mediaprocessing.RT_15600382.1759749444717",
//     "module": "vod",
//     "contentId": "ef6be6bb-f8e7-4b97-ac44-c6f1f3a8442a_27975657",
//     "status": 2
// }



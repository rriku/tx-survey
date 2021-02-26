videojs.registerPlugin('cuAdControl', function (settings) {
    var player = this;
    __bcplayer = player; //Global
    var player_id = player.id();
    var overlay, overlay2;

    //console.log("plugin for loaded!");

    var _OPTIONS = {
        debug: false //debug Log Flag
    };
    if (settings.debug != undefined && settings.debug == true) {
        _OPTIONS.debug = true;
    }
    parseOptions();

    var imgDirPath = settings.imgDir; //ﾃｧ窶敖ｻﾃ･ﾆ陳湘ｧﾂｴ ﾃｦﾂ敖静ｦ ﾂｼﾃｧﾂｴﾂ催｣ﾆ停｡ﾃ｣窶堋｣ﾃ｣ﾆ陳ｬﾃ｣窶堋ｯﾃ｣ﾆ塚�｣ﾆ陳ｪURI
    if (imgDirPath != undefined) {
        myLog("imgDir = " + imgDirPath);
        var resumeTitleImgPath = imgDirPath + "resumeTitle.png";
        var playStartImgPath = imgDirPath + "playStart.png";
        var playStart_hImgPath = imgDirPath + "playStart_h.png";
        var resumeStartImgPath = imgDirPath + "resumeStart.png";
        var resumeStart_hImgPath = imgDirPath + "resumeStart_h.png";
    }

    //Video information
    var _videoId = "";
    var _videoReferenceId = "";
    var _videoDuration = 0;
    var programId = "";
    var currentPlayTime = 0;
    var genre = "";
    var episodeTitle = "";
    var programTitle = "";
    var videoLocation = 0;
    var locationPercent = 0;
    var currentPlayRate = "";

    // For TVer audience data
    var tvcu_pcode = "";
    var tvcu_ccode = "";
    var tvcu_zcode = "";
    var tvcu_g = "";
    var tvcu_age = "";
    var tvcu_agegrp = "";

    var lastPlayTime = 0;
    var isSeeking = false;
    var myCueInfo = [];
    var myMediaInfo = {};
    var isPrerollEnabled = true;
    var tagPrerollEnabled = false;
    var isMediaCompleted = false;
    var postrollStartTime = 0;
    var playFunc;

    //Resume Info
    var resume_info = null;
    var resumeask = false;
    var playHeadTime = 0;
    var isResumePlay = false;

    // AD Info
    var adId = "";
    var adType = "";
    var adCount = "";
    var adTotalCount = "";
    var adLocation = "";
    var adDuration = "";

    // screen mode
    var mode = "inline";

    //ﾃ｣窶堋ｷﾃ｣ﾆ陳ｼﾃ｣ﾆ陳ｳﾃ｣窶堋ｷﾃ｣窶堋ｧﾃ｣窶堋｢ﾃｩ窶督｢ﾃｩ竄ｬﾂ｣ﾃ｣ﾆ停｢ﾃ｣ﾆ陳ｩﾃ｣窶堋ｰ
    __bcplayer_vr_sceneshare = false; //VRﾃｨﾂｨﾋ�ｦﾂｸﾂｬﾃｩ竄ｬﾂ｣ﾃｦﾂ青ｺﾃ｣ﾂ�ｮﾃ｣ﾂ�ｸﾃ｣窶堋�｣ﾂ�ｮﾃ｣窶堋ｰﾃ｣ﾆ陳ｭﾃ｣ﾆ陳ｼﾃ｣ﾆ陳静｣ﾆ陳ｫﾃ･ﾂ､窶ｰﾃｦ窶｢ﾂｰ

    //Getting VMAP URL from settings.adServerUrl
    var vmapBaseUrl = settings.vmapUrl;
    var currentCueInfo, adTagIndex = 0;

    //Getting Plugin Params
    var isAutoPlay = false;
    if (settings.autoPlay != undefined && settings.autoPlay == true) {
        isAutoPlay = true;
    }
    var isShowResumeDialog = false;
    if (settings.resumeDialog != undefined && settings.resumeDialog == true && imgDirPath != undefined) {
        isShowResumeDialog = true;
    }
    myLog("[Player Setting] AutoPlay: " + isAutoPlay + ", resumeDialog: " + isShowResumeDialog + ", vmapUrl: " + vmapBaseUrl);

    //page url
    var _pageUrl = window.location.href;
    myLog("Page URL = " + _pageUrl);

    //URLﾃ｣ﾆ停佚｣ﾆ陳ｩﾃ｣ﾆ陳｡ﾃ｣ﾆ陳ｼﾃ｣窶堋ｿﾃ･ﾂ鞘禿･ﾂｾ窶�
    var urlParams = {};
    var pair = location.search.substring(1).split('&');
    for (var i = 0; pair[i]; i++) {
        var kv = pair[i].split('=');
        urlParams[kv[0]] = kv[1];
    }

    //URLﾃ､ﾂｸﾂｭﾃ｣ﾂ�ｮphtﾃ｣ﾆ停佚｣ﾆ陳ｩﾃ｣ﾆ陳｡ﾃ｣ﾆ陳ｼﾃ｣窶堋ｿﾃ･ﾂ鞘禿･ﾂｾ窶�
    var phtParam = 0;
    for (var key in urlParams) {
        if (key === "pht") {
            if (!isEmpty(urlParams[key]) && !isNaN(urlParams[key])) {
                phtParam = parseInt(urlParams[key]);
                myLog("pht param is found in Page URL, pht = " + phtParam);
            }
        }
    }

    //ﾃ｣ﾆ停禿｣ﾆ陳ｩﾃ｣窶堋ｦﾃ｣窶堋ｶﾃ･ﾋ�､ﾃ･ﾂｮﾅ｡ﾃ｣竄ｬﾂ」r_tagid2ﾃｨﾂｨﾂｭﾃ･ﾂｮﾅ｡
    var agent = navigator.userAgent;
    var deviceType = "";
    var flg_ie10 = false;
    var vrTagId2 = "";

    if (agent.search(/iPhone/) != -1 || agent.search(/iPad/) != -1 || agent.search(/iPod/) != -1) {
        //iOS
        deviceType = "ios";
        if (_OPTIONS.debug) {
            vrTagId2 = "9005";
        } else {
            vrTagId2 = "0005";
        }

    } else if (agent.search(/Android/) != -1) {
        //Android
        deviceType = "android";
        if (_OPTIONS.debug) {
            vrTagId2 = "9006";
        } else {
            vrTagId2 = "0006";
        }

    } else {
        deviceType = "desktop";
        if (_OPTIONS.debug) {
            vrTagId2 = "9001";
        } else {
            vrTagId2 = "0001";
        }

        if (agent.match(/MSIE/)) flg_ie10 = true;
    }
    myLog("DeviceType = " + deviceType + ", vr_tagid = " + vrTagId2);

    //Safari11ﾃ｣ﾆ陳�｣窶堋ｧﾃ｣ﾆ槌津｣窶堋ｯ
    var cutSt, cutEd, bwVer;
    if (agent.toLowerCase().indexOf('safari') !== -1 && agent.toLowerCase().indexOf('chrome') === -1) {
        try {
            //Check Safari Ver
            cutSt = agent.indexOf("Version");
            cutEd = agent.indexOf(".", cutSt);
            bwVer = agent.substring(cutSt + 8, cutEd);
            myLog("This browser is Safari [Ver:" + bwVer + "]");

            if (parseInt(bwVer) >= 11) {
                myLog("Autoplay is disable because this browser is Safari11 later.");
                isAutoPlay = false; //Autoplay is disable for Safari11 later
            }
        } catch (e) { }
    }

    //Global Variable for Video Research
    __bcplayer_vr_flag = true;

    //functions for AdClickBlock Control
    function enableAdBlock(event) {
        //myLog("block ad clicking");
        _overlayContent = "<span id=\"adClickBlock\" style=\"position:absolute;width:100%;height:100%;display:block;\" ></span>";
        overlay = document.createElement('div');
        overlay.className = 'ad-block-overlay';
        overlay.innerHTML = _overlayContent;
        var adControl = player.el().getElementsByClassName("vjs-ad-control-bar")[0];
        player.el().insertBefore(overlay, adControl);
        $('.dropdownShare').css('display', 'none');
        $('.aroundIconRating').css('display', 'none');
        $(".Combined-Shape").css('display', 'none');
        console.log("countX", localStorage.getItem("countX"));
        console.log("countClik", localStorage.getItem("countClik"));
        if ($('.share-control:visible').length == 0) {
            $(".Around-shape").css('display', 'none');
        }
    }

    function disableAdBlock(event) {
        //myLog("deblock ad clicking");
        if (player.el().getElementsByClassName("ad-block-overlay").length > 0) {
            player.el().removeChild(player.el().getElementsByClassName("ad-block-overlay")[0]);
            $('.dropdownShare').css('display', 'block');
            $('.aroundIconRating').css('display', 'block');
            $(".Combined-Shape").css('display', 'block');
            console.log("countX", localStorage.getItem("countX"));
            console.log("countClik", localStorage.getItem("countClik"));
            if ($('.share-control:visible').length == 0) {
                $(".Around-shape").css('display', 'none');
            }
        }
    }

    function overlayBlackImage() {
        var _overlayContent = "<div id=\"overlayContent\" >" +
            "<span id=\"stillImage\" style=\"position:absolute;width:100%;height:100%;" +
            "display:block;background-color: #000;\" >" +
            "</span>" +
            "</div>";
        overlay2 = document.createElement('div');
        overlay2.className = 'vjs-adblack-overlay';
        overlay2.innerHTML = _overlayContent;
        var adControl = player.el().getElementsByClassName("vjs-ima3-ad-container")[0];
        if (player.el().getElementsByClassName("vjs-adblack-overlay").length <= 0) {
            player.el().insertBefore(overlay2, adControl);
        }
    }

    function hideBlackImageOverlay() {
        if (player.el().getElementsByClassName("vjs-adblack-overlay").length > 0) {
            player.el().removeChild(player.el().getElementsByClassName("vjs-adblack-overlay")[0]);
        }
    }

    //Event Handler
    function onMediaPlay(event) {
        //For Pre-roll Insertion
        player.one("timeupdate", function () {
            if (!isPrerollEnabled && playHeadTime > 0) return;
            if (myCueInfo[0] != undefined) {
                myLog(myCueInfo[0].name + " is requested");
                adType = myCueInfo[0].name;
                currentCueInfo = myCueInfo[0];
                adTagIndex = 0;
                cuAdRequest(currentCueInfo, adTagIndex);
            }
        });

        //Disable Big Play Button
        $('.vjs-big-play-button').css('display', 'none');
        $('.dropdownShare').css('display', 'block');
        $('.aroundIconRating').css('display', 'block');
        $(".Combined-Shape").css('display', 'block');
    }

    function onMediaBegin(event) {
        myLog("[media begin] VideoId: " + _videoId);
        $('.dropdownShare').css('display', 'block');
        $('.aroundIconRating').css('display', 'block');
        $(".Combined-Shape").css('display', 'block');

        videoLocation = getVideoLocation();
        locationPercent = getLocationPercent(videoLocation);

        window.onbeforeunload = function () {
            videoLocation = getVideoLocation();
            locationPercent = getLocationPercent(videoLocation);
            sentEpisodeEventToAF('leave_watch');
        };

        //ﾃ｣ﾆ陳ｪﾃ｣窶堋ｸﾃ｣ﾆ陳･ﾃ｣ﾆ陳ｼﾃ｣ﾆ� ﾃ､ﾂｽﾂ催ｧﾂｽﾂｮﾃ｣ﾂ�ｸﾃｧﾂｧﾂｻﾃ･窶ｹ窶｢
        if (playHeadTime > 0 && playHeadTime <= _videoDuration) {
            isResumePlay = true;
            player.currentTime(playHeadTime);
            videoLocation = parseInt(playHeadTime + 2);
            locationPercent = getLocationPercent(videoLocation);
            myLog("playHeadTime is moved to " + playHeadTime + " sec");
        }

        // sent start_watch event - no ad
        sentEpisodeEventToAF('start_watch');
    }

    function onMediaProgress(event) {
        //myLog("media Timeupdate, time = " + player.currentTime() + ", currentPlayTime is " + currentPlayTime + " ,__bcplayer_vr_flag =" + __bcplayer_vr_flag);
        if (!isSeeking) {
            if (player.currentTime() != currentPlayTime) {
                lastPlayTime = currentPlayTime;
                currentPlayTime = player.currentTime();

                //Midroll Cue Check
                var foundCueTime = null;
                for (var time in myCueInfo) {
                    if ((lastPlayTime < time) && (time < currentPlayTime) && !isResumePlay) {
                        if (myCueInfo[time].name.toLowerCase().indexOf('midroll') != -1 && !myCueInfo[time].played) {
                            foundCueTime = time;
                        }
                    }
                }

                //ResumePlay Flag is set to false;
                isResumePlay = false;

                if (!__bcplayer_vr_flag && playHeadTime > 0) {
                    if (player.currentTime() > playHeadTime) {
                        __bcplayer_vr_flag = true;
                        myLog("__bcplayer_vr_flag is set to " + __bcplayer_vr_flag);
                    }
                }

                if (foundCueTime != null) {
                    //Midroll Insertion
                    myLog("Midroll Cue at " + foundCueTime + " is found, " + myCueInfo[foundCueTime].name + " is requested");
                    adType = myCueInfo[foundCueTime].name;
                    adTagIndex = 0;
                    currentCueInfo = myCueInfo[foundCueTime];
                    cuAdRequest(currentCueInfo, adTagIndex);
                    myCueInfo[foundCueTime].played = true;
                }
            }
        }
    }

    function onMediaComplete(event) {
        //Postroll Insertion
        if (!isMediaCompleted && postrollStartTime != 0 && myCueInfo[postrollStartTime] != undefined && myCueInfo[postrollStartTime].name.toLowerCase() == "postroll") {
            myLog(myCueInfo[postrollStartTime].name + " is requested");
            adType = myCueInfo[postrollStartTime].name;
            adTagIndex = 0;
            currentCueInfo = myCueInfo[postrollStartTime];
            cuAdRequest(currentCueInfo, adTagIndex);
        }
        //MediaCompteled Flag will be set to true
        if (!isMediaCompleted) isMediaCompleted = true;

        videoLocation = _videoDuration;
        locationPercent = 100;
        // sent complete_watch event - content type: episode
        sentEpisodeEventToAF('complete_watch');
    }

    function handleStartSeeking(event) {
        isSeeking = true;
        //myLog("seeking " + player.currentTime() + ", lastPlayTime=" + lastPlayTime);
    }

    function handleEndSeeking(event) {
        isSeeking = false;
        var seekedTime = player.currentTime();
        var seekedTimeInt = Math.round(seekedTime);
        var lastPlayTimeInt = Math.floor(lastPlayTime);
        myLog("seeked to " + seekedTime + " from " + lastPlayTime);

        // sent change_player_location event to AF
        if ((seekedTimeInt != 0 || Math.abs(_videoDuration - lastPlayTime) >= 1) && (Math.abs(seekedTime - lastPlayTime) >= 1) && (isResumePlay != true)) {
            sentControlEventToAF('change_player_location', lastPlayTimeInt, seekedTimeInt);
        }

        player.one("seeking", handleStartSeeking);
    }

    function handleAdstart(event) {
        myLog("Ad is started");
        $('.dropdownShare').css('display', 'none');
        $('.aroundIconRating').css('display', 'none');
        $(".Combined-Shape").css('display', 'none');
        if (deviceType != "desktop") {
            $('.vjs-control-bar.vjs-ad-control-bar').css('display', 'none');
        } else {
            if (!player.paused()) player.pause();
        }

        //showBlackImage under AdPlayer
        //overlayBlackImage();

        var adTitle = player.ima3.currentAd.getTitle();
        myLog("adTitle : " + adTitle);
        if (adTitle.match(/non-clickable/)) {
            enableAdBlock();
            myLog("Ad is Non-Clickable, adTitle = " + adTitle);
        } else if (adTitle.match(/clickable/)) {
            myLog("Ad is Clickable, adTitle = " + adTitle);
        } else {
            enableAdBlock();
        }

        //set AdPlayer Volume from Player Volume
        if (player.muted()) {
            player.ima3.adPlayer.volume(0);
        } else {
            player.ima3.adPlayer.volume(player.volume());
        }

        adId = player.ima3.currentAd.getAdId();
        adCount = player.ima3.currentAd.getAdPodInfo().getAdPosition();
        adTotalCount = player.ima3.currentAd.getAdPodInfo().getTotalAds();
        adDuration = player.ima3.currentAd.getDuration();
        adLocation = 0;
        videoLocation = getVideoLocation();
        locationPercent = getLocationPercent(videoLocation);

        // sent start_watch event - content-type: ad
        sentAdEventToAF('start_watch');

        window.onbeforeunload = function () {
            sentEpisodeEventToAF('leave_watch');
            sentAdEventToAF('leave_watch');
        };
    }

    function handleAdend(event) {
        //set Player Volume from AdPlayer Volume
        player.volume(player.ima3.adPlayer.volume());
        player.muted(player.ima3.adPlayer.muted());

        disableAdBlock();

        //ﾃｦﾂｮ窶ｹﾃ｣窶塲�ﾃ｣ﾂ�ｮﾃｦﾂｮﾂｵﾃｧﾂｩﾂ催｣ﾂ�ｿﾃ｣ﾂ�津｣ﾂ≫堙｣窶壺ｹﾃ･ ﾂｴﾃ･ﾂ斥�｣ﾂ�ｯﾃ｣竄ｬﾂ�･ﾂｺﾆ津･窶佛�ﾃ｣ﾆ陳ｪﾃ｣窶堋ｯﾃ｣窶堋ｨﾃ｣窶堋ｹﾃ｣ﾆ塚�｣窶壺凖ｨﾂ｡ﾅ津｣ﾂ≫�
        if (currentCueInfo.url.length - 1 > adTagIndex) {
            adTagIndex++;
            cuAdRequest(currentCueInfo, adTagIndex);
        }
        // sent complete_watch event - content type: ad
        adLocation = parseInt(adDuration);
        videoLocation = getVideoLocation();
        locationPercent = getLocationPercent(videoLocation);
        sentAdEventToAF('complete_watch');
    }

    function handleAdpodstart() {
        myLog("AdPod is start");
        var seekedTime = player.currentTime();
        var seekedTimeInt = Math.round(seekedTime);
        var lastPlayTimeInt = Math.round(lastPlayTime);
        myLog("Seeking: seeked to " + seekedTime + " from " + lastPlayTime);
        // sent change_player_location event to AF in case seeking to ad
        if (Math.abs(seekedTime - lastPlayTime) >= 1) {
            sentControlEventToAF('change_player_location', lastPlayTimeInt, seekedTimeInt);
        }
    }

    function handleAdpodend(event) {
        myLog("AdPod is ended");
        __bcplayer_vr_flag = true;
        $("#dropdownSNSShare").css({ 'display': 'block' });
        $("#checkRating").css({ 'display': 'block' });
        //hideBlackImage under AdPlayer
        hideBlackImageOverlay();
    }

    function handleAdClick(event) {
        //myLog("Ad Click");
        //Ad play is paused
        this.ima3.adsManager.pause();
    }

    function handleAdPlay(event) {
        myLog("ad play from pause");
        videoLocation = getVideoLocation();
        locationPercent = getLocationPercent(videoLocation);
        var adRemaining = player.ima3.adsManager.getRemainingTime();
        adLocation = parseInt(adDuration - adRemaining);
        if (adLocation > 0) {
            sentAdEventToAF('start_watch');
        }
    }

    function handleAdPause(event) {
        // sent pause_watch event - content type: ad
        videoLocation = getVideoLocation();
        locationPercent = getLocationPercent(videoLocation);
        var adRemaining = player.ima3.adsManager.getRemainingTime();
        adLocation = parseInt(adDuration - adRemaining);
        sentAdEventToAF('pause_watch');
    }

    function handleAdtimeout(event) {
        myLog("AD Timeout Error is occured.");
        disableAdBlock();
        __bcplayer_vr_flag = true;

        //hideBlackImage under AdPlayer
        hideBlackImageOverlay();
    }

    function handleAdError(event) {
        myLog("AD Error is occured.");
        disableAdBlock();
        __bcplayer_vr_flag = true;

        //hideBlackImage under AdPlayer
        hideBlackImageOverlay();
    }

    function onRateChange(event) {
        newPlayRate = player.playbackRate();
        // send change_player_speed to AF
        sentControlEventToAF("change_player_speed", currentPlayRate, newPlayRate);
        currentPlayRate = newPlayRate;
    }

    function onFullscreenChange(event) {
        if (player.isFullscreen()) {
            mode = "fullscreen";
        } else {
            mode = "inline";
        }
    }

    function cuAdRequest(cueInfo, adIndex) {
        if (player.ima3.settings.requestMode != "ondemand") {
            player.ima3.settings.requestMode = "ondemand";
        }
        player.ima3.settings.serverUrl = cueInfo.url[adIndex];
        player.ima3.adrequest();
    }

    function getVideoLocation() {
        videoLocation = parseInt(player.currentTime());
        return videoLocation;
    }

    function getLocationPercent(videoLocation) {
        locationPercent = videoLocation == 0 ? 0 : ((videoLocation / _videoDuration) * 100).toPrecision(3);
        return locationPercent;
    }

    function sentEpisodeEventToAF(eventName) {
        AF('pba', 'event', {
            eventType: 'EVENT', eventName: eventName, eventValue: {
                "content_type": 'episode',
                "content_id": _videoId,
                "mode": mode,
                "location_percent": locationPercent,
                "location": videoLocation,
                "genre": genre,
                "episode_length": _videoDuration,
                "program_id": programId,
                "program_title": programTitle,
                "episode_title": episodeTitle,
            }
        });
    }

    function sentAdEventToAF(eventName) {
        AF('pba', 'event', {
            eventType: 'EVENT', eventName: eventName, eventValue: {
                "content_type": 'ad',
                "content_id": adId,
                "mode": mode,
                "location": adLocation,
                "location_percent": locationPercent,
                "ad-type": adType,
                "ad-count": adCount,
                "ad-total-count": adTotalCount,
                "video-location": videoLocation,
                "genre": genre,
                "episode_length": _videoDuration,
                "program_id": programId,
                "program_title": programTitle,
                "episode_title": episodeTitle,
                "episode_id": _videoId,
            }
        });
    }

    function sentControlEventToAF(eventName, from, to) {
        AF('pba', 'event', {
            eventType: 'EVENT', eventName: eventName, eventValue: {
                "from": from,
                "to": to,
                "mode": mode,
                "content_type": 'episode',
                "content_id": _videoId,
                "genre": genre,
                "episode_length": _videoDuration,
                "program_id": programId,
                "program_title": programTitle,
                "episode_title": episodeTitle,
            }
        });
    }

    player.ready(function () {
        //myLog("Player is ready");

        //Play will be disable before VMAP load is completed.
        playFunc = player.play;
        player.play = function () {
            //myLog("Player Button is clicked.");
        };
    });

    player.one("loadedmetadata", function () {
        myMediaInfo = player.mediainfo;
        _videoId = myMediaInfo.id;
        _videoReferenceId = myMediaInfo.reference_id;
        _videoDuration = Math.floor(myMediaInfo.duration);
        myLog("VideoId = " + _videoId + ", Duration = " + _videoDuration);

        //Getting Previous Playback Info from LocalStorage
        if (!flg_ie10) {
            resume_info = getBCResumeInfo(_videoId);
        }
        if (resume_info != null && resume_info.lastPlayed > 0 && resume_info.lastPlayed < resume_info.duration) {
            resumeask = true;
            myLog("Resume Dialog will be shown, Last Playe time = " + resume_info.lastPlayed);
            $('.dropdownShare').css('display', 'none');
            $('.aroundIconRating').css('display', 'none');
            $(".Combined-Shape").css('display', 'none');
        }

        //Custom Field(programid)
        if (!isEmpty(myMediaInfo.custom_fields.programkey)) {
            programId = myMediaInfo.custom_fields.programkey;
        }
        programId = !isEmpty(myMediaInfo.custom_fields.programkey) ? myMediaInfo.custom_fields.programkey : '';
        genre = !isEmpty(myMediaInfo.custom_fields.genre) ? myMediaInfo.custom_fields.genre : '';
        episodeTitle = !isEmpty(myMediaInfo.custom_fields.title) ? myMediaInfo.custom_fields.title : '';
        programTitle = !isEmpty(myMediaInfo.custom_fields.bangumi) ? myMediaInfo.custom_fields.bangumi : '';
        myLog("[custom_field] programKey = " + programId);

        currentPlayRate = player.playbackRate();

        //Local Storage
        var tverData = localStorage.getItem('tver');
        if (tverData != null) {
            var tverJson = JSON.parse(tverData);
            if (typeof tverJson !== "undefined") {
                tvcu_pcode = typeof tverJson.prefCode !== "undefined" ? tverJson.prefCode : "";
                tvcu_ccode = typeof tverJson.cityCode !== "undefined" ? tverJson.cityCode : "";
                tvcu_zcode = typeof tverJson.postCode !== "undefined" ? tverJson.postCode : "";
                if (typeof tverJson.genderCode !== "undefined") {
                    if (tverJson.genderCode === 1) {
                        tvcu_g = "m";
                    } else if (tverJson.genderCode === 2) {
                        tvcu_g = "f";
                    }
                }
                if (typeof tverJson.birthYyyymm01 !== "undefined" && tverJson.birthYyyymm01.length == 8) {
                    var now = new Date();
                    var year = now.getFullYear();
                    var age = Number(year) - Number(tverJson.birthYyyymm01.substring(0, 4));
                    tvcu_age = age;
                    if (age >= 4 && age <= 12) {
                        tvcu_agegrp = 1;
                    } else if (age >= 13 && age <= 19) {
                        tvcu_agegrp = 2;
                    } else if (age >= 20 && age <= 34) {
                        tvcu_agegrp = 3;
                    } else if (age >= 35 && age <= 49) {
                        tvcu_agegrp = 4;
                    } else if (age >= 50 && age <= 79) {
                        tvcu_agegrp = 5;
                    } else {
                        tvcu_agegrp = 6;
                    }
                }
            }
        }

        //Set Event Listener
        player.on('ads-ad-started', handleAdstart);
        player.on('ads-ad-ended', handleAdend);
        player.on('ads-pod-started', handleAdpodstart);
        player.on('ads-pod-ended', handleAdpodend);
        player.on('ads-click', handleAdClick);
        player.on('ads-play', handleAdPlay);
        player.on('ads-pause', handleAdPause);
        player.on('ima3-ad-error', handleAdError);
        player.on('adtimeout', handleAdtimeout);
        player.one("play", onMediaPlay);
        player.one("playing", onMediaBegin);
        player.on("timeupdate", onMediaProgress);
        player.on("ended", onMediaComplete);
        player.one("seeking", handleStartSeeking);
        player.on("seeked", handleEndSeeking);
        player.on('ratechange', onRateChange);
        player.on('fullscreenchange', onFullscreenChange);

        //check data-playHeadTime Value
        var tmp_pht = document.getElementById(player_id).getAttribute("data-playheadtime");
        if (!isEmpty(tmp_pht) && !isNaN(tmp_pht)) {
            playHeadTime = parseInt(tmp_pht);
        }

        //check data-sceneshare-play Value
        var tmp_ssp = document.getElementById(player_id).getAttribute("data-sceneshare-play");
        if (!isEmpty(tmp_ssp)) {
            if (tmp_ssp == "true") {
                __bcplayer_vr_sceneshare = true;
                myLog("This play is SceneShare Play.");
            }
        }
        //URLﾃ､ﾂｸﾂｭﾃ｣ﾂ�ｮphtﾃ｣ﾆ停佚｣ﾆ陳ｩﾃ｣ﾆ陳｡ﾃ｣ﾆ陳ｼﾃ｣窶堋ｿﾃ･竄ｬﾂ､ﾃ｣ﾂ��60ﾃ､ﾂｻﾂ･ﾃ､ﾂｸﾅ�ﾃ｣ﾂ�ｮﾃ･ ﾂｴﾃ･ﾂ斥�｣ﾂ�ｯﾃ｣竄ｬﾂ｝layHeadTimeﾃ｣窶壺凖ｦ窶ｺﾂｴﾃｦ窶督ｰﾃ｣ﾂ≫氾｣竄ｬﾂ�｣窶堋ｷﾃ｣ﾆ陳ｼﾃ｣ﾆ陳ｳﾃ｣窶堋ｷﾃ｣窶堋ｧﾃ｣窶堋｢ﾃ･窶�ﾂ催ｧ窶敘ｸﾃ｣ﾆ停｢ﾃ｣ﾆ陳ｩﾃ｣窶堋ｰﾃ｣窶壺冲rueﾃ｣ﾂ�ｫﾃｨﾂｨﾂｭﾃ･ﾂｮﾅ｡
        if (phtParam >= 60) {
            playHeadTime = phtParam;
            __bcplayer_vr_sceneshare = true;
        }

        if (!flg_ie10 && playHeadTime > 0 && playHeadTime <= _videoDuration) {
            //Resume Playback is not supported for IE10
            isResumePlay = true;
            __bcplayer_vr_flag = false;
            resumeask = false;
        }
        //check prerollenabled Value
        var tmp_pe = document.getElementById(player_id).getAttribute("data-prerollenabled");
        if (!isEmpty(tmp_pe)) {
            if (tmp_pe == "true") tagPrerollEnabled = true;
        }
        myLog("data-prerollenabled is " + tagPrerollEnabled);

        //Update isPrerollEnabled
        if (playHeadTime > 0 && !tagPrerollEnabled) {
            isPrerollEnabled = false;
            myLog("Preroll is desabled, because of resume play without preroll");
        }

        //Geting VMAP Info, and set VAST URL againt each Ad CuePoint
        getVmapInfo(genVmapUrl(vmapBaseUrl));
    });

    //Create VMAP Request
    function genVmapUrl(baseUrl) {
        var ret = "";
        ret = baseUrl.replace(/{programKey}/g, programId);
        ret = ret.replace("{vid}", _videoId);
        ret = ret.replace("{random}", create_random(10));
        ret = ret.replace("{pageurl}", encodeURIComponent(_pageUrl));
        ret = ret.replace("{vrTagId2}", vrTagId2);
        // For TVer Demographic data
        ret = ret.replace("{tvcu_pcode}", tvcu_pcode);
        ret = ret.replace("{tvcu_ccode}", tvcu_ccode);
        ret = ret.replace("{tvcu_zcode}", tvcu_zcode);
        ret = ret.replace("{tvcu_g}", tvcu_g);
        ret = ret.replace("{tvcu_age}", tvcu_age);
        ret = ret.replace("{tvcu_agegrp}", tvcu_agegrp);
        myLog("VMAP URL = " + ret);
        return ret;
    }

    //Get VMAP XML
    function getVmapInfo(vmapUrl) {
        $.ajax({
            url: vmapUrl,
            dataType: "xml",
            success: function (xml) {
                parseVmapXml(xml);
            },
            error: function (xml) {
                myLog("VMAP can't be loaded.");
            }
        });
    }

    function parseVmapXml(xml) {
        var timeOffset, breakId;
        var adTagUri = "";
        $(xml).find('AdBreak, vmap\\:AdBreak').each(function (adtagxml) {
            if ($(this).attr('breakType') == "linear") {
                adTagUri = $(this).find('AdTagURI, vmap\\:AdTagURI').text();
                breakId = $(this).attr('breakId');
                myLog("timeOffset=" + $(this).attr('timeOffset') + ", breakId=" + breakId + ", AdTagURI=" + adTagUri);
                if ($(this).attr('timeOffset') == "start") {
                    timeOffset = 0;
                } else if ($(this).attr('timeOffset') == "end") {
                    timeOffset = myMediaInfo.duration;
                    postrollStartTime = timeOffset;
                } else {
                    timeOffset = getCueSec($(this).attr('timeOffset'));
                }

                if (myCueInfo[timeOffset] == undefined) {
                    myCueInfo[timeOffset] = {
                        name: breakId,
                        url: [adTagUri],
                        played: false
                    };
                } else {
                    myCueInfo[timeOffset].url.push(adTagUri); //urlﾃｩ窶ｦﾂ催･ﾋ�氾｣ﾂ�ｫﾃｨﾂｿﾂｽﾃ･ﾅ� 
                }
            }
        });

        //Prerollﾃ･ﾂｺﾆ津･窶佛�ﾃ｣窶堋ｿﾃ｣窶堋ｰﾃ｣ﾂ�ｮﾃｨﾂｨﾂｭﾃ･ﾂｮﾅ｡
        if (isPrerollEnabled && myCueInfo[0] != undefined) {
            //player.ima3.settings.serverUrl = myCueInfo[0].url[0]; //Prerollﾃ･ﾂｺﾆ津･窶佛�ﾃ｣窶堋ｿﾃ｣窶堋ｰﾃ｣ﾂ�ｮ1ﾃｧ窶｢ﾂｪﾃｧ窶ｺﾂｮﾃ｣窶壺凖ｨﾂｨﾂｭﾃ･ﾂｮﾅ｡
            __bcplayer_vr_flag = false;
            //myLog("Preroll URl is set to ima3 serverUrl, serverUrl = " + player.ima3.settings.serverUrl);
        }

        //ﾃ｣ﾆ停氾｣ﾆ陳ｭﾃ｣窶堋ｰﾃ｣ﾆ陳ｬﾃ｣窶堋ｹﾃ｣ﾆ陳静｣ﾆ陳ｼﾃ､ﾂｸﾅ�ﾃ｣ﾂ�ｧﾃ｣ﾂ�ｮﾃ･ﾂｺﾆ津･窶佛�ﾃ｣窶堋ｭﾃ｣ﾆ陳･ﾃ｣ﾆ陳ｼﾃ｣ﾆ陳敕｣窶堋､ﾃ｣ﾆ陳ｳﾃ｣ﾆ塚�ｨﾂ｡ﾂｨﾃｧﾂ､ﾂｺ
        var i = 0,
            playheadWell = document.getElementsByClassName('vjs-progress-control vjs-control')[0];
        for (var time in myCueInfo) {
            if (time != 0) {
                var elem = document.createElement('div');
                elem.className = 'vjs-marker';
                elem.id = 'ad' + i;
                elem.style.left = (time / _videoDuration) * 100 + '%';
                playheadWell.appendChild(elem);
                i++;
            }
        }

        //Play will be available because VMAP loading is completed.
        player.play = playFunc;

        if (resumeask && isShowResumeDialog) {
            //ﾃ｣ﾆ陳ｪﾃ｣窶堋ｸﾃ｣ﾆ陳･ﾃ｣ﾆ陳ｼﾃ｣ﾆ� ﾃｧﾂ｢ﾂｺﾃｨﾂｪﾂ催｣ﾆ停ぎﾃ｣窶堋､ﾃ｣窶堋｢ﾃ｣ﾆ陳ｭﾃ｣窶堋ｰﾃ｣窶壺凖ｨﾂ｡ﾂｨﾃｧﾂ､ﾂｺ
            showResumeDialog();
        } else {
            if (isAutoPlay && deviceType == "desktop") { //ﾃｨ窶｡ﾂｪﾃ･窶ｹ窶｢ﾃ･窶�ﾂ催ｧ窶敘ｸﾃ｣ﾂ�ｯPCﾃ｣ﾂ�ｮﾃ｣ﾂ�ｿ
                player.play();
            } else {
                //Display Big Play Button
                $('.vjs-big-play-button').css('display', 'block');
            }
        }
    }

    function showResumeDialog() {
        var html = '';
        html += '<div class="resumeDialog">';
        html += '<img src="' + resumeTitleImgPath + '" class="resumeTitle"></img>';
        html += '<a href="javascript:void(0);" onclick="__bcplayer.bcPlayStart();"><img src="' + playStartImgPath + '" class="playStartImg" onmouseover="this.src=\'' + playStart_hImgPath + '\'" onmouseout="this.src=\'' + playStartImgPath + '\'"></img></a>';
        html += '<a href="javascript:void(0);" onclick="__bcplayer.bcResumePlay();"><img src="' + resumeStartImgPath + '" class="resumeStartImg" onmouseover="this.src=\'' + resumeStart_hImgPath + '\'" onmouseout="this.src=\'' + resumeStartImgPath + '\'"></img></a>';
        html += '</div>';
        overlay = document.createElement('div');
        overlay.innerHTML = html;
        player.el().appendChild(overlay);
    }

    function hideResumeDialog() {
        if (overlay != null) {
            player.el().removeChild(overlay);
        }
    }

    __bcplayer.bcPlayStart = function () {
        hideResumeDialog();
        player.play();
    };

    __bcplayer.bcResumePlay = function () {
        hideResumeDialog();
        playHeadTime = resume_info.lastPlayed - 2;
        if (playHeadTime < 0) {
            playHeadTime = 0;
        }
        if (playHeadTime > 0) {
            player.ima3.settings.serverUrl = "";
            isPrerollEnabled = false;
        }
        player.play();
    };

    function create_random(n) {
        var _CODE_TABLE = "0123456789";
        var r = "";
        for (var i = 0, k = _CODE_TABLE.length; i < n; i++) {
            r += _CODE_TABLE.charAt(Math.floor(k * Math.random()));
        }
        return r;
    }

    function getCueSec(time) {
        var hour = parseInt(time.substr(0, 2));
        var min = parseInt(time.substr(3, 2));
        var sec = parseInt(time.substr(6, 2));
        var msec = parseInt(time.substr(9, 3));
        //myLog("getCueSecs=" + time + ", " + hour + ", " + min + ", " + sec + ", " + msec);
        return hour * 3600 + min * 60 + sec + msec / 1000;
    }

    function padZero(num) {
        return (num < 10 ? '0' : '') + num;
    }

    function isOption(str) {
        for (var key in _OPTIONS) {
            if (key == str) return true;
        }
        return false;
    }

    function parseOptions() {
        if (isEmpty(settings)) {
            return;
        }
        for (var key in settings) {
            if (isOption(key)) {
                _OPTIONS[key] = settings[key];
            }
        }
    }

    function myLog(str) {
        if (_OPTIONS.debug) {
            console.log(str);
        } else if (typeof _bc_debug !== "undefined" && _bc_debug) {
            console.log(str);
        }
    }

    function isEmpty(str) {
        if (str != null && str != undefined && str != '' && str.length != 0) {
            return false;
        }
        return true;
    }

});
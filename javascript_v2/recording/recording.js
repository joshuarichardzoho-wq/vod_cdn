//$Id$
var RTCPRecording = {};

RTCPRecording = {

    getPBToken : function (confkey,vodkey,successCallback,failureCallback)
    {
        $.ajax({
            url: "_wmsrtc/v2/recordings?conferencekey="+encodeURIComponent(confkey)+"&vodkey="+encodeURIComponent(vodkey),
            type : "GET",
            contentType : "application/json",
            success: function(result)
            {
				if(result && typeof successCallback == 'function')
				{
					successCallback(result);
				}
            },
            error : function (error)
            {
                if(typeof failureCallback =='function')
                {
                    failureCallback(error);
                }
            }
        })

    },
    getWSSSidForRec : function (confkey,vodkey,pbtoken,wssurl, isPopEnabled, successCallBack,failureCallBack, timeoutCallBack)
    {
		var data = {
			confkey : confkey,
			vodkey : vodkey,
			pbtoken : pbtoken
		};

		if(isPopEnabled)
		{
			data.ver = 2;
		}

		$.ajax({
			url : wssurl + "/rtcviewer",
			method : "GET",
			data : data,
			xhrFields : {
				withCredentials: true
			},
			timeout : 15000,
			success : function(data, textStatus, request)
			{
				if(successCallBack && typeof successCallBack == "function")
				{
					successCallBack(data, request.getResponseHeader('x-stateless_auth'), request.getResponseHeader("X-Recid"));
				}
			},
			error : function(xhr, textStatus)
			{
				if(textStatus === "timeout")
				{
					if(typeof timeoutCallBack === "function")
					{
						timeoutCallBack(this);
					}
				}
				else if(typeof failureCallBack == "function")
				{
					failureCallBack();
				}
			}
		});
    },
    getWSSSidForStreaming : function (confkey, lstoken, viewerId, wssurl, successCallBack, failureCallBack, timeoutCallBack)
    {
		$.ajax({
			url : wssurl + "/wsrtcp/verifyuser",
			method : "GET",
			data : {
				confkey : confkey,
				lstoken : lstoken,
				viewerid : viewerId
			},
			xhrFields : {
				withCredentials : true
			},
			timeout : 15000,
			success : function(data)
			{
				if(typeof successCallBack == "function")
				{
					successCallBack(data);
				}
			},
			error: function(xhr, textStatus)
			{
				if(textStatus === "timeout")
				{
					if(typeof timeoutCallBack === "function")
					{
						timeoutCallBack(this);
					}
				}
				else if(typeof failureCallBack == "function")
				{
					failureCallBack();
				}
			}
		});
    },
    leave : function(sid, wssurl, x_stateless_auth, type, successCallback, failureCallback, timeoutCallBack)
    {
		$.ajax({
			url : wssurl + type + "/leave?sid="+sid,
			method : "GET",
			headers : {
				stateless_auth: x_stateless_auth
			},
			/*xhrFields : {
				withCredentials: true
			},
			data : {
				sid : sid
			},*/
			timeout : 15000,
			success : function(data)
			{
				if(typeof successCallBack == "function")
				{
					successCallBack(data);
				}
			},
			error : function(xhr, textStatus)
			{
				if(textStatus === "timeout")
				{
					if(typeof timeoutCallBack === "function")
					{
						timeoutCallBack(this);
					}
				}
				else if(typeof failureCallBack == "function")
				{
					failureCallback();
				}
			}
		});
    },
    getPopTokenForVod : function (wssurl, rtcpFlow, sid, x_stateless_auth, successCallBack,failureCallBack, timeoutCallBack)
    {
		$.ajax({
			url : wssurl+"/"+(rtcpFlow ? "vodrtcp" : "vod")+"/refreshtoken",
			method : "GET",
			data : {
				sid : sid
			},
			/*headers : {
				stateless_auth : x_stateless_auth,
			},
			xhrFields : {
				withCredentials: true
			},*/
			timeout : 15000,
			success : function(data)
			{
				if(typeof successCallBack == "function")
				{
					successCallBack(data);
				}
			},
			error: function(xhr, textStatus)
			{
				if(textStatus === "timeout")
				{
					if(typeof timeoutCallBack === "function")
					{
						timeoutCallBack(this);
					}
				}
				else if(typeof failureCallBack == "function")
				{
					failureCallBack();
				}
			}
		});
    }
}


jQuery.sap.require("okul.AllRequest.AllRequest");var UserServices={UserReq:function(e){return new Promise(function(r,u){AllRequest.POST(e).then(function(e){r(e)})})}};
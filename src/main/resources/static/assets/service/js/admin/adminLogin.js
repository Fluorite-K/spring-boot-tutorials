/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : ysJang
 * @CreateDate : 2019. 03. 04.
 * @DESC : [관리자웹] 로그인
 ******************************************************************************/
(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vc || et.vc.name !== "adminLogin") {
			et.vc = ctrl(et);
		}
		et.vc.init();
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "adminLogin";
	ctrl.path = "/admin/login";
	
	ctrl.formId = "#formLogin";
	
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 */
	ctrl.init = function() {
		var self = this;
		
		// set form's action and validation
		self.setValidate();
	};
	
	// ============================== 동작 컨트롤 ==============================
	/**
	 * 폼에 validator 세팅
	 */
	ctrl.setValidate = function() {
		var self = this;
		var validator, name;
		// set $.validator
		validator = new ETValidate(self.formId).setSubmitHandler(self.submit).setErrorPlacement(et.setErrorPlacement);
		name = "user_id";
		validator.setType(name, validator.TYPE_REQUIRED_TEXT, et.getMsg("msg.login.enterUserId"));
		name = "user_passwd";
		validator.setType(name, validator.TYPE_REQUIRED_TEXT, et.getMsg("msg.login.enterPassword"));
		validator.apply();
	};
	
	// ============================== 동작 컨트롤 : 외부 등록 ==============================
	/**
	 * $.validator 에서 submit 발생시 동작
	 */
	ctrl.submit = function(form) {
		var self = et.vc;
		var postData = ETValidate.convertFormToObject(form, true, true);
		
		et.toggleFormElements(self.formId, false);
		postData.user_passwd = $.base64.encode(postData.user_passwd);
		new ETService().setSuccessFunction(self.callSucceed).callService(self.path + "/doLogin", postData);
	};
	
	/**
	 * 서비스 호출 결과를 핸들링.
	 * 
	 * @param {string} returnData 서버에서 전달받은 값
	 */
	ctrl.callSucceed = function(returnData) {
		var self = et.vc;
		var msg, causedId;
		if (returnData.errorMsg === "") {
			new ETService().callView("/admin/monitoring", null);
		} else {
			if (returnData.errorMsg === "noLoginID") {
				msg = "msg.login.noLoginID";
				causedId = "#iptUserId";
			} else if (returnData.errorMsg === "noLoginPassword") {
				msg = "msg.login.loginError";
				causedId = "#iptPassword";
			} else {
				console.log("Unknown data: " + returnData);
				msg = "msg.common.error";
				causedId = null;
			}
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", et.getMsg(msg), causedId);
			et.toggleFormElements(self.formId, true);
		}
	};
	
	return ctrl;
}));
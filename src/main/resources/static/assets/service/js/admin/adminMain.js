/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : ysJang
 * @CreateDate : 2019. 03. 04.
 * @DESC : [관리자웹] 로그인
 ******************************************************************************/
(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vcMain || et.vcMain.name !== "adminMain") {
			et.vcMain = ctrl(et);
		}
		et.vcMain.init();
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "adminMain";
	ctrl.path = "/admin/main";
	
	ctrl.formId = "#formMain";
	
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 */
	ctrl.init = function() {
		var self = this;
		
		var url = location.href;
		$(".ecoleSideMenu > a").removeClass("sel");
		
		if (-1 < url.indexOf("monitoring")) {
			$("#aMenu1").addClass("sel");
		} else if (-1 < url.indexOf("statistics")) {
			$("#aMenu2").addClass("sel");
		} else if (-1 < url.indexOf("masking")) {
			$("#aMenu3").addClass("sel");
		} else if (-1 < url.indexOf("inspection")) {
			$("#aMenu4").addClass("sel");
		} else if (-1 < url.indexOf("history")) {
			$("#aMenu5").addClass("sel");
		} else if (-1 < url.indexOf("setting")) {
			$("#aMenu6").addClass("sel");
		}
		
		// set form's action and validation
		$(".ecoleSideMenu > a").click(self.menuClickHandler);
		$("#aMyInfo").click(self.myInfoHandler);
		$("#btnMyInfoUpdate").click(self.myInfoUpdateHandler);
		
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
		validator = new ETValidate(self.formId).setSubmitHandler(self.submit).setErrorPlacement(et.setErrorPlacementFindClass);
		name = "user_passwd";
		validator.setType(name, validator.TYPE_REQUIRED_TEXT, "비밀번호를 입력해 주세요.");
		name = "user_passwd_confirm";
		validator.setRequired(name, function(element){return !_.isEmpty($("#iptPassword").val());}, "비밀번호 확인을 입력해 주세요.").setEqualTo(name, "#iptPassword", "비밀번호와 비밀번호 확인값이 일치하지 않습니다. 값을 확인해 주세요.");
		validator.apply();
	};
	
	ctrl.menuClickHandler = function(e) {
		var self = et.vcMain;
	};
	
	ctrl.myInfoHandler = function(e) {
		var self = et.vcMain;
		$("#iptPassword").val("");
		$("#user_passwd_confirm").val("");
		$("#popMyInfo").show();
	};
	
	ctrl.myInfoUpdateHandler = function(e) {
		var self = et.vcMain;
		$(self.formId).submit();
		
	};
	
	// ============================== 동작 컨트롤 : 외부 등록 ===========================
	/**
	 * $.validator 에서 submit 발생시 동작
	 */
	ctrl.submit = function(form) {
		var self = et.vcMain;
		var postData = ETValidate.convertFormToObject(form, true, true);
		postData.user_passwd = $.base64.encode(postData.user_passwd);
		new ETService().setSuccessFunction(self.myInfoUpdateCallSucceed).callService(self.path + "/myInfoUpdate", postData);
	};
	
	/**
	 * 비밀번호 변경 후 리스너
	 */
	ctrl.myInfoUpdateCallSucceed = function(result) {
		if (result == ETCONST.ERROR) {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "내정보", "서비스 오류 입니다. 다시 확인 부탁드립니다.");
		} else {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "내정보", "비밀번호가 변경되었습니다.");
			$("#popMyInfo").hide();
		}
	}
	
	return ctrl;
}));
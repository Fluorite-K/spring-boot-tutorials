/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : dongsuk.kwak
 * @CreateDate : 2019. 06. 12.
 * @DESC : [분석가웹] 학습 - 검색학습_형태소 분해
 ******************************************************************************/

(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vc || et.vc.name !== "tokenization") {
			et.vc = ctrl(et);
		}
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "tokenization";
	ctrl.path = "/analyzer/train/tokenization";
	ctrl.formId="#formSearch"
	
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 * 
	 */
	ctrl.init = function(initData) {
		var self = et.vc;
		//self.setValidate();
		// set View
		$(".select2").select2(); // input 변수 조건 
//		alert(JSON.stringify(initData))  //데이터 넘어오는지 확인용도.
		et.makeSelectOption(initData.dataCreateDate, {value:"date_t", text:"date_t"}, "#selCreateDate", "--날짜를 선택해주세요--");
//		$("#selCreateDate").attr("selected", "selected");  // value 없는 기본 선택지로 선택을 돌려놓기.
		$("#selCreateDate").trigger("change");
		$("#inputReal").hide();
		et.makeSelectOption(initData.dataSetVariableList, {value:"header_cd", text:"combobox_label"}, "#selInput", "");
		et.makeSelectOption(initData.dataSetVariableList, {value:"header_cd", text:"combobox_label"}, "#selTarget", "--사용되지 않음--");
		$("#selTarget").attr("selected", "selected");  // value 없는 기본 선택지로 선택을 돌려놓기.
		$("#selTarget").trigger("change");
		$("#selData option:eq(0)").prop("selected", true); 
		$("#selData").trigger("change");
		// set form's action and validation
		
		// set Event
		$(".states").change(self.selectChangeHandler);
		$("#btnCheckProcess").on("click", self.btnCheckProccesClickHandler);
		$("#btnSubmit").on("click", self.submit);
	};
	
	// ============================== 동작 컨트롤 ==============================
	
	//validator 설정
	ctrl.setValidate = function() {
		var self = et.vc;
		var validator, name;
		// set $.validator
		
		validator = new ETValidate(self.formId).setSubmitHandler(self.submit).setErrorPlacement(et.setErrorPlacementFindClass);
		
		name = "variable_header_cd";
		validator.setRequired(name, true, "input 변수 조건을 하나 이상 입력해주세요.");
		
		validator.apply();
	};
	
	
	/**
	 * train 또는 문서선택 sel 변경시
	 */
	ctrl.getDataSetVariables = function() {
		var self = et.vc;
		var postData = {};
		var datasetCD = $("#selData").val();
		if (datasetCD != " ") {
			postData.dataset_cd = datasetCD;
		}		
		new ETService().setSuccessFunction(self.getDataSetVariablesCallSucceed).callService(self.path + "/getDataSetVariables", postData);
	};
	
	// ============================== 동작 컨트롤 : 외부 등록 ==============================
	/**
	 * train 또는 문서선택 sel 변경에 따른 결과
	 */
	ctrl.getDataSetVariablesCallSucceed = function(result) {
		var self = et.vc;

		$.each(result, function(index, item) {
			$("#selInput option[value='"+item.header_cd+"']").attr("selected", "selected");
		});
		$("#selInput").trigger("change");
	};
	
	/**
	 * 서비스 호출 결과를 핸들링.
	 * 
	 * @param {string} returnData 서버에서 전달받은 값
	 */
	ctrl.callSucceed = function(returnData) {
		var self = et.vc;
	
		if (returnData.result === ETCONST.SUCCESS) {
//			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "형태소 분해가 시작되었습니다.");
			self.requestTokenizationStart(returnData);
		} else {
//			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "형태소 분해 시작에 실패했습니다. 다시 시도해 주세요.");
			self.tokenizeFailureCallback(returnData)
		}
	};
	
	/**
	 * 진행상태 확인 요청 성공 콜백 메서드
	 */
	ctrl.getUserProcessCallSucceed = function(returnData) {
		var self = et.vc;
		var statusMap = {ST010: '진행중', ST011: '완료', ST012: '실패'};
		et.createProcess('형태소 분해', '#popUserProcess', '#divProcContainer', returnData, statusMap, self.removeCompletedHandler);
		$("#btnRemoveCompleted").on("click", self.removeCompletedHandler);
	};
	
	/**
	 * 완료목록 삭제 성공 콜백 메서드
	 */
	ctrl.removeCompleteListCallSucceed = function(returnData) {
		var self = et.vc;
		
		if (returnData.result === ETCONST.SUCCESS) {
			var removedList = returnData.hist_ids;
			for (var i in removedList) {
				$('#p_'+removedList[i]).remove();
			}
			if ($('#divProcContainer>.bxEcoleRoundNoP').length < 1) {
				$('#divProcContainer').html('<div class="no-proc"><p class="no-proc-msg">진행 중인 프로세스가 없습니다.</p></div>');
			}
		} else {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "완료항목 제거에 실패했습니다. 다시 시도해 주세요.");
		}
	};
	
	/**
	 * 형태소 분해 시작 요청
	 */
	ctrl.requestTokenizationStart = function(postData) {
		var self = et.vc;
		
		$.ajax({
			url: ETCONST.API_ROOT_URL + '/aesthetic/api/tokenize',
			data: postData,
			type: "post",
			dataType: "JSON",
			accept: 'application/json',
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			crossOrigin: true,
			
			error: et.ajaxErrorCallback,
			success: function(returnData) {
				if (returnData.result === ETCONST.SUCCESS) {
					et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "형태소 분해가 시작되었습니다.");
				} else {
					//et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "형태소 분해 시작에 실패했습니다. 다시 시도해 주세요.");
					self.tokenizeFailureCallback(returnData);
				}
			},
		});
	};
	
	ctrl.tokenizeFailureCallback = function(postData) {
		var self = et.vc;
		
		new ETService().setSuccessFunction(function(result) {
				et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "형태소 분해 시작에 실패했습니다. 다시 시도해 주세요.");
			}).callService(self.path + "/remove", postData);
	};
	
	// ============================== 이벤트 리스너 ==============================
	
	/**
	 * $.validator 에서 submit 발생시 동작
	 */
	ctrl.submit = function(form) {
		var self = et.vc;
		
		var isValid = false;
		// 학습 정보 유효성 검사
		var inputs = $('#selInput option:selected');
		isValid = (inputs && inputs.length > 0) === true; 
		self.showErrorMsg('#selInput', 'variable_header_cd', 'input 변수를 한 개 이상 선택해주세요.', isValid);
		if (!isValid) return;
		
		var postData = {};
		postData.token_label = $("#ipTokenLabel").val();
		postData.dataset_cd = $("#selData").val();
		postData.variable_header_cd = $("#selInput").val();
		postData.target_header_cd = $("#selTarget").val();
		new ETService().setSuccessFunction(self.callSucceed).callService(self.path + "/save", postData);
	};
	
	
	/**
	 * train 또는 문서선택 sel 변경시
	 */
//	ctrl.selectChangeHandler = function(e) {
//		var self = et.vc;
//		var id = e.currentTarget.id;
//		var text = $("#"+id+" option:selected").text();
//		
//		if (id == "selData") {
//			$("#lblData").text(text);
//			$("#lblInput").text("");
//			$("#lblTarget").text("");
//			$("#btnSubmit").addClass("disable");
//			
//			var targetCD = $("#selData option:selected").data();
//			if (!!targetCD.target_header_cd) {
//				$("#selTarget option[value='"+targetCD.target_header_cd+"']").attr("selected", "selected");
//			} else {
//				$("#selTarget option:eq(0)").prop("selected", true);
//			}
//			$("#selTarget").trigger("change");
//			
//			self.getDataSetVariables();
//			
//		} else if (id == "selInput") {
//			text = "";
//			$("li > div").each(function() {
//				text = text + $(this).text() + ",";
//			});
//			text = text.substr(0, text.length-1);
//			$("#lblInput").text(text);
//			$("#btnSubmit").removeClass("disable");
//			
//		} else if (id == "selTarget") {
//			$("#lblTarget").text(text);
//		}
//	};
	ctrl.selectChangeHandler = function(e) {
		var self = et.vc;
		var id = e.currentTarget.id;

		if(id =="selCreateDate"){// 선택한 option란이 날짜일경우
			if($("#selCreateDate").val() ==''){ // 날짜 기본값으로 선택할시 
//				$("#selData").val($("#selData").val()).prop("selected", false);
				$("#selData option:eq(0)").prop("selected", true); 
				$("#selData").trigger("change");
				$("#selData").prop("disabled",true);
			}else{ // 기본값 외의 날짜를 선택하면.
				self.getDataSetByDate();
				$("#selData").prop("disabled",false);
				
			}
		}else if(id =="selData"){// 선택한 option란이 데이터셋일 경우
			if($("#selData").val() ==''){ // 그리고 값이 없는 기본 설정을 하였을시.
				$("#selTarget option:eq(0)").prop("selected", true); 
				$("#selTarget").trigger("change");// target 변수 조건을 val이 없는 기본값으로 놓습니다.
				$("#selInput option:selected").prop("selected", false);
				$("#selInput").trigger("change"); // 이미 선택되어있는 input 변수조건들을 비활성화 합니다.
				$("#btnSubmit").prop("disabled",true);
				$("#inputFake").show();
				$("#inputReal").hide();
			}else{ // 값이 존재하는 선택을 했을 경우니까 Input변수와 Target변수를 불러옵니다.
				self.getIptTargetByCD();
				$("#btnSubmit").prop("disabled",false);
				$("#inputFake").hide();
				$("#inputReal").show();
			}
		}
	};
	
	/**
	 * 날짜 선택에 따른 문서 데이터셋 동적 생성
	 */
	ctrl.getDataSetByDate = function() {	
		var self = et.vc;
		var postData = {};
		var dataSetDate = $("#selCreateDate").val();
		postData.date = dataSetDate;
//		
		new ETService().setSuccessFunction(self.getDataSetDateCallSucceed).callService(self.path + "/getDataSetByCreateDate", postData);
	};
	/**
	 * 날짜 선택에 따른 문서데이터 로드 성공시 그에 대한 옵션 생성
	 */
	ctrl.getDataSetDateCallSucceed = function(result) {
		
		var self = et.vc;
		var ress = result;
		et.makeSelectOption(result, {value:"dataset_cd", text:"dataset_label"}, "#selData", "--문서 데이터셋 선택--"); // 웹페이지에도 데이터가 없을시의 option을 넣었다.(처음로딩시의 연출을 위해?)
		$("#selInput").trigger("change");
	};
	
	ctrl.getIptTargetByCD = function(){
		var self = et.vc;
		var postData = {};
		var dataSetCD = $("#selData").val();
		postData.dataset_cd = dataSetCD;
		new ETService().setSuccessFunction(self.getIptTargetByCDCallSucceed).callService(self.path + "/getIptTargetByDatasetCd", postData);
	};
	ctrl.getIptTargetByCDCallSucceed = function(result){
		var self = et.vc;
		var resultTarget = result[0].target_cd;
		$("#selTarget").val(resultTarget).prop("selected", true);
		$("#selTarget").trigger("change");
		//선택해주는 반복문 
		$.each(result, function(index, item) {
			$("#selInput option[value='"+item.header_cd+"']").prop("selected", true);
		});
		$("#selInput").trigger("change");
		
	}
	/**
	 * 진행상태 확인 버튼 클릭 이벤트
	 */
	ctrl.btnCheckProccesClickHandler = function(e) {
		var self = et.vc;
		var postData = {};
		postData.type_list = ["ST010", "ST011", "ST012"];
		new ETService().setSuccessFunction(self.getUserProcessCallSucceed).callService(self.path + "/process", postData);
	};
	
	/**
	 * 완료목록 삭제 요청 핸들러
	 */
	ctrl.removeCompletedHandler = function() {
		var self = et.vc;
		var postData = {};
		var removeList = [];
		
		$('input:hidden[name="hist_id"]').each(function() {
			if (['ST011', 'ST012'].includes($(this).data("type"))) {
				removeList.push($(this).val());
			}
		});
		postData.hist_ids = removeList;
		
		new ETService().setSuccessFunction(self.removeCompleteListCallSucceed).callService(self.path + "/removeCompleted", postData);
	};
	
	// ============================== 공통 함수 ==============================
	/**
	 * et 프레임워크를 사용하지 않는 ajax 요청 실패 콜백함수
	 */
//	ctrl.ajaxErrorCallback = function(xhr, ajaxOptions, thrownError) {  //공통함수로 대체해놓음
//		var self = et.vc;
//		
//		
//		if (xhr.status == 500) {
//			location.href = getContextPath()+"/open500Error";
//		} else if (xhr.status == 404) {
//			location.href = getContextPath()+"/open404Error";
//		} else if (xhr.status == 400) {
//			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", xhr.responseJSON.msg);
//		}
//	};
	
	/**
	 * 유효성 검사 에러메시지 출력
	 */
	ctrl.showErrorMsg = function(sTargetSelector, sName, sErrorMsg, bIsValid) {
		// 에러 메시지 등록
		$('.error'+ sName + '>label').html(sErrorMsg);
		
		if (bIsValid) {
			$('.error'+sName).prop('style', 'display: none');
		} else {
			$('.error'+sName).prop('style', 'display: block');
		}
	};
	
	return ctrl;
}));
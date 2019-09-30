	/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : mk jang
 * @CreateDate : 2019. 06. 12.
 * @DESC : [분석가웹] 분류모형 학습 - 분류모형 학습
 ******************************************************************************/

(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vc || et.vc.name !== "classifier_training") {
			et.vc = ctrl(et);
		}
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "classifier_training";
	ctrl.path = "/analyzer/classifier/train";
	ctrl.dataTables = null;
	ctrl.initData = {};
	ctrl.dataTablesInit = true;
	var urlF = '/aesthetic/api/train_cls';
	var textForStart= "학습이 시작되었습니다.";
	var textForFailure="분류모형 학습 시작에 실패했습니다. 다시 시도해 주세요.";
	var controllerForFailure = "/remove"
		
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 * 
	 */
	ctrl.init = function(initData) {
		var self = et.vc;
		self.initData = initData;
		$('.select2').select2();
		
		et.makeSelectOption(initData.vectorDateList, {value:"create_date", text:"combobox_label"}, "#selDate", "--날짜를 선택해주세요 --");
		
		et.makeSelectOption(initData.codeList, {value:"code_cd", text:"code_name"}, "#selAlg", "");
		$("#selDate option:eq(0)").attr("selected", "selected");  // value 없는 기본 선택지로 선택을 돌려놓기.
		$("#selDate").trigger("change");
//		alert($("#selDate option:first").text());
		$("#selDate").change(self.selDateChangeHandler);
		
		$("#selVector").change(self.selVectorChangeHandler);
		
		$("#selAlg").change(self.selAlgChangeHandler);
		$("#btnCheckProcess").on("click", self.btnCheckProccesClickHandler);
		
		$("#btnClassifierTrain").click(self.btnClassifierTrainClickHandler);
		
		self.initSlideView();
	};
	
	/**
	 * 화면상의 모든 컨트롤들을 초기화 시켜준다
	 */
	ctrl.initView = function() {
		$("#selAlg").select2("val","");
		$("#selDate option:eq(0)").prop("selected", true);
		$("#selDate").trigger("change");
		$("#selAlg").trigger("change");
		
		$('#MLPRate').data("slider").setValue("0.001");
		$('#MLPEpoch').data("slider").setValue("200");
		$('#MLPPenalty').data("slider").setValue("0.001");
		$('#RFCPU').data("slider").setValue("6");
		$('#RFTree').data("slider").setValue("200");
		$('#RFDepth').data("slider").setValue("6");
		$('#SVMPenalty').data("slider").setValue("1");
		$('#SVMIter').data("slider").setValue("600");
		$('#SVMGamma').data("slider").setValue("0.001");
		$('#GLMCPU').data("slider").setValue("6");
		$('#GBMCPU').data("slider").setValue("6");
		$('#GBMDepth').data("slider").setValue("6");
		$('#GBMRate').data("slider").setValue("0.01");
		$('#GBMTree').data("slider").setValue("200");
		
		$('input:radio[name="MLPActivation"]:input[value="ReLu"]').prop("checked", true);
		$('input:radio[name="MLPEarlyStop"]:input[value="false"]').prop("checked", true);
		$('input:radio[name="MLPSolver"]:input[value="Adam"]').prop("checked", true);
		$('input:radio[name="RFFeatures"]:input[value="sqrt"]').prop("checked",true)
		$('input:radio[name="RFBootstrap"]:input[value="true"]').prop("checked", true);
		$('input:radio[name="RFCriterion"]:input[value="Gini"]').prop("checked", true);
		$('input:radio[name="SVMKernel"]:input[value="RBF"]').prop("checked", true);
		$('input:radio[name="SVMDecision"]:input[value="OneVsRest"]').prop("checked", true);
		$('input:radio[name="GLMSolver"]:input[value="lbfgs"]').prop("checked", true);
		$('input:radio[name="GLMCV"]:input[value="5"]').prop("checked", true);
		$('input:radio[name="GLMMulti"]:input[value="OneVsRest"]').prop("checked", true);
		$('input:radio[name="GBMImportance"]:input[value="split"]').prop("checked", true);
		
	}
	
	/**
	 *  Slide 초기 값
	 */
	ctrl.initSlideView = function() {
		//slider 생성
		$('#MLPRate').slider({
		    step: 0.001,
		    min: 0.001,
		    max: 0.05,
		    value: 0.001, // 기본 값(시작 값)
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(3);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
	    });
		
		$('#MLPEpoch').slider({
		    step: 100,
		    min: 100,
		    max: 200,
		    value: 200,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
	    });
		
		$('#MLPPenalty').slider({
			step: 0.001,
			min: 0,
			max: 0.01,
			value: 0.001,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(3);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		$('#RFCPU').slider({
			step: 11,
			min: 1,
			max: 23,
			value: 6,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		$('#RFTree').slider({
			step: 100,
			min: 100,
			max: 2000,
			value: 200,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		$('#RFDepth').slider({
			step: 1,
			min: 4,
			max: 15,
			value: 6,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		$('#SVMPenalty').slider({
			step: 0.001,
			min: 1,
			max: 10,
			value: 1,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(3);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		$('#SVMIter').slider({
			step: 1,
			min: 0,
			max: 2000,
			value: 600,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		$('#SVMGamma').slider({
		    step: 0.001,
		    min: 0.001,
		    max: 0.05,
		    value: 0.001, // 기본 값(시작 값)
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(3);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
	    });
		
		
		$('#GLMCPU').slider({
			step: 1,
			min: 1,
			max: 23,
			value: 6,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		
		$('#GBMCPU').slider({
			step: 1,
			min: 1,
			max: 23,
			value: 6,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		
		$('#GBMDepth').slider({
			step: 1,
			min: 4,
			max: 15,
			value: 6,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		$('#GBMRate').slider({
			step: 0.001,
			min: 0.01,
			max: 0.5,
			value: 0.01,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(3);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
		$('#GBMTree').slider({
			step: 100,
			min: 100,
			max: 2000,
			value: 200,
		}).on('slide', function(e){
			var val = $(this).data("slider").getValue().toFixed(0);
			$(this).data("slider").setValue(val);
			$($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
		});
		
	};
	
	
	// ============================== 동작 컨트롤 ==============================
	/**
	 * 좌측 selectbox 컨트롤시 동작 
	 * 이 동작으로 인해 날자, 파일명, tag, 분류모형 학습 버튼 이 활성화 비활성화 된다
	 */
	ctrl.formControll = function (){
		var self = et.vc;
		var classifierTrainEnabled = false;
		$("#spDate").html("");
		$("#spVector").html("");
		$("#spAgl").html("");
		
		$("#spDate").html($("#selDate").val());
		if($("#selVector").val() !='') // 기본값이 tag에 들어가는 일이 생겨서 기본값은 들어가지 않기 위해 추가하였습니다.
		$("#spVector").html($("#selVector option:checked").text());
		
		var vectorObj = $("#selVector option:checked").data();
		if (vectorObj == null || vectorObj.tag_name == undefined || vectorObj.tag_name == null) {
			$("#spAgl").html("");
		} else {
			$("#spAgl").html(vectorObj.tag_name);
		}
		
		if ($("#spDate").html() == "" || $("#spVector").html() == "" || null == $("#selAlg").val()) {
			classifierTrainEnabled = false;
		} else {
			classifierTrainEnabled = true;
		}
		
		if (classifierTrainEnabled) {
			$("#btnClassifierTrain").removeClass("disable");
		} else {
			$("#btnClassifierTrain").addClass("disable");
		}
		
		if($("#selDate").val() =='' && $("#selVector").val() !=''){
			
			// 각각의 펑션을 이프문으로 나눠서 분류하고 돌아가게 만듬?
			//vector의 change 호출단에 요구조건을 걸어서 해결함. 날짜가 기본값이면 호출안되게 해서 무한루프를 극복.
			$("#selVector").prop("disabled",true);
			$("#selVector option:eq(0)").prop("selected", true);
			$("#selVector").trigger("change");
			$("#spVector").html("");
			$("#spAgl").html("");
		}
	};
	
	// ============================== 동작 컨트롤 : 외부 등록 ==============================
	/**
	 * 알고리즘의 Parameter 값을 가져온다
	 * 가져올때 seperator는 §
	 */
	ctrl.getParam = function(divId) {
		var self = et.vc;
		var algInputs = $(divId+" input");
		var params = "";
		$.each(algInputs, function(index, item) {
			var seperator = false;
			if ($(item).hasClass("slider")) {	//슬라이더
				var sliderValue = $(item).data("slider").getValue()+"";
				if (0 < sliderValue.indexOf(".")) {
					if (5 < sliderValue.length) {
						sliderValue = sliderValue.substring(0,5); 
					}
				}
				params += sliderValue;
				seperator = true;
			} else if ($(item).prop("type") == "radio") {
				if ($(item).prop("checked")) {
					params += $(item).val();
					seperator = true;
				}
			} else { }
			
			if (seperator) {
				params += "§";
			}
		});
		
		if (0 < params.length) {
			params = params.substr(0, params.length-1);
		}
		
		return params;
		
	};
	
	/**
	 * 진행상태 확인 요청 성공 콜백 메서드
	 */
	ctrl.getUserProcessCallSucceed = function(returnData) {
		var self = et.vc;
		var statusMap = {ST030: '진행중', ST031: '완료', ST032: '실패'};
		et.createProcess('분류모형 학습', '#popUserProcess', '#divProcContainer', returnData, statusMap, self.removeCompletedHandler);
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
	 * 완료목록 삭제 요청 핸들러
	 */
	ctrl.removeCompletedHandler = function() {
		var self = et.vc;
		var postData = {};
		var removeList = [];
		
		$('input:hidden[name="hist_id"]').each(function() {
			if (['ST031', 'ST032'].includes($(this).data("type"))) {
				removeList.push($(this).val());
			}
		});
		postData.hist_ids = removeList;
		
		new ETService().setSuccessFunction(self.removeCompleteListCallSucceed).callService(self.path + "/removeCompleted", postData);
	};

	// ============================== 이벤트 리스너 ==============================
	/**
	 * 분류 모형 학습시작
	 */
	ctrl.btnClassifierTrainClickHandler = function (e){
		var self = et.vc;
		var algValue = $("#selAlg").val();
		var algorithms = [];
		if (algValue != null) {
			for (var i=0; i < algValue.length ; i++) {
				if (algValue[i] != "") {
					var algoObj = {};
					algoObj.cls_type = algValue[i]; 
					algoObj.cls_conf = self.getParam("#div"+algValue[i]);
					algorithms.push(algoObj);
				}
			}
		}
		
		var vectorObj = $("#selVector option:checked").data();
		
		var postData = {};
		postData.vectorizer_cd = $("#selVector").val();
		postData.dataset_cd = vectorObj.dataset_cd;
		if ($("#laTrainLabel").val().trim() == "") {
			postData.is_create = 'Y';
			postData.train_label =  vectorObj.tag_name;
		} else {
			postData.train_label =  $("#laTrainLabel").val();
		}
		
		postData.classifierList = algorithms;
		new ETService().setSuccessFunction(self.setTrainClassifiterCallSucceed).callService(self.path + "/setTrainClassifiter", postData);
	}
	
	/**
	 *  분류 모형 학습 시작 완료 함수
	 */

	ctrl.setTrainClassifiterCallSucceed = function (returnData ) {
		var self = et.vc;
		if (returnData.result === ETCONST.SUCCESS) {
			self.requestTrainingStart(returnData);
		} else {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "학습 시작에 실패했습니다. 다시 시도해 주세요.");
		}
	};
	
	/**
	 * 분류모형 학습 시작 요청
	 */
	ctrl.requestTrainingStart = function(postData) {
		var self = et.vc;
		
		$.ajax({
			url: ETCONST.API_ROOT_URL + '/aesthetic/api/train_cls',
			data: postData,
			type: "post",
			dataType: "JSON",
			accept: 'application/json',
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			crossOrigin: true,
			
			error: et.ajaxErrorCallback,
			success: function(returnData) {
				if (returnData.result === ETCONST.SUCCESS) {
					et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "학습이 시작되었습니다.");
					self.initView();
				} else {
					self.trainingFailureCallback(returnData);
				}
			},
		});
	};
	
	
	
	/**
	 * 분류모형 학습 시작 실패 동작
	 */
	ctrl.trainingFailureCallback = function(postData) {
		var self = et.vc;
		
		new ETService().setSuccessFunction(function(result) {
				et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "분류모형 학습 시작에 실패했습니다. 다시 시도해 주세요.");
			}).callService(self.path + "/remove", postData);
	};
	
	
	/**
	 * 날짜를 변경 했을때 동작
	 * 해당날짜로 검색학습 파일명을 조회한다
	 */
	ctrl.selDateChangeHandler = function (e) {
		var self = et.vc;
//		$("#selVector").empty();
//		$("#selVector").select2("val", "");
		if ($("#selDate").val() != "" && $("#selDate").val() != " ") {
			var postData = {};
				postData.create_date = $("#selDate").val();
			new ETService().setSuccessFunction(self.getVectorizerListCallSucceed).callService(self.path + "/getVectorizerList", postData);
		} else {
			self.formControll();
		}
	};
	
	/**
	 * Doc2Vec 모델 조회 성공 콜백
	 */
	ctrl.getVectorizerListCallSucceed = function (result) {
		var self = et.vc;
		et.makeSelectOption(result, {value:"vector_cd", text:"vectorizer_label"}, "#selVector", "--검색학습 결과를 선택하여주세요--");
		$("#selVector option:eq(0)").prop("selected", true);
		$("#selVector").trigger("change");
		$("#selVector").prop("disabled",false);
		$("#selAlg").prop("disabled",false);
		self.formControll();
	};
	
	/**
	 * 검색학습 파일명을 변경했을때 동작
	 */
	ctrl.selVectorChangeHandler = function (e) {
		var self = et.vc;
		if($("#selDate").val() ==''){
			//selDate에 값이 없을떄 작동을 막기위해서 이렇게 설정하였습니다.
		}else{
		self.formControll();
		}
	}
	
	/**
	 * 알고리즘을 선택했을때 동작
	 */
	ctrl.selAlgChangeHandler = function (e) {
		var self = et.vc;
		for (var i=1; i < 6 ; i++) {
			$("#divALG0"+i).hide();
		}
		var algValue = $("#selAlg").val();
		if (algValue != null) {
			for (var i=0; i < algValue.length ; i++) {
				if (algValue[i] != "") {
					$("#div"+algValue[i]).show();
				}
			}
		}
		
		self.formControll();
	}
	
	/**
	 * 진행상태 확인 버튼 클릭 이벤트
	 */
	ctrl.btnCheckProccesClickHandler = function(e) {
		var self = et.vc;
		var postData = {};
		postData.type_list = ["ST030", "ST031", "ST032"];
		new ETService().setSuccessFunction(self.getUserProcessCallSucceed).callService(self.path + "/process", postData);
	};
	
	// ============================== 공통 함수 ==============================
	
	return ctrl;
}));
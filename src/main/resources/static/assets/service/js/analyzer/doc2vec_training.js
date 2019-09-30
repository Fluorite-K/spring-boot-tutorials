/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : dongsuk.kwak
 * @CreateDate : 2019. 06. 13.
 * @DESC : [분석가웹] 학습 - 검색학습_검색학습
 ******************************************************************************/

(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vc || et.vc.name !== "doc2vec") {
			et.vc = ctrl(et);
		}
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "doc2vec";
	ctrl.path = "/analyzer/train/doc2vec";
	
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 * 
	 */
	ctrl.init = function(initData) {
		var self = et.vc;

		// set View
		self.setView(initData);

		// set form's action and validation
		
		// set Event
		$("select[name=states]").change(self.selectChangeHandler);
		$("#btnCheckProcess").on("click", self.btnCheckProccesClickHandler);
		$("#btnSubmit").on("click", self.submitClickHandler);
	};
	
	
	// ============================== 동작 컨트롤 ==============================
	/**
	 * set view
	 */
	ctrl.setView = function(initData) {
		var self = et.vc;
		
		$(".select2").select2();
		
		$('#ipNumCore').slider({
		    ticks_step: 1,
		    min: 1,
		    max: 23,
		    value: 4, // 기본 값(시작 값)
		}).on('slide', function(e){
			$("#spNumCore").text(e.value);
		});
		$('#ipWindowSize').slider({
		    ticks_step: 1,
		    min: 5,
		    max: 20,
		    value: 15, // 기본 값(시작 값)
		}).on('slide', function(e){
			$("#spWindowSize").text(e.value);
		});
		$('#ipMinCount').slider({
		    ticks_step: 1,
		    min: 1,
		    max: 5,
		    value: 2, // 기본 값(시작 값)
		}).on('slide', function(e){
			$("#spMinCount").text(e.value);
		});
		$('#ipAlpha').slider({
		    step: 0.001,
		    min: 0.001,
		    max: 0.01,
		    value: 0.001, // 기본 값(시작 값)
		}).on('slide', function(e){
	         var val = $(this).data("slider").getValue().toFixed(3);
	         $(this).data("slider").setValue(val);
	         $($(this).parent().parent().parent()).children(".sliderValueType1").html(val);
	    });
		$('#ipEpoch').slider({
//			ticks: [5,10,15,20,25,30,35,40,45,50],
		    step: 5,
		    min: 5,
		    max: 50,
		    value: 10, // 기본 값(시작 값)
		}).on('slide', function(e){
			$("#spEpoch").text(e.value);
		});
		
		et.makeSelectOption(initData.dateList, {value:"date", text:"date"}, "#selDate", "--날짜를 선택해주세요--");
		$("#selDate").attr("selected", "selected");  // value 없는 기본 선택지로 선택을 돌려놓기.
		$("#selDate").trigger("change");
		$("#selToken").prop("selected",true);
		$("#selToken").trigger("change");
		
	};
	
	/**
	 * 날짜 변경에 따른 형태소분해 파일명 조회
	 */
	ctrl.getTokenList = function() {
		var self = et.vc;
		var postData = {};
		var date = $("#selDate option:selected").val();
		if (date != " ") {
			postData.date = date;
		}	
		new ETService().setSuccessFunction(self.getTokenListCallSucceed).callService(self.path + "/getTokenList", postData);
	};
	
	
	// ============================== 동작 컨트롤 : 외부 등록 ==============================
	/**
	 * 날짜 변경에 따른 형태소분해 파일명 조회 결과
	 */
	ctrl.getTokenListCallSucceed = function(result) {
		var self = et.vc;

		et.makeSelectOption(result, {value:"token_cd", text:"token_label"}, "#selToken", "--형태소 분해 결과 선택--");
		$("#selToken").trigger("change");
	};
	
	/**
	 * 서비스 호출 결과를 핸들링.
	 * 
	 * @param {string} returnData 서버에서 전달받은 값
	 */
	ctrl.callSucceed = function(returnData) {
		var self = et.vc;
		
		if (returnData.result === ETCONST.SUCCESS) {
//			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "검색 학습이 시작되었습니다.");
			self.requestTrainingStart(returnData);
		} else {
//			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "검색 학습 시작에 실패했습니다. 다시 시도해 주세요.");
			self.trainFailureCallback(returnData);
		}
	};
	
	/**
	 * 진행상태 확인 요청 성공 콜백 메서드
	 */
	ctrl.getUserProcessCallSucceed = function(returnData) {
		var self = et.vc;
		var statusMap = {ST020: '진행중', ST021: '완료', ST022: '실패'};
		et.createProcess('검색학습', '#popUserProcess', '#divProcContainer', returnData, statusMap, self.removeCompletedHandler);
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
	 * Doc2Vec 학습 시작 요청
	 */
	ctrl.requestTrainingStart = function(postData) {
		var self = et.vc;
		
		$.ajax({
			url: ETCONST.API_ROOT_URL + '/aesthetic/api/train_d2v',
			data: postData,
			type: "post",
			dataType: "JSON",
			accept: 'application/json',
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			crossOrigin: true,
			
			error: et.ajaxErrorCallback,
			success: function(returnData) {
				
				if (returnData.result === ETCONST.SUCCESS) {
					et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "Doc2Vec 모델 학습이 시작되었습니다.");
				} else {
					//et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "형태소 분해 시작에 실패했습니다. 다시 시도해 주세요.");
					self.trainingFailureCallback(returnData);
				}
			},
		});
	};
	/**
	 * Doc2Vec 학습 시작 실패 동작
	 */
	ctrl.trainingFailureCallback = function(postData) {
		var self = et.vc;
		
		new ETService().setSuccessFunction(function(result) {
				et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "Doc2Vec 모델 학습 시작에 실패했습니다. 다시 시도해 주세요.");
			}).callService(self.path + "/remove", postData);
	};
	
	/**
	 * 완료목록 삭제 요청 핸들러
	 */
	ctrl.removeCompletedHandler = function() {
		var self = et.vc;
		var postData = {};
		var removeList = [];
		
		$('input:hidden[name="hist_id"]').each(function() {
			if (['ST021', 'ST022'].includes($(this).data("type"))) {
				removeList.push($(this).val());
			}
		});
		postData.hist_ids = removeList;
		
		new ETService().setSuccessFunction(self.removeCompleteListCallSucceed).callService(self.path + "/removeCompleted", postData);
	};
	
	// ============================== 이벤트 리스너 ==============================
	/**
	 * 날짜 변경시
	 */
	ctrl.selectChangeHandler = function(e) {
		var self = et.vc;
		var id = e.currentTarget.id;
		
		if (id == "selDate") {
			$("#spDate").text($("#selDate option:selected").text());
			
			
			if($("#selDate").val()==''){ // 날짜를 기본값으로 돌림
				$("#pTags").text("");
				$("#spTokenName").text("");
				$("#spTags").text(""); // 선택이 초기화되므로 선택시 나타나는 텍스트들도 초기화
				$("#selToken option:eq(0)").prop("selected", true); 
				$("#selToken").trigger("change");
				$("#selToken").attr("disabled",true);
			}else{ // 날짜를 기본값 외의 값이 존재하는 선택으로 전환
				self.getTokenList();
				$("#selToken").prop("disabled",false);
			}
			
		} else if (id == "selToken") {
			
			if($("#selToken").val() ==''){//형태소 분해 결과 선택이 기본값으로 설정된경우
				$("#btnSubmit").prop("disabled",true);
				
			}else{ 
				$("#pTags").text("");
				$("#spTokenName").text("");
				$("#spTags").text("");
				$("#btnSubmit").prop("disabled",false);
			}
			
			var tokenCD = $("#selToken option:selected").data();
			if (!!tokenCD && tokenCD.tags != undefined) {
				$("#pTags").text("tags: " + tokenCD.tags);
				$("#spTokenName").text($("#selToken option:selected").text());
				$("#spTags").text(tokenCD.tags);
			}
		}
	};
	
	/**
	 * 검색 학습 버튼 눌렀을 때
	 */
	ctrl.submitClickHandler = function() {
		var self = et.vc;
		var postData = {};
		var tokenCD = $("#selToken option:selected").data();
		
		postData.token_cd = tokenCD.token_cd;
		postData.vectorizer_label = $("#ipVectorLabel").val();
		postData.dimension = $(':radio[name="dimension"]:checked').val();
		postData.num_core = $("#ipNumCore").data("slider").getValue();
		postData.window_size = $("#ipWindowSize").data("slider").getValue();
		postData.min_count = $("#ipMinCount").data("slider").getValue();
		postData.alpha = $("#spAlpha").text();
		postData.epoch = $("#ipEpoch").data("slider").getValue();
		
		new ETService().setSuccessFunction(self.callSucceed).callService(self.path + "/save", postData);
	};
	
	/**
	 * 진행상태 확인 버튼 클릭 이벤트
	 */
	ctrl.btnCheckProccesClickHandler = function(e) {
		var self = et.vc;
		var postData = {};
		postData.type_list = ["ST020", "ST021", "ST022"];
		new ETService().setSuccessFunction(self.getUserProcessCallSucceed).callService(self.path + "/process", postData);
	};
	
	// ============================== 공통 함수 ==============================
	/**
	 * et 프레임워크를 사용하지 않는 ajax 요청 실패 콜백함수
	 */
//	ctrl.ajaxErrorCallback = function(xhr, ajaxOptions, thrownError) {   // 공통함수로 대체해놓음
//		var self = et.vc;
//		
////		self.formEnabled(false);
////		self.toggleControlles(true);
//		
//		if (xhr.status == 500) {
//			location.href = getContextPath()+"/open500Error";
//		} else if (xhr.status == 404) {
//			location.href = getContextPath()+"/open404Error";
//		} else if (xhr.status == 400) {
//			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", xhr.responseJSON.msg);
//		}
//	};
	return ctrl;
}));
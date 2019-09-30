/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : dongsuk.kwak
 * @CreateDate : 2019. 06. 13.
 * @DESC : [분석가웹] 학습 - 검색학습_검색학습
 ******************************************************************************/

(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vc || et.vc.name !== "evaluation") {
			et.vc = ctrl(et);
		}
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "evaluation";
	ctrl.path = "/analyzer/classifier/evaluation";
	
	ctrl.table_object = {};
	
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 * 
	 */
	ctrl.init = function(initData) {
		var self = et.vc;

		// set View
		self.setView(initData);
		self.setDragAndDrop();
		$("#algReal").hide();	
		// set form's action and validation
		
		// set Event
		$("#selDate").change(self.selectTrainDateChangeHandler);
		$("#selTrain").change(self.selectTrainLabelChangeHandler);
		$("#btnCheckProcess").on("click", self.btnCheckProccesClickHandler);
		$("#btnSubmit").on("click", self.btnSubmitClickHandler);
		
		if (initData.testset_cd) {
			$("#selTestset option").each(function () {
				var testset_cd = $(this).val();
				if (testset_cd === initData.testset_cd) {
					$(this).prop("selected", true);
				} else {
					$(this).prop("selected", false);
				}
			});
			$("#selTestset").trigger("change");
			delete initData.testset_cd;
		}
	};
	
	
	// ============================== 동작 컨트롤 ==============================
	/**
	 * set view
	 */
	ctrl.setView = function(initData) {
		var self = et.vc;
		
		$(".select2").select2();
		
		// 테스트셋 정보 select 생성
		et.makeSelectOption(initData.testset, {value: "testset_cd", text: "origin_file", data: "headers"}, "#selTestset", "--테스트셋을 선택하세요--");
		$("#selTestset option:eq(0)").prop("selected", true);
		$("#selTestset").trigger("change");
		$('#selTestset').on("change", self.selectTestset_changeHandler);
		
		// 학습 날짜 select 생성
		et.makeSelectOption(initData.dateList, {value:"date", text:"date"}, "#selDate", "--날짜를 선택하세요--");
	};
	
	/**
	 * 날짜 변경에 따른  분류모형 학습 파일명 조회
	 */
	ctrl.getTrainList = function() {
		var self = et.vc;
		var postData = {};
		var date = $("#selDate option:selected").val();
		if (date != " ") {
			postData.date = date;
			
		}	
		new ETService().setSuccessFunction(self.getTrainListCallSucceed).callService(self.path + "/getTrainList", postData);
	};
	
	/**
	 * 학습 정보 변경 시 호출. 학습 정보 및 알고리즘 목록 조회
	 */
	ctrl.getTrainInfo = function(postData) {
		var self = et.vc;
		var param = postData || {};
		var train = $("#selTrain option:selected").val();
		if(train && train.trim()){
			param.train_cd = train;
			$("#algReal").show();
			$("#algFake").hide();
		}else{
			$("#algReal").hide();
			$("#algFake").show();
		}
		new ETService().setSuccessFunction(self.getTrainInfoCallSucceed).callService(self.path + "/getTrainInfo", param);
	};
	
	/**
	 * 파일 변경에 따른 파일에 해당하는 알고리즘 조회
	 */
	ctrl.getAlgList = function() {
		var self = et.vc;
		var postData = {}
		var train = $("#selTrain option:selected").val();
		if(train != undefined && train != " "){
			postData.train_cd = train;
		}
		new ETService().setSuccessFunction(self.getAlgorithmCallSucceed).callService(self.path + "/getAlgList", postData);
	};
	
	// ============================== 동작 컨트롤 : 외부 등록 ==============================
	/**
	 * 그리드가 그려지기 전엔 Search를 못하도록 변경
	 * 이후 로딩바 추가 
	 */
	ctrl.formEnabled = function (b) {
		var self = et.vc;
		
		if (!b) {
			$("#divDataLoading").hide();
			$("input").removeClass("disable");
			$(".roc-container").removeClass("disable");
		} else {
			$("#divDataLoading").show();
			$("input").addClass("disable");
			$(".roc-container").addClass("disable");
		}
	};
	
	/**
	 * 화면 컨트롤 비활성화 / 활성화 수행
	 * 
	 * @param {boolean} isAble true면 활성화.
	 */
	ctrl.toggleControlles = function(isAble) {
		var self = this;
//		et.toggleFormElements(self.formId, isAble);
		
		// 수정, 삭제 버튼은 row 선택할때만 활성화
		//et.toggleElement("#btnDel", false);
	};
	
	/**
	 * 드래그앤드롭 생성
	 */
	ctrl.setDragAndDrop = function () {
		var self = et.vc;
		
		$('#file_drop').dropzone({
		    url: getContextPath() + self.path + '/saveTestset', // 드롭다운 시 업로드 되는 URL
		    method: "post",
		    paramName: "file",
		    init: function() {
		      this.on('success', function(file, res) {
		    	  
		          // 파일이 서버에 업로드가 완료 되었을때
		          if(res.result=='success'){
		              //만약에 response result 가 OK 라면
		        	  new ETService().callView(self.path, {testset_cd: res.msg});
		          } else {
		              // 만약에 OK 가 아니라면???
		              $("#file_drop").show();
		          }
		      });
		       
		      this.on('addedfile', function(file) {
		          $("#file_drop").hide();
		      });
		       
		      this.on('drop', function(file) {
		          // 파일이 드롭되면Upload Progress 나와줘야 된다.
		          $("#file_drop").hide();
		      });
		    }
		  });
	};
	
	/**
	 * ROC Curve 이미지 출력
	 */
	ctrl.showEvaluationData = function(returnData) {
		var self = et.vc;
		// All div display none
		$('.roc-container').prop('style', 'display: none');
		
		// Make Table Header
		var thead = [
			'<th>Top_1</th>',
			'<th>Top_2</th>',
		];
		var headers = [
			{className: "txtCenter col_visible", data: "Top_1", name: "Top_1"},
			{className: "txtCenter col_visible", data: "Top_2", name: "Top_2"},
		];
		if (returnData.target) {
			headers.push({className: "txtCenter col_visible", data: returnData.target, name: "Target"});
			thead.push('<th>Target</th>');
			returnData.tab_header.splice(returnData.tab_header.indexOf(returnData.target), 1);
		}
		for (var head of returnData.tab_header) {
			thead.push('<th>'+head+'</th>');
			headers.push({className: "txtCenter col_visible", data: head, name: head});
		}
//		for (var head of headers) {
//			'<li><label class="ecoleCheck"><input type="checkbox" value="' + idx + '" checked data-header="'+headers[idx]+'" data-name="'+headers[idx]+'" ><i></i>' + headers[idx] + '</label></li>';
//		}
		var theadHtml = thead.join('');
		
		var plot = returnData.data;
		if (plot) {
			for (var alg in plot) {
				// Draw scatter plot
				if (plot[alg].data) {
					var divPlotID = $('div.roc-img').filter('.'+alg).attr('id');
					var plotInfo = plot[alg];
					$('#'+divPlotID).html('');
					Plotly.newPlot(divPlotID, plotInfo.data, plotInfo.layout);
					$('div.roc-container').filter('.'+alg).prop('style', 'display: block');
				}
				
				// Draw Table
				var rows = [];
				for (var idx in returnData.tab_data) {
					var row = returnData.tab_data[i];
					row['Top_1'] = plot[alg]['Top_1'][i];
					row['Top_2'] = plot[alg]['Top_2'][i];
					rows.push(row);
				}
				var tabID = $('table.roc-tab').filter('.'+alg).attr('id');
				$('#'+tabID+' thead tr:eq(0)').html(theadHtml);
				var getOption = et.getDataTableOption();
				getOption.language = {
						
							info:           "검색결과 _TOTAL_건 중, _START_ ~ _END_ 건",
						    infoEmpty:      "검색결과 0건 중, 0 ~ 0 건",
						    infoFiltered:   "(전체결과: 총 _MAX_건)",
							emptyTable : "데이터가 없습니다.",
							zeroRecords:    "일치하는 데이터가 없습니다.",
							loadingRecords : "로딩중...",
							processing : "처리중...",
							paginate: {
								first : "<<",
						        last : ">>",
					        	previous: "<",
						    	next: ">"
							}
						
				};
				getOption.aaData = rows;
				getOption.aoColumns = headers;
				getOption.bFilter = false;
				getOption.bInfo = true;
				getOption.ordering = true;
				getOption.columnDefs = null;
				getOption.processing = false;
				getOption.info = false;
				// 데이터 테이블 생성
				self.table_object[alg] = $('#'+tabID).dataTable(getOption
//						{
//					"destroy": true,
//					"aaData": rows,
//					"aoColumns": headers,
//					"lengthChange": false, // 노출 시킬 로우 갯수 변경: 사용 안 함. 
//					"bFilter": false, // 상단 검색: 사용 안 함.
//					"bInfo": true, // 하단 데이터 결과 출력
//					"ordering": true, //헤더 쏘팅
//					"paging": true,
//					"searching":true,
//					"select":true,
//					"pageLength": 10,
//					"orderCellsTop": true,
//			        "fixedHeader": true,
//			        "pagingType": "full_numbers_no_ellipses", // 플러그인 연동으로 추후 수정?
//					"language": {
//						"info":           "검색결과 _TOTAL_건 중, _START_ ~ _END_ 건",
//					    "infoEmpty":      "검색결과 0건 중, 0 ~ 0 건",
//					    "infoFiltered":   "(전체결과: 총 _MAX_건)",
//						"emptyTable" : "데이터가 없습니다.",
//						"zeroRecords":    "일치하는 데이터가 없습니다.",
//						"loadingRecords" : "로딩중...",
//						"processing" : "처리중...",
//						"paginate": {
//							"first" : "<<",
//					        "last" : ">>",
//				        	"previous": "<",
//					    	 "next": ">"
//						}
//					},
//				}
				);
				
				// 헤더 필터 생성
				$('#'+tabID+' thead').append('<tr></tr>');
				$('#'+tabID+' thead tr:eq(1)').html(theadHtml);
				$('#'+tabID+' thead tr:eq(1) th').each( function (idx, item) {
			        var title = $(this).text();
			        $(this).html( '<input type="text" placeholder="'+title+'" class="column_search" data-idx='+idx+' data-alg="'+alg+'" />' );
			    } );
				$('#'+tabID+' thead tr:eq(1)').hide();
				
				// 컬럼 필터 버튼 이벤트
				$('.btnColFilter').filter('.'+alg).on('click', function() {
					var target_filter = 'table.' + $(this).data('algo') + ' thead tr:eq(1)';
					if ($(target_filter).prop('style').display === 'none') {
						$(target_filter).show();
					} else {
						$(target_filter).hide();
					}
				});
				// 컬럼 필터 검색 이벤트 등록
				$( '#'+tabID+' thead' ).on( 'keyup', ".column_search", function () {
					/*
					 	* fnFilter arguments
	 					1.{string}: String to filter the table on
						2.{int|null}: Column to limit filtering to
						3.{bool} [default=false]: Treat as regular expression or not
						4.{bool} [default=true]: Perform smart filtering or not
						5.{bool} [default=true]: Show the input global filter in it's input box(es)
						6.{bool} [default=true]: Do case-insensitive matching (true) or not (false) 
					 */
			        self.table_object[$(this).data('alg')]
			        	.fnFilter( this.value, $(this).data('idx'), false, true, false, true );
			    });
			}
		}
		
		$('#divMultiResult').prop('style', 'display: block');
		
		self.formEnabled(false);
		self.toggleControlles(true);
	};
	
	/**
	 * 날짜 변경에 따른 분류모형 학습 파일명 조회 결과
	 */
	ctrl.getTrainListCallSucceed = function(result) {
		var self = et.vc;

		et.makeSelectOption(result, {value:"train_cd", text:"train_label"}, "#selTrain", "--학습결과를 선택하세요--");
		$("#selTrain").trigger("change");
	};
	
	/**
	 * 학습정보 및 알고리즘 목록 조회 콜백 메서드
	 */
	ctrl.getTrainInfoCallSucceed = function(result){
		var self = et.vc;
		var algorithms = result.algorithms;
		et.makeSelectOption(algorithms, {value:"code_cd", text:"code_name"}, "#selAlg","");
		
		$.each(algorithms, function(index, item) {
			$("#selAlg option[value='"+item.code_cd+"']").attr("selected", "selected");
		});
		$("#selAlg").trigger("change");
		
		var trainInfo = result.trainInfo;
		if (trainInfo) {
			$('#txtTrainDate').text(trainInfo.create_date);
			$('#txtTrainLabel').text(trainInfo.train_label);
			$('#txtTrainInputs').text(trainInfo.tag_names);
			$('#txtTags').text(trainInfo.tag_names);
			self.setSelectionIndicatorVisiblity('ts');
		} else {
			$("#txtTags").text(""); // 기본값 선택시에 txtTags값을 노출하지 않기위해서.
			self.setSelectionIndicatorVisiblity('none');
		}
	};
	
	/**
	 * 파일 변경에 따른 파일에 해당하는 알고리즘 조회 및 선택.
	 */
	ctrl.getAlgorithmCallSucceed = function(result){
		var self = et.vc;
		et.makeSelectOption(result, {value:"code_cd", text:"code_name"}, "#selAlg","");
		
		$.each(result, function(index, item) {
			$("#selAlg option[value='"+item.code_cd+"']").attr("selected", "selected");
		});
		$("#selAlg").trigger("change");
		
	};

	/**
	 * 학습된 분류모형 평가 시작 요청
	 */
	ctrl.requestEvaluationStart = function(postData) {
		
		var self = et.vc;
		
		self.formEnabled(true);
		self.toggleControlles(false);
		debugger;
		$.ajax({
			url: ETCONST.API_ROOT_URL + '/aesthetic/api/eval_cls',
			data: postData,
			type: "post",
			dataType: "JSON",
			accept: 'application/json',
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			crossOrigin: true,
			
			error: self.ajaxErrorCallback,
			success: function(returnData) {
				if (returnData.result === ETCONST.SUCCESS) {
					et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "분류모형 성능 평가가 시작되었습니다.");
					self.showEvaluationData(returnData);
				} else {
					self.formEnabled(false);
					self.toggleControlles(true);
					et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "분류모형 성능 평가 시작에 실패했습니다. 다시 시도해 주세요.");
				}
			},
		});
	};
// ============================== 이벤트 리스너 ==============================
	/**
	 * 테스트셋 정보 / 왼 쪽 설정 입력 메시지 출력
	 * 
	 * @param cls - {none | ts} none: 좌측 설정 입력 요구 메시지 출력, ts: 테스트셋 정보 출력
	 */
	ctrl.setSelectionIndicatorVisiblity = function(cls) {
		var visible = cls;
		var invisible = cls === 'none' ? 'ts' : 'none';
		
		$('.selectionIndicator.'+visible).prop('style', 'display: block');
		$('.selectionIndicator.'+invisible).prop('style', 'display: none');
	};
	
	/**
	 * 날짜 변경시
	 */
	ctrl.selectTrainDateChangeHandler = function(e) {
		var self = et.vc;
		var id = e.currentTarget.id;
		var trainCD = $("#selTrain").val();
		if (id == "selDate") {
//			$("#spDate").text($("#selDate option:selected").text());
			$("#selTrain").empty();
			$("#selTrain").prop("disabled",false);
			self.getTrainList();
			if($("#selDate").val() ==''){
				$("#selTrain").prop("disabled",true);
			}
		} 
		self.getTrainInfo();
	};
	
	
	ctrl.selectTrainLabelChangeHandler = function(e){
		var self = et.vc;
		var id = e.currentTarget.id;
		var trainCD = $("#selTrain").val();
		if (id == "selTrain" && trainCD != undefined) {
			$("#selAlg").empty();
		}
		self.getTrainInfo();
	};
	
	/**
	 * 테스트셋 변경 이벤트 핸들러
	 */
	ctrl.selectTestset_changeHandler = function(e) {
		var self = et.vc;
		
		if ($(this).val()) {
			var headers = [];
			var headerSplitted = $('#selTestset option:selected').data('headers').split(',');
			for (var idx in headerSplitted) {
				headers.push({name: headerSplitted[idx].trim()});
			}
			
			et.makeSelectOption(headers, {value: "name", text: "name"}, "#selTestsetInputs", "");
			et.makeSelectOption(headers, {value: "name", text: "name"}, "#selTestsetTarget", " ");
			$.each(headers, function(index, item) {
				$("#selTestsetInputs option[value='"+item.name+"']").attr("selected", "selected");
			});
			$("#selTestsetInputs").select2();
			
			$("#divTestsetInfo").prop('style', 'display: block');
			$(".testset-headers").prop('disabled', false);
			$('#txtTestset').text($('#selTestset option:selected').text());
			
		} else {
			$('#txtTestset').text("테스트셋을 선택해주세요.");
			$(".testset-headers").select2("val", "");
			$(".testset-headers option").each(function() {
				$(this).remove();
			});
			
			$("#divTestsetInfo").prop('style', 'display: none');
			$(".testset-headers").prop('disabled', true);
		}
	};
	
	
	/**
	 * 실행 버튼 클릭 시 수행
	 * 분류모형 성능 평가 요청
	 */
	ctrl.btnSubmitClickHandler = function() {
		var self = et.vc;
		// 유효성 검사
		var isValid = false;
		
		// 학습 정보 유효성 검사
		var train_cd = $('#selTrain option:selected').val();
		isValid = (train_cd && train_cd.trim().length > 0) === true; 
		self.showErrorMsg('#setTrain', 'train_cd', '학습 정보를 선택해주세요.', isValid);
		if (!isValid) return;
		
		// 분류모형 알고리즘 유효성 검사
		var algorithms = $('#selAlg option:selected');
		isValid = (algorithms && algorithms.length > 0) === true; 
		self.showErrorMsg('#selAlg', 'algorithms', '분류모형을 한 개 이상 선택해주세요.', isValid);
		if (!isValid) return;
		
		// 테스트셋 정보 유효성 검사
		var testset_cd = $('#selTestset option:selected').val();
		isValid = (testset_cd && testset_cd.trim().length > 0) === true; 
		self.showErrorMsg('#selTestset', 'testset_cd', '테스트셋 정보를 선택해주세요.', isValid);
		if (!isValid) return;
		
		// 분류모형 알고리즘 유효성 검사
		var testset_inputs = $('#selTestsetInputs option:selected');
		isValid = (testset_inputs && testset_inputs.length > 0) === true; 
		self.showErrorMsg('#selTestsetInputs', 'testset_inputs', 'input 변수를 한 개 이상 선택해주세요.', isValid);
		if (!isValid) return;
		
		
		var algo = [];
		algorithms.each(function() {
			algo.push($(this).val());
		});
		
		var inputs = [];
		testset_inputs.each(function() {
			inputs.push($(this).val());
		});
		var postData = {
				"host_url"		: window.location.href.split(getContextPath())[0],
				"train_cd"		: train_cd,
				"testset_cd"	: testset_cd,
				"inputs"		: inputs.join(','),
				"classifiers"	: algo.join(','),
			};
		var target = $("#selTestsetTarget option:selected").val();
		if (target) postData.target = target;
		
		self.requestEvaluationStart(postData);
	};

	
	// ============================== 공통 함수 ==============================
	/**
	 * et 프레임워크를 사용하지 않는 ajax 요청 실패 콜백함수
	 */
	ctrl.ajaxErrorCallback = function(xhr, ajaxOptions, thrownError) {
		var self = et.vc;
		debugger
		self.formEnabled(false);
		self.toggleControlles(true);
		var statusOfEval = xhr.status;
		if (xhr.status == 500) {
			location.href = getContextPath()+"/open500Error";
		} else if (xhr.status == 404) {
			location.href = getContextPath()+"/open404Error";
		} else if (xhr.status == 400) {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", xhr.responseJSON.msg);
		}
	};

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
/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : mk jang
 * @CreateDate : 2019. 06. 12.
 * @DESC : [분석가웹] 학습 - 검색학습_데이터 확인
 ******************************************************************************/

(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vc || et.vc.name !== "dataLoad") {
			et.vc = ctrl(et);
		}
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "dataLoad";
	ctrl.path = "/analyzer/train/dataLoad";
	ctrl.dataTables = null;
	ctrl.initData = {};
	ctrl.dataTablesInit = true;
	
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 * 
	 */
	ctrl.init = function(initData) {
		debugger;
		var self = et.vc;
		self.initData = initData;
		$('.select2').select2();
		
		et.makeSelectOption(initData.dataSetMetaList, {value:"dataset_cd", text:"combobox_label"}, "#selDataSetMeta", "문서 전체");
		et.makeSelectOption(initData.dataSetVariableList, {value:"header_cd", text:"combobox_label"}, "#selDataSetVariables");
		et.makeSelectOption(initData.dataSetVariableList, {value:"header_cd", text:"combobox_label"}, "#selDataSetTarget", "사용 안함");
		
		//  초기 input  변수 조건을 모두 선택 하는 식으로 변경
		self.initView();
		
		// set View
		self.setDragAndDrop();
		// set form's action and validation
		
		// set Event
		$("#btnSubmit").on("click", self.btnSubmitClickHandler);
		$("#selDataSetMeta").change(self.selDataSetMetaChangeHandler);
		$("#selDataSetVariables").change(self.selDataSetVariablesChangeHandler);
		$("#selDataSetTarget").change(self.selDataSetTargetChangeHandler);
		$("#fileCSV").change(self.fileChangeHandler);
		/*$("#divDragAndDrop").on("drag", self.fileChangeHandler);
		$("#divDragAndDrop").on("click", function(e) {$("#fileCSV").trigger("click")});*/
		
		// 초기 리스트 데이터 가져오기
		if (initData.dataset_cd) {
			$("#selDataSetMeta").val(initData.dataset_cd).trigger("change");
			delete initData.dataset_cd;
		} else {
			self.callDataTablesList();
		}
	};
	
	
	// ============================== 동작 컨트롤 ==============================
	/**
	 * 데이터 테이블을 동적으로 만들어 준다
	 * @param data
	 */
	ctrl.createDataTables = function (data) {
		var self = et.vc;

		// 만약 이전에 만들었던 테이블이 있으면 삭제
		if(self.dataTables != undefined) {
			self.dataTables.clear();
			self.dataTables.destroy();
			$('#tbList thead tr').remove();
		}
		
		// 헤더를 만들어 준다
		var gridTitles = data.title;
		if (!(gridTitles && gridTitles.length > 0)) {
			gridTitles = [{header_cd: 'temp', header_name: '사용 가능한 컬럼이 없습니다.'}];
		}
		var columns = gridTitles.map(function (obj) {
			return {
				title: obj.header_name,
				data: obj.header_cd,
				className: "thMW100",
				defaultContent: '',
			};
		});

		
		var dataSet = data.data;
		self.dataTablesInit = true;
		var tableOptions = et.getDataTableOption();
		tableOptions.data= dataSet;
		tableOptions.columns = columns;
		tableOptions.responsive = true;
		tableOptions.colReorder = true;
		self.dataTables = $('#tbList').DataTable(tableOptions);
//		self.dataTables = $('#tbList').DataTable(
//				{
//			lengthChange: false, // 노출 시킬 로우 갯수 변경: 사용 안 함. 
////			bFilter: false, // 상단 검색: 사용 안 함.
////			bInfo: false, // 하단 데이터 결과 출력: 사용 안 함.
////			sort: false, //헤더 쏘팅 안씀
//			paging: true,
//			pageLength: 10,
//			pagingType: "full_numbers_no_ellipses",
//			destroy: true,
//			processing: true,
//			info: true,
//			searching: true,
//			select:true,
//			ordering: false,
//			orderCellsTop: true,
//	        fixedHeader: true,
//			language: ETCONST.DATATABLE_LANG,
//			columns : columns,
//			data : dataSet,
//			columnDefs: [{
//				targets: '_all',
//				render: $.fn.dataTable.render.ellipsis(ETCONST.DATATABLE_CONTENT_MAX_LENGTH)
//			}],
//			responsive: true,
//			colReorder: true,
////			dom: "Bfrtip", // https://datatables.net/reference/option/dom
////			buttons: [{
////				extend: 'csvHtml5',
////				text: '데이터 다운로드',
////				title: et.getSimpleFormatDate(new Date())+'_Document',
////				download: 'open',
////				orientation:'landscape',
////				exportOptions: {
////					columns: ':visible',
//////					filter: ':applied',
////				},
////			}],
//		}
//				);
		
		
		/*
		 * 이후 추가 
		 * 다 그려지면 헤더에 필터를 넣어야 함
		 *drawCallback : function( settings ) {
				var self = et.vc;
				if (self.dataTablesInit) {
					$('#tbList thead tr').clone(true).appendTo( '#tbList thead' );
					$('#tbList thead tr:eq(1) th').each( function (i) {
				        var title = $(this).text();
				        $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
				 
				        $( 'input', this ).on( 'keyup change', function () {
				        	
				        	var self = et.vc;
				            if ( self.dataTables.column(i).search() !== this.value ) {
				            	self.dataTables
				                    .column(i)
				                    .search( this.value )
				                    .draw();
				            }
				        } );
				    } );
				}
				self.dataTablesInit = false;
			} 
		 */
	};
	
	
	
	// ============================== 동작 컨트롤 : 외부 등록 ==============================
	/**
	 * 초기 Input 변수 SelectBox 를 전체 선택 해준다 
	 */
	ctrl.initView = function () {
		var self = et.vc;
		$.each(self.initData.dataSetVariableList, function(index, item) {
			$("#selDataSetVariables option[value='"+item.header_cd+"']").attr("selected", "selected");
		});
		$("#selDataSetVariables").trigger("change");
		
		$("#selDataSetMeta option:eq(0)").attr("selected", "selected");
		$("#selDataSetMeta").trigger("change");
		
		$("#selDataSetTarget option:eq(0)").attr("selected", "selected");
		$("#selDataSetTarget").trigger("change");
	};
	
	/**
	 * 드래그앤드롭 생성
	 */
	ctrl.setDragAndDrop = function () {
		var self = et.vc;
		
		$('#file_drop').dropzone({
		    url: getContextPath() + self.path + '/upload', // 드롭다운 시 업로드 되는 URL
		    method: "post",
		    paramName: "file",
		    init: function() {
		      
		      this.on('success', function(file, res) {
		    	  
		          // 파일이 서버에 업로드가 완료 되었을때
		          if(res.result=='success'){
		              //만약에 response result 가 OK 라면
		        	  new ETService().callView(self.path, {dataset_cd: res.msg});
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
	}
	
	/**
	 * 그리드가 그려지기 전엔 Search를 못하도록 변경
	 * 이후 로딩바 추가 
	 */
	ctrl.formEnabled = function (b) {
		var self = et.vc;
		
		if (!b) {
			$("#divDataLoading").hide();
			$("#selDataSetMeta").removeClass("disable");
			$("#selDataSetVariables").removeClass("disable");
			$("#selDataSetTarget").removeClass("disable");
		} else {
			$("#divDataLoading").show();
			$("#selDataSetMeta").addClass("disable");
			$("#selDataSetVariables").addClass("disable");
			$("#selDataSetTarget").addClass("disable");
		}
	}

	// ============================== 이벤트 리스너 ==============================
	/**
	 * 
	 */
	ctrl.btnSubmitClickHandler = function(e) {
		var self = et.vc;
		
		var isValid = false;
		// 유효성 검사
		var inputs = $('#selDataSetVariables option:selected');
		isValid = (inputs && inputs.length > 0) === true; 
		self.showErrorMsg('#selDataSetVariables', 'variable_header_cd', 'input 변수를 한 개 이상 선택해주세요.', isValid);
		if (!isValid) return;
		
		var postData = {};
		postData.variable_headers = $("#selDataSetVariables").val();
		if ($("#selDataSetTarget").val()) postData.target_header_cd = $("#selDataSetTarget").val();
		if ($("#iptDatasetLabel").val()) postData.dataset_label = $("#iptDatasetLabel").val();
		debugger;
		new ETService().setSuccessFunction(self.callSucceed).callService(self.path + "/save", postData);	
	};
	
	ctrl.callSucceed = function(returnData) {
		if (returnData.result === 'success') {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "데이터셋이 생성되었습니다.");
		} else {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "데이터셋 생성에 실패했습니다.");
		}
	};
	
	/**
	 * train 또는 문서 선택 selectbox 이벤트
	 * 이 이벤트에선 input 변수조건, target 변수조건을 가져오고 
	 * DataTable을 새로 그려준다
	 * param : event
	 */
	ctrl.selDataSetMetaChangeHandler = function (e) {
		debugger
		var self = et.vc;
		var initDataTemp = self.initData;
		if(self.dataTables != undefined) {
			self.dataTables.clear();
			self.dataTables.destroy();
			$('#tbList thead tr').remove();
			self.dataTables = null;
		}
		
//		if($("#selDataSetMeta").val == ''){ //데이터셋 기본값을 선택시에 Input 변수랑 Target변수가 사라지기에 해결중
//			et.makeSelectOption(initDataTemp.dataSetVariableList, {value:"header_cd", text:"combobox_label"}, "#selDataSetVariables");
//			et.makeSelectOption(initDataTemp.dataSetVariableList, {value:"header_cd", text:"combobox_label"}, "#selDataSetTarget", "사용 안함");
//			self.initView();
//		}else{
		
		var postData = {};
		var datasetObj = $("#selDataSetMeta option:selected").data();
		var datasetCD = $("#selDataSetMeta").val();
		if (datasetCD != " ") {
			postData.dataset_cd = datasetCD;
			if (!!datasetObj.target_header_cd) {
				postData.target_header_cd = datasetObj.target_header_cd; 
			}
		}
//		}
		new ETService().setSuccessFunction(self.getDataSetVariablesCallSucceed).callService(self.path + "/getDataSetVariables", postData);
	};
	
	/**
	 * getDataSetVariables API 호출 완료 함수 
	 * 
	 */
	ctrl.getDataSetVariablesCallSucceed = function (result) {
		debugger
		var self = et.vc;
		var resultview = result;
		var initDataTemp = self.initData;
		if($("#selDataSetMeta").val()==''){
			
			et.makeSelectOption(initDataTemp.dataSetVariableList, {value:"header_cd", text:"combobox_label"}, "#selDataSetVariables");
			et.makeSelectOption(initDataTemp.dataSetVariableList, {value:"header_cd", text:"combobox_label"}, "#selDataSetTarget", "사용 안함");
			
			$.each(self.initData.dataSetVariableList, function(index, item) {
				$("#selDataSetVariables option[value='"+item.header_cd+"']").attr("selected", "selected");
			});
			$("#selDataSetVariables").trigger("change");
			
			
			$("#selDataSetTarget option:eq(0)").attr("selected", "selected");
			$("#selDataSetTarget").trigger("change");
			}else{
		
		// input 변수조건 selectbox를 초기화
		et.makeSelectOption(result.dataVariableList, {value:"header_cd", text:"combobox_label"}, "#selDataSetVariables");
		$.each(result.dataVariableList, function(index, item) {
			$("#selDataSetVariables option[value='"+item.header_cd+"']").attr("selected", "selected");
		});
		$("#selDataSetVariables").trigger("change");
		
		// target 변수 조건을 초기화
		var targetComboList = [];
		for (var targets of result.dataVariableList) {
			if (targets.header_cd != result.dataTarget)
				targetComboList.push(targets);
		}
		if (result.dataTarget) targetComboList.push(result.dataTarget);
		et.makeSelectOption(targetComboList, {value:"header_cd", text:"combobox_label"}, "#selDataSetTarget", "사용 안함");
		if (result.dataTarget != null) {
			$("#selDataSetTarget option[value='"+result.dataTarget.header_cd+"']").attr("selected", "selected");
		} else {
			$("#selDataSetTarget option:first").attr("selected", "selected");
		}
		$("#selDataSetTarget").trigger("change");
		
			}// end of else val ''
		
		// 모두 초기화 했으면 DataTable의 데이터를 가져온다 
		self.callDataTablesList();
	};
	
	/**
	 * input 변수조건 selectbox 이벤트 
	 * DataTable의 Header 정보를 Visible 처리
	 */
	ctrl.selDataSetVariablesChangeHandler = function (e) {
		var self = et.vc;
		self.dataTablesHeaderVisibleController();
	};
	/**
	 * target 변수조건 selectbox 이벤트 
	 * DataTable의 Header 정보를 Visible 처리
	 */
	ctrl.selDataSetTargetChangeHandler = function (e) {
		var self = et.vc;
		self.dataTablesHeaderVisibleController();
	};
	
	/**
	 * 드래그앤드롭 파일 변경 이벤트
	 */
	ctrl.fileChangeHandler = function (e) {
		var self = et.vc;
		var file = e.target.files || e.dataTransfer.files;
	};
	
	/**
	 * input 변수조건 selectbox 이벤트
	 * target 변수조건 selectbox 이벤트
	 * DataTable의 Header 정보를 Visible 처리
	 */
	ctrl.dataTablesHeaderVisibleController = function () {
		var self = et.vc;
		if (self.dataTables != null) {
			var headerLength = ctrl.dataTables.columns().header().length;
			
			// dataTable 이 있을경우에 모두 안보이게 처리 하고 
			// 후처리로 input 변수 조건 + target 변수 조건을 처리
			for (var i=0; i < headerLength; i++) {
				var column = ctrl.dataTables.column( i );
				column.visible( false );
			}
			
			var targetHeaderText = $("#selDataSetTarget option:checked").text();
			
			// 타겟 사용 안함 선택 시 컬럼 순서 리셋
			if (!$("#selDataSetTarget option:checked").val()) {
				// ctrl.dataTables.colReorder.reset();
			}
			
			for (var i=0; i < headerLength; i++) {
				var headerText = $(ctrl.dataTables.columns().header()[i]).text();
				var column = ctrl.dataTables.column( i );
				$("li > div").each(function() {
					var text = $(this).text();
					if (text == headerText) {
						column.visible( true );
						return;
					}
				});
				
				if (headerText == targetHeaderText) {
					column.visible( true );
					// 선택된 타겟 변수 컬럼을 제일 뒤로
					var reorder = [];
					for (var idx=0; idx < headerLength; idx++) {
						if (idx != i) reorder.push(idx);
					}
					reorder.push(i);
					ctrl.dataTables.colReorder.order(reorder);
					$("#tbList thead tr th").removeClass("target-col");
					$("#tbList thead tr th:last-child").addClass("target-col");
				}
			}
		}
	};
	
	/**
	 * getDataGridList API 호출
	 */
	ctrl.callDataTablesList = function () {
		var self = et.vc;
		self.formEnabled(true);
		var postData = {};
		var datasetCD = $("#selDataSetMeta").val();
		if (datasetCD != " " && datasetCD != "") {
			postData.dataset_cd = datasetCD;
//			postData.h_delete_yn = 'N'; // 삭제된 헤더 배제
//			postData.h_use_yn = 'Y'; // 미사용 헤더 배제
			var targetCD = $("#selDataSetMeta option:selected").data();
			if (!!targetCD.target_header_cd) {
				postData.target_header_cd = targetCD.target_header_cd; 
			}
		}
		
		new ETService().setSuccessFunction(self.getDataGridListCallSucceed).callService(self.path + "/getDataGridList", postData);
	};
	
	/**
	 * getDataGridList API 호출 완료 함수
	 */
	ctrl.getDataGridListCallSucceed = function (result) {
		var self = et.vc;
		self.createDataTables(result);
		self.formEnabled(false);
	};
	
	// ============================== 공통 함수 ==============================
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
/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : Hyungseok Kim
 * @CreateDate : 2018. 10. 15.
 * @DESC : [어드민] 매니저 관리 목록 스크립트
 ******************************************************************************/
(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vc || et.vc.name !== "headerMgt") {
			et.vc = ctrl(et);
		}
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "headerMgt";
	ctrl.path = "/analyzer/header/header";
	
	ctrl.formId = "#formAddUser";
	ctrl.tableId = "#tbList";
	ctrl.initData = null;
	
	
	
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 */
	ctrl.init = function(initData) {
		var self = this;
		
		self.initData = initData;
		
		self.setValidate();
		
		
		et.makeSelectOption(initData.codeList, {value:"code_cd", text:"code_value"}, "#selSearchDtypeC", "전체");
		et.makeSelectOption(initData.codeList, {value:"code_cd", text:"code_value"}, "#selDType");
		
		
		//self.setValidate();
		//self.createDatatable();
		
		// set Event
		$("#btnAdd").on("click", self.btnAdd_clickEventListner);
		$("#btnDel").on("click", self.btnDelete_clickEventListner);
		$("#btnEdit").on("click", self.btnEdit_clickEventListner);
		$("#btnSearch").on("click", self.btnSearch_clickEventListner);
		$("#btnSearch").trigger("click");
		et.setDataTableRowSelection(self.tableId, self.tbListRowSelect);
	};
	
	/**
	 * 화면 컨트롤 비활성화 / 활성화 수행
	 * 
	 * @param {boolean} isAble true면 활성화.
	 */
	ctrl.toggleControlles = function(isAble) {
		var self = this;
		et.toggleFormElements(self.formId, isAble);
	};
	
	/**
	 * 데이터테이블 생성
	 * 
	 * @param params 검색 조건
	 */
	ctrl.createDatatable = function(postData) {
		var self = this;
		var params = postData || {};
		var columns = [
			{
				data : "header_name",
			},{
				data : "dtype_name",
			},{
				data : "use_yn_name",
			},{
				className : "txtCenter",
				data : "update_date",
			},{
    			data : "header_cd",
    			width : "100px",
    			className : "txtCenter",
    			render : function(data, type, full, meta) {
    				var str = '<a class="btn btn-xs btn-primary" name="'+data+'">컬럼 정보 수정</a>';
    				return str;
    			}
    		}
		];
		
		//self.toggleControlles(false);
		var table = et.createDataTableSettings(columns, self.path + "/search", params, self.dataTableDrawCallback);
		table.pageLength = 15,
		table.pagingType =  "full_numbers_no_ellipses",
		table.info = true;
		table.language = ETCONST.DATATABLE_LANG;
		$(self.tableId).DataTable(table);
	};
	
	// ============================== 동작 컨트롤 ==============================
	/**
	 * 검색 폼에 validator 세팅
	 */
	ctrl.setValidate = function() {
		var self = this;
		var validator, name;
		// set $.validator
		
		validator = new ETValidate(self.formId).setSubmitHandler(self.submit).setErrorPlacement(et.setErrorPlacementFindClass);
		
		name = "header_name";
		validator.setType(name, validator.TYPE_REQUIRED_TEXT, "필수 입력 항목입니다.");
		
		validator.apply();
	};
	
	/**
	 * 테이블 row 선택시, 상세화면으로 이동
	 * 
	 * @param {jQuery} $target 클릭한 대상
	 * @param {} row 행 인덱스
	 * @param {} col 열 인덱스
	 */
	ctrl.tbListRowSelect = function($target, row, col) {
		var self = et.vc;
		var rowData = et.getRowData(self.tableId, $target.closest("tr"));
		if ($($target[0]).is("a")) {
			$("#iptEditCd").val(rowData.header_cd);
			$("#iptHeaderName").val(rowData.header_name);
			$("#selDType").val(rowData.dtype);
			$("#selUseYn").val(rowData.use_yn);
			//$('#popModify').modal('show');
			$('#popModify').show();
			return;
		}
	};
	
	/**
	 * 헤더 정보 변경 클릭시 
	 * 
	 * @param {event} e 
	 */
	ctrl.btnEdit_clickEventListner = function(e) {
		var self = et.vc;
		$(self.formId).submit();
	};
	
	/**
	 * 헤더 정보 검색 
	 * 
	 * @param {event} e 
	 */
	ctrl.btnSearch_clickEventListner = function(e) {
		var self = et.vc;
		var postData = {};
		
		var headerText = $("#iptSearchHeaderName").val();
		var dType = $("#selSearchDtypeC").val() == undefined ? " " : $("#selSearchDtypeC").val();
		var useYn = $("#selSearchUseYN").val()  == undefined ? " " : $("#selSearchUseYN").val() ;
		
		postData.header_name = headerText;
		postData.dtype = dType == " " ? null : dType;
		postData.use_yn = useYn == " " ? null : useYn;
		
		self.createDatatable(postData);
	};
	
	

	
	// ============================== 리스너 =================================
	/**
	 * $.validator 에서 submit 발생시 동작
	 */
	ctrl.submit = function(form) {
		var self = et.vc;
		var postData = ETValidate.convertFormToObject(form, true, true);
		new ETService().setSuccessFunction(self.headerChangeCallSucceed).callService(self.path + "/modify", postData);
	};
	
	/**
	 *  컬럼 정보 수정
	 */
	ctrl.headerChangeCallSucceed = function (returnData ) {
		var self = et.vc;
		if (returnData.result === ETCONST.SUCCESS) {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "수정되었습니다.");
			$("#btnSearch").trigger("click");
			$('#popModify').hide();
			//$('#popModify').modal('hide');
		} else {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "수정에 실패했습니다. 다시 시도해 주세요.");
		}
	}
	

	//-------------------------------------------------------
	
	/**
	 * 데이터 테이블 출력 완료 후, 비활성화한 화면 컨트롤 활성화.
	 * 
	 * @param {} settings
	 */
	ctrl.dataTableDrawCallback = function(settings) {
		var self = et.vc;
		self.toggleControlles(true);
		$(".btnUpdate").on("click", self.btnUpdate_clickEventListner);
	};
	
	return ctrl;
}));
/*******************************************************************************
 * Copyright (c) 2017 Ecoletree. All Rights Reserved.
 * 
 * @Author : Hyungseok Kim
 * @CreateDate : 2018. 10. 15.
 * @DESC : [어드민] 매니저 관리 목록 스크립트
 ******************************************************************************/
(function(et, ctrl) {
	if (_.isObject(et) && et.name === ETCONST.PROJECT_NAME) {
		if (!et.vc || et.vc.name !== "documentMgt") {
			et.vc = ctrl(et);
		}
	} else {
		console.error("ecoletree OR ETCONST is not valid. please check that common.js file was imported.");
	}
}(this.ecoletree, function(et) {
	
	"use strict";
	
	var ctrl = {};
	
	ctrl.name = "documentMgt";
	ctrl.path = "/analyzer/management";
	
	ctrl.formId = "#formAddFile";
	ctrl.tableId = "#tbList";
	
	ctrl.$table;
	
	ctrl.allHeaders;
	ctrl.userHeaders;
	ctrl.exposureHeaders;
	
	ctrl.searchPostData;
	
	// ============================== 화면 컨트롤 ==============================
	/**
	 * init VIEW
	 */
	ctrl.init = function(initData) {
		var self = this;
		
		if (!!initData) {
			self.allHeaders = initData.headers || [];
			self.userHeaders = initData.userHeaders || undefined;
		}
		self.exposureHeaders = self.userHeaders == undefined ? self.allHeaders.slice() : self.userHeaders.slice();

		// set View
		self.setValidate();
		$(".select2").select2();
		self.setSearchKey(self.allHeaders);
		self.createHeaderOptions(self.exposureHeaders);
		self.createDatatable(null, self.exposureHeaders);
		
		// set Event
		$("#selSearchKey").on("change", self.selectChangeListener);
		$("#btnAddModal").on("click", self.btnAddModal_clickEventListner);
		$("#btnSearch").on("click", self.btnSearch_clickEventListner);
		$("#btnDownloadCsv").on("click", self.btnDownloadCsv_clickEventListner);
		$("#btnUploadFile").on("click", function(){$(self.formId).submit();});
		
		$("#fileCSV").on("change", function(){
			var filename = "";
			if(window.FileReader){ 
				// modern browser
				if ($(this)[0].files != null && $(this)[0].files != undefined && 0 < $(this)[0].files.length) {
					filename = $(this)[0].files[0].name; 
				}
			} else { // old IE
				if ($(this).val() != ""){
					filename = $(this).val().split('/').pop().split('\\').pop(); // 파일명만 추출 
				}
			} 
			
			$("#sourceFile").val(filename);
			
		});
		
		$(document).on("click", function(e) {
			var optionDiv = $("#bxOption1");
			if (e.target.id != 'btnHeaderOption' && !optionDiv.is(e.target) && optionDiv.has(e.target).length === 0) {
				$.each($("#bxOption1").attr('class').split(" "), function(idx, item) {
					if (item == "sel") {
						$("#btnHeaderOption").trigger("click");
					}
				});
			}
		});
		
//		et.setDataTableRowSelection(self.tableId, self.tbListRowSelect);
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
	 * 검색 조건 셀렉트에 옵션 추가
	 */
	ctrl.setSearchKey = function(headers) {
		var self = this;
		
		var options = '';
		for (var idx in headers) {
			options += '<option value="'+ headers[idx].header_cd +'">'+ headers[idx].header_name +'</option>'
		}
		
		$('#selSearchKey').html(options);
		
	};
	

	/**
	 * 컬럼 옵션에 헤더 정보 출력
	 */
	ctrl.createHeaderOptions = function(headers) {
		var self = this;
		
		var _headers = '';
		for (var idx in headers) {
			_headers += '<li><label class="ecoleCheck"><input type="checkbox" value="' + idx + '" checked data-header="'+headers[idx].header_cd+'" data-name="'+headers[idx].header_name+'" ><i></i>' + headers[idx].header_name + '</label></li>'
		}
		$('#ulHeaderOptions').html(_headers);	
		
		// 컬럼 보이기/숨기기 옵션 
		$('#ulHeaderOptions input:checkbox').change(function() {
			var col = self.$table.column($(this).val());
			col.visible($(this).is(':checked'));
			
			for (var idx in self.exposureHeaders) {
				if (self.exposureHeaders[idx].header_cd == $(this).data('header')) {
					delete self.exposureHeaders[idx];
				}
				
				// 노출 헤더(리스트)에 선택한 헤더 정보 추가
				else if (idx >= self.exposureHeaders.length) {
					for (var head of self.allHeaders) {
						if (head.header_cd == $(this).data('header'))
							self.exposureHeaders.push(head);
					}
				}
			}
//			if ($(this).is(':checked')) { } else { }
		});
		
		$('#btnHeaderOption').on('click', function() {
			if ($('#bxOption1').prop('class').split(' ').includes('sel')) {
				$('#bxOption1').prop('class', 'modalOption-dialog');
			} else {
				$('#bxOption1').prop('class', 'modalOption-dialog sel');
			}
		});
	};
	
	/**
	 * 데이터테이블 생성
	 * 
	 * @param params 검색 조건
	 */
	ctrl.createDatatable = function(postData, initHeaders) {
		var self = et.vc;
		var params = postData || {};
//		var initHeaders = self.userHeaders || self.allHeaders;
		var thead = '';
		var columns = [];
		if (!(initHeaders && initHeaders.length > 0))
			initHeaders = [{header_cd: 'temp', header_name: '사용 가능한 컬럼이 없습니다.'}];
		
		for (var idx in initHeaders) {
			thead += '<th style="max-width: 500px;">' + initHeaders[idx].header_name + '</th>';
			columns.push({
				className : "thMW100",
				data: initHeaders[idx].header_cd,
				defaultContent: '',
//				render: function(data, type, row) {
//					return data.length > 100 ? data.substring(0, 100) : data;
//				}
			})
		}
		
		$('#tbList thead tr').html(thead);
		
		var table = et.createDataTableSettings(columns, self.path + "/search", params, self.dataTableDrawCallback);
//		debugger;
		var sss = table;
		table.pagingType = "full_numbers_no_ellipses";
		table.ordering = false;
		table.processing = true;
		table.language = ETCONST.DATATABLE_LANG;
		table.dom = "lBfrtip";
		table.buttons = [{
			extend: 'csvHtml5',
			text: '데이터 다운로드',
			action: self.btnDownloadCsv_clickEventListner,
		}];
		table.columnDefs = [{
			targets: '_all',
			render: $.fn.dataTable.render.ellipsis(ETCONST.DATATABLE_CONTENT_MAX_LENGTH)
		}];
		table.preDrawCallback = function (setting) {
			if (self.$table != null) {
				$("#ulHeaderOptions input:checkbox").each(function() {
					var col = self.$table.column($(this).val());
					col.visible(false);
				});
			}
		};
		
		self.toggleControlles(false);
		self.$table = $(self.tableId).DataTable(table);
		
	};
	
	// ============================== 동작 컨트롤 ==============================
	/**
	 * 검색 폼에 validator 세팅
	 */
	ctrl.setValidate = function() {
		var self = this;
		var validator, name;
		// set $.validator
		validator = new ETValidate(self.formId).setSubmitHandler(self.csvFileUpload).setErrorPlacement(et.setErrorPlacementFindClass);
		
		name = "file";
		validator.setType(name, validator.TYPE_REQUIRED_TEXT, "필수 입력 항목입니다.");
		
		validator.apply();
	};
	
	/**
	 * 상세 화면으로 이동
	 * 
	 * @param {object} rowData 신규일 경우 null, 수정일 경우 선택된 행 데이터
	 */
	ctrl.moveDetail = function(rowData) {
		var self = this;
	};
	
	// ============================== 리스너 =================================
	/**
	 * $.validator 에서 submit 발생시 동작
	 */
	ctrl.submit = function(form) {
		var self = et.vc;
		var postData = ETValidate.convertFormToObject(form, true, true);
		
		var searchText = $("#iptSearchWord").val();
		if (searchText) {
			postData.search_text = searchText;
			postData.by_header_name = "Y";
		}

		self.createDatatable(postData);
	};
	
	/**
	 * 데이터 테이블 출력 완료 후, 비활성화한 화면 컨트롤 활성화.
	 * 
	 * @param {} settings
	 */
	ctrl.dataTableDrawCallback = function(settings) {
		var self = et.vc;
		
		$("#ulHeaderOptions input:checkbox").each(function() {
			var col = self.$table.column($(this).val());
			col.visible($(this).is(':checked'));
		});
		
		
		self.toggleControlles(true);
	};
	
	/**
	 * 테이블 row 선택시
	 * 
	 * @param {jQuery} $target 클릭한 대상
	 * @param {} row 행 인덱스
	 * @param {} col 열 인덱스
	 */
	ctrl.tbListRowSelect = function($target, row, col) {
		var self = et.vc;
	};
	
	/**
	 * 검색조건 옵션 변경 리스너
	 */
	ctrl.selectChangeListener = function(e) {
		var self = et.vc;
		
	};
	
	/**
	 * 문서 등록 버튼 클릭시 동작
	 */
	ctrl.btnAddModal_clickEventListner = function(e) {
		var self = et.vc;
		
		var agent = navigator.userAgent.toLowerCase();
		if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ){
		    // ie 일때 input[type=file] init.
		    $("#fileCSV").replaceWith( $("#fileCSV").clone(true) );
		    $("#sourceFile").val("");
		} else {
		    //other browser 일때 input[type=file] init.
		    $("#fileCSV").val("");
		    $("#sourceFile").val("");
		}
		$('input[name="isHeader"]:radio[value="Y"]').prop('checked',true);
		
		$('#popAddDocument').show();
	};
	
	/**
	 * 검색버튼 클릭 시 동작
	 */
	ctrl.btnSearch_clickEventListner = function() {
var self = et.vc;
		
		// 컬럼옵션 초기화
		$('#bxOption1').removeClass("sel");
		var checkedHeaders = [];
		$("#ulHeaderOptions li input:checked").each(function(i, item) {
			checkedHeaders.push({
				header_cd: item.dataset.header_cd,
				header_name: item.dataset.header_name,
			});
		});
		self.exposureHeaders = checkedHeaders;
	
		// Validation
		var isValidForm = false;
		var isValid;
		var keys = [];
		$("#selSearchKey option:selected").each(function(idx, item) {
			keys.push($(this).val());
		});
		
		isValid = (keys && keys.length > 0) === true;
		isValidForm = isValidForm && isValid;
		self.showErrorMsg('#selSearchKey', 'search_key', '검색조건을 한 개 이상 선택해주세요.', isValid);
		$("#selSearchKey").off("change");
		$("#selSearchKey").on("change", function() {
			var selected = $("#selSearchKey option:selected");
			if (selected && selected.length > 0) {
				$(".errorsearch_key").prop("style", "display: none");
			} else {
				$(".errorsearch_key").prop("style", "display: block");
			}
		});
		
		var postData = {};
		
		postData.search_text = $("#iptSearchText").val();
		var editor = ace.edit("editor");//
		postData.editorTest = editor.getValue();//
		isValid = (postData.search_text && postData.search_text.trim().length > 0) === true;
		isValidForm = isValidForm && isValid;
		self.showErrorMsg('#iptSearchText', 'search_text', '검색어를 입력해주세요.', isValid);
		$("#iptSearchText").off("change");
		$("#iptSearchText").on("change", function() {
			var txt = $("#iptSearchText").val();
			if (txt && txt.trim().length > 0) {
				$(".errorsearch_text").prop("style", "display: none");
			} else {
				$(".errorsearch_text").prop("style", "display: block");
			}
		});
		
		if (!isValid) return;
		if (keys.length > 0) {
			postData.search_key = keys.join(",");
		}
		self.searchPostData = postData;
		self.createDatatable(postData, self.allHeaders);
	};
	
	/**
	 * 데이터 다운로드 클릭 시 동작
	 */
	ctrl.btnDownloadCsv_clickEventListner = function() {
		var self = et.vc;
		var postData = {};
		var headerStr = $(self.$table.tables().header()).prop("innerText").replace(/\t/gi,",").replace(/\n/gi,",");
		var headerArray = [];
		var header_ids = "";
		if (headerStr != "") {
			headerArray = headerStr.split(",");
		}
		
		$.each(self.allHeaders,function (index,item) {
			var obj = {};
			$.each(headerArray,function (index2,item2) {
				if (item.header_name == item2) {
					header_ids += item.header_cd + ",";
					return;
				}
			})
		});
		if (header_ids != "") {
			header_ids = header_ids.substring(0,header_ids.length-1);
		}
		postData = $.extend({}, self.searchPostData);
		postData.header_ids = header_ids;
		postData.header_names = headerStr;
		
		new ETService().callView(self.path + "/csvDownLoad", postData);
	};
	
	
	ctrl.csvFileUpload = function (form) {
		var self = et.vc;
		var postData = ETValidate.convertFormToFormData(form, true, true);
		var files = $("#fileCSV").prop('files')[0];
		postData.append("csv_file", files);
		var opt = {
				contentType : false,
				processData : false
			};
		$("#divCSVUPLoading").show();
		new ETService().setSuccessFunction(self.csvUploadCallSucceed).setErrorFunction(function(result) {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", "문서등록에 실패했습니다.");
			$('#popAddDocument').hide();
			$("#divCSVUPLoading").hide();
		}).callService(self.path + "/csvUpload", postData, opt);
	}
	
	ctrl.csvUploadCallSucceed = function (resultData) {
		var self = et.vc;
		$('#popAddDocument').hide();
		$("#divCSVUPLoading").hide();
		new ETService().callView(self.path + "/document");
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
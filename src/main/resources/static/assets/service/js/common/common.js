// ******************************************************************************
// * Copyright (c) 2017 Ecoletree. All Rights Reserved.
// * 
// * Author : sgKim
// * Create Date : 2016. 6. 24.
// * DESC : 프로젝트 최상위 객체 정의
// ******************************************************************************
/* 공통적으로 사용되는 상수 모음 */
var ETCONST = {
	PROJECT_NAME : "Ecoletree_PickUpManager",
	// alert type
	ALERT_TYPE_INFO : "info",
	ALERT_TYPE_CONFIRM : "confirm",
	PAGING_LENGTH : 10,
	// 상세페이지 모드 설정
	DETAIL_MODE_ADD : "add",
	DETAIL_MODE_UPDATE : "update",
	SUCCESS : "success",
	ERROR : "error",
	DUPLICATE : "duplicate",
	ERROR_PLACEMENT : ".showErrorMessage",
	
	// Aesthetic Doc Python api server
	API_ROOT_URL : "http://localhost:8000",
//	API_ROOT_URL : "http://121.140.84.247:8000",
//	API_ROOT_URL : "http://210.116.106.98:8000",
	
	// Data rendering 옵션: 데이터테이블 내용 최대 출력 길이
	DATATABLE_CONTENT_MAX_LENGTH: 20,
	// DataTable language setting
	DATATABLE_LANG: {
		"info":           "검색결과 _TOTAL_건 중, _START_ ~ _END_ 건",
	    "infoEmpty":      "검색결과 0건 중, 0 ~ 0 건",
	    "infoFiltered":   "(전체결과: 총 _MAX_건)",
		"emptyTable" : "데이터가 없습니다.",
		"zeroRecords":    "일치하는 데이터가 없습니다.",
		"loadingRecords" : "로딩중...",
		"processing" : '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">로딩중...</span>',
		"paginate": {
			"first" : "<<",
			"last" : ">>",
			"previous": "<",
			"next": ">"
		}
	},
	
	CODE_STATUS_MAP: {
		ST010: '형태소 분해 시작',
		ST011: '형태소 분해 완료',
		ST020: 'Doc2Vec 학습 시작',
		ST021: 'Doc2Vec 학습 완료',
		ST030: '분류모형 학습 시작',
		ST031: '분류모형 학습 종료',
		ST040: '데이터셋 생성 시작',
		ST041: '데이터셋 생성 종료',
	},
};

/* 공통적으로 사용되는 문자열형태 정규식 모음 */
var ETREGEXP = {
	USER_ID : "^[a-zA-Z0-9]+$", // 영문 대소문자 및 숫자
	PASSWORD : "^[a-zA-Z0-9@#*_\\-,.]+$", // password rule
	CODE_ID : "^[a-zA-Z0-9]+$", // 영문 대소문자 및 숫자
	//EMAIL : "^.{1,36}@[\w-]+(\.[a-z]+){1,3}$",
};

//DataTables Default
var lang_eng = {
    "decimal" : "",
    "emptyTable" : "No data available in table",
    "info" : "Showing _START_ to _END_ of _TOTAL_ entries",
    "infoEmpty" : "Showing 0 to 0 of 0 entries",
    "infoFiltered" : "(filtered from _MAX_ total entries)",
    "infoPostFix" : "",
    "thousands" : ",",
    "lengthMenu" : "Show _MENU_ entries",
    "loadingRecords" : "Loading...",
    "processing" : "Processing...",
    "search" : "Search : ",
    "zeroRecords" : "No matching records found",
    "paginate" : {
        "first" : "First",
        "last" : "Last",
        "next" : "Next",
        "previous" : "Previous"
    },
    "aria" : {
        "sortAscending" : " :  activate to sort column ascending",
        "sortDescending" : " :  activate to sort column descending"
    }
};

// Korean
var lang_kor = {
    "decimal" : "",
    "emptyTable" : "데이터가 없습니다.",
    "info" : "_START_ - _END_ (총 _TOTAL_ 건)",
    "infoEmpty" : "0건",
    "infoFiltered" : "(전체 _MAX_ 건 중 검색결과)",
    "infoPostFix" : "",
    "thousands" : ",",
    "lengthMenu" : "_MENU_ 개씩 보기",
    "loadingRecords" : "로딩중...",
    "processing" : "처리중...",
    "search" : "검색 : ",
    "zeroRecords" : "검색된 데이터가 없습니다.",
    "paginate" : {
        "first" : "첫 페이지",
        "last" : "마지막 페이지",
        "next" : "다음",
        "previous" : "이전"
    },
    "aria" : {
        "sortAscending" : " :  오름차순 정렬",
        "sortDescending" : " :  내림차순 정렬"
    }
};



/* common utils */
(function(g, ctrl) {
	var errorMsg = "";
	
	if (!$) { // check jQuery Plugin
		errorMsg = "jQuery is null or jQuery's namespace is crashed. This Util need jQuery plugin.";
	} else if (!_) { // check lodash
		errorMsg = "lodash util plugin is null or '_' overwrite other value. This Util need lodash plugin.";
	} else if (!g.ecoletree) { // [OK] create ecoletree object
		Object.defineProperty(g, "ecoletree", {
			value : ctrl(g)
		});
	} else if (g.ecoletree.name !== ETCONST.PROJECT_NAME) { // check
		// pre-existing
		// ecoletree's name
		errorMsg = "ecoletree Crash namespace!!!!!!";
	}
	
	if (!!errorMsg) {
		console.error(errorMsg);
		Object.defineProperty(g, "ecoletree", {
			value : {}
		});
	}
}(this, function(g) {
	
	"use strict";
	
	var ctrl = {}; // g.ecoletree
	var __c = ctrl.__fn = {}; // private ctrls.
	
	
	ctrl.name = ETCONST.PROJECT_NAME;
	
	ctrl.vc = null; // 현재 보고있는 화면의 VC 객체 저장
	ctrl.alert = null; // alert 팝업창의 VC 객체 저장
	
	/**
	 * messages.properties 메시지 획득
	 * 
	 * @param {string} key messages.properties에 선언한 메시지 key
	 * @param {string} param 메시지에 전달할 파라미터 n개. (ex. msg.test={0}은 {1}이다.
	 * et.getMsg("msg.test", "사과", "과일") > "사과은 과일이다"
	 * @return messages.properties 메시지
	 */
	ctrl.getMsg = jQuery.i18n.prop;
	
	/**
	 * element 활성화 / 비활성화
	 * 
	 * @param {String} element 요소 id. "#id" required.
	 * @param {boolean} isAble 활성화 true. 비활성화 false. 기본값 false
	 */
	ctrl.toggleElement = function(element, isAble) {
		var $elem = $(element);
		var disabled = isAble !== true;
		
		if ($elem.is("a")) {
			if (disabled) {
				$elem.addClass("disabled");
			} else {
				$elem.removeClass("disabled");
			}
		} else if ($elem.is("label")) {
			if (disabled) {
				$elem.addClass("state-disabled");
			} else {
				$elem.removeClass("state-disabled");
			}
		} else {
			$elem.prop("disabled", disabled);
		}
	};
	
	/**
	 * form 내부 input, select, button을 전부 활성화 / 비활성화
	 * 
	 * @param {string} formId
	 * @param {boolean} isAble 활성화 true. 비활성화 false. 기본값 false
	 */
	ctrl.toggleFormElements = function(formId, isAble) {
		$(formId).find("input,select,textarea,button,a").each(function(index) {
			var $this = $(this);
			if (isAble === true) {
				if ($(this).data("activeElement")) {
					ecoletree.toggleElement(this, true);
				}
			} else {
				$this.data("activeElement", !$this.prop("disabled"));
				ecoletree.toggleElement(this, false);
			}
		});
	};
	
	

	
	
	
	/**
	 * 에러 메시지 표시할 dom을 생성하거나 탐색하여 해당 dom에 메시지를 출력합니다.
	 * 
	 * @param {string} message 출력할 메시지.
	 * @param {string|jQuery} targetElem dom id. 에러 메시지를 출력할 자리의 기준이 될 element의
	 * id. 지정한 dom 다음에 메시지가 위치하게 된다.
	 */
	ctrl.showMessage = function(message, targetElem) {
		var self = this;
		var $pDiv, $errorDiv;
		
		// 부모 div 탐색
		if (ETValidate.isString(targetElem) && targetElem.charAt(0) !== "#") {
			targetElem = "#" + targetElem;
		}
		$pDiv = $(targetElem).closest(".input-group");
		$pDiv = ($pDiv.length === 0) ? $(targetElem).closest("div") : $pDiv.parent("div");
		
		// 에러메시지를 추가하기 위한 div를 탐색 또는 생성.
		$errorDiv = $pDiv.find(ETCONST.ERROR_PLACEMENT);
		if ($errorDiv.length === 0) {
			$errorDiv = $("<div />").addClass(ETCONST.ERROR_PLACEMENT.replace(".", "")).addClass("error").appendTo($pDiv);
		}
		
		// 에러메시지 세팅
		$errorDiv.html(message);
	};
	
	
	/**
	 * 화면의 모든 메시지를 제거한다
	 */
	ctrl.removeMessage = function() {
		$(ETCONST.ERROR_PLACEMENT).html("");
	};
	
	/**
	 * 데이타에서 현재 화면에서 사용중인 언어의 데이터를 획득
	 * 
	 * @param data
	 * @param column 컬럼값. title_kor일 경우 title을 입력
	 * @return
	 */
	ctrl.getLangVal = function(data, column) {
		if (!data || !column) {
			return "";
		}
		return data[column + getLang()];
	};
	
	/**
	 * 체크박스에 Y/N 값으로 체크상태 변경
	 * 
	 * @param $cb 체크박스
	 * @param value Y/N 값
	 */
	ctrl.setCheckboxYN = function($cb, value) {
		$($cb).prop("checked", value === "Y");
	};
	
	/**
	 * 체크박스 체크 여부에 따라 Y/N 획득
	 * 
	 * @param $cb 체크박스
	 * @return 체크상태일경우 "Y", 아니면 "N"
	 */
	ctrl.getCheckboxYN = function($cb) {
		return $($cb).prop("checked") ? "Y" : "N";
	};
	
	/**
	 * base64Image를 $img에 설정
	 * 
	 * @param $img image dom. 없으면 신규 dom 생성
	 * @param base64Image base64 image. 없으면 no image 표현
	 * @param isHTMLTxt {boolean} true 일 경우 반환값이 html text
	 * @return $img
	 */
	ctrl.setBase64Image = function($img, base64Image, isHTMLTxt) {
		var imgSrc;
		$img = $($img);
		if (!$img || $img.length === 0) {
			$img = $("<img />");
		}
		
		if (!!base64Image) {
			imgSrc = "data:image/png;base64," + base64Image;
		} else {
			imgSrc = getContextPath() + "/resources/ecoletree/img/imgNoImage.png";
		}
		
		$img.prop("src", imgSrc);
		return (isHTMLTxt !== true) ? $img : $img[0].outerHTML;
	};
	
	/**
	 * 엔터 키 입력시 등록된 함수가 동작하도록 이벤트를 bind.
	 * 
	 * @param {String} target 타겟 셀렉트 정보. "#id" 등. required.
	 * @param {Function} runFn 엔터를 입력하면 동작할 함수. required.
	 * @param {Object} eventData 이벤트에 전달할 데이터
	 * @param {String} eventName bind할 이벤트. 기본값은 "keydown"
	 */
	ctrl.setEnterKeyDownEvent = function(target, runFn, eventData, eventName) {
		$(target).on((ETValidate.isString(eventName)) ? eventName : "keydown", eventData, function(e) {
			if (e.keyCode === 13) {
				runFn(e.data);
			}
		});
	};
	
	// ==============================DataTables Util==============================
	/**
	 * DataTable에 설정할 옵션 생성
	 * 
	 * @param {Array|object} columns 컬럼정보.
	 * @param {string} url
	 * @param {object} seearchParam 검색 데이터
	 * @param {function(settings)} drawCallback 데이터 출력 완료 후 호출될 함수를 등록
	 * @param {boolean|String} typeValue 페이징 or 스크롤. 문자열이면 스크롤, 이외의 값은 페이징.<br>
	 * 문자열 적용시 스크롤 사용시 고정될 데이터 테이블 높이로 설정
	 */
	ctrl.createDataTableSettings = function(columns, url, searchParam, drawCallback, typeValue, info) {
		var option, ajax;
		
		option = {};
		
		// 공통 기본설정
		if (info == undefined) {
			option.info = true;
		} else {
			option.info = info;
		}
		option.ordering = false;
		option.lengthChange = false;
		option.searching = false;
		option.processing = true;
		option.destroy = true;
		// option.scrollCollapse = true; // 보여줄 행 수가 제한될 때 테이블 높이를 줄일 것인지 여부?
		// default : false
		
		option.serverSide = !!url;
		option.language = lang_kor;
		
		if (typeof typeValue !== "string") { // 페이징 처리
			option.paging = typeValue !== false;
			option.pageLength = ETCONST.PAGING_LENGTH;
		} else { // 문자열일 경우 스크롤 테이블을 생성하고 테이블 높이로 문자열 대입
			option.scrollY = typeValue;
			option.scrollCollapse = false;
		}
		
		if (_.isArray(columns)) {
			option.columns = columns;
		} else if (_.isObject(columns)) {
			option.columns = _.toArray(columns);
		}
		
		if (!!url) {
			ajax = {};
			ajax.url = getContextPath() + url;
			ajax.type = "post";
			ajax.contentType = "application/x-www-form-urlencoded; charset=UTF-8";
			ajax.dataType = "JSON";
			ajax.error = function(xhr, ajaxOptions, thrownError) {
				//console.error(xhr.responseText);
				if (xhr.responseText.indexOf("404ERROR") > -1) { // send html document string
					location.href = getContextPath()+"/open404Error";
				} else if (xhr.responseText.indexOf("SESSIONERROR") > -1) {
					location.href = getContextPath()+"/sessionTimeout";
				} else if (xhr.responseText.indexOf("500ERROR") > -1) {
					location.href = getContextPath()+"/open500Error";
				}
			};
			if (_.isObject(searchParam)) {
				searchParam.dataLength = ETCONST.PAGING_LENGTH;
			} else {
				searchParam = {
					dataLength : ETCONST.PAGING_LENGTH,
				};
			}
			ajax.data = searchParam;
			
			option.ajax = ajax;
		}
		
		if (_.isFunction(drawCallback)) {
			option.drawCallback = drawCallback;
		}
		
		return option;
	};
	
	/**
	 * DataTable Row 선택 (row 클릭시 선택 css를 주기 위한 클래스 추가)
	 * 
	 * @param {string} tableID "#id". required
	 * @param {function($target,row,col,columnVisible)} rowClickAction 테이블의 클릭시
	 * 동작할 함수를 등록합니다.
	 */
	ctrl.setDataTableRowSelection = function(tableId, rowClickAction) {
		$(tableId + " tbody").on("click", "tr", function(e) {
			var $this = $(this);
			var $target = $(e.target);
			var dataTable = $(tableId).DataTable();
			var cell;
			
			if ($this.hasClass("selected")) { // 선택 취소
				$this.removeClass("selected");
			} else {
				dataTable.$("tr.selected").removeClass("selected");
				$this.addClass("selected");
			}
			
			if (_.isFunction(rowClickAction)) { // 실행할 함수가 등록되어 있을 경우 함수를 실행한다.
				cell = dataTable.cell($target.closest("td")).index();
				if (!!cell) {
					rowClickAction($target, cell.row, cell.column, cell.columnVisible);
				}
			}
		});
	};
	
	/**
	 * 데이터테이블 row의 전체 데이터를 반환. 값이 없으면 null 반환
	 * 
	 * @param {string} tableId "#id"
	 * @param {} row
	 * @returns {object} rowdata 또는 null.
	 */
	ctrl.getRowData = function(tableId, row) {
		var $row = $(row);
		if ($row.length !== 0) {
			return $(tableId).DataTable().row($row).data();
		} else {
			return null;
		}
	};
	
	/**
	 * 데이터테이블 하단 페이징 컴포넌트 비활성화
	 * 
	 * @param {string} tableId tableId "#id"
	 */
	ctrl.disableDataTablePaging = function(tableId) {
		$(tableId + "_paginate>ul>li").each(function(index) {
			$(this).addClass("disabled");
		});
	};
	
	// ==============================ETValidator Util==============================
	/**
	 * validator의 에러 메시지 표시 공통함수
	 * 
	 * @param error 에러 메시지? 인가?
	 * @param element 에러가 발생한 대상 element 인듯...
	 */
	ctrl.setErrorPlacement = function(error, element) {
		ecoletree.showMessage(error, element);
	};
	
	/**
	 * 클래스명으로 에러 표시할 위치를 찾아 에러메시지를 표시<br>
	 * 에러 발생 대상의 name이 "user_name"이라면 탐색되는 클래스는 ".erroruser_name"
	 * 
	 * @param message 메시지
	 * @param targetElem 에러가 발생한 대상 element
	 */
	ctrl.setErrorPlacementFindClass = function(message, targetElem) {
		var $target = $(targetElem);
		var $pForm = $target.closest("fieldset");
		var elemName = $target.attr("name");
		var $errorDiv;
		
		if (!elemName) {
			console.log("element hasn't name!");
			return;
		}
		
		$errorDiv = $pForm.find(".error" + elemName);
		if (!!$errorDiv && $errorDiv.length !== 0) {
			$errorDiv.show();
			$errorDiv.html(message);
		} else {
			console.log("error placement is not exist!");
		}
	};
	
	// TODO 이하 불필요한거 함수 제거 필요
	
	/**
	 * input에 readonly(like disabled) 설정
	 * 
	 * @param {} element required.
	 * @param {boolean} isAble 활성화 true. 비활성화 false. 기본값 false
	 */
	ctrl.toggleInputReadonly = function(element, isAble) {
		var $elem = $(element);
		var disabled = isAble !== true;
		
		$elem.prop("readonly", disabled);
		if (disabled) {
			$elem.on("focus", function(e) {
				this.blur();
			}).css("cursor", "not-allowed");
		} else {
			$elem.off("focus").css("cursor", "default");
		}
	};
	
	// ==============================ETService Util==============================
	/**
	 * 저장에 실패할 경우 메시지 & 콘솔을 출력하는 공통함수
	 * 
	 * @param {object} data
	 */
	ctrl.errorSave = function(data) {
		if (data.error === "DUPLICATE_ERROR") {
			ecoletree.showAlert(ETCONST.ALERT_TYPE_INFO, "", data.errorMessage + ETMESSAGE.FAILED_DUPLICATE);
		} else {
			ecoletree.showAlert(ETCONST.ALERT_TYPE_INFO, "", ETMESSAGE.FAILED_SAVE);
		}
		ecoletree.toggleFormElements("form", true);
		console.error(data);
	};
	
	/**
	 * 삭제에 실패할 경우 메시지 & 콘솔을 출력하는 공통함수.
	 * 
	 * @param {object} data
	 */
	ctrl.errorDelete = function(data) {
		ecoletree.showAlert(ETCONST.ALERT_TYPE_INFO, "", ETMESSAGE.FAILED_DELETE);
		console.error(data);
	};
	
	// ==============================DataTables Util==============================
	
	/**
	 * DataTable 데이터 반환
	 * 
	 * @param {string} tableID "#id". required
	 * @returns 데이터테이블의 데이터 목록
	 */
	ctrl.getDataTableData = function(tableId) {
		var apidata = $(tableId).DataTable().data();
		var data = [];
		var i, len;
		
		for (i = 0, len = apidata.count(); i < len; i++) {
			data.push(apidata[i]);
		}
		
		return data;
	};
	
	/**
	 * 선택된 row 데이터를 반환. 선택된 데이터가 없을 경우 null을 반환
	 * 
	 * @param {string} tableId "#id"
	 * @returns {object} rowdata 또는 null.
	 */
	ctrl.getSelectedRowDataInDataTable = function(tableId) {
		var $row = $(tableId + " tbody").find("tr.selected:eq(0)");
		return ecoletree.getRowData(tableId, $row);
	};
	
	/**
	 * 날짜 랜더러 공통함수
	 * 
	 * @param {} data The data for the cell
	 * @param {string} type The type call data requested - this will be
	 * 'filter', 'display', 'type' or 'sort'.
	 * @param {object} row row의 전체 데이터
	 * @param {object} meta row, col index 및 settings 정보가 들어있다.
	 */
	ctrl.setDateRender = function(data, type, row, meta) {
		var strDate = "";
		
		// 한글자면 두글자로 바꿔주는 내부함수
		var twoWords = function(value) {
			return value < 10 ? "0" + value : value;
		};
		
		if (data == null || data == undefined) {
			strDate = "-";
		} else {
			var date = new Date(parseFloat(data));
			strDate = date.getFullYear() + "-" + twoWords((date.getMonth() + 1)) + "-" + twoWords(date.getDate());
		}
		return strDate;
	};
	
	/**
	 * [이름 ... width 처리], [상태 배경색], [상태값 라벨링] 3가지 CSS로 자동 처리됨
	    >>만약 상태값 라벨링을 코드값으로 하면 말해줘요
		1.상태값 없음: li class="thumDefault"
		2.상태값 적용: li class="thumStatusDone"
		3.상태값 검수: li class="thumStatusInspection"
		4.상태값 교정필요: li class="thumreWork"
	 * 
	 * userName 은 교정자이름(userID0001) 형태로 넣어준다
	 */
	ctrl.createMaskingComponent = function(data, status, imagePath, rownum, isCheckbox, userName, isUserName, imageClickHandler) {
		var statusClass = "thumDefault";
		if (status == "WM011") {
			statusClass = "thumStatusDone";
		} else if (status == "WM010") {
			statusClass = "thumStatusInspection";
		} else if (status == "WM008") {
			statusClass = "thumreWork";
		} else {
			statusClass = "thumDefault";
		}
		var cp = getContextPath();
		var strLI = $("<li class=\""+statusClass+"\">"); 
		var strDIV = $("<div class=\"imgWrap\"></div>");
		
		var strImg = $("<img src=\""+cp+"/resources/ecoletree/img/admin/sample.jpg\">");
		if (imagePath != null || imagePath != undefined) {
			strImg.attr("src","data:image/jpg;base64,"+imagePath);
		}
		
		strDIV.append(strImg);
		
		var strSpan = $("<span></span>");
		strSpan.html(rownum);
		
		strDIV.append(strSpan);
		if (isCheckbox == true) {
			var strCheckbox = $("<label class=\"ecoleImgCheck\"><input type=\"checkbox\"><i></i></label>");
			strDIV.append(strCheckbox);
		}
		
		strLI.append(strDIV);
		
		if (isUserName == true) {
			var strUserName = $("<div class=\"textWrap\"><p>"+userName+"</p><span></span></div>");
			strLI.append(strUserName);
		}
		strLI.data("rowData",data);
		
		/*
		strLI.click(function(e){
			$("#"+strLI.parent().prop("id")+" > li").removeClass("sel");
			$(this).addClass("sel");
			if (imageClickHandler != null && imageClickHandler != undefined) {
				imageClickHandler($(this).data("rowData"));
			}
		});
		*/
		strLI.bind("mouseup",function (e){
			$("#"+strLI.parent().prop("id")+" > li").removeClass("sel");
			$(this).addClass("sel");
			if (imageClickHandler != null && imageClickHandler != undefined) {
				imageClickHandler($(this).data("rowData"));
			}
		});
		return strLI;
	};
	
	/**
	 * 마스킹 작업중 체크된 데이터를 가져온다
	 * @param 부모 ul 의 id 값 String
	 */
	ctrl.getMaskingCheckData = function(ulComponent) {
		var arr = new Array();
		$("ul#"+ulComponent +" > li > div > label > input[type=checkbox]").each (function () {
			if ($(this).is(":checked")) {
				arr.push($(this).parents("li").data("rowData"));
			}
		});
		
		return arr;
	};
	
	/**
	 * 마스킹 작업중 데이터를 가져온다
	 * @param 부모 ul 의 id 값 String
	 */
	ctrl.getMaskingAllData = function(ulComponent) {
		var arr = new Array();
		$("ul#"+ulComponent +" > li ").each (function () {
			arr.push($(this).data("rowData"));
		});
		
		return arr;
	};
	
	/**
	 * 마스킹 전체 체크 및 전체 체크 풀기
	 * @param 부모 ul 의 id 값 String
	 */
	ctrl.getMaskingAllCheck = function(ulComponent, isCheck) {
		var arr = new Array();
		$("ul#"+ulComponent +" > li > div > label > input[type=checkbox]").each (function () {
			$(this).prop("checked",isCheck);
		});
		
		return arr;
	};
	
	/**
	 * 마스킹 전체 체크 및 전체 체크 풀기
	 * @param 부모 ul 의 id 값 String
	 * @param 지워야 하는 data (tb_wise_masking row 데이터 image_cd 만 있어도 됨)
	 */
	ctrl.getMaskingRemoveImage = function(ulComponent, data) {
		var index = -1;
		$("ul#"+ulComponent +" > li").each (function (i) {
			if (data.image_cd == $(this).data("rowData").image_cd) {
				$(this).remove();
				index = i;
			}
		});
		
		return index;
	};
	
	/**
	 * input select에 동적으로 option을 만들어줌
	 * 
	 * @param {array} aDataList option으로 보여질 데이터 리스트
	 * @param {object} oOptionKey option에 value와 text 값에 대응하는 필드명을 담고 있음, value와 text로 고정되어 있음
	 * @param {string} sTargetID option이 들어가게 될 select의 id 값, #selectID 형태
	 * @param {string} sFirstOptionText option 맨 위에 디폴트 값이 있는 경우 보여질 text를 넘김
	 */
	ctrl.makeSelectOption = function(aDataList, oOptionKey, sTargetID, sFirstOptionText) {
		$(sTargetID).empty();
		
		if (!!aDataList) {
			var option;

			if (!!sFirstOptionText && sFirstOptionText != "") {
				option = $('<option>', {
					value : "",
					text : sFirstOptionText,
					selected : ""
				});
				$(sTargetID).append(option);
			}
			
			for (var i = 0; i < aDataList.length; i++) {
				option = $('<option>', {
					value : aDataList[i][oOptionKey.value],
					text : aDataList[i][oOptionKey.text],
				});
				if (oOptionKey.data) {
					option.data(oOptionKey.data, aDataList[i][oOptionKey.data]);
				}
				option.data(aDataList[i]);
				$(sTargetID).append(option);
			}
		}
	};
	
	
	// dataTable Option
	ctrl.getDataTableOption = function(){
		
		var self = ecoletree.vc;
		
		return {
			lengthChange: false, // 노출 시킬 로우 갯수 변경: 사용 안 함. 
			paging: true,
			pageLength: 10,
			pagingType: "full_numbers_no_ellipses",
			destroy: true,
			processing: true,
			info: true,
			searching: true,
			select:true,
			ordering: false,
			orderCellsTop: true,
	        fixedHeader: true,
			language: ETCONST.DATATABLE_LANG,
//			columns : columns,
//			data : dataSet, // 정의 안되있다고 안넘어가네여.. dataTable 이랑 연계해서 .찍으면서 넘기면 넘어갈려나.
			columnDefs: [{
				targets: '_all',
				render: function(data, type, row, meta) {
					$.fn.dataTable.render.ellipsis(ETCONST.DATATABLE_CONTENT_MAX_LENGTH);

				}
			}],
		};
	};
	
	//에러 콜백을 공통함수로.
	ctrl.ajaxErrorCallback = function(xhr, ajaxOptions, thrownError) {
		var self = ecoletree.vc;
		if (xhr.status == 500) {
			location.href = getContextPath()+"/open500Error";
		} else if (xhr.status == 404) {
			location.href = getContextPath()+"/open404Error";
		} else if (xhr.status == 400) {
			ecoletree.alert.show(ETCONST.ALERT_TYPE_INFO, "", xhr.responseJSON.msg);
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
	
	/**
	 * 진행 상태 확인 모달 생성 및 출력
	 * 
	 * @param {string} sTaskName 작업명
	 * @param {string} sModalID 진행상태 확인 모달 div id 값
	 * @param {string} sTargetID 진행상태 정보를 출력할 컨테이너 div id 값
	 * @param {array} aProcesses 진행상태 데이터 리스트
	 * @param {object} oStatusMapping 상태 고유코드 <-> 화면 출력 메시지 매핑 객체 {상태 고유코드 : 출력 메시지}
	 */
	ctrl.createProcess = function(sTaskName, sModalID, sTargetID, aProcesses, oStatusMapping) {
		var processHtmlList = [];
		var statusMap = oStatusMapping || ETCONST.CODE_STATUS_MAP;
		
		for (var oProcess of aProcesses) {
			// input, target 변수
			var tag_name = oProcess.tag_name || ''
			var tags = tag_name.split('/');
			var inputs = tags[0];
			var target = tags[1] || ''
			
			var status = statusMap[oProcess.proc_type] || '알 수 없음';
			
			var processInfo = '<div class="bxEcoleRoundNoP" id="p_'+ oProcess.hist_id +'">'
				+'<fieldset>'
				+'<input type="hidden" name="hist_id" value="'+ oProcess.hist_id +'" data-type="'+ oProcess.proc_type +'" >'
				+'<img src="/AestheticDoc_analyzer/resources/ecoletree/img/iconProcess.png"> &nbsp;' + status
				+'<span class="pull-right">'+ oProcess.complete_date +'</span>'
				+'</fieldset>'
				+'<fieldset>'
				+'<div class="bxPB20">'
				+'<p class="label">'+ sTaskName +' 표기명</p>'
				+'<p class="descrip">'+ oProcess.task_label +'</p>'
				+'</div>'
				+'<div class="bxPB20">'
				+'<p class="label">Data</p>'
				+'<p class="descrip">'+ oProcess.dataset_label +'</p>'
				+'</div>'
				+'<div class="bxPB20">'
				+'<p class="label">Input</p>'
				+'<p class="descrip">'+ inputs +'</p>'
				+'</div>'
				+'<div>'
				+'<p class="label">Target</p>'
				+'<p class="descrip">'+ target +'</p>'
				+'</div>'
				+'</fieldset>'
				+'</div>';
			
			processHtmlList.push(processInfo);
		}
		if (processHtmlList.length > 0) {
			$(sTargetID).html(processHtmlList.join('\n'));
		} else {
			$(sTargetID).html('<div class="no-proc"><p class="no-proc-msg">진행 중인 프로세스가 없습니다.</p></div>');
		}
		$(sModalID).modal('show');
		
		// 창닫기
		$("#btnCloseProcModal").on("click", function(e) {$("#popUserProcess").modal('hide')});
	};
	
	/**
	 * yyyy-MM-dd 포맷 문자열로 변환
	 * 
	 * @param date {Date} 변환할 Date 객체
	 */
	ctrl.getSimpleFormatDate = function (date) {
		var dateStr = date.toLocaleDateString("ko-KR").replace(/ /g, "").split(".");
		for (var i = 1; i < dateStr.length; i++) {
			if (i < 3) {
				if (dateStr[i].length < 2) {
					dateStr[i] = '0' + dateStr[i];
				}
			} else {
				break;
			}
		}
		return dateStr.slice(0, 3).join('-')
	};
	
	/**
	 * et 프레임워크를 사용하지 않는 ajax 요청 실패 콜백함수
	 */
	ctrl.ajaxErrorCallback = function(xhr, ajaxOptions, thrownError) {
		
		if (xhr.status == 500) {
			location.href = getContextPath()+"/open500Error";
		} else if (xhr.status == 404) {
			location.href = getContextPath()+"/open404Error";
		} else if (xhr.status == 400) {
			et.alert.show(ETCONST.ALERT_TYPE_INFO, "", xhr.responseJSON.msg);
		}
	};
	
	return ctrl;
}));

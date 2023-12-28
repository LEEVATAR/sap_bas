sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "project3/model/modules",
    "sap/ui/model/json/JSONModel",
    "sap/m/PDFViewer",
    "sap/base/security/URLWhitelist"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */

    function (Controller, modules, JSONModel, PDFViewer, URLWhitelist) {
        "use strict";

        let _this, press1, avatar1Content, avatar2Content, objectIdp, objectIdv, MATNRNo, vanbase64Data, partsbase64Data;

        return Controller.extend("project3.controller.View1", {
            onInit: function () {
                const myRoute = this.getOwnerComponent().getRouter().getRoute("RouteView1");
                myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
            },
            onMyRoutePatternMatched: function () {
                _this = this;
                var link = { link: false }
                this.getView().setModel(new JSONModel(link), "link");
                press1 = false;
                let aModel = new JSONModel('../model/Airlift.json');
                let pModel = new JSONModel('../model/PackingSpec.json');
                let tModel = new JSONModel('../model/PackingType.json');
                this.getView().setModel(aModel, "airliftModel");
                this.getView().getModel("airliftModel");
                this.getView().setModel(pModel, "oDataModel");
                this.getView().getModel("oDataModel");
                this.getView().setModel(tModel, "packingTypeModel");
                this.getView().getModel("packingTypeModel");
                MATNRNo = "2181025020";
                let visible = { visible: false }
                this.getView().setModel(new JSONModel(visible), "detailBoxVlsibleModel");
                this.getView().setModel(new JSONModel(visible), "packagingVisibleModel");
                //모델갯수줄이기
                let oTemp =
                    [{
                        MATNR: "2181025020",
                        material: "BRKT ASSY-ENGINE MTG",
                        Usage: "0",
                        stuffingQty: "10",
                        stuffingRate: "100",
                        surface: true,
                        color: true,
                        texture: "pl",
                        width: "10.00",
                        height: "10.00",
                        length: "10.00",
                        thickness: "10.00",
                        size: "102",
                        weight: "100.00",
                        ZNPERNR: "우찬웅",
                        phone: "010-2050-3040",
                        remark: "nothing special",
                        HMCOpinion: "it is good",
                        createDate: "2023-10-11",
                        editDate: "2023-11-21"
                    },
                    {
                        MATNR: "2281025020",
                        material: "BRKT ASSY-ENGINE ZMT",
                        Usage: "1",
                        stuffingQty: "12",
                        stuffingRate: "98",
                        surface: false,
                        color: true,
                        texture: "ru",
                        width: "0.01",
                        height: "1.03",
                        length: "2.05",
                        thickness: "11.12",
                        size: "12",
                        weight: "140.00",
                        ZNPERNR: "웅찬우",
                        phone: "010-1235-1245",
                        remark: "nothing special",
                        HMCOpinion: "it is good",
                        createDate: "2023-12-24",
                        editDate: "2023-12-25"
                    }
                    ];
                this.getView().setModel(pModel, "topBarModel");
                this.getView().setModel(new JSONModel(oTemp), "vanningModel");
            },
            onSearch: function () {
                let searchPlant = this.byId("Plant").getSelectedKey();
                let searchMATNR = this.byId("MATNR").getValue();
                let searchZCLIFNR3 = this.byId("ZCLIFNR3").getValue();
                let searchZCFUNC = this.byId("ZCFUNC").getSelectedKey();
                let bCheck = modules.globalCheck("Required", this);
                if (!bCheck) {
                    modules.messageBox('warning', "입력값을 확인해주세요")
                    return;
                }
                let oData = this.getView().getModel("oDataModel").getData();

                this.getView().setModel(new JSONModel([]), "searchModel");
                let oModel = this.getView().getModel("searchModel");

                let aFilteredData = oData.filter(function (item) {
                    let lowerCaseItemZCLIFNR3 = item.ZCLIFNR3.toLowerCase();
                    let lowerCaseSearchZCLIFNR3 = searchZCLIFNR3.toLowerCase();
                    return item.WERKS.includes(searchPlant) &&
                        lowerCaseItemZCLIFNR3.includes(lowerCaseSearchZCLIFNR3) &&
                        item.ZCFUNC.includes(searchZCFUNC) &&
                        item.MATNR.includes(searchMATNR)
                });
                // let jSon = JSON.parse(JSON.stringify(aFilteredData[0])) //??
                aFilteredData[0].MATNR = aFilteredData[0].MATNR.substring(0, 5) + '-' + aFilteredData[0].MATNR.substring(5)//수정된
                oModel.setData({ aFilteredData });
                _this.getView().setModel(new JSONModel(aFilteredData), "packingTableModel");
            },
            onLink: function () {
                this.getView().getModel("link").setProperty("/link", true);
            },
            onExcelDownload: async function () {
                let vanningModel = this.getView().getModel('vanningModel');
                let oData = vanningModel.getData();

                const workbook = new ExcelJS.Workbook();
                const sheet = workbook.addWorksheet('sheet1');

                sheet.mergeCells('A1:S1');
                sheet.mergeCells('A2:S2');
                sheet.mergeCells('A3:S3');
                sheet.mergeCells('A4:S4');
                sheet.mergeCells('A5:S5');

                sheet.getCell('A1').value = {
                    richText: [{
                        text: '적입부품 LIST',
                        font: { size: 20, bold: true }
                    }]
                };
                sheet.getCell('A1').alignment = { horizontal: 'center' };
                sheet.getCell('A2').value = '공장 : HK11 울산 CKD 공장';
                sheet.getCell('A3').value = '작성의뢰번호 : D005T20230300002';
                sheet.getCell('A4').value = '자재번호 : 217A0GI000';
                sheet.getCell('A5').value = '적용사양번호 : ';

                // 헤더 셋업
                let headers = ['No', '자재번호', '자재명', 'Usage', '적입률', '표면처리', '칼라', '재질', '가로', '세로', '높이', '두께', '부품중량', '자재크기', '담당자', '전화번호', '생성일', '변경일'];
                let headerRow = sheet.getRow(6);
                headerRow.values = headers;
                headerRow.eachCell((cell) => {
                    cell.alignment = { horizontal: 'center' };
                });

                let columnWidths = headers.map(header => header.length);

                oData.forEach((item, rowIndex) => {
                    let rowValues = [
                        rowIndex + 1, item.MATNR, item.material, item.Usage, item.stuffingRate, item.surface, item.color, item.texture, item.width, item.length, item.height, item.thickness, item.weight, item.size, item.ZNPERNR, item.phone, item.createDate, item.editDate
                    ];

                    let row = sheet.getRow(rowIndex + 7);
                    row.values = rowValues;
                    row.eachCell((cell) => {
                        cell.alignment = { horizontal: 'center' };
                    });

                    rowValues.forEach((value, colIndex) => {
                        let length = value ? value.toString().length : 0;
                        if (length > columnWidths[colIndex]) {
                            columnWidths[colIndex] = length;
                        }
                    });
                });

                columnWidths.forEach((width, index) => {
                    sheet.getColumn(index + 1).width = width + 4; // 컬럼에 여유 공간 추가
                });

                sheet.getRow(6).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: 'FF87CEEB' }
                };


                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const url = window.URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'VanningTest.xlsx';
                anchor.click();
                window.URL.revokeObjectURL(url);
            },
            ////////////////D M S 2181025020
            onAvatarPress: function () {
                press1 = true;
                this.byId("UploadSet")._oList.mEventRegistry.selectionChange[0].oListener._oUploadButton.firePress();
            },
            onAvatarPress2: function () {
                press1 = false;
                this.byId("UploadSet2")._oList.mEventRegistry.selectionChange[0].oListener._oUploadButton.firePress();
            },
            onBeforeItemAdded: function (oEvent) {
                let item = oEvent.getParameter("item");
                this.oFileUploadComponent = item.getFileObject();
                if (this.oFileUploadComponent) {
                    this._handleRawFile(this.oFileUploadComponent, this);
                }
            },
            _handleRawFile: function (oFile, oController) {
                //handle file data
                var oFileRaw = {
                    name: oFile.name,
                    mimetype: oFile.type,
                    size: oFile.size,
                    data: []
                };
                var reader = new FileReader();
                reader.onload = function (e) {
                    oFileRaw.data = e.target.result; //set buffer data
                    oController.uploadFileRaw = `oFileRaw`;
                    var arrayBufferView = new Uint8Array(oFileRaw.data);
                    const charArr = arrayBufferView.reduce((data, byte) => (data + String.fromCharCode(byte)), '');
                    const img = "data:image/jpeg;base64," + window.btoa(charArr);
                    let content = _this.base64toFile(img);
                    if (press1) {
                        avatar1Content = content;
                    } else {
                        avatar2Content = content;
                    }
                    let avatar1 = this.byId("partsImage")
                    let avatar2 = this.byId("vanImage")
                    // setSrc를 위해 필요한 코드
                    let reader = new FileReader();
                    reader.readAsDataURL(content);
                    reader.onloadend = function () {
                        let base64data = reader.result;
                        if (press1) {
                            avatar1.setSrc(base64data);
                            partsbase64Data = base64data
                        } else {
                            avatar2.setSrc(base64data);
                            vanbase64Data = base64data
                        }
                        const byteArray = new Uint8Array(base64data);
                        const blob = new Blob([byteArray], { type: "image/jpeg" });
                        var pdfDocumentURL = window.URL.createObjectURL(blob);
                    }
                }.bind(oController);
                reader.readAsArrayBuffer(oFile);
            },
            base64toFile: function (dataurl) {
                var arr = dataurl.split(','),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                console.log(u8arr);
                return new File([u8arr], { type: mime });
            },
            dmsPost: async function (content, nameData) {
                var form = new FormData();
                form.append("cmisaction", "createDocument");
                form.append("propertyId[0]", "cmis:name");
                form.append("propertyValue[0]", nameData);
                form.append("propertyId[1]", "cmis:objectTypeId");
                form.append("propertyValue[1]", "cmis:document");
                form.append("succinct", "true");
                form.append("filename", content);
                form.append("media", "binary");
                var settings = {
                    "url": "/browser/366f25b6-a3dc-4240-b2e4-7bbeae1efeef/root/",
                    "method": "POST",
                    "timeout": 0,
                    "processData": false,
                    "mimeType": "multipart/form-data",
                    "contentType": false,
                    "data": form
                };

                $.ajax(settings).done(async function (response) {
                    console.log(response);
                }).fail(async function (xhr) {
                    console.log(xhr)
                });
            },

            dmsDelete: async function (deleteId) {
                var form = new FormData();
                form.append("propertyId[0]", "cmis:isImmutable");
                form.append("propertyValue[0]", false);
                var settings = {
                    "url": jQuery.sap.getModulePath("project3", "/browser/366f25b6-a3dc-4240-b2e4-7bbeae1efeef/root/?cmisaction=delete&objectId=" + deleteId),
                    "method": "POST",
                    "timeout": 0,
                    "processData": false,
                    "mimeType": "multipart/form-data",
                    "contentType": false,
                    "data": form
                };

                $.ajax(settings).done(async function (response) {
                    console.log(response);
                }).fail(async function (xhr) {
                    console.log(xhr)
                });
            },
            onSave: function () {
                MATNRNo = this.byId("MATNR").getValue();
                this.getDms();
                if (objectIdp || objectIdv) {
                    modules.messageBox("warning", "이미 사진이 존재합니다.")
                    return;
                }

                if (avatar1Content) {
                    this.dmsPost(avatar1Content, MATNRNo + "parts");

                    avatar1Content = null;
                }
                if (avatar2Content) {
                    this.dmsPost(avatar2Content, MATNRNo + "vanning");

                    avatar2Content = null;
                }
            },
            getDms: async function () {
                await $.ajax({
                    url: "/browser/366f25b6-a3dc-4240-b2e4-7bbeae1efeef/root/",
                    method: "get",
                    success: function (data) {
                        for (let i = 0; i < data.objects.length; i++) {
                            if (data.objects[i].object.properties['cmis:name'].value == MATNRNo + "parts") {
                                objectIdp = data.objects[i].object.properties['cmis:objectId'].value
                            }
                            if (data.objects[i].object.properties['cmis:name'].value == MATNRNo + "vanning") {
                                objectIdv = data.objects[i].object.properties['cmis:objectId'].value
                            }
                        }
                    },
                    error: function (xhr, error) {
                        console.log("오류", xhr, error)
                    }
                })
                if (objectIdp) {
                    await $.ajax({
                        type: "GET",
                        url: '/browser/366f25b6-a3dc-4240-b2e4-7bbeae1efeef/root/',
                        data: { objectId: objectIdp, cmisSelector: "content", filename: MATNRNo + "parts" },
                        xhrFields: {
                            responseType: 'blob'
                        },
                        beforeSend: function (xhr) {
                        },
                        success: function (data) {
                            let reader = new FileReader();
                            reader.readAsDataURL(data);
                            reader.onloadend = function (e) {
                                partsbase64Data = e.target.result;
                                _this.byId("partsImage").setSrc(partsbase64Data);
                                _this.byId("partsImage").data('objectId', objectIdp);
                            }
                        },
                        error: function () {
                            new sap.m.MessageToast.show("Error while calling the data");
                        },
                        complete: function () {
                        },
                    });
                }
                if (objectIdv) {
                    await $.ajax({
                        type: "GET",
                        url: '/browser/366f25b6-a3dc-4240-b2e4-7bbeae1efeef/root/',
                        data: { objectId: objectIdv, cmisSelector: "content", filename: MATNRNo + "vanning" },
                        xhrFields: {
                            responseType: 'blob'
                        },
                        success: function (data) {
                            let reader = new FileReader();
                            reader.readAsDataURL(data);
                            reader.onloadend = function (e) {
                                vanbase64Data = e.target.result;
                                _this.byId("vanImage").setSrc(vanbase64Data);
                                _this.byId("vanImage").data('objectId', objectIdv);
                            }
                        },
                        error: function () {
                            new sap.m.MessageToast.show("Error while calling the data");
                        },
                        complete: function () {
                        },
                    });
                }
            },
            getDmsWithoutSrc: async function () {
                objectIdp, objectIdv = null;
                await $.ajax({
                    url: "/browser/366f25b6-a3dc-4240-b2e4-7bbeae1efeef/root/",
                    method: "get",
                    success: function (data) {
                        for (let i = 0; i < data.objects.length; i++) {
                            if (data.objects[i].object.properties['cmis:name'].value == MATNRNo + "parts") {
                                objectIdp = data.objects[i].object.properties['cmis:objectId'].value
                            }
                            if (data.objects[i].object.properties['cmis:name'].value == MATNRNo + "vanning") {
                                objectIdv = data.objects[i].object.properties['cmis:objectId'].value
                            }
                        }
                    },
                    error: function (xhr, error) {
                        console.log("오류", xhr, error)
                    }
                })
                if (objectIdp) {
                    await $.ajax({
                        type: "GET",
                        url: '/browser/366f25b6-a3dc-4240-b2e4-7bbeae1efeef/root/',
                        data: { objectId: objectIdp, cmisSelector: "content", filename: MATNRNo + "parts" },
                        xhrFields: {
                            responseType: 'blob'
                        },
                        beforeSend: function (xhr) {
                        },
                        success: function (data) {
                            let reader = new FileReader();
                            reader.readAsDataURL(data);
                            reader.onloadend = function (e) {
                                partsbase64Data = e.target.result;

                            }
                        },
                        error: function () {
                            new sap.m.MessageToast.show("Error while calling the data");
                        },
                        complete: function () {
                        },
                    });
                }
                if (objectIdv) {
                    await $.ajax({
                        type: "GET",
                        url: '/browser/366f25b6-a3dc-4240-b2e4-7bbeae1efeef/root/',
                        data: { objectId: objectIdv, cmisSelector: "content", filename: MATNRNo + "vanning" },
                        xhrFields: {
                            responseType: 'blob'
                        },
                        success: function (data) {
                            let reader = new FileReader();
                            reader.readAsDataURL(data);
                            reader.onloadend = function (e) {
                                vanbase64Data = e.target.result;

                            }
                        },
                        error: function () {
                            new sap.m.MessageToast.show("Error while calling the data");
                        },
                        complete: function () {
                        },
                    });
                }
            },
            //ADOBE 추출
            onPdf: async function () {
                let ptModel = this.getView().getModel("packingTypeModel").getData();
                let aModel = this.getView().getModel("airliftModel").getData();
                let pModel = this.getView().getModel("oDataModel").getData();
                let vModel = this.getView().getModel("vanningModel").getData();
                let parts;
                let vans;
                // await this.getDms();
                await this.getDmsWithoutSrc();
                if (partsbase64Data) {
                    parts = partsbase64Data;
                    parts = parts.split('base64,');
                } else {
                    parts = []
                }
                if (vanbase64Data) {
                    vans = vanbase64Data;
                    vans = vans.split('base64,');
                } else {
                    vans = []
                }

                var encoder = new TextEncoder();
                var tableRows = "";
                for (var i = 0; i < vModel.length; i++) {
                    tableRows += "<Row" + (i + 1) + ">" + // 행 번호는 i + 1로 시작                    
                        "<Cell1>" + "<![CDATA[" + vModel[i].MATNR + "]]>" + "</Cell1>" + // 유동적인 숫자 (행 번호)
                        "<Cell2>" + "<![CDATA[" + vModel[i].material + "]]>" + "</Cell2>" +
                        "<Cell3>" + "<![CDATA[" + vModel[i].usage + "]]>" + "</Cell3>" +
                        "<Cell4>" + "<![CDATA[" + vModel[i].stuffingQty + "]]>" + "</Cell4>" +
                        "<Cell5>" + "<![CDATA[" + vModel[i].surface + "]]>" + "</Cell5>" +
                        "<Cell6>" + "<![CDATA[" + vModel[i].texture + "]]>" + "</Cell6>" +
                        "<Cell7>" + "<![CDATA[" + vModel[i].color + "]]>" + "</Cell7>" +
                        "<Cell8>" + "<![CDATA[" + vModel[i].width + "]]>" + "</Cell8>" +
                        "<Cell9>" + "<![CDATA[" + vModel[i].length + "]]>" + "</Cell9>" +
                        "<Cell10>" + "<![CDATA[" + vModel[i].height + "]]>" + "</Cell10>" +
                        "<Cell11>" + "<![CDATA[" + vModel[i].thickness + "]]>" + "</Cell11>" +
                        "<Cell12>" + "<![CDATA[" + vModel[i].weight + "]]>" + "</Cell12>" +
                        "<Cell13>" + "<![CDATA[" + vModel[i].stuffingRate + "]]>" + "</Cell13>" +
                        "<Cell14>" + "<![CDATA[" + vModel[i].ZNPERNR + "]]>" + "</Cell14>" +
                        "<Cell15>" + "<![CDATA[" + vModel[i].phone + "]]>" + "</Cell15>" +
                        "</Row" + (i + 1) + ">"
                }

                var tableRowsAir = "";
                for (var i = 0; i < aModel.length; i++) {

                    tableRowsAir += "<Row" + (i + 1) + ">" + // table4 행 번호는 i + 1로 시작
                        "<Cell1>" + "<![CDATA[" + (i + 1) + "]]>" + "</Cell1>" + // 유동적인 숫자 (행 번호)
                        "<Cell2>" + "<![CDATA[" + ptModel[i].packagingType + "]]>" + "</Cell2>" + // 유동적인 숫자 (행 번호)
                        "<Cell3>" + "<![CDATA[" + aModel[i].MATNR + "]]>" + "</Cell3>" +
                        "<Cell4>" + "<![CDATA[" + ptModel[i].packagingHow + "]]>" + "</Cell4>" +
                        "<Cell5>" + "<![CDATA[" + ptModel[i].packagingDetail + "]]>" + "</Cell5>" +
                        "<Cell6>" + "<![CDATA[" + aModel[i].stuffingQty + "]]>" + "</Cell6>" +
                        "<Cell7>" + "<![CDATA[" + aModel[i].gongsu + "]]>" + "</Cell7>" +
                        "<Cell8>" + "<![CDATA[" + aModel[i].formula + "]]>" + "</Cell8>" +
                        "</Row" + (i + 1) + ">"
                }

                var printd =
                    "<?xml version='1.0' encoding='UTF-8'?>" +
                    "<form1>" +
                    "<TextField1>" + "<![CDATA[" + "]]>" + "</TextField1>" +
                    "<TextField2>" + "<![CDATA[" + pModel[0].ZCLIFNR3 + "]]>" + "</TextField2>" +
                    "<TextField3>" + "<![CDATA[" + "]]>" + "</TextField3>" +
                    "<TextField4>" + "<![CDATA[" + pModel[0].ZCPISP + "]]>" + "</TextField4>" +
                    "<TextField5>" + "<![CDATA[" + pModel[0].WERKS + "]]>" + "</TextField5>" +
                    "<TextField6>" + "<![CDATA[" + "]]>" + "</TextField6>" +
                    "<TextField7>" + "<![CDATA[" + pModel[0].ZCCRNO + "]]>" + "</TextField7>" +
                    "<TextField8>" + "<![CDATA[" + "N" + "]]>" + "</TextField8>" +
                    "<TextField9>" + "<![CDATA[" + "ALL" + "]]>" + "</TextField9>" +
                    "<TextField10>" + "<![CDATA[" + "특이사항 없음" + "]]>" + "</TextField10>" +
                    "<TextField11>" + "<![CDATA[" + "N" + "]]>" + "</TextField11>" +
                    "<TextField12>" + "<![CDATA[" + pModel[0].ZCFUNC + "]]>" + "</TextField12>" +
                    "<TextField13>" + "<![CDATA[" + "]]>" + "</TextField13>" +
                    "<TextField14>" + "<![CDATA[" + "]]>" + "</TextField14>" +
                    "<TextField15>" + "<![CDATA[" + vModel[0].weight + "]]>" + "</TextField15>" +
                    "<TextField16>" + "<![CDATA[" + (vModel[0].weight * vModel[0].stuffingQty) + "]]>" + "</TextField16>" +
                    "<TextField17>" + "<![CDATA[" + (vModel[0].width * vModel[0].length * vModel[0].height) + "]]>" + "</TextField17>" +
                    "<TextField18>" + "<![CDATA[" + vModel[0].stuffingQty + "]]>" + "</TextField18>" +
                    "<TextField19>" + "<![CDATA[" + vModel[0].width + "]]>" + "</TextField19>" +
                    "<TextField20>" + "<![CDATA[" + vModel[0].length + "]]>" + "</TextField20>" +
                    "<TextField21>" + "<![CDATA[" + vModel[0].height + "]]>" + "</TextField21>" +
                    "<Table1>" +
                    "<HeaderRow/>" +
                    tableRows +
                    "</Table1>" +
                    "<Table2>" +
                    "<HeaderRow/>" +
                    "</Table2>" +
                    "<Table3>" +
                    "<HeaderRow/>" +
                    "</Table3>" +
                    "<Table4>" +
                    "<HeaderRow/>" +
                    tableRowsAir +
                    "</Table4>" +
                    "<ImageField1>" + parts[1] + "</ImageField1>" +
                    "<ImageField2>" + vans[1] + "</ImageField2>" +
                    "</form1>"

                var data = encoder.encode(printd);
                var printdb64 = this.base64FromArrayBuffer(data);

                var pdfcontent = {
                    "embedFont": 0,
                    "formLocale": "en_US",
                    "formType": "print",
                    "taggedPdf": 1,
                    "xdpTemplate": "form_hs/form_hs_template_van",
                    "xmlData": printdb64
                }
                $.ajax({
                    url: jQuery.sap.getModulePath("project3", "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=0"),
                    type: "POST",
                    data: JSON.stringify(pdfcontent),
                    contentType: "application/json",
                    async: false,
                    success: function (data) {
                        const deccont = atob(data.fileContent);
                        const byteNumbers = new Array(deccont.length);

                        for (let i = 0; i < deccont.length; i++) {
                            byteNumbers[i] = deccont.charCodeAt(i);
                        }

                        const byteArray = new Uint8Array(byteNumbers);
                        console.log(byteArray);
                        const blob = new Blob([byteArray], { type: "application/pdf" });
                        console.log(blob);
                        var pdfDocumentURL = URL.createObjectURL(blob);

                        if (!this._pdfViewer) {
                            this._pdfViewer = new PDFViewer();
                            this._pdfViewer.attachError(event => ErrorHandlerSingleton.getInstance().onError(event));
                            URLWhitelist.add("blob");
                        }

                        this._pdfViewer.setSource(pdfDocumentURL);
                        this._pdfViewer.open();
                    },
                    error: function (err) {
                        console.log(err);

                    }
                });
            },
            base64FromArrayBuffer: function (arrayBuffer) {
                let binary = '';
                let bytes = new Uint8Array(arrayBuffer);
                let len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return btoa(binary);
            },
            onRefresh: function () {
                this.getView().setModel(new JSONModel([]), "packingTableModel");
                modules.globalClear("Required", this)
                modules.globalClear("checkBox", this)
                this.onMyRoutePatternMatched();
            },
            onCell: function () {
                let iSelectedIndex = _this.byId("vanningTable").getSelectedIndices();
                let oModel = this.getView().getModel("vanningModel").getData();
                this.getView().setModel(new JSONModel([]), "vanningDetail");
                let nModel = this.getView().getModel("vanningDetail");
                let nData = nModel.getData();

                if (iSelectedIndex.length === 0) {
                    this.getView().getModel("vanningDetail").setData();
                    this.byId("partsImage").setSrc(null)
                    this.byId("vanImage").setSrc(null)
                } else {
                    for (let i = 0; i < iSelectedIndex.length; i++) {
                        var sIndex = iSelectedIndex[i];
                        var oData = oModel[sIndex];
                        this.getDms();
                        nData.push(oData);
                    }
                    nModel.refresh();
                    this.getView().setModel("vanningDetail");
                }
            },
            onPackingTypeSelect: function () {
                let iSelectedIndexPacking = this.byId("packingTypeTable").getSelectedIndices();
                let iSelectedIndexAirlift = this.byId("airliftTable").getSelectedIndices();
                let oModelPacking = this.getView().getModel("packingTypeModel").getData();
                let oModelAirlift = this.getView().getModel("airliftModel").getData();

                for (let i = 0; i < iSelectedIndexPacking.length; i++) {
                    var oDataPacking = oModelPacking[iSelectedIndexPacking[i]];

                    for (let j = 0; j < iSelectedIndexAirlift.length; j++) {
                        var sIndexAirlift = iSelectedIndexAirlift[j];
                        var oDataAirlift = oModelAirlift[sIndexAirlift];
                        oDataAirlift["HeavyPackagingCount"] = oDataPacking.HeavyPackagingCount;
                        oDataAirlift["calculationFormula"] = oDataPacking.calculationFormula;
                    }
                }
                // 모델 업데이트
                this.getView().getModel("airliftModel").refresh();
                let oTable = this.byId("packingTypeTable");
                setTimeout(function () {
                    oTable.clearSelection();
                }, 500);
            },
            onSaveFitPart: async function () {

                await this.getDms();
                if (objectIdp && avatar1Content) {
                    await _this.dmsDelete(objectIdp).then(function () {
                        _this.dmsPost(avatar1Content, MATNRNo + "parts");
                        objectIdp = null;
                        avatar1Content = null;
                    })
                } else if (!objectIdp && avatar1Content) {
                    _this.dmsPost(avatar1Content, MATNRNo + "parts");
                    avatar1Content = null;
                }

                if (objectIdv && avatar2Content) {
                    await _this.dmsDelete(objectIdv).then(function () {
                        _this.dmsPost(avatar2Content, MATNRNo + "vanning");
                        objectIdv = null;
                        avatar2Content = null;
                    })
                } else if (!objectIdv && avatar2Content) {
                    _this.dmsPost(avatar2Content, MATNRNo + "vanning");
                    avatar2Content = null;
                }

                this.getView().getModel("vanningDetail")
                let oModel = this.getView().getModel("vanningDetail").getData();
                console.log("URL: sUrl", "Method : POST", "Data to save:", oModel[0]);
            },
            onEditFitPart: async function () {

                await this.getDms();
                if (objectIdp && avatar1Content) {
                    await _this.dmsDelete(objectIdp).then(function () {
                        _this.dmsPost(avatar1Content, MATNRNo + "parts");
                        objectIdp = null;
                        avatar1Content = null;
                    })
                } else if (!objectIdp && avatar1Content) {
                    _this.dmsPost(avatar1Content, MATNRNo + "parts");
                    avatar1Content = null;
                }

                if (objectIdv && avatar2Content) {
                    await _this.dmsDelete(objectIdv).then(function () {
                        _this.dmsPost(avatar2Content, MATNRNo + "vanning");
                        objectIdv = null;
                        avatar2Content = null;
                    })
                } else if (!objectIdv && avatar2Content) {
                    _this.dmsPost(avatar2Content, MATNRNo + "vanning");
                    avatar2Content = null;
                }

                this.getView().getModel("vanningDetail")
                let oModel = this.getView().getModel("vanningDetail").getData();
                console.log("URL: sUrl", "Method : PATCH", "Data to Edit:", oModel[0]);
            },
            onSaveAirlift: function () {
                let iSelectedIndex = this.byId("airliftTable").getSelectedIndices();
                let aModel = this.getView().getModel("airliftModel").getData();
                if (iSelectedIndex.length === 0) {
                    modules.messageBox("error", "저장할 데이터를 선택해주세요");
                    return;
                }
                for (let i = 0; i < iSelectedIndex.length; i++) {
                    if (!aModel[iSelectedIndex[i]].packagingHow) {
                        modules.messageBox("error", "포장방법을 선택해주세요");
                        return;
                    }
                    if (!aModel[iSelectedIndex[i]].packagingDetail) {
                        modules.messageBox("error", "포장방법상세를 선택해주세요");
                        return;
                    }
                    if (!aModel[iSelectedIndex[i]].packagingQty) {
                        modules.messageBox("error", "중포장수를 입력해주세요");
                        return;
                    }
                    if (!aModel[iSelectedIndex[i]].calculationFormula) {
                        modules.messageBox("error", "공수산출식을 입력해주세요");
                        return;
                    }
                    if (!aModel[iSelectedIndex[i]].HeavyPackagingCount) {
                        modules.messageBox("error", "작업공수를 입력해주세요");
                        return;
                    }
                }
                for (let i = 0; i < iSelectedIndex.length; i++) {
                    let selectedIndex = iSelectedIndex[i];
                    let elementAtIndex = aModel[selectedIndex];

                    let oData = {
                        MATNR: elementAtIndex.MATNR,
                        size: elementAtIndex.size,
                        packagingType: elementAtIndex.packagingType,
                        calculationFormula: elementAtIndex.calculationFormula,
                        packagingHow: elementAtIndex.packagingHow,
                        packagingDetail: elementAtIndex.packagingDetail,
                        stuffingQty: elementAtIndex.stuffingQty,
                        packagingQty: elementAtIndex.packagingQty,
                        HeavyPackagingCount: elementAtIndex.HeavyPackagingCount
                    };
                    console.log("URL: sUrl", "Method : POST", "Data to save:", oData);
                }
            },
            onEditAirlift: function () {
                let iSelectedIndex = this.byId("airliftTable").getSelectedIndices();
                let aModel = this.getView().getModel("airliftModel").getData();

                if (iSelectedIndex.length === 0) {
                    modules.messageBox("error", "저장할 데이터를 선택해주세요");
                    return;
                }
                for (let i = 0; i < iSelectedIndex.length; i++) {
                    if (!aModel[iSelectedIndex[i]].packagingHow) {
                        modules.messageBox("error", "포장방법을 선택해주세요");
                        return;
                    }
                    if (!aModel[iSelectedIndex[i]].packagingDetail) {
                        modules.messageBox("error", "포장방법상세를 선택해주세요");
                        return;
                    }
                    if (!aModel[iSelectedIndex[i]].packagingQty) {
                        modules.messageBox("error", "중포장수를 입력해주세요");
                        return;
                    }
                }
                for (let i = 0; i < iSelectedIndex.length; i++) {
                    let selectedIndex = iSelectedIndex[i];
                    let elementAtIndex = aModel[selectedIndex];

                    let oData = {
                        MATNR: elementAtIndex.MATNR,
                        size: elementAtIndex.size,
                        packagingType: elementAtIndex.packagingType,
                        calculationFormula: elementAtIndex.calculationFormula,
                        packagingHow: elementAtIndex.packagingHow,
                        packagingDetail: elementAtIndex.packagingDetail,
                        stuffingQty: elementAtIndex.stuffingQty,
                        packagingQty: elementAtIndex.packagingQty,
                        HeavyPackagingCount: elementAtIndex.HeavyPackagingCount
                    };
                    console.log("URL: sUrl", "Method : PATCH", "Data to EDIT:", oData);
                }
            },
            onInputChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var nValue = parseFloat(oInput.getValue());
                if (nValue <= 0) {
                    oInput.setValue("");
                    modules.messageBox("error", "0보다 큰 값을 입력해야합니다.")
                    return;
                }
            },
            onSearchInput: function (oEvent) {
                let oObject = oEvent.getSource();
                modules.fieldCheck(oObject);
            },
        });
    });

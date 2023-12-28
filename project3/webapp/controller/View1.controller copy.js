sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "project2/model/modules",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/m/PDFViewer",
    "sap/base/security/URLWhitelist"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    
    function (Controller, modules, JSONModel, Filter, FilterOperator, Spreadsheet, PDFViewer, URLWhitelist) {
        "use strict";
        
        let _this, searchPlant;

        return Controller.extend("project2.controller.View1", {
            onInit: function () {
                const myRoute = this.getOwnerComponent().getRouter().getRoute("RouteView1");
                _this = this;
                
                var search = { search: false }
                this.getView().setModel(new JSONModel(search), "search");
                var link = { link: false }
                this.getView().setModel(new JSONModel(link), "link");
                myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
                },        
            onMyRoutePatternMatched: function() {
                let aModel = new JSONModel('../model/Airlift.json');
                let pModel = new JSONModel('../model/PackingSpec.json');
                let tModel = new JSONModel('../model/PackingType.json');
                this.getView().setModel(aModel, "airliftModel");
                this.getView().getModel("airliftModel");
                this.getView().setModel(pModel, "oDataModel");
                this.getView().getModel("oDataModel");
                this.getView().setModel(tModel, "packingTypeModel");
                this.getView().getModel("packingTypeModel");
                let oTemp = 
                {
                    MATNR: "2181025020",
                    material:"BRKT ASSY-ENGINE MTG",
                    Usage: "0",
                    stuffingQty: "10",
                    stuffingRate: "100",
                    surface: "N",
                    color: "N",
                    texture: "",
                    width: "10.00",
                    height: "10.00",
                    length: "10.00",
                    thickness: "10.00",
                    size:"102",
                    weight: "100.00",
                    ZNPERNR: "우찬웅",
                    phone: "010-2050-3040"
                };
                this.getView().setModel(new JSONModel([oTemp]), "vanningModel");     
            },
            onSearch: function () {
                this.getView().getModel("search").setProperty("/search", true)
                let oData = this.getView().getModel("oDataModel").getData();
                searchPlant = this.byId("Plant").getSelectedKey();
                let searchMATNR = this.byId("MATNR").getValue();  
                this.getView().setModel(new JSONModel([]), "searchModel");
                let oModel = this.getView().getModel("searchModel");
                let aFilteredData = oData.filter(function (item) {
                    return item.WERKS === searchPlant&&
                           item.MATNR === searchMATNR                       
                });
                console.log(aFilteredData)
                oModel.setData({ aFilteredData });
                console.log("또터드데이터",aFilteredData)
                _this.getView().setModel(new JSONModel(aFilteredData), "packingTableModel")
            },
            onLink: function (){
                this.getView().getModel("link").setProperty("/link", true)
                
                
                this.getView().getModel("vanningModel"); 
                console.log("응애",this.getView().getModel("vanningModel"));
            },
            onExcelDownload: async function () {
                let vanningModel = this.getView().getModel('vanningModel');
                let oData = vanningModel.getData();
                console.log('oData', oData);
       
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
                sheet.getCell('A1').alignment = { horizontal: 'center' }
                sheet.getCell('A2').value = '공장 : HK11 울산 CKD 공장';
                sheet.getCell('A3').value = '작성의뢰번호 : D005T20230300002';
                sheet.getCell('A4').value = '자재번호 : 217A0GI000';
                sheet.getCell('A5').value = '적용사양번호 : ';
       
                sheet.getRow(6).values = [
                   'No', '자재번호', '자재명', 'Usage', '적입률', '표면처리', '칼라', '재질', '가로', '세로', '높이', '두께',
                   '부품중량', '자재크기', '담당자', '전화번호', '생성일', '변경일'
                ];
       
       
                // sheet.addRow({'No':1, '자재번호':"2181025020", '자재명':"BRKT ASSY-ENGINE NTG", 'Usage':0});
       
                console.log('sheet', sheet);
       
                for (let i = 0; i < oData.length; i++) {
                   sheet.getRow(i + 7).values = [
                      i + 1, oData[i].MATNR, oData[i].material, oData[i].Usage, oData[i].stuffingRate, oData[i].surface, oData[i].color, oData[i].texture, oData[i].width, oData[i].length, oData[i].height, oData[i].thickness,
                      oData[i].weight, oData[i].size, oData[i].ZNPERNR, oData[i].phone, oData[i].createDate, oData[i].editDate
                   ]
                }      
       
                sheet.getRow(6).fill = {
                   type: "pattern",
                    pattern: "solid",
                   fgColor:{argb:'FF87CEEB'}
                };
       
                // ['A6','B6','C6','D6','E6','F6','G6','H6','I6','J6','K6','L6','M6','N6','O6','P6','Q6','R6','S6'].map(key => {
                //    sheet.getCell(key).fill = {               
                //       bgColor: { argb: '99CCCC' }
                //    };
                // });
       
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], {
                   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const url = window.URL.createObjectURL(blob); // blob으로 객체 URL 생성
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'VanningTest.xlsx';
                anchor.click(); // anchor를 다운로드 링크로 만들고 강제로 클릭 이벤트 발생
                window.URL.revokeObjectURL(url); // 메모리에서 해제
             },

            
                
        });
    });

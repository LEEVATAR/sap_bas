sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "project1/model/modules",
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
        let _this, searchVendor, searchPlant, searchMaterial, searchSelect, searchType, uploadButton, pressDetail, pdfButton
        return Controller.extend("project1.controller.View1", {
            onInit: function () {
                _this = this;

                let plant = [{ "plant": 'HVJ7' }, { "plant": 'HV11' }, { "plant": 'HK11' }];
                let plantModel = new JSONModel(plant);
                this.getView().setModel(plantModel, "plantModel");

                let vendor = [{ "vendor": 'PA21' }, { "vendor": 'D005' }, { "vendor": 'HCYU' }];
                let vendorModel = new JSONModel(vendor);
                this.getView().setModel(vendorModel, "vendorModel");

                let Material = [
                    { "material": '93480D2500' },
                    { "material": '93480I3500' },
                    { "material": '93495I3140' },
                    { "material": '93495I3240' },
                    { "material": '93495I3243' }
                ];
                let MaterialModel = new JSONModel(Material);
                this.getView().setModel(MaterialModel, "materialModel");
                let gate = [{ "gate": 'COMM' }];
                let gateModel = new JSONModel(gate);
                this.getView().setModel(gateModel, "gateModel");

                let oModel = new JSONModel("../model/model.json");

                this.getView().setModel(oModel, "oDataModel");
                this.byId("delivery").setSelected(true);
                this.byId("jit").setSelected(false);

                // console.log(oDataModel);
                console.log(oModel, "DATAMODEL");

                let oFinalModel = this.getView().getModel("oDataModel").getData();


                this.getView().setModel(new JSONModel([]), "boxLabelModel")

                console.log("겟", oFinalModel);//질문사항
                uploadButton = false;
                pressDetail = false;
                var save = { save: false }
                this.getView().setModel(new JSONModel(save), "save");
                pdfButton = false;
                //     const myRoute = this.getOwnerComponent().getRouter().getRoute("View1");
                //     myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);
                // },        
                // onMyRoutePatternMatched: function() {
                //     let ybs = this.getView().getModel("oDataModel").getData();//질문사항
                //     console.log(ybs,"으아");
                // },
            },
            onExecute: function () {
                this.getView().getModel("oDataModel").getData();//질문사항
                if (this.getView().getModel("save").getProperty("/save", true)) {
                    console.log("a");
                    modules.messageBox("error", "리프레시를 먼저 진행해주세요")
                    return;
                }
                modules.globalClear("Required2", this);
                // this.getView().getModel("save").setProperty("/save", false)

                let bCheck = modules.globalCheck("Required", this);
                if (!bCheck) {
                    modules.messageBox('warning', "Check Error Field.")
                    return;
                }
                modules.globalCheck("Required", _this)
                let oData = this.getView().getModel("oDataModel").getData();
                console.log(this.getView().getModel("oDataModel").getData());

                searchVendor = this.byId("Vendor").getValue();
                searchPlant = this.byId("Plant").getValue();
                searchMaterial = this.byId("Material").getValue();


                this.byId("jit").getSelected() == true ? searchSelect = 1 : searchSelect = 2;
                searchSelect === 1 ? searchType = "JIT Call" : searchType = "Delivery Schedule";
                this.getView().setModel(new JSONModel([]), "searchModel");
                this.getView().setModel(new JSONModel([]), "labelModel");

                let oModel = this.getView().getModel("searchModel");

                console.log(oData, "오데타");
                let aFilteredData = oData.filter(function (item) {
                    return item.Vendor === searchVendor &&
                        item.Plant === searchPlant &&
                        item.Material === searchMaterial &&
                        item.DeliveryType === searchType;
                });
                console.log(aFilteredData, "필터드데이타");
                oModel.setData({ aFilteredData });

                if (searchType === "JIT Call") {
                    this.byId("jitTable").setVisible(true);
                    this.byId("miBox").setVisible(false);
                    _this.getView().setModel(new JSONModel(aFilteredData), "jitModel")
                } else {
                    this.byId("jitTable").setVisible(false);
                    this.byId("miBox").setVisible(true);
                    _this.getView().setModel(new JSONModel(aFilteredData), "matInfoModel");
                }
                uploadButton = true;
            },
            onDetailPress: function (oEvent) {
                console.log(oEvent.getSource().oParent.oBindingContexts.matInfoModel.sPath)
                console.log(this.getView().getModel("matInfoModel").getData());
                // let oData = this.getView().getModel("matInfoModel").getData().;
                let sPath = oEvent.getSource().oParent.oBindingContexts.matInfoModel.sPath;
                console.log(sPath);
                let dData = this.getView().getModel("matInfoModel").getProperty(sPath).Detail
                let lData = this.getView().getModel("matInfoModel").getProperty(sPath).Label
                console.log("asdasd", dData, lData);
                this.getView().setModel(new JSONModel(dData), "dsiModel");

                let bModel = this.getView().getModel("boxLabelModel").getData();
                bModel = bModel.concat(lData);
                this.getView().getModel("boxLabelModel").setData(bModel);
                this.getView().setModel("boxLabelModel");
                console.log(this.getView().getModel("boxLabelModel"))
                // this.byId("fileUploader").setEnabled(true);
                pressDetail = true;
                if (pressDetail && uploadButton) {
                    this.byId("fileUploader").setEnabled(true);
                }

            },
            //엑셀로직
            onSample: async function () {
                let table = this.byId("materialTable");
                this.getView().setModel(new JSONModel([{ Material: '', DeliveryQty: '', BoxQty: '', BOXLabel: '' }]), "materialModel");
                console.log(this.getView().getModel("materialModel").getData(), "겟데이타")
                console.log(table)
                let excel_name = "Excel_supplier_Sample";
                let aProducts = [{
                    Material: '', DeliveryQty: '', BoxQty: '', BOXLabel: ''
                }];
                let aCols =
                    [
                        {
                            label: 'Material',
                            property: 'Material',
                            type: 'String'
                        },
                        {
                            label: 'Delivery Qty',
                            property: 'DeliveryQty',
                            type: 'Number'
                        },
                        {
                            label: 'Box Qty',
                            property: 'BoxQty',
                            type: 'Number'
                        },
                        {
                            label: 'Box Label',
                            property: 'BoxLabel',
                            type: 'String'
                        }
                    ];

                console.log(aCols);
                let oSettings = {
                    workbook: { columns: aCols },
                    fileName: excel_name + ".xlsx",
                    dataSource: aProducts
                };
                let oSheet = await new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
            excelUpload: function () {
                var oFileUploader = this.byId("fileUploader");
                var oModel = this.getView().getModel("matInfoModel");
                var bModel = this.getView().getModel("boxLabelModel");
                var file = oFileUploader.oFileUpload.files[0];

                var reader = new FileReader();
                reader.onload = function (e) {
                    let data = e.target.result;
                    let workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    let filteredData = [];

                    workbook.SheetNames.forEach(function (sheetName) {
                        var worksheet = workbook.Sheets[sheetName];
                        var jsonData = this.convertSheet(worksheet);

                        for (let i = 0; i < jsonData.length; i++) {
                            let newBoxLabel = jsonData[i].BoxLabel;
                            let boxLabelData = bModel.getData();

                            // 중복 라벨 체크
                            let isDuplicateLabel = boxLabelData.some(item => item.BoxLabel === newBoxLabel);

                            if (isDuplicateLabel) {
                                // 중복된 경우 MessageBox 표시 후 로직 중단
                                sap.m.MessageBox.error("중복된 박스 라벨 값이 존재합니다: " + newBoxLabel);
                                return; // 함수 실행 종료
                            }
                            if (jsonData[i].Material === searchMaterial) {
                                if (!filteredData[searchMaterial]) {
                                    filteredData[searchMaterial] = {
                                        Material: searchMaterial,
                                        BoxQty: 0,
                                        DeliveryQty: 0,

                                    };
                                }
                                filteredData[searchMaterial].BoxQty += jsonData[i].BoxQty;
                                filteredData[searchMaterial].DeliveryQty += jsonData[i].DeliveryQty;



                                boxLabelData.push({ BoxLabel: newBoxLabel });
                                bModel.refresh();
                            }
                        }
                    }.bind(this));

                    var aggregatedData = Object.values(filteredData);


                    var currentData = oModel.getData();

                    aggregatedData.forEach(function (newItem) {
                        var existingItem = currentData.find(item => item.Material === newItem.Material);
                        if (existingItem) {
                            existingItem.BoxQty += newItem.BoxQty;
                            existingItem.DeliveryQty += newItem.DeliveryQty;
                        } else {
                            currentData.push(newItem);
                        }
                    });
                    // 모델을 업데이트
                    oModel.setData(currentData);

                    // 테이블에 모델 바인딩
                    // var oTable = this.byId("materialInfoTable");
                    oTable.setModel(oModel, "matInfoModel");
                }.bind(this);

                reader.onerror = function (ex) {
                    console.error(ex);
                };
                reader.readAsBinaryString(file);
            },
            convertSheet: function (worksheet) {
                var headers = {};
                var data = [];
                var isFirstRow = true;
                for (var z in worksheet) {
                    if (z[0] === '!') continue;

                    var col = z.substring(0, 1);
                    var row = parseInt(z.substring(1));
                    var value = worksheet[z].v;

                    if (row === 1) {
                        var modifiedHeader = value.replace(/\s+/g, '');
                        headers[col] = modifiedHeader;
                        continue;
                    }

                    if (isFirstRow) {
                        if (row === 1) {
                            var modifiedHeader = value.replace(/\s+/g, '');
                            headers[col] = modifiedHeader;
                            continue;
                        } else {
                            isFirstRow = false;
                        }
                    }

                    if (!data[row - 2]) data[row - 2] = {};
                    data[row - 2][headers[col]] = value;
                }
                return data;
            },

            onSave: function () {
                let check = modules.globalCheck("Required2", this);
                if (!check) {
                    modules.messageBox('warning', "Check Error Field.")
                    return;
                }
                this.getView().getModel("save").setProperty("/save", true)

                let oData = {
                    "VendorGI": this.byId('VendorGI').getValue(),
                    "Gate": this.byId("Gate").getValue(),
                    "DepartureDate": this.byId("DepartureDate").getValue(),
                    "DepartureTime": this.byId("DepartureTime").getValue(),
                    "ArrivalDate": this.byId('ArrivalDate').getValue(),
                    "ArrivalTime": this.byId('ArrivalTime').getValue(),
                    "InvoiceNo": this.byId("InvoiceNo").getValue(),
                    "CarNo": this.byId("CarNo").getValue(),
                    "DriverName": this.byId("DriverName").getValue(),
                    "DriverPhone": this.byId("DriverPhone").getValue(),
                    "DTL": this.byId("DTL").getSelectedKey()
                }
                console.log("oData 저장예정", oData, "sURL");
                this.getView().setModel(new JSONModel(oData), "newModel");
                let currentTimeInSeconds = Math.floor(Date.now() / 1000);
                let asnNo = currentTimeInSeconds.toString()
                this.getView().getModel("newModel").setProperty("/ASNNo", asnNo);

                pdfButton = true;
                if (pdfButton && uploadButton) {
                    this.byId("pdf").setEnabled(true);
                }
            },
            //헤더
            //버튼동작 로직
            onSelectdelivery: function () {
                if (this.byId("delivery").getSelected() == false) {
                    this.byId("delivery").setSelected(true);
                }
                this.byId("jit").setSelected(false);
            },
            onSelectjit: function () {
                if (this.byId("jit").getSelected() == false) {
                    this.byId("jit").setSelected(true);
                }
                this.byId("delivery").setSelected(false);
            },
            onVendor: async function (oEvent) {
                let parameter = oEvent.getParameters();
                await modules.openDialog(_this, "project2.view.fragment.Vendor", "vendorDialog");
                console.log(oEvent);
            },
            onvendorSearch: function () {
                let searchText = this.byId("vendorSearch").getValue();
                let aFilters = new Filter({
                    filters: [
                        new Filter("vendor", FilterOperator.Contains, searchText),
                    ],
                    and: false,
                });

                this.byId("vendorTable").getBinding("items").filter(aFilters);
            },
            onVendorSave: function () {
                if (!this.byId("vendorTable").getSelectedItem()) {
                    modules.messageBox("error", "Vendor값을 선택해주세요");
                    return;
                }
                this.byId("Vendor").setValue(this.byId("vendorTable").getSelectedItem().mAggregations.cells[0].mProperties.text);
                this.inputChange();
                this.onVendorCancel();
            },
            onVendorCancel: function () {
                modules.closeDialog(this, "vendorDialog");
            },
            onPlant: async function (oEvent) {
                let parameter = oEvent.getParameters();
                await modules.openDialog(_this, "project2.view.fragment.Plant", "plantDialog");
            },
            onPlantSearch: function () {
                let searchText = this.byId("plantSearch").getValue();
                let aFilters = new Filter({
                    filters: [
                        new Filter("plant", FilterOperator.Contains, searchText),
                    ],
                    and: false,
                });

                this.byId("plantTable").getBinding("items").filter(aFilters);
            },
            onPlantSave: function () {
                if (!this.byId("plantTable").getSelectedItem()) {
                    modules.messageBox("error", "Plant값을 선택해주세요");
                    return;
                }
                this.byId("Plant").setValue(this.byId("plantTable").getSelectedItem().mAggregations.cells[0].mProperties.text);
                this.inputChange();
                this.onPlantCancel();
            },
            onPlantCancel: function () {
                modules.closeDialog(this, "plantDialog");
            },
            onMaterial: async function (oEvent) {
                let parameter = oEvent.getParameters();
                await modules.openDialog(_this, "project2.view.fragment.Material", "materialDialog");
            },
            onMaterialSearch: function () {
                let searchText = this.byId("materialSearch").getValue();
                let aFilters = new Filter({
                    filters: [
                        new Filter("material", FilterOperator.Contains, searchText),
                    ],
                    and: false,
                });
                this.byId("materialTable").getBinding("items").filter(aFilters);
            },
            onMaterialSave: function () {
                if (!this.byId("materialTable").getSelectedItem()) {
                    modules.messageBox("error", "Material값을 선택해주세요");
                    return;
                }
                this.byId("Material").setValue(this.byId("materialTable").getSelectedItem().mAggregations.cells[0].mProperties.text);
                this.inputChange();
                this.onMaterialCancel();
            },
            onMaterialCancel: function () {
                modules.closeDialog(this, "materialDialog");
            },
            //GI
            onVendorGI: async function (oEvent) {
                let parameter = oEvent.getParameters();
                await modules.openDialog(_this, "project2.view.fragment.VendorGI", "vendorGIDialog");
            },
            onVendorGISave: function () {
                if (!this.byId("vendorGITable").getSelectedItem()) {
                    modules.messageBox("error", "Vendor값을 선택해주세요");
                    return;
                }
                this.byId("VendorGI").setValue(this.byId("vendorGITable").getSelectedItem().mAggregations.cells[0].mProperties.text);
                if (this.byId("VendorGI").getValue() !== undefined && this.byId("VendorGI").getValue() !== '') {
                    this.byId("VendorGI").setValueState("None");
                }
                this.onVendorGICancel();
            },
            onVendorGICancel: function () {
                modules.closeDialog(this, "vendorGIDialog");
            },
            onvendorGISearch: function () {
                let searchText = this.byId("vendorGISearch").getValue();
                let aFilters = new Filter({
                    filters: [
                        new Filter("vendor", FilterOperator.Contains, searchText),
                    ],
                    and: false,
                });

                this.byId("vendorGITable").getBinding("items").filter(aFilters);
            },
            onGate: async function (oEvent) {
                let parameter = oEvent.getParameters();
                await modules.openDialog(_this, "project2.view.fragment.Gate", "gateDialog");
            },
            onGateSave: function () {
                if (!this.byId("gateTable").getSelectedItem()) {
                    modules.messageBox("error", "Gate값을 선택해주세요");
                    return;
                }
                this.byId("Gate").setValue(this.byId("gateTable").getSelectedItem().mAggregations.cells[0].mProperties.text);
                if (this.byId("Gate").getValue() !== undefined && this.byId("Gate").getValue() !== '') {
                    this.byId("Gate").setValueState("None");
                }
                this.onGateCancel();
            },
            onGateSearch: function () {
                let searchText = this.byId("gateSearch").getValue();
                let aFilters = new Filter({
                    filters: [
                        new Filter("gate", FilterOperator.Contains, searchText),
                    ],
                    and: false,
                });
                this.byId("gateTable").getBinding("items").filter(aFilters);
            },
            onGateCancel: function () {
                modules.closeDialog(this, "gateDialog");
            },
            onRefresh: function () {
                this.getView().setModel(new JSONModel([]), "matInfoModel");
                this.getView().setModel(new JSONModel([]), "jitModel");
                this.getView().setModel(new JSONModel([]), "boxLabelModel");
                this.getView().setModel(new JSONModel([]), "dsiModel");
                modules.globalClear("Required", this);

                this.byId("delivery").setSelected(true);
                this.byId("jit").setSelected(false);

                this.byId("jitTable").setVisible(false);
                this.byId("miBox").setVisible(true);
                //필드 초기화 함수
                modules.globalClear("Required2", this);

                uploadButton = false;
                pressDetail = false;
                this.byId("fileUploader").setEnabled(false);
                this.byId("pdf").setEnabled(false);
                _this.getView().getModel("save").setProperty("/save", false);
            },
            onHeaderRefresh: function () {
                modules.globalClear("Required", this);
            },
            inputChange: function () {
                if (this.byId("Material").getValue() !== undefined && this.byId("Material").getValue() !== '') {
                    this.byId("Material").setValueState("None");
                }
                if (this.byId("Plant").getValue() !== undefined && this.byId("Plant").getValue() !== '') {
                    this.byId("Plant").setValueState("None");
                }
                if (this.byId("Vendor").getValue() !== undefined && this.byId("Vendor").getValue() !== '') {
                    this.byId("Vendor").setValueState("None");
                }
            },
            onFieldChange: function (oEvent) {
                let object = oEvent.getSource();
                modules.fieldCheck(object);
            },
            dateChange: function (oEvent) {

                let object = oEvent.getSource();
                modules.fieldCheck(object);

                let DepartureDate = this.byId("DepartureDate").getValue();
                let ArrivalDate = this.byId("ArrivalDate").getValue();
                let DepartureTime = this.byId("DepartureTime").getValue();
                let ArrivalTime = this.byId("ArrivalTime").getValue();


                if (DepartureDate) {
                    this.byId('ArrivalDate').setMinDate(new Date(DepartureDate))
                }
                if (ArrivalDate) {
                    this.byId('DepartureDate').setMaxDate(new Date(ArrivalDate))
                }
                if (DepartureDate && ArrivalDate && DepartureTime && ArrivalTime && DepartureDate == ArrivalDate) {
                    if (this.byId("ArrivalTime").getDateValue() < this.byId("DepartureTime").getDateValue()) {
                        modules.messageBox('error', "출발시간은 도착시간보다 이전이어야합니다.");
                        this.byId("DepartureTime").setValueState('Error');
                        this.byId("ArrivalTime").setValueState('Error');
                    }
                }

            },
            timeChange: function (oEvent) {

                let object = oEvent.getSource();
                modules.fieldCheck(object);

                let DepartureDate = this.byId("DepartureDate").getValue();
                let ArrivalDate = this.byId("ArrivalDate").getValue();
                let DepartureTime = this.byId("DepartureTime").getValue();
                let ArrivalTime = this.byId("ArrivalTime").getValue();
                if (DepartureDate && ArrivalDate && DepartureTime && ArrivalTime && DepartureDate == ArrivalDate) {
                    if (this.byId("ArrivalTime").getDateValue() < this.byId("DepartureTime").getDateValue()) {
                        modules.messageBox('error', "출발시간은 도착시간보다 이전이어야합니다.");
                        this.byId("DepartureTime").setValueState('Error');
                        this.byId("ArrivalTime").setValueState('Error');
                    }
                }
            },
            //ADOBE 추출
            onPdf: function () {
                let iSelectedIndexM = this.byId("materialInfoTable").getSelectedIndices();
                let iSelectedIndexJ = this.byId("jitTable").getSelectedIndices();
                let selectedIndices, mModel, jModel;

                if (searchType === "JIT Call") {
                    jModel = this.getView().getModel("jitModel").getData();
                    selectedIndices = iSelectedIndexJ;
                    if (iSelectedIndexJ === -1) {
                        modules.messageBox('alert', 'pdf에 저장할 데이터를 선택해주세요');
                        return;
                    }
                } else { //matinfo
                    mModel = this.getView().getModel("matInfoModel").getData();
                    selectedIndices = iSelectedIndexM;
                    if (selectedIndices.length === 0) {
                        modules.messageBox('alert', 'pdf에 저장할 데이터를 선택해주세요');
                        return;
                    }
                }

                console.log(iSelectedIndexJ)

                var encoder = new TextEncoder();
                var testText = "TEEESSTT"
                let pModel = this.getView().getModel("newModel").getData();

                // mModel = this.getView().getModel("matInfoModel").getData();
                console.log("heythere", pModel, mModel);
                console.log("selected", selectedIndices);
                var tableRows = "";
                for (var i = 0; i < selectedIndices.length; i++) {
                    var selectedIndex = selectedIndices[i];
                    var rowData = (searchType === "JIT Call") ? jModel[selectedIndex] : mModel[selectedIndex];
                    tableRows += "<Row" + (i + 1) + ">" + // 행 번호는 i + 1로 시작
                        "<Cell1>" + "<![CDATA[" + (i + 1) + "]]>" + "</Cell1>" + // 유동적인 숫자 (행 번호)
                        "<Cell2>" + "<![CDATA[" + searchMaterial + "]]>" + "</Cell2>" +
                        "<Cell3>" + "<![CDATA[" + rowData.Description + "]]>" + "</Cell3>" +
                        "<Cell4>" + "<![CDATA[" + rowData.BoxQty + "]]>" + "</Cell4>" +
                        "<Cell5>" + "<![CDATA[" + rowData.DeliveryQty + "]]>" + "</Cell5>" +
                        "<Cell6>" + "<![CDATA[" + (rowData.BoxQty + rowData.DeliveryQty) + "]]>" + "</Cell6>" +
                        "<Cell7>" + "<![CDATA[" + pModel.Gate + "]]>" + "</Cell7>" +
                        // "<Cell8>" + "<![CDATA[]]>" + "</Cell8>" +
                        "</Row" + (i + 1) + ">";
                }

                var printd =
                    "<?xml version='1.0' encoding='UTF-8'?>" +
                    "<form1>" +
                    "<Table1>" +
                    "<HeaderRow/>" +
                    "<Row1>" +
                    "<Cell1>" + "<![CDATA[" + searchVendor + "]]>" + "</Cell1>" +
                    "<Cell2>" + "<![CDATA[" + pModel.VendorGI + "]]>" + "</Cell2>" +
                    "<Cell3>" + "<![CDATA[" + pModel.CarNo + "]]>" + "</Cell3>" +
                    "<Cell4>" + "<![CDATA[" + pModel.DTL + "]]>" + "</Cell4>" +
                    "<Cell5>" + "<![CDATA[" + pModel.DepartureDate + " / " + pModel.DepartureTime + "]]>" + "</Cell5>" +
                    "<Cell6>" + "<![CDATA[" + pModel.ArrivalDate + " / " + pModel.ArrivalTime + "]]>" + "</Cell6>" +
                    "</Row1>" +
                    "</Table1>" +
                    "<Table2>" +
                    "<HeaderRow/>" + //SEQ Part No Part Description BoxQty Number of Boxes Ship Quantity Gate Remark
                    tableRows +

                    "</Table2>" +

                    "<Code128BarCode1>" + "<![CDATA[" + pModel.DTL + pModel.ASNNo + pModel.VendorGI + "]]>" + "</Code128BarCode1>" +
                    "<Code128BarCode1>" + "<![CDATA[" + pModel.DTL + pModel.ASNNo + pModel.VendorGI + "]]>" + "</Code128BarCode1>" +
                    "</form1>"

                var data = encoder.encode(printd);
                var printdb64 = this.base64FromArrayBuffer(data);
                console.log(printdb64);

                var pdfcontent = {
                    "embedFont": 0,
                    "formLocale": "en_US",
                    "formType": "print",
                    "taggedPdf": 1,
                    "xdpTemplate": "lhs_HyundaiSupplierForm/lhs_HyundaiSupplierForm",
                    "xmlData": printdb64
                }
                $.ajax({
                    url: jQuery.sap.getModulePath("project2", "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=0"),
                    // url: "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=0",
                    // url: "https://adsrestapi-formsprocessing.cfapps.jp10.hana.ondemand.com/v1/adsRender/pdf?templateSource=storageName&TraceLevel=0",
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
        });
    });

jQuery.sap.require("okul.Application.Project.PprojectServicejs.ProjectOnLessonService");
jQuery.sap.require("okul.Servicejs.ActiveProjectService");
sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/Filter', "sap/ui/export/Spreadsheet", "sap/ui/model/Sorter"], function (Controller, Filter, Spreadsheet, Sorter) {
    "use strict";
    return Controller.extend("okul.Application.Dashboard.ProjectSelect.controller.ProjectSelect", {
        onInit: function () {
            var _this = this;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Dashboard/ProjectSelect").attachPatternMatched(_this.onBeforeShow, _this);
        },
        rightClick: function (oEvent) {
            var _this = this
            var sPath = oEvent.getSource()._getBindingContext().sPath
            var oIndex = parseInt(sPath.substring(sPath.lastIndexOf('/') + 1));
            if (oEvent.getSource().mProperties.text == "İlgili Projeler") {
                var param = "#/Lesson/LessonOnProject?LID=" + oModel.oData.oRows[oIndex].lid;
                _this.onGetLesson(param)
            } else if (oEvent.getSource().mProperties.text == "Dersi Görüntüle") {
                var param = "#/Lesson/LessonUd?LID=" + oModel.oData.oRows[oIndex].lid;
                _this.onGetLesson(param)
            }
            else if (oEvent.getSource().mProperties.text == "Dersi Sil") {
                sap.m.MessageBox.confirm("Bu Dersi  ve Bu Derse Bağlı Projeleri Silmek İstediğinize Emin Misiniz ?", {
                    title: "Kayıt Sil",
                    icon: sap.m.MessageBox.Icon.WARNING,
                    actions: ["Evet", "Hayır"],
                    onClose: function (oAction) {
                        if (oAction === "Evet") {
                            debugger
                            Servertime.getY().then(function (res) {
                                if (res != new Date().toLocaleDateString().split(".")[2]) {
                                    sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                                }
                                else {
                                    CreateComponent.showBusyIndicator(_this, "idlessonTable")

                                    LessonService.lessonReq({ SN: "Lesson", "MN": "DEL", where: "lid=?", allparam: [oModel.oData.oRows[oIndex].lid] }).then(function (res) {
                                        if (res == "SuccesDel") {
                                            sap.m.MessageToast.show("Ders Başarıyla Silindi")
                                            _this.allLesson();
                                            CreateComponent.hideBusyIndicator(_this, "idlessonTable")
                                        } else if (res == "None") {
                                            sap.m.MessageToast.show("Kayıt Silinirken Hata Gerçekleşti")
                                            CreateComponent.hideBusyIndicator(_this, "idlessonTable")
                                        }
                                    })
                                }
                            })
                        } else { CreateComponent.hideBusyIndicator(_this, "idlessonTable") }
                    }
                })
            }
        },
        onGetLesson: function (param) {
            window.open(param);
        },
        searchTable: function (oEvent) {
            var _this = this
            _this.aFilters = [];
            var sQuery = oEvent.getSource().getValue();;
            if (sQuery && sQuery.length > 2) {
                var lnm = new Filter("lnm", sap.ui.model.FilterOperator.Contains, sQuery);
                var lclass = new Filter("lclass", sap.ui.model.FilterOperator.Contains, sQuery);
                var lcntn = new Filter("lcntn", sap.ui.model.FilterOperator.Contains, sQuery);
                _this.aFilters = [lnm, lclass, lcntn]
                var finalFilter = new Filter({
                    filters: _this.aFilters,
                    and: false
                })
                var filterTable = this.byId("idlessonTable");
                var binding = filterTable.getBinding("rows");
                binding.filter(finalFilter, "Application");
            } else {
                var _this = this;
                _this.aFilters = [];
                var filterTable = this.byId("idlessonTable");
                var binding = filterTable.getBinding("rows");
                binding.filter(_this.aFilters, "Application");
            }
        },
        allLesson: function () {
            var _this = this
            Servertime.getY().then(function (res) {
                if (res != new Date().toLocaleDateString().split(".")[2]) {
                    sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                }
                else {
                    CreateComponent.showBusyIndicator();
                    var oTable2 = _this.getView().byId("idlessonTable")
                    LessonService.lessonReq({ MN: "GETWHERE", "SN": "Lesson", field: "lesson", where: "sid", allparam: [parseInt(oModel.oData.UserModel[0].sid)] }).then(function (res) {
                        if (res == "None") {
                            CreateComponent.hideBusyIndicator();
                        } else {
                            oModel.setProperty("/allLesson", res)
                            var oLength = oModel.oData.allLesson.length;
                            var oActual = oLength / 10;
                            var oCalculation = (oActual % 1 == 0);
                            if (oCalculation == true) {
                                var oValue = oActual;
                            } else {
                                var oValue = parseInt(oActual) + 1;
                            }
                            oModel.setProperty("/oRows", oModel.oData.allLesson.slice(0, 10));
                            oTable2.bindRows("/oRows");
                            if (sap.ui.getCore().byId('pa') != undefined) {
                                sap.ui.getCore().byId('pa').destroy();
                            }
                            var oPaginator = new sap.ui.commons.Paginator("pa", {
                                numberOfPages: oValue,
                                page: function (oEvent) {
                                    var oValue = oEvent;
                                    var oTargetPage = oEvent.getParameter("targetPage");
                                    var oTargetValue = oTargetPage * 10;
                                    var oSourceValue = oTargetValue - 10;
                                    var oModel = sap.ui.getCore().getModel();
                                    var oTotalData = oModel.getProperty("/allLesson");
                                    var oSelectedData = oTotalData.slice(oSourceValue, oTargetValue);
                                    oModel.setProperty("/oRows", oSelectedData);
                                    oTable2.clearSelection();
                                }
                            }).addStyleClass("paginatorStyle");
                            _this.getView().byId("page").addContent(oPaginator)
                            CreateComponent.hideBusyIndicator();
                        }
                    })
                }
            })
        },
        tablePagination: function () {
            var _this = this
            var oTable2 = _this.getView().byId("idactivesproject")
            var oLength = oModel.oData.allProject.length;
            var oActual = oLength / 10;
            var oCalculation = (oActual % 1 == 0);
            if (oCalculation == true) {
                var oValue = oActual;
            } else {
                var oValue = parseInt(oActual) + 1;
            }
            oModel.setProperty("/oRows", oModel.oData.allProject.slice(0, 10));
            oTable2.bindRows("/oRows");
            if (sap.ui.getCore().byId('pa') != undefined) {
                sap.ui.getCore().byId('pa').destroy();
            }
            var oPaginator = new sap.ui.commons.Paginator("pa", {
                numberOfPages: oValue,
                page: function (oEvent) {
                    var oValue = oEvent;
                    var oTargetPage = oEvent.getParameter("targetPage");
                    var oTargetValue = oTargetPage * 10;
                    var oSourceValue = oTargetValue - 10;
                    var oModel = sap.ui.getCore().getModel();
                    var oTotalData = oModel.getProperty("/allProject");
                    var oSelectedData = oTotalData.slice(oSourceValue, oTargetValue);
                    oModel.setProperty("/oRows", oSelectedData);
                    oTable2.clearSelection();
                }
            }).addStyleClass("paginatorStyle");
            _this.getView().byId("page").addContent(oPaginator)
        },
        getActiveProject: function () {
            var _this = this
            Servertime.getY().then(function (res) {
                if (res != new Date().toLocaleDateString().split(".")[2]) {
                    sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                }
                else {
                    CreateComponent.showBusyIndicator();
                    ActiveProject.ActiveProjReq({
                        SN: "ActiveProject",
                        MN: "GET"
                    }).then(function (res) {
                        if (res == "None") {
                            CreateComponent.hideBusyIndicator();
                            oModel.setProperty("/allProject", []);
                            _this.tablePagination();
                        } else if (res == "") {
                            CreateComponent.hideBusyIndicator();
                            sap.m.MessageToast.show("Sunucuda Hata Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin.")
                        } else {
                            // var filter = window.location.hash.split("?")[1].split("=")[1];
                            // if (filter.trim() != "") {
                            //     var data = {
                            //         "MN": "GETP",
                            //         where: "pjid=?",
                            //         param: filter,
                            //     }
                            //     Servertime.getY().then(function (res) {
                            //         if (res != new Date().toLocaleDateString().split(".")[2]) {
                            //             sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                            //         }
                            //         else {
                            //             ProjectonLesson.getLessonWhere(data).then(function (res) {
                            //                 if (res == "None") {
                            //                     oModel.setProperty("/ProjectOnLesson", [])
                            //                     CreateComponent.hideBusyIndicator();
                            //                 } else {
                            //                     oModel.setProperty("/ProjectOnLesson", res)
                            //                     CreateComponent.hideBusyIndicator();
                            //                 }
                            //             })
                            //         }
                            //     })
                            // } else {
                            //     sap.m.MessageToast.show("Hatalı Parametre")
                            // }
                            CreateComponent.hideBusyIndicator();
                            oModel.setProperty("/allProject", res)
                                      _this.tablePagination();

                            // debugger
                            // var arr = []
                            // res.filter(function (x) {
                            //     if (!arr.includes(x.pjid)) {
                            //         arr.push(x.pjid);
                            //     }
                            // })
                            // debugger
                            // var data = [];
                            // var groupedData = _.groupBy(res, 'pjid')
                            // for (let index = 0; index < arr.length; index++) {
                            //     for (let j = 0; j < groupedData[arr[index]].length; j++) {
                            //         if (groupedData[arr[index]].length == 1) {
                            //             data.push(groupedData[arr[index]]);
                            //         } else {
                            //             var result = "";
                            //             result +=  groupedData[arr[index]][j].lnm+",";
                            //             groupedData[arr[index]][0].lnm = result;
                            //             data.push(groupedData[arr[index]])
                            //             // data.push(groupedData[arr[0]])
                            //             // data.push(groupedData)
                            //         }
                            //     }
                            // }
                            debugger
                            // var data = [];
                            // var dataIndexResult = 0
                            // res.filter(function (x, index) {
                            //     if (!arr.includes(x.pjid)) {
                            //         dataIndexResult = 0
                            //         arr.push(x.pjid)
                            //         data.push(x)
                            //     } else {
                            //         dataIndexResult++;
                            //         var dataIndex = index - dataIndexResult;
                            //         data[dataIndex].lnm += "," + x.lnm;
                            //     }

                            // })
                            // oModel.setProperty("/allProject", data)
                            // _this.tablePagination();
                            // CreateComponent.hideBusyIndicator();
                        }
                    })
                }
            })
        },
        onBeforeShow: function (argument) {
            var _this = this;
            UseronLogin.onLogin().then(function (res) {
                // _this.allLesson();
                _this.getActiveProject();
            })
        },
    });
});

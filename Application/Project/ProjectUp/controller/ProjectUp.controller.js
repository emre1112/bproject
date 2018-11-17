jQuery.sap.require("okul.Application.Dashboard.LessonServicejs.LessonService");
jQuery.sap.require("okul.Application.Project.PprojectServicejs.ProjectOnLessonService");
sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/export/Spreadsheet", 'sap/ui/model/Filter'], function (Controller, Spreadsheet, Filter) {
    "use strict";
    return Controller.extend("okul.Application.Project.ProjectUp.controller.ProjectUp", {
        onInit: function () {
            var _this = this;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Project/ProjectUp").attachPatternMatched(_this.onBeforeShow, _this);
            oModel.setProperty("/enb", false);
        },
        setEnb: function () {
            if (oModel.oData.enb == true) {
                oModel.setProperty("/enb", false);
            } else { oModel.setProperty("/enb", true); }
        },
        onBeforeShow: function (argument) {
            var _this = this;
            UseronLogin.onLogin().then(function (res) {
                Servertime.getY().then(function (res) {
                    if (res != new Date().toLocaleDateString().split(".")[2]) {
                        sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                    }
                })
                LessonService.lessonReq({ MN: "GET", "SN": "Lesson" }).then(function (res) {
                    if (res == "None") {
                    } else {
                        oModel.setProperty("/allLesson", res)
                    }
                    _this.getProjectonLesson();
                })
                _this.getProject();
            })
        },
        getProjectonLesson: function () {
            var _this = this
            var filter = window.location.hash.split("?")[1].split("=")[1];
            if (filter.trim() != "") {
                var data = {
                    "MN": "GETP",
                    where: "pjid=?",
                    param: filter,
                    SN: "ProjectOnLesson"
                }
                var sD = [];
                var lm = _this.byId("lessonCombo");
                ProjectonLesson.ProjectonLessonReq(data).then(function (res) {
                    if (res == "None") {
                        oModel.setProperty("/Selected", [])
                        CreateComponent.hideBusyIndicator();
                    } else {
                        oModel.setProperty("/Selected", res)
                        res.forEach(element => {
                            sD.push(element.lid);
                        });
                        lm.setSelectedKeys(sD);
                        CreateComponent.hideBusyIndicator();
                    }
                })
            } else {
                sap.m.MessageToast.show("Hatalı Parametre")
            }
        },
        onLessonTransaction: function (oEvent) {
            var _this = this
            var newLes = [];
            var result = [];
            var dataIndex = [];
            var deldata = [];
            if (oModel.oData.selectedLess != undefined) {
                var boolresult = true;
                if (oModel.oData.selectedLess.length == oModel.oData.Selected.length) {
                    for (let index = 0; index < oModel.oData.selectedLess.length; index++) {
                        if (oModel.oData.selectedLess[index].mProperties.key == oModel.oData.Selected[index].lid) {
                            boolresult = true;
                        } else {
                            boolresult = false;
                            break;
                        }
                    }
                } else {
                    boolresult = false
                }
                if (boolresult == false) {
                    for (let index = 0; index < oModel.oData.selectedLess.length; index++) {
                        newLes.push({
                            lid: oModel.oData.selectedLess[index].mProperties.key
                        })
                    }
                    for (let index = 0; index < newLes.length; index++) {
                        var rd = _.where(oModel.oData.Selected, {
                            lid: newLes[index].lid
                        })
                        if (rd.length) {
                            result.push(rd);
                        } else {
                            dataIndex.push(index);
                        }
                    }
                    var less = []
                    if (result.length) {
                        var model = oModel.oData.Selected;
                        for (let j = 0; j < result.length; j++) {
                            for (let index = 0; index < model.length; index++) {
                                if (model[index].lid == result[j][0].lid) {
                                    model.splice(index, 1);
                                }
                            }
                        }
                        if (model.length) {
                            for (let index = 0; index < model.length; index++) {
                                deldata.push({
                                    lessondata: model[index].plid
                                })
                            }
                            var filter = {
                                SN: "ProjectOnLesson",
                                'MN': "DPL",
                                lessondata: deldata
                            }
                            _this.projetLD(filter).then(function (res) {
                                if (res) {
                                    _this.ProjectAPL(dataIndex)
                                }
                            })
                        } else {
                            _this.ProjectAPL(dataIndex)
                        }
                    } else {
                        for (let index = 0; index < oModel.oData.Selected.length; index++) {
                            less.push({
                                lessondata: oModel.oData.Selected[index].plid
                            })
                        }
                        var filter = {
                            SN: "ProjectOnLesson",
                            'MN': "DPL",
                            lessondata: less
                        }
                        _this.projetLD(filter).then(function (res) {
                            if (res) {
                                _this.ProjectAPL(dataIndex);
                            }
                        })
                    }
                }
                else {
                    _this.updateProject();
                }
            }

        },
        ProjectAPL: function (param) {
            var _this = this
            if (param.length > 0) {
                var less = []
                var filter = window.location.hash.split("?")[1].split("=")[1];
                if (filter.trim() != "") {
                    for (let index = 0; index < param.length; index++) {
                        less.push({
                            lessondata: oModel.oData.selectedLess[param[index]].mProperties.key
                        })
                    }
                    var alldata = {
                        MN: 'APL',
                        SN: "ProjectOnLesson",
                        pjid: filter,
                        lessondata: less
                    }
                    ProjectonLesson.ProjectonLessonReq(alldata).then(function (res) {
                        if (res == "SuccesAdd") {
                            _this.updateProject();
                        } else if (res == "None") {
                            sap.m.MessageToast.show("Beklenmedik Hata")
                        } else {
                            sap.m.MessageToast.show("Sunucuda Hata Meydana Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin ")
                        }
                    })
                }
            }
        },
        projetLD: function (param) {
            var deferred = new Promise(function (resolve, reject) {
                ProjectonLesson.ProjectonLessonReq(param).then(function (res) {
                    if (res == "SuccesDel") {
                        resolve(true);
                    } else if (res == "None") {
                        sap.m.MessageToast.show("Beklenmedik Hata");
                    } else {
                        sap.m.MessageToast.show("Sunucuda Hata Meydana Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin")
                    }
                })
            })
            return deferred
        },
        handleSelectionFinish: function (oEvent) {
            oModel.setProperty("/selectedLess", oEvent.getParameter("selectedItems"));
        },
        updateProject: function () {
            var _this = this
            var filterU = window.location.hash.split("?")[1].split("=")[1];
            var filter = {}
            filter.SN = "Project",
                filter.MN = "SET",
                filter.wparam = filterU,
                filter.operation = "IN",
                filter.wset = "pjnm=?,pjtechnology=?,pjcntn=?  ",
                filter.wsetparam = [
                    oModel.oData.projectUp[0].pjnm.toUpperCase(),
                    oModel.oData.projectUp[0].pjtechnology.toUpperCase(),
                    oModel.oData.projectUp[0].pjcntn.toUpperCase(),
                ]
            filter.setfield = "pjid"
            ProjectonLesson.ProjectonLessonReq(filter).then(function (res) {
                if (res == "SuccedUpdate") {
                    sap.m.MessageToast.show("Kayıt Güncellendi");
                    oModel.setProperty("/enb", false);
                    _this.getProject();
                } else if (res == "") {
                    sap.m.MessageToast.show("Sunucuda Hata Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin.")
                } else {
                    sap.m.MessageToast.show("Kayıt Güncellenirken Hata Oluştu");
                }
            })
        },
        getProject: function () {
            var _this = this
            CreateComponent.showBusyIndicator();
            var filter = window.location.hash.split("?")[1].split("=")[1];
            if (filter.trim() != "") {
                ProjectonLesson.ProjectonLessonReq({
                    MN: "GETWHERE",
                    SN: "Project",
                    where: "pjid=?",
                    allparam: [filter]
                }).then(function (res) {
                    if (res == "None") {
                        sap.m.MessageToast.show("Beklenmeye Hata");
                        CreateComponent.hideBusyIndicator();
                    }
                    else {
                        oModel.setProperty("/projectUp", res)
                        CreateComponent.hideBusyIndicator();
                    }
                })
            } else {
                sap.m.MessageToast.show("Hatalı Parametre")
            }
        },

    });
});

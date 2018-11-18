
jQuery.sap.require("okul.Servicejs.ActiveProjectService");
jQuery.sap.require("okul.Servicejs.ProjectService");
sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/Filter', "sap/ui/export/Spreadsheet", "sap/ui/model/Sorter"], function (Controller, Filter, Spreadsheet, Sorter) {
    "use strict";
    return Controller.extend("okul.Application.Dashboard.AllProjects.controller.AllProjects", {
        onInit: function () {
            var _this = this;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Dashboard/AllProjects").attachPatternMatched(_this.onBeforeShow, _this);
        },
        rightClick: function (oEvent) {
            var _this = this
            var sPath = oEvent.getSource()._getBindingContext().sPath
            var oIndex = parseInt(sPath.substring(sPath.lastIndexOf('/') + 1));

            if (oEvent.getSource().mProperties.text == "İlgili Dersler") {
                _this.ProjectOnLesson("#/Project/ProjectOnLesson?PJID=" + oModel.oData.oRows[oIndex].pjid);
            } else if (oEvent.getSource().mProperties.text == "Proje Bilgisi") {
                _this.ProjectOnLesson("#/Project/ProjectUp?PJID=" + oModel.oData.oRows[oIndex].pjid);
            } else if (oEvent.getSource().mProperties.text == "Projeyi Sil") {
                _this.delProject(oModel.oData.oRows[oIndex].pjid);
            }
        },
        delProject: function (param) {
            var _this = this
            sap.m.MessageBox.confirm("Bu Projeyi  Silmek İstediğinize Emin Misiniz ?", {
                title: "Kayıt Sil",
                icon: sap.m.MessageBox.Icon.WARNING,
                actions: ["Evet", "Hayır"],
                onClose: function (oAction) {
                    if (oAction === "Evet") {
                        CreateComponent.showBusyIndicator()
                        Servertime.getY().then(function (res) {
                            if (res != new Date().toLocaleDateString().split(".")[2]) {
                                sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                            }
                            else {
                                ProjectService.ProjectReq({ SN: "Project", where: "pjid=?", "MN": "DEL", pjid: param }).then(function (res) {
                                    if (res == "SuccesDel") {
                                        sap.m.MessageToast.show("Proje Başarıyla Silindi")
                                        CreateComponent.hideBusyIndicator()
                                        _this.getFilter();
                                    } else if (res == "None") {
                                        sap.m.MessageToast.show("Proje Silinirken Hata Gerçekleşti")
                                        CreateComponent.hideBusyIndicator()
                                    }
                                })
                            }
                        })
                    } else { CreateComponent.hideBusyIndicator() }
                }
            })
        },
        onChangeProject: function (oEvent) {
            var _this = this
            if (_this.byId("segmented").getSelectedKey() == "All") {
                _this.byId("pl").setVisible(true)
                _this.byId("apper").setVisible(false);
                _this.byId("pb").setVisible(false)
                _this.byId("pd").setVisible(false)
                _this.byId("fid").setSelectedKey("All")
            } else if (_this.byId("segmented").getSelectedKey() == "Me") {
                _this.byId("pl").setVisible(true)
                _this.byId("pb").setVisible(true)
                _this.byId("pd").setVisible(true)
                _this.byId("apper").setVisible(false);
                _this.byId("fid").setSelectedKey("All")
            } else {
                _this.byId("pl").setVisible(false)
                _this.byId("apper").setVisible(true);
                _this.byId("fid").setVisible(false)
                _this.byId("fid").setSelectedKey("All")
                // _this.byId("pb").setVisible(false)
                // _this.byId("pd").setVisible(false)
                // Active
            }
            _this.getFilter();
        },
        onBeforeShow: function (argument) {
            var _this = this;
            UseronLogin.onLogin().then(function (res) {
                _this.getFilter();
            })
        },
        getFilter: function () {
            var _this = this
            debugger
            var filterdata = {};
            if (_this.byId("segmented").getSelectedKey() == "All") {
                if (_this.byId("fid").getSelectedKey() == "Active") {
                    filterdata.SN = "ActiveProject"
                    filterdata.MN = "GET"
                    _this.getActiveProject(filterdata)
                } else if (_this.byId("fid").getSelectedKey() == "DeActive") {
                    _this.getDeactive("GET").then(function (res) {
                        filterdata.MN = "GETWHERE";
                        filterdata.SN = "Project";
                        filterdata.allparam = [" "];
                        filterdata.where = "pjid NOT IN (" + res + ")";
                        _this.getProject(_this.byId("segmented").getSelectedKey(), filterdata)
                    })
                } else {
                    filterdata.SN = "Project";
                    filterdata.MN = "GET";
                    _this.getProject(_this.byId("segmented").getSelectedKey(), filterdata)
                }
            } else if (_this.byId("segmented").getSelectedKey() == "Me") {
                if (_this.byId("fid").getSelectedKey() == "Active") {
                    filterdata.SN = "ActiveProject";
                    filterdata.MN = "GETWHERE";
                    filterdata.where = "uid=?";
                    filterdata.allparam = [oModel.oData.UserModel[0].uid];
                    _this.getActiveProject(filterdata)
                } else if (_this.byId("fid").getSelectedKey() == "DeActive") {
                    _this.getDeactive("GETWHERE", "uid=?", [oModel.oData.UserModel[0].uid]).then(function (res) {
                        filterdata.MN = "GETWHERE";
                        filterdata.SN = "Project";
                        filterdata.allparam = [oModel.oData.UserModel[0].uid];
                        filterdata.where = "uid=? AND pjid NOT IN (" + res + ")";
                        _this.getProject(_this.byId("segmented").getSelectedKey(), filterdata)
                    })
                } else {
                    filterdata.SN = "Project";
                    filterdata.MN = "GETWHERE";
                    filterdata.where = "uid=?";
                    filterdata.allparam = [oModel.oData.UserModel[0].uid]
                    _this.getProject(_this.byId("segmented").getSelectedKey(), filterdata)
                }
            }
            else {
                filterdata.SN = "ActiveProject"
                filterdata.MN = "GET"
                _this.getActiveProject(filterdata)
            }
        },
        getDeactive: function (mn, where, allparam) {
            var deferred = new Promise(function (resolve, reject) {
                var notIn = "";
                var json = {};
                if (where && allparam) {
                    json.SN = "ActiveProject"
                    json.MN = mn
                    json.where = where
                    json.allparam = allparam
                } else {
                    json.SN = "ActiveProject"
                    json.MN = mn
                }
                ActiveProject.ActiveProjReq(json).then(function (res) {
                    if (res == "None") {
                        oModel.setProperty("/active", []);
                    } else if (res == "") {
                        sap.m.MessageToast.show("Sunucuda Hata Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin.")
                    } else {
                        for (let index = 0; index < res.length; index++) {
                            if (index != res.length - 1) {
                                notIn += "'" + res[index].pjid + "'" + ",";
                            } else {
                                notIn += "'" + res[index].pjid + "'"
                            }
                        }
                        resolve(notIn);
                    }
                })
            })
            return deferred
        },
        ColumnConfig: function (oEvent) {
            var _this = this
            if (_this.byId("segmented").getSelectedKey() == "All") {
                return [
                    {
                        label: 'Proje Id',
                        property: 'pjid',
                    },
                    {
                        label: 'Proje Öneri Sahibi',
                        property: 'ufnm'
                    },
                    {
                        label: 'Proje Adı',
                        property: 'pjnm'
                    },
                    {
                        label: 'Proje İçeriği',
                        property: 'pjcntn',
                        width: '25'
                    },
                    {
                        label: 'Proje Teknolojileri',
                        property: 'pjtechnology',
                        width: '25'
                    },
                    {
                        label: 'Proje Dönemi',
                        property: 'pjperiod',
                        width: '25'
                    },
                ];
            } else {
                return [
                    {
                        label: 'Proje Id',
                        property: 'pjid',
                    },
                    {
                        label: 'Proje Adı',
                        property: 'pjnm'
                    },
                    {
                        label: 'Proje İçeriği',
                        property: 'pjcntn',
                        width: '25'
                    },
                    {
                        label: 'Proje Teknolojileri',
                        property: 'pjtechnology',
                        width: '25'
                    },
                    {
                        label: 'Proje Dönemi',
                        property: 'pjperiod',
                        width: '25'
                    },
                ];
            }

        },
        onExport: function () {
            var aCols, aProducts, oSettings;
            aCols = this.ColumnConfig();
            var _this = this
            aProducts = this.getView().getModel().getProperty("/allProject");
            var fileName = "";
            if (_this.byId("segmented").getSelectedKey() == "All") {
                fileName = "Tüm Projeler"
            } else {
                fileName = "Benim Projelerim"
            }
            oSettings = {
                workbook: { columns: aCols },
                dataSource: aProducts,
                fileName: fileName
            };
            new Spreadsheet(oSettings)
                .build()
                .then(function () {
                    new sap.m.MessageToast.show("Excel Başarı İle Aktarıldı");
                });
        },
        onSearch: function (oEvent) {
            var _this = this
            _this.aFilters = [];
            var sQuery = oEvent.getSource().getValue();;
            if (sQuery && sQuery.length > 2) {
                var pjnm = new Filter("pjnm", sap.ui.model.FilterOperator.Contains, sQuery);
                var pjtechnology = new Filter("pjtechnology", sap.ui.model.FilterOperator.Contains, sQuery);
                var ufnm = new Filter("ufnm", sap.ui.model.FilterOperator.Contains, sQuery);
                _this.aFilters = [pjnm, pjtechnology, ufnm]
                var finalFilter = new Filter({
                    filters: _this.aFilters,
                    and: false
                })
                var filterTable = this.byId("idprojectAll");
                var binding = filterTable.getBinding("rows");
                binding.filter(finalFilter, "Application");
            } else {
                var _this = this;
                _this.aFilters = [];
                var filterTable = this.byId("idprojectAll");
                var binding = filterTable.getBinding("rows");
                binding.filter(_this.aFilters, "Application");
            }
        },
        setProject: function (filter) {
            var _this = this
            ProjectService.ProjectReq(filter).then(function (res) {
                if (res == "SuccedUpdate") {
                    sap.m.MessageToast.show("Kayıt Güncellendi");
                    _this.byId("idprojectAll").setSelectedIndex(-1)
                    _this.getFilter();
                } else if (res == "") {
                    sap.m.MessageToast.show("Sunucuda Hata Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin.")
                } else {
                    sap.m.MessageToast.show("Kayıt Güncellenirken Hata Oluştu");
                }
            })
        },
        AcceptProject: function (oEvent) {
            var _this = this
            var Table = this.byId("idprojectAll");
            var pjdata = [];
            if (this.byId("idprojectAll").getSelectedIndices().length > 0) {
                var filter = {
                    SN: "",
                    MN: "",
                    pjdata: ""
                }
                var selected = Table.getSelectedIndices();
                if (oEvent.getSource().mProperties.text == "Seçilileri Onayla") {
                    for (let index = 0; index < Table.getSelectedIndices().length; index++) {
                        var spath = this.byId("idprojectAll").getRows()[selected[index]]._getBindingContext().sPath
                        pjdata.push({
                            pjid: oModel.getProperty(spath).pjid,
                            uid: 0,
                            uflag: "",
                            apperiod: new Date().toLocaleDateString().split(".")[2]
                        })
                    }
                    ActiveProject.ActiveProjReq({ MN: "GET", SN: "ActiveProject" }).then(function (res) {
                        for (let j = 0; j < res.length; j++) {
                            for (let index = 0; index < pjdata.length; index++) {
                                if (pjdata[index].pjid == res[j].pjid) {
                                    pjdata.splice(index, 1);
                                }
                            }
                        }
                        if (pjdata.length > 0) {
                            filter.SN = "ActiveProject"
                            filter.pjdata = pjdata
                            filter.MN = "ADD"
                            _this.addActiveProject(filter)
                        } else {
                            sap.m.MessageToast.show("Bu Projeler Zaten Onaylandı")
                        }
                    })

                }
                else if (oEvent.getSource().mProperties.text == "Seçilileri Onaydan Kaldır") {
                    var deldata = [];
                    for (let index = 0; index < Table.getSelectedIndices().length; index++) {
                        var spath = this.byId("idprojectAll").getRows()[selected[index]]._getBindingContext().sPath
                        deldata.push({
                            pjid: oModel.getProperty(spath).pjid
                        })
                    }
                    CreateComponent.showBusyIndicator();
                    _this.dellActiveProject(deldata);
                }
            }
            else {
                sap.m.MessageToast.show("Seçili Kayıt Bulunamadı")
            }
        },
        dellActiveProject: function (deldata) {
            var _this = this
            ActiveProject.ActiveProjReq({ SN: "ActiveProject", MN: "DEL", deldata: deldata }).then(function (res) {
                if (res == "SuccesDel") {
                    _this.getFilter();
                    sap.m.MessageToast.show("İşlem Tamamlandı Projeler Kaldırıldı ")
                    _this.byId("idprojectAll").setSelectedIndex(-1)
                    CreateComponent.hideBusyIndicator();
                } else if (res == "None") {
                    CreateComponent.hideBusyIndicator();
                    sap.m.MessageToast.show("Bir Hatayla Karşılaşıldı Lütfen Daha Sonra Tekrar Deneyiniz. ")
                } else {
                    CreateComponent.hideBusyIndicator();
                    sap.m.MessageToast.show("Sunucuda Hata Meydana Gerçekleşti Daha Sonra Tekrar Deneyin")
                }
            })
        },
        addActiveProject: function (filter) {
            var _this = this
            CreateComponent.showBusyIndicator();
            ActiveProject.ActiveProjReq(filter).then(function (res) {
                if (res == "None") {
                    sap.m.MessageToast.show("Kayıt Eklenirken Hata Gerçekleşti ");
                    CreateComponent.showBusyIndicator();
                } else if (res == "") {
                    CreateComponent.hideBusyIndicator();
                    sap.m.MessageToast.show("Sunucuda Hata Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin.")
                } else {
                    _this.getFilter();
                    CreateComponent.hideBusyIndicator();
                    _this.byId("idprojectAll").setSelectedIndex(-1)
                    sap.m.MessageToast.show("İşlem Onaylandı")
                }
            })
        },
        changeFilter: function () {
            this.getFilter();
        },
        onRefreshData: function () {
            var _this = this;
            _this.byId("fid").setSelectedKey("All")
            _this.getFilter();
        },
        changePaginator: function (oEvent) {
            var _this = this
            CreateComponent.tablaPaginator(_this, 'idprojectAll', "allProject", 'page', parseInt(oEvent.getSource().getSelectedKey()));
        },
        ProjectOnLesson: function (param) {
            window.open(param);
        },
        getProject: function (param, filter) {
            debugger
            var _this = this
            Servertime.getY().then(function (res) {
                if (res != new Date().toLocaleDateString().split(".")[2]) {
                    sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                }
                else {
                    CreateComponent.showBusyIndicator();
                    if (param == "All") {
                        ProjectService.ProjectReq(filter).then(function (res) {
                            if (res == "None") {
                                CreateComponent.hideBusyIndicator();
                                oModel.setProperty("/allProject", [])
                                oModel.setProperty("/oRows", []);

                            } else if (res == "") {
                                CreateComponent.hideBusyIndicator();
                                oModel.setProperty("/allProject", [])
                                oModel.setProperty("/oRows", []);
                                sap.m.MessageToast.show("Sunucuda Hata Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin.")
                            } else {
                                _this.byId("apper").setVisible(false);
                                _this.byId("fid").setVisible(true)
                                _this.byId("meHeader").setVisible(false);
                                _this.byId("Meid").setVisible(true)
                                _this.byId("idprojectAll").setSelectionMode(sap.ui.table.SelectionMode.None);
                                oModel.setProperty("/allProject", res)
                                CreateComponent.tablaPaginator(_this,'idprojectAll',"allProject","page",parseInt(_this.byId("rid").getSelectedKey()))
                            
                            }
                            CreateComponent.hideBusyIndicator();
                        })
                    } else {
                        ProjectService.ProjectReq(filter).then(function (res) {
                            if (res == "None") {
                                CreateComponent.hideBusyIndicator();
                                oModel.setProperty("/allProject", [])
                                oModel.setProperty("/oRows", []);
                            } else if (res == "") {
                                CreateComponent.hideBusyIndicator();
                                oModel.setProperty("/allProject", [])
                                oModel.setProperty("/oRows", []);
                                sap.m.MessageToast.show("Sunucuda Hata Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin.")
                            }
                            else {
                                _this.byId("apper").setVisible(false);
                                _this.byId("fid").setVisible(true)
                                _this.byId("meHeader").setVisible(true);
                                _this.byId("Meid").setVisible(false)
                                _this.byId("idprojectAll").setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
                                oModel.setProperty("/allProject", res)
                                CreateComponent.tablaPaginator(_this,'idprojectAll',"allProject","page",parseInt(_this.byId("rid").getSelectedKey()))
                            }
                            CreateComponent.hideBusyIndicator();
                        })
                    }
                }
            })
        },
        getActiveProject: function (filter) {
            var _this = this
            Servertime.getY().then(function (res) {
                if (res != new Date().toLocaleDateString().split(".")[2]) {
                    sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                }
                else {
                    CreateComponent.showBusyIndicator();
                    ActiveProject.ActiveProjReq(filter).then(function (res) {
                        if (res == "None") {
                            CreateComponent.hideBusyIndicator();
                            oModel.setProperty("/allProject", []);
                            oModel.setProperty("/oRows", []);
                        } else if (res == "") {
                            CreateComponent.hideBusyIndicator();
                            oModel.setProperty("/allProject", []);
                            sap.m.MessageToast.show("Sunucuda Hata Gerçekleşti Lütfen Daha Sonra Tekrar Deneyin.")
                        } else {
                       if(_this.byId("segmented").getSelectedKey() == "Me"){
                        _this.byId("meHeader").setVisible(true);
                        _this.byId("idprojectAll").setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);

                            }else{
                            _this.byId("idprojectAll").setSelectionMode(sap.ui.table.SelectionMode.None);
                            _this.byId("meHeader").setVisible(false);
                            }     
                            oModel.setProperty("/allProject", res)
                            CreateComponent.tablaPaginator(_this,'idprojectAll',"allProject","page",parseInt(_this.byId("rid").getSelectedKey()))
                            CreateComponent.hideBusyIndicator();
                        }
                    })
                }
            })
        }

    });
});
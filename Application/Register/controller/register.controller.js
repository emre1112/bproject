jQuery.sap.require("okul.Application.Register.RegisterServicejs.RegisterService");
jQuery.sap.require("okul.Servicejs.MailService");
jQuery.sap.require("okul.Application.Dashboard.SectionServicejs.SectionService");
jQuery.sap.require("okul.Servicejs.UserService");
sap.ui.define(['sap/m/MessageBox', 'sap/ui/core/mvc/Controller'], function (MessageBox, Controller) {
    "use strict";
    var PageController = Controller.extend("okul.Application.Register.controller.Register", {
        onInit: function () {
            var _this = this;
            _this.getView().setModel(oModel);
            var filter = {
                MN: "GET",
                "SN": "Sections",
            }
            SectionService.SectionReq(filter).then(function (res) {
                if (res != "None") {
                    oModel.setProperty("/section", res)
                }
            })
            Servertime.getY().then(function (res) {
                if (res != new Date().toLocaleDateString().split(".")[2]) {
                    sap.m.MessageToast.show("Lütfen Bilgisayarınızın Tarih Ve Saatini Güncelleyiniz.")
                }
            })
            var RegisterData = {
                ogrno: "",
                tcno: "",
                email: "",
                ad: "",
                soyad: "",
                tel: ""
            }
            oModel.setProperty("/RegisterModel", RegisterData)
        },
        validateEmail: function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        checktc: function (value) {
            value = value.toString();
            var isEleven = /^[0-9]{11}$/.test(value);
            var totalX = 0;
            for (var i = 0; i < 10; i++) {
                totalX += Number(value.substr(i, 1));
            }
            var isRuleX = totalX % 10 == value.substr(10, 1);
            var totalY1 = 0;
            var totalY2 = 0;
            for (var i = 0; i < 10; i += 2) {
                totalY1 += Number(value.substr(i, 1));
            }
            for (var i = 1; i < 10; i += 2) {
                totalY2 += Number(value.substr(i, 1));
            }
            var isRuleY = ((totalY1 * 7) - totalY2) % 10 == value.substr(9, 0);
            return isEleven && isRuleX && isRuleY;
        },
        validateData: function () {
            var _this = this
            var result = false
            if (!_this.validateEmail(oModel.oData.RegisterModel.email)) {
                sap.m.MessageToast.show("Email Adresi Geçersiz");
            } else
                if (!oModel.oData.RegisterModel.ogrno.length || oModel.oData.RegisterModel.ogrno.split("_")[0].length != 10) {
                    sap.m.MessageToast.show("Öğrenci Numarası Geçersiz");
                } else
                    if (!_this.checktc(oModel.oData.RegisterModel.tcno)) {
                        sap.m.MessageToast.show("TC Numarası Geçersiz");
                    } else
                        if (!oModel.oData.RegisterModel.ad.length || oModel.oData.RegisterModel.ad < 3 || oModel.oData.RegisterModel.ad.trim() == " ") {
                            sap.m.MessageToast.show("Ad alanı Geçersiz");
                        } else
                            if (!oModel.oData.RegisterModel.soyad.length || oModel.oData.RegisterModel.soyad < 2 || oModel.oData.RegisterModel.soyad.trim() == " ") {
                                sap.m.MessageToast.show("Soyad alanı Geçersiz");
                            } else if (!oModel.oData.RegisterModel.tel.length || oModel.oData.RegisterModel.tel.split("_")[0].length != 11) {
                                sap.m.MessageToast.show("Telefon Numarası Alanı Geçersiz")
                            } else if (_this.byId("sections").getSelectedKey() == "" || _this.byId("sections").getSelectedKey() == undefined) {
                                sap.m.MessageToast.show("Bölüm Seçimi Yapınız")
                            } else {
                                result = true
                            }
            return result;
        },
        getAllRegister: function () {
            var _this = this
            RegisterService.RegisterReq({ "MN": "GETAR", SN: "Register", "rtsno": parseInt(oModel.oData.RegisterModel.ogrno), "rttcno": oModel.oData.RegisterModel.tcno }).then(function (res) {
                if (res == "None") {
                    var data = {
                        SN: "User",
                        MN: "GAUW",
                        uwhere: "unm=?",
                        uparam: oModel.oData.RegisterModel.ogrno,
                        mwhere: "mail=?",
                        mparam: oModel.oData.RegisterModel.email,
                        pwhere: "pnmbr=?",
                        pparam: oModel.oData.RegisterModel.tel.length
                    }
                    UserServices.UserReq(data).then(function (res) {
                        if (res[0].Status == "haveUNM") {
                            sap.m.MessageToast.show("Bu Kullanıcı Adı Mevcut")
                        } else if (res[0].Status == "haveM") {
                            sap.m.MessageToast.show("Bu Email Adresi  Mevcut")
                        } else if (res[0].Status == "haveP") {
                            sap.m.MessageToast.show("Bu Telefon Numarası  Mevcut")
                        } else {
                            _this.onRegister();
                        }
                    })
                } else {
                    sap.m.MessageToast.show("Öğreni Numarası Veya Tc Kimlik No Geçersiz")
                }
            })
        },
        onRegister: function () {
            CreateComponent.showBusyIndicator();
            var _this = this
            if (!_this.validateData()) {
                CreateComponent.hideBusyIndicator();
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(_this);
                oModel.oData.RegisterModel.MN = "ADD";
                oModel.oData.RegisterModel.SN = "Register"
                oModel.oData.RegisterModel.sid = _this.byId("sections").getSelectedKey();
                oModel.oData.RegisterModel.ogrno = parseInt(oModel.oData.RegisterModel.ogrno)
                oModel.refresh()
                RegisterService.RegisterReq(oModel.oData.RegisterModel).then(function (res) {
                    RegisterService.RegisterReq({ "key": res[0].activationkey, "MN": "GET", "SN": "Register" }).then(function (res) {
                        oModel.setProperty("/userRegister", res);
                        oModel.setProperty("/RegisterModel", [])
                        MailService.AddMail({ "mail": oModel.oData.userRegister[0].rtemail, "activationKey": oModel.oData.userRegister[0].rtrcode }).then(function (res) {
                            if (res == "None") {
                                resolve(false);
                                sap.m.MessageToast.show("Mail Gönderilirken Bir Hata Oluştu");
                            } else {
                                CreateComponent.hideBusyIndicator();
                                oRouter.navTo("RegisterCheck")
                            }
                        })
                    })
                })
            }
        }

    });
    return PageController;
});
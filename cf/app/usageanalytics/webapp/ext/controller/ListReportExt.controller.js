sap.ui.define([
    'sap/ui/core/mvc/ControllerExtension',
    'sap/ui/core/Fragment',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function (ControllerExtension, Fragment, JSONModel, Filter, FilterOperator) {
    'use strict'

    let oGlobalFilter = null
    let fiTagsName = null
    let fiTagsValue = null
    let fiYear = null

    return ControllerExtension.extend("usageanalytics.ext.controller.ListReportExt", {
        override: {

            onInitSmartFilterBarExtension: function (oEvent) {
                oGlobalFilter = oEvent.getSource()
                fiTagsName = oGlobalFilter.determineFilterItemByName('Tag_name')
                fiTagsValue = oGlobalFilter.determineFilterItemByName('Tag_value')
                fiYear = oGlobalFilter.determineFilterItemByName('reportYear')

                if (fiYear && fiYear.getProperty('mandatory')) {
                    fiYear
                        .getControl()
                        .getBinding('items')
                        .attachEventOnce('dataReceived', () => {
                            const oControl = fiYear.getControl()
                            if (oControl.getItems().length > 0) {
                                oControl.setSelectedItem(oControl.getItems()[0], true, true)
                            }
                        })
                }

                if (fiTagsName && fiTagsName.getProperty('mandatory') && fiTagsValue && fiTagsValue.getProperty('mandatory')) {
                    fiTagsName
                        .getControl()
                        .attachSelectionChange(this.onTagsNameChange)

                    fiTagsValue
                        .getControl()
                        .getBinding('items')
                        .attachEvent('dataReceived', () => {
                            const oControl = fiTagsValue.getControl()
                            if (oControl.getBinding('items').getAllCurrentContexts().length && oControl.getItems().length > 0) {
                                oControl.setSelectedItem(oControl.getItems()[0], true, true)
                                oGlobalFilter.search()
                            }
                        })

                    fiTagsName
                        .getControl()
                        .getBinding('items')
                        .attachEventOnce('dataReceived', () => {
                            const oControl = fiTagsName.getControl()
                            if (oControl.getItems().length > 0) {
                                oControl.setSelectedItem(oControl.getItems()[0], true, true)
                                this.onTagsNameChange()
                            }
                        })
                }
            }
        },

        onTagsNameChange: function () {
            const tags_name = fiTagsName.getControl().getSelectedItem()?.getText()
            if (tags_name && fiTagsValue) {
                fiTagsValue
                    .getControl()
                    .getBinding('items')
                    .filter([new Filter("tag_name", FilterOperator.EQ, tags_name)])
                fiTagsValue
                    .getControl()
                    .setSelectedKey(null)
            }
        },

        handleLinkPress: function (oEvent) {
            const oButton = oEvent.getSource()
            const oView = this.getView()

            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "usageanalytics.ext.fragments.quickview",
                    controller: this
                }).then(oPopover => {
                    oView.addDependent(oPopover)
                    return oPopover
                })
            }

            this._pPopover.then(oPopover => {
                const data = oButton.getBindingContext().getObject()
                const popupData = {
                    title: data.AccountStructureItem_label,
                    items: data.Measures_serviceNames
                        .split('__')
                        .map(x => {
                            return { item: x }
                        })
                }
                oPopover.setModel(new JSONModel(popupData), 'context')
                oPopover.openBy(oButton)
            })

        }

    })
})

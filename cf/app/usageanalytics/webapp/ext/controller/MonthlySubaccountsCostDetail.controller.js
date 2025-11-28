sap.ui.define([
    'sap/ui/core/mvc/Controller',
	"sap/ui/core/routing/History",
    'sap/ui/Device',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/Sorter',
	'sap/ui/core/SortOrder',
    'sap/ui/model/json/JSONModel',
    'sap/m/Menu',
    'sap/m/MenuItem',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	"sap/ui/core/IconPool",
    './Formatter'
], function(Controller, History, Device , Filter, FilterOperator, Sorter, SortOrder, JSONModel, Menu, MenuItem, MessageToast, Fragment, Export, ExportTypeCSV, IconPool, Formatter) {
"use strict";

    return Controller.extend("victp.btp.cf.usageanalytics.controller.MonthlySubaccountsCostDetail", {
		// /** Reference to all existing created sap.m.ViewSettingsDialog-s in this sample */
		// _mViewSettingsDialogs: {},

		// /** Reference to array with all currently existing sorters. Grouping is a feature of sorting. */
		// _aSorters: [],

		// /** Permanent reference to column header menu */
		// _oColumnHeaderMenu: null,
		// /** Permanent reference to list of column header menu */
		// _oColumnHeaderMenuList: null,
		// /** Permanent reference to select button of column header menu */
		// _oColumnHeaderMenuListFilterButton: null,
		// /** Reference to current column of opened column header menu */
		// _oColumnHeaderMenuColumn: null,
		// /** Reference to name of current property of opened column header menu */
		// _sColumnHeaderMenuProperty: null,

		onInit: function () {
			var oView = this.getView();

			// Get and set json model for data
			// Get it directly from Component, because view may be not available 
			var oDataModel = this.getOwnerComponent().getModel("monthlySubaccountsCostModel");
            oView.setModel(oDataModel);

			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("RouteMonthlySubaccountsCostDetail").attachPatternMatched(this._onObjectMatched, this);

		// 	// Load fragment for ColumnHeaderMenu and add it to view
		// 	Fragment.load({
		// 		id: oView.getId(),
		// 		name: "victp.btp.cf.usageanalytics.fragment.ColumnHeaderMenu",
		// 		controller: this
		// 	}).then(function(oMenu) {
		// 		// Without adding the new menu to the dependencies of the view the menu is not able to access i18n!
		// 		oView.addDependent(oMenu);

		// 		return oMenu;
		// 	});

		// 	// Create and set json model for view
        //     var oToDate = new Date();
        //     var sToYear = oToDate.getFullYear().toString();
        //     var sToMonth = (oToDate.getMonth() + 1).toString();
        //     var sFromYear = (oToDate.getFullYear() - 1).toString();
        //     var sFromMonth = sToMonth;
        //     var oViewModel = new JSONModel({
        //         //"fromDate": sFromYear + sFromMonth,     // Start one year ago
        //         "fromDate": "202304",                     // Start after outdated intergration neo subaccounts were deleted
        //         "toDate": sToYear + sToMonth,             // End with current month
		// 		"itemCount": 0,                           // Number of table items
		// 		"setCount": 0                             // Number of model values
        //     });
        //     oView.setModel(oViewModel, "viewModel");

		// 	// The rest service couldn't be used before its parameters are known (see above: toDate, fromDate).
		// 	// This is the reason, why it is not configured in the manifest.json.
		// 	// So we need to call it explicitly here.
        //     this.updateData();
        },

		/** 
		 * This helper is used during implementation to set a breakpoint in the debugger to analyze events 
		 * 
		 * @param {object} oEvent - The event which should be analzed
		 */
		analyzeEvent: function(oEvent) {
			var bAnalyze = true;
		},

		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				// The first slash was removed, now it must be added again
				path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").contentPath)
			});
		},

		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("RouteMonthlySubaccountsCost", {}, true);
			}
		}

		// /**
		//  * There is one column header menu used for all columns.
		//  * For this reason we need to retrieve all context information we need to handle the menu.
		//  * 
		//  * @param {object} oEvent This event is fired before the column header menu is opened
		//  */
		// onBeforeColumnHeaderMenuOpen: function (oEvent) {

		// 	// Retrieve data for controller properties used in the context of ColumnHeaderMenu handling start

		// 	if (this._oColumnHeaderMenu == null) {
		// 		// These initializations need to be done the first time only. These references will never change.
		// 		this._oColumnHeaderMenu = this.byId("ColumnHeaderMenu");
		// 		this._oColumnHeaderMenuList = this.byId("ColumnHeaderMenuList");
		// 		this._oColumnHeaderMenuListFilterButton = this.byId("ColumnHeaderMenuListFilterButton");
		// 	}

		// 	// These initializations must be done each time the menu is opended
		// 	// We need to get the column for which the menu was opened
		// 	this._oColumnHeaderMenuColumn = oEvent.getParameter("openBy");
		// 	var sColumnHeaderLabelText = this._oColumnHeaderMenuColumn.getHeader().getText()
		// 	// We need to switch the labels to name of the column
		// 	this.byId("ColumnHeaderMenuFragmentQuickActionSortItem").setLabel(sColumnHeaderLabelText);

		// 	// This should change the visible label, but due to a ui5 bug the underlying toggle button text is not refreshed
		// 	this.byId("ColumnHeaderMenuFragmentQuickActionGroupItem").setLabel(sColumnHeaderLabelText);
		// 	// Workaround for this ui5 bug
		// 	var oQuickActionGroup = this.byId("ColumnHeaderMenuFragmentQuickActionGroup");
		// 	if (oQuickActionGroup.getDependents().length > 0) {
		// 		// In this case the toggle button is already created and the ui5 bug happens
		// 		var oToggleButton = oQuickActionGroup.getDependents()[0];
		// 		oToggleButton.setText(sColumnHeaderLabelText);
		// 	}

		// 	// This should change the visible label, but due to a ui5 bug the underlying toggle button text is not refreshed
		// 	this.byId("ColumnHeaderMenuFragmentQuickActionTotalItem").setLabel(sColumnHeaderLabelText);
		// 	// Workaround for this ui5 bug
		// 	var oQuickActionGroup = this.byId("ColumnHeaderMenuFragmentQuickActionTotal");
		// 	if (oQuickActionGroup.getDependents().length > 0) {
		// 		// In this case the toggle button is already created and the ui5 bug happens
		// 		var oToggleButton = oQuickActionGroup.getDependents()[0];
		// 		oToggleButton.setText(sColumnHeaderLabelText);
		// 	}
			
		// 	// We need to identify the property the column belongs to
		// 	// Expected values for this._sColumnHeaderMenuProperty: directoryName, subaccountName, reportYearMonth, serviceName
		// 	var aResult = this._oColumnHeaderMenuColumn.getId().split("--");
		// 	var sColumnId = aResult[aResult.length - 1];
		// 	this._sColumnHeaderMenuProperty = sColumnId.substring(0, sColumnId.length - 6);

		// 	// Initialize ColumnHeaderMenuList each time before the menu is opened

		// 	// Remove old selections
		// 	this._oColumnHeaderMenuList.removeSelections(true);
		// 	// Switch /propertyList to the correct property list
		// 	var oDataModel = this.getView().getModel("dataModel");
		// 	var aPropertyList = oDataModel.getProperty("/" + this._sColumnHeaderMenuProperty + "List");
		// 	oDataModel.setProperty("/propertyList", aPropertyList);
		// },

		// /**
		//  * The column header menu filter button belongs to the list with the values which should be filtered.
		//  * 
		//  * @param {object} oEvent This event is fired, when the filter button of the column header menu list is pressed.
		//  */
		// handleColumnHeaderMenuListFilterButtonPressed: function (oEvent) {
		// 	var oTable = this.byId("table1"),
		// 		mParams = oEvent.getParameters(),
		// 		oBinding = oTable.getBinding("items"),
		// 		aSelectedItems = this._oColumnHeaderMenuList.getSelectedItems(),
		// 		sPath = this._sColumnHeaderMenuProperty,
		// 		aFilters = [];

		// 	aSelectedItems.forEach((oItem) => {
		// 		// Create a filter for each selected value
		// 		var sOperator = "EQ",
		// 			sPropertyValue = oItem.getTitle(),
		// 			oFilter = new Filter(sPath, sOperator, sPropertyValue);
		// 		aFilters.push(oFilter);
		// 	});
		// 	oBinding.filter(aFilters);
		// 	// Filtering may change the counters, so refresh them
		// 	this._refreshCount();
		// 	this._oColumnHeaderMenu.close();
		// },

		// /**
		//  * Handle quick sort of column header menu
		//  * 
		//  * @param {object} oEvent This event is fired, when one of the sort options is pressed (but it is named "change").
		//  */
		// handleColumnHeaderMenuFragmentQuickActionSortChanged: function (oEvent) {
		// 	var oTable = this.byId("table1"),
		// 		oBinding = oTable.getBinding("items"),
		// 		sSortOrder = oEvent.getParameters().item.getProperty("sortOrder"),
		// 		bDescending = sSortOrder == SortOrder.Descending;

		// 	// If there is already a sorter for the current property, then the new sort order is set
		// 	var bSorterAlreadyExist = false;
		// 	this._aSorters.forEach((item) => {
		// 		if (item.sPath == this._sColumnHeaderMenuProperty) {
		// 			bSorterAlreadyExist = true;
		// 			item.bDescending = bDescending;
		// 			this.byId(this._sColumnHeaderMenuProperty + "Column").setSortIndicator(sSortOrder);
		// 		}
		// 	});
		// 	if (!bSorterAlreadyExist) {
		// 		// There is no existing sorter for the current property, so a new sorter is created and added as last sorter.
		// 		this._aSorters.push(new Sorter(this._sColumnHeaderMenuProperty, bDescending));
		// 		this.byId(this._sColumnHeaderMenuProperty + "Column").setSortIndicator(sSortOrder);
		// 	}

		// 	oBinding.sort(this._aSorters);
		// 	oTable.invalidate();
		// },

		// /**
		//  * Handle quick group of column header menu
		//  * If there is already a sorter for the property, activate grouping for it.
		//  * Otherwise create a new sorter.
		//  * All other sorters must be eliminated.
		//  * 
		//  * @param {object} oEvent This event is fired, when one of the sort options is pressed (but it is named "change").
		//  */
		// handleColumnHeaderMenuFragmentQuickActionGroupChanged: function (oEvent) {
		// 	var oTable = this.byId("table1"),
		// 		oBinding = oTable.getBinding("items");

		// 	// If there is already a sorter for the current property, then the new sort order is set
		// 	var oSorter = null;
		// 	this._aSorters.forEach((oItem) => {
		// 		if (oItem.sPath == this._sColumnHeaderMenuProperty) {
		// 			// Matching sorter found
		// 			oSorter = oItem;
		// 			oSorter.vGroup = true;
		// 		} else {
		// 			// Sorter will be removed, so remove sort indicator as well
		// 			this.byId(oItem.sPath + "Column").setSortIndicator(SortOrder.None);
		// 		}
		// 	});
		// 	if (oSorter == null) {
		// 		// There is no existing sorter for the current property, so a new sorter is created and added as last sorter.
		// 		oSorter = new Sorter(this._sColumnHeaderMenuProperty, true, true);
		// 		this.byId(this._sColumnHeaderMenuProperty + "Column").setSortIndicator(SortOrder.Ascending);
		// 	}
		// 	this._aSorters = [oSorter];

		// 	oBinding.sort(this._aSorters);
		// 	oTable.invalidate();
		// 	this._oColumnHeaderMenu.close();
		// },

		// getViewSettingsDialog: function (sDialogFragmentName) {
		// 	var oView = this.getView(),
		// 		pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

		// 	if (!pDialog) {
		// 		pDialog = Fragment.load({
		// 			id: oView.getId(),
		// 			name: sDialogFragmentName,
		// 			controller: this
		// 		}).then(function (oDialog) {
		// 			// Without adding the new dialog to the dependencies of the view the dialog is not able to access i18n!
		// 			oView.addDependent(oDialog);

		// 			if (Device.system.desktop) {
		// 				oDialog.addStyleClass("sapUiSizeCompact");
		// 			}
		// 			return oDialog;
		// 		});
		// 		this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
		// 	}
		// 	return pDialog;
		// },

		// handleSortButtonPressed: function () {
		// 	this.getViewSettingsDialog("victp.btp.cf.usageanalytics.fragment.SortDialog")
		// 		.then(function (oViewSettingsDialog) {
		// 			oViewSettingsDialog.open();
		// 		});
		// },

		// handleFilterButtonPressed: function () {
		// 	this.getViewSettingsDialog("victp.btp.cf.usageanalytics.fragment.FilterDialog")
		// 		.then(function (oViewSettingsDialog) {
		// 			oViewSettingsDialog.open();
		// 		});
		// },

		// /**
		//  * 
		//  * @param {*} oEvent 
		//  */
		// handleSortDialogConfirm: function (oEvent) {
		// 	var oTable = this.byId("table1"),
		// 		oColumn,
		// 		mParams = oEvent.getParameters(),
		// 		oBinding = oTable.getBinding("items"),
		// 		sPath,
		// 		bGrouping = true,
		// 		bDescending = mParams.sortDescending,
		// 		eSortOrder = bDescending ? SortOrder.Descending : SortOrder.Ascending;
			
		// 	// Remove all existing sorters
		// 	this._aSorters = [];

		// 	sPath = mParams.sortItem.getKey();
		// 	if (sPath == "DirSubDateServ") {
		// 		this._aSorters = [
		// 			new Sorter("directoryName", bDescending, bGrouping),
		// 			new Sorter("subaccountName", bDescending),
		// 			new Sorter("reportYearMonth", bDescending),
		// 			new Sorter("serviceName", bDescending)
		// 		];
		// 		oColumn = this.byId("directoryNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("subaccountNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("reportYearMonthColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("serviceNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("directoryNameColumn").setOrder(0);
		// 		oColumn = this.byId("subaccountNameColumn").setOrder(1);
		// 		oColumn = this.byId("reportYearMonthColumn").setOrder(2);
		// 		oColumn = this.byId("serviceNameColumn").setOrder(3);
		// 	} else if (sPath == "SubDirDateServ") {
		// 		this._aSorters = [
		// 			new Sorter("subaccountName", bDescending, bGrouping),
		// 			new Sorter("directoryName", bDescending),
		// 			new Sorter("reportYearMonth", bDescending),
		// 			new Sorter("serviceName", bDescending)
		// 		];
		// 		oColumn = this.byId("directoryNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("subaccountNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("reportYearMonthColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("serviceNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("directoryNameColumn").setOrder(1);
		// 		oColumn = this.byId("subaccountNameColumn").setOrder(0);
		// 		oColumn = this.byId("reportYearMonthColumn").setOrder(2);
		// 		oColumn = this.byId("serviceNameColumn").setOrder(3);
		// 	} else if (sPath == "DateDirSubServ") {
		// 		this._aSorters = [
		// 			new Sorter("reportYearMonth", bDescending, bGrouping),
		// 			new Sorter("directoryName", bDescending),
		// 			new Sorter("subaccountName", bDescending),
		// 			new Sorter("serviceName", bDescending)
		// 		];
		// 		oColumn = this.byId("directoryNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("subaccountNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("reportYearMonthColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("serviceNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("directoryNameColumn").setOrder(1);
		// 		oColumn = this.byId("subaccountNameColumn").setOrder(2);
		// 		oColumn = this.byId("reportYearMonthColumn").setOrder(0);
		// 		oColumn = this.byId("serviceNameColumn").setOrder(3);
		// 	} else if (sPath == "ServDirSubDate") {
		// 		this._aSorters = [
		// 			new Sorter("serviceName", bDescending, bGrouping),
		// 			new Sorter("directoryName", bDescending),
		// 			new Sorter("subaccountName", bDescending),
		// 			new Sorter("reportYearMonth", bDescending)
		// 		];
		// 		oColumn = this.byId("directoryNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("subaccountNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("reportYearMonthColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("serviceNameColumn").setSortIndicator(eSortOrder);
		// 		oColumn = this.byId("directoryNameColumn").setOrder(1);
		// 		oColumn = this.byId("subaccountNameColumn").setOrder(2);
		// 		oColumn = this.byId("reportYearMonthColumn").setOrder(3);
		// 		oColumn = this.byId("serviceNameColumn").setOrder(0);
		// 	} else if (sPath == "NoSorting") {
		// 		this._aSorters = [];
		// 		oColumn = this.byId("directoryNameColumn").setSortIndicator(SortOrder.None);
		// 		oColumn = this.byId("subaccountNameColumn").setSortIndicator(SortOrder.None);
		// 		oColumn = this.byId("reportYearMonthColumn").setSortIndicator(SortOrder.None);
		// 		oColumn = this.byId("serviceNameColumn").setSortIndicator(SortOrder.None);
		// 		oColumn = this.byId("directoryNameColumn").setOrder(0);
		// 		oColumn = this.byId("subaccountNameColumn").setOrder(1);
		// 		oColumn = this.byId("reportYearMonthColumn").setOrder(2);
		// 		oColumn = this.byId("serviceNameColumn").setOrder(3);
		// 	}

		// 	// apply the selected sort and group settings
		// 	oBinding.sort(this._aSorters);
		// 	oTable.invalidate();
		// },

		// /**
		//  * Switch table context menu on or off TODO: The context menu must be redesigned
		//  * 
		//  * @param {sap.ui.base.Event} oEvent Event from context menu toggle button
		//  */
		// onToggleContextMenu: function (oEvent) {
		// 	var oToggleButton = oEvent.getSource();
		// 	if (oEvent.getParameter("pressed")) {
		// 		oToggleButton.setTooltip("Disable Custom Context Menu");
		// 		this.byId("table1").setContextMenu(new Menu({
		// 			items: [
		// 				new MenuItem({text: "{dataModel>directoryName}"}),
		// 				new MenuItem({text: "{dataModel>subaccountName}"}),
		// 				new MenuItem({text: "{dataModel>reportYearMonth}"}),
		// 				new MenuItem({text: "{dataModel>serviceName}"})
		// 			]
		// 		}));
		// 	} else {
		// 		oToggleButton.setTooltip("Enable Custom Context Menu");
		// 		this.byId("table1").destroyContextMenu();
		// 	}
		// },

		// onActionItemPress: function() {
		// 	MessageToast.show('Action Item Pressed');
		// },

		// /**
		//  * Export all rest data from dataModel
		//  * 
		//  * @param {Object} oEvent Data export event
		//  */
		// onDataExport : function(oEvent) {

		// 	var oExport = new Export({

		// 		// Type that will be used to generate the content. Own ExportType's can be created to support other formats
		// 		exportType : new ExportTypeCSV({
		// 			separatorChar : ";"
		// 		}),

		// 		// Pass in the model created above
		// 		models : this.getView().getModel("dataModel"),

		// 		// binding information for the rows aggregation
		// 		rows : {
		// 			path : "/content"
		// 		},

		// 		// column definitions with column name and binding info for the content
		// 		columns : [{
		// 			name : "Subaccount",
		// 			template : {
		// 				content : "{subaccountName}"
		// 			}
		// 		}, {
		// 			name : "Date",
		// 			template : {
		// 				content : "{reportYearMonth}"
		// 			}
		// 		}, {
		// 			name : "Service",
		// 			template : {
		// 				content : "{serviceName}"
		// 			}
		// 		}, {
		// 			name : "Usage",
		// 			template : {
		// 				content : "{usage} {metricName}"
		// 			}
		// 		}, {
		// 			name : "Cost",
		// 			template : {
		// 				content : "{cost} {currency}"
		// 			},
		// 		}, {
		// 			name : "Estimated",
		// 			template : {
		// 				content : "{estimated}"
		// 		}
		// 		}, {
		// 			name : "SKU of Service",
		// 			template : {
		// 				content : "{crmSku}"
		// 			}
		// 		}, {
		// 			name : "Plan",
		// 			template : {
		// 				content : "{planName}"
		// 		}
		// 		}, {
		// 			name : "Data Center",
		// 			template : {
		// 				content : "{dataCenterName}"
		// 		}
		// 		}, {
		// 			name : "Quota",
		// 			template : {
		// 				content : "{quota}"
		// 		}
		// 		}, {
		// 			name : "Actual Usage",
		// 			template : {
		// 				content : "{actualUsage}"
		// 			}
		// 		}, {
		// 			name : "Charged Blocks",
		// 			template : {
		// 				content : "{chargedBlocks}"
		// 		}
		// 		}]
		// 	});

		// 	// download exported file
		// 	oExport.saveFile().catch(function(oError) {
		// 		MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
		// 	}).then(function() {
		// 		oExport.destroy();
		// 	});
		// },

		// /**
		//  * Load data from rest service or mock data
		//  */
        // updateData: function () {
        //     var that = this;
        //     var oView = this.getView();
        //     var oViewModel = oView.getModel("viewModel");
        //     var oDataModel = oView.getModel("dataModel");
        //     var sFromDate = oViewModel.getProperty("/fromDate")
        //     //var sFromDateYear = oViewModel.getProperty("/fromDateYear")
        //     //var sFromDateMonth = oViewModel.getProperty("/fromDateMonth")
        //     var sToDate = oViewModel.getProperty("/toDate")
        //     //var sToDateYear = oViewModel.getProperty("/toDateYear")
        //     //var sToDateMonth = oViewModel.getProperty("/toDateMonth")
            
		// 	oView.setBusy(true);
            
		// 	// Handle whether to use mock or real data
		// 	var sMockdata = jQuery.sap.getUriParameters().get("mockdata");
		// 	if (sMockdata != null && sMockdata == "true") {
		// 		// Get mock data
		// 		var sUri = sap.ui.require.toUrl('victp/btp/cf/usageanalytics/mockdata/usage.json');
		// 	} else {
		// 		// Get real data
		// 		var sUri = "reporting/reports/v1/monthlySubaccountsCost" + "?fromDate=" + sFromDate + "&toDate=" + sToDate;
		// 	}
		// 	Promise.all([ oDataModel.loadData(sUri) ]).then(that._handleFulfilled.bind(that), that._handleRejected.bind(that));
        // },

		// /**
		//  * Refreshs the counters of visible items in the table and of data in the set in the datamodel
		//  */
		// _refreshCount: function () {
        //     var aArray = [];
		// 	var iCount = 0;
        //     var oTable = this.byId("table1");
		// 	var oView = this.getView();
        //     var oViewModel = oView.getModel("viewModel");
        //     var oDataModel = oView.getModel("dataModel");

		// 	this._createPropertyLists(oDataModel);

		// 	aArray = oTable.getItems();
		// 	if (aArray === null || aArray === undefined) {
		// 		iCount = 0;
		// 	} else {
		// 		iCount = aArray.length;
		// 	}
		// 	oViewModel.setProperty("/itemCount", iCount);

		// 	aArray = oDataModel.getProperty("/content");
		// 	if (aArray === null || aArray === undefined) {
		// 		iCount = 0;
		// 	} else {
		// 		iCount = aArray.length;
		// 	}
		// 	oViewModel.setProperty("/setCount", iCount);
		// },

		// /**
		//  * Removes all model data sets where cost is zero (or below, but this will never happen).
		//  * 
		//  * @param {sap.ui.model.Model} oDataModel Model to work on
		//  */
		// _removeServiceDataWithZeroCost: function (oDataModel) {
		// 	var aArray = oDataModel.getProperty("/content");

		// 	aArray = aArray.filter((value) => value.cost > 0);

		// 	oDataModel.setProperty("/content", aArray);
		// },

		// /**
		//  * Creates totals for all properties which should be shown in the column footer
		//  * 
		//  * @param {sap.m.model} oDataModel 
		//  */
		// _createTotals: function (oDataModel) {
		// 	var aArray = oDataModel.getProperty("/content");
		// 	var aProperties = ["cost", "currency", "actualUsage", "chargedBlocks"];

		// 	aProperties.forEach((sProperty) => {
		// 		var result = null;
		// 		aArray.forEach((item) => {
		// 			// Handle numbers
		// 			if (typeof item[sProperty] === "number") {
		// 				// Total is the sum of all values
		// 				result = result === null ? item[sProperty] : result + item[sProperty];
		// 			}
		// 			// Handle strings
		// 			if (typeof item[sProperty] === "string") {
		// 				// Total is the last existing string value
		// 				if (item[sProperty] !== null && item[sProperty] !== "") {
		// 					result = item[sProperty];
		// 				}
		// 			}
		// 		});
		// 		if (typeof result === "number") {
		// 			result = Math.round((result + Number.EPSILON) * 100) / 100;
		// 		}
		// 		oDataModel.setProperty("/" + sProperty + "Total", result);
		// 	});
		// },

		// /**
		//  * Creates a list of distinct property values for all properties which could be filtered by the column header menu
		//  * 
		//  * @param {sap.m.model} oDataModel 
		//  */
		// _createPropertyLists: function (oDataModel) {
		// 	var aArray = oDataModel.getProperty("/content");
		// 	var oSet, aResult;
		// 	var aProperties = ["directoryName", "subaccountName", "reportYearMonth", "serviceName"];
			
		// 	aProperties.forEach((sProperty) => {
		// 		oSet = new Set();
		// 		aResult = [];
		// 		aArray.forEach((item) => oSet.add(item[sProperty]));
		// 		oSet.forEach(item => aResult.push({key: item, text: item}));
		// 		aResult.sort((a, b) => {
		// 			if (a.key < b.key) {
		// 			  return -1;
		// 			} else if (a.key > b.key) {
		// 			  return 1;
		// 			} else {
		// 				// names must be equal
		// 				return 0;
		// 			}
		// 		});
		// 		oDataModel.setProperty("/" + sProperty + "List", aResult);
		// 	});
		// },

		// /**
		//  * Handles full text search
		//  * 
		//  * @param {Object} oEvent Search event
		//  */
		// onSearch: function (oEvent) {
		// 	var oTableSearchState = [],
		// 		sQuery = oEvent.getParameter("query");

		// 	// For a full text search, all string columns need to use FilterOperator.Contains,
		// 	// but for numeric columns FilterOperator.EQ is the best option or they need to be converted to string columns
		// 	if (sQuery && sQuery.length > 0) {
		// 		oTableSearchState = [
		// 			new Filter({
		// 				filters: [
		// 					new Filter("directoryName", FilterOperator.Contains, sQuery, "X"),
		// 					new Filter("subaccountName", FilterOperator.Contains, sQuery, "X"),
		// 					new Filter("reportYearMonth", FilterOperator.EQ, sQuery, "X"), // this is numeric, so it must be handled separately
		// 					new Filter("serviceName", FilterOperator.Contains, sQuery, "X")		
		// 				]
		// 			})
		// 		];
		// 	}

		// 	this.getView().byId("table1").getBinding("items").filter(oTableSearchState, "Application");
		// 	// Filtering may change the counters, so refresh them
		// 	this._refreshCount();
		// },

		// /**
		//  * Success handler for rest service calls
		//  */
		// _handleFulfilled: function () {
        //     var oView = this.getView();
        //     var oDataModel = oView.getModel("dataModel");
        //     MessageToast.show("Data loaded successfully!\n");

		// 	this._removeServiceDataWithZeroCost(oDataModel);
		// 	this._createTotals(oDataModel);
			
		// 	oDataModel.refresh(true);
		// 	// Loading data may change the counters, so refresh them
		// 	this._refreshCount();
        //     oView.setBusy(false);
        // },

		// /**
		//  * Error handler for rest service calls
		//  * 
		//  * @param {String} reason Reason of error
		//  */
        // _handleRejected: function (reason) {
        //     var oView = this.getView();
        //     MessageToast.show("Error!\n" + reason);
		// 	// Error while loading data may change the counters, so refresh them
		// 	this._refreshCount();
        //     oView.setBusy(false);
        // }

    });
});

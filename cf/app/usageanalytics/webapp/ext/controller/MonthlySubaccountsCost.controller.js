sap.ui.define([
	'sap/ui/core/mvc/Controller',
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
], function (Controller, Device, Filter, FilterOperator, Sorter, SortOrder, JSONModel, Menu, MenuItem, MessageToast, Fragment, Export, ExportTypeCSV, IconPool, Formatter) {
	"use strict";

	return Controller.extend("victp.btp.cf.usageanalytics.controller.MonthlySubaccountsCost", {
		/** Reference to all existing created sap.m.ViewSettingsDialog-s in this sample */
		_mViewSettingsDialogs: {},

		/** Reference to array with all currently existing sorters. Grouping is a feature of sorting. */
		_aTableSorters: [],

		/** Reference to array with all currently existing filters. */
		_aTableFilters: [],

		/** Permanent reference to column header menu */
		_oColumnHeaderMenu: null,
		/** Permanent reference to list of column header menu */
		_oColumnHeaderMenuList: null,
		/** Permanent reference to select button of column header menu */
		_oColumnHeaderMenuListFilterButton: null,
		/** Reference to current column of opened column header menu */
		_oColumnHeaderMenuColumn: null,
		/** Reference to name of current property of opened column header menu */
		_sColumnHeaderMenuProperty: null,

		onInit: function () {
			var oView = this.getView();

			// Load fragment for ColumnHeaderMenu and add it to view
			Fragment.load({
				id: oView.getId(),
				name: "victp.btp.cf.usageanalytics.fragment.ColumnHeaderMenu",
				controller: this
			}).then(function (oMenu) {
				// Without adding the new menu to the dependencies of the view the menu is not able to access i18n!
				oView.addDependent(oMenu);

				return oMenu;
			});

			// Get and set json model for data
			// Get it directly from Component, because view may be not available 
			var oDataModel = this.getOwnerComponent().getModel("monthlySubaccountsCostModel");
			oView.setModel(oDataModel);

			// Create and set json model for view
			var oToDate = new Date();
			var sToYear = oToDate.getFullYear().toString();
			var sToMonth = (oToDate.getMonth() + 1).toString().padStart(2, '0');
			var sFromYear = (oToDate.getFullYear() - 1).toString();
			var sFromMonth = sToMonth.padStart(2, '0');
			var oViewModel = new JSONModel({
				//"fromDate": sFromYear + sFromMonth,     // Start one year ago
				"fromDate": "202304",                     // Start after outdated intergration neo subaccounts were deleted
				"toDate": sToYear + sToMonth,             // End with current month
				"itemCount": 0,                           // Number of table items
				"setCount": 0                             // Number of model values
			});
			oView.setModel(oViewModel, "viewModel");

			// The rest service couldn't be used before its parameters are known (see above: toDate, fromDate).
			// This is the reason, why it is not configured in the manifest.json.
			// So we need to call it explicitly here.
			this.updateData();
		},

		/** 
		 * This helper is used during implementation to set a breakpoint in the debugger to analyze events 
		 * 
		 * @param {object} oEvent - The event which should be analzed
		 */
		analyzeEvent: function (oEvent) {
			var bAnalyze = true;
		},

		/** 
		 * Handles navigation to item details 
		 * 
		 * @param {object} oEvent - The event which should be analzed
		 */
		handleNavigation: function (oEvent) {
			var oItem = oEvent.getSource();
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("RouteMonthlySubaccountsCostDetail", {
				// The first slash must be removed
				contentPath: window.encodeURIComponent(oItem.getBindingContext().getPath().substr(1))
			});
		},

		/**
		 * There is one column header menu used for all columns.
		 * For this reason we need to retrieve all context information we need to handle the menu.
		 * 
		 * @param {object} oEvent This event is fired before the column header menu is opened
		 */
		onBeforeColumnHeaderMenuOpen: function (oEvent) {

			// Retrieve data for controller properties used in the context of ColumnHeaderMenu handling start

			if (this._oColumnHeaderMenu == null) {
				// These initializations need to be done the first time only. These references will never change.
				this._oColumnHeaderMenu = this.byId("ColumnHeaderMenu");
				this._oColumnHeaderMenuList = this.byId("ColumnHeaderMenuList");
				this._oColumnHeaderMenuListFilterButton = this.byId("ColumnHeaderMenuListFilterButton");
			}

			// These initializations must be done each time the menu is opended
			// We need to get the column for which the menu was opened
			this._oColumnHeaderMenuColumn = oEvent.getParameter("openBy");
			var sColumnHeaderLabelText = this._oColumnHeaderMenuColumn.getHeader().getText()
			// We need to switch the labels to name of the column
			this.byId("ColumnHeaderMenuFragmentQuickActionSortItem").setLabel(sColumnHeaderLabelText);

			// This should change the visible label, but due to a ui5 bug the underlying toggle button text is not refreshed
			this.byId("ColumnHeaderMenuFragmentQuickActionGroupItem").setLabel(sColumnHeaderLabelText);
			// // Workaround for this ui5 bug
			// var oQuickActionGroup = this.byId("ColumnHeaderMenuFragmentQuickActionGroup");
			// if (oQuickActionGroup.getDependents().length > 0) {
			// 	// In this case the toggle button is already created and the ui5 bug happens
			// 	var oToggleButton = oQuickActionGroup.getDependents()[0];
			// 	oToggleButton.setText(sColumnHeaderLabelText);
			// }

			// This should change the visible label, but due to a ui5 bug the underlying toggle button text is not refreshed
			this.byId("ColumnHeaderMenuFragmentQuickActionTotalItem").setLabel(sColumnHeaderLabelText);
			// // Workaround for this ui5 bug
			// var oQuickActionGroup = this.byId("ColumnHeaderMenuFragmentQuickActionTotal");
			// if (oQuickActionGroup.getDependents().length > 0) {
			// 	// In this case the toggle button is already created and the ui5 bug happens
			// 	var oToggleButton = oQuickActionGroup.getDependents()[0];
			// 	oToggleButton.setText(sColumnHeaderLabelText);
			// }

			// We need to identify the property the column belongs to
			// Expected values for this._sColumnHeaderMenuProperty: directoryName, subaccountName, reportYearMonth, serviceName
			var aResult = this._oColumnHeaderMenuColumn.getId().split("--");
			var sColumnId = aResult[aResult.length - 1];
			this._sColumnHeaderMenuProperty = sColumnId.substring(0, sColumnId.length - 6);

			// Initialize ColumnHeaderMenuList each time before the menu is opened

			// Remove old selections
			this._oColumnHeaderMenuList.removeSelections(true);
			// Switch /propertyList to the correct property list
			var oDataModel = this.getView().getModel();
			var aPropertyList = oDataModel.getProperty("/" + this._sColumnHeaderMenuProperty + "List");
			oDataModel.setProperty("/propertyList", aPropertyList);
		},

		/**
		 * The column header menu filter button belongs to the list with the values which should be filtered.
		 * 
		 * @param {object} oEvent This event is fired, when the filter button of the column header menu list is pressed.
		 */
		handleColumnHeaderMenuListFilterButtonPressed: function (oEvent) {
			var oTable = this.byId("table1"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aSelectedItems = this._oColumnHeaderMenuList.getSelectedItems(),
				sPath = this._sColumnHeaderMenuProperty;

			/** 
			 * @todo Change filter handling. Don't delete them all, instead integrate new filter into existing filters
			 * Replace filters for same path and append filters for new path
			 * */
			this._aTableFilters = [];

			aSelectedItems.forEach((oItem) => {
				// Create a filter for each selected value
				var sOperator = "EQ",
					sPropertyValue = oItem.getTitle(),
					oFilter = new Filter(sPath, sOperator, sPropertyValue);
				this._aTableFilters.push(oFilter);
			});

			this._refreshViewItems();
			this._oColumnHeaderMenu.close();
		},

		/**
		 * Handle quick sort of column header menu
		 * 
		 * @param {object} oEvent This event is fired, when one of the sort options is pressed (but it is named "change").
		 */
		handleColumnHeaderMenuFragmentQuickActionSortChanged: function (oEvent) {
			var oTable = this.byId("table1"),
				oBinding = oTable.getBinding("items"),
				sSortOrder = oEvent.getParameters().item.getProperty("sortOrder"),
				bDescending = sSortOrder == SortOrder.Descending;

			// If there is already a sorter for the current property, then the new sort order is set
			var bSorterAlreadyExist = false;
			this._aTableSorters.forEach((item) => {
				if (item.sPath == this._sColumnHeaderMenuProperty) {
					bSorterAlreadyExist = true;
					item.bDescending = bDescending;
					this.byId(this._sColumnHeaderMenuProperty + "Column").setSortIndicator(sSortOrder);
				}
			});
			if (!bSorterAlreadyExist) {
				// There is no existing sorter for the current property, so a new sorter is created and added as last sorter.
				this._aTableSorters.push(new Sorter(this._sColumnHeaderMenuProperty, bDescending));
				this.byId(this._sColumnHeaderMenuProperty + "Column").setSortIndicator(sSortOrder);
			}

			this._refreshViewItems();
			this._oColumnHeaderMenu.close();
		},

		/**
		 * Handle quick group of column header menu
		 * If there is already a sorter for the property, activate grouping for it.
		 * Otherwise create a new sorter.
		 * All other sorters must be eliminated.
		 * 
		 * @param {object} oEvent This event is fired, when one of the sort options is pressed (but it is named "change").
		 */
		handleColumnHeaderMenuFragmentQuickActionGroupChanged: function (oEvent) {
			var oTable = this.byId("table1"),
				oBinding = oTable.getBinding("items");

			// If there is already a sorter for the current property, then the new sort order is set
			var oSorter = null;
			this._aTableSorters.forEach((oItem) => {
				if (oItem.sPath == this._sColumnHeaderMenuProperty) {
					// Matching sorter found
					oSorter = oItem;
					oSorter.vGroup = true;
				} else {
					// Sorter will be removed, so remove sort indicator as well
					this.byId(oItem.sPath + "Column").setSortIndicator(SortOrder.None);
				}
			});
			if (oSorter == null) {
				// There is no existing sorter for the current property, so a new sorter is created and added as last sorter.
				oSorter = new Sorter(this._sColumnHeaderMenuProperty, true, true);
				this.byId(this._sColumnHeaderMenuProperty + "Column").setSortIndicator(SortOrder.Ascending);
			}
			this._aTableSorters = [oSorter];

			this._refreshViewItems();
			this._oColumnHeaderMenu.close();
		},

		getViewSettingsDialog: function (sDialogFragmentName) {
			var oView = this.getView(),
				pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: oView.getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					// Without adding the new dialog to the dependencies of the view the dialog is not able to access i18n!
					oView.addDependent(oDialog);

					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},

		handleSortButtonPressed: function () {
			this.getViewSettingsDialog("victp.btp.cf.usageanalytics.fragment.SortDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},

		handleFilterButtonPressed: function () {
			this.getViewSettingsDialog("victp.btp.cf.usageanalytics.fragment.FilterDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},

		/**
		 * 
		 * @param {*} oEvent 
		 */
		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("table1"),
				oColumn,
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bGrouping = false,
				bDescending = mParams.sortDescending,
				eSortOrder = bDescending ? SortOrder.Descending : SortOrder.Ascending;

			// Remove all existing sorters
			this._aTableSorters = [];

			sPath = mParams.sortItem.getKey();
			if (sPath == "DirSubDateServ") {
				this._aTableSorters = [
					new Sorter("directoryName", bDescending, bGrouping),
					new Sorter("subaccountName", bDescending),
					new Sorter("reportYearMonth", bDescending),
					new Sorter("serviceName", bDescending)
				];
				oColumn = this.byId("directoryNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("subaccountNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("reportYearMonthColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("serviceNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("directoryNameColumn").setOrder(0);
				oColumn = this.byId("subaccountNameColumn").setOrder(1);
				oColumn = this.byId("reportYearMonthColumn").setOrder(2);
				oColumn = this.byId("serviceNameColumn").setOrder(3);
			} else if (sPath == "SubDirDateServ") {
				this._aTableSorters = [
					new Sorter("subaccountName", bDescending, bGrouping),
					new Sorter("directoryName", bDescending),
					new Sorter("reportYearMonth", bDescending),
					new Sorter("serviceName", bDescending)
				];
				oColumn = this.byId("directoryNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("subaccountNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("reportYearMonthColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("serviceNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("directoryNameColumn").setOrder(1);
				oColumn = this.byId("subaccountNameColumn").setOrder(0);
				oColumn = this.byId("reportYearMonthColumn").setOrder(2);
				oColumn = this.byId("serviceNameColumn").setOrder(3);
			} else if (sPath == "DateDirSubServ") {
				this._aTableSorters = [
					new Sorter("reportYearMonth", bDescending, bGrouping),
					new Sorter("directoryName", bDescending),
					new Sorter("subaccountName", bDescending),
					new Sorter("serviceName", bDescending)
				];
				oColumn = this.byId("directoryNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("subaccountNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("reportYearMonthColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("serviceNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("directoryNameColumn").setOrder(1);
				oColumn = this.byId("subaccountNameColumn").setOrder(2);
				oColumn = this.byId("reportYearMonthColumn").setOrder(0);
				oColumn = this.byId("serviceNameColumn").setOrder(3);
			} else if (sPath == "ServDirSubDate") {
				this._aTableSorters = [
					new Sorter("serviceName", bDescending, bGrouping),
					new Sorter("directoryName", bDescending),
					new Sorter("subaccountName", bDescending),
					new Sorter("reportYearMonth", bDescending)
				];
				oColumn = this.byId("directoryNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("subaccountNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("reportYearMonthColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("serviceNameColumn").setSortIndicator(eSortOrder);
				oColumn = this.byId("directoryNameColumn").setOrder(1);
				oColumn = this.byId("subaccountNameColumn").setOrder(2);
				oColumn = this.byId("reportYearMonthColumn").setOrder(3);
				oColumn = this.byId("serviceNameColumn").setOrder(0);
			} else if (sPath == "NoSorting") {
				this._aTableSorters = [];
				oColumn = this.byId("directoryNameColumn").setSortIndicator(SortOrder.None);
				oColumn = this.byId("subaccountNameColumn").setSortIndicator(SortOrder.None);
				oColumn = this.byId("reportYearMonthColumn").setSortIndicator(SortOrder.None);
				oColumn = this.byId("serviceNameColumn").setSortIndicator(SortOrder.None);
				oColumn = this.byId("directoryNameColumn").setOrder(0);
				oColumn = this.byId("subaccountNameColumn").setOrder(1);
				oColumn = this.byId("reportYearMonthColumn").setOrder(2);
				oColumn = this.byId("serviceNameColumn").setOrder(3);
			}

			this._refreshViewItems();
		},

		/**
		 * Switch table context menu on or off @todo: The context menu must be redesigned
		 * 
		 * @param {sap.ui.base.Event} oEvent Event from context menu toggle button
		 */
		onToggleContextMenu: function (oEvent) {
			var oToggleButton = oEvent.getSource();
			if (oEvent.getParameter("pressed")) {
				oToggleButton.setTooltip("Disable Custom Context Menu");
				this.byId("table1").setContextMenu(new Menu({
					items: [
						new MenuItem({ text: "{dataModel>directoryName}" }),
						new MenuItem({ text: "{dataModel>subaccountName}" }),
						new MenuItem({ text: "{dataModel>reportYearMonth}" }),
						new MenuItem({ text: "{dataModel>serviceName}" })
					]
				}));
			} else {
				oToggleButton.setTooltip("Enable Custom Context Menu");
				this.byId("table1").destroyContextMenu();
			}
		},

		onActionItemPress: function () {
			MessageToast.show('Action Item Pressed');
		},

		/**
		 * Export all rest data from dataModel
		 * 
		 * @param {Object} oEvent Data export event
		 */
		onDataExport: function (oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: this.getView().getModel(),

				// binding information for the rows aggregation
				rows: {
					path: "/content"
				},

				// column definitions with column name and binding info for the content
				columns: [{
					name: "Subaccount",
					template: {
						content: "{subaccountName}"
					}
				}, {
					name: "Date",
					template: {
						content: "{reportYearMonth}"
					}
				}, {
					name: "Service",
					template: {
						content: "{serviceName}"
					}
				}, {
					name: "Usage",
					template: {
						content: "{usage} {metricName}"
					}
				}, {
					name: "Cost",
					template: {
						content: "{cost} {currency}"
					},
				}, {
					name: "Estimated",
					template: {
						content: "{estimated}"
					}
				}, {
					name: "SKU of Service",
					template: {
						content: "{crmSku}"
					}
				}, {
					name: "Plan",
					template: {
						content: "{planName}"
					}
				}, {
					name: "Data Center",
					template: {
						content: "{dataCenterName}"
					}
				}, {
					name: "Quota",
					template: {
						content: "{quota}"
					}
				}, {
					name: "Actual Usage",
					template: {
						content: "{actualUsage}"
					}
				}, {
					name: "Charged Blocks",
					template: {
						content: "{chargedBlocks}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},

		/**
		 * Load data from rest service or mock data
		 */
		updateData: function () {
			var that = this;
			var oView = this.getView();
			var oViewModel = oView.getModel("viewModel");
			var oDataModel = oView.getModel();
			var sFromDate = oViewModel.getProperty("/fromDate")
			//var sFromDateYear = oViewModel.getProperty("/fromDateYear")
			//var sFromDateMonth = oViewModel.getProperty("/fromDateMonth")
			var sToDate = oViewModel.getProperty("/toDate")
			//var sToDateYear = oViewModel.getProperty("/toDateYear")
			//var sToDateMonth = oViewModel.getProperty("/toDateMonth")

			oView.setBusy(true);

			// Handle whether to use mock or real data
			var sMockdata = jQuery.sap.getUriParameters().get("mockdata");
			if (sMockdata != null && sMockdata == "true") {
				// Get mock data
				var sUri = sap.ui.require.toUrl('victp/btp/cf/usageanalytics/mockdata/usage.json');
			} else {
				// Get real data
				var sUri = "reporting/reports/v1/monthlySubaccountsCost" + "?fromDate=" + sFromDate + "&toDate=" + sToDate;
			}
			Promise.all([oDataModel.loadData(sUri)]).then(that._handleFulfilled.bind(that), that._handleRejected.bind(that));
		},

		/**
		 * Creates a list of distinct property values for all properties which could be filtered by the column header menu
		 * 
		 */
		_createPropertyLists: function () {
			var oDataModel = this.getView().getModel(),
				aArray = oDataModel.getProperty("/content"),
				oSet,
				aResult,
				aProperties = ["directoryName", "subaccountName", "reportYearMonth", "serviceName"];

			aProperties.forEach((sProperty) => {
				oSet = new Set();
				aResult = [];
				aArray.forEach((item) => oSet.add(item[sProperty]));
				oSet.forEach(item => aResult.push({ key: item, text: item }));
				aResult.sort((a, b) => {
					if (a.key < b.key) {
						return -1;
					} else if (a.key > b.key) {
						return 1;
					} else {
						// names must be equal
						return 0;
					}
				});
				oDataModel.setProperty("/" + sProperty + "List", aResult);
			});
		},

		/**
		 * Handles full text search
		 * 
		 * @param {Object} oEvent Search event
		 */
		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");

			// For a full text search, all string columns need to use FilterOperator.Contains,
			// but for numeric columns FilterOperator.EQ is the best option or they need to be converted to string columns
			if (sQuery && sQuery.length > 0) {
				this._aTableFilters = [
					new Filter({
						filters: [
							new Filter("directoryName", FilterOperator.Contains, sQuery, "X"),
							new Filter("subaccountName", FilterOperator.Contains, sQuery, "X"),
							new Filter("reportYearMonth", FilterOperator.EQ, sQuery, "X"), // this is numeric, so it must be handled separately
							new Filter("serviceName", FilterOperator.Contains, sQuery, "X")
						]
					})
				];
			} else {
				this._aTableFilters = [];
			}

			this._refreshViewItems();
		},

		/**
		 * Success handler for rest service calls
		 */
		_handleFulfilled: function () {
			var oView = this.getView(),
				oDataModel = oView.getModel();

			MessageToast.show("Data loaded successfully!\n");

			this._serviceDataPostProcessing();
			// oDataModel.refresh(true);

			// Refreshing data may change view items, so refresh them
			this._refreshViewItems();
			oView.setBusy(false);
		},

		/**
		 * Apply some post processing on service data 
		 * This is not good, it may cause multiple calculations
		 */
		_serviceDataPostProcessing: function () {
			var oDataModel = this.getView().getModel(),
				aArray = oDataModel.getProperty("/content");

			// Example MonthlyUsage element:
			// {
			// 	"currency": "EUR",
			// 	"estimated": false,
			// 	"crmSku": "8008466",
			// 	"globalAccountId": "CA1109462",
			// 	"globalAccountName": "VGBS - Extensions",
			// 	"subaccountId": "9f2fd49a-2efc-4c39-807b-aea9f8d1ab60",
			// 	"subaccountName": "WF02 - Workflow (QAS)",
			// 	"directoryId": "158e120f-b665-4d3e-b270-228255421975",
			// 	"directoryName": "07 Workflow",
			// 	"reportYearMonth": 202405,
			// 	"serviceId": "scp-launchpad",
			// 	"serviceName": "SAP Build Work Zone, standard edition",
			// 	"plan": "standard",
			// 	"planName": "Standard",
			// 	"measureId": "launchpad_user",
			// 	"metricName": "Users",
			// 	"unitSingular": "user",
			// 	"unitPlural": "users",
			// 	"dataCenter": "eu10",
			// 	"dataCenterName": "eu10",
			// 	"usage": 0,
			// 	"cost": 0,
			// 	"quota": 333.67, // subscription
			// 	"actualUsage": 1.67,
			// 	"chargedBlocks": 0,
			// 	"cloudCreditsCost": 0,
			// 	"paygCost": 0,
			// 	"startIsoDate": "2024-05-01",
			// 	"endIsoDate": "2024-06-01"
			// }

			// Calculate data for unused service subscription
			aArray.forEach(value => {
				if (value.quota > value.actualUsage) {
					value.unusedQuota = (value.quota - value.actualUsage);	
					value.unusedQuota = Math.round((value.unusedQuota + Number.EPSILON) * 100) / 100;
					value.unusedQuotaPercent = (value.unusedQuota / value.quota) * 100;
					value.unusedQuotaPercent = Math.round((value.unusedQuotaPercent + Number.EPSILON));
				} else {
					value.unusedQuota = 0;
					value.unusedQuotaPercent = 0;
				}
				if (value.unusedQuotaPercent == 0) {
					value.unusedQuotaState = "Success"
				} else if (value.unusedQuotaPercent < 20) {
					value.unusedQuotaState = "Information"
				} else if (value.unusedQuotaPercent < 40) {
					value.unusedQuotaState = "Warning"
				} else {
					value.unusedQuotaState = "Error"
				}
				// For display we need a padded string
				value.unusedQuotaPercent = value.unusedQuotaPercent.toString().padStart(3);
			});

			// Remove values where costs and unused subscriptions are zero
			aArray = aArray.filter((value) => (value.cost > 0) || (value.unusedQuota > 0));

			oDataModel.setProperty("/content", aArray);
		},

		/**
		 * Error handler for rest service calls
		 * 
		 * @param {String} reason Reason of error
		 */
		_handleRejected: function (reason) {
			var oView = this.getView();

			MessageToast.show("Error!\n" + reason);
			this._refreshViewItems();
			oView.setBusy(false);
		},

		/**
		 * Refresh all items on the view, because they may have to change
		 */
		_refreshViewItems: function () {
			var oTable = this.byId("table1"),
				oBinding = oTable.getBinding("items");

			// Clear filters and sorters in order to have a well defined state
			oBinding.filter([]);
			oBinding.sort([]);
			// Apply filters and sorters in a well defined order
			oBinding.filter(this._aTableFilters);
			oBinding.sort(this._aTableSorters);

			// Filters may have changed the number and content of table items, so refresh counters and totals
			this._serviceDataPostProcessing(); // Search fo better place
			this._refreshCount();
			this._createTotals();
			oTable.invalidate(); // ??
		},

		/**
		 * Refreshs the counters of visible items in the table and of data in the set in the datamodel
		 */
		_refreshCount: function () {
			var aArray = [];
			var iCount = 0;
			var oTable = this.byId("table1");
			var oView = this.getView();
			var oViewModel = oView.getModel("viewModel");
			var oDataModel = oView.getModel();

			this._createPropertyLists(oDataModel);

			aArray = oTable.getItems();
			if (aArray === null || aArray === undefined) {
				iCount = 0;
			} else {
				iCount = aArray.length;
			}
			oViewModel.setProperty("/itemCount", iCount);

			aArray = oDataModel.getProperty("/content");
			if (aArray === null || aArray === undefined) {
				iCount = 0;
			} else {
				iCount = aArray.length;
			}
			oViewModel.setProperty("/setCount", iCount);
		},

		/**
		 * Creates totals for all properties which should be shown in the column footer.
		 * Handled properties: "cost", "currency", "actualUsage", "chargedBlocks"
		 * 
		 */
		_createTotals: function () {
			var oDataModel = this.getView().getModel(),
				oTable = this.byId("table1"),
				aArray = oTable.getItems(),
				//aProperties = [],
				n = 0.0,
				nUsageTotal = 0.0,
				nCostTotal = 0.0,
				sCurrencyTotal = "",
				nQuotaTotal = 0.0,
				nUnusedQuotaTotal = 0.0,
				nActualUsageTotal = 0.0,
				nChargedBlocksTotal = 0.0;

			aArray.forEach((item) => {
				var aCells = item.getCells();
				aCells.forEach((cell) => {
					var sId = cell.getId();
					if (sId.includes("--usageText-")) {
						// Text contains cost and metric
						var aTokens = cell.getText().split(" ");
						if (aTokens.length >= 2) {
							n = Number.parseFloat(aTokens[0]);
							if (!Number.isNaN(n)) {
								nUsageTotal += n;
							}
						}
					} else if (sId.includes("--costText-")) {
						// Text contains cost and currency
						var aTokens = cell.getText().split(" ");
						if (aTokens.length == 2) {
							n = Number.parseFloat(aTokens[0]);
							if (!Number.isNaN(n)) {
								nCostTotal += n;
							}
							if (aTokens[1].length > 0) {
								sCurrencyTotal = aTokens[1];
							}
						}
					} else if (sId.includes("--quotaText-")) {
						n = Number.parseFloat(cell.getText());
						if (!Number.isNaN(n)) {
							nQuotaTotal += n;
						}
					} else if (sId.includes("--unusedQuotaPercentObjectNumber-")) {
						var sCellTokens = cell.getNumber().split(" /");
						n = Number.parseFloat(sCellTokens[0]);
						if (!Number.isNaN(n)) {
							nUnusedQuotaTotal += n;
						}
					} else if (sId.includes("--actualUsageText-")) {
						n = Number.parseFloat(cell.getText());
						if (!Number.isNaN(n)) {
							nActualUsageTotal += n;
						}
					} else if (sId.includes("--chargedBlocksText-")) {
						n = Number.parseFloat(cell.getText());
						if (!Number.isNaN(n)) {
							nChargedBlocksTotal += n;
						}
					}
				});
			});
			oDataModel.setProperty("/usageTotal", Math.round((nUsageTotal + Number.EPSILON) * 100) / 100);
			oDataModel.setProperty("/costTotal", Math.round((nCostTotal + Number.EPSILON) * 100) / 100);
			oDataModel.setProperty("/currencyTotal", sCurrencyTotal);
			oDataModel.setProperty("/quotaTotal", Math.round((nQuotaTotal + Number.EPSILON) * 100) / 100);
			oDataModel.setProperty("/unusedQuotaTotal", Math.round((nUnusedQuotaTotal + Number.EPSILON) * 100) / 100);
			oDataModel.setProperty("/actualUsageTotal", Math.round((nActualUsageTotal + Number.EPSILON) * 100) / 100);
			oDataModel.setProperty("/chargedBlocksTotal", Math.round((nChargedBlocksTotal + Number.EPSILON) * 100) / 100);
		}
	});
});

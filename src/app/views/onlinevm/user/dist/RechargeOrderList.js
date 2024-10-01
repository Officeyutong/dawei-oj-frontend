"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var semantic_ui_react_1 = require("semantic-ui-react");
var OnlineVMClient_1 = require("../client/OnlineVMClient");
var react_redux_1 = require("react-redux");
var Utils_1 = require("../../../common/Utils");
var OrderDetailsModal_1 = require("../OrderDetailsModal");
var OrderRechargeModal_1 = require("../user/OrderRechargeModal");
var luxon_1 = require("luxon");
var DoFinishPayButton_1 = require("./DoFinishPayButton");
var RechargeOrderList = function () {
    var selfUid = react_redux_1.useSelector(function (s) { return s.userState.userData.uid; });
    var initialReqDone = react_redux_1.useSelector(function (s) { return s.userState.initialRequestDone; });
    var _a = react_1.useState(false), loaded = _a[0], setLoaded = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(1), page = _c[0], setPage = _c[1];
    var _d = react_1.useState(0), pageCount = _d[0], setPageCount = _d[1];
    var _e = react_1.useState([]), data = _e[0], setData = _e[1];
    var _f = react_1.useState(null), showingOrder = _f[0], setShowingOrder = _f[1];
    var _g = react_1.useState(null), showChargeModel = _g[0], setShowChargeModel = _g[1];
    var loadPage = react_1.useCallback(function (page) { return __awaiter(void 0, void 0, void 0, function () {
        var resp, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, OnlineVMClient_1["default"].getRechargeOrderList(page, selfUid)];
                case 1:
                    resp = _b.sent();
                    setPageCount(resp.pageCount);
                    setData(resp.data);
                    setLoaded(true);
                    setPage(page);
                    return [3 /*break*/, 4];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [selfUid]);
    react_1.useEffect(function () {
        if (!loaded && initialReqDone)
            loadPage(1);
    }, [initialReqDone, loadPage, loaded]);
    var nowTime = Utils_1.useNowTime();
    return React.createElement(React.Fragment, null,
        React.createElement(semantic_ui_react_1.Header, { as: "h2" }, "\u5145\u503C\u8BA2\u5355"),
        loading && React.createElement(semantic_ui_react_1.Dimmer, { active: true },
            React.createElement(semantic_ui_react_1.Loader, null)),
        "\u5F53\u524D\u65F6\u95F4\uFF1A",
        nowTime.toJSDate().toLocaleString(),
        React.createElement("div", { style: { display: 'inline-block', cursor: 'pointer', userSelect: 'none' }, onClick: function () { return loadPage(page); } },
            React.createElement(semantic_ui_react_1.Icon, { name: "sync", size: "small", style: { marginLeft: '1rem' } }),
            "\u70B9\u6B64\u624B\u52A8\u66F4\u65B0\u8BA2\u5355\u72B6\u6001"),
        showingOrder !== null && React.createElement(OrderDetailsModal_1["default"], { orderId: showingOrder.order_id, uid: selfUid, onClose: function () { return setShowingOrder(null); } }),
        showChargeModel !== null && React.createElement(semantic_ui_react_1.Modal, { open: true, size: "small" },
            React.createElement(semantic_ui_react_1.Modal.Header, null, "\u652F\u4ED8"),
            React.createElement(semantic_ui_react_1.Modal.Content, null,
                React.createElement(OrderRechargeModal_1["default"], { wechatPayURL: showChargeModel.wechat_payment_url, amount: showChargeModel.amount, orderId: showChargeModel.order_id, expireTime: luxon_1.DateTime.fromSeconds(showChargeModel.expire_at), createOrderTime: luxon_1.DateTime.fromSeconds(showChargeModel.time), onClose: function () { return setShowChargeModel(null); } })),
            React.createElement(semantic_ui_react_1.Modal.Actions, null,
                React.createElement(DoFinishPayButton_1["default"], { loading: loading, orderId: showChargeModel.order_id, expireTime: showChargeModel.expire_at - showChargeModel.time, onClose: function () { return setShowChargeModel(null); } }),
                React.createElement(semantic_ui_react_1.Button, { disabled: loading, color: "red", onClick: function () { return setShowChargeModel(null); } }, "\u53D6\u6D88\u652F\u4ED8"))),
        loaded && React.createElement(React.Fragment, null,
            React.createElement(semantic_ui_react_1.Table, null,
                React.createElement(semantic_ui_react_1.Table.Header, null,
                    React.createElement(semantic_ui_react_1.Table.Row, null,
                        React.createElement(semantic_ui_react_1.Table.HeaderCell, null, "\u8BA2\u5355\u7F16\u53F7"),
                        React.createElement(semantic_ui_react_1.Table.HeaderCell, null, "\u4E0B\u5355\u65F6\u95F4"),
                        React.createElement(semantic_ui_react_1.Table.HeaderCell, null, "\u5230\u671F\u65F6\u95F4"),
                        React.createElement(semantic_ui_react_1.Table.HeaderCell, null, "\u8BA2\u5355\u72B6\u6001"),
                        React.createElement(semantic_ui_react_1.Table.HeaderCell, null, "\u5145\u503C\u91D1\u989D"),
                        React.createElement(semantic_ui_react_1.Table.HeaderCell, null, "\u64CD\u4F5C"))),
                React.createElement(semantic_ui_react_1.Table.Body, null, data.map(function (item) { return React.createElement(semantic_ui_react_1.Table.Row, { key: item.order_id },
                    React.createElement(semantic_ui_react_1.Table.Cell, null, item.order_id),
                    React.createElement(semantic_ui_react_1.Table.Cell, null, Utils_1.timeStampToString(item.time)),
                    React.createElement(semantic_ui_react_1.Table.Cell, { negative: item.status === "unpaid" }, Utils_1.timeStampToString(item.expire_at)),
                    React.createElement(semantic_ui_react_1.Table.Cell, { positive: item.status === "paid", negative: item.status !== "paid" }, OnlineVMClient_1.translatePaymentStatus(item.status)),
                    React.createElement(semantic_ui_react_1.Table.Cell, null, (item.amount / 100).toFixed(2)),
                    React.createElement(semantic_ui_react_1.Table.Cell, null,
                        React.createElement(semantic_ui_react_1.Button, { size: "small", onClick: function () { return setShowingOrder(item); } }, "\u67E5\u770B\u8BE6\u60C5"),
                        React.createElement(semantic_ui_react_1.Button, { size: "small", disabled: nowTime.toSeconds() > item.expire_at || item.status === "error" || item.status === "paid", onClick: function () { return setShowChargeModel(item); } }, "\u8FDB\u884C\u652F\u4ED8"))); }))),
            React.createElement("div", { style: { display: "flex", justifyContent: "center" } },
                React.createElement(semantic_ui_react_1.Pagination, { totalPages: Math.max(1, pageCount), activePage: page, onPageChange: function (_, d) { return loadPage(d.activePage); } }))));
};
exports["default"] = RechargeOrderList;

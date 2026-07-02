const state = {
  data: null,
  filters: {
    months: new Set(),
    payments: new Set(),
    sources: new Set(),
    categories: new Set(),
    product: "",
  },
  rankMetric: "revenue",
  periodRange: {
    start: 1,
    end: null,
  },
};

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
const businessHours = [17, 18, 19, 20, 21, 22, 23, 0];
const sourceLabels = {
  Kiosky: "線上點餐",
  "收銀台": "現場 POS",
  "Uber Eats": "Uber 外送平台",
};
const money = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0,
});
const integer = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });

const els = {
  dateRange: document.getElementById("dateRange"),
  monthFilter: document.getElementById("monthFilter"),
  monthButton: document.getElementById("monthButton"),
  paymentFilter: document.getElementById("paymentFilter"),
  paymentButton: document.getElementById("paymentButton"),
  sourceFilter: document.getElementById("sourceFilter"),
  sourceButton: document.getElementById("sourceButton"),
  categoryFilter: document.getElementById("categoryFilter"),
  categoryButton: document.getElementById("categoryButton"),
  productSearch: document.getElementById("productSearch"),
  rankMetric: document.getElementById("rankMetric"),
  resetFilters: document.getElementById("resetFilters"),
  kpiRevenue: document.getElementById("kpiRevenue"),
  kpiOrders: document.getElementById("kpiOrders"),
  kpiAov: document.getElementById("kpiAov"),
  kpiItems: document.getElementById("kpiItems"),
  kpiUpsizeRevenue: document.getElementById("kpiUpsizeRevenue"),
  kpiUpsizeQty: document.getElementById("kpiUpsizeQty"),
  kpiUpsizeRows: document.getElementById("kpiUpsizeRows"),
  kpiUpsizeRate: document.getElementById("kpiUpsizeRate"),
  kpiUpsizeAvg: document.getElementById("kpiUpsizeAvg"),
  kpiRevenueHint: document.getElementById("kpiRevenueHint"),
  kpiOrdersHint: document.getElementById("kpiOrdersHint"),
  kpiItemsHint: document.getElementById("kpiItemsHint"),
  monthlyTrend: document.getElementById("monthlyTrend"),
  trendNote: document.getElementById("trendNote"),
  paymentChart: document.getElementById("paymentChart"),
  onlinePaymentChart: document.getElementById("onlinePaymentChart"),
  channelTrend: document.getElementById("channelTrend"),
  channelTrendNote: document.getElementById("channelTrendNote"),
  channelTrendTable: document.getElementById("channelTrendTable"),
  paymentGroupChart: document.getElementById("paymentGroupChart"),
  onlinePaymentChartPayments: document.getElementById("onlinePaymentChartPayments"),
  onlinePaymentRateTrend: document.getElementById("onlinePaymentRateTrend"),
  onlinePaymentRateTable: document.getElementById("onlinePaymentRateTable"),
  pickupPaymentChart: document.getElementById("pickupPaymentChart"),
  paymentDetailChart: document.getElementById("paymentDetailChart"),
  paymentDetailCount: document.getElementById("paymentDetailCount"),
  paymentDetailTable: document.getElementById("paymentDetailTable"),
  paymentMonthlyTrend: document.getElementById("paymentMonthlyTrend"),
  paymentMonthlyHead: document.getElementById("paymentMonthlyHead"),
  paymentMonthlyTable: document.getElementById("paymentMonthlyTable"),
  periodStartDay: document.getElementById("periodStartDay"),
  periodEndDay: document.getElementById("periodEndDay"),
  periodRangeNote: document.getElementById("periodRangeNote"),
  periodRevenue: document.getElementById("periodRevenue"),
  periodRevenueHint: document.getElementById("periodRevenueHint"),
  periodOrders: document.getElementById("periodOrders"),
  periodOrdersHint: document.getElementById("periodOrdersHint"),
  periodAov: document.getElementById("periodAov"),
  periodOnlineShare: document.getElementById("periodOnlineShare"),
  periodOnlineShareHint: document.getElementById("periodOnlineShareHint"),
  periodTrend: document.getElementById("periodTrend"),
  periodTrendNote: document.getElementById("periodTrendNote"),
  periodTableNote: document.getElementById("periodTableNote"),
  periodTable: document.getElementById("periodTable"),
  periodProductNote: document.getElementById("periodProductNote"),
  periodProductTable: document.getElementById("periodProductTable"),
  sourceChart: document.getElementById("sourceChart"),
  productRank: document.getElementById("productRank"),
  productMonthlyTrend: document.getElementById("productMonthlyTrend"),
  productMonthlyHead: document.getElementById("productMonthlyHead"),
  productMonthlyTable: document.getElementById("productMonthlyTable"),
  categoryChart: document.getElementById("categoryChart"),
  categoryChartProducts: document.getElementById("categoryChartProducts"),
  productMix: document.getElementById("productMix"),
  productMixNote: document.getElementById("productMixNote"),
  upsizeTrend: document.getElementById("upsizeTrend"),
  upsizeTrendNote: document.getElementById("upsizeTrendNote"),
  upsizeRevenueRank: document.getElementById("upsizeRevenueRank"),
  upsizeRateRank: document.getElementById("upsizeRateRank"),
  upsizeTableCount: document.getElementById("upsizeTableCount"),
  upsizeTable: document.getElementById("upsizeTable"),
  heatmap: document.getElementById("heatmap"),
  hourChart: document.getElementById("hourChart"),
  weekdayChart: document.getElementById("weekdayChart"),
  hourMonthlyTrend: document.getElementById("hourMonthlyTrend"),
  hourMonthlyHead: document.getElementById("hourMonthlyHead"),
  hourMonthlyTable: document.getElementById("hourMonthlyTable"),
  weekdayMonthlyTrend: document.getElementById("weekdayMonthlyTrend"),
  weekdayMonthlyHead: document.getElementById("weekdayMonthlyHead"),
  weekdayMonthlyTable: document.getElementById("weekdayMonthlyTable"),
  tableCount: document.getElementById("tableCount"),
  productTable: document.getElementById("productTable"),
  deleteCandidateCount: document.getElementById("deleteCandidateCount"),
  deleteCandidateTable: document.getElementById("deleteCandidateTable"),
  insightOverview: document.getElementById("insight-overview"),
  insightProducts: document.getElementById("insight-products"),
  insightPayments: document.getElementById("insight-payments"),
  insightPeriod: document.getElementById("insight-period"),
  insightUpsize: document.getElementById("insight-upsize"),
  insightTime: document.getElementById("insight-time"),
  insightDetails: document.getElementById("insight-details"),
  printReport: document.getElementById("printReport"),
  printSubtitle: document.getElementById("printSubtitle"),
  printReportButton: document.getElementById("printReportButton"),
  printStatus: document.getElementById("printStatus"),
};

function uniqueSorted(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "zh-Hant")
  );
}

function uniqueMappedSorted(items, mapFn) {
  return [...new Set(items.map(mapFn).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "zh-Hant"));
}

function displaySource(source) {
  return sourceLabels[source] || source || "未填";
}

function isPhoneOrder(record) {
  return /^電話(0[1-9]|10)$/.test(record.table || "");
}

function orderChannel(record) {
  if (isPhoneOrder(record)) return "電話訂餐";
  return displaySource(record.source);
}

function isOnlinePaid(payment) {
  const text = payment || "";
  return text.includes("線上") || text.includes("點點付線上");
}

function paymentGroup(payment) {
  const text = payment || "";
  if (isOnlinePaid(text)) return "線上已付款";
  if (text === "現金") return "現金";
  if (text.includes("Uber")) return "Uber 平台";
  if (text.includes("LINE") || text.includes("街口") || text.includes("全支付") || text.includes("信用卡") || text.includes("悠遊付")) {
    return "現場電子支付";
  }
  return text || "其他";
}

function paymentDisplayName(payment) {
  const text = payment || "";
  if (text.includes("LINEPay") || text.includes("LINE Pay")) return "LINE Pay";
  if (text.includes("街口")) return "街口";
  if (text.includes("全支付")) return "全支付";
  if (text.includes("信用卡")) return "信用卡";
  if (text.includes("悠遊付")) return "悠遊付";
  if (text.includes("Uber")) return "UberEats";
  return text || "其他";
}

function paymentFeeRate(paymentName) {
  if (paymentName === "UberEats") return 0.35;
  if (paymentName === "LINE Pay") return 0.0231;
  if (paymentName === "信用卡") return 0.0231;
  if (paymentName === "街口") return 0.022;
  if (paymentName === "悠遊付") return 0.022;
  if (paymentName === "全支付") return 0.02;
  return null;
}

function onlineOrderPaymentMode(order) {
  return isOnlinePaid(order.payment) ? "線上先付款" : "取餐時付款";
}

function isMainBusinessHour(hour) {
  return businessHours.includes(hour);
}

function selectedValues(container) {
  return new Set([...container.querySelectorAll("input:checked")].map((input) => input.value));
}

function fillFilter(container, values, labelFn = (value) => value) {
  container.innerHTML = values
    .map(
      (value) => `
      <label class="filter-option">
        <input type="checkbox" value="${escapeHtml(value)}" />
        <span>${escapeHtml(labelFn(value))}</span>
      </label>`
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function passesOrderFilters(order) {
  const f = state.filters;
  return (
    (!f.months.size || f.months.has(order.month)) &&
    (!f.payments.size || f.payments.has(paymentGroup(order.payment))) &&
    (!f.sources.size || f.sources.has(orderChannel(order)))
  );
}

function passesItemFilters(item) {
  const f = state.filters;
  return (
    (!f.months.size || f.months.has(item.month)) &&
    (!f.payments.size || f.payments.has(paymentGroup(item.payment))) &&
    (!f.sources.size || f.sources.has(orderChannel(item))) &&
    (!f.categories.size || f.categories.has(item.category)) &&
    (!f.product || item.product.includes(f.product))
  );
}

function passesUpsizeFilters(upsize) {
  const f = state.filters;
  return (
    (!f.months.size || f.months.has(upsize.month)) &&
    (!f.payments.size || f.payments.has(paymentGroup(upsize.payment))) &&
    (!f.sources.size || f.sources.has(orderChannel(upsize))) &&
    (!f.categories.size || f.categories.has(upsize.category)) &&
    (!f.product || upsize.product.includes(f.product))
  );
}

function groupBy(items, keyFn, initFn, reduceFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item) || "未填";
    if (!map.has(key)) map.set(key, initFn(key));
    reduceFn(map.get(key), item);
  }
  return [...map.values()];
}

function sum(items, field) {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0);
}

function renderAll() {
  const orders = state.data.orders.filter(passesOrderFilters);
  const itemOrderIds = new Set(orders.map((order) => order.id));
  const items = state.data.items.filter((item) => itemOrderIds.has(item.orderId)).filter(passesItemFilters);
  const upsizes = (state.data.upsizes || []).filter((upsize) => itemOrderIds.has(upsize.orderId)).filter(passesUpsizeFilters);
  const filteredOrderIds = new Set(items.map((item) => item.orderId));
  const visibleOrders = state.filters.categories.size || state.filters.product ? orders.filter((order) => filteredOrderIds.has(order.id)) : orders;

  renderKpis(visibleOrders, items);
  renderMonthlyTrend(visibleOrders);
  renderBars(els.paymentChart, aggregatePayments(visibleOrders), "revenue", sourceValueFormatter);
  renderBars(els.sourceChart, aggregateSources(visibleOrders), "revenue", sourceValueFormatter);
  renderBars(els.onlinePaymentChart, aggregateOnlinePaymentPreference(visibleOrders), "revenue", sourceValueFormatter);
  renderChannelTrend(visibleOrders);
  renderPaymentAnalysis(visibleOrders);
  renderSamePeriodAnalysis(visibleOrders, items);
  const products = aggregateProducts(items);
  const categories = aggregateCategories(items);
  renderBars(els.productRank, products.slice(0, 18), state.rankMetric, metricFormatter(state.rankMetric));
  renderProductMonthlyTrend(items, products);
  renderBars(els.categoryChart, categories.slice(0, 8), "revenue", money);
  renderBars(els.categoryChartProducts, categories.slice(0, 10), "revenue", money);
  renderBars(els.productMix, aggregateProductMix(products).slice(0, 10), "share", percent);
  els.productMixNote.textContent = `${integer.format(products.length)} 個商品`;
  renderHeatmap(visibleOrders);
  renderBars(els.hourChart, aggregateHours(visibleOrders), "revenue", money);
  renderBars(els.weekdayChart, aggregateWeekdays(visibleOrders), "revenue", money);
  renderTimeMonthlyAnalysis(visibleOrders);
  renderProductTable(products);
  renderDeleteCandidates(products);
  renderUpsizeAnalysis(items, upsizes);
  renderInsights({ orders: visibleOrders, items, upsizes, products, categories });
  renderPrintReport({ orders: visibleOrders, items, upsizes, products, categories });
}

function renderKpis(orders, items) {
  const revenue = sum(orders, "orderTotal");
  const itemSales = sum(items, "itemTotal");
  const orderCount = new Set(orders.map((order) => order.id)).size;
  const aov = orderCount ? revenue / orderCount : 0;
  els.kpiRevenue.textContent = money.format(revenue);
  els.kpiOrders.textContent = integer.format(orderCount);
  els.kpiAov.textContent = money.format(aov);
  els.kpiItems.textContent = money.format(itemSales);
  els.kpiRevenueHint.textContent = `${orders.length ? orders[0].date : "-"} 起的篩選結果`;
  els.kpiOrdersHint.textContent = `${integer.format(orderCount)} 筆訂單`;
  els.kpiItemsHint.textContent = `${integer.format(items.length)} 筆商品列`;
}

function aggregatePayments(orders) {
  return groupBy(
    orders,
    (order) => paymentGroup(order.payment),
    (name) => ({ name, revenue: 0, orders: 0, aov: 0 }),
    (group, order) => {
      group.revenue += order.orderTotal;
      group.orders += 1;
      group.aov = group.orders ? group.revenue / group.orders : 0;
    }
  ).sort((a, b) => b.revenue - a.revenue);
}

function aggregateOnlinePaymentPreference(orders) {
  const onlineOrders = orders.filter((order) => order.source === "Kiosky");
  return groupBy(
    onlineOrders,
    (order) => onlineOrderPaymentMode(order),
    (name) => ({ name, revenue: 0, orders: 0, aov: 0 }),
    (group, order) => {
      group.revenue += order.orderTotal;
      group.orders += 1;
      group.aov = group.orders ? group.revenue / group.orders : 0;
    }
  ).sort((a, b) => b.orders - a.orders);
}

function aggregateOnlinePaymentMonthly(orders) {
  const onlineOrders = orders.filter((order) => order.source === "Kiosky");
  const months = uniqueSorted(onlineOrders, "month");
  const rows = months.map((month) => ({ month, total: 0, prepaid: 0, pickup: 0, prepaidRate: 0 }));
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  for (const order of onlineOrders) {
    const row = byMonth.get(order.month);
    row.total += 1;
    if (isOnlinePaid(order.payment)) row.prepaid += 1;
    else row.pickup += 1;
    row.prepaidRate = row.total ? row.prepaid / row.total : 0;
  }
  return rows;
}

function aggregatePaymentDetails(orders) {
  const totalRevenue = sum(orders, "orderTotal") || 1;
  return groupBy(
    orders,
    (order) => paymentDisplayName(order.payment),
    (name) => ({ name, group: "", revenue: 0, orders: 0, share: 0, aov: 0, feeRate: paymentFeeRate(name), fee: 0, netRevenue: 0 }),
    (group, order) => {
      const grouped = paymentGroup(order.payment);
      group.group = group.group && group.group !== grouped ? "線上+現場" : grouped;
      group.revenue += order.orderTotal;
      group.orders += 1;
      group.aov = group.orders ? group.revenue / group.orders : 0;
      group.share = group.revenue / totalRevenue;
      group.fee = group.feeRate === null ? 0 : group.revenue * group.feeRate;
      group.netRevenue = group.revenue - group.fee;
    }
  ).sort((a, b) => b.revenue - a.revenue);
}

function aggregatePickupPaymentDetails(orders) {
  const pickupOrders = orders.filter((order) => order.source === "Kiosky" && !isOnlinePaid(order.payment));
  return groupBy(
    pickupOrders,
    (order) => paymentDisplayName(order.payment),
    (name) => ({ name, group: paymentGroup(name), revenue: 0, orders: 0, aov: 0 }),
    (group, order) => {
      group.revenue += order.orderTotal;
      group.orders += 1;
      group.aov = group.orders ? group.revenue / group.orders : 0;
    }
  ).sort((a, b) => b.revenue - a.revenue);
}

function renderPaymentAnalysis(orders) {
  const details = aggregatePaymentDetails(orders);
  renderBars(els.paymentGroupChart, aggregatePayments(orders), "revenue", sourceValueFormatter);
  renderBars(els.onlinePaymentChartPayments, aggregateOnlinePaymentPreference(orders), "revenue", sourceValueFormatter);
  renderOnlinePaymentRateTrend(orders);
  renderBars(els.pickupPaymentChart, aggregatePickupPaymentDetails(orders), "revenue", sourceValueFormatter);
  renderBars(els.paymentDetailChart, details, "revenue", paymentDetailFormatter);
  els.paymentDetailCount.textContent = `${integer.format(details.length)} 種支付方式`;
  renderPaymentDetailTable(details);
  renderPaymentMonthlyTrend(orders, details);
}

function renderOnlinePaymentRateTrend(orders) {
  const rows = aggregateOnlinePaymentMonthly(orders);
  renderLineChart(els.onlinePaymentRateTrend, rows, {
    xField: "month",
    yField: "prepaidRate",
    yFormatter: (value) => `${(value * 100).toFixed(0)}%`,
    pointFormatter: (value) => `${(value * 100).toFixed(1)}%`,
    emptyText: "沒有線上點餐付款率資料",
  });
  els.onlinePaymentRateTable.innerHTML = rows
    .map((row, rowIndex) => {
      const previous = rowIndex ? rows[rowIndex - 1] : null;
      return `
        <tr>
          <td>${escapeHtml(row.month)}</td>
          <td class="num">${formatCountMonthlyValue(row.total, previous ? previous.total : null)}</td>
          <td class="num">${formatCountMonthlyValue(row.prepaid, previous ? previous.prepaid : null)}</td>
          <td class="num">${formatCountMonthlyValue(row.pickup, previous ? previous.pickup : null)}</td>
          <td class="num">${formatShareMonthlyValue(row.prepaidRate, previous ? previous.prepaidRate : null)}</td>
        </tr>`;
    })
    .join("");
}

function renderPaymentDetailTable(rows) {
  const totalRevenue = rows.reduce((acc, row) => acc + row.revenue, 0) || 1;
  els.paymentDetailTable.innerHTML = rows
    .map((row) => {
      const share = row.revenue / totalRevenue;
      return `
        <tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.group)}</td>
          <td class="num">${integer.format(row.orders)}</td>
          <td class="num">${money.format(row.revenue)}</td>
          <td class="num">${percent.format(share)}</td>
          <td class="num">${money.format(row.aov)}</td>
          <td class="num">${row.feeRate === null ? "-" : formatFeeRate(row.feeRate)}</td>
          <td class="num">${row.feeRate === null ? "-" : money.format(row.fee)}</td>
          <td class="num">${row.feeRate === null ? "-" : money.format(row.netRevenue)}</td>
        </tr>`;
    })
    .join("");
}

function aggregatePaymentMonthly(orders, providers) {
  const months = uniqueSorted(orders, "month");
  const rows = months.map((month) => {
    const row = { month };
    for (const provider of providers) row[provider] = 0;
    return row;
  });
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  for (const order of orders) {
    const provider = paymentDisplayName(order.payment);
    if (!providers.includes(provider)) continue;
    const row = byMonth.get(order.month);
    if (row) row[provider] += order.orderTotal;
  }
  return rows;
}

function renderPaymentMonthlyTrend(orders, details) {
  const providers = details
    .filter((row) => row.revenue > 0)
    .slice(0, 6)
    .map((row) => row.name);
  const rows = aggregatePaymentMonthly(orders, providers);
  const colors = ["#12605a", "#d95f3d", "#5176a3", "#d29a32", "#7c5fb0", "#2d9a8e"];
  renderMultiLineChart(els.paymentMonthlyTrend, rows, {
    xField: "month",
    series: providers.map((provider, index) => ({ key: provider, label: provider, color: colors[index % colors.length] })),
    yFormatter: compactMoney,
    pointFormatter: compactMoney,
    emptyText: "沒有支付方式趨勢資料",
  });
  renderPaymentMonthlyTable(rows, providers);
}

function renderPaymentMonthlyTable(rows, providers) {
  els.paymentMonthlyHead.innerHTML = `<th>月份</th>${providers.map((provider) => `<th>${escapeHtml(provider)}</th>`).join("")}`;
  els.paymentMonthlyTable.innerHTML = rows
    .map(
      (row, rowIndex) => `
      <tr>
        <td>${escapeHtml(row.month)}</td>
        ${providers.map((provider) => `<td class="num">${formatMonthlyValue(row[provider] || 0, rowIndex ? rows[rowIndex - 1][provider] || 0 : null)}</td>`).join("")}
      </tr>`
    )
    .join("");
}

function formatMonthlyValue(value, previous) {
  if (previous === null) {
    return `<span class="cell-main">${money.format(value)}</span><span class="cell-delta">基準月</span>`;
  }
  const diff = value - previous;
  const pct = previous ? diff / previous : null;
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "";
  return `<span class="cell-main">${money.format(value)}</span><span class="cell-delta ${direction}">${formatSignedThousands(diff)} / ${formatPctChange(pct)}</span>`;
}

function formatCountMonthlyValue(value, previous) {
  if (previous === null) {
    return `<span class="cell-main">${integer.format(value)}</span><span class="cell-delta">基準月</span>`;
  }
  const diff = value - previous;
  const pct = previous ? diff / previous : null;
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "";
  const sign = diff > 0 ? "+" : "";
  return `<span class="cell-main">${integer.format(value)}</span><span class="cell-delta ${direction}">${sign}${integer.format(diff)}單 / ${formatPctChange(pct)}</span>`;
}

function formatShareMonthlyValue(value, previous) {
  if (previous === null) {
    return `<span class="cell-main">${percent.format(value)}</span><span class="cell-delta">基準月</span>`;
  }
  const diff = value - previous;
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "";
  return `<span class="cell-main">${percent.format(value)}</span><span class="cell-delta ${direction}">${formatPctPointChange(diff)}</span>`;
}

function formatPctPointChange(diff) {
  const sign = diff > 0 ? "+" : "";
  return `${sign}${(diff * 100).toFixed(1)} 個百分點`;
}

function formatThousands(value) {
  return formatScaledAmount(value);
}

function formatSignedThousands(value) {
  return formatScaledAmount(value, true);
}

function formatScaledAmount(value, withSign = false) {
  const sign = withSign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  const prefix = `${sign}${value < 0 ? "-" : ""}`;
  const signedValue = (scaled, unit, digits = 1) =>
    `${prefix}${scaled.toLocaleString("zh-TW", { minimumFractionDigits: digits, maximumFractionDigits: digits })}${unit}`;
  if (abs === 0) return `${withSign ? "" : ""}0`;
  if (abs >= 10000) return signedValue(abs / 10000, "萬");
  if (abs >= 1000) return signedValue(abs / 1000, "千");
  if (abs >= 100) return signedValue(abs / 100, "百", 0);
  return `${prefix}${integer.format(abs)}元`;
}

function formatPctChange(pct) {
  if (pct === null) return "新出現";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${(pct * 100).toFixed(1)}%`;
}

function formatFeeRate(rate) {
  return `${(rate * 100).toFixed(2)}%`;
}

function aggregateSources(orders) {
  return groupBy(
    orders,
    (order) => orderChannel(order),
    (name) => ({ name, revenue: 0, orders: 0, aov: 0 }),
    (group, order) => {
      group.revenue += order.orderTotal;
      group.orders += 1;
      group.aov = group.orders ? group.revenue / group.orders : 0;
    }
  ).sort((a, b) => b.revenue - a.revenue);
}

function aggregateChannelMonthly(orders) {
  const months = uniqueSorted(orders, "month");
  const byMonth = new Map(months.map((month) => [month, { month, phoneOrders: 0, onlineOrders: 0, phoneRevenue: 0, onlineRevenue: 0 }]));
  for (const order of orders) {
    if (!byMonth.has(order.month)) {
      byMonth.set(order.month, { month: order.month, phoneOrders: 0, onlineOrders: 0, phoneRevenue: 0, onlineRevenue: 0 });
    }
    const row = byMonth.get(order.month);
    const channel = orderChannel(order);
    if (channel === "電話訂餐") {
      row.phoneOrders += 1;
      row.phoneRevenue += order.orderTotal;
    }
    if (channel === "線上點餐") {
      row.onlineOrders += 1;
      row.onlineRevenue += order.orderTotal;
    }
  }
  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

function renderChannelTrend(orders) {
  const rows = aggregateChannelMonthly(orders).filter((row) => row.phoneOrders || row.onlineOrders);
  renderDualLineChart(els.channelTrend, rows, {
    xField: "month",
    series: [
      { key: "phoneOrders", label: "電話訂餐", color: "#d95f3d" },
      { key: "onlineOrders", label: "線上點餐", color: "#12605a" },
    ],
    yFormatter: (value) => `${integer.format(value)}單`,
    pointFormatter: (value) => integer.format(value),
    emptyText: "沒有電話訂餐或線上點餐資料",
  });
  if (!rows.length) {
    els.channelTrendNote.textContent = "每月訂單數";
    els.channelTrendTable.innerHTML = "";
    return;
  }
  const first = rows[0];
  const last = rows[rows.length - 1];
  const phoneDelta = last.phoneOrders - first.phoneOrders;
  const onlineDelta = last.onlineOrders - first.onlineOrders;
  const lastTotal = last.phoneOrders + last.onlineOrders;
  const lastOnlineShare = lastTotal ? last.onlineOrders / lastTotal : 0;
  els.channelTrendNote.textContent = `${last.month} 線上佔比 ${percent.format(lastOnlineShare)}`;
  renderChannelTrendTable(rows);
}

function renderChannelTrendTable(rows) {
  els.channelTrendTable.innerHTML = rows
    .map((row, rowIndex) => {
      const total = row.phoneOrders + row.onlineOrders;
      const onlineShare = total ? row.onlineOrders / total : 0;
      const previous = rowIndex ? rows[rowIndex - 1] : null;
      const previousTotal = previous ? previous.phoneOrders + previous.onlineOrders : 0;
      const previousOnlineShare = previous && previousTotal ? previous.onlineOrders / previousTotal : null;
      return `
        <tr>
          <td>${escapeHtml(row.month)}</td>
          <td class="num">${formatCountMonthlyValue(row.phoneOrders, previous ? previous.phoneOrders : null)}</td>
          <td class="num">${formatCountMonthlyValue(row.onlineOrders, previous ? previous.onlineOrders : null)}</td>
          <td class="num">${formatCountMonthlyValue(total, previous ? previousTotal : null)}</td>
          <td class="num">${formatShareMonthlyValue(onlineShare, previousOnlineShare)}</td>
        </tr>`;
    })
    .join("");
}

function systemDayOfMonth() {
  const day = new Date().getDate();
  return Number.isFinite(day) && day > 0 ? day : 31;
}

function clampDay(value, fallback) {
  const day = Number(value);
  if (!Number.isFinite(day)) return fallback;
  return Math.min(31, Math.max(1, Math.round(day)));
}

function samePeriodRange() {
  const defaultEnd = systemDayOfMonth();
  let start = clampDay(state.periodRange.start, 1);
  let end = clampDay(state.periodRange.end, defaultEnd);
  if (start > end) [start, end] = [end, start];
  return { start, end };
}

function formatPeriodRangeLabel(month, range = samePeriodRange()) {
  const monthLabel = month.slice(5);
  return `${monthLabel}/${String(range.start).padStart(2, "0")}-${monthLabel}/${String(range.end).padStart(2, "0")}`;
}

function formatPeriodRangeText(range = samePeriodRange()) {
  return `每月 ${range.start}-${range.end} 日`;
}

function formatPeriodDaysText(range = samePeriodRange()) {
  return `${range.start}-${range.end} 日`;
}

function isWithinSamePeriod(record, range = samePeriodRange()) {
  const day = Number((record.date || "").slice(8, 10));
  return Number.isFinite(day) && day >= range.start && day <= range.end;
}

function aggregateSamePeriodMonthly(orders) {
  const range = samePeriodRange();
  const periodOrders = orders.filter((order) => isWithinSamePeriod(order, range));
  const months = uniqueSorted(periodOrders, "month");
  const rows = months.map((month) => ({
    month,
    label: formatPeriodRangeLabel(month, range),
    revenue: 0,
    orders: 0,
    aov: 0,
    phoneOrders: 0,
    onlineOrders: 0,
    onlineShare: 0,
    prepaidOrders: 0,
    onlinePaymentRate: 0,
  }));
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  for (const order of periodOrders) {
    const row = byMonth.get(order.month);
    if (!row) continue;
    const channel = orderChannel(order);
    row.revenue += order.orderTotal;
    row.orders += 1;
    if (channel === "電話訂餐") row.phoneOrders += 1;
    if (channel === "線上點餐") {
      row.onlineOrders += 1;
      if (isOnlinePaid(order.payment)) row.prepaidOrders += 1;
    }
  }
  for (const row of rows) {
    const channelTotal = row.phoneOrders + row.onlineOrders;
    row.aov = row.orders ? row.revenue / row.orders : 0;
    row.onlineShare = channelTotal ? row.onlineOrders / channelTotal : 0;
    row.onlinePaymentRate = row.onlineOrders ? row.prepaidOrders / row.onlineOrders : 0;
  }
  return rows;
}

function aggregateSamePeriodProducts(items, month) {
  const range = samePeriodRange();
  return aggregateProducts(items.filter((item) => item.month === month && isWithinSamePeriod(item, range))).sort((a, b) => b.revenue - a.revenue);
}

function renderSamePeriodAnalysis(orders, items) {
  const rows = aggregateSamePeriodMonthly(orders);
  const range = samePeriodRange();
  const latest = rows[rows.length - 1];
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;

  if (!latest) {
    els.periodRevenue.textContent = "-";
    els.periodOrders.textContent = "-";
    els.periodAov.textContent = "-";
    els.periodOnlineShare.textContent = "-";
    els.periodRangeNote.textContent = `${formatPeriodRangeText(range)}，目前篩選條件下沒有資料`;
    els.periodTrendNote.textContent = `${formatPeriodRangeText(range)}營收`;
    els.periodTableNote.textContent = "";
    els.periodTrend.innerHTML = `<div class="empty">沒有同期資料</div>`;
    els.periodTable.innerHTML = "";
    els.periodProductTable.innerHTML = "";
    return;
  }

  els.periodRevenue.textContent = money.format(latest.revenue);
  els.periodRevenueHint.textContent = previous
    ? `較前月同期 ${formatSignedThousands(latest.revenue - previous.revenue)} / ${formatPctChange(previous.revenue ? (latest.revenue - previous.revenue) / previous.revenue : null)}`
    : formatPeriodRangeText(range);
  els.periodOrders.textContent = integer.format(latest.orders);
  els.periodOrdersHint.textContent = previous
    ? `較前月同期 ${signedInt(latest.orders - previous.orders)} 單`
    : `${latest.label}`;
  els.periodAov.textContent = money.format(latest.aov);
  els.periodOnlineShare.textContent = percent.format(latest.onlineShare);
  els.periodOnlineShareHint.textContent = `${integer.format(latest.onlineOrders)} 線上 / ${integer.format(latest.phoneOrders)} 電話`;
  els.periodRangeNote.textContent = `${formatPeriodRangeText(range)}，所有月份套用同一區間`;
  els.periodTrendNote.textContent = `${formatPeriodRangeText(range)}營收`;
  els.periodTableNote.textContent = `${latest.month} 對比前月同期`;

  renderLineChart(els.periodTrend, rows, {
    xField: "month",
    yField: "revenue",
    yFormatter: compactMoney,
    pointFormatter: compactMoney,
    emptyText: "沒有同期營收資料",
  });
  renderSamePeriodTable(rows);
  renderSamePeriodProductTable(items, latest.month, previous?.month);
}

function renderSamePeriodTable(rows) {
  els.periodTable.innerHTML = rows
    .map((row, rowIndex) => {
      const previous = rowIndex ? rows[rowIndex - 1] : null;
      return `
        <tr>
          <td>${escapeHtml(row.label)}</td>
          <td class="num">${formatMonthlyValue(row.revenue, previous ? previous.revenue : null)}</td>
          <td class="num">${formatCountMonthlyValue(row.orders, previous ? previous.orders : null)}</td>
          <td class="num">${formatMonthlyValue(row.aov, previous ? previous.aov : null)}</td>
          <td class="num">${formatCountMonthlyValue(row.phoneOrders, previous ? previous.phoneOrders : null)}</td>
          <td class="num">${formatCountMonthlyValue(row.onlineOrders, previous ? previous.onlineOrders : null)}</td>
          <td class="num">${formatShareMonthlyValue(row.onlineShare, previous ? previous.onlineShare : null)}</td>
          <td class="num">${formatShareMonthlyValue(row.onlinePaymentRate, previous ? previous.onlinePaymentRate : null)}</td>
        </tr>`;
    })
    .join("");
}

function renderSamePeriodProductTable(items, latestMonth, previousMonth) {
  const latestRows = aggregateSamePeriodProducts(items, latestMonth).slice(0, 10);
  const previousRows = previousMonth ? aggregateSamePeriodProducts(items, previousMonth) : [];
  const previousByKey = new Map(previousRows.map((row) => [`${row.name}|||${row.category}`, row]));
  els.periodProductNote.textContent = `${latestMonth} ${formatPeriodDaysText()}前 10 名`;
  els.periodProductTable.innerHTML = latestRows
    .map((row) => {
      const previous = previousByKey.get(`${row.name}|||${row.category}`);
      return `
        <tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.category)}</td>
          <td class="num">${money.format(row.revenue)}</td>
          <td class="num">${integer.format(row.quantity)}</td>
          <td class="num">${integer.format(row.orders)}</td>
          <td class="num">${previous ? `${formatSignedThousands(row.revenue - previous.revenue)} / ${formatPctChange(previous.revenue ? (row.revenue - previous.revenue) / previous.revenue : null)}` : "新進榜"}</td>
        </tr>`;
    })
    .join("");
}

function aggregateCategories(items) {
  return groupBy(
    items,
    (item) => item.category,
    (name) => ({ name, revenue: 0, quantity: 0, ordersSet: new Set(), orders: 0 }),
    (group, item) => {
      group.revenue += item.itemTotal;
      group.quantity += item.quantity;
      group.ordersSet.add(item.orderId);
      group.orders = group.ordersSet.size;
    }
  ).sort((a, b) => b.revenue - a.revenue);
}

function aggregateProducts(items) {
  return groupBy(
    items,
    (item) => `${item.product}|||${item.category}`,
    (key) => {
      const [product, category] = key.split("|||");
      return { name: product, category, revenue: 0, quantity: 0, ordersSet: new Set(), orders: 0, avg: 0 };
    },
    (group, item) => {
      group.revenue += item.itemTotal;
      group.quantity += item.quantity;
      group.ordersSet.add(item.orderId);
      group.orders = group.ordersSet.size;
      group.avg = group.quantity ? group.revenue / group.quantity : 0;
    }
  ).sort((a, b) => b[state.rankMetric] - a[state.rankMetric]);
}

function aggregateProductMix(products) {
  const total = products.reduce((acc, product) => acc + product.revenue, 0) || 1;
  return products
    .map((product) => ({ name: product.name, share: product.revenue / total, revenue: product.revenue }))
    .sort((a, b) => b.share - a.share);
}

function aggregateProductMonthly(items, productNames) {
  const months = uniqueSorted(items, "month");
  const rows = months.map((month) => {
    const row = { month };
    for (const product of productNames) row[product] = 0;
    return row;
  });
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  for (const item of items) {
    if (!productNames.includes(item.product)) continue;
    const row = byMonth.get(item.month);
    if (row) row[item.product] += item.itemTotal;
  }
  return rows;
}

function renderProductMonthlyTrend(items, products) {
  const productNames = products
    .filter((product) => product.revenue > 0)
    .slice(0, 6)
    .map((product) => product.name);
  const rows = aggregateProductMonthly(items, productNames);
  const colors = ["#12605a", "#d95f3d", "#5176a3", "#d29a32", "#7c5fb0", "#2d9a8e"];
  renderMultiLineChart(els.productMonthlyTrend, rows, {
    xField: "month",
    series: productNames.map((product, index) => ({ key: product, label: product, color: colors[index % colors.length] })),
    yFormatter: compactMoney,
    pointFormatter: compactMoney,
    emptyText: "沒有商品趨勢資料",
  });
  renderProductMonthlyTable(rows, productNames);
}

function renderProductMonthlyTable(rows, productNames) {
  els.productMonthlyHead.innerHTML = `<th>月份</th>${productNames.map((product) => `<th>${escapeHtml(product)}</th>`).join("")}`;
  els.productMonthlyTable.innerHTML = rows
    .map(
      (row, rowIndex) => `
      <tr>
        <td>${escapeHtml(row.month)}</td>
        ${productNames.map((product) => `<td class="num">${formatMonthlyValue(row[product] || 0, rowIndex ? rows[rowIndex - 1][product] || 0 : null)}</td>`).join("")}
      </tr>`
    )
    .join("");
}

function aggregateHours(orders) {
  const map = new Map(
    businessHours.map((hour) => [
      hour,
      {
        name: `${String(hour).padStart(2, "0")}:00`,
        hour,
        revenue: 0,
        orders: 0,
      },
    ])
  );
  for (const order of orders) {
    if (!isMainBusinessHour(order.hour)) continue;
    const group = map.get(order.hour);
    group.revenue += order.orderTotal;
    group.orders += 1;
  }
  return [...map.values()];
}

function hourLabel(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function aggregateHourMonthly(orders) {
  const months = uniqueSorted(orders, "month");
  const rows = months.map((month) => {
    const row = { month };
    for (const hour of businessHours) row[`h${hour}`] = 0;
    return row;
  });
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  for (const order of orders) {
    if (!isMainBusinessHour(order.hour)) continue;
    const row = byMonth.get(order.month);
    if (row) row[`h${order.hour}`] += order.orderTotal;
  }
  return rows;
}

function aggregateWeekdays(orders) {
  const dayMap = new Map(weekdays.map((day, index) => [index, { name: `週${day}`, weekday: index, revenue: 0, orders: 0 }]));
  for (const order of orders) {
    const group = dayMap.get(order.weekday);
    group.revenue += order.orderTotal;
    group.orders += 1;
  }
  return [...dayMap.values()].sort((a, b) => b.revenue - a.revenue);
}

function aggregateWeekdayMonthly(orders) {
  const months = uniqueSorted(orders, "month");
  const rows = months.map((month) => {
    const row = { month };
    weekdays.forEach((_, index) => {
      row[`d${index}`] = 0;
    });
    return row;
  });
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  for (const order of orders) {
    const row = byMonth.get(order.month);
    if (row) row[`d${order.weekday}`] += order.orderTotal;
  }
  return rows;
}

function renderTimeMonthlyAnalysis(orders) {
  renderHourMonthlyAnalysis(orders);
  renderWeekdayMonthlyAnalysis(orders);
}

function renderHourMonthlyAnalysis(orders) {
  const rows = aggregateHourMonthly(orders);
  const colors = ["#12605a", "#d95f3d", "#5176a3", "#d29a32", "#7c5fb0", "#2d9a8e", "#8b6f47", "#c15d8a"];
  const series = businessHours.map((hour, index) => ({
    key: `h${hour}`,
    label: hourLabel(hour),
    color: colors[index % colors.length],
  }));
  renderMultiLineChart(els.hourMonthlyTrend, rows, {
    xField: "month",
    series,
    yFormatter: compactMoney,
    pointFormatter: compactMoney,
    emptyText: "沒有主要營業時段月資料",
  });
  renderMonthlyMatrixTable(
    els.hourMonthlyHead,
    els.hourMonthlyTable,
    rows,
    businessHours.map((hour) => ({ key: `h${hour}`, label: hourLabel(hour) }))
  );
}

function renderWeekdayMonthlyAnalysis(orders) {
  const rows = aggregateWeekdayMonthly(orders);
  const colors = ["#12605a", "#d95f3d", "#5176a3", "#d29a32", "#7c5fb0", "#2d9a8e", "#8b6f47"];
  const series = weekdays.map((day, index) => ({
    key: `d${index}`,
    label: `週${day}`,
    color: colors[index % colors.length],
  }));
  renderMultiLineChart(els.weekdayMonthlyTrend, rows, {
    xField: "month",
    series,
    yFormatter: compactMoney,
    pointFormatter: compactMoney,
    emptyText: "沒有星期月資料",
  });
  renderMonthlyMatrixTable(
    els.weekdayMonthlyHead,
    els.weekdayMonthlyTable,
    rows,
    weekdays.map((day, index) => ({ key: `d${index}`, label: `週${day}` }))
  );
}

function renderMonthlyMatrixTable(headEl, bodyEl, rows, columns) {
  headEl.innerHTML = `<th>月份</th>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}`;
  bodyEl.innerHTML = rows
    .map(
      (row, rowIndex) => `
      <tr>
        <td>${escapeHtml(row.month)}</td>
        ${columns.map((column) => `<td class="num">${formatMonthlyValue(row[column.key] || 0, rowIndex ? rows[rowIndex - 1][column.key] || 0 : null)}</td>`).join("")}
      </tr>`
    )
    .join("");
}

function aggregateUpsizes(items, upsizes) {
  const map = new Map();
  const ensure = (product, category) => {
    const key = `${product}|||${category}`;
    if (!map.has(key)) {
      map.set(key, {
        name: product,
        category,
        itemQty: 0,
        upsizeQty: 0,
        upsizeRows: 0,
        extraRevenue: 0,
        rate: 0,
        avgExtra: 0,
      });
    }
    return map.get(key);
  };

  for (const item of items) {
    const group = ensure(item.product, item.category);
    group.itemQty += item.quantity;
  }
  for (const upsize of upsizes) {
    const group = ensure(upsize.product, upsize.category);
    group.upsizeQty += upsize.quantity;
    group.upsizeRows += 1;
    group.extraRevenue += upsize.extraRevenue;
  }
  for (const group of map.values()) {
    group.rate = group.itemQty ? group.upsizeQty / group.itemQty : 0;
    group.avgExtra = group.upsizeQty ? group.extraRevenue / group.upsizeQty : 0;
  }
  return [...map.values()].sort((a, b) => b.extraRevenue - a.extraRevenue);
}

function renderUpsizeAnalysis(items, upsizes) {
  const rows = aggregateUpsizes(items, upsizes).filter((row) => row.upsizeQty > 0 || row.itemQty > 0);
  const upsizeRows = rows.filter((row) => row.upsizeQty > 0);
  const eligibleItemQty = upsizeRows.reduce((total, row) => total + row.itemQty, 0);
  const upsizeQty = upsizeRows.reduce((total, row) => total + row.upsizeQty, 0);
  const extraRevenue = upsizeRows.reduce((total, row) => total + row.extraRevenue, 0);
  const upsizeRate = eligibleItemQty ? upsizeQty / eligibleItemQty : 0;
  const avgExtra = upsizeQty ? extraRevenue / upsizeQty : 0;

  els.kpiUpsizeRevenue.textContent = money.format(extraRevenue);
  els.kpiUpsizeQty.textContent = integer.format(upsizeQty);
  els.kpiUpsizeRows.textContent = `${integer.format(upsizes.length)} 筆大份選項`;
  els.kpiUpsizeRate.textContent = percent.format(upsizeRate);
  els.kpiUpsizeAvg.textContent = money.format(avgExtra);

  renderUpsizeTrend(upsizes);
  renderBars(els.upsizeRevenueRank, upsizeRows.slice(0, 12), "extraRevenue", money);
  renderBars(
    els.upsizeRateRank,
    upsizeRows
      .filter((row) => row.itemQty >= 20)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 12),
    "rate",
    percent
  );
  renderUpsizeTable(upsizeRows.sort((a, b) => b.extraRevenue - a.extraRevenue));
}

function renderUpsizeTrend(upsizes) {
  const rows = groupBy(
    upsizes,
    (upsize) => upsize.month,
    (month) => ({ month, revenue: 0, quantity: 0 }),
    (group, upsize) => {
      group.revenue += upsize.extraRevenue;
      group.quantity += upsize.quantity;
    }
  ).sort((a, b) => a.month.localeCompare(b.month));

  renderLineChart(els.upsizeTrend, rows, {
    xField: "month",
    yField: "revenue",
    yFormatter: compactMoney,
    pointFormatter: compactMoney,
    emptyText: "沒有符合篩選的加大資料",
  });
  if (!rows.length) {
    els.upsizeTrendNote.textContent = "";
    return;
  }
  const best = [...rows].sort((a, b) => b.revenue - a.revenue)[0];
  els.upsizeTrendNote.textContent = `${best.month} 最高 ${money.format(best.revenue)}`;
}

function renderUpsizeTable(rows) {
  const topRows = rows.slice(0, 250);
  els.upsizeTableCount.textContent = `${integer.format(rows.length)} 個有加大的商品`;
  els.upsizeTable.innerHTML = topRows
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.category)}</td>
        <td class="num">${integer.format(row.itemQty)}</td>
        <td class="num">${integer.format(row.upsizeQty)}</td>
        <td class="num">${percent.format(row.rate)}</td>
        <td class="num">${money.format(row.extraRevenue)}</td>
        <td class="num">${money.format(row.avgExtra)}</td>
      </tr>`
    )
    .join("");
}

function metricFormatter(metric) {
  if (metric === "revenue") return money;
  return integer;
}

const percent = {
  format(value) {
    return `${(value * 100).toFixed(1)}%`;
  },
};

const sourceValueFormatter = {
  format(value, row) {
    return `${money.format(value)} / ${integer.format(row.orders)}單`;
  },
};

const paymentDetailFormatter = {
  format(value, row) {
    return `${money.format(value)} / ${integer.format(row.orders)}單`;
  },
};

function renderBars(container, rows, metric, formatter) {
  if (!rows.length) {
    container.innerHTML = `<div class="empty">沒有符合篩選的資料</div>`;
    return;
  }
  const max = Math.max(...rows.map((row) => row[metric]), 1);
  container.innerHTML = rows
    .map((row) => {
      const pct = Math.max(2, (row[metric] / max) * 100);
      return `
        <div class="bar-row" title="${escapeHtml(row.name)}">
          <div class="bar-label">${escapeHtml(row.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="bar-value">${formatter.format(row[metric], row)}</div>
        </div>`;
    })
    .join("");
}

function renderMonthlyTrend(orders) {
  const rows = groupBy(
    orders,
    (order) => order.month,
    (month) => ({ month, revenue: 0, orders: 0 }),
    (group, order) => {
      group.revenue += order.orderTotal;
      group.orders += 1;
    }
  ).sort((a, b) => a.month.localeCompare(b.month));

  if (!rows.length) {
    els.monthlyTrend.innerHTML = `<div class="empty">沒有符合篩選的資料</div>`;
    els.trendNote.textContent = "";
    return;
  }
  renderLineChart(els.monthlyTrend, rows, {
    xField: "month",
    yField: "revenue",
    yFormatter: shortMoney,
    pointFormatter: shortMoney,
    emptyText: "沒有符合篩選的資料",
  });
  const best = [...rows].sort((a, b) => b.revenue - a.revenue)[0];
  els.trendNote.textContent = `${best.month} 最高 ${money.format(best.revenue)}`;
}

function renderLineChart(container, rows, options) {
  const width = 920;
  const height = 300;
  const pad = { top: 22, right: 28, bottom: 44, left: 76 };
  if (!rows.length) {
    container.innerHTML = `<div class="empty">${options.emptyText}</div>`;
    return;
  }
  const max = Math.max(...rows.map((row) => row[options.yField] || 0), 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = rows.length > 1 ? innerW / (rows.length - 1) : innerW;
  const points = rows.map((row, i) => {
    const x = pad.left + (rows.length > 1 ? i * step : innerW / 2);
    const y = pad.top + innerH - (row[options.yField] / max) * innerH;
    return { ...row, x, y };
  });
  const area = `${pad.left},${pad.top + innerH} ${points.map((p) => `${p.x},${p.y}`).join(" ")} ${pad.left + innerW},${pad.top + innerH}`;
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = pad.top + innerH - ratio * innerH;
    return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e0e7e3" />
      <text x="${pad.left - 10}" y="${y + 4}" text-anchor="end" class="axis">${options.yFormatter(max * ratio)}</text>`;
  });
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="月營收趨勢圖">
      ${ticks.join("")}
      <polygon points="${area}" fill="#dcefe8"></polygon>
      <polyline points="${line}" fill="none" stroke="#12605a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${points
        .map(
          (p) => `
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="#d95f3d"></circle>
          <text x="${p.x}" y="${height - 16}" text-anchor="middle" class="axis">${String(p[options.xField]).slice(5)}</text>
          <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" class="axis">${options.pointFormatter(p[options.yField])}</text>`
        )
        .join("")}
    </svg>`;
}

function renderDualLineChart(container, rows, options) {
  const width = 920;
  const height = 320;
  const pad = { top: 42, right: 30, bottom: 48, left: 76 };
  if (!rows.length) {
    container.innerHTML = `<div class="empty">${options.emptyText}</div>`;
    return;
  }
  const max = Math.max(...rows.flatMap((row) => options.series.map((series) => row[series.key] || 0)), 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = rows.length > 1 ? innerW / (rows.length - 1) : innerW;
  const xFor = (index) => pad.left + (rows.length > 1 ? index * step : innerW / 2);
  const yFor = (value) => pad.top + innerH - (value / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = pad.top + innerH - ratio * innerH;
    return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e0e7e3" />
      <text x="${pad.left - 10}" y="${y + 4}" text-anchor="end" class="axis">${options.yFormatter(max * ratio)}</text>`;
  });
  const lines = options.series
    .map((series) => {
      const points = rows.map((row, index) => `${xFor(index)},${yFor(row[series.key] || 0)}`).join(" ");
      const dots = rows
        .map((row, index) => {
          const value = row[series.key] || 0;
          const x = xFor(index);
          const y = yFor(value);
          return `<circle cx="${x}" cy="${y}" r="5" fill="${series.color}"></circle>
            <text x="${x}" y="${y - 10}" text-anchor="middle" class="axis">${options.pointFormatter(value)}</text>`;
        })
        .join("");
      return `<polyline points="${points}" fill="none" stroke="${series.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>${dots}`;
    })
    .join("");
  const legend = options.series
    .map((series, index) => {
      const x = pad.left + index * 116;
      return `<circle cx="${x}" cy="18" r="5" fill="${series.color}"></circle>
        <text x="${x + 12}" y="23" class="axis">${series.label}</text>`;
    })
    .join("");
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="電話訂餐與線上點餐月趨勢">
      ${legend}
      ${ticks.join("")}
      ${lines}
      ${rows
        .map((row, index) => `<text x="${xFor(index)}" y="${height - 16}" text-anchor="middle" class="axis">${row.month.slice(5)}</text>`)
        .join("")}
    </svg>`;
}

function renderMultiLineChart(container, rows, options) {
  const width = 920;
  const height = 360;
  const pad = { top: 58, right: 30, bottom: 48, left: 76 };
  if (!rows.length || !options.series.length) {
    container.innerHTML = `<div class="empty">${options.emptyText}</div>`;
    return;
  }
  const max = Math.max(...rows.flatMap((row) => options.series.map((series) => row[series.key] || 0)), 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = rows.length > 1 ? innerW / (rows.length - 1) : innerW;
  const xFor = (index) => pad.left + (rows.length > 1 ? index * step : innerW / 2);
  const yFor = (value) => pad.top + innerH - (value / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = pad.top + innerH - ratio * innerH;
    return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e0e7e3" />
      <text x="${pad.left - 10}" y="${y + 4}" text-anchor="end" class="axis">${options.yFormatter(max * ratio)}</text>`;
  });
  const legend = options.series
    .map((series, index) => {
      const x = pad.left + (index % 3) * 190;
      const y = 18 + Math.floor(index / 3) * 22;
      return `<circle cx="${x}" cy="${y}" r="5" fill="${series.color}"></circle>
        <text x="${x + 12}" y="${y + 5}" class="axis">${series.label}</text>`;
    })
    .join("");
  const lines = options.series
    .map((series) => {
      const points = rows.map((row, index) => `${xFor(index)},${yFor(row[series.key] || 0)}`).join(" ");
      const dots = rows
        .map((row, index) => {
          const value = row[series.key] || 0;
          return `<circle cx="${xFor(index)}" cy="${yFor(value)}" r="4" fill="${series.color}">
            <title>${series.label} ${row[options.xField]} ${money.format(value)}</title>
          </circle>`;
        })
        .join("");
      return `<polyline points="${points}" fill="none" stroke="${series.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>${dots}`;
    })
    .join("");
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="支付方式月趨勢">
      ${legend}
      ${ticks.join("")}
      ${lines}
      ${rows
        .map((row, index) => `<text x="${xFor(index)}" y="${height - 16}" text-anchor="middle" class="axis">${row.month.slice(5)}</text>`)
        .join("")}
    </svg>`;
}

function shortMoney(value) {
  if (value >= 10000) return `${Math.round(value / 10000)}萬`;
  return integer.format(value);
}

function compactMoney(value) {
  if (value >= 10000) {
    const wan = value / 10000;
    return `${Number.isInteger(wan) ? wan.toFixed(0) : wan.toFixed(1)}萬`;
  }
  return integer.format(value);
}

function signedInt(value) {
  if (value > 0) return `+${integer.format(value)}`;
  return integer.format(value);
}

function renderHeatmap(orders) {
  const matrix = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  for (const order of orders) {
    matrix[order.weekday][order.hour] += order.orderTotal;
  }
  const max = Math.max(...matrix.flat(), 1);
  const cell = 31;
  const left = 42;
  const top = 28;
  const width = left + 24 * cell + 12;
  const height = top + 7 * cell + 28;
  const cells = [];
  for (let d = 0; d < 7; d += 1) {
    for (let h = 0; h < 24; h += 1) {
      const value = matrix[d][h];
      const intensity = value / max;
      const fill = heatColor(intensity);
      const stroke = isMainBusinessHour(h) ? "#b9d7cc" : "transparent";
      cells.push(
        `<rect x="${left + h * cell}" y="${top + d * cell}" width="27" height="27" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5">
          <title>週${weekdays[d]} ${h}:00 ${money.format(value)}</title>
        </rect>`
      );
    }
  }
  els.heatmap.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="時段熱度圖">
      ${Array.from({ length: 24 }, (_, h) =>
        h % 2 === 0 ? `<text x="${left + h * cell + 13}" y="16" text-anchor="middle" class="axis">${h}</text>` : ""
      ).join("")}
      ${weekdays.map((day, d) => `<text x="26" y="${top + d * cell + 18}" text-anchor="middle" class="axis">${day}</text>`).join("")}
      ${cells.join("")}
    </svg>`;
}

function heatColor(intensity) {
  const light = 94 - intensity * 46;
  const sat = 42 + intensity * 22;
  return `hsl(168 ${sat}% ${light}%)`;
}

function renderProductTable(rows) {
  const topRows = rows.slice(0, 250);
  els.tableCount.textContent = `${integer.format(rows.length)} 個商品 / 顯示前 ${integer.format(topRows.length)} 筆`;
  els.productTable.innerHTML = topRows
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.category)}</td>
        <td class="num">${integer.format(row.quantity)}</td>
        <td class="num">${money.format(row.revenue)}</td>
        <td class="num">${integer.format(row.orders)}</td>
        <td class="num">${money.format(row.avg)}</td>
      </tr>`
    )
    .join("");
}

function isExcludedFromDeleteCandidate(product) {
  const name = product.name || "";
  const category = product.category || "";
  const patterns = ["紙盒", "盒", "蒜", "蔥", "九層塔", "椒鹽", "調味", "配料", "#全部調味", "加購"];
  return category === "調味/配料" || patterns.some((pattern) => name.includes(pattern));
}

function getDeleteCandidates(products) {
  const candidates = products
    .filter((product) => product.revenue > 0)
    .filter((product) => !isExcludedFromDeleteCandidate(product))
    .map((product) => {
      const reasons = [];
      if (product.revenue < 5000) reasons.push("銷售額低");
      if (product.orders < 80) reasons.push("訂單數低");
      if (product.quantity < 100) reasons.push("銷售量低");
      return {
        ...product,
        score: product.revenue + product.orders * 35 + product.quantity * 20,
        reason: reasons.length ? reasons.join("、") : "相對尾端",
      };
    })
    .sort((a, b) => a.score - b.score);
  return candidates.slice(0, 12);
}

function renderDeleteCandidates(products) {
  const candidates = getDeleteCandidates(products);
  els.deleteCandidateCount.textContent = `${integer.format(candidates.length)} 個候選，已排除包材與調味`;
  els.deleteCandidateTable.innerHTML = candidates
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.category)}</td>
        <td class="num">${integer.format(row.quantity)}</td>
        <td class="num">${money.format(row.revenue)}</td>
        <td class="num">${integer.format(row.orders)}</td>
        <td class="num">${money.format(row.avg)}</td>
        <td>${escapeHtml(row.reason)}</td>
      </tr>`
    )
    .join("");
}

function renderInsights(context) {
  const { orders, items, upsizes, products, categories } = context;
  renderInsightPanel(els.insightOverview, "AI 建議分析", buildOverviewInsights(orders, items));
  renderInsightPanel(els.insightProducts, "AI 建議分析", buildProductInsights(items, products, categories));
  renderInsightPanel(els.insightPayments, "AI 建議分析", buildPaymentInsights(orders));
  renderInsightPanel(els.insightPeriod, "AI 建議分析", buildSamePeriodInsights(orders, items));
  renderInsightPanel(els.insightUpsize, "AI 建議分析", buildUpsizeInsights(items, upsizes));
  renderInsightPanel(els.insightTime, "AI 建議分析", buildTimeInsights(orders));
  renderInsightPanel(els.insightDetails, "AI 建議分析", buildDetailInsights(products));
}

function renderInsightPanel(container, title, insights) {
  container.innerHTML = `
    <h2>${escapeHtml(title)}</h2>
    <div class="insight-grid">
      ${insights
        .map(
          (insight) => `
          <article class="insight-card">
            <strong>${escapeHtml(insight.title)}</strong>
            <p>${escapeHtml(insight.body)}</p>
          </article>`
        )
        .join("")}
    </div>`;
}

function renderPrintReport(context) {
  const { orders, items, upsizes, products, categories } = context;
  const revenue = sum(orders, "orderTotal");
  const orderCount = new Set(orders.map((order) => order.id)).size;
  const aov = orderCount ? revenue / orderCount : 0;
  const sourceRows = aggregateSources(orders);
  const paymentRows = aggregatePaymentDetails(orders);
  const feeRows = paymentRows.filter((row) => row.feeRate !== null);
  const totalFee = feeRows.reduce((acc, row) => acc + row.fee, 0);
  const netRevenue = revenue - totalFee;
  const productRows = products.slice(0, 10);
  const deleteCandidates = getDeleteCandidates(products).slice(0, 8);
  const upsizeRows = aggregateUpsizes(items, upsizes).filter((row) => row.upsizeQty > 0);
  const upsizeRevenue = upsizeRows.reduce((acc, row) => acc + row.extraRevenue, 0);
  const channelRows = aggregateChannelMonthly(orders).filter((row) => row.phoneOrders || row.onlineOrders);
  const onlinePaymentRows = aggregateOnlinePaymentMonthly(orders);
  const samePeriodRows = aggregateSamePeriodMonthly(orders);
  const topHours = aggregateHours(orders).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const hourMonthlyRows = aggregateHourMonthly(orders);
  const weekdayMonthlyRows = aggregateWeekdayMonthly(orders);
  const overviewInsights = buildOverviewInsights(orders, items);
  const paymentInsights = buildPaymentInsights(orders);
  const samePeriodInsights = buildSamePeriodInsights(orders, items);
  const productInsights = buildProductInsights(items, products, categories);
  const upsizeInsights = buildUpsizeInsights(items, upsizes);
  const timeInsights = buildTimeInsights(orders);

  els.printSubtitle.textContent = `${state.data.meta.dateMin} - ${state.data.meta.dateMax}，依目前篩選條件產生`;
  els.printReport.innerHTML = `
    <header class="print-report-head">
      <p>POSKY 交易明細</p>
      <h1>八番炸營運分析報表</h1>
      <span>${escapeHtml(els.printSubtitle.textContent)}</span>
    </header>

    <section class="print-kpis">
      ${printKpi("營收", money.format(revenue))}
      ${printKpi("訂單", `${integer.format(orderCount)} 單`)}
      ${printKpi("平均客單", money.format(aov))}
      ${printKpi("預估手續費", money.format(totalFee))}
      ${printKpi("扣費後淨收", money.format(netRevenue))}
      ${printKpi("加大額外營收", money.format(upsizeRevenue))}
    </section>

    ${printSection("通路表現", printSimpleTable(["通路", "營收 / 訂單"], sourceRows.map((row) => [row.name, `${money.format(row.revenue)} / ${integer.format(row.orders)}單`])))}

    ${printSection("電話訂餐 vs 線上點餐", printSimpleTable(
      ["月份", "電話訂餐", "線上點餐", "線上佔比"],
      channelRows.map((row) => {
        const total = row.phoneOrders + row.onlineOrders;
        return [row.month, `${integer.format(row.phoneOrders)}單`, `${integer.format(row.onlineOrders)}單`, percent.format(total ? row.onlineOrders / total : 0)];
      })
    ))}

    ${printSection("線上付款率", printSimpleTable(
      ["月份", "線上點餐", "線上先付款", "取餐時付款", "線上付款率"],
      onlinePaymentRows.map((row) => [row.month, `${integer.format(row.total)}單`, `${integer.format(row.prepaid)}單`, `${integer.format(row.pickup)}單`, percent.format(row.prepaidRate)])
    ))}

    ${printSection("每月同期比較", printSimpleTable(
      ["同期", "營收", "訂單", "客單", "線上佔比", "線上付款率"],
      samePeriodRows.map((row) => [row.label, money.format(row.revenue), `${integer.format(row.orders)}單`, money.format(row.aov), percent.format(row.onlineShare), percent.format(row.onlinePaymentRate)])
    ))}

    ${printSection("支付與手續費", printSimpleTable(
      ["支付方式", "營收", "費率", "預估手續費", "淨收"],
      paymentRows.map((row) => [row.name, money.format(row.revenue), row.feeRate === null ? "-" : formatFeeRate(row.feeRate), row.feeRate === null ? "-" : money.format(row.fee), row.feeRate === null ? "-" : money.format(row.netRevenue)])
    ))}

    ${printSection("熱賣品項", printSimpleTable(
      ["商品", "類型", "數量", "銷售額", "訂單數"],
      productRows.map((row) => [row.name, row.category, integer.format(row.quantity), money.format(row.revenue), integer.format(row.orders)])
    ))}

    ${printSection("建議檢討品項", printSimpleTable(
      ["商品", "類型", "銷售額", "訂單數", "原因"],
      deleteCandidates.map((row) => [row.name, row.category, money.format(row.revenue), integer.format(row.orders), row.reason])
    ))}

    ${printSection("加大分析", printSimpleTable(
      ["商品", "加大份數", "加大率", "額外營收"],
      upsizeRows.slice(0, 8).map((row) => [row.name, integer.format(row.upsizeQty), percent.format(row.rate), money.format(row.extraRevenue)])
    ))}

    ${printSection("主要營業時段", printSimpleTable(
      ["時段", "營收", "訂單"],
      topHours.map((row) => [row.name, money.format(row.revenue), `${integer.format(row.orders)}單`])
    ))}

    ${printSection("主要營業時段月差異", printSimpleTable(
      ["月份", ...businessHours.map(hourLabel)],
      hourMonthlyRows.map((row) => [row.month, ...businessHours.map((hour) => money.format(row[`h${hour}`] || 0))])
    ))}

    ${printSection("星期表現月差異", printSimpleTable(
      ["月份", ...weekdays.map((day) => `週${day}`)],
      weekdayMonthlyRows.map((row) => [row.month, ...weekdays.map((_, index) => money.format(row[`d${index}`] || 0))])
    ))}

    ${printSection("AI 建議摘要", printInsightList([...overviewInsights, ...samePeriodInsights, ...paymentInsights, ...productInsights, ...upsizeInsights, ...timeInsights].slice(0, 10)))}
  `;
}

function printKpi(label, value) {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function printSection(title, body) {
  return `<section class="print-section"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function printSimpleTable(headers, rows) {
  return `
    <table class="print-table">
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>`;
}

function printInsightList(insights) {
  return `
    <div class="print-insights">
      ${insights.map((insight) => `<article><strong>${escapeHtml(insight.title)}</strong><p>${escapeHtml(insight.body)}</p></article>`).join("")}
    </div>`;
}

function buildPrintableDocument() {
  const styles = [...document.querySelectorAll("link[rel='stylesheet']")]
    .map((link) => `<link rel="stylesheet" href="${link.href}">`)
    .join("");
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>八番炸營運分析報表</title>
  ${styles}
  <style>
    body { background: #fff; padding: 24px; }
    .print-report { box-shadow: none; border: 0; max-width: 1120px; margin: 0 auto; }
    @media print {
      body { padding: 0; }
      .print-report { border: 0; }
    }
  </style>
</head>
<body>
  <main class="print-report">${els.printReport.innerHTML}</main>
  <script>
    window.addEventListener("load", () => {
      setTimeout(() => {
        window.focus();
        window.print();
      }, 300);
    });
  <\/script>
</body>
</html>`;
}

function printReport() {
  if (els.printStatus) {
    els.printStatus.textContent = "正在準備列印版報表...";
  }

  try {
    sessionStorage.setItem("poskyPrintReport", buildPrintableDocument());
    window.location.href = "./print.html";
    return;
  } catch (error) {
    if (els.printStatus) {
      els.printStatus.textContent = "瀏覽器無法建立列印頁，請直接按 Cmd+P 列印這份報表。";
    }
    window.print();
  }
}

function buildOverviewInsights(orders, items) {
  const sources = aggregateSources(orders);
  const channelRows = aggregateChannelMonthly(orders).filter((row) => row.phoneOrders || row.onlineOrders);
  const latest = channelRows[channelRows.length - 1];
  const phone = sources.find((row) => row.name === "電話訂餐") || { orders: 0, revenue: 0 };
  const online = sources.find((row) => row.name === "線上點餐") || { orders: 0, revenue: 0 };
  const topCategory = aggregateCategories(items)[0] || { name: "-", revenue: 0 };
  const latestShare = latest ? latest.onlineOrders / Math.max(latest.phoneOrders + latest.onlineOrders, 1) : 0;
  return [
    {
      title: "降低接電話人力",
      body: `電話訂餐仍有 ${integer.format(phone.orders)} 單、${money.format(phone.revenue)}。建議在電話結束語、門口立牌、LINE 訊息放線上點餐 QR code，目標先把電話單轉 20% 到線上。`,
    },
    {
      title: "線上替代率追蹤",
      body: latest
        ? `${latest.month} 線上佔比為 ${percent.format(latestShare)}。若要減少尖峰接電話，建議每月追蹤線上佔比，低於 55% 時加強線上點餐誘因。`
        : "目前沒有電話與線上點餐比較資料，建議保留通路標記後再追蹤替代率。",
    },
    {
      title: "主力分類優先推廣",
      body: `${topCategory.name} 是目前最大分類，營收 ${money.format(topCategory.revenue)}。建議線上點餐首頁先放這類商品，減少客人選擇時間並提高轉單率。`,
    },
  ];
}

function buildProductInsights(items, products, categories) {
  const trend = productMonthlyGrowth(items, products[0]?.name);
  const topProduct = products[0] || { name: "-", revenue: 0, quantity: 0 };
  const topThreeRevenue = products.slice(0, 3).reduce((acc, row) => acc + row.revenue, 0);
  const totalRevenue = products.reduce((acc, row) => acc + row.revenue, 0) || 1;
  const topCategory = categories[0] || { name: "-", revenue: 0 };
  return [
    {
      title: "主力品項維持曝光",
      body: `${topProduct.name} 是最高營收品項，佔商品銷售 ${percent.format(topProduct.revenue / totalRevenue)}。建議放在線上點餐第一屏與套餐搭配，提高點選效率。`,
    },
    {
      title: "觀察熱賣品項動能",
      body: trend
        ? `${topProduct.name} 最新月較前月 ${formatSignedThousands(trend.diff)}、${formatPctChange(trend.pct)}。若連續下滑，建議檢查照片、排序、缺貨與出餐品質。`
        : "目前月份不足以判斷熱賣品項動能，建議至少累積兩個完整月份後追蹤。",
    },
    {
      title: "降低品項分散",
      body: `前三名商品合計佔 ${percent.format(topThreeRevenue / totalRevenue)}。若備料壓力高，可優先砍低銷售且製程複雜品項，把人力集中在 ${topCategory.name}。`,
    },
  ];
}

function buildPaymentInsights(orders) {
  const paymentRows = aggregatePaymentDetails(orders);
  const onlinePref = aggregateOnlinePaymentPreference(orders);
  const pickup = aggregatePickupPaymentDetails(orders);
  const linePay = paymentRows.find((row) => row.name === "LINE Pay") || { revenue: 0, orders: 0 };
  const feeRows = paymentRows.filter((row) => row.feeRate !== null);
  const totalFee = feeRows.reduce((acc, row) => acc + row.fee, 0);
  const highestFee = [...feeRows].sort((a, b) => b.fee - a.fee)[0] || { name: "-", fee: 0 };
  const cashPickup = pickup.find((row) => row.name === "現金") || { orders: 0, revenue: 0 };
  return [
    {
      title: "手續費要看淨收",
      body: `已套用多元支付費率後，預估手續費合計 ${money.format(totalFee)}。其中 ${highestFee.name} 手續費最高，約 ${money.format(highestFee.fee)}，建議用淨收而非營收看獲利。`,
    },
    {
      title: "線上點餐付款轉換",
      body: onlinePref.length
        ? `線上點餐仍有 ${onlinePref[0].name} ${integer.format(onlinePref[0].orders)} 單。可測試「線上先付款送小配料」來減少到店收款與找零時間。`
        : "目前沒有線上點餐付款偏好資料。",
    },
    {
      title: "現金作業成本",
      body: `線上點餐取餐時付款中，現金有 ${integer.format(cashPickup.orders)} 單、${money.format(cashPickup.revenue)}。若尖峰結帳塞車，應優先推線上付款而非只增加人手。`,
    },
  ];
}

function buildSamePeriodInsights(orders, items) {
  const rows = aggregateSamePeriodMonthly(orders);
  const rangeText = formatPeriodRangeText();
  const latest = rows[rows.length - 1];
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;
  if (!latest) {
    return [
      {
        title: "尚無同期資料",
        body: "目前篩選條件下沒有每月同期資料。建議先清除月份篩選，再看全店 1 日到最新日期的比較。",
      },
    ];
  }

  const best = [...rows].sort((a, b) => b.revenue - a.revenue)[0] || latest;
  const latestProducts = aggregateSamePeriodProducts(items, latest.month).slice(0, 5);
  const topProduct = latestProducts[0] || { name: "-", revenue: 0, quantity: 0 };
  const revenueDiff = previous ? latest.revenue - previous.revenue : 0;
  const revenuePct = previous && previous.revenue ? revenueDiff / previous.revenue : null;
  const orderDiff = previous ? latest.orders - previous.orders : 0;
  const aovDiff = previous ? latest.aov - previous.aov : 0;
  const onlineShareDiff = previous ? latest.onlineShare - previous.onlineShare : 0;

  return [
    {
      title: "先看同期，不被月中資料誤導",
      body: previous
        ? `${latest.month} ${rangeText}營收 ${money.format(latest.revenue)}，較 ${previous.month} 同期 ${formatSignedThousands(revenueDiff)}、${formatPctChange(revenuePct)}。若要追業績，先把目標設成超過最佳同期 ${best.month} 的 ${money.format(best.revenue)}。`
        : `${latest.month} ${rangeText}營收 ${money.format(latest.revenue)}。之後每次匯入月中資料，都可用這頁避免拿不同天數誤比。`,
    },
    {
      title: "成長來源拆成訂單與客單",
      body: previous
        ? `較前月同期訂單 ${signedInt(orderDiff)} 單、客單 ${formatSignedThousands(aovDiff)}。若訂單少但客單高，應加強曝光；若訂單多但客單低，優先推加大、套餐與高毛利配料。`
        : `目前同期訂單 ${integer.format(latest.orders)} 單、客單 ${money.format(latest.aov)}。建議用這兩個指標分辨是來客不足，還是每單買得不夠。`,
    },
    {
      title: "把電話單轉成線上單",
      body: previous
        ? `同期線上替代率 ${percent.format(latest.onlineShare)}，較前月同期 ${formatPctPointChange(onlineShareDiff)}。建議對電話客固定回覆「下次可用線上點餐免等待」，並在熱門時段把 QR code 放在社群與店門口。`
        : `同期電話 ${integer.format(latest.phoneOrders)} 單、線上 ${integer.format(latest.onlineOrders)} 單。若目標是降低接電話，應把線上點餐入口放到客人最容易看到的位置。`,
    },
    {
      title: "用同期熱賣品項拉高營收",
      body: `${latest.month} 同期最高品項是 ${topProduct.name}，銷售 ${money.format(topProduct.revenue)}。建議把前 3 名做成線上點餐首頁排序、套餐組合或限時提醒，先複製已經被客人驗證的需求。`,
    },
  ];
}

function buildUpsizeInsights(items, upsizes) {
  const rows = aggregateUpsizes(items, upsizes).filter((row) => row.upsizeQty > 0);
  const bestRevenue = rows[0] || { name: "-", extraRevenue: 0, rate: 0 };
  const bestRate = [...rows].filter((row) => row.itemQty >= 20).sort((a, b) => b.rate - a.rate)[0] || bestRevenue;
  const totalExtra = rows.reduce((acc, row) => acc + row.extraRevenue, 0);
  return [
    {
      title: "把加大變成預設提醒",
      body: `加大額外營收為 ${money.format(totalExtra)}。建議在線上點餐對可加大品項加醒目選項，並在 POS 結帳口語提醒「要不要加大」。`,
    },
    {
      title: "優先推高額加大品項",
      body: `${bestRevenue.name} 的加大額外營收最高，達 ${money.format(bestRevenue.extraRevenue)}。建議把它放在加大提示的第一批測試品項。`,
    },
    {
      title: "加大率代表接受度",
      body: `${bestRate.name} 加大率約 ${percent.format(bestRate.rate)}。高接受度品項可考慮做「大份推薦」或套餐升級，提高客單價。`,
    },
  ];
}

function buildTimeInsights(orders) {
  const hours = aggregateHours(orders).sort((a, b) => b.revenue - a.revenue);
  const weekdaysRows = aggregateWeekdays(orders);
  const topHour = hours[0] || { name: "-", revenue: 0, orders: 0 };
  const topDay = weekdaysRows[0] || { name: "-", revenue: 0 };
  const offHourOrders = orders.filter((order) => !isMainBusinessHour(order.hour));
  return [
    {
      title: "尖峰前備料",
      body: `以 17:00-24:00 主營業時段來看，${topHour.name} 是最高營收時段，營收 ${money.format(topHour.revenue)}。建議尖峰前 30 分鐘完成熱門品項備料。`,
    },
    {
      title: "排班看星期",
      body: `${topDay.name} 是最高營收日，營收 ${money.format(topDay.revenue)}。建議高峰日安排熟手負責炸台與包裝，新手避開最忙時段。`,
    },
    {
      title: "零散訂單不要干擾排班",
      body: `17:00-24:00 以外有 ${integer.format(offHourOrders.length)} 筆零散訂單。建議排班和備料以主營業時段為主，零散訂單只作為開收店流程參考。`,
    },
  ];
}

function buildDetailInsights(products) {
  const candidates = getDeleteCandidates(products).slice(0, 5);
  const top = products[0] || { name: "-", revenue: 0 };
  return [
    {
      title: "明細表用來找刪減候選",
      body: `可從明細表排序找低營收品項。若低營收品項備料複雜、保存短，建議列為下架或限時供應候選。`,
    },
    {
      title: "複製熱賣品項邏輯",
      body: `${top.name} 是目前最強品項。建議檢查它的價格帶、份量感、照片與分類位置，把成功元素複製到第二梯商品。`,
    },
    {
      title: "尾端商品要定期檢討",
      body: candidates.length
        ? `目前建議檢討品項包含 ${candidates.map((row) => row.name).join("、")}。已排除紙盒與調味加購，建議看備料複雜度後決定是否下架。`
        : "目前沒有足夠的非包材、非調味品項可列為刪減候選。",
    },
  ];
}

function productMonthlyGrowth(items, productName) {
  if (!productName) return null;
  const rows = aggregateProductMonthly(items, [productName]);
  if (rows.length < 2) return null;
  const current = rows[rows.length - 1][productName] || 0;
  const previous = rows[rows.length - 2][productName] || 0;
  return { diff: current - previous, pct: previous ? (current - previous) / previous : null };
}

function initFilters() {
  const { orders, items, meta } = state.data;
  if (!state.periodRange.end) state.periodRange.end = systemDayOfMonth();
  fillFilter(els.monthFilter, uniqueSorted(orders, "month"));
  fillFilter(els.paymentFilter, uniqueMappedSorted(orders, (order) => paymentGroup(order.payment)));
  fillFilter(els.sourceFilter, uniqueMappedSorted(orders, orderChannel));
  fillFilter(els.categoryFilter, uniqueSorted(items, "category"));
  els.dateRange.textContent = `${meta.dateMin} - ${meta.dateMax}，${integer.format(meta.orderCount)} 筆訂單`;
  syncPeriodRangeControls();
  updateFilterButtons();
}

function attachEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.viewTarget));
  });
  bindFilter(els.monthFilter, els.monthButton, "months");
  bindFilter(els.paymentFilter, els.paymentButton, "payments");
  bindFilter(els.sourceFilter, els.sourceButton, "sources");
  bindFilter(els.categoryFilter, els.categoryButton, "categories");
  els.productSearch.addEventListener("input", () => {
    state.filters.product = els.productSearch.value.trim();
    renderAll();
  });
  els.rankMetric.addEventListener("change", () => {
    state.rankMetric = els.rankMetric.value;
    renderAll();
  });
  [els.periodStartDay, els.periodEndDay].forEach((input) => {
    input.addEventListener("change", updateSamePeriodRange);
    input.addEventListener("input", updateSamePeriodRange);
  });
  els.resetFilters.addEventListener("click", () => {
    for (const container of [els.monthFilter, els.paymentFilter, els.sourceFilter, els.categoryFilter]) {
      for (const input of container.querySelectorAll("input")) input.checked = false;
    }
    els.productSearch.value = "";
    state.filters = { months: new Set(), payments: new Set(), sources: new Set(), categories: new Set(), product: "" };
    updateFilterButtons();
    renderAll();
  });
  els.printReportButton.addEventListener("click", printReport);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".filter-control")) {
      closeFilters();
    }
  });
}

function syncPeriodRangeControls() {
  const range = samePeriodRange();
  els.periodStartDay.value = range.start;
  els.periodEndDay.value = range.end;
}

function updateSamePeriodRange() {
  state.periodRange.start = clampDay(els.periodStartDay.value, 1);
  state.periodRange.end = clampDay(els.periodEndDay.value, systemDayOfMonth());
  syncPeriodRangeControls();
  renderAll();
}

function switchView(view) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.viewTarget === view);
  });
  document.querySelectorAll(".view-page").forEach((page) => {
    page.classList.toggle("active", page.dataset.view === view);
  });
  closeFilters();
}

function bindFilter(container, button, stateKey) {
  button.addEventListener("click", () => {
    const control = button.closest(".filter-control");
    const isOpen = control.classList.contains("open");
    closeFilters();
    control.classList.toggle("open", !isOpen);
  });
  container.addEventListener("change", () => {
    state.filters[stateKey] = selectedValues(container);
    updateFilterButtons();
    renderAll();
  });
}

function closeFilters() {
  document.querySelectorAll(".filter-control.open").forEach((control) => control.classList.remove("open"));
}

function updateFilterButtons() {
  setFilterButton(els.monthButton, "全部月份", state.filters.months);
  setFilterButton(els.paymentButton, "全部付款", state.filters.payments);
  setFilterButton(els.sourceButton, "全部來源", state.filters.sources);
  setFilterButton(els.categoryButton, "全部類型", state.filters.categories);
}

function setFilterButton(button, allText, values) {
  if (!values.size) {
    button.textContent = allText;
    return;
  }
  const selected = [...values];
  button.textContent = selected.length === 1 ? selected[0] : `已選 ${selected.length} 項`;
}

async function boot() {
  try {
    const response = await fetch("./data.json?v=6");
    if (!response.ok) throw new Error("資料檔讀取失敗");
    state.data = await response.json();
  } catch (error) {
    if (!window.POSKY_EMBEDDED_DATA) throw error;
    state.data = window.POSKY_EMBEDDED_DATA;
  }
  initFilters();
  attachEvents();
  renderAll();
}

boot().catch((error) => {
  document.body.innerHTML = `<main><section class="panel"><h1>資料載入失敗</h1><p>${escapeHtml(error.message)}</p></section></main>`;
});

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSalesTeamWise, fetchSalesMonthly } from "../Sales/SalesOrderAPI";
import { format } from "date-fns";
import { useLocation } from "wouter";
import {
  fetchOutstandingTeamWise,
  fetchOverdueOutstandingTeamWise,
} from "../Payments/balanceSheetAPI";
import {
  fetchOrderBdmWise,
  fetchFunnelBdmWise,
  fetchOrderMonthly,
  fetchOEFMonthly,
} from "../Order/OrderAPI";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  fetchAccountOwnerStatus,
  getAccountGroupRevenue,
} from "../Accounts/accountsAPI";
import {
  dailyCallStatus,
  fetchEngineerProductivity,
  mwDailyDashboard,
} from "../Services/TicketAPI";
import { fetchPurchaseMonthly } from "../Purchase/PurchaseAPI";
import DateFilter from "../../utils/date-filter";
import { encodeBase64UrlSafe } from "../../utils/calculateMargin";

export function MonthlySales() {
  const [, navigate] = useLocation();

  const { selectedWarehouse } = useSelector((state) => state.locations);
  const { filteredSales = [] } = useSelector((state) => state.salesOrder);
  const dispatch = useDispatch();

  const fetchSales = useCallback(() => {
    dispatch(
      fetchSalesMonthly({
        locationName: selectedWarehouse?.id,
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    if (!selectedWarehouse?.id) return;
    fetchSales();
  }, [fetchSales, selectedWarehouse?.id]);

  const chartData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Function to check leap year
    const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    // Function to get last day of month
    const getLastDayOfMonth = (month, year) => {
      if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
      }
      const monthDays = [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return monthDays[month - 1];
    };

    return filteredSales.map((item) => {
      const lastDay = getLastDayOfMonth(item.month, item.year);

      return {
        name: `${monthNames[item.month - 1]} ${item.year}`,
        revenue: item.revenue,
        from: `${item.year}${String(item.month).padStart(2, "0")}01`,
        to: `${item.year}${String(item.month).padStart(2, "0")}${lastDay}`,
      };
    });
  }, [filteredSales]);

  const handleBarClick = ({ from, to }) => {
    const date = `${from}-${to}`;
    navigate(`/sales-record/${date}`);
  };

  return (
    <>
      {filteredSales.length > 0 && (
        <Card className="w-full lg:w-[calc(50%-0.75rem)]">
          <CardHeader>
            <CardTitle>Monthly Billed Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto">
              <div className="w-[550px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 40 }}
                    onClick={(chartEvent) => {
                      if (chartEvent && chartEvent.activePayload) {
                        const clickedData =
                          chartEvent.activePayload[0]?.payload;
                        handleBarClick(clickedData);
                      }
                    }}
                    cursor="pointer"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      className="text-sm"
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `₹${value.toLocaleString("en-IN")}`
                      }
                      width={120}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        "Sales",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Sales"
                      fill="hsl(var(--chart-3))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
export function MonthlyPurchases() {
  const [, navigate] = useLocation();

  const { selectedWarehouse } = useSelector((state) => state.locations);
  const { filteredPurchase = [] } = useSelector(
    (state) => state.purchaseRegister
  );
  const dispatch = useDispatch();

  const fetchPurchase = useCallback(() => {
    dispatch(
      fetchPurchaseMonthly({
        locationName: selectedWarehouse?.id,
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    if (!selectedWarehouse?.id) return;
    fetchPurchase();
  }, [fetchPurchase, selectedWarehouse?.id]);

  const chartData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Function to check leap year
    const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    // Function to get last day of month
    const getLastDayOfMonth = (month, year) => {
      if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
      }
      const monthDays = [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return monthDays[month - 1];
    };

    return filteredPurchase.map((item) => {
      const lastDay = getLastDayOfMonth(item.month, item.year);

      return {
        name: `${monthNames[item.month - 1]} ${item.year}`,
        revenue: item.revenue,
        from: `${item.year}${String(item.month).padStart(2, "0")}01`,
        to: `${item.year}${String(item.month).padStart(2, "0")}${lastDay}`,
      };
    });
  }, [filteredPurchase]);

  const handleBarClick = ({ from, to }) => {
    const date = `${from}-${to}`;
    navigate(`/purchase-record/${date}`);
  };

  return (
    <>
      {filteredPurchase?.length > 0 && (
        <Card className="w-full lg:w-[calc(50%-0.75rem)]">
          <CardHeader>
            <CardTitle>Monthly Purchase Register</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto">
              <div className="w-[550px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 40 }}
                    onClick={(chartEvent) => {
                      if (chartEvent && chartEvent.activePayload) {
                        const clickedData =
                          chartEvent.activePayload[0]?.payload;
                        handleBarClick(clickedData);
                      }
                    }}
                    cursor="pointer"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      className="text-sm"
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `₹${value.toLocaleString("en-IN")}`
                      }
                      width={120}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        "Sales",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Sales"
                      fill="hsl(var(--chart-2))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
export function MonthlyOEF() {
  const [, navigate] = useLocation();

  const { selectedWarehouse } = useSelector((state) => state.locations);
  const { filteredOrders = [] } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  const fetchOrders = useCallback(() => {
    dispatch(
      fetchOEFMonthly({
        locationName: selectedWarehouse?.id,
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    if (!selectedWarehouse?.id) return;
    fetchOrders();
  }, [fetchOrders, selectedWarehouse?.id]);

  const chartData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Function to check leap year
    const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    // Function to get last day of month
    const getLastDayOfMonth = (month, year) => {
      if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
      }
      const monthDays = [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return monthDays[month - 1];
    };

    return filteredOrders.map((item) => {
      const lastDay = getLastDayOfMonth(item.month, item.year);

      return {
        name: `${monthNames[item.month - 1]} ${item.year}`,
        revenue: item.revenue,
        from: `${item.year}${String(item.month).padStart(2, "0")}01`,
        to: `${item.year}${String(item.month).padStart(2, "0")}${lastDay}`,
      };
    });
  }, [filteredOrders]);

  const handleBarClick = ({ from, to }) => {
    const date = `${from}-${to}`;
    navigate(`/order-record/${date}`);
  };

  return (
    <>
      {filteredOrders.length > 0 && (
        <Card className="w-full lg:w-[calc(50%-0.75rem)]">
          <CardHeader>
            <CardTitle>Monthly OEF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto">
              <div className="w-[550px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 40 }}
                    onClick={(chartEvent) => {
                      if (chartEvent && chartEvent.activePayload) {
                        const clickedData =
                          chartEvent.activePayload[0]?.payload;
                        handleBarClick(clickedData);
                      }
                    }}
                    cursor="pointer"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      className="text-sm"
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `₹${value.toLocaleString("en-IN")}`
                      }
                      width={120}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        "Orders",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Orders"
                      fill="hsl(var(--chart-1))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
export function MonthlyOrders() {
  const [, navigate] = useLocation();

  const { selectedWarehouse } = useSelector((state) => state.locations);
  const { filteredFunnels = [] } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  const fetchOrders = useCallback(() => {
    dispatch(
      fetchOrderMonthly({
        locationName: selectedWarehouse?.id,
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    if (!selectedWarehouse?.id) return;
    fetchOrders();
  }, [fetchOrders, selectedWarehouse?.id]);

  const chartData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Function to check leap year
    const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    // Function to get last day of month
    const getLastDayOfMonth = (month, year) => {
      if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
      }
      const monthDays = [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return monthDays[month - 1];
    };

    return filteredFunnels.map((item) => {
      const lastDay = getLastDayOfMonth(item.month, item.year);

      return {
        name: `${monthNames[item.month - 1]} ${item.year}`,
        revenue: item.revenue,
        from: `${item.year}${String(item.month).padStart(2, "0")}01`,
        to: `${item.year}${String(item.month).padStart(2, "0")}${lastDay}`,
      };
    });
  }, [filteredFunnels]);

  const handleBarClick = ({ from, to }) => {
    const date = `${from}-${to}`;
    navigate(`/funnels-record/${date}`);
  };

  return (
    <>
      {filteredFunnels.length > 0 && (
        <Card className="w-full lg:w-[calc(50%-0.75rem)]">
          <CardHeader>
            <CardTitle>Monthly Closed Won Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto">
              <div className="w-[550px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 40 }}
                    onClick={(chartEvent) => {
                      if (chartEvent && chartEvent.activePayload) {
                        const clickedData =
                          chartEvent.activePayload[0]?.payload;
                        handleBarClick(clickedData);
                      }
                    }}
                    cursor="pointer"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      className="text-sm"
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `₹${value.toLocaleString("en-IN")}`
                      }
                      width={120}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        "Orders",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Orders"
                      fill="hsl(var(--chart-5))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
export function BUPerformanceChart() {
  const [, navigate] = useLocation();
  const getFinancialYearStart = () => {
    const today = new Date();
    const year =
      today.getMonth() + 1 >= 4 ? today.getFullYear() : today.getFullYear() - 1;
    return new Date(year, 3, 1);
  };

  const { selectedWarehouse } = useSelector((state) => state.locations);
  const { result = [] } = useSelector((state) => state.salesOrder);
  const dispatch = useDispatch();

  const fetchSales = useCallback(() => {
    dispatch(
      fetchSalesTeamWise({
        locationName: selectedWarehouse?.id,
        from: format(getFinancialYearStart(), "yyyyMMdd"),
        to: format(new Date(), "yyyyMMdd"),
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    if (!selectedWarehouse?.id) return;
    fetchSales();
  }, [fetchSales, selectedWarehouse?.id]);

  const chartData = result
    ?.map((item) => ({
      name: item.teamName,
      revenue: item.revenue,
      id: item.teamId, // make sure API returns this
    }))
    ?.sort((a, b) => b.revenue - a.revenue); // 🔹 Sort highest first

  const handleBarClick = (id) => {
    navigate(`/sales-record/${id}`);
  };

  return (
    <Card className="w-full lg:w-[calc(50%-0.75rem)]">
      <CardHeader>
        <CardTitle>Sales by Business Units</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-auto">
          {/* give the inner container a bigger width so it scrolls */}
          <div className="w-[550px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 0, left: 0, bottom: 40 }}
                onClick={(chartEvent) => {
                  if (chartEvent && chartEvent.activePayload) {
                    const clickedData = chartEvent.activePayload[0]?.payload;
                    handleBarClick(clickedData.id);
                  }
                }}
                cursor="pointer"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  className="text-sm"
                  interval={0} // force show all labels
                  angle={-45} // tilt labels for readability
                  textAnchor="end"
                />
                <YAxis
                  tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                  width={120} // extra space for large numbers
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    undefined,
                  ]}
                  cursor="pointer"
                />
                {/* <Legend /> */}
                <Bar
                  dataKey="revenue"
                  name="Sales"
                  fill="hsl(var(--chart-3))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BUOutstandingChart() {
  const [, navigate] = useLocation();

  const { selectedWarehouse } = useSelector((state) => state.locations);
  const { result = [] } = useSelector((state) => state.balanceSheet);
  const dispatch = useDispatch();

  const fetchBillWise = useCallback(() => {
    dispatch(
      fetchOutstandingTeamWise({
        locationName: selectedWarehouse?.id,
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    if (!selectedWarehouse?.id) return;
    fetchBillWise();
  }, [fetchBillWise, selectedWarehouse?.id]);

  const chartData = result
    ?.map((item) => ({
      name: item.teamName,
      revenue: Math.abs(item.revenue),
      id: item.teamId, // make sure API returns this
    }))
    ?.sort((a, b) => b.revenue - a.revenue); // 🔹 Sort highest first

  const handleBarClick = (id) => {
    navigate(`/bill-wise-outstanding/${id}`);
  };

  return (
    <Card className="w-full lg:w-[calc(50%-0.75rem)]">
      <CardHeader>
        <CardTitle>Outstanding Team Wise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-auto">
          {/* give the inner container a bigger width so it scrolls */}
          <div className="w-[550px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 0, left: 0, bottom: 40 }}
                onClick={(chartEvent) => {
                  if (chartEvent && chartEvent.activePayload) {
                    const clickedData = chartEvent.activePayload[0]?.payload;
                    handleBarClick(clickedData.id);
                  }
                }}
                cursor="pointer"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  className="text-sm"
                  interval={0} // force show all labels
                  angle={-45} // tilt labels for readability
                  textAnchor="end"
                />
                <YAxis
                  tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                  width={120} // extra space for large numbers
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    undefined,
                  ]}
                  cursor="pointer"
                />
                {/* <Legend /> */}
                <Bar
                  dataKey="revenue"
                  name="Sales"
                  fill="hsl(var(--chart-1))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export function BUOverdueOutstandingChart() {
  const [, navigate] = useLocation();

  const { selectedWarehouse } = useSelector((state) => state.locations);
  const { overdue = [] } = useSelector((state) => state.balanceSheet);
  const dispatch = useDispatch();

  const fetchBillWise = useCallback(() => {
    dispatch(
      fetchOverdueOutstandingTeamWise({
        locationName: selectedWarehouse?.id,
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    if (!selectedWarehouse?.id) return;
    fetchBillWise();
  }, [fetchBillWise, selectedWarehouse?.id]);

  const chartData = overdue
    ?.map((item) => ({
      name: item.teamName,
      revenue: Math.abs(item.revenue),
      id: item.teamId, // make sure API returns this
    }))
    ?.sort((a, b) => b.revenue - a.revenue); // 🔹 Sort highest first

  const handleBarClick = (id) => {
    navigate(`/bill-wise-outstanding/${id}/0 days`);
  };

  return (
    <Card className="w-full lg:w-[calc(50%-0.75rem)]">
      <CardHeader>
        <CardTitle>Overdue Payment Team Wise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-auto">
          {/* give the inner container a bigger width so it scrolls */}
          <div className="w-[550px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 0, left: 0, bottom: 40 }}
                onClick={(chartEvent) => {
                  if (chartEvent && chartEvent.activePayload) {
                    const clickedData = chartEvent.activePayload[0]?.payload;
                    handleBarClick(clickedData.id);
                  }
                }}
                cursor="pointer"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  className="text-sm"
                  interval={0} // force show all labels
                  angle={-45} // tilt labels for readability
                  textAnchor="end"
                />
                <YAxis
                  tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                  width={120} // extra space for large numbers
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    undefined,
                  ]}
                  cursor="pointer"
                />
                {/* <Legend /> */}
                <Bar
                  dataKey="revenue"
                  name="Sales"
                  fill="hsl(var(--chart-4))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export function FunnelList() {
  const {
    currentMonthFunnel = "",
    lastMonthFunnel = "",
    dataFunnel = [],
  } = useSelector((state) => state.orders);
  const { selectedWarehouse } = useSelector((state) => state.locations);
  const dispatch = useDispatch();

  const fetchFunnelBdm = useCallback(() => {
    dispatch(
      fetchFunnelBdmWise({
        locationId: selectedWarehouse?.id,
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    fetchFunnelBdm();
  }, [fetchFunnelBdm]);
  return (
    <>
      {dataFunnel.length > 0 && (
        <Card className="w-full lg:w-[calc(50%-0.75rem)]">
          <CardHeader className="pb-3">
            <CardTitle>Funnel Closed Won</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-200 max-h-96 lg:max-h-80 overflow-y-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BDM Name</TableHead>
                  <TableHead>{lastMonthFunnel}</TableHead>
                  <TableHead>{currentMonthFunnel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataFunnel.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data?.bdmName}</TableCell>
                    <TableCell>
                      ₹
                      {data?.lastMonth.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      ₹
                      {data?.currentMonth.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
export function OrdersList() {
  const {
    currentMonth = "",
    lastMonth = "",
    data = [],
  } = useSelector((state) => state.orders);
  const { selectedWarehouse } = useSelector((state) => state.locations);
  const dispatch = useDispatch();

  const fetchOrdersBdm = useCallback(() => {
    dispatch(
      fetchOrderBdmWise({
        locationId: selectedWarehouse?.id,
      })
    );
  }, [dispatch, selectedWarehouse?.id]);

  useEffect(() => {
    fetchOrdersBdm();
  }, [fetchOrdersBdm]);
  return (
    <>
      {data.length > 0 && (
        <Card className="w-full lg:w-[calc(50%-0.75rem)]">
          <CardHeader className="pb-3">
            <CardTitle>OEF Orders</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-200 max-h-96 lg:max-h-80 overflow-y-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BDM Name</TableHead>
                  <TableHead>{lastMonth}</TableHead>
                  <TableHead>{currentMonth}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data?.bdmName}</TableCell>
                    <TableCell>
                      ₹
                      {data?.lastMonth.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      ₹
                      {data?.currentMonth.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
export function RevenueAccount() {
  const { result = [] } = useSelector((state) => state.accounts);
  const getFinancialYearStart = () => {
    const today = new Date();
    const year =
      today.getMonth() + 1 >= 4 ? today.getFullYear() : today.getFullYear() - 1;
    return new Date(year, 3, 1);
  };
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      getAccountGroupRevenue({
        from: format(getFinancialYearStart(), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
      })
    );
  }, [dispatch]);

  return (
    <>
      <Card className="w-full lg:w-[calc(50%-0.75rem)]">
        <CardHeader className="pb-3">
          <CardTitle>Group Wise Revenue</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-200 max-h-96 lg:max-h-80 overflow-y-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result?.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{data?.groupName}</TableCell>
                  <TableCell className="text-right">
                    ₹
                    {data?.totalRevenue.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
export function DailyDashboard() {
  const { serviceDashboard = [] } = useSelector((state) => state.ticket);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(mwDailyDashboard({}));
  }, [dispatch]);

  return (
    <>
      {serviceDashboard.length > 0 && (
        <Card className="w-full lg:w-[calc(50%-0.75rem)]">
          <CardHeader className="pb-3">
            <CardTitle>Service Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-200 max-h-96 lg:max-h-80 overflow-y-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>0-5 Days</TableHead>
                  <TableHead>6-10 Days</TableHead>
                  <TableHead>11-30 Days</TableHead>
                  <TableHead>{"> 30 Days"}</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceDashboard?.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data?.ticketOwner}</TableCell>
                    <TableCell>{data?.series}</TableCell>
                    <TableCell className="text-green-500 font-bold">
                      {data?.["0-5"]}
                    </TableCell>
                    <TableCell className="text-yellow-500 font-bold">
                      {data?.["6-10"]}
                    </TableCell>
                    <TableCell className="text-orange-500 font-bold">
                      {data?.["11-30"]}
                    </TableCell>
                    <TableCell className="text-red-500 font-bold">
                      {data?.[">30"]}
                    </TableCell>
                    <TableCell className="text-blue-500 font-bold">
                      {data?.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
export function DailyCalls() {
  const { callStatus = [] } = useSelector((state) => state.ticket);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(new Date());

  const [toDate, setToDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("Today");

  useEffect(() => {
    dispatch(
      dailyCallStatus({
        from: fromDate,
        to: toDate,
      })
    );
  }, [dispatch, fromDate, toDate]);

  return (
    <>
      {/* {callStatus.length > 0 && ( */}
      <Card className="w-full lg:w-[calc(50%-0.75rem)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex justify-between gap-2 items-center">
            <span>Call Details</span>
            <DateFilter
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              selectedRange={selectedRange}
              setSelectedRange={setSelectedRange}
            />
          </CardTitle>
          <div className="w-1/2"></div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-200 max-h-96 lg:max-h-80 overflow-y-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Calls Logged</TableHead>
                <TableHead>Calls Closed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{callStatus?.totalLoggedToday}</TableCell>
                <TableCell>{callStatus?.totalClosedToday}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* )} */}
    </>
  );
}
export function EngineerProductivity() {
  const { engineerProductivity = [] } = useSelector((state) => state.ticket);
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(new Date());

  const [toDate, setToDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("Today");

  useEffect(() => {
    dispatch(
      fetchEngineerProductivity({
        from: fromDate,
        to: toDate,
      })
    );
  }, [dispatch, fromDate, toDate]);

  return (
    <>
      {/* {callStatus.length > 0 && ( */}
      <Card className="w-full lg:w-[calc(50%-0.75rem)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex justify-between gap-2 items-center">
            <span>Engineer Productivity</span>
            <DateFilter
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              selectedRange={selectedRange}
              setSelectedRange={setSelectedRange}
            />
          </CardTitle>
          <div className="w-1/2"></div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-200 max-h-96 lg:max-h-80 overflow-y-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Engineer Name</TableHead>
                <TableHead>Calls Assigned</TableHead>
                <TableHead>Calls Closed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engineerProductivity?.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{data?.engineerName}</TableCell>
                  <TableCell>{data?.callAllocated}</TableCell>
                  <TableCell>{data?.callClosed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* )} */}
    </>
  );
}
export function AccountOwnerStatus() {
  const { details = [] } = useSelector((state) => state.accounts);
  const dispatch = useDispatch();

  const getFinancialYearStart = () => {
    const today = new Date();
    const year =
      today.getMonth() + 1 >= 4 ? today.getFullYear() : today.getFullYear() - 1;
    return new Date(year, 3, 1);
  };

  useEffect(() => {
    dispatch(
      fetchAccountOwnerStatus({
        from: getFinancialYearStart(),
        to: new Date(),
      })
    );
  }, [dispatch]);

  const [, setLocation] = useLocation();

  const handleNavigate = ({ owner, type }) => {
    const encodedOwner = encodeBase64UrlSafe(owner);

    // base path always contains owner
    let path = `/accounts-record/${encodedOwner}`;

    // append type only if NOT total
    if (type && type !== "total") {
      path += `/${type}`; // billed / unbilled
    }

    setLocation(path);
  };

  return (
    <>
      {details.length > 0 && (
        <Card className="w-full lg:w-[calc(50%-0.75rem)]">
          <CardHeader className="pb-3">
            <CardTitle>Billed/ Unbilled Account Details</CardTitle>
            <div className="w-1/2"></div>
          </CardHeader>
          <CardContent className="divide-y divide-gray-200 max-h-96 lg:max-h-80 overflow-y-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Owner</TableHead>
                  <TableHead>Billed Account</TableHead>
                  <TableHead>Unbilled Account</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {data.accountOwner}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer hover:text-blue-600 hover:underline"
                      onClick={() =>
                        handleNavigate({
                          owner: data.accountOwner,
                          type: data.accountOwner === "Total" ? null : "billed",
                        })
                      }
                    >
                      {data.billedAccount}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer hover:text-blue-600 hover:underline"
                      onClick={() =>
                        handleNavigate({
                          owner: data.accountOwner,
                          type:
                            data.accountOwner === "Total" ? null : "unbilled",
                        })
                      }
                    >
                      {data.unbilledAccount}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer font-semibold hover:text-blue-700 hover:underline"
                      onClick={() =>
                        handleNavigate({
                          owner: data.accountOwner,
                          type: null, // total → no billed/unbilled
                        })
                      }
                    >
                      {data.totalAccount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function DashboardCharts() {
  const user = useSelector((state) => state.auth.user);
  return (
    <div className="mt-8 flex w-full flex-wrap gap-6 justify-center">
      <MonthlySales />
      {(user?.teamMasterId === 1 || user?.teamMasterId === 5) && (
        <MonthlyPurchases />
      )}
      <MonthlyOEF />
      <MonthlyOrders />
      <AccountOwnerStatus />
      {(user?.teamAdminRoleMasterId === 1 ||
        user?.teamAdminRoleMasterId === 5) && <BUPerformanceChart />}
      {(user?.teamAdminRoleMasterId === 1 ||
        user?.teamAdminRoleMasterId === 5 ||
        user?.teamMasterId === 10) && (
        <>
          <BUOutstandingChart />
          <BUOverdueOutstandingChart />
        </>
      )}
      <FunnelList />
      <OrdersList />
      {(user?.teamMasterId === 1 ||
        user?.teamMasterId === 3 ||
        user?.teamMasterId === 5 ||
        user?.teamMasterId === 6) && <RevenueAccount />}
      {(user?.teamMasterId === 1 || user?.teamMasterId === 4) &&
        ![19].includes(user?.teamRoleMasterId) && (
          <>
            <DailyDashboard />
            <DailyCalls />
          </>
        )}
      {(user?.teamMasterId === 1 || user?.teamMasterId === 4) && (
        <>
          <EngineerProductivity />
        </>
      )}
    </div>
  );
}

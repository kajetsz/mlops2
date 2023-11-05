import { histogramTooltipFormatter, scatterPlotTooltipFormatter } from "@/lib/utils";

export const scatterWithHistogramsOptions = (
    data: any,
    firstColBins: any,
    secondColBins: any,
    firstCol: string,
    secondCol: string,
    theme: "dark" | "light" | "system"
) => {
    return {
        backgroundColor: theme === "dark" ? "#1F2937" : "#ffffff",
        toolbox: {
            iconStyle: {
                borderColor: theme === "dark" ? "#ffffff" : "#666",
            },
            show: true,
            feature: {
                dataZoom: {
                    show: true,
                    yAxisIndex: "none",
                },
                brush: {
                    type: "polygon",
                },
                restore: {
                    show: true,
                },
                saveAsImage: {},
            },
        },
        title: {
            left: "center",
            text: `Comparison of ${firstCol} and ${secondCol} features with histograms`,
            subtext: `Number of bins: ${firstColBins.length}`,
            textStyle: {
                fontSize: 18,
                color: theme === "dark" ? "#ffffff" : "#333",
            },
            subtextStyle: {
                fontSize: 16,
                color: theme === "dark" ? "#ffffffcc" : "#333",
            },
        },
        xAxis: [
            {
                scale: true,
                gridIndex: 0,
                axisLabel: {
                    color: theme === "dark" ? "#ffffff" : "#666",
                },
                axisLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#ffffff" : "#333",
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#374151" : "#ccc",
                    },
                },
            },
            {
                type: "category",
                scale: true,
                axisTick: { show: false },
                axisLabel: { show: false },
                axisLine: { show: false },
                gridIndex: 1,
                splitLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#374151" : "#ccc",
                    },
                },
            },
            {
                type: "value",
                scale: true,
                gridIndex: 2,
                min: 0,
                axisLabel: {
                    color: theme === "dark" ? "#ffffff" : "#666",
                },
                axisLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#ffffff" : "#333",
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#374151" : "#ccc",
                    },
                },
            },
        ],
        yAxis: [
            {
                gridIndex: 0,
                axisLabel: {
                    color: theme === "dark" ? "#ffffff" : "#666",
                },
                splitLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#374151" : "#ccc",
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#ffffff" : "#333",
                    },
                },
            },
            {
                gridIndex: 1,
                min: 0,
                axisLabel: {
                    color: theme === "dark" ? "#ffffff" : "#666",
                },
                axisLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#374151" : "#ccc",
                    },
                },
            },
            {
                type: "category",
                axisTick: { show: false },
                axisLabel: { show: false },
                axisLine: { show: false },
                gridIndex: 2,
                splitLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#374151" : "#ccc",
                    },
                },
            },
        ],
        tooltip: {},
        grid: [
            {
                top: "50%",
                right: "50%",
                tooltip: {
                    formatter: scatterPlotTooltipFormatter,
                },
            },
            {
                bottom: "55%",
                right: "50%",
                tooltip: {
                    formatter: histogramTooltipFormatter,
                },
            },
            {
                top: "50%",
                left: "52%",
                tooltip: {
                    formatter: histogramTooltipFormatter,
                },
            },
        ],

        series: [
            {
                name: `(${firstCol}, ${secondCol})`,
                type: "scatter",
                xAxisIndex: 0,
                yAxisIndex: 0,
                encode: { tooltip: [0, 1] },
                data: data,
            },
            {
                name: firstCol,
                type: "bar",
                xAxisIndex: 1,
                yAxisIndex: 1,
                barWidth: "99.3%",
                label: {
                    show: true,
                    position: "top",
                },
                encode: {
                    x: 2,
                    y: 3,
                },
                data: firstColBins,
            },
            {
                name: secondCol,
                type: "bar",
                xAxisIndex: 2,
                yAxisIndex: 2,
                barWidth: "99.3%",
                label: {
                    show: true,
                    position: "right",
                },
                encode: {
                    y: 2,
                    x: 3,
                    itemName: 3,
                },
                data: secondColBins,
            },
        ],
    };
};

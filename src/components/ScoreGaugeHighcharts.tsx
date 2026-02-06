"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more";

/**
 * Speedometer gauge matching official Highcharts demo exactly:
 * https://www.highcharts.com/demo/highcharts/gauge-speedometer
 * Semicircle -90° to 89.9°, center low, thin needle (baseLength 0%), gray pivot. Payload-driven.
 */
interface ScoreGaugeHighchartsProps {
  score: number;
  maxScore: number;
  redEnd: number;
  amberEnd: number;
}

export function ScoreGaugeHighcharts({
  score,
  maxScore,
  redEnd,
  amberEnd,
}: ScoreGaugeHighchartsProps) {
  const options: Highcharts.Options = {
    accessibility: { enabled: false },
    chart: {
      type: "gauge",
      backgroundColor: "transparent",
      plotBackgroundColor: undefined,
      plotBackgroundImage: undefined,
      plotBorderWidth: 0,
      plotShadow: false,
      height: 280,
      spacing: [2, 2, 2, 2],
    },
    title: { text: undefined },
    pane: {
      startAngle: -90,
      endAngle: 89.9,
      background: undefined,
      center: ["50%", "75%"],
      size: "110%",
    },
    yAxis: {
      min: 0,
      max: maxScore,
      tickPositions: [0, Math.round(maxScore * 0.25), Math.round(maxScore * 0.5), Math.round(maxScore * 0.75), maxScore],
      tickPosition: "inside",
      tickColor: "#94a3b8",
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: undefined,
      lineWidth: 0,
      labels: {
        distance: -12,
        style: { fontSize: "13px" },
      },
      plotBands: [
        { from: 0, to: redEnd, color: "#dc2626", thickness: 20, borderRadius: "50%" },
        { from: redEnd, to: amberEnd, color: "#d97706", thickness: 20, borderRadius: "50%" },
        { from: amberEnd, to: maxScore, color: "#16a34a", thickness: 20, borderRadius: "50%" },
      ],
    },
    series: [
      {
        type: "gauge",
        name: "Score",
        data: [score],
        dataLabels: {
          format: "<span style=\"font-size:16px;font-weight:bold\">{y}</span> / " + maxScore,
          borderWidth: 0,
          y: 24,
        },
        dial: {
          radius: "80%",
          backgroundColor: "gray",
          baseWidth: 12,
          baseLength: "0%",
          rearLength: "0%",
        },
        pivot: {
          backgroundColor: "gray",
          radius: 6,
        },
        tooltip: { valueSuffix: " / " + maxScore },
      },
    ],
    credits: { enabled: false },
  };

  return (
    <div className="w-full max-w-[320px] mx-auto -mt-2" style={{ minHeight: 320 }}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

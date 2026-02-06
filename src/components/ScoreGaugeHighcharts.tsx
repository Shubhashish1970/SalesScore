"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more";

/**
 * Speedometer gauge matching Highcharts demo: https://www.highcharts.com/demo/highcharts/gauge-speedometer
 * Same semicircle arc (-150° to 150°), pane background, gray dial/pivot, and plot bands. Payload-driven.
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
    chart: {
      type: "gauge",
      backgroundColor: "transparent",
      height: 280,
    },
    title: { text: undefined },
    pane: {
      startAngle: -150,
      endAngle: 150,
      size: "85%",
      center: ["50%", "55%"],
      background: [
        {
          backgroundColor: "#e6e6e6",
          borderWidth: 0,
          shape: "arc",
          innerRadius: "60%",
          outerRadius: "100%",
        },
      ],
    },
    yAxis: {
      min: 0,
      max: maxScore,
      lineWidth: 1,
      tickLength: 10,
      tickWidth: 2,
      tickPosition: "inside",
      minorTickInterval: "auto",
      minorTickLength: 10,
      minorTickWidth: 1,
      minorTickPosition: "inside",
      startOnTick: false,
      endOnTick: false,
      labels: {
        distance: -25,
        style: { fontSize: "11px" },
      },
      plotBands: [
        { from: 0, to: redEnd, color: "#dc2626", thickness: 20, borderRadius: 0 },
        { from: redEnd, to: amberEnd, color: "#d97706", thickness: 20, borderRadius: 0 },
        { from: amberEnd, to: maxScore, color: "#16a34a", thickness: 20, borderRadius: 0 },
      ],
    },
    series: [
      {
        type: "gauge",
        name: "Score",
        data: [score],
        dataLabels: {
          format: "<span style=\"font-size:1.1em;font-weight:bold\">{y}</span> / " + maxScore,
          y: 70,
          borderWidth: 0,
        },
        dial: {
          radius: "80%",
          backgroundColor: "gray",
          baseWidth: 12,
          baseLength: "90%",
          rearLength: "0%",
          borderWidth: 0,
        },
        pivot: {
          backgroundColor: "gray",
          radius: 6,
          borderWidth: 0,
        },
        tooltip: { valueSuffix: " / " + maxScore },
      },
    ],
    credits: { enabled: false },
  };

  return (
    <div className="w-full max-w-[300px] mx-auto -mt-2">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

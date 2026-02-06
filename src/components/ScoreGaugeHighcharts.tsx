"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more";

/**
 * Speedometer-style gauge (see https://www.highcharts.com/demo/highcharts/gauge-speedometer).
 * Driven by JSON: score, maxScore, redEnd, amberEnd for plot bands.
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
      height: 260,
    },
    title: { text: undefined },
    pane: {
      startAngle: -150,
      endAngle: 150,
      background: undefined,
    },
    yAxis: {
      min: 0,
      max: maxScore,
      tickLength: 8,
      tickWidth: 2,
      tickPosition: "inside",
      minorTickLength: 4,
      minorTickWidth: 1,
      minorTickPosition: "inside",
      labels: {
        distance: 12,
        style: { fontSize: "11px" },
      },
      plotBands: [
        { from: 0, to: redEnd, color: "#dc2626", thickness: 20 },
        { from: redEnd, to: amberEnd, color: "#d97706", thickness: 20 },
        { from: amberEnd, to: maxScore, color: "#16a34a", thickness: 20 },
      ],
    },
    series: [
      {
        type: "gauge",
        name: "Score",
        data: [score],
        dataLabels: {
          format: "<span style=\"font-size:1.2em;font-weight:bold\">{y}</span> / " + maxScore,
          y: 60,
          borderWidth: 0,
        },
        dial: {
          radius: "80%",
          backgroundColor: "#1e293b",
          baseWidth: 10,
          baseLength: "90%",
          rearLength: "0%",
        },
        pivot: {
          backgroundColor: "#1e293b",
          radius: 5,
        },
        tooltip: { valueSuffix: " / " + maxScore },
      },
    ],
    credits: { enabled: false },
  };

  return (
    <div className="w-full max-w-[280px] mx-auto -mt-2">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
